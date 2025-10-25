/**
 * NPC Module - Chronicles of the Forgotten Realm
 * Handles Non-Player Characters (NPCs) including townies, merchants, quest givers, etc.
 */

class NPC {
    constructor(config) {
        // Basic Properties
        this.id = config.id || `npc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.name = config.name || "Unknown NPC";
        this.type = config.type || "townie"; // townie, merchant, quest_giver, guard, etc.
        this.description = config.description || "A mysterious figure.";
        
        // Position and Movement
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.width = config.width || 32;
        this.height = config.height || 32;
        this.speed = config.speed || 1;
        this.direction = config.direction || 0; // 0-7 for 8 directions
        
        // Smooth movement properties
        this.vx = 0; // Current velocity X
        this.vy = 0; // Current velocity Y
        this.targetX = this.x; // Target position X
        this.targetY = this.y; // Target position Y
        this.acceleration = config.acceleration || 0.8; // How quickly NPC accelerates toward target
        this.deceleration = config.deceleration || 0.9; // How quickly NPC decelerates when stopping
        this.maxSpeed = this.speed; // Maximum movement speed
        
        // Visual Properties
        this.sprite = config.sprite || null;
        this.color = config.color || "#8B4513"; // Default brown color
        this.animationFrame = 0;
        this.animationSpeed = config.animationSpeed || 0.1;
        this.scale = config.scale || 1;
        this.usePlayerModel = config.usePlayerModel || false; // Use player-style rendering
        
        // Custom image support (from Blocky Builder)
        this.customImage = config.customImage || null;
        this.isCustom = config.isCustom || false;
        this.customImageElement = null; // Cached image element
        
        // Player model properties (for Bob)
        if (this.usePlayerModel) {
            this.size = 18; // Increased from 12 to match player size
            this.legAngle = 0;
            this.legSwingSpeed = Math.PI * 2 / 0.5;
            this.playerDirection = 'down'; // down, up, left, right
        }
        
        // Behavior Properties
        this.behavior = config.behavior || "idle"; // idle, patrol, wander, follow, etc.
        this.patrolPoints = config.patrolPoints || [];
        this.currentPatrolIndex = 0;
        this.wanderRadius = config.wanderRadius || 100;
        this.homeX = this.x;
        this.homeY = this.y;
        
        // Interaction Properties
        this.interactable = config.interactable !== false;
        this.dialogue = config.dialogue || [];
        this.currentDialogueIndex = 0;
        this.shopItems = config.shopItems || [];
        this.quests = config.quests || [];
        
        // State Properties
        this.isVisible = config.isVisible !== false;
        this.isActive = config.isActive !== false;
        this.health = config.health || 100;
        this.maxHealth = config.maxHealth || 100;
        this.level = config.level || 1;
        
        // AI Properties
        this.aiState = "idle";
        this.lastActionTime = 0;
        this.actionCooldown = config.actionCooldown || 1000;
        this.detectionRadius = config.detectionRadius || 50;
        this.reactionTime = config.reactionTime || 500;
        
        // Combat Properties
        this.health = config.health || 100;
        this.maxHealth = config.maxHealth || 100;
        this.attackDamage = config.attackDamage || 1;
        this.attackCooldown = config.attackCooldown || 1000;
        this.lastAttackTime = 0;
        this.isAttacking = false;
        this.attackRange = config.attackRange || 20;
        
        // Damage numbers system
        this.damageNumbers = [];
        
        // Animation Properties
        this.animationTimer = 0;
        this.isMoving = false;
        this.lastMoveTime = 0;
        
        console.log(`NPC created: ${this.name} (${this.type}) at (${this.x}, ${this.y})`);
    }
    
    /**
     * Update NPC logic
     */
    update(deltaTime, game) {
        if (!this.isActive) return;
        
        this.animationTimer += deltaTime;
        this.lastActionTime += deltaTime;
        
        // Store world reference for collision detection
        this.world = game.world;
        
        // Update AI behavior
        this.updateAI(deltaTime, game);
        
        // Update animation
        this.updateAnimation(deltaTime);
        
        // Update damage numbers
        this.updateDamageNumbers();
        
        // Update smooth movement
        this.updateSmoothMovement(deltaTime, this.world);
        
        // Update position if moving
        if (this.isMoving) {
            this.updateMovement(deltaTime);
        }
    }
    
    /**
     * Update AI behavior based on current state
     */
    updateAI(deltaTime, game) {
        if (this.lastActionTime < this.actionCooldown) return;
        
        switch (this.behavior) {
            case "idle":
                this.handleIdleBehavior(deltaTime, game);
                break;
            case "patrol":
                this.handlePatrolBehavior(deltaTime, game);
                break;
            case "wander":
                this.handleWanderBehavior(deltaTime, game);
                break;
            case "follow":
                this.handleFollowBehavior(deltaTime, game);
                break;
            case "guard":
                this.handleGuardBehavior(deltaTime, game);
                break;
            case "hostile":
                this.handleHostileBehavior(deltaTime, game);
                break;
        }
        
        this.lastActionTime = 0;
    }
    
    /**
     * Handle idle behavior - NPC stays in place
     */
    handleIdleBehavior(deltaTime, game) {
        // Enhanced idle behavior for Bob
        if (this.name === "Bob") {
            // Bob occasionally looks around mysteriously
            if (Math.random() < 0.02) {
                this.direction = Math.floor(Math.random() * 8);
                
                // Sometimes Bob has mysterious insights
                if (Math.random() < 0.1) {
                    console.log(`🔮 Bob's mysterious insight: "${this.dialogue[Math.floor(Math.random() * this.dialogue.length)]}"`);
                }
            }
            
            // Bob sometimes moves slightly even when idle (restless knowledge seeker)
            if (Math.random() < 0.005) {
                const smallMoveX = (Math.random() - 0.5) * 20;
                const smallMoveY = (Math.random() - 0.5) * 20;
                this.moveTowards(this.x + smallMoveX, this.y + smallMoveY, deltaTime, this.world);
            }
        } else {
            // Standard idle behavior for other NPCs
            if (Math.random() < 0.01) {
                this.direction = Math.floor(Math.random() * 8);
            }
        }
    }
    
    /**
     * Handle patrol behavior - NPC moves between defined points
     */
    handlePatrolBehavior(deltaTime, game) {
        if (this.patrolPoints.length === 0) {
            this.behavior = "idle";
            return;
        }
        
        const targetPoint = this.patrolPoints[this.currentPatrolIndex];
        const distance = this.getDistanceTo(targetPoint.x, targetPoint.y);
        
        if (distance < 5) {
            // Reached patrol point, move to next
            this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
            this.isMoving = false;
        } else {
            // Move towards patrol point
            this.moveTowards(targetPoint.x, targetPoint.y, deltaTime, this.world);
        }
    }
    
    /**
     * Handle wander behavior - NPC randomly wanders within radius
     */
    handleWanderBehavior(deltaTime, game) {
        if (!this.isMoving) {
            // Enhanced wandering for Bob - more intelligent pathfinding
            if (this.name === "Bob") {
                // Bob sometimes approaches the player if they're nearby
                if (game.player) {
                    const distanceToPlayer = this.getDistanceTo(game.player.x, game.player.y);
                    if (distanceToPlayer < this.wanderRadius * 0.6 && Math.random() < 0.3) {
                        // 30% chance to approach player when nearby
                        const approachDistance = 40; // Stay 40 pixels away
                        const angleToPlayer = Math.atan2(game.player.y - this.y, game.player.x - this.x);
                        const targetX = game.player.x - Math.cos(angleToPlayer) * approachDistance;
                        const targetY = game.player.y - Math.sin(angleToPlayer) * approachDistance;
                        this.moveTowards(targetX, targetY, deltaTime, this.world);
                        return;
                    }
                }
                
                // Bob explores more systematically - prefers unexplored areas
                const explorationAngle = Math.random() * Math.PI * 2;
                const explorationDistance = Math.random() * this.wanderRadius * 0.8 + this.wanderRadius * 0.2;
                const targetX = this.homeX + Math.cos(explorationAngle) * explorationDistance;
                const targetY = this.homeY + Math.sin(explorationAngle) * explorationDistance;
                this.moveTowards(targetX, targetY, deltaTime, this.world);
            } else {
                // Standard wandering for other NPCs
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * this.wanderRadius;
                const targetX = this.homeX + Math.cos(angle) * distance;
                const targetY = this.homeY + Math.sin(angle) * distance;
                
                this.moveTowards(targetX, targetY, deltaTime, this.world);
            }
        }
    }
    
    /**
     * Handle follow behavior - NPC follows the player
     */
    handleFollowBehavior(deltaTime, game) {
        if (!game.player) return;
        
        const distance = this.getDistanceTo(game.player.x, game.player.y);
        
        if (distance > this.detectionRadius) {
            this.moveTowards(game.player.x, game.player.y, deltaTime, this.world);
        } else {
            this.isMoving = false;
        }
    }
    
    /**
     * Handle guard behavior - NPC guards a specific area
     */
    handleGuardBehavior(deltaTime, game) {
        const distanceFromHome = this.getDistanceTo(this.homeX, this.homeY);
        
        if (distanceFromHome > this.wanderRadius) {
            // Return to guard post
            this.moveTowards(this.homeX, this.homeY, deltaTime, this.world);
        } else {
            // Look around for threats
            if (Math.random() < 0.02) {
                this.direction = Math.floor(Math.random() * 8);
            }
        }
    }
    
    /**
     * Handle hostile behavior - NPC chases and attacks player
     */
    handleHostileBehavior(deltaTime, game) {
        if (!game.player) return;
        
        const distanceToPlayer = this.getDistanceTo(game.player.x, game.player.y);
        
        if (distanceToPlayer <= this.detectionRadius) {
            // Player detected - chase
            if (distanceToPlayer <= this.attackRange) {
                // In attack range - attack if cooldown is ready
                if (Date.now() - this.lastAttackTime >= this.attackCooldown) {
                    this.attackPlayer(game.player);
                }
            } else {
                // Chase player
                this.moveTowards(game.player.x, game.player.y, deltaTime, this.world);
            }
        } else {
            // Player not detected - return to wandering or idle
            if (this.behavior === "wander") {
                this.handleWanderBehavior(deltaTime, game);
            } else {
                this.handleIdleBehavior(deltaTime, game);
            }
        }
    }
    
    /**
     * Set target position for smooth movement
     */
    setTarget(targetX, targetY) {
        this.targetX = targetX;
        this.targetY = targetY;
    }
    
    /**
     * Update smooth movement towards target
     */
    updateSmoothMovement(deltaTime, world = null) {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 2) {
            // Calculate desired velocity towards target
            const desiredVx = (dx / distance) * this.maxSpeed;
            const desiredVy = (dy / distance) * this.maxSpeed;
            
            // Smoothly accelerate towards desired velocity
            this.vx += (desiredVx - this.vx) * this.acceleration * deltaTime * 0.01;
            this.vy += (desiredVy - this.vy) * this.acceleration * deltaTime * 0.01;
            
            // Limit velocity to max speed
            const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (currentSpeed > this.maxSpeed) {
                this.vx = (this.vx / currentSpeed) * this.maxSpeed;
                this.vy = (this.vy / currentSpeed) * this.maxSpeed;
            }
            
            // Calculate new position
            let newX = this.x + this.vx * deltaTime * 0.1;
            let newY = this.y + this.vy * deltaTime * 0.1;
            
            // Check collision before moving (if world is available)
            if (world && world.canMove) {
                if (!world.canMove(newX, newY, this.width || 16)) {
                    // Try moving only horizontally or vertically
                    if (world.canMove(this.x + this.vx * deltaTime * 0.1, this.y, this.width || 16)) {
                        newX = this.x + this.vx * deltaTime * 0.1;
                        newY = this.y;
                    } else if (world.canMove(this.x, this.y + this.vy * deltaTime * 0.1, this.width || 16)) {
                        newX = this.x;
                        newY = this.y + this.vy * deltaTime * 0.1;
                    } else {
                        // Can't move in any direction, decelerate
                        this.vx *= this.deceleration;
                        this.vy *= this.deceleration;
                        newX = this.x;
                        newY = this.y;
                    }
                }
            }
            
            this.x = newX;
            this.y = newY;
            
            // Update direction based on movement
            this.direction = this.getDirectionFromVector(dx, dy);
            this.isMoving = true;
            this.lastMoveTime = Date.now();
            
            // Update player model direction
            if (this.usePlayerModel) {
                if (Math.abs(dx) > Math.abs(dy)) {
                    this.playerDirection = dx > 0 ? 'right' : 'left';
                } else {
                    this.playerDirection = dy > 0 ? 'down' : 'up';
                }
            }
        } else {
            // Close to target, decelerate smoothly
            this.vx *= this.deceleration;
            this.vy *= this.deceleration;
            
            // Stop if velocity is very small
            if (Math.abs(this.vx) < 0.1 && Math.abs(this.vy) < 0.1) {
                this.vx = 0;
                this.vy = 0;
                this.isMoving = false;
            }
        }
    }
    
    /**
     * Move NPC towards target coordinates (legacy method for compatibility)
     */
    moveTowards(targetX, targetY, deltaTime, world = null) {
        this.setTarget(targetX, targetY);
        this.updateSmoothMovement(deltaTime, world);
    }
    
    /**
     * Update movement animation
     */
    updateMovement(deltaTime) {
        // Check if NPC has been stationary for too long
        if (Date.now() - this.lastMoveTime > 100) {
            this.isMoving = false;
        }
        
        // Update player model leg animation if using player model
        if (this.usePlayerModel && this.isMoving) {
            if (this.playerDirection === 'left' || this.playerDirection === 'right') {
                this.legAngle += this.legSwingSpeed * (deltaTime / 1000);
            }
        } else if (this.usePlayerModel) {
            this.legAngle = 0;
        }
    }
    
    /**
     * Update animation frames
     */
    updateAnimation(deltaTime) {
        if (this.animationTimer >= this.animationSpeed) {
            this.animationFrame = (this.animationFrame + 1) % 4; // 4-frame animation
            this.animationTimer = 0;
        }
    }
    
    /**
     * Render NPC on canvas
     */
    render(ctx, camera) {
        if (!this.isVisible) return;
        
        // Check if NPC is visible on screen (world coordinates)
        const screenWorldWidth = ctx.canvas.width / camera.zoom;
        const screenWorldHeight = ctx.canvas.height / camera.zoom;
        
        if (this.x < camera.x - 50 || this.x > camera.x + screenWorldWidth + 50 ||
            this.y < camera.y - 50 || this.y > camera.y + screenWorldHeight + 50) {
            return;
        }
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);
        
        // Use player model rendering for Bob
        if (this.usePlayerModel) {
            this.renderPlayerModel(ctx);
        } else if (this.isCustom && this.customImage) {
            // Custom image rendering (from Blocky Builder)
            this.renderCustomImage(ctx);
        } else if (this.isCustom) {
            // NPC is marked as custom but image hasn't loaded yet - don't render anything
            // This prevents the default brown blob from showing while custom image loads
            ctx.restore();
            return;
        } else {
            // Standard NPC rendering - position so bottom touches ground
            const groundOffset = this.height / 2; // Offset to ground the NPC
            
            // Draw NPC body
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.width/2, -this.height/2 + groundOffset, this.width, this.height);
            
            // Draw NPC face/direction indicator
            ctx.fillStyle = "#FFE4B5"; // Skin color
            ctx.fillRect(-this.width/4, -this.height/2 + groundOffset, this.width/2, this.height/2);
            
            // Draw eyes
            ctx.fillStyle = "#000";
            const eyeOffset = this.isMoving ? Math.sin(this.animationFrame * 0.5) * 2 : 0;
            ctx.fillRect(-this.width/6, -this.height/3 + groundOffset + eyeOffset, 3, 3);
            ctx.fillRect(this.width/12, -this.height/3 + groundOffset + eyeOffset, 3, 3);
            
            // Draw direction indicator (simple arrow)
            ctx.fillStyle = "#654321";
            ctx.beginPath();
            ctx.moveTo(0, -this.height/2 + groundOffset - 5);
            ctx.lineTo(-3, -this.height/2 + groundOffset - 10);
            ctx.lineTo(3, -this.height/2 + groundOffset - 10);
            ctx.closePath();
            ctx.fill();
        }
        
        // Draw name tag
        if (this.name && camera.zoom > 0.5) {
            ctx.fillStyle = "#d4af37"; // Gold color for Bob
            ctx.font = "12px Arial";
            ctx.textAlign = "center";
            
            // Adjust positioning based on NPC type
            let nameY;
            if (this.name.toLowerCase().includes('rat')) {
                // Rats get names closer to sprite
                nameY = this.usePlayerModel ? -this.size - 2 : -this.height/2 - 8;
            } else {
                // Other NPCs keep original positioning
                nameY = this.usePlayerModel ? -this.size - 5 : -this.height/2 - 15;
            }
            
            ctx.fillText(this.name, 0, nameY);
            
            // Draw health bar above name for all NPCs
            this.renderHealthBar(ctx, nameY);
        }
        
        // Render attack effect
        if (this.isAttacking) {
            this.renderAttackEffect(ctx);
        }
        
        // Draw interaction indicator
        if (this.interactable && camera.zoom > 0.3) {
            // Green dot removed - only show names now
        }
        
        ctx.restore();
        
        // Render damage numbers in world coordinates (outside transform)
        this.renderDamageNumbers(ctx);
    }
    
    /**
     * Render using player character model (for Bob)
     */
    renderPlayerModel(ctx) {
        const size = this.size;
        const centerX = 0;
        const centerY = size / 2; // Position character so bottom touches ground
        
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
        
        switch (this.playerDirection) {
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
        
        if (this.playerDirection === 'left' || this.playerDirection === 'right') {
            const swingAngle = Math.sin(this.legAngle) * Math.PI / 4;
            const legOffset = Math.sin(swingAngle) * 2;
            ctx.fillRect(centerX - 4 + legOffset, centerY + size / 2 - 2, legWidth, legHeight);
            ctx.fillRect(centerX + 1 - legOffset, centerY + size / 2 - 2, legWidth, legHeight);
        } else {
            ctx.fillRect(centerX - 4, centerY + size / 2 - 2, legWidth, legHeight);
            ctx.fillRect(centerX + 1, centerY + size / 2 - 2, legWidth, legHeight);
        }
    }
    
    /**
     * Render custom image (from Blocky Builder)
     */
    renderCustomImage(ctx) {
        if (!this.customImage) return;
        
        // Position so bottom touches ground
        const groundOffset = this.height / 2;
        
        // Use cached image element if available
        if (this.customImageElement && this.customImageElement.complete && this.customImageElement.naturalWidth > 0) {
            ctx.drawImage(this.customImageElement, -this.width/2, -this.height/2 + groundOffset, this.width, this.height);
        } else {
            // Create and cache image element if not already done
            if (!this.customImageElement) {
                this.customImageElement = new Image();
                this.customImageElement.onload = () => {
                    // Image loaded successfully, will be drawn on next render
                };
                this.customImageElement.onerror = () => {
                    console.warn('Failed to load custom NPC image:', this.name);
                };
                this.customImageElement.src = this.customImage;
            }
            
            // Don't render anything while custom image is loading - prevents brown blob flash
            // The NPC will appear once the custom image loads
        }
    }
    
    /**
     * Render fallback for custom NPCs when image fails to load
     */
    renderFallbackCustom(ctx, groundOffset) {
        // Draw placeholder with custom indicator
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width/2, -this.height/2 + groundOffset, this.width, this.height);
        
        // Draw custom indicator (golden stripe)
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(-this.width/2, -this.height/2 + groundOffset, this.width, 4);
    }
    
    /**
     * Get distance to target coordinates
     */
    getDistanceTo(targetX, targetY) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Get direction from vector
     */
    getDirectionFromVector(dx, dy) {
        const angle = Math.atan2(dy, dx);
        const normalizedAngle = (angle + Math.PI) / (Math.PI / 4);
        return Math.floor(normalizedAngle) % 8;
    }
    
    /**
     * Handle interaction with player
     */
    interact(player) {
        if (!this.interactable) return null;
        
        console.log(`Player interacting with ${this.name}`);
        
        // Return interaction result based on NPC type
        switch (this.type) {
            case "merchant":
                return this.openShop(player);
            case "quest_giver":
                return this.giveQuest(player);
            case "townie":
                return this.startDialogue(player);
            default:
                return this.startDialogue(player);
        }
    }
    
    /**
     * Start dialogue with NPC
     */
    startDialogue(player) {
        if (this.dialogue.length === 0) {
            return {
                type: "dialogue",
                npc: this.name,
                message: "Hello there! I don't have much to say right now."
            };
        }
        
        const dialogue = this.dialogue[this.currentDialogueIndex];
        this.currentDialogueIndex = (this.currentDialogueIndex + 1) % this.dialogue.length;
        
        return {
            type: "dialogue",
            npc: this.name,
            message: dialogue
        };
    }
    
    /**
     * Open shop interface
     */
    openShop(player) {
        return {
            type: "shop",
            npc: this.name,
            items: this.shopItems
        };
    }
    
    /**
     * Give quest to player
     */
    giveQuest(player) {
        if (this.quests.length === 0) {
            return {
                type: "dialogue",
                npc: this.name,
                message: "I don't have any quests for you right now."
            };
        }
        
        return {
            type: "quest",
            npc: this.name,
            quest: this.quests[0] // Give first available quest
        };
    }
    
    /**
     * Set NPC position
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.homeX = x;
        this.homeY = y;
    }
    
    /**
     * Add patrol point
     */
    addPatrolPoint(x, y) {
        this.patrolPoints.push({ x, y });
    }
    
    /**
     * Set dialogue
     */
    setDialogue(dialogueArray) {
        this.dialogue = dialogueArray;
    }
    
    /**
     * Add shop item
     */
    addShopItem(item) {
        this.shopItems.push(item);
    }
    
    /**
     * Add quest
     */
    addQuest(quest) {
        this.quests.push(quest);
    }
    
    /**
     * Attack the player
     */
    attackPlayer(player) {
        this.lastAttackTime = Date.now();
        this.isAttacking = true;
        
        console.log(`⚔️ ${this.name} attacks player!`);
        player.takeDamage(this.attackDamage);
        
        // Reset attack animation after 200ms
        setTimeout(() => {
            this.isAttacking = false;
        }, 200);
    }
    
    /**
     * Take damage from player or other sources
     */
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        console.log(`💔 ${this.name} takes ${amount} damage! Health: ${this.health}/${this.maxHealth}`);
        
        // Add floating damage number
        this.addDamageNumber(amount, this.x, this.y - 20);
        
        // Check for death
        if (this.health <= 0) {
            console.log(`💀 ${this.name} has died!`);
            this.isActive = false;
            this.isVisible = false;
            // TODO: Add death animation or loot drop
        }
    }
    
    /**
     * Heal the NPC
     */
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
        console.log(`💚 ${this.name} heals ${amount} HP! Health: ${this.health}/${this.maxHealth}`);
    }
    
    /**
     * Render attack effect for NPCs
     */
    renderAttackEffect(ctx) {
        // RuneScape Classic style: Simple bite/claw attack
        ctx.strokeStyle = '#8B4513'; // Brown color for rat teeth/claws
        ctx.lineWidth = 2;
        
        // Draw simple attack lines
        const attackSize = Math.max(this.width, this.height) * 0.5;
        
        // Draw 2-3 attack lines in different directions
        for (let i = 0; i < 3; i++) {
            const angle = (Math.PI * 2 * i) / 3;
            const startX = Math.cos(angle) * attackSize * 0.3;
            const startY = Math.sin(angle) * attackSize * 0.3;
            const endX = Math.cos(angle) * attackSize;
            const endY = Math.sin(angle) * attackSize;
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
        
        // Add simple hit effect at center
        ctx.fillStyle = '#FF4444';
        ctx.beginPath();
        ctx.arc(0, 0, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * Render health bar above NPC name
     */
    renderHealthBar(ctx, nameY) {
        const barWidth = 30;
        const barHeight = 3;
        const barX = -barWidth / 2;
        const barY = nameY - 8; // Above the name
        
        // Background (empty health)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Health fill
        const healthPercent = this.health / this.maxHealth;
        const fillWidth = barWidth * healthPercent;
        
        // Color based on health level
        if (healthPercent > 0.6) ctx.fillStyle = '#4ade80'; // Green
        else if (healthPercent > 0.3) ctx.fillStyle = '#fbbf24'; // Yellow
        else ctx.fillStyle = '#ef4444'; // Red
        
        ctx.fillRect(barX, barY, fillWidth, barHeight);
        
        // Border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
    
    /**
     * Add damage number floating above NPC
     */
    addDamageNumber(amount, x, y) {
        console.log(`🔢 Adding damage number: -${amount} at (${x}, ${y}) for ${this.name}`);
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
        if (this.damageNumbers.length === 0) return;
        
        ctx.save();
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        
        console.log(`🎨 Rendering ${this.damageNumbers.length} damage numbers for ${this.name}`);
        
        this.damageNumbers.forEach((dmg, index) => {
            const elapsed = Date.now() - dmg.startTime;
            const progress = elapsed / dmg.duration;
            const alpha = 1 - progress;
            
            ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
            ctx.fillText(`-${dmg.amount}`, dmg.x, dmg.y);
            
            console.log(`🎨 Damage number ${index}: -${dmg.amount} at (${dmg.x}, ${dmg.y}) alpha: ${alpha.toFixed(2)}`);
        });
        
        ctx.restore();
    }
    
    /**
     * Get NPC data for saving
     */
    getSaveData() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            x: this.x,
            y: this.y,
            behavior: this.behavior,
            patrolPoints: this.patrolPoints,
            dialogue: this.dialogue,
            shopItems: this.shopItems,
            quests: this.quests,
            isActive: this.isActive,
            isVisible: this.isVisible
        };
    }
    
    /**
     * Load NPC data from save
     */
    loadSaveData(data) {
        this.id = data.id;
        this.name = data.name;
        this.type = data.type;
        this.x = data.x;
        this.y = data.y;
        this.behavior = data.behavior;
        this.patrolPoints = data.patrolPoints || [];
        this.dialogue = data.dialogue || [];
        this.shopItems = data.shopItems || [];
        this.quests = data.quests || [];
        this.isActive = data.isActive;
        this.isVisible = data.isVisible;
    }
}

/**
 * NPC Manager - Handles all NPCs in the game
 */
class NPCManager {
    constructor() {
        this.npcs = new Map();
        this.interactionRadius = 30;
        this.lastInteractionTime = 0;
        this.interactionCooldown = 500; // 500ms cooldown between interactions
    }
    
    /**
     * Add NPC to manager
     */
    addNPC(npc) {
        this.npcs.set(npc.id, npc);
        console.log(`Added NPC: ${npc.name} (${npc.id})`);
    }
    
    /**
     * Remove NPC from manager
     */
    removeNPC(npcId) {
        const npc = this.npcs.get(npcId);
        if (npc) {
            this.npcs.delete(npcId);
            console.log(`Removed NPC: ${npc.name} (${npcId})`);
            return true;
        }
        return false;
    }
    
    /**
     * Get NPC by ID
     */
    getNPC(npcId) {
        return this.npcs.get(npcId);
    }
    
    /**
     * Get all NPCs
     */
    getAllNPCs() {
        return Array.from(this.npcs.values());
    }
    
    /**
     * Update all NPCs
     */
    update(deltaTime, game) {
        this.npcs.forEach(npc => {
            npc.update(deltaTime, game);
        });
    }
    
    /**
     * Render all NPCs
     */
    render(ctx, camera) {
        this.npcs.forEach(npc => {
            npc.render(ctx, camera);
        });
    }
    
    /**
     * Check for interactions with player
     */
    checkInteractions(player) {
        if (Date.now() - this.lastInteractionTime < this.interactionCooldown) {
            return null;
        }
        
        const nearbyNPCs = this.getNPCsNearPlayer(player, this.interactionRadius);
        
        if (nearbyNPCs.length > 0) {
            // Find closest NPC
            let closestNPC = nearbyNPCs[0];
            let closestDistance = closestNPC.getDistanceTo(player.x, player.y);
            
            for (let i = 1; i < nearbyNPCs.length; i++) {
                const distance = nearbyNPCs[i].getDistanceTo(player.x, player.y);
                if (distance < closestDistance) {
                    closestNPC = nearbyNPCs[i];
                    closestDistance = distance;
                }
            }
            
            this.lastInteractionTime = Date.now();
            return closestNPC.interact(player);
        }
        
        return null;
    }
    
    /**
     * Get NPCs near player
     */
    getNPCsNearPlayer(player, radius) {
        const nearbyNPCs = [];
        
        this.npcs.forEach(npc => {
            if (npc.interactable && npc.isActive) {
                const distance = npc.getDistanceTo(player.x, player.y);
                if (distance <= radius) {
                    nearbyNPCs.push(npc);
                }
            }
        });
        
        return nearbyNPCs;
    }
    
    /**
     * Create a townie NPC
     */
    createTownie(config) {
        const townieConfig = {
            type: "townie",
            behavior: "wander",
            wanderRadius: 50,
            speed: 0.5,
            color: "#8B4513",
            dialogue: [
                "Hello there, traveler!",
                "The weather is lovely today.",
                "Have you seen any interesting sights?",
                "Welcome to our town!"
            ],
            ...config
        };
        
        const townie = new NPC(townieConfig);
        this.addNPC(townie);
        return townie;
    }
    
    /**
     * Create a merchant NPC
     */
    createMerchant(config) {
        const merchantConfig = {
            type: "merchant",
            behavior: "idle",
            color: "#4169E1",
            shopItems: [],
            dialogue: [
                "Welcome to my shop!",
                "I have the finest goods in town.",
                "Looking for something specific?",
                "Come back anytime!"
            ],
            ...config
        };
        
        const merchant = new NPC(merchantConfig);
        this.addNPC(merchant);
        return merchant;
    }
    
    /**
     * Create a quest giver NPC
     */
    createQuestGiver(config) {
        const questGiverConfig = {
            type: "quest_giver",
            behavior: "idle",
            color: "#32CD32",
            quests: [],
            dialogue: [
                "I have a task for you, brave adventurer.",
                "The town needs your help!",
                "Are you up for a challenge?",
                "Thank you for your service."
            ],
            ...config
        };
        
        const questGiver = new NPC(questGiverConfig);
        this.addNPC(questGiver);
        return questGiver;
    }
    
    /**
     * Create a guard NPC
     */
    createGuard(config) {
        const guardConfig = {
            type: "guard",
            behavior: "guard",
            color: "#696969",
            wanderRadius: 30,
            speed: 0.8,
            dialogue: [
                "Halt! Who goes there?",
                "The town is safe under my watch.",
                "Keep your wits about you, traveler.",
                "Move along, citizen."
            ],
            ...config
        };
        
        const guard = new NPC(guardConfig);
        this.addNPC(guard);
        return guard;
    }
    
    /**
     * Get save data for all NPCs
     */
    getSaveData() {
        const npcData = [];
        this.npcs.forEach(npc => {
            npcData.push(npc.getSaveData());
        });
        return npcData;
    }
    
    /**
     * Load NPCs from save data
     */
    loadSaveData(npcDataArray) {
        this.npcs.clear();
        
        npcDataArray.forEach(npcData => {
            const npc = new NPC(npcData);
            npc.loadSaveData(npcData);
            this.addNPC(npc);
        });
    }
}

// Export for use in other modules
export { NPC, NPCManager };
