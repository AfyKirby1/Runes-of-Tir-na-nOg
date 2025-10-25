// GameplaySettings Component
// Manages gameplay-related settings (NPCs, difficulty, world features, etc.)

export class GameplaySettings {
    constructor() {
        this.npcDensity = 1; // NPC spawn density multiplier
    }

    load() {
        // Load settings from localStorage with defaults
        const densitySetting = localStorage.getItem('npcDensity');
        this.npcDensity = densitySetting ? parseFloat(densitySetting) : 1;
    }

    save() {
        // Save to localStorage
        localStorage.setItem('npcDensity', this.npcDensity.toString());
        
        // Return confirmation message
        return `NPC Density: ${Math.round(this.npcDensity * 100)}%`;
    }

    render() {
        const container = document.createElement('div');
        container.className = 'settings-section';
        container.innerHTML = `
            <h3>🎮 Gameplay Settings</h3>
            
            <div class="setting-item">
                <label for="npcDensity">NPC Spawn Density:</label>
                <div class="slider-container">
                    <input type="range" id="npcDensity" min="0" max="2" value="${this.npcDensity}" step="0.25">
                    <span id="npcDensityValue">${Math.round(this.npcDensity * 100)}%</span>
                </div>
                <p class="setting-description">
                    Controls how many NPCs spawn in the world (0% = none, 100% = default, 200% = double)
                </p>
            </div>
        `;

        // Store references and setup event listeners
        setTimeout(() => {
            const npcDensitySlider = document.getElementById('npcDensity');
            const npcDensityValue = document.getElementById('npcDensityValue');
            
            // NPC density slider event
            if (npcDensitySlider && npcDensityValue) {
                npcDensitySlider.addEventListener('input', () => {
                    this.npcDensity = parseFloat(npcDensitySlider.value);
                    npcDensityValue.textContent = `${Math.round(this.npcDensity * 100)}%`;
                });
            }
        }, 0);

        return container;
    }

    getNpcDensity() {
        return this.npcDensity;
    }

    getStyles() {
        return `
            /* Slider Styles */
            .slider-container {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-top: 10px;
            }

            .setting-label-text {
                font-size: 18px;
                color: #d4af37;
            }
        `;
    }
}

