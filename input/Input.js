// Input.js - Updated to fix const assignment error
import { SecurityUtils } from '../utils/SecurityUtils.js';

export class Input {
    // ✅ SECURITY FIX (VULN-005): Whitelist of valid key codes (shared with KeybindSettings)
    static VALID_KEY_CODES = new Set([
        // Letters
        'KeyA', 'KeyB', 'KeyC', 'KeyD', 'KeyE', 'KeyF', 'KeyG', 'KeyH',
        'KeyI', 'KeyJ', 'KeyK', 'KeyL', 'KeyM', 'KeyN', 'KeyO', 'KeyP',
        'KeyQ', 'KeyR', 'KeyS', 'KeyT', 'KeyU', 'KeyV', 'KeyW', 'KeyX',
        'KeyY', 'KeyZ',
        // Numbers
        'Digit0', 'Digit1', 'Digit2', 'Digit3', 'Digit4',
        'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9',
        // Arrows
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
        // Modifiers
        'ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight',
        'AltLeft', 'AltRight',
        // Special
        'Space', 'Enter', 'Escape', 'Tab', 'Backspace', 'Delete',
        'Insert', 'Home', 'End', 'PageUp', 'PageDown',
        // Function keys
        'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8',
        'F9', 'F10', 'F11', 'F12',
        // Symbols
        'Equal', 'Minus', 'BracketLeft', 'BracketRight',
        'Semicolon', 'Quote', 'Backslash', 'Comma', 'Period',
        'Slash', 'Backquote',
        // Mouse
        'Mouse1', 'Mouse2', 'Mouse3',
        'WheelUp', 'WheelDown'
    ]);
    
    constructor(canvas) {
        this.keys = {};
        this.mouse = {
            x: 0,
            y: 0,
            isDragging: false,
            dragStart: { x: 0, y: 0 },
            lastPosition: { x: 0, y: 0 }
        };
        this.canvas = canvas;
        
        // Keybind system
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
        
        // Chat input blocking
        this.isChatOpen = false;
        
        this.setupEventListeners();
    }

    loadKeybinds() {
        // ✅ SECURITY FIX (VULN-005): Validate keybinds to prevent prototype pollution
        const saved = localStorage.getItem('gameKeybinds');
        if (saved) {
            try {
                const parsed = SecurityUtils.safeJSONParse(saved, null);
                
                // Validate object type
                if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
                    console.error('Invalid keybinds format');
                    return this.getDefaultKeybinds();
                }
                
                // Get default keybinds
                const defaults = this.getDefaultKeybinds();
                
                // ✅ Validate each keybind
                const validated = {};
                for (const [action, keyCode] of Object.entries(parsed)) {
                    // Prevent prototype pollution
                    if (action === '__proto__' || action === 'constructor' || action === 'prototype') {
                        console.warn('🚨 SECURITY: Blocked prototype pollution attempt');
                        continue;
                    }
                    
                    // Only allow known actions
                    if (!(action in defaults)) {
                        // Only log unknown actions once during load, not on every key press
                        if (!this._loggedUnknownActions) {
                            this._loggedUnknownActions = new Set();
                        }
                        if (!this._loggedUnknownActions.has(action)) {
                            console.warn(`Unknown keybind action: ${action}`);
                            this._loggedUnknownActions.add(action);
                        }
                        continue;
                    }
                    
                    // Only allow whitelisted key codes
                    if (typeof keyCode === 'string' && Input.VALID_KEY_CODES.has(keyCode)) {
                        validated[action] = keyCode;
                    } else {
                        // Only log invalid key codes once during load, not on every key press
                        if (!this._loggedInvalidKeys) {
                            this._loggedInvalidKeys = new Set();
                        }
                        const keyError = `${action}:${keyCode}`;
                        if (!this._loggedInvalidKeys.has(keyError)) {
                            console.warn(`Invalid key code for ${action}: ${keyCode}`);
                            this._loggedInvalidKeys.add(keyError);
                        }
                        validated[action] = defaults[action]; // Use default
                    }
                }
                
                return { ...defaults, ...validated };
                
            } catch (e) {
                console.error('Failed to load keybinds:', e);
                return this.getDefaultKeybinds();
            }
        }
        
