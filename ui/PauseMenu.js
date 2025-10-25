class PauseMenu {
    constructor(game) {
        this.game = game;
        this.menu = null;
        this.isVisible = false;
        this.boundHandlers = {}; // ✅ SECURITY FIX (VULN-011): Store bound handlers
        this.listenersAttached = false; // ✅ Track listener state
        this.createMenu();
        this.setupEventListeners();
    }

    createMenu() {
        // Create pause menu overlay
        this.menu = document.createElement('div');
        this.menu.id = 'pauseMenu';
        this.menu.className = 'game-pause-menu';
        this.menu.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: rgba(0, 0, 0, 0.8) !important;
            display: none !important;
            visibility: hidden !important;
            z-index: 99999 !important;
            font-family: 'Courier New', monospace !important;
            pointer-events: auto !important;
        `;
        
        // Add a global click listener to handle all button clicks using event delegation
        this.menu.addEventListener('click', (e) => {
            console.log('PauseMenu: Menu container click detected!', e.target, e.target.id);
            
            // Handle button clicks using event delegation
            if (e.target.id === 'resumeBtn') {
                console.log('PauseMenu: Resume button clicked via delegation!');
                e.preventDefault();
                e.stopPropagation();
                this.resume();
            } else if (e.target.id === 'saveBtn') {
                console.log('PauseMenu: Save button clicked via delegation!');
                e.preventDefault();
                e.stopPropagation();
                this.saveGame();
            } else if (e.target.id === 'quitBtn') {
                console.log('PauseMenu: Quit button clicked via delegation!');
                e.preventDefault();
                e.stopPropagation();
                this.quitToMenu();
            }
        });

        // Create pause menu content
        this.menu.innerHTML = `
            <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #2a2a3e;
                padding: 40px;
                border-radius: 10px;
                text-align: center;
                border: 2px solid #4a7c59;
                box-shadow: 0 0 20px rgba(74, 124, 89, 0.5);
            ">
                <h2 style="color: #a8e6cf; margin-bottom: 30px; font-size: 28px;">GAME PAUSED</h2>

                <div style="margin-bottom: 20px;">
                    <button id="resumeBtn" style="
                        background: #4a7c59;
                        color: white;
                        border: none;
                        padding: 15px 30px;
                        margin: 10px;
                        font-size: 18px;
                        cursor: pointer;
                        border-radius: 5px;
                        font-family: inherit;
                    ">▶ RESUME</button>
                </div>

                <div style="margin-bottom: 20px;">
                    <button id="saveBtn" style="
                        background: #d4af37;
                        color: #1a1a2e;
                        border: none;
                        padding: 15px 30px;
                        margin: 10px;
                        font-size: 18px;
                        cursor: pointer;
                        border-radius: 5px;
                        font-family: inherit;
                        font-weight: bold;
                    ">💾 SAVE GAME</button>
                </div>

                <div>
                    <button id="quitBtn" style="
                        background: #d2691e;
                        color: white;
                        border: none;
                        padding: 15px 30px;
                        margin: 10px;
                        font-size: 18px;
                        cursor: pointer;
                        border-radius: 5px;
                        font-family: inherit;
                    ">🏠 QUIT TO MENU</button>
                </div>

                <div id="saveMessage" style="
                    color: #4ade80;
                    margin-top: 20px;
                    font-size: 14px;
                    display: none;
                ">Game saved!</div>
            </div>
        `;

        // Add pause menu to DOM
        document.body.appendChild(this.menu);
    }

    setupEventListeners() {
        // ✅ SECURITY FIX (VULN-011): Fix memory leak from duplicate event listeners
        
        // Create bound handlers once and store them
        this.boundHandlers.resume = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('PauseMenu: Resume button clicked!');
            this.resume();
        };
        
        this.boundHandlers.save = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('PauseMenu: Save button clicked!');
            this.saveGame();
        };
        
        this.boundHandlers.quit = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('PauseMenu: Quit button clicked!');
            this.quitToMenu();
        };
        
        // Wait a bit for DOM to be ready
        setTimeout(() => {
            // Only attach listeners once
            if (this.listenersAttached) {
                console.log('PauseMenu: Event listeners already attached, skipping...');
                return;
            }
            
            const resumeBtn = document.getElementById('resumeBtn');
            const saveBtn = document.getElementById('saveBtn');
            const quitBtn = document.getElementById('quitBtn');

            console.log('PauseMenu: Setting up event listeners...');
            console.log('PauseMenu: Resume button found:', !!resumeBtn);
            console.log('PauseMenu: Save button found:', !!saveBtn);
            console.log('PauseMenu: Quit button found:', !!quitBtn);

            // Add listeners only once
            if (resumeBtn) {
                resumeBtn.addEventListener('click', this.boundHandlers.resume);
                console.log('PauseMenu: Resume button listener attached');
            } else {
                console.error('PauseMenu: Resume button not found!');
            }

            if (saveBtn) {
                saveBtn.addEventListener('click', this.boundHandlers.save);
                console.log('PauseMenu: Save button listener attached');
            } else {
                console.error('PauseMenu: Save button not found!');
            }

            if (quitBtn) {
                quitBtn.addEventListener('click', this.boundHandlers.quit);
                console.log('PauseMenu: Quit button listener attached');
            } else {
                console.error('PauseMenu: Quit button not found!');
            }
            
            this.listenersAttached = true;
            console.log('PauseMenu: All event listeners attached successfully');
        }, 200);
    }

    show() {
        this.isVisible = true;
        if (this.menu) {
            this.menu.style.display = 'block';
            this.menu.style.visibility = 'visible';
        }
    }

    hide() {
        this.isVisible = false;
        if (this.menu) {
            this.menu.style.display = 'none';
            this.menu.style.visibility = 'hidden';
        }
    }

    resume() {
        console.log('PauseMenu: resume() method called');
        this.hide();
        this.game.resume();
        console.log('PauseMenu: Game resumed successfully');
    }

    saveGame() {
        const success = this.game.saveGame();
        if (success) {
            // Show save confirmation message
            const saveMessage = document.getElementById('saveMessage');
            if (saveMessage) {
                saveMessage.style.display = 'block';
                setTimeout(() => {
                    saveMessage.style.display = 'none';
                }, 2000);
            }
        }
    }

    quitToMenu() {
        console.log('PauseMenu: quitToMenu() method called');
        // Auto-save before quitting
        this.game.autoSave();
        this.hide();
        // Navigate back to main menu
        console.log('PauseMenu: Navigating to assets/menu.html');
        window.location.href = 'assets/menu.html';
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
            this.game.resume();
        } else {
            this.show();
            this.game.pause();
        }
    }

    /**
     * ✅ SECURITY FIX (VULN-011): Cleanup method to prevent memory leaks
     * Call this when destroying the pause menu instance
     */
    destroy() {
        // Remove event listeners using stored bound handlers
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
        
        // Remove menu from DOM
        if (this.menu && this.menu.parentElement) {
            this.menu.remove();
        }
        
        // Clear state
        this.listenersAttached = false;
        this.boundHandlers = {};
        
        console.log('PauseMenu: Cleanup complete');
    }
}

export default PauseMenu;
