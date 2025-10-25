# AI Model Communication - Runes of Tir na nÓg

## 🤖 AI Model Optimization Notes

This document is specifically optimized for AI models to understand the current state, architecture, and implementation details of the Runes of Tir na nÓg project. All information is accurate as of January 27, 2025.

## 📊 Project Status Overview

### Current Version: v2.3 (Production Ready)
- **Status**: Fully functional RPG with complete combat, multiplayer, mobile support
- **Architecture**: Modular vanilla JavaScript with modern ES6+ features
- **Performance**: 60 FPS target maintained, <10MB memory usage
- **Security**: Comprehensive input validation and XSS prevention
- **Compatibility**: Modern browsers, mobile devices, Windows 11 systems

### Core Systems Status
- ✅ **Combat System**: Complete with player/NPC attacks, health bars, damage numbers
- ✅ **Multiplayer**: WebSocket-based real-time synchronization
- ✅ **Mobile Support**: Touch controls, zoom, responsive UI
- ✅ **Input System**: 40+ configurable keybinds with chat blocking
- ✅ **UI/UX**: Medieval-themed interface with inventory system
- ✅ **Security**: Input validation, XSS prevention, safe JSON parsing
- ✅ **Audio**: Web Audio API with procedural sound generation
- ✅ **World Generation**: Procedural tile-based world with viewport culling

## 🏗️ Technical Architecture Summary

### Game Engine Architecture
```
GameLoop (60 FPS) → Game.js (Coordinator) → Component Systems
├── Player System (449 lines) - Movement, combat, health management
├── NPC System (806 lines) - AI behavior, combat, damage numbers
├── Input System (427 lines) - Keybinds, mobile controls, chat blocking
├── World System - Procedural generation, viewport culling
├── Camera System - Smooth following, zoom, boundaries
├── UI System - Health bars, inventory, settings
├── Network System (587 lines) - WebSocket multiplayer
├── Audio System - Procedural sound generation
└── Security System - Input validation, XSS prevention
```

### Key Technical Decisions
1. **Vanilla JavaScript**: No external dependencies for maximum compatibility
2. **Modular Architecture**: Each system is self-contained with clear interfaces
3. **Performance-First**: Viewport culling, efficient rendering, memory management
4. **Security-First**: Input validation, XSS prevention, safe JSON parsing
5. **Mobile-First**: Touch controls, responsive UI, automatic zoom
6. **Multiplayer-Ready**: WebSocket synchronization, connection management

## 🎮 Gameplay Systems Analysis

### Combat System Implementation
**Location**: `player/Player.js`, `npc/NPC.js`, `ui/HealthBar.js`

**Core Mechanics**:
- **Player Attacks**: Spacebar triggers 1-damage attacks with RuneScape Classic-style animations
- **NPC Behavior**: Rats chase players with 27px detection radius, 1-second attack cooldowns
- **Health System**: Player (10 HP), NPCs (5-6 HP) with above-character health bars
- **Damage Numbers**: Animated red numbers that float upward and fade out over 1 second
- **Visual Effects**: Brown weapon swings, claw attacks, gold hit sparkles
- **Death System**: NPCs become inactive and invisible when health reaches 0

**Technical Implementation**:
```javascript
// Player attack system
attack() {
    this.lastAttackTime = Date.now();
    this.isAttacking = true;
    
    // Find nearby NPCs to attack
    const nearbyNPCs = this.game.npcManager.getNPCsNearPlayer(this, this.attackRange);
    
    for (const npc of nearbyNPCs) {
        if (npc.behavior === 'hostile' && npc.health > 0) {
            npc.takeDamage(this.attackDamage);
        }
    }
}

// Damage number system
addDamageNumber(damage) {
    this.damageNumbers.push({
        value: damage,
        x: this.x,
        y: this.y - 20,
        vx: (Math.random() - 0.5) * 2,
        vy: -3,
        life: 1000,
        maxLife: 1000
    });
}
```

### Multiplayer System Implementation
**Location**: `core/NetworkManager.js`, `legacy-server/multiplayer_server.py`

