# Security Remediation Plan
**Project**: Runes of Tir na nÓg  
**Status**: 🔴 Awaiting Implementation  
**Timeline**: 3 weeks (Phases 1-4)  
**Last Updated**: October 19, 2025

---

## 📋 Prerequisites

Before implementing fixes, ensure you have:

- ✅ Backup of current codebase (git commit)
- ✅ Test environment set up
- ✅ Review of `SECURITY_AUDIT.md` completed
- ✅ `game/utils/SecurityUtils.js` in place
- ✅ Testing plan prepared

---

## Phase 1: Critical Fixes (Week 1 - Days 1-5)

### Day 1: Setup & Infrastructure

#### Task 1.1: Add CSP Headers to All HTML Files
**Files to modify**:
- `game/index.html`
- `game/landing.html`
- `game/assets/menu.html`
- `game/assets/world-selection.html`

**Implementation**:
```html
<!-- Add to <head> section of each HTML file -->
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data:;
    connect-src 'self';
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
">
```

**Testing**:
```javascript
// Open browser console, try:
eval('alert("XSS")'); // Should be blocked by CSP
```

**Estimated Time**: 30 minutes

---

#### Task 1.2: Create Sanitization Utility (Already Complete)
**Status**: ✅ Complete - `game/utils/SecurityUtils.js` created

**Verification**:
```javascript
import { SecurityUtils } from './utils/SecurityUtils.js';
const result = SecurityUtils.sanitizeHTML('<script>alert(1)</script>');
console.assert(result === '&lt;script&gt;alert(1)&lt;/script&gt;');
```

---

### Day 2-3: Fix Inventory System XSS (VULN-001, VULN-009)

#### Task 2.1: Import SecurityUtils in Inventory.js
**File**: `game/ui/Inventory.js`

**Add to top of file**:
```javascript
import { SecurityUtils } from '../utils/SecurityUtils.js';
```

#### Task 2.2: Sanitize Item Rendering (Line 228)
**Current code** (Line 228):
```javascript
slot.innerHTML = `
    <div class="slot-number">${index + 1}</div>
    <div class="item-icon">${item.icon}</div>
    ${item.quantity ? `<div class="item-quantity">${item.quantity}</div>` : ''}
`;
```

**Replace with**:
```javascript
slot.innerHTML = `
    <div class="slot-number">${index + 1}</div>
    <div class="item-icon">${SecurityUtils.sanitizeHTML(item.icon)}</div>
    ${item.quantity ? `<div class="item-quantity">${SecurityUtils.sanitizeHTML(String(item.quantity))}</div>` : ''}
`;
```

#### Task 2.3: Sanitize Data Attributes (Lines 232-234)
**Current code**:
```javascript
slot.dataset.itemName = item.name;
slot.dataset.itemType = item.type;
slot.dataset.itemDesc = item.description;
```

**Replace with**:
```javascript
slot.dataset.itemName = SecurityUtils.sanitizeText(item.name);
slot.dataset.itemType = SecurityUtils.sanitizeText(item.type);
slot.dataset.itemDesc = SecurityUtils.sanitizeText(item.description);
```

#### Task 2.4: Validate Items on Add
**Find** `addSampleItems()` method (Line 174)

**Add validation**:
```javascript
addSampleItems() {
    // Validate each item before adding
    const sampleItems = [
        {
            id: 'potion_health',
            name: 'Health Potion',
            icon: '❤️',
            type: 'consumable',
            description: 'Restores 50 HP',
            quantity: 5
        },
        // ... other items
    ];
    
    // Validate before assignment
    sampleItems.forEach((item, index) => {
        if (this.validateItem(item)) {
            this.items[index] = item;
        }
    });
    
    this.updateItemsDisplay();
}

// Add new validation method
validateItem(item) {
    if (!item || typeof item !== 'object') return false;
    
    // Validate required fields
    if (!item.id || !item.name || !item.type) return false;
    
    // Sanitize strings
    item.name = SecurityUtils.sanitizeText(item.name);
    item.type = SecurityUtils.sanitizeText(item.type);
    item.description = SecurityUtils.sanitizeText(item.description || '');
    item.icon = SecurityUtils.sanitizeText(item.icon || '📦');
    
    // Validate quantity
    if (item.quantity !== undefined) {
        item.quantity = Math.max(0, Math.min(999, parseInt(item.quantity) || 0));
    }
    
    return true;
}
```

