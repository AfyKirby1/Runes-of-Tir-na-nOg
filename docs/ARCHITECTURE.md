# Runes of Tir na nÓg - Comprehensive Architecture Documentation

## 🏗️ System Architecture Overview

**Runes of Tir na nÓg** is a modern web-based RPG prototype built with vanilla JavaScript, featuring a complete combat system, multiplayer capabilities, mobile support, and comprehensive UI systems. This document provides detailed technical architecture information for AI models and developers.

## 📋 Architecture Principles

### 1. Modular Component Design
- **Separation of Concerns**: Each system has a single responsibility
- **Loose Coupling**: Components communicate through well-defined interfaces
- **High Cohesion**: Related functionality is grouped together
- **Dependency Injection**: Systems receive dependencies through constructor parameters

### 2. Performance-First Design
- **Viewport Culling**: Only render visible game objects for optimal performance
- **Efficient Rendering**: Canvas 2D with optimized draw calls and pixel-perfect rendering
- **Memory Management**: Proper cleanup, resource management, and garbage collection
- **60 FPS Target**: RequestAnimationFrame-based game loop with delta time

### 3. Scalable Architecture
- **Extensible Systems**: Easy to add new features without breaking existing code
- **Plugin Architecture**: New components can be added modularly
- **Configuration-Driven**: Behavior controlled through parameters and settings
- **Event-Driven**: Systems communicate through events and callbacks

### 4. Security-First Approach
- **Input Validation**: All user inputs are validated and sanitized
- **Content Security Policy**: CSP headers prevent XSS attacks
- **Safe JSON Parsing**: Prototype pollution prevention
- **Keybind Validation**: Whitelist-based key code validation

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
                                              │ • NPCs          │
                                              │ • Network       │
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
Controls System ─┤
Network System ─┤
NPC System ─────┤
Audio System ───┤
Security System ─┘
```

## 🔧 Component Architecture Details

### 1. Game Core (`/core/`)

#### Game.js - Main Coordinator (1077 lines)
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
        
        // Multiplayer synchronization
        if (this.isMultiplayer) {
            this.networkManager.update();
        }
    }
    
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
}
```

**Key Responsibilities:**
- System initialization and coordination
- Game state management (single-player vs multiplayer)
- Enhanced keybind event handling with chat input blocking
- Inventory system integration
- Performance monitoring and optimization
- Combat system coordination
- Multiplayer synchronization
- Mobile controls integration
- Security validation and input sanitization

#### GameLoop.js - Frame Management
```javascript
export class GameLoop {
    constructor(update, render) {
        this.update = update;
        this.render = render;
        this.isRunning = false;
        this.lastTime = 0;
        this.accumulator = 0;
        this.timestep = 1000 / 60; // 60 FPS
    }
    
    start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        this.loop();
    }
    
    loop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.accumulator += deltaTime;
        
        while (this.accumulator >= this.timestep) {
            this.update(this.timestep);
            this.accumulator -= this.timestep;
        }
        
        this.render(this.accumulator / this.timestep);
        requestAnimationFrame(() => this.loop());
    }
}
```

**Responsibilities:**
- 60 FPS frame rate management with fixed timestep
- Delta time calculation for smooth animations
- Animation frame synchronization
- Performance optimization with accumulator pattern

#### ChatManager.js - Chat Bubble System (game.html)

The ChatManager class provides a comprehensive chat system with above-character speech bubbles for immersive multiplayer communication.

```javascript
class ChatManager {
    constructor(game) {
        this.game = game;
        this.chatContainer = document.getElementById('chatContainer');
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.chatSend = document.getElementById('chatSend');
        this.chatCloseBtn = document.getElementById('chatCloseBtn');
        this.isChatOpen = false;
        
        // Chat bubble system
        this.chatBubbles = new Map(); // playerId -> bubble element
        this.bubbleDuration = 5000; // 5 seconds
        this.maxBubbles = 5; // Maximum concurrent bubbles
        
        this.setupEventListeners();
        this.setupNetworkCallbacks();
    }
```