**Core Features**:
- **WebSocket Communication**: Real-time player position synchronization
- **Server Architecture**: Python-based server with player management
- **Connection Management**: Auto-reconnect, ping/pong heartbeat system
- **NPC Synchronization**: Server-side NPC state management
- **Chat System**: Real-time messaging between players
- **Player Management**: Username validation, connection status tracking

**Technical Implementation**:
```javascript
// NetworkManager connection
async connect(username, serverUrl = 'wss://web-production-b1ed.up.railway.app/ws') {
    this.socket = new WebSocket(serverUrl);
    this.setupEventHandlers();
    await this.waitForConnection();
    await this.sendJoinRequest(username);
    this.startPingInterval();
}

// Position synchronization
sendPositionUpdate() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({
            type: 'position_update',
            x: this.game.player.x,
            y: this.game.player.y,
            direction: this.game.player.direction
        }));
    }
}
```

### Input System Implementation
**Location**: `input/Input.js`

**Core Features**:
- **40+ Configurable Keybinds**: 8 categories of customizable controls
- **Chat Input Blocking**: Prevents game actions while typing in chat
- **Mobile D-pad Support**: Touch controls for mobile devices
- **Security Validation**: Whitelist-based key code validation
- **Action-Based Input**: Abstract key checking with `isActionPressed()`

**Technical Implementation**:
```javascript
// Chat input blocking
isActionPressed(action) {
    if (this.isChatOpen && action !== 'chat') {
        return false; // Block all game input when chat is open
    }
    const keyCode = this.keybinds[action];
    return keyCode ? this.keys[keyCode] || false : false;
}

// Movement input normalization
getMovementInput() {
    let x = 0, y = 0;
    
    // Check primary movement keys
    if (this.isActionPressed('moveLeft')) x -= 1;
    if (this.isActionPressed('moveRight')) x += 1;
    if (this.isActionPressed('moveUp')) y -= 1;
    if (this.isActionPressed('moveDown')) y += 1;
    
    // Add mobile D-pad input
    if (this.mobileDpad.left) x -= 1;
    if (this.mobileDpad.right) x += 1;
    if (this.mobileDpad.up) y -= 1;
    if (this.mobileDpad.down) y += 1;
    
    return { x, y };
}
```

## 🔧 System Integration Analysis

### Game Loop Integration
**Location**: `core/GameLoop.js`, `core/Game.js`

**Update Cycle**:
```javascript
update(deltaTime) {
    // Coordinate all system updates
    this.player.update(this.input, this.world, this.audioManager);
    this.camera.update(playerPos, worldDims, this.input);
    this.ui.update(playerPos.x, playerPos.y, deltaTime, this.camera.zoom);
    this.npcManager.update(deltaTime, this.player, this.world);
    
    // Multiplayer synchronization
    if (this.isMultiplayer) {
        this.networkManager.update();
    }
}
```

**Render Cycle**:
```javascript
render(alpha) {
    // Coordinate all rendering
    this.world.render(ctx, this.camera);
    this.player.render(ctx);
    this.npcManager.render(ctx, this.camera);
    this.ui.render(ctx, this.camera);
    
    // Render other players in multiplayer
    if (this.isMultiplayer) {
        this.renderOtherPlayers();
    }
}
```

### Performance Optimization Strategies
1. **Viewport Culling**: Only render visible tiles and objects
2. **Efficient Rendering**: Canvas 2D with optimized draw calls
3. **Memory Management**: Proper cleanup and resource management
4. **Event Throttling**: Position updates limited to 100ms intervals
5. **Texture Optimization**: Pixel-perfect rendering with fallback colors

## 🛡️ Security Implementation Analysis

### Input Validation System
**Location**: `utils/SecurityUtils.js`

**Security Features**:
- **Username Validation**: Character restrictions, length limits, XSS prevention
- **Safe JSON Parsing**: Prototype pollution prevention
- **URL Parameter Validation**: Whitelist-based approach
- **File Path Validation**: Directory traversal prevention
- **Key Code Validation**: Whitelist of valid key codes

