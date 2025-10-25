export class GameLoop {
    constructor(updateCallback, renderCallback) {
        this.updateCallback = updateCallback;
        this.renderCallback = renderCallback;
        this.lastTime = 0;
        this.accumulator = 0;
        this.targetFPS = 60;
        this.frameTime = 1000 / this.targetFPS;
        this.isRunning = false;
    }

    start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        this.loop();
    }

    stop() {
        this.isRunning = false;
    }

    loop(currentTime = 0) {
        if (!this.isRunning) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.accumulator += deltaTime;

        while (this.accumulator >= this.frameTime) {
            this.updateCallback(this.frameTime);
            this.accumulator -= this.frameTime;
        }

        const alpha = this.accumulator / this.frameTime;
        this.renderCallback(alpha);

        requestAnimationFrame((time) => this.loop(time));
    }

    setTargetFPS(fps) {
        this.targetFPS = fps;
        this.frameTime = 1000 / fps;
    }

    getFPS() {
        return this.targetFPS;
    }

    isActive() {
        return this.isRunning;
    }
}