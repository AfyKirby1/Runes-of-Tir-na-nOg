import { NameTag } from './NameTag.js';

export class Player {
    constructor(gameWidth, gameHeight, world = null) {
        // Try to spawn at a player spawn point if available
        if (world && world.spawnPoints && world.spawnPoints.length > 0) {
            const playerSpawn = world.getRandomSpawnPoint('player');
            if (playerSpawn) {
                this.x = playerSpawn.x;
                this.y = playerSpawn.y;
                console.log(`📍 Player spawned at spawn point: ${playerSpawn.name} at pixel (${playerSpawn.x}, ${playerSpawn.y})`);
                console.log(`🎯 Player spawn tile equivalent: (${Math.floor(playerSpawn.x / (world.tileSize || 16))}, ${Math.floor(playerSpawn.y / (world.tileSize || 16))})`);
                console.log(`🎯 DEBUG: Player object position set to (${this.x}, ${this.y})`);
            } else {
                // Fallback to world center if no player spawn points
                this.x = gameWidth / 2;
                this.y = gameHeight / 2;
                console.log('📍 Player spawned at world center (no player spawn points found)');
            }
        } else {
            // Default spawn at world center
            this.x = gameWidth / 2;
            this.y = gameHeight / 2;
            console.log('📍 Player spawned at world center (no world data)');
        }
        this.size = 18; // Increased from 12 for larger appearance
        this.speed = 3;
        this.color = '#ff6b6b';
        this.direction = 'down';
        this.frame = 0;
        this.frameCount = 0;
        this.vx = 0;
        this.vy = 0;
        this.legAngle = 0;
        this.legSwingSpeed = Math.PI * 2 / 0.5;
        this.isOnWater = false;
        this.waterSoundCooldown = 0;
        
        // Combat properties
        this.health = 10;
        this.maxHealth = 10;
        this.attackDamage = 1;
        this.attackRange = 30;
        this.attackCooldown = 1000; // 1 second
        this.lastAttackTime = 0;
        this.isAttacking = false;
        
        // Damage numbers system
        this.damageNumbers = [];
        // Get username from localStorage or use default
        const username = localStorage.getItem('runes_username') || 'Player';
        this.nameTag = new NameTag(username, this.x, this.y, {
            color: '#ffffff',
            showBackground: false,
            fontSize: 12
        });
        
        // Load character image
        this.characterImage = new Image();
        this.characterImage.onload = () => {
            console.log('Character image loaded successfully');
        };
        this.characterImage.onerror = () => {
            console.error('Failed to load character image');
        };
        this.characterImage.src = 'assets/character/guy_1.png';
    }

    update(input, collisionChecker, audioManager = null) {
        this.vx = 0;
        this.vy = 0;

        // Use the enhanced input system for movement
        const movement = input.getMovementInput();
        this.vx = movement.x * this.speed;
        this.vy = movement.y * this.speed;

        // Update direction based on movement
        if (movement.x < 0) this.direction = 'left';
        if (movement.x > 0) this.direction = 'right';
        if (movement.y < 0) this.direction = 'up';
        if (movement.y > 0) this.direction = 'down';

        // Handle sprinting
        if (input.isSprintPressed()) {
            this.vx *= 1.5;
            this.vy *= 1.5;
        }

        // Handle crouching
        if (input.isCrouchPressed()) {
            this.vx *= 0.5;
            this.vy *= 0.5;
        }

        // Normalize diagonal movement
        if (this.vx !== 0 && this.vy !== 0) {
            const normalizedSpeed = this.speed / Math.sqrt(2);
            this.vx = Math.sign(this.vx) * normalizedSpeed;
            this.vy = Math.sign(this.vy) * normalizedSpeed;
        }

        const newX = this.x + this.vx;
        const newY = this.y + this.vy;
        const isMoving = this.vx !== 0 || this.vy !== 0;

        // Check if player is on water
        const wasOnWater = this.isOnWater;
        this.isOnWater = collisionChecker.isPlayerOnWater ? 
            collisionChecker.isPlayerOnWater(this.x, this.y) : false;

        if (isMoving && collisionChecker.canMove(newX, newY, this.size)) {
            this.x = newX;
            this.y = newY;
            
            // Play water sound if stepping on water
            if (this.isOnWater && this.waterSoundCooldown <= 0 && audioManager) {
                audioManager.playWaterSound();
                this.waterSoundCooldown = 15; // Cooldown in frames (15/60 = 0.25 seconds)
            }
            
            this.frameCount++;
            if (this.frameCount >= 8) {
                this.frame = (this.frame + 1) % 4;
                this.frameCount = 0;
            }
            if (this.direction === 'left' || this.direction === 'right') {
                this.legAngle += this.legSwingSpeed * (1 / 60);
            }
        } else {
            this.frame = 0;
            this.frameCount = 0;
            this.legAngle = 0;
        }

        // Update cooldown
        if (this.waterSoundCooldown > 0) {
            this.waterSoundCooldown--;
        }

        this.nameTag.setPosition(this.x, this.y);
        this.nameTag.update();
        
        // Handle attack input
        if (input.isAttackPressed() && Date.now() - this.lastAttackTime >= this.attackCooldown) {
            this.attack();
        }
        
        // Update attack animation
        if (this.isAttacking && Date.now() - this.lastAttackTime > 200) {
            this.isAttacking = false;
        }
        
        // Update damage numbers
        this.updateDamageNumbers();
    }

