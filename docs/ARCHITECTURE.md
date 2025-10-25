# Runes of Tir na nÓg - Architecture Documentation

## 🏗️ System Architecture Overview

This document outlines the technical architecture and design patterns used in the Runes of Tir na nÓg game prototype.

## 📋 Architecture Principles

### 1. Modular Component Design
- **Separation of Concerns**: Each system has a single responsibility
- **Loose Coupling**: Components communicate through well-defined interfaces
- **High Cohesion**: Related functionality is grouped together

### 2. Performance-First Design
- **Viewport Culling**: Only render visible game objects
- **Efficient Rendering**: Canvas 2D with optimized draw calls
- **Memory Management**: Proper cleanup and resource management

### 3. Scalable Architecture
- **Extensible Systems**: Easy to add new features without breaking existing code
- **Plugin Architecture**: New components can be added modularly
- **Configuration-Driven**: Behavior controlled through parameters

## 🎯 Core Systems Architecture

### Game Loop Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GameLoop.js   │───▶│    Game.js      │───▶│  Component      │
│                 │    │                 │    │   Systems       │
│ • 60 FPS Timer  │    │ • Coordination  │    │                 │
│ • Delta Time    │    │ • State Mgmt    │    │ • Player        │
│ • Frame Sync    │    │ • Event Handle  │    │ • World         │
└─────────────────┘    └─────────────────┘    │ • Camera        │
                                              │ • UI            │
                                              │ • Input         │
                                              └─────────────────┘
```

### Component Communication Flow
```
Input System ──┐
               ├──▶ Game Coordinator ──▶ Update Loop ──▶ Render Loop
World System ──┤                         │                │
Player System ─┤                         ▼                ▼
Camera System ─┤                    Update Components  Render Components
UI System ─────┤
Settings System ─┤
Inventory System ─┤
Controls System ─┘
```

## 🔧 Component Architecture Details

### 1. Game Core (`/core/`)

#### Game.js - Main Coordinator
```javascript
export class Game {
    constructor(worldConfig = null, saveData = null, customWorldData = null) {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Initialize game systems
        this.world = new World(worldConfig);
        this.player = new Player(this.world.width, this.world.height, this.world);
        this.camera = new Camera(this.width, this.height);
        this.input = new Input(this.canvas);
        this.ui = new UI();
        this.audioManager = new AudioManager();
        this.inventory = new Inventory(this);
        this.networkManager = new NetworkManager(this);
        this.npcManager = new NPCManager();
        this.npcFactory = new NPCFactory(this.npcManager);
        
        this.gameLoop = new GameLoop(
            (deltaTime) => this.update(deltaTime),
            (alpha) => this.render(alpha)
        );
    }
    
    update(deltaTime) {
        // Coordinate all system updates
        this.player.update(this.input, this.world, this.audioManager);
        this.camera.update(playerPos, worldDims, this.input);
        this.ui.update(playerPos.x, playerPos.y, deltaTime, this.camera.zoom);
        this.npcManager.update(deltaTime, this.player, this.world);
    }
    
    render(alpha) {
        // Coordinate all rendering
        this.world.render(ctx, this.camera);
        this.player.render(ctx);
        this.npcManager.render(ctx, this.camera);
        this.ui.render(ctx, this.camera);
    }
}
```

**Responsibilities:**
- System initialization and coordination
- Game state management
- Enhanced keybind event handling
- Inventory system integration
- Performance monitoring
- Combat system coordination

#### GameLoop.js - Frame Management
```javascript
export class GameLoop {
    constructor(update, render) {
        this.update = update;
        this.render = render;
        this.isRunning = false;
    }
    
    start() {
        // RequestAnimationFrame loop
    }
    
    stop() {
        // Clean shutdown
    }
}
```

**Responsibilities:**
- 60 FPS frame rate management
- Delta time calculation
- Animation frame synchronization

### 2. UI System (`/ui/`)

#### UI.js - UI Manager
```javascript
export class UI {
    constructor() {
        this.healthBar = new HealthBar();
        this.fps = 60;
        this.memoryUsage = 0;
        this.zoomLevel = 1.0;
    }
    