**Key Features:**
- **Above-Character Speech Bubbles**: Medieval-styled bubbles that appear above players
- **Automatic Positioning**: Bubbles follow players as they move around the world
- **Duration Management**: 5-second display duration with automatic cleanup
- **Concurrent Limits**: Maximum 5 bubbles to prevent screen clutter
- **Medieval Styling**: Dark theme with golden borders and Celtic typography
- **Multiplayer Integration**: Real-time chat with server synchronization
- **Input Blocking**: Prevents game actions while typing in chat

**Chat Bubble Styling:**
```css
.chat-bubble {
    position: absolute;
    background: linear-gradient(145deg, #2a2a3e, #1a1a2e);
    border: 2px solid #d4af37;
    border-radius: 12px;
    padding: 8px 12px;
    max-width: 200px;
    min-width: 80px;
    z-index: 1500;
    pointer-events: none;
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6),
                0 0 20px rgba(212, 175, 55, 0.3);
}
```

**Bubble Management Methods:**
- `createChatBubble(username, message, type)` - Creates and positions new bubble
- `positionBubbleAbovePlayer(bubble, username)` - Calculates screen position
- `removeChatBubble(username)` - Removes specific bubble
- `updateChatBubblePositions()` - Updates all bubble positions
- `clearAllChatBubbles()` - Cleans up all bubbles

**Integration Points:**
- **Game Loop**: Updates bubble positions every frame
- **Network Manager**: Receives chat messages from server
- **Input System**: Blocks game actions while chat is open
- **Camera System**: Converts world coordinates to screen coordinates

#### NetworkManager.js - Multiplayer Communication (587 lines)
```javascript
export class NetworkManager {
    constructor(game) {
        this.game = game;
        this.socket = null;
        this.playerId = null;
        this.otherPlayers = {};
        this.npcs = {};  // Server-synchronized NPCs
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 2000;
        this.pingInterval = null;
        this.lastPingTime = 0;
        
        // Connection status callbacks
        this.onConnectionStatusChange = null;
        this.onPlayerJoined = null;
        this.onPlayerLeft = null;
        this.onPlayerPositionUpdate = null;
        this.onError = null;
        
        // NPC callbacks
        this.onNPCsReceived = null;
        this.onNPCHealthUpdate = null;
        this.onNPCDefeated = null;
        this.onNPCInteraction = null;
        
        // Chat callbacks
        this.onChatMessage = null;
        this.onChatHistory = null;
        
        // Position update throttling
        this.positionUpdateInterval = 100; // Update every 100ms
    }
    
    async connect(username, serverUrl = 'wss://web-production-b1ed.up.railway.app/ws') {
        try {
            console.log(`Connecting to multiplayer server: ${serverUrl}`);
            
            // Create WebSocket connection
            this.socket = new WebSocket(serverUrl);
            
            // Set up event handlers
            this.setupEventHandlers();
            
            // Wait for connection to open
            await this.waitForConnection();
            
            // Send join request
            await this.sendJoinRequest(username);
            
            // Start ping interval
            this.startPingInterval();
            
            console.log('Successfully connected to multiplayer server');
            return true;
            
        } catch (error) {
            console.error('Failed to connect to server:', error);
            this.handleConnectionError(error);
            return false;
        }
    }
}
```

**Key Features:**
- WebSocket-based real-time multiplayer communication
- Player position synchronization with throttling
- NPC state synchronization
- Chat system integration
- Connection management with auto-reconnect
- Ping/pong heartbeat system
- Error handling and recovery

### 2. Player System (`/player/`)

