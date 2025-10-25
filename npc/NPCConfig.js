/**
 * NPC Configurations - Chronicles of the Forgotten Realm
 * Predefined NPC configurations for easy setup
 */

const NPC_CONFIGS = {
    // Townie NPCs
    townies: {
        farmer: {
            name: "Old Farmer Tom",
            description: "A weathered farmer who tends to the crops outside town.",
            color: "#8B4513",
            behavior: "wander",
            wanderRadius: 80,
            speed: 0.3,
            dialogue: [
                "These crops won't tend themselves, you know.",
                "The soil here is rich and fertile.",
                "Have you seen any pests around the fields?",
                "A good harvest means a good winter."
            ]
        },
        
        baker: {
            name: "Martha the Baker",
            description: "The town's baker, always covered in flour.",
            color: "#F5DEB3",
            behavior: "idle",
            dialogue: [
                "Fresh bread, hot from the oven!",
                "The secret is in the kneading, dear.",
                "Would you like to try my famous apple pie?",
                "Nothing beats the smell of fresh bread."
            ]
        },
        
        blacksmith: {
            name: "Gareth the Blacksmith",
            description: "A burly blacksmith with arms like tree trunks.",
            color: "#2F4F4F",
            behavior: "idle",
            dialogue: [
                "Hot metal and hard work - that's my life.",
                "I can forge anything you need.",
                "These tools have served me well for years.",
                "The forge never sleeps when there's work to be done."
            ]
        },
        
        merchant: {
            name: "Silas the Trader",
            description: "A shrewd merchant with goods from distant lands.",
            color: "#4169E1",
            behavior: "idle",
            type: "merchant",
            shopItems: [
                { id: "health_potion", name: "Health Potion", price: 25, description: "Restores 50 HP" },
                { id: "mana_potion", name: "Mana Potion", price: 30, description: "Restores 30 MP" },
                { id: "iron_sword", name: "Iron Sword", price: 150, description: "A sturdy iron blade" },
                { id: "leather_armor", name: "Leather Armor", price: 100, description: "Basic protection" }
            ],
            dialogue: [
                "Welcome to my humble shop!",
                "I have goods from all corners of the realm.",
                "Looking for something specific?",
                "Quality goods at fair prices!"
            ]
        },
        
        quest_giver: {
            name: "Captain Marcus",
            description: "The town guard captain, always on duty.",
            color: "#696969",
            behavior: "guard",
            type: "quest_giver",
            wanderRadius: 40,
            speed: 0.6,
            quests: [
                {
                    id: "clear_goblins",
                    title: "Clear the Goblin Camp",
                    description: "A goblin camp has been spotted near the old ruins. Clear them out for the safety of the town.",
                    reward: { gold: 100, exp: 50 },
                    objectives: [
                        { type: "kill", target: "goblin", count: 5, current: 0 }
                    ],
                    status: "available"
                }
            ],
            dialogue: [
                "The town needs brave souls like you.",
                "I have a task that requires your skills.",
                "Safety is our top priority here.",
                "Thank you for helping keep the town safe."
            ]
        },
        
        innkeeper: {
            name: "Rosalind the Innkeeper",
            description: "A cheerful innkeeper who runs the local tavern.",
            color: "#DDA0DD",
            behavior: "idle",
            dialogue: [
                "Welcome to the Golden Stag Inn!",
                "We have the finest ale in the region.",
                "Need a room for the night?",
                "The hearth is always warm here."
            ]
        },
        
        scholar: {
            name: "Elder Thaddeus",
            description: "An ancient scholar who knows many secrets.",
            color: "#8B008B",
            behavior: "idle",
            dialogue: [
                "The old texts speak of great mysteries.",
                "Knowledge is the greatest treasure.",
                "Have you studied the ancient runes?",
                "Wisdom comes with age, young one."
            ]
        },
        
        child: {
            name: "Little Emma",
            description: "A curious child who loves to explore.",
            color: "#FFB6C1",
            behavior: "wander",
            wanderRadius: 60,
            speed: 0.8,
            dialogue: [
                "Hi! Want to play hide and seek?",
                "I found a shiny rock today!",
                "The grown-ups are so boring.",
                "Can you tell me a story?"
            ]
        }
    },
    
    // Guard NPCs
    guards: {
        town_guard_1: {
            name: "Guard Samuel",
            description: "A vigilant town guard.",
            color: "#696969",
            behavior: "patrol",
            patrolPoints: [
                { x: 200, y: 300 },
                { x: 300, y: 300 },
                { x: 300, y: 400 },
                { x: 200, y: 400 }
            ],
            speed: 0.7,
            dialogue: [
                "Halt! State your business.",
                "The town is safe under our watch.",
                "Keep your wits about you, traveler.",
                "Move along, citizen."
            ]
        },
        
        town_guard_2: {
            name: "Guard Elena",
            description: "A skilled town guard.",
            color: "#708090",
            behavior: "guard",
            wanderRadius: 50,
            speed: 0.6,
            dialogue: [
                "I've been keeping watch for hours.",
                "Nothing gets past me.",
                "The night shift is always the longest.",
                "Safety first, always."
            ]
        }
    },
    
    // Special NPCs
    special: {
        bob: {
            name: "Bob",
            description: "A mysterious wanderer with ancient knowledge and secrets to share.",
            color: "#f4e4bc", // Same beige color as player
            behavior: "wander",
            wanderRadius: 200, // Increased exploration range
            speed: 1.5, // Smooth, flowing movement
            width: 12, // Same size as player
            height: 12,
            usePlayerModel: true, // Flag to use player-style rendering
            acceleration: 0.6, // Smooth acceleration for Bob
            deceleration: 0.85, // Gentle deceleration
            dialogue: [
                "Greetings, traveler! I'm Bob, keeper of ancient secrets.",
                "The old texts speak of powerful runes hidden in these lands...",
                "Have you discovered the hidden chambers beneath the ruins?",
                "I sense great potential in you, young adventurer.",
                "The stars whisper of your destiny - listen carefully.",
                "Beware the shadows that lurk beyond the veil of reality.",
                "The ancient ones left clues scattered across this realm.",
                "Your journey has only just begun, but the end draws near.",
                "Magic flows through everything here - can you feel it?",
                "The world remembers all who have walked these paths before.",
                "Sometimes I wonder if we're all just players in a grand game...",
                "The truth about this place lies buried deeper than you think.",
                "Seek the crystal caves - they hold answers to your questions.",
                "The old gods still watch over us, even in their slumber.",
                "Your actions ripple through time itself - choose wisely."
            ]
        },
        
        mysterious_stranger: {
            name: "The Hooded Figure",
            description: "A mysterious figure in dark robes.",
            color: "#2F2F2F",
            behavior: "idle",
            dialogue: [
                "The shadows hold many secrets...",
                "Your destiny awaits, chosen one.",
                "The ancient powers stir once more.",
                "Beware the coming darkness."
            ]
        },
        
        traveling_bard: {
            name: "Lysander the Bard",
            description: "A traveling bard with tales from distant lands.",
            color: "#FF6347",
            behavior: "wander",
            wanderRadius: 100,
            speed: 0.4,
            dialogue: [
                "Let me sing you a tale of adventure!",
                "I've traveled to the farthest reaches of the realm.",
                "Music is the language of the soul.",
                "Every story has a grain of truth."
            ]
        }
    }
};