    update(playerX, playerY, deltaTime, zoomLevel) {
        // Store zoom level for potential future use
        this.zoomLevel = zoomLevel;
        
        // Calculate FPS for internal tracking
        const now = performance.now();
        if (now - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = now;
            
            if (performance.memory) {
                this.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1048576);
            }
        }
        this.frameCount++;
    }
}
```

**Responsibilities:**
- Health visualization with heart icons
- Internal performance tracking (FPS, memory)
- UI state management
- Clean interface (debug panels removed)

#### HealthBar.js - Health Display
```javascript
export class HealthBar {
    constructor() {
        this.maxHealth = 10;
        this.currentHealth = 10;
        this.heartImage = null;
    }
    
    setHealth(current, maximum) {
        // Update health display
    }
    
    renderAboveCharacter(ctx, playerX, playerY, camera) {
        // Render health bar above character
    }
}
```

**Responsibilities:**
- Health visualization with heart icons
- Above-character health bar rendering
- Color-coded health states (green, yellow, red)
- Player and NPC health display

#### Inventory.js - Inventory System
```javascript
export class Inventory {
    constructor(game) {
        this.game = game;
        this.isVisible = false;
        this.items = Array(24).fill(null);
        this.equipment = {
            helmet: null,
            necklace: null,
            chest: null,
            legs: null,
            boots: null,
            ring1: null,
            ring2: null,
            weapon: null
        };
    }
    
    toggle() {
        // Toggle inventory visibility and pause game
    }
    
    addItem(item) {
        // Add item to first available slot
    }
    
    updateItemsDisplay() {
        // Update visual display of items
    }
}
```

**Key Features:**
- **Equipment Slots**: 8 equipment slots (helmet, necklace, chest, legs, boots, 2 rings, weapon)
- **Item Storage**: 24-slot grid for general inventory items
- **Interactive UI**: Drag-and-drop, tooltips, and click interactions
- **Game Pause Integration**: Automatically pauses game when inventory is open
- **RPG-Style Design**: Beautiful medieval-themed styling with gold accents
- **Stats Display**: Shows character stats affected by equipment
- **Gold & Weight**: Tracks player resources and inventory capacity

**Key Binding:**
- Press `I` to open/close inventory

**Responsibilities:**
- Item management and storage
- Equipment slot management
- Item tooltip display
- Inventory UI rendering
- Game state coordination (pause/resume)

#### PauseMenu.js - Pause Menu System
```javascript
class PauseMenu {
    constructor(game) {
        this.game = game;
        this.isVisible = false;
    }
    
    toggle() {
        // Toggle pause menu
    }
    
    quitToMenu() {
        // Save and return to menu
    }
}
```

**Responsibilities:**
- Pause/resume game functionality
- Navigation back to main menu
- Auto-save on quit

### 3. Player System (`/player/`)

#### Player.js - Player Character
```javascript
export class Player {
    constructor(gameWidth, gameHeight, world = null) {
        this.x = gameWidth / 2;
        this.y = gameHeight / 2;
        this.size = 18; // Increased from 12 for better visibility
        this.speed = 3;
        this.direction = 'down';
        this.nameTag = new NameTag('Bob', this.x, this.y);
        
        // Combat properties
        this.health = 10;
        this.maxHealth = 10;
        this.attackDamage = 1;
        this.attackRange = 30;
        this.attackCooldown = 1000; // 1 second
        this.lastAttackTime = 0;
        this.isAttacking = false;
        
        // Damage numbers system
        this.damageNumbers = [];
    }
    
    update(input, world, audioManager) {
        // Enhanced input system integration
        const movement = input.getMovementInput();
        this.vx = movement.x * this.speed;
        this.vy = movement.y * this.speed;
        
        // Handle sprinting and crouching
        if (input.isSprintPressed()) {
            this.vx *= 1.5;
            this.vy *= 1.5;
        }
        if (input.isCrouchPressed()) {
            this.vx *= 0.5;
            this.vy *= 0.5;
        }
    }
    