#### Player.js - Player Character (449 lines)
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
        
        // Update damage numbers
        this.updateDamageNumbers();
    }
    
    attack() {
        this.lastAttackTime = Date.now();
        this.isAttacking = true;
        
        console.log(`⚔️ Player attacks!`);
        
        // Find nearby NPCs to attack
        if (this.game && this.game.npcManager) {
            const nearbyNPCs = this.game.npcManager.getNPCsNearPlayer(this, this.attackRange);
            
            for (const npc of nearbyNPCs) {
                // Only attack hostile NPCs
                if (npc.behavior === 'hostile' && npc.health > 0) {
                    npc.takeDamage(this.attackDamage);
                    console.log(`⚔️ Player deals ${this.attackDamage} damage to ${npc.name}!`);
                }
            }
        }
    }
    
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        this.addDamageNumber(amount);
        
        if (this.health <= 0) {
            console.log('💀 Player defeated!');
            // Handle player death
        }
    }
    
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
    
    updateDamageNumbers() {
        for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
            const damageNumber = this.damageNumbers[i];
            damageNumber.x += damageNumber.vx;
            damageNumber.y += damageNumber.vy;
            damageNumber.vy += 0.1; // Gravity
            damageNumber.life -= 16; // Assuming 60 FPS
            
            if (damageNumber.life <= 0) {
                this.damageNumbers.splice(i, 1);
            }
        }
    }
}
```

**Key Features:**
- Enhanced movement with sprint/crouch support
- Complete combat system with attack animations
- Health management and damage numbers
- Input system integration with chat blocking
- Collision detection with world boundaries
- Animation state management
- Name tag display system
- Damage number system with gravity and fade effects

### 3. NPC System (`/npc/`)

#### NPC.js - NPC Management (806 lines)
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
        this.behavior = config.behavior || "neutral";
        
        // Visual properties
        this.isVisible = true;
        this.isActive = true;
    }
    
    update(deltaTime, player, world) {
        if (!this.isActive) return;
        
        // AI behavior and combat logic
        this.updateAI(deltaTime, player, world);
        this.updateCombat(deltaTime, player);
        this.updateMovement(deltaTime);
        this.updateDamageNumbers(deltaTime);
    }
    
    updateAI(deltaTime, player, world) {
        const distanceToPlayer = Math.sqrt(
            Math.pow(this.x - player.x, 2) + Math.pow(this.y - player.y, 2)
        );
        
        if (this.behavior === 'hostile') {
            if (distanceToPlayer <= this.detectionRadius) {
                this.aiState = 'chase';
                this.chasePlayer(player);
            } else {
                this.aiState = 'idle';
            }
        }
    }
    
    chasePlayer(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
    }
    
    attackPlayer(player) {
        this.lastAttackTime = Date.now();
        this.isAttacking = true;
        
        console.log(`⚔️ ${this.name} attacks player!`);
        player.takeDamage(this.attackDamage);
        
        // Reset attack animation after 200ms
        setTimeout(() => {
            this.isAttacking = false;
        }, 200);
    }
    
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        this.addDamageNumber(amount);
        
        if (this.health <= 0) {
            this.health = 0;
            this.isActive = false;
            this.isVisible = false;
            console.log(`💀 ${this.name} defeated!`);
        }
    }
    
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
}
```

**Key Features:**
- Complete AI behavior system with different states (idle, chase, attack)
- Combat system with attack animations and cooldowns
- Health management and damage numbers
- Detection radius and reaction time systems
- Death system with visual state management
- Damage number system with gravity and fade effects
- Multiplayer synchronization support

### 4. Input System (`/input/`)