**Testing**:
```javascript
// Test XSS prevention
game.inventory.items[0] = {
    id: 'test',
    name: '<script>alert("XSS")</script>',
    icon: '<img src=x onerror=alert(1)>',
    description: 'Test',
    quantity: 1
};
game.inventory.updateItemsDisplay();
// Should display escaped HTML, not execute
```

**Estimated Time**: 2 hours

---

### Day 3-4: Fix NPC Dialogue XSS (VULN-002)

#### Task 3.1: Sanitize NPC Dialogue in Game.js
**File**: `game/core/Game.js`

**Add import**:
```javascript
import { SecurityUtils } from '../utils/SecurityUtils.js';
```

**Find** `showDialogue()` method (Line 343)

**Current code** (Line 365-367):
```javascript
dialogueDiv.innerHTML = `
    <h3 style="color: #8A2BE2; margin: 0 0 10px 0;">${npcName}</h3>
    <p style="margin: 0 0 15px 0;">${message}</p>
    ...
`;
```

**Replace with**:
```javascript
dialogueDiv.innerHTML = `
    <h3 style="color: #8A2BE2; margin: 0 0 10px 0;">${SecurityUtils.sanitizeHTML(npcName)}</h3>
    <p style="margin: 0 0 15px 0;">${SecurityUtils.sanitizeHTML(message)}</p>
    <button onclick="this.parentElement.remove()" style="...">Close</button>
`;
```

**Testing**:
```javascript
// Test if enabled
game.showDialogue('<script>alert("XSS")</script>', 'Test <img src=x onerror=alert(1)>');
// Should display escaped HTML
```

**Estimated Time**: 30 minutes

---

### Day 4-5: Fix SaveSystem Validation (VULN-003, VULN-008)

#### Task 4.1: Add Validation to SaveSystem.js
**File**: `game/core/SaveSystem.js`

**Add import**:
```javascript
import { SecurityUtils } from '../utils/SecurityUtils.js';
```

**Add constants**:
```javascript
static MAX_SAVE_SIZE = 5 * 1024 * 1024; // 5MB
```

**Replace** `loadWorld()` method (Line 47):
```javascript
static loadWorld(slotNumber) {
    if (slotNumber < 1 || slotNumber > this.MAX_SLOTS) {
        console.error(`Invalid slot number: ${slotNumber}`);
        return null;
    }

    try {
        const saveKey = `${this.SAVE_KEY_PREFIX}${slotNumber}`;
        const jsonData = localStorage.getItem(saveKey);
        
        if (!jsonData) {
            console.log(`Slot ${slotNumber} is empty`);
            return null;
        }

        // Parse with error handling
        const saveData = SecurityUtils.safeJSONParse(jsonData, null);
        if (!saveData) {
            console.error('Failed to parse save data');
            return null;
        }
        
        // Validate save data structure
        if (!SecurityUtils.validateSaveData(saveData)) {
            console.error('Invalid save data format');
            return null;
        }
        
        console.log(`World loaded from slot ${slotNumber}`);
        return saveData;
    } catch (error) {
        console.error('Failed to load world:', error);
        return null;
    }
}
```

**Replace** `saveWorld()` method (Line 14):
```javascript
static saveWorld(slotNumber, worldData) {
    if (slotNumber < 1 || slotNumber > this.MAX_SLOTS) {
        console.error(`Invalid slot number: ${slotNumber}`);
        return false;
    }

    try {
        const saveKey = `${this.SAVE_KEY_PREFIX}${slotNumber}`;
        const saveData = {
            ...worldData,
            metadata: {
                ...worldData.metadata,
                lastSaved: Date.now(),
                version: '1.0.0'
            }
        };

        const jsonData = JSON.stringify(saveData);
        
        // Check size before saving
        if (!SecurityUtils.checkStorageQuota(saveKey, jsonData, this.MAX_SAVE_SIZE)) {
            console.error('Save data exceeds size limit');
            return false;
        }
        
        localStorage.setItem(saveKey, jsonData);
        
        console.log(`World saved to slot ${slotNumber} (${(jsonData.length / 1024).toFixed(2)} KB)`);
        return true;
    } catch (error) {
        if (error.name === 'QuotaExceededError') {
            console.error('localStorage quota exceeded');
        }
        console.error('Failed to save world:', error);
        return false;
    }
}
```