    attack(target) {
        // RuneScape Classic-style weapon animations
        if (Date.now() - this.lastAttackTime >= this.attackCooldown) {
            this.isAttacking = true;
            this.lastAttackTime = Date.now();
            
            // Deal damage
            if (target && target.takeDamage) {
                target.takeDamage(this.attackDamage);
            }
            
            // Reset attack state
            setTimeout(() => {
                this.isAttacking = false;
            }, 200);
        }
    }
    
    render(ctx) {
        // Player sprite rendering with animation
    }
}
```

**Responsibilities:**
- Enhanced movement with sprint/crouch support
- Input system integration
- Collision detection with world
- Animation state management
- Name tag display
- Combat system with attack animations
- Health management and damage numbers

### 4. NPC System (`/npc/`)

#### NPC.js - NPC Management
```javascript
class NPC {
    constructor(config) {
        // Basic Properties
        this.id = config.id || `npc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.name = config.name || "Unknown NPC";
        this.type = config.type || "townie";
        
        // Position and Movement
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.width = config.width || 32;
        this.height = config.height || 32;
        this.speed = config.speed || 1;
        
        // Combat Properties
        this.health = config.health || 100;
        this.maxHealth = config.maxHealth || 100;
        this.attackDamage = config.attackDamage || 1;
        this.attackCooldown = config.attackCooldown || 1000;
        this.lastAttackTime = 0;
        this.isAttacking = false;
        this.attackRange = config.attackRange || 20;
        
        // Damage numbers system
        this.damageNumbers = [];
        
        // AI Properties
        this.aiState = "idle";
        this.detectionRadius = config.detectionRadius || 50;
        this.reactionTime = config.reactionTime || 500;
    }
    
    update(deltaTime, player, world) {
        // AI behavior and combat logic
        this.updateAI(deltaTime, player, world);
        this.updateCombat(deltaTime, player);
        this.updateMovement(deltaTime);
        this.updateDamageNumbers(deltaTime);
    }
    
    attack(target) {
        // NPC attack logic with cooldowns
        if (Date.now() - this.lastAttackTime >= this.attackCooldown) {
            this.isAttacking = true;
            this.lastAttackTime = Date.now();
            
            // Deal damage
            if (target && target.takeDamage) {
                target.takeDamage(this.attackDamage);
            }
            
            // Reset attack state
            setTimeout(() => {
                this.isAttacking = false;
            }, 200);
        }
    }
    
    takeDamage(damage) {
        // Take damage and show floating damage numbers
        this.health -= damage;
        this.addDamageNumber(damage);
        
        if (this.health <= 0) {
            this.health = 0;
            this.isActive = false;
            this.isVisible = false;
        }
    }
    
    render(ctx, camera) {
        // NPC rendering with health bars and damage numbers
    }
}
```

**Key Features:**
- **Combat System**: NPCs can attack players and take damage
- **AI Behavior**: Different AI states (idle, chase, attack)
- **Health System**: Above-character health bars with color-coded states
- **Damage Numbers**: Floating damage numbers that animate upward
- **Death System**: NPCs become inactive and invisible when health reaches 0
- **Detection Radius**: NPCs detect players within a certain radius
- **Attack Cooldowns**: Prevents rapid-fire attacks

**Responsibilities:**
- NPC behavior and AI
- Combat interactions with players
- Health management and damage display
- Visual rendering with health bars
- Death state management

### 5. Camera System (`/camera/`)

#### Camera.js - Camera Management
```javascript
export class Camera {
    constructor(canvasWidth, canvasHeight) {
        this.x = 0;
        this.y = 0;
        this.zoom = 1.0;
        this.maxZoom = 3.0;
        this.minZoom = 0.5;
    }
    
    update(playerX, playerY, worldWidth, worldHeight, input) {
        // Camera following and constraints
    }
    
    applyTransform(ctx) {
        // Canvas transformation
    }
    
    setZoom(zoom) {
        // Set zoom level with constraints
    }
}
```

**Responsibilities:**
- Camera following and smoothing
- Zoom level management
- Canvas transformation
- Boundary constraints

### 6. Input System (`/input/`)

#### Input.js - Enhanced Input Management
```javascript
export class Input {
    constructor(canvas) {
        this.keys = {};
        this.mouse = { x: 0, y: 0, isDragging: false };
        this.keybinds = this.loadKeybinds();
        this.keyActions = {};
        
        // Mobile D-pad state
        this.mobileDpad = {
            up: false,
            down: false,
            left: false,
            right: false,
            upLeft: false,
            upRight: false,
            downLeft: false,
            downRight: false
        };
    }
    
    loadKeybinds() {
        // Load from localStorage or use comprehensive defaults
        return {
            moveUp: 'KeyW', moveDown: 'KeyS', moveLeft: 'KeyA', moveRight: 'KeyD',
            sprint: 'ShiftLeft', crouch: 'ControlLeft', pause: 'Escape', inventory: 'KeyI',
            interact: 'KeyE', menu: 'KeyM', debug: 'F1', screenshot: 'F12',
            attack: 'Space', // Combat system integration
            // ... 40+ total keybinds across 8 categories
        };
    }
    
    getMovementInput() {
        // Return normalized movement vector
        let x = 0, y = 0;
        if (this.isActionPressed('moveUp') || this.isActionPressed('moveUpAlt')) y -= 1;
        if (this.isActionPressed('moveDown') || this.isActionPressed('moveDownAlt')) y += 1;
        if (this.isActionPressed('moveLeft') || this.isActionPressed('moveLeftAlt')) x -= 1;
        if (this.isActionPressed('moveRight') || this.isActionPressed('moveRightAlt')) x += 1;
        return { x, y };
    }
    
    isActionPressed(action) {
        const keyCode = this.keybinds[action];
        return keyCode ? this.keys[keyCode] || false : false;
    }
    
    // Specific action checks
    isPausePressed() { return this.isActionPressed('pause'); }
    isInventoryPressed() { return this.isActionPressed('inventory'); }
    isSprintPressed() { return this.isActionPressed('sprint'); }
    isCrouchPressed() { return this.isActionPressed('crouch'); }
    isAttackPressed() { return this.isActionPressed('attack'); } // Combat system
    isDebugPressed() { return this.isActionPressed('debug'); }
    isScreenshotPressed() { return this.isActionPressed('screenshot'); }
    isToggleAudioPressed() { return this.isActionPressed('toggleAudio'); }
}
```

**Key Features:**
- **Comprehensive Keybinds**: 40+ configurable keybinds across 8 categories
- **Action-Based Input**: Abstract key checking with `isActionPressed()`
- **Movement Vector**: Normalized movement input with `getMovementInput()`
- **Persistent Storage**: Keybinds saved to localStorage
- **Dynamic Updates**: Keybinds refresh when settings change
- **Fallback Support**: Direct key checking for critical functions
- **Combat Integration**: Attack keybind for combat system
- **Mobile Support**: D-pad controls for touch devices

**Responsibilities:**
- Enhanced keyboard input handling with keybind system
- Mouse input processing
- Input state management
- Event delegation with action abstraction
- Settings integration
- Combat system integration

### 7. Loading Screen System (`index.html`)

#### LoadingScreenManager - Multiplayer Connection Loading
```javascript
class LoadingScreenManager {
    constructor() {
        this.loadingScreen = document.getElementById('loadingScreen');
        this.progressBar = document.getElementById('loadingProgressBar');
        this.statusText = document.getElementById('loadingStatus');
        this.detailsText = document.getElementById('loadingDetails');
        this.gameContainer = document.querySelector('.game-container');
        this.isVisible = false;
        this.progressSteps = [
            { progress: 20, status: 'Connecting to server...', details: 'Establishing WebSocket connection' },
            { progress: 40, status: 'Authenticating...', details: 'Verifying player credentials' },
            { progress: 60, status: 'Loading world data...', details: 'Fetching world configuration' },
            { progress: 80, status: 'Synchronizing...', details: 'Syncing with other players' },
            { progress: 100, status: 'Connected!', details: 'Welcome to multiplayer!' }
        ];
    }

    show() {
        // Hide game UI elements immediately
        if (this.gameContainer) {
            this.gameContainer.classList.add('loading');
        }
        
        // Show loading screen
        this.loadingScreen.classList.add('show');
        this.isVisible = true;
        this.startProgressSimulation();
    }

    hide() {
        // Hide loading screen
        this.loadingScreen.classList.remove('show');
        this.isVisible = false;
        this.resetProgress();
        
        // Show game UI elements
        if (this.gameContainer) {
            this.gameContainer.classList.remove('loading');
        }
    }
}
```

**Key Features:**
- **Immediate Display**: Shows loading screen as soon as multiplayer parameter detected
- **Progress Simulation**: 5-stage progress simulation with realistic timing
- **UI Hiding**: Completely hides game UI during loading to prevent flicker
- **Mobile Responsive**: Optimized sizing and layout for mobile devices
- **Connection Integration**: Hides automatically when multiplayer connection completes

**Responsibilities:**
- Prevent loading screen flicker in multiplayer mode
- Provide visual feedback during connection process
- Hide/show game UI elements appropriately
- Simulate realistic connection progress

### 8. Mobile Controls System (`index.html`)

#### MobileControlsManager - Touch Device Controls
```javascript
class MobileControlsManager {
    constructor(game) {
        this.game = game;
        this.mobileControls = document.getElementById('mobileControls');
        this.dpadButtons = document.querySelectorAll('.dpad-btn');
        this.mobileChatBtn = document.getElementById('mobileChatBtn');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.mobileZoomControls = document.getElementById('mobileZoomControls');
        this.zoomInBtn = document.getElementById('zoomInBtn');
        this.zoomOutBtn = document.getElementById('zoomOutBtn');
        this.isFullscreen = false;
        
        this.setupEventListeners();
        this.detectMobileDevice();
    }

    handleZoomIn() {
        if (this.game.camera) {
            // Simulate scroll wheel zoom in (negative delta for zoom in)
            this.game.input.mouse.scrollDelta = -100;
            console.log('Mobile zoom in triggered');
        }
    }

    handleZoomOut() {
        if (this.game.camera) {
            // Simulate scroll wheel zoom out (positive delta for zoom out)
            this.game.input.mouse.scrollDelta = 100;
            console.log('Mobile zoom out triggered');
        }
    }
}
```

**Key Features:**
- **D-pad Controls**: 8-directional movement with touch events
- **Zoom Controls**: Dedicated zoom in/out buttons for mobile
- **Chat Integration**: Mobile chat button for multiplayer communication
- **Fullscreen Support**: Enter/exit fullscreen functionality
- **Touch Detection**: Automatic mobile device detection and control activation

**Responsibilities:**
- Mobile touch input handling
- Zoom control simulation
- Mobile UI element management
- Touch event optimization

### 9. Settings System (`/ui/`)

#### SettingsPanel.js - Settings Management
```javascript
class SettingsPanel {
    constructor() {
        this.isOpen = false;
        this.currentCategory = 'video';
        this.categories = {
            video: null,
            keybinds: null
        };
    }
    
    createModal() {
        // Modal with category navigation
        // Video and Keybind tabs
    }
    
    switchCategory(category) {
        // Switch between Video and Keybind settings
    }
    
    registerCategory(name, component) {
        // Register settings components
    }
}
```

#### KeybindSettings.js - Keybind Management
```javascript
class KeybindSettings {
    constructor() {
        this.keybinds = this.loadKeybinds();
        this.activeKeybindElement = null;
    }
    
    loadKeybinds() {
        // Load from localStorage or use defaults
    }
    
    render() {
        // Render keybind grid with categories
        // Movement, Game Controls, Camera, UI, Combat, Quick Slots, Utility, Audio
    }
    
    startKeyCapture(element) {
        // Handle key rebinding with visual feedback
    }
}
```

#### VideoSettings.js - Video Configuration
```javascript
class VideoSettings {
    constructor() {
        this.settings = this.loadSettings();
    }
    
    render() {
        // Render distance and edge fog controls
    }
    
    save() {
        // Save to localStorage
    }
}
```

**Key Features:**
- **Category Navigation**: Switch between Video and Keybind settings
- **Comprehensive Keybinds**: 8 categories with 40+ total keybinds
- **Visual Feedback**: Animated buttons during key capture
- **Persistent Storage**: All settings saved to localStorage
- **Reset Functionality**: Restore defaults with one click
- **Medieval Theme**: Consistent with game aesthetic

**Responsibilities:**
- Settings modal management
- Keybind customization and storage
- Video settings configuration
- User preference persistence
- Category navigation

## 🎨 Rendering Architecture

### Canvas Rendering Pipeline
```
1. Clear Canvas (Black Background)
    ↓
2. Apply Camera Transform
    ↓
3. Render World Tiles (Viewport Culled)
    ↓
4. Render Player
    ↓
5. Render NPCs
    ↓
6. Restore Transform
    ↓
7. Render UI Overlay (Health Bar + Controls Bubble)
```

### UI Rendering Strategy
```
1. Health Bar (Above Characters)
    ↓
2. Interactive Controls Bubble (Bottom Right)
    ↓
3. Modal Overlays (Inventory, Pause Menu, Settings, Controls Window)
    ↓
4. Dynamic Content (On-demand displays)
```

### Texture Rendering Strategy
```javascript
// Pixel-perfect rendering setup
ctx.save();
ctx.imageSmoothingEnabled = false;
ctx.imageSmoothingQuality = 'low';
ctx.drawImage(texture, x, y, width, height);
ctx.restore();
```

## 📊 Performance Architecture

### Viewport Culling System
```javascript
// Calculate visible area with padding
const screenWorldWidth = canvasWidth / camera.zoom;
const screenWorldHeight = canvasHeight / camera.zoom;
const extraPadding = Math.max(screenWorldWidth, screenWorldHeight) * 2;

// Only render tiles in visible area
for (let x = startX; x < endX; x++) {
    for (let y = startY; y < endY; y++) {
        // Render tile
    }
}
```

### Memory Management
- **Texture Loading**: Asynchronous with fallback systems
- **Tile Generation**: On-demand with caching
- **Event Cleanup**: Proper event listener removal
- **Canvas Optimization**: Efficient draw calls

## 🔄 Data Flow Architecture

### Update Cycle
```
Input Events → Game.update() → Component Updates → State Changes
```

### Render Cycle
```
Game.render() → Camera Transform → World Render → Player Render → NPC Render → UI Render
```

### Event Flow
```
User Input → Input System → Game Coordinator → Affected Components
```

## 🧪 Testing Architecture

### Debug Systems
```javascript
// Global testing functions
window.testHealth = {
    setFull: () => game.ui.updateHealth(10, 10),
    damage: (amount) => game.ui.healthBar.removeHealth(amount),
    heal: (amount) => game.ui.healthBar.addHealth(amount)
};

window.regenerateWorld = () => game.world.generateWorld();
```

### Performance Monitoring
- **Internal Tracking**: FPS and memory usage tracked internally
- **Clean Interface**: Debug panels removed for cleaner gameplay
- **On-Demand Info**: Performance data available through controls bubble
- **Optimized Rendering**: Viewport culling and efficient draw calls

## 🔧 Configuration Architecture

### Game Configuration
```javascript
const GAME_CONFIG = {
    WORLD: {
        WIDTH: 3500,
        HEIGHT: 2250,
        TILE_SIZE: 50
    },
    PLAYER: {
        SPEED: 200,
        SIZE: 32,
        HEALTH: 10,
        ATTACK_DAMAGE: 1,
        ATTACK_RANGE: 30
    },
    CAMERA: {
        ZOOM_MIN: 0.5,
        ZOOM_MAX: 2.0,
        FOLLOW_SPEED: 5
    },
    COMBAT: {
        ATTACK_COOLDOWN: 1000,
        DAMAGE_NUMBER_DURATION: 1000,
        HEALTH_BAR_HEIGHT: 4
    }
};
```

## 🚀 Extensibility Architecture

### Adding New Components
1. Create new component class in appropriate directory
2. Import and initialize in Game.js constructor
3. Add update/render calls in game loop
4. Implement proper cleanup methods

### Adding New Features
1. Extend existing components or create new ones
2. Update configuration as needed
3. Add testing functions for debugging
4. Update documentation

## 📝 Code Organization Principles

### File Structure
- **One Class Per File**: Clear separation and maintainability
- **Descriptive Naming**: Clear purpose from file names
- **Consistent Imports**: Standardized import patterns
- **Modular Exports**: Clean export interfaces

### Code Style
- **ES6+ Features**: Modern JavaScript practices
- **Consistent Formatting**: Readable and maintainable code
- **Comprehensive Comments**: Clear documentation
- **Error Handling**: Graceful failure modes

---

**Architecture Version**: v2.2
**Last Updated**: Enhanced with Complete Combat System & Visual Improvements
**Status**: Production-ready with comprehensive combat, mobile and multiplayer support

## 🆕 Recent Architecture Updates

### Combat System Implementation (January 27, 2025)
- **Complete Combat System**: Player and NPC attack mechanics with RuneScape Classic-style visuals
- **Health Bar System**: Above-character health bars for player and all NPCs with color-coded states
- **Floating Damage Numbers**: Animated damage numbers that float upward and fade out with gravity
- **Hostile NPC Behavior**: Rats chase and attack players with detection radius and attack cooldowns
- **Visual Attack Effects**: Simple weapon swing animations and claw attack effects
- **Player Size Enhancement**: Increased from 12px to 18px for better visibility
- **NPC Visual Cleanup**: Removed green interaction dots, improved name positioning
- **Keybind Conflict Resolution**: Fixed Spacebar triggering both attack and chat

### Mobile & Multiplayer Enhancements (January 27, 2025)
- **Loading Screen System**: Immediate display with progress simulation for multiplayer connections
- **Mobile Controls**: Touch-friendly D-pad, zoom controls, and chat integration
- **Smart Pause Logic**: Multiplayer-aware pause behavior that preserves NPC synchronization
- **Mobile Default Zoom**: Automatic maximum zoom on touch devices for better visibility
- **Event Handler Updates**: Window blur and visibility change handlers respect multiplayer mode

### Custom World Support (October 21, 2025)
- **Mana Tile Support**: Added "mana" as valid tile type for custom worlds
- **Security Validation**: Enhanced SecurityUtils.js to support mana tiles
- **Custom World Loading**: Fixed validation errors preventing custom world loading
- **File Path Validation**: Secure custom world loading with path validation

### Enhanced UI/UX System
- **Interactive Controls Bubble**: On-demand controls reference
- **Clean Interface**: Removed debug panels for immersive gameplay
- **Comprehensive Settings**: Video and Keybind customization
- **Status Indicators**: Clear implementation status (✅ Implemented | 🚧 Coming Soon)

### Advanced Input System
- **40+ Configurable Keybinds**: 8 categories of customizable controls
- **Action-Based Input**: Abstract key checking with `isActionPressed()`
- **Enhanced Movement**: Sprint/crouch support with normalized vectors
- **Persistent Storage**: All keybinds saved to localStorage

### Modular Settings Architecture
- **Category Navigation**: Switch between Video and Keybind settings
- **Visual Feedback**: Animated key capture with pulse effects
- **Reset Functionality**: One-click restore to defaults
- **Medieval Theme**: Consistent styling throughout

### Inventory Integration
- **RPG-Style System**: 8 equipment slots + 24 item slots
- **Game Pause Integration**: Automatic pause when inventory opens
- **Keybind Integration**: 'I' key with fallback support
- **Beautiful UI**: Medieval-themed design with golden accents