        return this.getDefaultKeybinds();
    }
    
    // ✅ SECURITY FIX (VULN-005): Extract default keybinds to method
    getDefaultKeybinds() {
        // Default keybinds
        return {
            moveUp: 'KeyW',
            moveDown: 'KeyS',
            moveLeft: 'KeyA',
            moveRight: 'KeyD',
            moveUpAlt: 'ArrowUp',
            moveDownAlt: 'ArrowDown',
            moveLeftAlt: 'ArrowLeft',
            moveRightAlt: 'ArrowRight',
            pause: 'Escape',
            inventory: 'KeyI',
            interact: 'KeyE',
            sprint: 'ShiftLeft',
            crouch: 'ControlLeft',
            zoomIn: 'Equal',
            zoomOut: 'Minus',
            resetZoom: 'Digit0',
            toggleCameraLock: 'KeyC',
            menu: 'KeyM',
            quests: 'KeyJ',
            character: 'KeyP',
            map: 'KeyN',
            chat: 'KeyT',
            attack: 'Space',
            block: 'KeyQ',
            dodge: 'KeyX',
            useItem: 'KeyF',
            quickSlot1: 'Digit1',
            quickSlot2: 'Digit2',
            quickSlot3: 'Digit3',
            quickSlot4: 'Digit4',
            quickSlot5: 'Digit5',
            quickSlot6: 'Digit6',
            quickSlot7: 'Digit7',
            quickSlot8: 'Digit8',
            screenshot: 'F12',
            debug: 'F1',
            console: 'Backquote',
            toggleFullscreen: 'F11',
            toggleAudio: 'KeyK',
            volumeUp: 'BracketRight',
            volumeDown: 'BracketLeft',
            
            // Mouse Controls
            mouseLook: 'Mouse1',
            rightClick: 'Mouse2',
            mouseWheelUp: 'WheelUp',
            mouseWheelDown: 'WheelDown'
        };
    }

    updateKeybinds() {
        this.keybinds = this.loadKeybinds();
    }

    setupEventListeners() {
        // Keyboard events
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Mouse events
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;

            // Update last position for drag calculations
            this.mouse.lastPosition.x = this.mouse.x;
            this.mouse.lastPosition.y = this.mouse.y;
        });

        // Mouse drag events
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Left mouse button
                this.mouse.isDragging = true;
                this.mouse.dragStart.x = this.mouse.x;
                this.mouse.dragStart.y = this.mouse.y;
                this.canvas.style.cursor = 'grabbing';
            }
        });

        this.canvas.addEventListener('mouseup', (e) => {
            if (e.button === 0) { // Left mouse button
                this.mouse.isDragging = false;
                this.canvas.style.cursor = 'grab';
            }
        });

        // Mouse leave - stop dragging
        this.canvas.addEventListener('mouseleave', () => {
            this.mouse.isDragging = false;
            this.canvas.style.cursor = 'default';
        });

        // Mouse enter - set cursor
        this.canvas.addEventListener('mouseenter', () => {
            this.canvas.style.cursor = this.mouse.isDragging ? 'grabbing' : 'grab';
        });

        // Scroll wheel for zoom
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.mouse.scrollDelta = e.deltaY;
        });

        // Prevent context menu
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = touch.clientX - rect.left;
            this.mouse.y = touch.clientY - rect.top;
            this.mouse.isDragging = true;
            this.mouse.dragStart.x = this.mouse.x;
            this.mouse.dragStart.y = this.mouse.y;
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = touch.clientX - rect.left;
            this.mouse.y = touch.clientY - rect.top;
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.mouse.isDragging = false;
        });
    }

    isKeyPressed(keyCode) {
        return this.keys[keyCode] || false;
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

    // Check if any of multiple action keys are pressed
    isAnyActionPressed(actions) {
        return actions.some(action => this.isActionPressed(action));
    }

    // Get movement input vector - Fixed const assignment issue
    getMovementInput() {
        let x = 0;
        let y = 0;
        
        // Check primary movement keys
        if (this.isActionPressed('moveLeft') || this.isActionPressed('moveLeftAlt')) {
            x -= 1;
        }
        if (this.isActionPressed('moveRight') || this.isActionPressed('moveRightAlt')) {
            x += 1;
        }
        if (this.isActionPressed('moveUp') || this.isActionPressed('moveUpAlt')) {
            y -= 1;
        }
        if (this.isActionPressed('moveDown') || this.isActionPressed('moveDownAlt')) {
            y += 1;
        }
        
        // Add mobile D-pad input
        if (this.mobileDpad.left || this.mobileDpad.upLeft || this.mobileDpad.downLeft) {
            x -= 1;
        }
        if (this.mobileDpad.right || this.mobileDpad.upRight || this.mobileDpad.downRight) {
            x += 1;
        }
        if (this.mobileDpad.up || this.mobileDpad.upLeft || this.mobileDpad.upRight) {
            y -= 1;
        }
        if (this.mobileDpad.down || this.mobileDpad.downLeft || this.mobileDpad.downRight) {
            y += 1;
        }
        
        return { x, y };
    }

    // Check for specific game actions
    isPausePressed() { return this.isActionPressed('pause'); }
    isInventoryPressed() { return this.isActionPressed('inventory'); }
    isInteractPressed() { return this.isActionPressed('interact'); }
    isSprintPressed() { return this.isActionPressed('sprint'); }
    isCrouchPressed() { return this.isActionPressed('crouch'); }
    isAttackPressed() { return this.isActionPressed('attack'); }
    isBlockPressed() { return this.isActionPressed('block'); }
    isDodgePressed() { return this.isActionPressed('dodge'); }
    isUseItemPressed() { return this.isActionPressed('useItem'); }
    
    // Quick slot checks
    getQuickSlotPressed() {
        for (let i = 1; i <= 8; i++) {
            if (this.isActionPressed(`quickSlot${i}`)) {
                return i;
            }
        }
        return null;
    }

    // Camera controls
    isZoomInPressed() { return this.isActionPressed('zoomIn'); }
    isZoomOutPressed() { return this.isActionPressed('zoomOut'); }
    isResetZoomPressed() { return this.isActionPressed('resetZoom'); }
    isToggleCameraLockPressed() { return this.isActionPressed('toggleCameraLock'); }

    // UI controls
    isMenuPressed() { return this.isActionPressed('menu'); }
    isQuestsPressed() { return this.isActionPressed('quests'); }
    isCharacterPressed() { return this.isActionPressed('character'); }
    isMapPressed() { return this.isActionPressed('map'); }
    isChatPressed() { return this.isActionPressed('chat'); }

    // Utility controls
    isScreenshotPressed() { return this.isActionPressed('screenshot'); }
    isDebugPressed() { return this.isActionPressed('debug'); }
    isConsolePressed() { return this.isActionPressed('console'); }
    isToggleFullscreenPressed() { return this.isActionPressed('toggleFullscreen'); }
    isToggleAudioPressed() { return this.isActionPressed('toggleAudio'); }
    isVolumeUpPressed() { return this.isActionPressed('volumeUp'); }
    isVolumeDownPressed() { return this.isActionPressed('volumeDown'); }

    getKeys() {
        return { ...this.keys };
    }

    getMouse() {
        return { ...this.mouse };
    }

    // Get mouse drag delta for camera movement
    getDragDelta() {
        if (!this.mouse.isDragging) {
            return { x: 0, y: 0 };
        }
        return {
            x: this.mouse.x - this.mouse.dragStart.x,
            y: this.mouse.y - this.mouse.dragStart.y
        };
    }

    // Reset drag start position (called when camera snaps back)
    resetDragStart() {
        this.mouse.dragStart.x = this.mouse.x;
        this.mouse.dragStart.y = this.mouse.y;
    }

    // Get scroll wheel delta for zoom
    getScrollDelta() {
        const delta = this.mouse.scrollDelta || 0;
        this.mouse.scrollDelta = 0; // Reset after reading
        return delta;
    }

    setupGamepad() {
        console.log('Gamepad support not yet implemented');
    }

    // Mobile D-pad control methods
    setMobileDpadState(direction, pressed) {
        if (this.mobileDpad.hasOwnProperty(direction)) {
            this.mobileDpad[direction] = pressed;
        }
    }
    
    getMobileDpadState() {
        return { ...this.mobileDpad };
    }
    
    resetMobileDpad() {
        Object.keys(this.mobileDpad).forEach(key => {
            this.mobileDpad[key] = false;
        });
    }
    
    // Chat input control methods
    setChatOpen(isOpen) {
        this.isChatOpen = isOpen;
    }
    
    isChatInputBlocked() {
        return this.isChatOpen;
    }

    cleanup() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
    }
}