#### Input.js - Enhanced Input Management (427 lines)
```javascript
export class Input {
    // Security: Whitelist of valid key codes
    static VALID_KEY_CODES = new Set([
        // Letters, Numbers, Arrows, Modifiers, Special keys, Function keys, Symbols, Mouse
        'KeyA', 'KeyB', 'KeyC', 'KeyD', 'KeyE', 'KeyF', 'KeyG', 'KeyH',
        'KeyI', 'KeyJ', 'KeyK', 'KeyL', 'KeyM', 'KeyN', 'KeyO', 'KeyP',
        'KeyQ', 'KeyR', 'KeyS', 'KeyT', 'KeyU', 'KeyV', 'KeyW', 'KeyX',
        'KeyY', 'KeyZ', 'Digit0', 'Digit1', 'Digit2', 'Digit3', 'Digit4',
        'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'ArrowUp', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight', 'ControlLeft',
        'ControlRight', 'AltLeft', 'AltRight', 'Space', 'Enter', 'Escape',
        'Tab', 'Backspace', 'Delete', 'Insert', 'Home', 'End', 'PageUp',
        'PageDown', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8',
        'F9', 'F10', 'F11', 'F12', 'Equal', 'Minus', 'BracketLeft',
        'BracketRight', 'Semicolon', 'Quote', 'Backslash', 'Comma', 'Period',
        'Slash', 'Backquote', 'Mouse1', 'Mouse2', 'Mouse3', 'WheelUp', 'WheelDown'
    ]);
    
    constructor(canvas) {
        this.keys = {};
        this.mouse = {
            x: 0, y: 0, isDragging: false,
            dragStart: { x: 0, y: 0 },
            lastPosition: { x: 0, y: 0 }
        };
        this.canvas = canvas;
        
        // Keybind system
        this.keybinds = this.loadKeybinds();
        this.keyActions = {};
        
        // Mobile D-pad state
        this.mobileDpad = {
            up: false, down: false, left: false, right: false,
            upLeft: false, upRight: false, downLeft: false, downRight: false
        };
        
        // Chat input blocking
        this.isChatOpen = false;
        
        this.setupEventListeners();
    }
    
    // Check if a specific action key is pressed
    isActionPressed(action) {
        // Block all game input when chat is open (except chat toggle itself)
        if (this.isChatOpen && action !== 'chat') {
            return false;
        }
        const keyCode = this.keybinds[action];
        return keyCode ? this.keys[keyCode] || false : false;
    }
    
    // Get movement input vector
    getMovementInput() {
        let x = 0, y = 0;
        
        // Check primary movement keys
        if (this.isActionPressed('moveLeft') || this.isActionPressed('moveLeftAlt')) x -= 1;
        if (this.isActionPressed('moveRight') || this.isActionPressed('moveRightAlt')) x += 1;
        if (this.isActionPressed('moveUp') || this.isActionPressed('moveUpAlt')) y -= 1;
        if (this.isActionPressed('moveDown') || this.isActionPressed('moveDownAlt')) y += 1;
        
        // Add mobile D-pad input
        if (this.mobileDpad.left || this.mobileDpad.upLeft || this.mobileDpad.downLeft) x -= 1;
        if (this.mobileDpad.right || this.mobileDpad.upRight || this.mobileDpad.downRight) x += 1;
        if (this.mobileDpad.up || this.mobileDpad.upLeft || this.mobileDpad.upRight) y -= 1;
        if (this.mobileDpad.down || this.mobileDpad.downLeft || this.mobileDpad.downRight) y += 1;
        
        return { x, y };
    }
    
    // Chat input control methods
    setChatOpen(isOpen) {
        this.isChatOpen = isOpen;
    }
    
    isChatInputBlocked() {
        return this.isChatOpen;
    }
    
    // Mobile D-pad control methods
    setMobileDpadState(direction, pressed) {
        if (this.mobileDpad.hasOwnProperty(direction)) {
            this.mobileDpad[direction] = pressed;
        }
    }
}
```

**Key Features:**
- Comprehensive keybind system with 40+ configurable controls
- Security-first approach with key code whitelisting
- Chat input blocking to prevent game actions while typing
- Mobile D-pad support for touch devices
- Action-based input abstraction with `isActionPressed()`
- Movement vector normalization with `getMovementInput()`
- Persistent storage of keybinds in localStorage
- Dynamic keybind updates and validation
- Mobile touch event handling
- Mouse drag and scroll wheel support

