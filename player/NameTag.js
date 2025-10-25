export class NameTag {
    constructor(name, x, y, options = {}) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.offsetY = options.offsetY || -25;
        this.fontSize = options.fontSize || 14;
        this.fontFamily = options.fontFamily || 'Courier New';
        this.color = options.color || '#ffffff';
        this.backgroundColor = options.backgroundColor || 'rgba(0,0,0,0.7)';
        this.borderColor = options.borderColor || '#d4af37';
        this.padding = options.padding || 4;
        this.borderRadius = options.borderRadius || 3;
        this.showBackground = options.showBackground !== false;
        this.bobOffset = 0;
        this.bobSpeed = 0.0125;
        this.bobAmplitude = 2;
    }

    update() {
        this.bobOffset = Math.sin(Date.now() * this.bobSpeed) * this.bobAmplitude;
    }

    render(ctx) {
        const displayX = this.x;
        const displayY = this.y + this.offsetY + this.bobOffset;

        ctx.font = `${this.fontSize}px ${this.fontFamily}`;
        const textMetrics = ctx.measureText(this.name);
        const textWidth = textMetrics.width;

        if (this.showBackground) {
            // Background
            ctx.fillStyle = this.backgroundColor;
            ctx.fillRect(
                displayX - textWidth / 2 - this.padding,
                displayY - this.fontSize - this.padding,
                textWidth + this.padding * 2,
                this.fontSize + this.padding * 2
            );

            // Border
            ctx.strokeStyle = this.borderColor;
            ctx.lineWidth = 1;
            ctx.strokeRect(
                displayX - textWidth / 2 - this.padding,
                displayY - this.fontSize - this.padding,
                textWidth + this.padding * 2,
                this.fontSize + this.padding * 2
            );
        }

        // Text
        ctx.fillStyle = this.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(this.name, displayX, displayY - this.fontSize);

        // Reset text alignment
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    setName(name) {
        this.name = name;
    }

    setColor(color) {
        this.color = color;
    }

    setBackground(show, backgroundColor = null, borderColor = null) {
        this.showBackground = show;
        if (backgroundColor) this.backgroundColor = backgroundColor;
        if (borderColor) this.borderColor = borderColor;
    }
}