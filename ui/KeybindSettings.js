// KeybindSettings Component
// Manages all game keybinds and controls customization

import { SecurityUtils } from '../utils/SecurityUtils.js';

export class KeybindSettings {
    // ✅ SECURITY FIX (VULN-005): Whitelist of valid key codes
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
    
    constructor() {
        this.defaultKeybinds = {
            // Movement
            moveUp: 'KeyW',
            moveDown: 'KeyS',
            moveLeft: 'KeyA',
            moveRight: 'KeyD',
            
            // Alternative Movement (Arrow Keys)
            moveUpAlt: 'ArrowUp',
            moveDownAlt: 'ArrowDown',
            moveLeftAlt: 'ArrowLeft',
            moveRightAlt: 'ArrowRight',
            
            // Game Controls
            pause: 'Escape',
            inventory: 'KeyI',
            interact: 'KeyE',
            sprint: 'ShiftLeft',
            crouch: 'ControlLeft',
            
            // Camera Controls
            zoomIn: 'Equal',
            zoomOut: 'Minus',
            resetZoom: 'Digit0',
            toggleCameraLock: 'KeyC',
            
            // UI Controls
            menu: 'KeyM',
            quests: 'KeyJ',
            character: 'KeyP',
            map: 'KeyN',
            chat: 'KeyT',
            
            // Combat
            attack: 'Space',
            block: 'KeyQ',
            dodge: 'KeyX',
            useItem: 'KeyF',
            
            // Quick Slots
            quickSlot1: 'Digit1',
            quickSlot2: 'Digit2',
            quickSlot3: 'Digit3',
            quickSlot4: 'Digit4',
            quickSlot5: 'Digit5',
            quickSlot6: 'Digit6',
            quickSlot7: 'Digit7',
            quickSlot8: 'Digit8',
            
            // Utility
            screenshot: 'F12',
            debug: 'F1',
            console: 'Backquote',
            toggleFullscreen: 'F11',
            
            // Mouse Controls
            mouseLook: 'Mouse1',
            rightClick: 'Mouse2',
            mouseWheelUp: 'WheelUp',
            mouseWheelDown: 'WheelDown',
            
            // Audio
            toggleAudio: 'KeyK',
            volumeUp: 'BracketRight',
            volumeDown: 'BracketLeft'
        };
        
        this.keybinds = { ...this.defaultKeybinds };
        this.loadKeybinds();
        
        // Key capture state
        this.isCapturing = false;
        this.capturingFor = null;
    }

    load() {
        this.loadKeybinds();
    }

