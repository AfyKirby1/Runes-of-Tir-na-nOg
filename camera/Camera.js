export class Camera {
    constructor(canvasWidth, canvasHeight) {
        this.zoom = 1.0; // Start at 100% zoom 1.0
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.worldWidth = 0;
        this.worldHeight = 0;

        // Initialize camera at center of canvas (where player starts)
        this.x = 0;
        this.y = 0;

        // Mouse drag camera properties
        this.isDragging = false;
        this.isDragged = false; // Track if camera has been manually moved
        this.dragOffset = { x: 0, y: 0 };
        this.snapBackSpeed = 0.15; // Faster snap back for more responsive camera movement
        this.targetX = 0;
        this.targetY = 0;
        this.playerLastPos = { x: 0, y: 0 }; // Track player movement
        this.initialized = false; // Flag to ensure proper initialization

        // Zoom properties with 10% increments
        this.minZoom = 0.8;  // 80% minimum
        this.maxZoom = 3.0;  // 300% maximum
        this.zoomSpeed = 0.1; // 10% increments
    }

    update(playerX, playerY, worldWidth, worldHeight, input = null) {
        // Store player position for fog calculation
        this.playerX = playerX;
        this.playerY = playerY;
        
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
        
        // Initialize camera position on first update to center on player
        if (!this.initialized) {
            // Camera should be positioned so player appears at canvas center
            // For player to be at center: cameraX = playerX - (canvasWidth / 2) / zoom
            this.x = playerX - (this.canvasWidth / 2) / this.zoom;
            this.y = playerY - (this.canvasHeight / 2) / this.zoom;
            this.targetX = this.x;
            this.targetY = this.y;
            this.playerLastPos.x = playerX;
            this.playerLastPos.y = playerY;
            this.initialized = true;
            
            return; // Skip first frame to avoid jitter
        }

        // Check if player has moved (for snap-back behavior)
        const playerMoved = Math.abs(playerX - this.playerLastPos.x) > 1 || Math.abs(playerY - this.playerLastPos.y) > 1;

        // Handle scroll wheel zoom with discrete 10% increments
        if (input) {
            const scrollDelta = input.getScrollDelta();
            if (scrollDelta !== 0) {
                // Store old zoom for position adjustment
                const oldZoom = this.zoom;

                // Calculate discrete zoom levels (0.8, 0.9, 1.0, 1.1, 1.2, ... 3.0)
                const currentZoomLevel = Math.round(this.zoom * 10) / 10; // Round to nearest 0.1
                const zoomIncrement = scrollDelta > 0 ? -0.1 : 0.1; // 10% increments
                const newZoom = currentZoomLevel + zoomIncrement;

                // Clamp to zoom limits
                const clampedZoom = Math.max(this.minZoom, Math.min(this.maxZoom, newZoom));

                if (clampedZoom !== this.zoom) {
                    // Adjust camera position to keep player centered during zoom
                    // The camera transform is: translate(-cameraX, -cameraY) then scale(zoom)
                    // So a world point (playerX, playerY) becomes screen point:
                    // screenX = (playerX - cameraX) * zoom
                    // For player to be at center: (playerX - cameraX) * zoom = canvasWidth/2
                    // Solving for cameraX: cameraX = playerX - (canvasWidth/2) / zoom
                    const canvasCenterX = this.canvasWidth / 2;
                    const canvasCenterY = this.canvasHeight / 2;

                    // Calculate new camera position to keep player centered
                    // The camera should be positioned so player appears at center of screen
                    // Formula: cameraX = playerX - (canvasCenterX / zoom) + dragOffset
                    const newCameraX = playerX - (canvasCenterX / clampedZoom) + this.dragOffset.x;
                    const newCameraY = playerY - (canvasCenterY / clampedZoom) + this.dragOffset.y;
                    
                    this.x = newCameraX;
                    this.y = newCameraY;

                    // Update zoom
                    this.zoom = clampedZoom;
                }
            }

            // Handle mouse drag
            const dragDelta = input.getDragDelta();
            if (input.getMouse().isDragging) {
                this.isDragging = true;
                this.isDragged = true; // Mark that camera has been manually moved
                // Apply drag offset (invert direction for intuitive camera movement)
                this.dragOffset.x -= dragDelta.x / this.zoom;
                this.dragOffset.y -= dragDelta.y / this.zoom;
                input.resetDragStart(); // Reset drag start for next frame
            } else if (this.isDragging) {
                // Stop dragging but keep the offset
                this.isDragging = false;
            }
        }

        // If player moved and camera was dragged, reset to follow player
        if (playerMoved && this.isDragged) {
            this.isDragged = false;
            this.dragOffset.x = 0;
            this.dragOffset.y = 0;
        }

        // Update player last position
        this.playerLastPos.x = playerX;
        this.playerLastPos.y = playerY;

        // Calculate target position (player position with drag offset)
        // Camera should be positioned so player appears at center of screen
        // Formula: cameraX = playerX - (canvasWidth / 2) / zoom + dragOffset
        this.targetX = playerX - (this.canvasWidth / 2) / this.zoom + this.dragOffset.x;
        this.targetY = playerY - (this.canvasHeight / 2) / this.zoom + this.dragOffset.y;

        // Always smoothly move to target for consistent behavior
        this.x = this.lerp(this.x, this.targetX, this.snapBackSpeed);
        this.y = this.lerp(this.y, this.targetY, this.snapBackSpeed);

        // Temporarily disable camera bounds clamping to test if that's causing the grey area issue
        // TODO: Re-enable proper bounds clamping after fixing grey area issue
        /*
        const tileSize = 50;
        const maxX = Math.max(0, worldWidth - this.canvasWidth / this.zoom);
        const maxY = Math.max(0, worldHeight - this.canvasHeight / this.zoom);
        const edgePadding = tileSize * 20;
        this.x = Math.max(-edgePadding, Math.min(this.x, maxX + edgePadding));
        this.y = Math.max(-edgePadding, Math.min(this.y, maxY + edgePadding));
        */
    }

    applyTransform(ctx) {
        ctx.save();
        // Apply camera transform: scale for zoom first, then translate to camera position
        ctx.scale(this.zoom, this.zoom);
        ctx.translate(-this.x, -this.y);
    }

    restoreTransform(ctx) {
        ctx.restore();
    }

    screenToWorld(screenX, screenY) {
        return {
            x: (screenX + this.x) / this.zoom,
            y: (screenY + this.y) / this.zoom
        };
    }

    worldToScreen(worldX, worldY) {
        return {
            x: worldX * this.zoom - this.x,
            y: worldY * this.zoom - this.y
        };
    }

    isVisible(worldX, worldY, width, height) {
        return !(worldX + width < this.x ||
                worldX > this.x + this.canvasWidth / this.zoom ||
                worldY + height < this.y ||
                worldY > this.y + this.canvasHeight / this.zoom);
    }

    setZoom(newZoom) {
        this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, newZoom));
    }

    getViewport() {
        return {
            x: this.x,
            y: this.y,
            width: this.canvasWidth,
            height: this.canvasHeight,
            zoom: this.zoom
        };
    }

    // Linear interpolation for smooth camera movement
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    // Get current zoom level for UI display
    getZoomLevel() {
        return Math.round(this.zoom * 100) / 100;
    }

    // Debug method to get camera info (for development only)
    getDebugInfo(playerX, playerY) {
        if (!window.DEBUG_MODE) return null;

        return {
            cameraX: Math.round(this.x),
            cameraY: Math.round(this.y),
            playerX: Math.round(playerX),
            playerY: Math.round(playerY),
            zoom: this.zoom,
            canvasWidth: this.canvasWidth,
            canvasHeight: this.canvasHeight,
            targetX: Math.round(this.targetX),
            targetY: Math.round(this.targetY),
            playerScreenX: Math.round(playerX * this.zoom - this.x),
            playerScreenY: Math.round(playerY * this.zoom - this.y),
            expectedCenterX: Math.round(this.canvasWidth / 2),
            expectedCenterY: Math.round(this.canvasHeight / 2)
        };
    }
}