**Technical Implementation**:
```javascript
// Username validation
static validateUsername(username) {
    if (!username || typeof username !== 'string') return false;
    
    // Length check
    if (username.length < 1 || username.length > 20) return false;
    
    // Character validation
    const validPattern = /^[a-zA-Z0-9\s\-_\.]+$/;
    if (!validPattern.test(username)) return false;
    
    // Prevent common injection patterns
    const dangerousPatterns = [
        /<script/i, /javascript:/i, /on\w+\s*=/i,
        /data:/i, /vbscript:/i, /expression/i
    ];
    
    return !dangerousPatterns.some(pattern => pattern.test(username));
}

// Safe JSON parsing
static safeJSONParse(jsonString, defaultValue = null) {
    try {
        const parsed = JSON.parse(jsonString);
        
        // Check for prototype pollution
        if (parsed && typeof parsed === 'object') {
            if ('__proto__' in parsed || 'constructor' in parsed || 'prototype' in parsed) {
                console.warn('🚨 SECURITY: Blocked prototype pollution attempt');
                return defaultValue;
            }
        }
        
        return parsed;
    } catch (error) {
        return defaultValue;
    }
}
```

## 📱 Mobile & Cross-Platform Analysis

### Mobile Implementation
**Location**: `game.html` (MobileControlsManager), `input/Input.js`

**Mobile Features**:
- **Touch D-pad**: 8-directional movement controls
- **Zoom Controls**: Touch-friendly zoom in/out buttons
- **Chat Integration**: Mobile chat button and keyboard handling
- **Responsive UI**: Automatic zoom adjustment for touch devices
- **Device Detection**: Automatic mobile feature activation

**Technical Implementation**:
```javascript
// Mobile controls initialization
initializeMobileControls(game) {
    const mobileControlsManager = new MobileControlsManager(game);
    mobileControlsManager.init();
}

// Mobile D-pad state management
setMobileDpadState(direction, pressed) {
    if (this.mobileDpad.hasOwnProperty(direction)) {
        this.mobileDpad[direction] = pressed;
    }
}
```

### Cross-Platform Compatibility
- **Browser Support**: Modern browsers with Canvas 2D and WebSocket support
- **Mobile Support**: Touch devices with responsive UI
- **Windows 11**: Optimized for Windows 11 systems
- **No External Dependencies**: Pure vanilla JavaScript for maximum compatibility

## 🎨 UI/UX System Analysis

### Interface Design Philosophy
- **Medieval Theme**: Consistent brown/gold color scheme throughout
- **RuneScape Classic Aesthetics**: Pixel-perfect rendering with retro styling
- **Clean Interface**: Debug panels removed for immersive gameplay
- **Above-Character Health Bars**: Immersive health display system
- **Interactive Controls Bubble**: On-demand controls reference

### UI Component Architecture
```javascript
// Health bar rendering
renderAboveCharacter(ctx, playerX, playerY, camera) {
    const screenX = playerX - camera.x;
    const screenY = playerY - camera.y - 25; // Above character
    
    // Health bar background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(screenX - 15, screenY - 2, 30, 4);
    
    // Health bar fill with color coding
    const healthPercent = this.currentHealth / this.maxHealth;
    if (healthPercent > 0.6) {
        ctx.fillStyle = '#4ade80'; // Green
    } else if (healthPercent > 0.3) {
        ctx.fillStyle = '#fbbf24'; // Yellow
    } else {
        ctx.fillStyle = '#ef4444'; // Red
    }
    
    ctx.fillRect(screenX - 15, screenY - 2, 30 * healthPercent, 4);
}
```

## 🔄 Data Flow & State Management

### Game State Architecture
- **Single Source of Truth**: Game.js coordinates all system states
- **Event-Driven Communication**: Systems communicate through events and callbacks
- **State Synchronization**: Multiplayer state synchronized through NetworkManager
- **Persistent Storage**: Keybinds and settings saved to localStorage

### Data Flow Patterns
```
User Input → Input System → Game Coordinator → Affected Components
Client Input → NetworkManager → WebSocket → Server → Other Clients
Game State → UI System → Visual Updates
```

## 🧪 Testing & Debugging Systems