/**
 * NPC Factory - Creates NPCs from configurations
 */
class NPCFactory {
    constructor(npcManager) {
        this.npcManager = npcManager;
    }
    
    /**
     * Create NPC from configuration
     */
    createFromConfig(config, x, y) {
        const npcConfig = {
            ...config,
            x: x,
            y: y
        };
        
        let npc;
        
        switch (config.type) {
            case "merchant":
                npc = this.npcManager.createMerchant(npcConfig);
                break;
            case "quest_giver":
                npc = this.npcManager.createQuestGiver(npcConfig);
                break;
            default:
                npc = this.npcManager.createTownie(npcConfig);
                break;
        }
        
        return npc;
    }
    
    /**
     * Create all townies from config
     */
    createTownies(startX = 100, startY = 100, spacing = 80) {
        const townies = [];
        let currentX = startX;
        let currentY = startY;
        
        Object.values(NPC_CONFIGS.townies).forEach((config, index) => {
            const npc = this.createFromConfig(config, currentX, currentY);
            townies.push(npc);
            
            // Move to next position
            currentX += spacing;
            if (currentX > startX + spacing * 3) {
                currentX = startX;
                currentY += spacing;
            }
        });
        
        return townies;
    }
    
    /**
     * Create guards from config
     */
    createGuards() {
        const guards = [];
        
        Object.values(NPC_CONFIGS.guards).forEach((config, index) => {
            const npc = this.createFromConfig(config, 200 + index * 100, 300);
            guards.push(npc);
        });
        
        return guards;
    }
    
    /**
     * Create special NPCs
     */
    createSpecialNPCs() {
        const specialNPCs = [];
        
        Object.values(NPC_CONFIGS.special).forEach((config, index) => {
            const npc = this.createFromConfig(config, 400 + index * 150, 200);
            specialNPCs.push(npc);
        });
        
        return specialNPCs;
    }
    
    /**
     * Create Bob NPC near player spawn point
     */
    createBobInWorld(worldWidth, worldHeight, playerSpawnPoint = null) {
        const bobConfig = NPC_CONFIGS.special.bob;
        let spawnX, spawnY;
        
        if (playerSpawnPoint) {
            // Spawn Bob near the player spawn point (within 100-200 pixels)
            const offsetX = (Math.random() - 0.5) * 200; // -100 to +100
            const offsetY = (Math.random() - 0.5) * 200; // -100 to +100
            spawnX = playerSpawnPoint.x + offsetX;
            spawnY = playerSpawnPoint.y + offsetY;
            
            // Ensure Bob doesn't spawn outside world bounds
            spawnX = Math.max(50, Math.min(worldWidth - 50, spawnX));
            spawnY = Math.max(50, Math.min(worldHeight - 50, spawnY));
            
            console.log(`Spawning Bob near player spawn at (${Math.floor(spawnX)}, ${Math.floor(spawnY)})`);
        } else {
            // Fallback to random location if no player spawn point
            const margin = 200;
            spawnX = Math.random() * (worldWidth - margin * 2) + margin;
            spawnY = Math.random() * (worldHeight - margin * 2) + margin;
            
            console.log(`Spawning Bob at random location (${Math.floor(spawnX)}, ${Math.floor(spawnY)})`);
        }
        
        // Snap Bob to tile grid (16px tiles) to prevent floating
        const tileSize = 16;
        spawnX = Math.floor(spawnX / tileSize) * tileSize + tileSize / 2; // Center on tile
        spawnY = Math.floor(spawnY / tileSize) * tileSize + tileSize / 2; // Center on tile
        
        return this.createFromConfig(bobConfig, spawnX, spawnY);
    }
}

// Export configurations
export { NPC_CONFIGS, NPCFactory };