    render(ctx) {
        const centerX = this.x;
        const centerY = this.y;
        const size = this.size;

        // Render character image if loaded, otherwise fallback to drawn character
        if (this.characterImage.complete && this.characterImage.naturalWidth > 0) {
            // Calculate image dimensions to fit within the character size
            const imageSize = size * 1.5; // Make it slightly larger than the old character
            
            // Draw the character image centered
            ctx.drawImage(
                this.characterImage,
                centerX - imageSize / 2,
                centerY - imageSize / 2,
                imageSize,
                imageSize
            );
        } else {
            // Fallback to old drawn character if image isn't loaded yet
            this.renderFallbackCharacter(ctx, centerX, centerY, size);
        }

        // Always render the name tag
        this.nameTag.render(ctx);
        
        // Render attack animation
        if (this.isAttacking) {
            this.renderAttackEffect(ctx, centerX, centerY);
        }
        
        // Render health bar above character (if game.ui available)
        if (this.game && this.game.ui && this.game.ui.healthBar) {
            this.game.ui.healthBar.renderAboveCharacter(ctx, this.x, this.y, this.game.camera);
        }
        
        // Render damage numbers
        this.renderDamageNumbers(ctx);
    }

    renderFallbackCharacter(ctx, centerX, centerY, size) {
        // Body
        ctx.fillStyle = '#f4e4bc';
        ctx.fillRect(centerX - size / 2, centerY - size / 2, size, size);

        // Head
        const headRadius = size * 0.4;
        ctx.fillStyle = '#f4e4bc';
        ctx.beginPath();
        ctx.arc(centerX, centerY - size * 0.3, headRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Eyes
        ctx.fillStyle = '#654321';
        ctx.beginPath();
        ctx.arc(centerX - 2, centerY - size * 0.4, 1, 0, Math.PI * 2);
        ctx.arc(centerX + 2, centerY - size * 0.4, 1, 0, Math.PI * 2);
        ctx.fill();

        // Arms based on direction
        const armLength = size * 0.3;
        const armWidth = 3;
        ctx.fillStyle = '#f4e4bc';

        switch (this.direction) {
            case 'up':
                ctx.fillRect(centerX - size / 2 - armWidth, centerY - 2, armWidth, armLength);
                ctx.fillRect(centerX + size / 2, centerY - 2, armWidth, armLength);
                break;
            case 'down':
                ctx.fillRect(centerX - size / 2 - armWidth, centerY - armLength + 2, armWidth, armLength);
                ctx.fillRect(centerX + size / 2, centerY - armLength + 2, armWidth, armLength);
                break;
            case 'left':
                ctx.fillRect(centerX - size / 2 - armLength, centerY - 2, armLength, armWidth);
                ctx.fillRect(centerX + size / 2 - armLength, centerY - 2, armLength, armWidth);
                break;
            case 'right':
                ctx.fillRect(centerX - size / 2, centerY - 2, armLength, armWidth);
                ctx.fillRect(centerX + size / 2, centerY - 2, armLength, armWidth);
                break;
        }

        // Legs
        ctx.fillStyle = '#f4e4bc';
        const legWidth = 3;
        const legHeight = size * 0.4;

        if (this.direction === 'left' || this.direction === 'right') {
            const swingAngle = Math.sin(this.legAngle) * Math.PI / 4;
            const legOffset = Math.sin(swingAngle) * 2;
            ctx.fillRect(centerX - 4 + legOffset, centerY + size / 2 - 2, legWidth, legHeight);
            ctx.fillRect(centerX + 1 - legOffset, centerY + size / 2 - 2, legWidth, legHeight);
        } else {
            ctx.fillRect(centerX - 4, centerY + size / 2 - 2, legWidth, legHeight);
            ctx.fillRect(centerX + 1, centerY + size / 2 - 2, legWidth, legHeight);
        }
    }

    getPosition() {
        return { x: this.x, y: this.y };
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    setName(name) {
        this.nameTag.setName(name);
    }

    getName() {
        return this.nameTag.name;
    }
    
    /**
     * Attack nearby NPCs
     */
    attack() {
        this.lastAttackTime = Date.now();
        this.isAttacking = true;
        
        console.log(`⚔️ Player attacks!`);
        
        // Find nearby NPCs to attack
        if (this.game && this.game.npcManager) {
            const nearbyNPCs = this.game.npcManager.getNPCsNearPlayer(this, this.attackRange);
            
            for (const npc of nearbyNPCs) {
                // Only attack hostile NPCs
                if (npc.behavior === 'hostile' && npc.health > 0) {
                    npc.takeDamage(this.attackDamage);
                    console.log(`⚔️ Player deals ${this.attackDamage} damage to ${npc.name}!`);
                }
            }
        }
    }
    
    /**
     * Take damage from NPCs
     */
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        console.log(`💔 Player takes ${amount} damage! Health: ${this.health}/${this.maxHealth}`);
        
        // Add floating damage number
        this.addDamageNumber(amount, this.x, this.y - 20);
        
        // Update health bar
        if (this.game && this.game.ui) {
            this.game.ui.updateHealth(this.health, this.maxHealth);
        }
        
        // Check for death
        if (this.health <= 0) {
            console.log('💀 Player has died!');
            // TODO: Implement death/respawn logic
        }
    }
    
    /**
     * Heal the player
     */
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
        console.log(`💚 Player heals ${amount} HP! Health: ${this.health}/${this.maxHealth}`);
        
        // Update health bar
        if (this.game && this.game.ui) {
            this.game.ui.updateHealth(this.health, this.maxHealth);
        }
    }
    