### 5. UI System (`/ui/`)

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
    
    render(ctx, camera) {
        // Render health bar above player
        this.healthBar.renderAboveCharacter(ctx, this.playerX, this.playerY, camera);
    }
}
```

**Responsibilities:**
- Health visualization with heart icons
- Internal performance tracking (FPS, memory)
- UI state management
- Clean interface (debug panels removed for production)
- Above-character health bar rendering

#### HealthBar.js - Health Display System
```javascript
export class HealthBar {
    constructor() {
        this.maxHealth = 10;
        this.currentHealth = 10;
        this.heartImage = null;
    }
    
    setHealth(current, maximum) {
        this.currentHealth = current;
        this.maxHealth = maximum;
    }
    
    renderAboveCharacter(ctx, playerX, playerY, camera) {
        // Render health bar above character
        const screenX = playerX - camera.x;
        const screenY = playerY - camera.y - 25; // Above character
        
        // Health bar background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(screenX - 15, screenY - 2, 30, 4);
        
        // Health bar fill
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
}
```

**Key Features:**
- Above-character health bar rendering
- Color-coded health states (green, yellow, red)
- Player and NPC health display
- Pixel-perfect rendering with drop shadows
- Integration with camera system for proper positioning

#### Inventory.js - Inventory System
```javascript
export class Inventory {
    constructor(game) {
        this.game = game;
        this.isVisible = false;
        this.items = Array(24).fill(null);
        this.equipment = {
            helmet: null, necklace: null, chest: null, legs: null,
            boots: null, ring1: null, ring2: null, weapon: null
        };
    }
    
    toggle() {
        this.isVisible = !this.isVisible;
        
        // Pause game when inventory is open
        if (this.isVisible) {
            this.game.pause();
        } else {
            this.game.resume();
        }
    }
    
    addItem(item) {
        // Add item to first available slot
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i] === null) {
                this.items[i] = item;
                return true;
            }
        }
        return false; // Inventory full
    }
    
    updateItemsDisplay() {
        // Update visual display of items
        // Handle drag-and-drop, tooltips, and interactions
    }
}
```

**Key Features:**
- **Equipment Slots**: 8 equipment slots (helmet, necklace, chest, legs, boots, 2 rings, weapon)
- **Item Storage**: 24-slot grid for general inventory items
- **Interactive UI**: Drag-and-drop, tooltips, and click interactions
- **Character Stats**: Display attack, defense, and speed stats
- **Resource Tracking**: Gold and weight/capacity display
- **RPG-Styled Design**: Medieval-themed UI with golden borders and shadows
- **Game Pause Integration**: Automatically pauses game when open
- **Key Binding**: Press `I` to open/close inventory

### 6. World System (`/world/`)

#### World.js - World Generation and Rendering
```javascript
export class World {
    constructor(config = null) {
        this.width = config?.width || 3500;
        this.height = config?.height || 2250;
        this.tileSize = config?.tileSize || 50;
        this.tiles = [];
        this.textures = {};
        
        this.generateWorld();
        this.loadTextures();
    }
    