**Testing**:
```javascript
// Test size limit
const hugeSave = {
    config: {},
    worldData: { tiles: Array(99999999).fill({}) },
    playerState: { position: { x: 0, y: 0 }, health: 10 },
    metadata: { playtime: 0 }
};
const result = SaveSystem.saveWorld(1, hugeSave);
console.assert(result === false, 'Should reject huge save');

// Test validation
const invalidSave = {
    config: {},
    worldData: { tiles: [] },
    playerState: { position: { x: Infinity, y: -Infinity }, health: -999 },
    metadata: { version: '1.0.0' }
};
localStorage.setItem('cfr_world_slot_1', JSON.stringify(invalidSave));
const loaded = SaveSystem.loadWorld(1);
console.assert(loaded === null, 'Should reject invalid save');
```

**Estimated Time**: 2 hours

---

### Day 5: Fix URL Parameter Injection (VULN-004, VULN-012)

#### Task 5.1: Validate URL Parameters in index.html
**File**: `game/index.html`

**Find** (Line 585-602) and replace:
```javascript
// OLD CODE:
const customWorldParam = urlParams.get('customWorld');
if (customWorldParam) {
    const worldPath = `worlds/${customWorldParam}/world.json`;
    const customWorldData = await World.loadFromFile(worldPath);
    // ...
}
```

**NEW CODE**:
```javascript
// Import SecurityUtils at top of script
import { SecurityUtils } from './utils/SecurityUtils.js';

// Whitelist of allowed worlds
const ALLOWED_WORLDS = ['tir-na-nog'];

const customWorldParam = urlParams.get('customWorld');
if (customWorldParam) {
    // Validate and sanitize
    const sanitized = SecurityUtils.validateURLParam(customWorldParam, ALLOWED_WORLDS);
    
    if (!sanitized) {
        console.error('Invalid world parameter');
        alert(`Invalid world name. Allowed worlds: ${ALLOWED_WORLDS.join(', ')}`);
        game = new Game(null, null);
    } else {
        const worldPath = `worlds/${sanitized}/world.json`;
        console.log(`Loading custom world from: ${worldPath}`);
        
        const customWorldData = await World.loadFromFile(worldPath);
        if (customWorldData) {
            game = new Game(null, null, customWorldData);
            console.log(`Custom world "${customWorldData.metadata?.name || 'Unknown'}" loaded successfully!`);
        } else {
            alert(`Failed to load custom world: ${sanitized}`);
            game = new Game(null, null);
        }
    }
}
```

#### Task 5.2: Validate World File in World.js
**File**: `game/world/World.js`

**Add import**:
```javascript
import { SecurityUtils } from '../utils/SecurityUtils.js';
```

**Replace** `loadFromFile()` method (Line 72):
```javascript
static async loadFromFile(worldPath) {
    // Validate path format (only allow worlds/ directory)
    const pathRegex = /^worlds\/[a-z0-9-]+\/world\.json$/i;
    if (!pathRegex.test(worldPath)) {
        console.error('Invalid world path format');
        return null;
    }
    
    try {
        const response = await fetch(worldPath);
        if (!response.ok) {
            throw new Error(`Failed to load world: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Validate world data structure
        if (!SecurityUtils.validateCustomWorld(data)) {
            console.error('Invalid world data structure');
            return null;
        }
        
        return data;
    } catch (error) {
        console.error('Error loading custom world:', error);
        return null;
    }
}
```

**Testing**:
```bash
# Test path traversal prevention
https://yoursite.com/game/?customWorld=../../src/js/auth
# Should be rejected