    /**
     * Render attack effect
     */
    renderAttackEffect(ctx, centerX, centerY) {
        const attackTime = Date.now() - this.lastAttackTime;
        const progress = Math.min(attackTime / 200, 1); // 200ms attack duration
        
        // RuneScape Classic style: Simple weapon swing animation
        ctx.strokeStyle = '#8B4513'; // Brown weapon color
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        // Draw weapon swing based on direction
        const weaponLength = this.size * 0.8;
        let startX, startY, endX, endY;
        
        switch (this.direction) {
            case 'up':
                startX = centerX;
                startY = centerY;
                endX = centerX + Math.sin(progress * Math.PI) * weaponLength;
                endY = centerY - weaponLength;
                break;
            case 'down':
                startX = centerX;
                startY = centerY;
                endX = centerX - Math.sin(progress * Math.PI) * weaponLength;
                endY = centerY + weaponLength;
                break;
            case 'left':
                startX = centerX;
                startY = centerY;
                endX = centerX - weaponLength;
                endY = centerY + Math.sin(progress * Math.PI) * weaponLength;
                break;
            case 'right':
                startX = centerX;
                startY = centerY;
                endX = centerX + weaponLength;
                endY = centerY - Math.sin(progress * Math.PI) * weaponLength;
                break;
            default:
                startX = centerX;
                startY = centerY;
                endX = centerX;
                endY = centerY;
        }
        
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Add simple hit effect at weapon tip
        if (progress > 0.5) {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(endX, endY, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    /**
     * Add damage number floating above player
     */
    addDamageNumber(amount, x, y) {
        this.damageNumbers.push({
            amount: amount,
            x: x,
            y: y,
            startTime: Date.now(),
            duration: 1000, // 1 second
            velocity: { x: (Math.random() - 0.5) * 2, y: -2 }
        });
    }
    
    /**
     * Update damage numbers animation
     */
    updateDamageNumbers() {
        const now = Date.now();
        this.damageNumbers = this.damageNumbers.filter(dmg => {
            const elapsed = now - dmg.startTime;
            if (elapsed >= dmg.duration) {
                return false; // Remove expired damage numbers
            }
            
            // Update position
            dmg.x += dmg.velocity.x;
            dmg.y += dmg.velocity.y;
            dmg.velocity.y += 0.1; // Gravity effect
            
            return true;
        });
    }
    
    /**
     * Render floating damage numbers
     */
    renderDamageNumbers(ctx) {
        ctx.save();
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        
        this.damageNumbers.forEach(dmg => {
            const elapsed = Date.now() - dmg.startTime;
            const progress = elapsed / dmg.duration;
            const alpha = 1 - progress;
            
            ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
            ctx.fillText(`-${dmg.amount}`, dmg.x, dmg.y);
        });
        
        ctx.restore();
    }
}