// VideoSettings Component
// Manages all video-related game settings (render distance, graphics quality, etc.)

export class VideoSettings {
    constructor() {
        this.renderDistance = 32; // Default
        this.fogIntensity = 75; // Default 75%
        this.showGrid = true; // Default grid lines enabled
        this.renderDistanceSlider = null;
        this.renderDistanceValue = null;
        this.fogSlider = null;
        this.fogValue = null;
        this.gridToggle = null;
    }

    load() {
        // ✅ SECURITY FIX (VULN-013): Validate settings from localStorage
        
        // Load and validate render distance
        const renderDistanceRaw = localStorage.getItem('renderDistance');
        if (renderDistanceRaw) {
            const parsed = parseInt(renderDistanceRaw);
            const validDistances = [16, 32, 48, 64, 80, 96, 112, 128];
            
            // Must be integer, in range, and one of the valid steps
            if (Number.isInteger(parsed) && 
                parsed >= 16 && 
                parsed <= 128 && 
                validDistances.includes(parsed)) {
                this.renderDistance = parsed;
            } else {
                console.warn(`Invalid render distance: ${renderDistanceRaw}, using default`);
                this.renderDistance = 32;
            }
        }
        
        // Load and validate fog intensity
        const fogIntensityRaw = localStorage.getItem('fogIntensity');
        if (fogIntensityRaw) {
            const parsed = parseInt(fogIntensityRaw);
            
            // Must be integer between 0-100
            if (Number.isInteger(parsed) && parsed >= 0 && parsed <= 100) {
                this.fogIntensity = parsed;
            } else {
                console.warn(`Invalid fog intensity: ${fogIntensityRaw}, using default`);
                this.fogIntensity = 75;
            }
        }
        
        // Load and validate grid setting
        const showGridRaw = localStorage.getItem('showGrid');
        if (showGridRaw !== null) {
            this.showGrid = showGridRaw === 'true';
        }
    }

    save() {
        // Save to localStorage
        localStorage.setItem('renderDistance', this.renderDistance);
        localStorage.setItem('fogIntensity', this.fogIntensity);
        localStorage.setItem('showGrid', this.showGrid);
        
        // Return confirmation message
        return `Render Distance: ${this.renderDistance}x${this.renderDistance} tiles\nFog Intensity: ${this.fogIntensity}%\nGrid Lines: ${this.showGrid ? 'ON' : 'OFF'}`;
    }

    render() {
        const container = document.createElement('div');
        container.className = 'settings-section';
        container.innerHTML = `
            <h3>🖥️ Video Settings</h3>
            
            <div class="setting-item">
                <label for="renderDistance">Render Distance:</label>
                <div class="slider-container">
                    <input type="range" id="renderDistance" min="16" max="128" value="${this.renderDistance}" step="16">
                    <span id="renderDistanceValue">${this.renderDistance}x${this.renderDistance} tiles</span>
                </div>
                <p class="setting-description">Lower values improve performance on slower devices</p>
            </div>

            <div class="setting-item">
                <label for="fogIntensity">Edge Fog Intensity:</label>
                <div class="slider-container">
                    <input type="range" id="fogIntensity" min="0" max="100" value="${this.fogIntensity}" step="5">
                    <span id="fogIntensityValue">${this.fogIntensity}%</span>
                </div>
                <p class="setting-description">Fades tiles at render distance edges (0% = no fog, 100% = full fog)</p>
            </div>

            <div class="setting-item">
                <label for="showGrid">Grid Lines:</label>
                <div class="toggle-container">
                    <input type="checkbox" id="showGrid" ${this.showGrid ? 'checked' : ''}>
                    <span id="gridToggleValue">${this.showGrid ? 'ON' : 'OFF'}</span>
                </div>
                <p class="setting-description">Show/hide grid lines overlay on tiles</p>
            </div>
        `;

        // Store references to elements
        setTimeout(() => {
            this.renderDistanceSlider = document.getElementById('renderDistance');
            this.renderDistanceValue = document.getElementById('renderDistanceValue');
            this.fogSlider = document.getElementById('fogIntensity');
            this.fogValue = document.getElementById('fogIntensityValue');
            this.gridToggle = document.getElementById('showGrid');
            this.gridToggleValue = document.getElementById('gridToggleValue');
            
            if (this.renderDistanceSlider && this.renderDistanceValue) {
                // Update value display when slider moves
                this.renderDistanceSlider.addEventListener('input', () => {
                    this.renderDistance = parseInt(this.renderDistanceSlider.value);
                    this.renderDistanceValue.textContent = `${this.renderDistance}x${this.renderDistance} tiles`;
                });
            }

            if (this.fogSlider && this.fogValue) {
                // Update value display when slider moves
                this.fogSlider.addEventListener('input', () => {
                    this.fogIntensity = parseInt(this.fogSlider.value);
                    this.fogValue.textContent = `${this.fogIntensity}%`;
                });
            }

            if (this.gridToggle && this.gridToggleValue) {
                // Update value display when toggle changes
                this.gridToggle.addEventListener('change', () => {
                    this.showGrid = this.gridToggle.checked;
                    this.gridToggleValue.textContent = this.showGrid ? 'ON' : 'OFF';
                    
                    // Sync with game immediately
                    this.syncWithGame();
                });
            }
        }, 0);

        return container;
    }

    getRenderDistance() {
        return this.renderDistance;
    }

    setRenderDistance(value) {
        this.renderDistance = parseInt(value);
        if (this.sliderElement) {
            this.sliderElement.value = value;
        }
        if (this.valueElement) {
            this.valueElement.textContent = `${value}x${value} tiles`;
        }
    }

    getShowGrid() {
        return this.showGrid;
    }

    setShowGrid(value) {
        this.showGrid = value;
        if (this.gridToggle) {
            this.gridToggle.checked = value;
        }
        if (this.gridToggleValue) {
            this.gridToggleValue.textContent = value ? 'ON' : 'OFF';
        }
    }

    syncWithGame() {
        // Sync settings with the game immediately
        if (window.game && window.game.syncVideoSettings) {
            window.game.syncVideoSettings(this);
        }
    }
}