    loadKeybinds() {
        // ✅ SECURITY FIX (VULN-005): Validate keybinds to prevent prototype pollution and injection
        const saved = localStorage.getItem('gameKeybinds');
        if (saved) {
            try {
                const parsed = SecurityUtils.safeJSONParse(saved, null);
                
                // Validate object type
                if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
                    console.error('Invalid keybinds format');
                    this.keybinds = { ...this.defaultKeybinds };
                    return;
                }
                
                // ✅ Validate each keybind against whitelist
                const validated = {};
                for (const [action, keyCode] of Object.entries(parsed)) {
                    // Prevent prototype pollution attacks
                    if (action === '__proto__' || action === 'constructor' || action === 'prototype') {
                        console.warn('🚨 SECURITY: Blocked prototype pollution attempt');
                        continue;
                    }
                    
                    // Only allow actions that exist in defaults
                    if (!(action in this.defaultKeybinds)) {
                        console.warn(`Unknown keybind action: ${action}`);
                        continue;
                    }
                    
                    // Only allow whitelisted key codes
                    if (typeof keyCode === 'string' && KeybindSettings.VALID_KEY_CODES.has(keyCode)) {
                        validated[action] = keyCode;
                    } else {
                        console.warn(`Invalid key code for ${action}: ${keyCode}`);
                        // Use default for this action
                        validated[action] = this.defaultKeybinds[action];
                        // Clear invalid keybind from storage
                        this.clearInvalidKeybind(action);
                    }
                }
                
                // Merge validated keybinds with defaults
                this.keybinds = { ...this.defaultKeybinds, ...validated };
                
            } catch (e) {
                console.error('Failed to load keybinds:', e);
                this.keybinds = { ...this.defaultKeybinds };
            }
        }
    }

    save() {
        // Save to localStorage
        localStorage.setItem('gameKeybinds', JSON.stringify(this.keybinds));
        
        // Return confirmation message
        return `Keybinds saved successfully!`;
    }

    clearInvalidKeybind(action) {
        try {
            const stored = localStorage.getItem('gameKeybinds');
            if (stored) {
                const keybinds = JSON.parse(stored);
                delete keybinds[action];
                localStorage.setItem('gameKeybinds', JSON.stringify(keybinds));
                console.log(`Cleared invalid keybind for ${action}`);
            }
        } catch (e) {
            console.error('Failed to clear invalid keybind:', e);
        }
    }

    resetToDefaults() {
        this.keybinds = { ...this.defaultKeybinds };
        this.save();
        return `Keybinds reset to defaults!`;
    }

    render() {
        const container = document.createElement('div');
        container.className = 'settings-section';
        
        container.innerHTML = `
            <div class="keybind-header">
                <h3>⌨️ Keybind Settings</h3>
                <button class="reset-btn" id="resetKeybinds">🔄 Reset to Defaults</button>
            </div>
            
            <div class="keybind-categories">
                ${this.renderMovementKeybinds()}
                ${this.renderGameControlsKeybinds()}
                ${this.renderCameraKeybinds()}
                ${this.renderUIKeybinds()}
                ${this.renderCombatKeybinds()}
                ${this.renderQuickSlots()}
                ${this.renderUtilityKeybinds()}
                ${this.renderAudioKeybinds()}
            </div>
        `;

        // Setup event listeners
        setTimeout(() => {
            this.setupEventListeners();
        }, 0);

        return container;
    }

    renderMovementKeybinds() {
        return `
            <div class="keybind-category">
                <h4>🚶 Movement</h4>
                <div class="keybind-grid">
                    ${this.renderKeybindItem('moveUp', 'Move Up', this.keybinds.moveUp)}
                    ${this.renderKeybindItem('moveDown', 'Move Down', this.keybinds.moveDown)}
                    ${this.renderKeybindItem('moveLeft', 'Move Left', this.keybinds.moveLeft)}
                    ${this.renderKeybindItem('moveRight', 'Move Right', this.keybinds.moveRight)}
                    ${this.renderKeybindItem('sprint', 'Sprint', this.keybinds.sprint)}
                    ${this.renderKeybindItem('crouch', 'Crouch', this.keybinds.crouch)}
                </div>
            </div>
        `;
    }

    renderGameControlsKeybinds() {
        return `
            <div class="keybind-category">
                <h4>🎮 Game Controls</h4>
                <div class="keybind-grid">
                    ${this.renderKeybindItem('pause', 'Pause Game', this.keybinds.pause)}
                    ${this.renderKeybindItem('inventory', 'Open Inventory', this.keybinds.inventory)}
                    ${this.renderKeybindItem('interact', 'Interact (COMING SOON!)', this.keybinds.interact, true)}
                    ${this.renderKeybindItem('menu', 'Main Menu (COMING SOON!)', this.keybinds.menu, true)}
                </div>
            </div>
        `;
    }

    renderCameraKeybinds() {
        return `
            <div class="keybind-category">
                <h4>📷 Camera</h4>
                <div class="keybind-grid">
                    ${this.renderKeybindItem('zoomIn', 'Zoom In (COMING SOON!)', this.keybinds.zoomIn, true)}
                    ${this.renderKeybindItem('zoomOut', 'Zoom Out (COMING SOON!)', this.keybinds.zoomOut, true)}
                    ${this.renderKeybindItem('resetZoom', 'Reset Zoom (COMING SOON!)', this.keybinds.resetZoom, true)}
                    ${this.renderKeybindItem('toggleCameraLock', 'Toggle Camera Lock (COMING SOON!)', this.keybinds.toggleCameraLock, true)}
                </div>
            </div>
        `;
    }

    renderUIKeybinds() {
        return `
            <div class="keybind-category">
                <h4>🖥️ User Interface</h4>
                <div class="keybind-grid">
                    ${this.renderKeybindItem('quests', 'Quest Log (COMING SOON!)', this.keybinds.quests, true)}
                    ${this.renderKeybindItem('character', 'Character Panel (COMING SOON!)', this.keybinds.character, true)}
                    ${this.renderKeybindItem('map', 'World Map (COMING SOON!)', this.keybinds.map, true)}
                    ${this.renderKeybindItem('chat', 'Chat/Console (COMING SOON!)', this.keybinds.chat, true)}
                </div>
            </div>
        `;
    }

    renderCombatKeybinds() {
        return `
            <div class="keybind-category">
                <h4>⚔️ Combat</h4>
                <div class="keybind-grid">
                    ${this.renderKeybindItem('attack', 'Attack (COMING SOON!)', this.keybinds.attack, true)}
                    ${this.renderKeybindItem('block', 'Block/Parry (COMING SOON!)', this.keybinds.block, true)}
                    ${this.renderKeybindItem('dodge', 'Dodge Roll (COMING SOON!)', this.keybinds.dodge, true)}
                    ${this.renderKeybindItem('useItem', 'Use Item (COMING SOON!)', this.keybinds.useItem, true)}
                </div>
            </div>
        `;
    }

    renderQuickSlots() {
        return `
            <div class="keybind-category">
                <h4>🎯 Quick Slots</h4>
                <div class="keybind-grid">
                    ${this.renderKeybindItem('quickSlot1', 'Quick Slot 1 (COMING SOON!)', this.keybinds.quickSlot1, true)}
                    ${this.renderKeybindItem('quickSlot2', 'Quick Slot 2 (COMING SOON!)', this.keybinds.quickSlot2, true)}
                    ${this.renderKeybindItem('quickSlot3', 'Quick Slot 3 (COMING SOON!)', this.keybinds.quickSlot3, true)}
                    ${this.renderKeybindItem('quickSlot4', 'Quick Slot 4 (COMING SOON!)', this.keybinds.quickSlot4, true)}
                    ${this.renderKeybindItem('quickSlot5', 'Quick Slot 5 (COMING SOON!)', this.keybinds.quickSlot5, true)}
                    ${this.renderKeybindItem('quickSlot6', 'Quick Slot 6 (COMING SOON!)', this.keybinds.quickSlot6, true)}
                    ${this.renderKeybindItem('quickSlot7', 'Quick Slot 7 (COMING SOON!)', this.keybinds.quickSlot7, true)}
                    ${this.renderKeybindItem('quickSlot8', 'Quick Slot 8 (COMING SOON!)', this.keybinds.quickSlot8, true)}
                </div>
            </div>
        `;
    }

    renderUtilityKeybinds() {
        return `
            <div class="keybind-category">
                <h4>🛠️ Utility</h4>
                <div class="keybind-grid">
                    ${this.renderKeybindItem('screenshot', 'Screenshot', this.keybinds.screenshot)}
                    ${this.renderKeybindItem('debug', 'Debug Info', this.keybinds.debug)}
                    ${this.renderKeybindItem('console', 'Developer Console (COMING SOON!)', this.keybinds.console, true)}
                    ${this.renderKeybindItem('toggleFullscreen', 'Toggle Fullscreen (COMING SOON!)', this.keybinds.toggleFullscreen, true)}
                </div>
            </div>
        `;
    }

    renderAudioKeybinds() {
        return `
            <div class="keybind-category">
                <h4>🔊 Audio</h4>
                <div class="keybind-grid">
                    ${this.renderKeybindItem('toggleAudio', 'Toggle Audio', this.keybinds.toggleAudio)}
                    ${this.renderKeybindItem('volumeUp', 'Volume Up (COMING SOON!)', this.keybinds.volumeUp, true)}
                    ${this.renderKeybindItem('volumeDown', 'Volume Down (COMING SOON!)', this.keybinds.volumeDown, true)}
                </div>
            </div>
        `;
    }

    renderKeybindItem(key, label, currentKey, isComingSoon = false) {
        const keyDisplay = this.formatKeyDisplay(currentKey);
        const comingSoonClass = isComingSoon ? 'coming-soon' : '';
        const disabledAttr = isComingSoon ? 'disabled' : '';
        
        return `
            <div class="keybind-item ${comingSoonClass}">
                <label>${label}</label>
                <button class="keybind-btn" data-key="${key}" ${disabledAttr}>
                    ${keyDisplay}
                </button>
            </div>
        `;
    }

    formatKeyDisplay(keyCode) {
        const keyMap = {
            'KeyW': 'W', 'KeyA': 'A', 'KeyS': 'S', 'KeyD': 'D',
            'KeyE': 'E', 'KeyF': 'F', 'KeyG': 'G', 'KeyH': 'H',
            'KeyI': 'I', 'KeyJ': 'J', 'KeyK': 'K', 'KeyL': 'L',
            'KeyM': 'M', 'KeyN': 'N', 'KeyP': 'P', 'KeyQ': 'Q',
            'KeyR': 'R', 'KeyT': 'T', 'KeyU': 'U', 'KeyV': 'V',
            'KeyX': 'X', 'KeyY': 'Y', 'KeyZ': 'Z',
            'Digit0': '0', 'Digit1': '1', 'Digit2': '2', 'Digit3': '3',
            'Digit4': '4', 'Digit5': '5', 'Digit6': '6', 'Digit7': '7',
            'Digit8': '8', 'Digit9': '9',
            'ArrowUp': '↑', 'ArrowDown': '↓', 'ArrowLeft': '←', 'ArrowRight': '→',
            'ShiftLeft': 'L Shift', 'ShiftRight': 'R Shift',
            'ControlLeft': 'L Ctrl', 'ControlRight': 'R Ctrl',
            'AltLeft': 'L Alt', 'AltRight': 'R Alt',
            'Space': 'Space', 'Enter': 'Enter', 'Escape': 'Esc',
            'Tab': 'Tab', 'Backspace': 'Backspace', 'Delete': 'Del',
            'Insert': 'Ins', 'Home': 'Home', 'End': 'End',
            'PageUp': 'PgUp', 'PageDown': 'PgDown',
            'Equal': '=', 'Minus': '-', 'BracketLeft': '[', 'BracketRight': ']',
            'Semicolon': ';', 'Quote': "'", 'Backslash': '\\',
            'Comma': ',', 'Period': '.', 'Slash': '/',
            'Backquote': '`', 'F1': 'F1', 'F2': 'F2', 'F3': 'F3',
            'F4': 'F4', 'F5': 'F5', 'F6': 'F6', 'F7': 'F7',
            'F8': 'F8', 'F9': 'F9', 'F10': 'F10', 'F11': 'F11', 'F12': 'F12',
            'Mouse1': 'LMB', 'Mouse2': 'RMB', 'Mouse3': 'MMB',
            'WheelUp': 'Wheel↑', 'WheelDown': 'Wheel↓'
        };
        
        return keyMap[keyCode] || keyCode;
    }

    setupEventListeners() {
        // Keybind buttons (only enabled ones)
        const keybindButtons = document.querySelectorAll('.keybind-btn:not([disabled])');
        keybindButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.startKeyCapture(e.target);
            });
        });

        // Reset button
        const resetBtn = document.getElementById('resetKeybinds');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Reset all keybinds to defaults?')) {
                    this.resetToDefaults();
                    // Re-render the panel
                    const container = document.querySelector('.settings-section');
                    if (container) {
                        container.innerHTML = this.render().innerHTML;
                        this.setupEventListeners();
                    }
                }
            });
        }

        // Global key capture
        document.addEventListener('keydown', (e) => {
            if (this.isCapturing) {
                e.preventDefault();
                this.captureKey(e.code);
            }
        });

        document.addEventListener('click', (e) => {
            if (this.isCapturing && !e.target.classList.contains('keybind-btn')) {
                this.cancelKeyCapture();
            }
        });
    }

    startKeyCapture(button) {
        this.isCapturing = true;
        this.capturingFor = button.dataset.key;
        
        // Visual feedback
        button.textContent = 'Press a key...';
        button.classList.add('capturing');
        
        // Remove capturing state from other buttons
        document.querySelectorAll('.keybind-btn').forEach(btn => {
            if (btn !== button) {
                btn.classList.remove('capturing');
            }
        });
    }

    captureKey(keyCode) {
        if (!this.isCapturing || !this.capturingFor) return;

        // Update the keybind
        this.keybinds[this.capturingFor] = keyCode;
        
        // Update the button display
        const button = document.querySelector(`[data-key="${this.capturingFor}"]`);
        if (button) {
            button.textContent = this.formatKeyDisplay(keyCode);
            button.classList.remove('capturing');
        }

        // Reset capture state
        this.isCapturing = false;
        this.capturingFor = null;
    }

    cancelKeyCapture() {
        if (this.isCapturing) {
            const button = document.querySelector(`[data-key="${this.capturingFor}"]`);
            if (button) {
                button.textContent = this.formatKeyDisplay(this.keybinds[this.capturingFor]);
                button.classList.remove('capturing');
            }
            
            this.isCapturing = false;
            this.capturingFor = null;
        }
    }

    getKeybind(action) {
        return this.keybinds[action] || null;
    }

    setKeybind(action, keyCode) {
        this.keybinds[action] = keyCode;
    }

    getKeybinds() {
        return { ...this.keybinds };
    }

    getStyles() {
        return `
            .keybind-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 25px;
                padding-bottom: 15px;
                border-bottom: 2px solid #8b7355;
            }

            .keybind-header h3 {
                margin: 0;
                color: #d4af37;
                font-size: 24px;
            }

            .reset-btn {
                background: linear-gradient(145deg, #5a2d2d, #3a1a1a);
                border: 2px solid #ef4444;
                color: #ef4444;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: bold;
                transition: all 0.3s ease;
            }

            .reset-btn:hover {
                background: linear-gradient(145deg, #6a3d3d, #4a2a2a);
                border-color: #f87171;
                color: #f87171;
                transform: translateY(-1px);
            }

            .keybind-categories {
                display: flex;
                flex-direction: column;
                gap: 25px;
            }

            .keybind-category {
                background: rgba(26, 26, 46, 0.4);
                border: 2px solid rgba(212, 175, 55, 0.3);
                border-radius: 8px;
                padding: 20px;
            }

            .keybind-category h4 {
                color: #c4a57b;
                margin: 0 0 15px 0;
                font-size: 18px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }

            .keybind-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 12px;
            }

            .keybind-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 15px;
                background: rgba(15, 15, 30, 0.6);
                border: 1px solid rgba(212, 175, 55, 0.2);
                border-radius: 6px;
                transition: all 0.3s ease;
            }

            .keybind-item:hover {
                background: rgba(139, 90, 43, 0.2);
                border-color: rgba(212, 175, 55, 0.4);
            }

            .keybind-item label {
                color: #d4af37;
                font-size: 14px;
                font-weight: 500;
                margin: 0;
            }

            .keybind-btn {
                background: linear-gradient(145deg, #2a2a3e, #1a1a2e);
                border: 2px solid #d4af37;
                color: #d4af37;
                padding: 6px 12px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 12px;
                font-weight: bold;
                min-width: 60px;
                transition: all 0.3s ease;
                text-transform: uppercase;
            }

            .keybind-btn:hover {
                background: linear-gradient(145deg, #3a3a4e, #2a2a3e);
                border-color: #ffd700;
                color: #ffd700;
                transform: translateY(-1px);
            }

            .keybind-btn.capturing {
                background: linear-gradient(145deg, #2d5a2d, #1a3a1a);
                border-color: #4ade80;
                color: #4ade80;
                animation: pulse 1s infinite;
            }

            .keybind-btn[disabled] {
                background: linear-gradient(145deg, #1a1a2e, #0f0f1a);
                border-color: #4a4a5a;
                color: #6a6a7a;
                cursor: not-allowed;
                opacity: 0.6;
            }

            .keybind-btn[disabled]:hover {
                background: linear-gradient(145deg, #1a1a2e, #0f0f1a);
                border-color: #4a4a5a;
                color: #6a6a7a;
                transform: none;
            }

            .keybind-item.coming-soon {
                opacity: 0.7;
                position: relative;
            }

            .keybind-item.coming-soon::after {
                content: "🚧";
                position: absolute;
                top: -5px;
                right: -5px;
                font-size: 12px;
                color: #ffa500;
                background: rgba(0, 0, 0, 0.8);
                border-radius: 50%;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }

            /* Responsive adjustments */
            @media (max-width: 768px) {
                .keybind-grid {
                    grid-template-columns: 1fr;
                }
                
                .keybind-header {
                    flex-direction: column;
                    gap: 10px;
                    align-items: flex-start;
                }
            }
        `;
    }
}