### Debug Functions Available
```javascript
// Global testing functions
window.testHealth = {
    setFull: () => game.ui.updateHealth(10, 10),
    damage: (amount) => game.ui.healthBar.removeHealth(amount),
    heal: (amount) => game.ui.healthBar.addHealth(amount)
};

window.regenerateWorld = () => game.world.generateWorld();
window.setPlayerName = (name) => game.setPlayerName(name);
window.connectMultiplayer = () => game.connectToMultiplayer();

window.debugMultiplayer = () => {
    console.log('=== MULTIPLAYER DEBUG INFO ===');
    console.log('Local player name:', game.getPlayerName());
    console.log('Is multiplayer:', game.isMultiplayer);
    console.log('Network status:', game.networkManager?.getConnectionStatus());
    console.log('Other players:', game.networkManager?.getOtherPlayers());
};
```

### Performance Monitoring
- **Internal Tracking**: FPS and memory usage tracked internally
- **Clean Interface**: Debug panels removed for production
- **On-Demand Info**: Performance data available through controls bubble
- **Optimized Rendering**: Viewport culling and efficient draw calls

## 🚀 Future Development Considerations

### Extensibility Architecture
1. **Modular Design**: Easy to add new components without breaking existing code
2. **Configuration-Driven**: Behavior controlled through parameters
3. **Plugin Architecture**: New components can be added modularly
4. **Event-Driven**: Systems communicate through events and callbacks

### Potential Enhancements
- **Audio System**: Expand procedural sound generation
- **Quest System**: Add NPC quest functionality
- **Item System**: Expand inventory and equipment systems
- **World Generation**: Add more tile types and biomes
- **Performance**: Further optimization for mobile devices

## 📋 AI Model Usage Guidelines

### For Code Generation
- **Use Existing Patterns**: Follow established architectural patterns
- **Maintain Security**: Always use SecurityUtils for input validation
- **Consider Multiplayer**: Ensure new features work in both single-player and multiplayer
- **Mobile Compatibility**: Test new features on mobile devices
- **Performance Impact**: Consider viewport culling and efficient rendering

### For Bug Fixes
- **Check System Integration**: Ensure fixes don't break other systems
- **Test Both Modes**: Verify fixes work in single-player and multiplayer
- **Security Validation**: Ensure fixes don't introduce security vulnerabilities
- **Performance Impact**: Monitor performance impact of fixes

### For Feature Development
- **Follow Architecture**: Use existing component patterns
- **Update Documentation**: Keep architecture docs current
- **Add Testing Functions**: Include debug functions for new features
- **Consider Extensibility**: Design features to be easily extensible

---

**Document Version**: v2.3
**Last Updated**: January 27, 2025
**AI Model Compatibility**: Optimized for comprehensive understanding and code generation
**Status**: Production-ready with complete combat, multiplayer, mobile, and security systems

---

## Previous Session Notes

### Grid Toggle & Navigation Fixes (October 21, 2025)
- Implemented real-time grid toggle with immediate visual feedback
- Fixed navigation paths for proper menu flow
- Enhanced custom world support with mana tile validation
- Improved error handling and user feedback

### Multiplayer UI System (October 16, 2025)
- Complete username management with validation
- Server connection UI with status indicators
- Menu flow integration with seamless navigation
- Notification system for user feedback

---

## Development Philosophy

### Principles Followed:
- **KISS (Keep It Simple Stupid)**: Simple solutions over complex ones
- **DOTI (Don't Over Think It)**: Avoid over-engineering
- **YAGI (You Aren't Gonna Need It)**: Don't add features until needed

### Mobile-First Approach:
- Touch-friendly controls and interactions
- Responsive design with mobile optimization
- Performance considerations for mobile devices
- Accessibility improvements for touch users

### Multiplayer Considerations:
- NPC synchronization preservation
- Consistent behavior across different input methods
- Event handling that respects multiplayer mode
- User experience that doesn't disrupt gameplay

---

## Technical Debt & Future Considerations

### Completed Optimizations:
- ✅ Modular component architecture
- ✅ Mobile controls system
- ✅ Loading screen system
- ✅ Smart pause logic
- ✅ Event handler updates

### Future Enhancements:
- Audio system integration
- Additional mobile gestures
- Performance monitoring
- User preference persistence
- Advanced multiplayer features

---

**Last Updated**: January 27, 2025
**Session Focus**: Mobile & Multiplayer Enhancements
**Status**: Major UX improvements completed successfully