    generateWorld() {
        this.tiles = [];
        for (let y = 0; y < this.height / this.tileSize; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < this.width / this.tileSize; x++) {
                const rand = Math.random();
                if (rand < 0.85) {
                    this.tiles[y][x] = 'grass';
                } else if (rand < 0.95) {
                    this.tiles[y][x] = 'water';
                } else if (rand < 0.98) {
                    this.tiles[y][x] = 'wall';
                } else {
                    this.tiles[y][x] = 'cave';
                }
            }
        }
    }
    
    render(ctx, camera) {
        // Calculate visible area with padding
        const screenWorldWidth = ctx.canvas.width / camera.zoom;
        const screenWorldHeight = ctx.canvas.height / camera.zoom;
        const extraPadding = Math.max(screenWorldWidth, screenWorldHeight) * 2;
        
        const startX = Math.max(0, Math.floor((camera.x - extraPadding) / this.tileSize));
        const endX = Math.min(this.tiles[0].length, Math.ceil((camera.x + screenWorldWidth + extraPadding) / this.tileSize));
        const startY = Math.max(0, Math.floor((camera.y - extraPadding) / this.tileSize));
        const endY = Math.min(this.tiles.length, Math.ceil((camera.y + screenWorldHeight + extraPadding) / this.tileSize));
        
        // Only render visible tiles
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const tileType = this.tiles[y][x];
                const worldX = x * this.tileSize;
                const worldY = y * this.tileSize;
                const screenX = worldX - camera.x;
                const screenY = worldY - camera.y;
                
                this.renderTile(ctx, tileType, screenX, screenY);
            }
        }
    }
    
    renderTile(ctx, tileType, x, y) {
        // Pixel-perfect rendering setup
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.imageSmoothingQuality = 'low';
        
        if (this.textures[tileType]) {
            ctx.drawImage(this.textures[tileType], x, y, this.tileSize, this.tileSize);
        } else {
            // Fallback to solid colors
            const colors = {
                grass: '#4a7c59',
                water: '#4a90e2',
                wall: '#8b4513',
                cave: '#654321'
            };
            ctx.fillStyle = colors[tileType] || '#666';
            ctx.fillRect(x, y, this.tileSize, this.tileSize);
        }
        
        ctx.restore();
    }
}
```

**Key Features:**
- Procedural world generation with configurable parameters
- Multiple tile types (grass, water, wall, cave) with different spawn rates
- Pixel art texture support with fallback to solid colors
- Viewport culling for optimal performance
- Seamless texture coverage beyond world bounds
- Custom world loading from JSON files
- Tile-based collision detection

### 7. Camera System (`/camera/`)

#### Camera.js - Camera Management
```javascript
export class Camera {
    constructor(canvasWidth, canvasHeight) {
        this.x = 0;
        this.y = 0;
        this.zoom = 1.0;
        this.maxZoom = 3.0;
        this.minZoom = 0.5;
        this.followSpeed = 5;
        this.targetX = 0;
        this.targetY = 0;
    }
    
    update(playerX, playerY, worldWidth, worldHeight, input) {
        // Update target position
        this.targetX = playerX;
        this.targetY = playerY;
        
        // Smooth following
        this.x += (this.targetX - this.x) / this.followSpeed;
        this.y += (this.targetY - this.y) / this.followSpeed;
        
        // Handle zoom
        const scrollDelta = input.getScrollDelta();
        if (scrollDelta !== 0) {
            this.zoom += scrollDelta * 0.001;
            this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom));
        }
        
        // Handle mouse drag for camera movement
        if (input.mouse.isDragging) {
            const dragDelta = input.getDragDelta();
            this.x -= dragDelta.x;
            this.y -= dragDelta.y;
            input.resetDragStart();
        }
        
        // Boundary constraints
        const screenWorldWidth = canvasWidth / this.zoom;
        const screenWorldHeight = canvasHeight / this.zoom;
        
        this.x = Math.max(screenWorldWidth / 2, Math.min(worldWidth - screenWorldWidth / 2, this.x));
        this.y = Math.max(screenWorldHeight / 2, Math.min(worldHeight - screenWorldHeight / 2, this.y));
    }
    
    applyTransform(ctx) {
        ctx.save();
        ctx.scale(this.zoom, this.zoom);
        ctx.translate(-this.x, -this.y);
    }
    
    restoreTransform(ctx) {
        ctx.restore();
    }
}
```

**Key Features:**
- Smooth camera following with configurable speed
- Zoom level management with min/max constraints
- Mouse drag for manual camera movement
- Boundary constraints to prevent camera from going outside world
- Canvas transformation for proper rendering
- Scroll wheel zoom support
- Mobile zoom controls integration

### 8. Audio System (`/audio/`)

#### AudioManager.js - Audio Management
```javascript
export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.isEnabled = true;
        this.volume = 0.7;
        this.sounds = {};
        
        this.initAudioContext();
    }
    
    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
        }
    }
    
    playWaterSound() {
        if (!this.audioContext || !this.isEnabled) return;
        
        // Generate water splash sound
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }
    
    playFootstepSound() {
        if (!this.audioContext || !this.isEnabled) return;
        
        // Generate footstep sound
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(this.volume * 0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }
    
    toggleAudio() {
        this.isEnabled = !this.isEnabled;
    }
}
```

**Key Features:**
- Web Audio API-based sound system
- Procedurally generated water splash sounds
- Footstep audio for ground movement
- Volume control and audio toggle
- Context initialization with fallback handling
- Real-time audio generation for immersive experience

### 9. Security System (`/utils/`)

#### SecurityUtils.js - Security and Validation
```javascript
export class SecurityUtils {
    /**
     * Validate username input
     * @param {string} username - Username to validate
     * @returns {boolean} - True if valid
     */
    static validateUsername(username) {
        if (!username || typeof username !== 'string') return false;
        
        // Length check
        if (username.length < 1 || username.length > 20) return false;
        
        // Character validation - only letters, numbers, spaces, and basic punctuation
        const validPattern = /^[a-zA-Z0-9\s\-_\.]+$/;
        if (!validPattern.test(username)) return false;
        
        // Prevent common injection patterns
        const dangerousPatterns = [
            /<script/i, /javascript:/i, /on\w+\s*=/i,
            /data:/i, /vbscript:/i, /expression/i
        ];
        
        return !dangerousPatterns.some(pattern => pattern.test(username));
    }
    
