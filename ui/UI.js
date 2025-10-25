import { HealthBar } from './HealthBar.js';

export class UI {
    constructor() {
        this.fps = 60;
        this.lastTime = 0;
        this.frameCount = 0;
        this.memoryUsage = 0;
        this.zoomLevel = 1.0; // Default to 100%
        this.healthBar = new HealthBar();
    }

    update(playerX, playerY, deltaTime, zoomLevel = 1.0, cameraDebug = null) {
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
        // Future UI rendering code can go here
    }

    showMessage(text, duration = 3000) {
        console.log(`UI Message: ${text}`);
    }

    updateHealth(current, maximum) {
        console.log(`Health: ${current}/${maximum}`);
        this.healthBar.setHealth(current, maximum);
    }

    updateMana(current, maximum) {
        console.log(`Mana: ${current}/${maximum}`);
    }

    showInventory() {
        console.log('Opening inventory...');
    }

    showQuestLog() {
        console.log('Opening quest log...');
    }
}
