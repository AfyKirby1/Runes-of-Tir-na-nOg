// SettingsPanel Component
// Manages the settings modal overlay and navigation between setting categories

export class SettingsPanel {
    constructor() {
        this.isOpen = false;
        this.currentCategory = 'video';
        this.categories = {
            video: null,    // Will be set by VideoSettings
            gameplay: null, // Will be set by GameplaySettings
            keybinds: null  // Will be set by KeybindSettings
        };
        this.createModal();
        this.setupEventListeners();
    }

    createModal() {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.id = 'settingsModal';
        modal.className = 'settings-modal';
        modal.innerHTML = `
            <div class="settings-content">
                <div class="settings-header">
                    <h2>⚙ Settings</h2>
                    <button class="close-btn" id="closeSettings">✖</button>
                </div>
                
                <div class="settings-nav">
                    <button class="nav-btn active" data-category="video">🖥️ Video</button>
                    <button class="nav-btn" data-category="gameplay">🎮 Gameplay</button>
                    <button class="nav-btn" data-category="keybinds">⌨️ Keybinds</button>
                </div>
                
                <div class="settings-body" id="settingsBody">
                    <!-- Settings categories will be injected here -->
                </div>
                
                <div class="settings-footer">
                    <button class="menu-button" id="saveSettings">💾 Save Settings</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    setupEventListeners() {
        const modal = document.getElementById('settingsModal');
        const closeBtn = document.getElementById('closeSettings');
        const saveBtn = document.getElementById('saveSettings');

        // Close button
        closeBtn.addEventListener('click', () => this.close());

        // Close when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.close();
            }
        });

        // Save button
        saveBtn.addEventListener('click', () => this.save());
        
        // Category navigation
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.switchCategory(category);
            });
        });
    }

    registerCategory(name, categoryInstance) {
        this.categories[name] = categoryInstance;
    }

    open() {
        this.isOpen = true;
        const modal = document.getElementById('settingsModal');
        modal.classList.add('active');
        this.loadSettings();
        this.renderCurrentCategory();
    }

    close() {
        this.isOpen = false;
        const modal = document.getElementById('settingsModal');
        modal.classList.remove('active');
    }

    loadSettings() {
        // Load settings for all registered categories
        for (const category in this.categories) {
            if (this.categories[category]) {
                this.categories[category].load();
            }
        }
    }

    save() {
        // Save settings for all registered categories
        let savedSettings = [];
        for (const category in this.categories) {
            if (this.categories[category]) {
                const result = this.categories[category].save();
                if (result) {
                    savedSettings.push(result);
                }
            }
        }

        // Show confirmation
        const message = savedSettings.length > 0 
            ? `Settings saved!\n\n${savedSettings.join('\n')}\n\nRestart your game for changes to take effect.`
            : 'Settings saved!';
        
        alert(message);
        this.close();
    }

    switchCategory(category) {
        // Update active nav button
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        // Switch category
        this.currentCategory = category;
        this.renderCurrentCategory();
    }

    renderCurrentCategory() {
        const body = document.getElementById('settingsBody');
        body.innerHTML = '';
        
        // Render the current category
        if (this.categories[this.currentCategory]) {
            const categoryContent = this.categories[this.currentCategory].render();
            body.appendChild(categoryContent);
        }
    }

    getStyles() {
        return `
            /* Settings Modal */
            .settings-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 1000;
                justify-content: center;
                align-items: center;
            }

            .settings-modal.active {
                display: flex;
            }

            .settings-content {
                background: linear-gradient(145deg, #1a1a2e, #0f0f1a);
                border: 3px solid #d4af37;
                border-radius: 10px;
                padding: 30px;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 0 30px rgba(212, 175, 55, 0.3);
            }

            .settings-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #d4af37;
                padding-bottom: 15px;
            }

            .settings-header h2 {
                font-size: 32px;
                color: #d4af37;
                margin: 0;
            }

            .close-btn {
                background: transparent;
                border: 2px solid #8b7355;
                color: #d4af37;
                font-size: 24px;
                cursor: pointer;
                padding: 5px 15px;
                border-radius: 5px;
                transition: all 0.3s;
            }

            .close-btn:hover {
                background: #d4af37;
                color: #0a0a0a;
                border-color: #d4af37;
            }

            .settings-body {
                margin-bottom: 30px;
            }

            .settings-section {
                margin-bottom: 30px;
            }

            .settings-section h3 {
                font-size: 24px;
                color: #c4a57b;
                margin-bottom: 20px;
            }

            .setting-item {
                margin-bottom: 25px;
            }

            .setting-item label {
                display: block;
                font-size: 18px;
                color: #d4af37;
                margin-bottom: 10px;
            }

            .slider-container {
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .slider-container input[type="range"] {
                flex: 1;
                height: 8px;
                background: #2a2a3a;
                border-radius: 5px;
                outline: none;
                cursor: pointer;
            }

            .slider-container input[type="range"]::-webkit-slider-thumb {
                appearance: none;
                width: 20px;
                height: 20px;
                background: #d4af37;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
            }

            .slider-container input[type="range"]::-moz-range-thumb {
                width: 20px;
                height: 20px;
                background: #d4af37;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
                border: none;
            }

            .slider-container span {
                min-width: 100px;
                font-size: 16px;
                color: #c4a57b;
                font-weight: bold;
            }

            .setting-description {
                font-size: 14px;
                color: #8b7355;
                margin-top: 8px;
                font-style: italic;
            }

            .settings-nav {
                display: flex;
                gap: 10px;
                margin-bottom: 25px;
                padding-bottom: 15px;
                border-bottom: 2px solid #8b7355;
            }

            .nav-btn {
                background: linear-gradient(145deg, #2a2a3e, #1a1a2e);
                border: 2px solid #8b7355;
                color: #8b7355;
                padding: 12px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                font-weight: bold;
                transition: all 0.3s ease;
                text-transform: uppercase;
                letter-spacing: 1px;
            }

            .nav-btn:hover {
                background: linear-gradient(145deg, #3a3a4e, #2a2a3e);
                border-color: #d4af37;
                color: #d4af37;
                transform: translateY(-2px);
            }

            .nav-btn.active {
                background: linear-gradient(145deg, #8b5a2b, #654321);
                border-color: #d4af37;
                color: #d4af37;
                box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
            }

            .settings-footer {
                text-align: center;
                padding-top: 20px;
                border-top: 2px solid #8b7355;
            }
        `;
    }
}