    /**
     * Safe JSON parsing with prototype pollution prevention
     * @param {string} jsonString - JSON string to parse
     * @param {*} defaultValue - Default value if parsing fails
     * @returns {*} - Parsed object or default value
     */
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
            console.error('JSON parsing error:', error);
            return defaultValue;
        }
    }
    
    /**
     * Validate URL parameters
     * @param {string} param - Parameter value
     * @param {Array} allowedValues - Array of allowed values
     * @returns {string|null} - Sanitized parameter or null
     */
    static validateURLParam(param, allowedValues) {
        if (!param || typeof param !== 'string') return null;
        
        // Basic sanitization
        const sanitized = param.trim().toLowerCase();
        
        // Check against whitelist
        if (allowedValues.includes(sanitized)) {
            return sanitized;
        }
        
        return null;
    }
    
    /**
     * Validate file paths to prevent directory traversal
     * @param {string} path - File path to validate
     * @returns {boolean} - True if path is safe
     */
    static validateFilePath(path) {
        if (!path || typeof path !== 'string') return false;
        
        // Prevent directory traversal
        if (path.includes('..') || path.includes('~') || path.startsWith('/')) {
            return false;
        }
        
        // Only allow specific file extensions
        const allowedExtensions = ['.json', '.png', '.jpg', '.jpeg', '.gif'];
        const hasValidExtension = allowedExtensions.some(ext => path.toLowerCase().endsWith(ext));
        
        return hasValidExtension;
    }
}
```

**Key Features:**
- Username validation with character restrictions
- Safe JSON parsing with prototype pollution prevention
- URL parameter validation with whitelist approach
- File path validation to prevent directory traversal
- XSS prevention through input sanitization
- Security logging and warning system

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
6. Render Other Players (Multiplayer)
    ↓
7. Restore Transform
    ↓
8. Render UI Overlay (Health Bars + Controls)
    ↓
9. Render Damage Numbers
    ↓
10. Render Chat System (if open)
```