https://yoursite.com/game/?customWorld=tir-na-nog
# Should work
```

**Estimated Time**: 1 hour

---

## Phase 2: High Priority (Week 2 - Days 6-10)

### Day 6-7: Fix Keybind Validation (VULN-005)

#### Task 6.1: Validate Keybinds in KeybindSettings.js
**File**: `game/ui/KeybindSettings.js`

**Add import**:
```javascript
import { SecurityUtils } from '../utils/SecurityUtils.js';
```

**Replace** `loadKeybinds()` method (Line 85):
```javascript
loadKeybinds() {
    const saved = localStorage.getItem('gameKeybinds');
    if (saved) {
        try {
            const parsed = SecurityUtils.safeJSONParse(saved, null);
            if (parsed) {
                // Validate keybinds
                this.keybinds = SecurityUtils.validateKeybinds(parsed, this.defaultKeybinds);
            } else {
                this.keybinds = { ...this.defaultKeybinds };
            }
        } catch (e) {
            console.error('Failed to load keybinds:', e);
            this.keybinds = { ...this.defaultKeybinds };
        }
    }
}
```

**Testing**:
```javascript
// Test invalid keybind rejection
localStorage.setItem('gameKeybinds', JSON.stringify({
    moveUp: '__proto__',
    attack: 'constructor',
    pause: 'InvalidKey123'
}));
// Reload and verify defaults are used
```

**Estimated Time**: 1 hour

---

### Day 7-8: Fix Player Name Validation (VULN-007)

#### Task 7.1: Validate Player Names in Game.js
**File**: `game/core/Game.js`

**Replace** `setPlayerName()` method:
```javascript
setPlayerName(name) {
    // Validate and sanitize
    const validName = SecurityUtils.validatePlayerName(name);
    
    if (!validName) {
        console.error('Invalid player name. Use letters, numbers, spaces, and basic punctuation only (1-20 chars).');
        return;
    }
    
    this.player.setName(validName);
    console.log(`Player name set to: ${validName}`);
}
```

**Testing**:
```javascript
setPlayerName('<script>alert("XSS")</script>'); // Should be rejected
setPlayerName('ValidName123'); // Should work
setPlayerName('A'.repeat(100)); // Should be truncated to 20 chars
```

**Estimated Time**: 30 minutes

---

### Day 8-9: Fix Event Listener Leaks (VULN-011)

#### Task 8.1: Fix PauseMenu.js Memory Leak
**File**: `game/ui/PauseMenu.js`

**Replace entire** `setupEventListeners()` method (Line 101):
```javascript
setupEventListeners() {
    // Store bound functions for cleanup
    this.boundHandlers = {
        resume: (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.resume();
        },
        save: (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.saveGame();
        },
        quit: (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.quitToMenu();
        }
    };
    
    setTimeout(() => {
        const resumeBtn = document.getElementById('resumeBtn');
        const saveBtn = document.getElementById('saveBtn');
        const quitBtn = document.getElementById('quitBtn');
        
        // Add listeners once only
        if (resumeBtn && !this.listenersAttached) {
            resumeBtn.addEventListener('click', this.boundHandlers.resume);
        }
        if (saveBtn && !this.listenersAttached) {
            saveBtn.addEventListener('click', this.boundHandlers.save);
        }
        if (quitBtn && !this.listenersAttached) {
            quitBtn.addEventListener('click', this.boundHandlers.quit);
        }
        
        this.listenersAttached = true;
    }, 100);
}