### UI Rendering Strategy
```
1. Health Bars (Above Characters)
    ↓
2. Interactive Controls Bubble (Bottom Right)
    ↓
3. Mobile Controls (Touch Devices)
    ↓
4. Modal Overlays (Inventory, Pause Menu, Settings)
    ↓
5. Loading Screen (Multiplayer)
    ↓
6. Chat System (Multiplayer)
    ↓
7. Damage Numbers (Combat)
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
- **Damage Numbers**: Automatic cleanup after animation
- **NPC Management**: Proper cleanup of defeated NPCs

### Performance Metrics
- **File Size**: ~15KB total (modular components)
- **Memory Usage**: < 10MB with textures loaded
- **CPU Usage**: Minimal (60 FPS target maintained)
- **Network**: Zero external requests (all assets local)
- **Rendering**: Viewport culling for optimal performance
- **Texture Loading**: Asynchronous with fallback systems

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

### Multiplayer Data Flow
```
Client Input → NetworkManager → WebSocket → Server → Other Clients
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
        SIZE: 18,
        HEALTH: 10,
        ATTACK_DAMAGE: 1,
        ATTACK_RANGE: 30
    },
    CAMERA: {
        ZOOM_MIN: 0.5,
        ZOOM_MAX: 3.0,
        FOLLOW_SPEED: 5
    },
    COMBAT: {
        ATTACK_COOLDOWN: 1000,
        DAMAGE_NUMBER_DURATION: 1000,
        HEALTH_BAR_HEIGHT: 4
    },
    MULTIPLAYER: {
        SERVER_URL: 'wss://web-production-b1ed.up.railway.app/ws',
        POSITION_UPDATE_INTERVAL: 100,
        MAX_RECONNECT_ATTEMPTS: 5
    }
};
```

## 🚀 Extensibility Architecture

### Adding New Components
1. Create new component class in appropriate directory
2. Import and initialize in Game.js constructor
3. Add update/render calls in game loop
4. Implement proper cleanup methods
5. Add configuration options if needed

### Adding New Features
1. Extend existing components or create new ones
2. Update configuration as needed
3. Add testing functions for debugging
4. Update documentation
5. Consider multiplayer synchronization if applicable

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
- **Security First**: Input validation and sanitization

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
- **Chat Input Blocking**: Prevents game actions while typing in chat

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
- **Chat Input Blocking**: Prevents game actions while chat is open

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

### Design System Documentation (January 27, 2025)
- **Style Guide Creation**: Comprehensive design system guide with Celtic medieval theme
- **Color Palette**: Primary gold (#d4af37), dark navy (#0a0a1a), forest green (#4a7c59), status colors
- **Typography**: Cinzel serif for UI, Courier New for game elements, font weights and styling patterns
- **Component Patterns**: Button styles, form elements, modal windows, toggle switches
- **Layout Guidelines**: Container structure, background patterns, animation patterns
- **Responsive Design**: Mobile breakpoints, touch-friendly controls, performance considerations
- **Accessibility Standards**: Color contrast, keyboard navigation, screen reader support
- **Implementation Guidelines**: CSS organization, naming conventions, performance considerations

---

**Architecture Version**: v2.3
**Last Updated**: January 27, 2025
**Status**: Production-ready with comprehensive combat, mobile, multiplayer, security systems, and design documentation
**AI Model Compatibility**: Optimized for AI model understanding with detailed technical specifications
**Design System**: Complete style guide with Celtic medieval theme, color palette, typography, and component patterns

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

### Design System Documentation (January 27, 2025)
- **Style Guide Creation**: Comprehensive design system guide with Celtic medieval theme
- **Color Palette**: Primary gold (#d4af37), dark navy (#0a0a1a), forest green (#4a7c59), status colors
- **Typography**: Cinzel serif for UI, Courier New for game elements, font weights and styling patterns
- **Component Patterns**: Button styles, form elements, modal windows, toggle switches
- **Layout Guidelines**: Container structure, background patterns, animation patterns
- **Responsive Design**: Mobile breakpoints, touch-friendly controls, performance considerations
- **Accessibility Standards**: Color contrast, keyboard navigation, screen reader support
- **Implementation Guidelines**: CSS organization, naming conventions, performance considerations