// Add cleanup method
destroy() {
    const resumeBtn = document.getElementById('resumeBtn');
    const saveBtn = document.getElementById('saveBtn');
    const quitBtn = document.getElementById('quitBtn');
    
    if (resumeBtn && this.boundHandlers.resume) {
        resumeBtn.removeEventListener('click', this.boundHandlers.resume);
    }
    if (saveBtn && this.boundHandlers.save) {
        saveBtn.removeEventListener('click', this.boundHandlers.save);
    }
    if (quitBtn && this.boundHandlers.quit) {
        quitBtn.removeEventListener('click', this.boundHandlers.quit);
    }
    
    if (this.menu) {
        this.menu.remove();
    }
    
    this.listenersAttached = false;
}
```

**Add to constructor** (Line 3):
```javascript
constructor(game) {
    this.game = game;
    this.menu = null;
    this.isVisible = false;
    this.listenersAttached = false; // ADD THIS
    this.boundHandlers = {}; // ADD THIS
    this.createMenu();
    this.setupEventListeners();
}
```

**Testing**:
```javascript
// Open/close pause menu 100 times
for (let i = 0; i < 100; i++) {
    game.pauseMenu.toggle();
    game.pauseMenu.toggle();
}
// Check browser task manager - memory should be stable
```

**Estimated Time**: 1 hour

---

### Day 9-10: Validate World Config (VULN-010)

#### Task 9.1: Add Validation to World.js Constructor
**File**: `game/world/World.js`

**Replace** constructor (Line 2):
```javascript
constructor(config = null, customWorldData = null) {
    // Validate config if provided
    if (config && !SecurityUtils.validateWorldConfig(config)) {
        console.error('Invalid world config, using defaults');
        config = null;
    }
    
    // Use config if valid, otherwise use defaults
    this.config = config || this.getDefaultConfig();

    this.tiles = [];
    this.tileSize = 16;
    this.groundTexture = null;
    this.waterTexture = null;
    this.caveTexture = null;
    
    // Check if loading from custom world data
    if (customWorldData) {
        this.loadFromCustomData(customWorldData);
    } else {
        // ... rest of constructor
    }
}

// Add method to get default config
getDefaultConfig() {
    return {
        worldSize: 'medium',
        seed: 'DEFAULT',
        tilePercentages: {
            grass: 85,
            water: 10,
            wall: 3,
            cave: 2
        }
    };
}
```

**Testing**:
```javascript
// Test invalid config
const world = new World({
    worldSize: 'INVALID',
    tilePercentages: { grass: -50, water: 200 }
});
// Should use defaults
```

**Estimated Time**: 1 hour

---

## Phase 3: Medium Priority (Week 3 - Days 11-15)

### Implement Remaining Validations

- Add input validation to VideoSettings.js
- Sanitize all console debug outputs
- Add rate limiting to save functions
- Review all innerHTML usages

**Estimated Time**: 5 hours

---

## Phase 4: Testing & Verification (Days 16-18)

### Day 16: Automated Testing
- Create unit tests for SecurityUtils
- Test all validation functions
- Test XSS attack vectors

### Day 17: Manual Testing
- Test all user inputs
- Try to break validation
- Performance testing

### Day 18: Security Review
- Re-run security audit
- Document fixes
- Update SECURITY_AUDIT.md status

---

## Testing Checklist

### XSS Testing
- [ ] Inject `<script>alert(1)</script>` in all text inputs
- [ ] Inject `<img src=x onerror=alert(1)>` in player name
- [ ] Test localStorage poisoning with malicious data
- [ ] Test URL parameter injection

### Validation Testing
- [ ] Test save data with invalid health values
- [ ] Test save data with infinite positions
- [ ] Test keybinds with invalid key codes
- [ ] Test world config with invalid percentages

### Performance Testing
- [ ] Open/close menus 1000 times (memory leak check)
- [ ] Save/load large worlds (size limit check)
- [ ] Test with 5MB+ save data (quota check)

---

## Rollback Plan

If critical issues arise during implementation:

1. **Immediate**: `git revert` to last stable commit
2. **Review**: Analyze what went wrong
3. **Fix**: Address specific issue in isolation
4. **Test**: Verify fix before re-deploying

---

## Success Criteria

✅ All 12 vulnerabilities addressed  
✅ All tests passing  
✅ No new bugs introduced  
✅ Performance maintained (60 FPS)  
✅ localStorage working correctly  
✅ Save/load system functional  

---

## Documentation Updates Needed

After implementation:
- [ ] Update SECURITY_AUDIT.md with "FIXED" status
- [ ] Update CHANGELOG.md with security fixes
- [ ] Update README.md with security section
- [ ] Create SECURITY.md for responsible disclosure

---

**Timeline Summary**:
- Phase 1 (Critical): 5 days
- Phase 2 (High): 5 days  
- Phase 3 (Medium): 5 days
- Phase 4 (Testing): 3 days
- **Total: 18 days (~3 weeks)**

**Begin Implementation**: Awaiting approval from project maintainer

