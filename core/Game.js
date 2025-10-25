// Game Component - Runes of Tir na nÓg
// Main game coordinator that manages all game systems

import { Player } from '../player/Player.js';
import { Input } from '../input/Input.js';
import { World } from '../world/World.js';
import { Camera } from '../camera/Camera.js';
import { UI } from '../ui/UI.js';
import { GameLoop } from './GameLoop.js';
import PauseMenu from '../ui/PauseMenu.js';
import { AudioManager } from '../audio/AudioManager.js';
import { SaveSystem } from './SaveSystem.js';
import { Inventory } from '../ui/Inventory.js';
import { SecurityUtils } from '../utils/SecurityUtils.js';
import { NetworkManager } from './NetworkManager.js';
// NPC system imports - comment out if not using NPCs
import { NPC, NPCManager } from '../npc/NPC.js';
import { NPCFactory } from '../npc/NPCConfig.js';

export class Game {
    constructor(worldConfig = null, saveData = null, customWorldData = null) {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Resize canvas to fill the game container
        this.resizeCanvas();
        
        // Use canvas internal dimensions for rendering
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // Track save slot and playtime
        this.saveSlot = null;
        this.playtime = 0;
        this.playStartTime = Date.now();

        // Initialize game systems
        if (saveData) {
            // Load from save data
            this.loadFromSaveData(saveData);
        } else if (customWorldData) {
            // Load from custom world file
            console.log('🎮 Game: Loading from custom world data');
            this.world = new World(null, customWorldData);
            this.player = new Player(this.world.width, this.world.height, this.world);
            this.player.game = this; // Give player reference to game instance
            this.camera = new Camera(this.width, this.height);
        } else {
            // Create new world with config
            console.log('🎮 Game: Using default world generation');
            this.world = new World(worldConfig);
            this.player = new Player(this.world.width, this.world.height, this.world);
            this.player.game = this; // Give player reference to game instance
            this.camera = new Camera(this.width, this.height);
        }

        // Default to maximum zoom on touch devices (mobile)
        try {
            const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
            if (!saveData && isTouch && this.camera) {
                this.camera.setZoom(this.camera.maxZoom);
            }
        } catch (e) {
            // Ignore environment issues
        }
        
        this.input = new Input(this.canvas);
        this.ui = new UI();
        this.audioManager = new AudioManager();
        this.inventory = new Inventory(this);
        
        // Initialize multiplayer system
        this.networkManager = new NetworkManager(this);
        this.isMultiplayer = false;
        this.otherPlayers = {};
        
        // Initialize NPC system (if available)
        this.npcManager = null;
        this.npcFactory = null;
        if (typeof NPCManager !== 'undefined' && NPCManager) {
            this.npcManager = new NPCManager();
            this.npcFactory = new NPCFactory(this.npcManager);
        }
        
        this.gameLoop = new GameLoop(
            (deltaTime) => this.update(deltaTime),
            (alpha) => this.render(alpha)
        );

        this.isPaused = false;
        this.pauseMenu = new PauseMenu(this);
        this.setupEventListeners();
        
        // Initialize health bar
        this.initializeHealthBar();
        
        // Inject inventory styles
        this.injectInventoryStyles();
        
        // Initialize NPCs
        this.initializeNPCs();
        
        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
        
        // Start the game loop
        this.gameLoop.start();
        
        // Load and sync video settings
        this.loadVideoSettings();
    }

    // Load and sync video settings with world
    loadVideoSettings() {
        const showGrid = localStorage.getItem('showGrid');
        if (showGrid !== null) {
            this.world.setGridVisibility(showGrid === 'true');
        }
    }

    // Sync VideoSettings with World
    syncVideoSettings(videoSettings) {
        if (videoSettings && this.world) {
            this.world.setGridVisibility(videoSettings.getShowGrid());
        }
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        // Set canvas size to fill entire container (no borders)
        const availableWidth = containerRect.width;
        const availableHeight = containerRect.height;
        
        // Set canvas size to fill container
        this.canvas.width = availableWidth;
        this.canvas.height = availableHeight;
        this.canvas.style.width = availableWidth + 'px';
        this.canvas.style.height = availableHeight + 'px';
    }

    handleResize() {
        this.resizeCanvas();
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Update camera with new dimensions
        this.camera.canvasWidth = this.width;
        this.camera.canvasHeight = this.height;
    }

    setupEventListeners() {
        // Use the enhanced input system for keybind handling
        document.addEventListener('keydown', (e) => {
            // Handle keybind actions first, then update if needed
            if (this.input.isPausePressed() || e.code === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                this.togglePause();
                return;
            } else if (this.input.isInventoryPressed() || e.code === 'KeyI') {
                e.preventDefault();
                e.stopPropagation();
                if (this.inventory) {
                    this.inventory.toggle();
                }
                return;
            } else if (this.input.isDebugPressed()) {
                e.preventDefault();
                e.stopPropagation();
                this.toggleDebugMode();
                return;
            } else if (this.input.isScreenshotPressed()) {
                e.preventDefault();
                e.stopPropagation();
                this.takeScreenshot();
                return;
            } else if (this.input.isToggleAudioPressed()) {
                e.preventDefault();
                e.stopPropagation();
                this.toggleAudio();
                return;
            } else if (e.code === 'KeyE') {
                e.preventDefault();
                e.stopPropagation();
                this.handleInteraction();
                return;
            } else if (e.code === 'KeyF') {
                e.preventDefault();
                e.stopPropagation();
                // Attack nearest NPC
                this.handleNPCAttack();
                return;
            }
            
            // Only update keybinds if no action was handled
            this.input.updateKeybinds();
        });

        // Pause when window loses focus (and auto-save)
        window.addEventListener('blur', () => {
            if (!this.isPaused) {
                // In multiplayer, don't pause - just auto-save
                if (this.isMultiplayer) {
                    this.autoSave();
                } else {
                    // In single-player, show pause menu and pause
                    this.pauseMenu.show();
                    this.pause();
                    this.autoSave();
                }
            }
        });

        // Resume when window gains focus
        window.addEventListener('focus', () => {
            if (this.isPaused) {
                this.pauseMenu.hide();
                this.resume();
            }
        });

        // Auto-save before window closes
        window.addEventListener('beforeunload', () => {
            this.autoSave();
        });
    }

    togglePause() {
        // In multiplayer, open the compact menu instead of pausing
        if (this.isMultiplayer && window.gameControls) {
            window.gameControls.toggleCompactPause();
        } else {
            // In single-player, use the traditional pause menu
            this.pauseMenu.toggle();
        }
    }

    quitToMenu() {
        // Stop the game loop
        this.gameLoop.stop();

        // Redirect to main menu
        window.location.href = '../index.html';
    }

    pause() {
        console.log('Game: pause() method called, current paused state:', this.isPaused);
        if (!this.isPaused) {
            this.isPaused = true;
            this.gameLoop.stop();
            console.log('Game: Game loop stopped, paused state:', this.isPaused);
        } else {
            console.log('Game: Already paused, no need to pause again');
        }
    }

    resume() {
        console.log('Game: resume() method called, current paused state:', this.isPaused);
        if (this.isPaused) {
            this.isPaused = false;
            this.gameLoop.start();
            console.log('Game: Game loop started, paused state:', this.isPaused);
        } else {
            console.log('Game: Already running, no need to resume');
        }
    }

    update(deltaTime) {
        if (this.isPaused) return;

        // Update player with input, world collision, and audio
        this.player.update(this.input, this.world, this.audioManager);

        // Update camera to follow player with mouse controls
        const playerPos = this.player.getPosition();
        const worldDims = this.world.getDimensions();
        this.camera.update(playerPos.x, playerPos.y, worldDims.width, worldDims.height, this.input);

        // Send position update to multiplayer server
        this.sendPositionUpdate();

        // Update NPCs (if available)
        if (this.npcManager) {
            this.npcManager.update(deltaTime, this);
        }
        
        // Update UI with camera zoom info and debug data (if available)
        const cameraDebug = this.camera.getDebugInfo(playerPos.x, playerPos.y);
        this.ui.update(playerPos.x, playerPos.y, deltaTime, this.camera.getZoomLevel(), cameraDebug);
        
        // Update chat bubble positions to follow players
        if (window.chatManager && window.chatManager.updateChatBubblePositions) {
            window.chatManager.updateChatBubblePositions();
        }
    }

    render(alpha) {
        // Clear canvas with black background for better texture contrast
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Apply camera transform
        this.camera.applyTransform(this.ctx);

        // Render world with massive coverage
        this.world.render(this.ctx, this.camera, this.player);

        // Render NPCs (if available)
        if (this.npcManager) {
            this.npcManager.render(this.ctx, this.camera);
        }

        // Render player
        this.player.render(this.ctx);

        // Render other players in multiplayer
        this.renderOtherPlayers();
        this.renderServerNPCs();

        // Restore camera transform
        this.camera.restoreTransform(this.ctx);
    }


    setPlayerName(name) {
        // ✅ SECURITY FIX (VULN-007): Validate and sanitize player names
        const validName = SecurityUtils.validatePlayerName(name);
        
        if (!validName) {
            console.error('Invalid player name. Use letters, numbers, spaces, and basic punctuation only (1-20 chars).');
            console.log('Attempted name:', name);
            return false;
        }
        
        this.player.setName(validName);
        console.log(`Player name set to: ${validName}`);
        return true;
    }

    getPlayerName() {
        return this.player.getName();
    }

    // Multiplayer methods
    async connectToMultiplayer() {
        let username = localStorage.getItem('runes_username');
        
        // If no username, try to get from player object
        if (!username) {
            username = this.player.getName();
            if (username && username !== 'Player') {
                localStorage.setItem('runes_username', username);
                console.log(`Using player name as username: ${username}`);
            } else {
                console.error('No username found. Please set a username first.');
                return false;
            }
        }

        // Ensure player object has the same name
        if (this.player.getName() !== username) {
            this.player.setName(username);
            console.log(`Synchronized player name with username: ${username}`);
        }

        try {
            // Set up network manager callbacks
            this.setupNetworkCallbacks();
            
            // Connect to server
            const success = await this.networkManager.connect(username);
            
            if (success) {
                this.isMultiplayer = true;
                console.log(`Connected to multiplayer server as: ${username}`);
                return true;
            } else {
                console.error('Failed to connect to multiplayer server');
                return false;
            }
        } catch (error) {
            console.error('Multiplayer connection error:', error);
            return false;
        }
    }

    disconnectFromMultiplayer() {
        if (this.networkManager) {
            this.networkManager.disconnect();
            this.isMultiplayer = false;
            this.otherPlayers = {};
            console.log('Disconnected from multiplayer server');
        }
    }

    setupNetworkCallbacks() {
        // Connection status changes
        this.networkManager.onConnectionStatusChange = (status, data) => {
            console.log(`Multiplayer status: ${status}`);
            
            // Update UI or show notifications based on status
            switch (status) {
                case 'connected':
                    console.log('Successfully connected to multiplayer');
                    break;
                case 'disconnected':
                    console.log('Disconnected from multiplayer');
                    break;
                case 'reconnecting':
                    console.log('Attempting to reconnect...');
                    break;
                case 'error':
                    console.error('Multiplayer connection error');
                    break;
            }
        };

        // Player joined
        this.networkManager.onPlayerJoined = (playerId, playerData) => {
            console.log(`Player joined: ${playerData.name} at position (${playerData.x}, ${playerData.y})`);
            
            // Check if this is the default spawn position (100, 100) and distribute players
            if (playerData.x === 100 && playerData.y === 100) {
                const spawnPoint = this.getDistributedSpawnPoint();
                playerData.x = spawnPoint.x;
                playerData.y = spawnPoint.y;
                console.log(`Redistributed ${playerData.name} from default spawn to: (${spawnPoint.x}, ${spawnPoint.y})`);
            }
            // Also handle invalid positions
            else if (typeof playerData.x !== 'number' || typeof playerData.y !== 'number') {
                const spawnPoint = this.getDistributedSpawnPoint();
                playerData.x = spawnPoint.x;
                playerData.y = spawnPoint.y;
                console.warn(`Invalid position for ${playerData.name}, using distributed spawn: (${spawnPoint.x}, ${spawnPoint.y})`);
            }
            
            this.otherPlayers[playerId] = playerData;
        };

        // Player left
        this.networkManager.onPlayerLeft = (playerId, playerName) => {
            console.log(`Player left: ${playerName}`);
            delete this.otherPlayers[playerId];
        };

        // Player position updates
        this.networkManager.onPlayerPositionUpdate = (playerId, x, y) => {
            if (this.otherPlayers[playerId]) {
                this.otherPlayers[playerId].x = x;
                this.otherPlayers[playerId].y = y;
            }
        };

        // Error handling
        this.networkManager.onError = (errorMessage) => {
            console.error('Multiplayer error:', errorMessage);
        };
        
        // NPC callbacks
        this.networkManager.onNPCsReceived = (npcs) => {
            this.handleNPCsReceived(npcs);
        };
        this.networkManager.onNPCHealthUpdate = (data) => {
            this.handleNPCHealthUpdate(data);
        };
        this.networkManager.onNPCDefeated = (data) => {
            this.handleNPCDefeated(data);
        };
        this.networkManager.onNPCInteraction = (data) => {
            this.handleNPCInteraction(data);
        };
    }

    // NPC handler methods
    handleNPCsReceived(npcs) {
        console.log(`🎮 Received ${Object.keys(npcs).length} NPCs from server`);
        this.serverNPCs = npcs;
    }
    
    handleNPCHealthUpdate(data) {
        console.log(`❤️ NPC ${data.npc_id} health: ${data.health}/${data.max_health}`);
        // Update UI or show damage numbers
    }
    
    handleNPCDefeated(data) {
        console.log(`💀 NPC ${data.npc_name} defeated!`);
        // Remove NPC from rendering or show death animation
        if (this.serverNPCs && this.serverNPCs[data.npc_id]) {
            delete this.serverNPCs[data.npc_id];
        }
    }
    
    handleNPCInteraction(data) {
        console.log(`💬 ${data.npc_name}: ${data.dialogue.join(' ')}`);
        // Show dialogue UI
        if (this.ui) {
            this.ui.showDialogue(data.npc_name, data.dialogue);
        }
    }
    
    // NPC interaction methods
    interactWithNPC(npcId) {
        if (this.isMultiplayer && this.networkManager) {
            this.networkManager.sendNPCInteraction(npcId);
        }
    }
    
    attackNPC(npcId) {
        if (this.isMultiplayer && this.networkManager) {
            this.networkManager.sendNPCAttack(npcId);
        }
    }
    
    getNearestNPC(playerX, playerY, maxDistance = 100) {
        if (!this.serverNPCs) return null;
        
        let nearestNPC = null;
        let nearestDistance = maxDistance;
        
        for (const [npcId, npcData] of Object.entries(this.serverNPCs)) {
            const distance = Math.sqrt((playerX - npcData.x) ** 2 + (playerY - npcData.y) ** 2);
            if (distance < nearestDistance) {
                nearestNPC = { id: npcId, ...npcData };
                nearestDistance = distance;
            }
        }
        
        return nearestNPC;
    }
    
    handleInteraction() {
        if (this.isMultiplayer) {
            const playerPos = this.player.getPosition();
            const nearestNPC = this.getNearestNPC(playerPos.x, playerPos.y, 100);
            
            if (nearestNPC) {
                console.log(`🎮 Interacting with ${nearestNPC.name}`);
                this.interactWithNPC(nearestNPC.id);
            } else {
                console.log('🎮 No NPC nearby to interact with');
            }
        }
    }
    
    handleNPCAttack() {
        if (this.isMultiplayer) {
            const playerPos = this.player.getPosition();
            const nearestNPC = this.getNearestNPC(playerPos.x, playerPos.y, 80);
            
            if (nearestNPC) {
                console.log(`⚔️ Attacking ${nearestNPC.name}`);
                this.attackNPC(nearestNPC.id);
            } else {
                console.log('⚔️ No NPC nearby to attack');
            }
        }
    }

    renderOtherPlayers() {
        if (!this.isMultiplayer) return;

        const otherPlayers = this.networkManager.getOtherPlayers();
        
        for (const [playerId, playerData] of Object.entries(otherPlayers)) {
            // Use world coordinates directly since camera transform is already applied
            const worldX = playerData.x;
            const worldY = playerData.y;
            
            // Calculate screen bounds for culling (accounting for camera transform)
            const screenX = (worldX - this.camera.x) * this.camera.zoom;
            const screenY = (worldY - this.camera.y) * this.camera.zoom;
            
            // Only render if player is on screen
            if (screenX > -50 && screenX < this.width + 50 && 
                screenY > -50 && screenY < this.height + 50) {
                
                // Render other player using the same character sprite as local player
                this.ctx.save();
                
                // Use the same character image as the local player
                const characterImage = this.player.characterImage;
                const size = this.player.size;
                
                if (characterImage.complete && characterImage.naturalWidth > 0) {
                    // Calculate image dimensions to match local player
                    const imageSize = size * 1.5;
                    
                    // Draw the character image centered
                    this.ctx.drawImage(
                        characterImage,
                        worldX - imageSize / 2,
                        worldY - imageSize / 2,
                        imageSize,
                        imageSize
                    );
                } else {
                    // Fallback to colored square if image isn't loaded
                    this.ctx.fillStyle = playerData.color || '#4ade80';
                    this.ctx.fillRect(worldX - 6, worldY - 6, 12, 12);
                }
                
                // Render player name
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(playerData.name, worldX, worldY - 20);
                this.ctx.restore();
            }
        }
    }
    
    renderServerNPCs() {
        if (!this.isMultiplayer || !this.serverNPCs) return;
        
        for (const [npcId, npcData] of Object.entries(this.serverNPCs)) {
            const worldX = npcData.x;
            const worldY = npcData.y;
            
            // Only render if NPC is on screen
            if (worldX > this.camera.x - 100 && worldX < this.camera.x + this.width + 100 &&
                worldY > this.camera.y - 100 && worldY < this.camera.y + this.height + 100) {
                
                this.ctx.save();
                
                // Draw NPC body
                this.ctx.fillStyle = npcData.color || '#8b4513';
                this.ctx.fillRect(worldX - npcData.width/2, worldY - npcData.height/2, npcData.width, npcData.height);
                
                // Draw NPC name
                this.ctx.fillStyle = 'white';
                this.ctx.font = '12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(npcData.name, worldX, worldY - npcData.height/2 - 8);
                
                // Draw health bar if damaged
                if (npcData.health < npcData.max_health) {
                    const barWidth = npcData.width;
                    const barHeight = 4;
                    const healthPercent = npcData.health / npcData.max_health;
                    
                    // Background
                    this.ctx.fillStyle = 'red';
                    this.ctx.fillRect(worldX - barWidth/2, worldY - npcData.height/2 - 8, barWidth, barHeight);
                    
                    // Health
                    this.ctx.fillStyle = 'green';
                    this.ctx.fillRect(worldX - barWidth/2, worldY - npcData.height/2 - 8, barWidth * healthPercent, barHeight);
                }
                
                this.ctx.restore();
            }
        }
    }

    getDistributedSpawnPoint() {
        // Define multiple spawn points around the world
        const spawnPoints = [
            { x: 100, y: 100 },   // Center-left
            { x: 200, y: 150 },  // Center-right
            { x: 150, y: 200 },  // Bottom-center
            { x: 80, y: 80 },    // Top-left
            { x: 220, y: 120 },  // Top-right
            { x: 120, y: 250 },  // Bottom-left
            { x: 180, y: 180 },  // Bottom-right
            { x: 160, y: 90 }    // Top-center
        ];
        
        // Get the number of existing players to determine spawn point
        const playerCount = Object.keys(this.otherPlayers).length;
        const spawnIndex = playerCount % spawnPoints.length;
        
        const spawnPoint = spawnPoints[spawnIndex];
        console.log(`Distributing spawn point ${spawnIndex + 1}/${spawnPoints.length} for player ${playerCount + 1}: (${spawnPoint.x}, ${spawnPoint.y})`);
        
        return spawnPoint;
    }

    sendPositionUpdate() {
        if (this.isMultiplayer && this.networkManager) {
            this.networkManager.sendPositionUpdate(this.player.x, this.player.y);
        }
    }

    initializeHealthBar() {
        // Initialize health bar with full health
        this.ui.updateHealth(10, 10);
        
        // ✅ SECURITY FIX (VULN-014): Only expose debug functions in development mode
        if (window.DEBUG_MODE === true) {
            // Add test functionality for debugging
            window.testHealth = {
                setFull: () => this.ui.updateHealth(10, 10),
                setHalf: () => this.ui.updateHealth(5, 10),
                setLow: () => this.ui.updateHealth(2, 10),
                setEmpty: () => this.ui.updateHealth(0, 10),
                damage: (amount = 1) => {
                    const current = this.ui.healthBar.getCurrentHealth();
                    this.ui.updateHealth(Math.max(0, current - amount), 10);
                },
                heal: (amount = 1) => {
                    const current = this.ui.healthBar.getCurrentHealth();
                    this.ui.updateHealth(Math.min(10, current + amount), 10);
                }
            };
            
            console.log('Health bar initialized. Use testHealth methods to test:');
            console.log('- testHealth.setFull() - Full health');
            console.log('- testHealth.setHalf() - Half health');
            console.log('- testHealth.setLow() - Low health');
            console.log('- testHealth.setEmpty() - No health');
            console.log('- testHealth.damage(2) - Take 2 damage');
            console.log('- testHealth.heal(1) - Heal 1 health');
            
            // Add world regeneration for testing
            window.regenerateWorld = () => {
                this.world.generateWorld();
                console.log('World regenerated with new texture system');
            };
            
            // Add audio testing functions
            window.testAudio = {
                playWater: () => this.audioManager.playWaterSound(),
                playFootstep: () => this.audioManager.playFootstepSound(),
                setVolume: (volume) => this.audioManager.setVolume(volume),
                toggleAudio: () => {
                    const newState = !this.audioManager.isEnabled;
                    this.audioManager.setEnabled(newState);
                    console.log('Audio', newState ? 'enabled' : 'disabled');
                }
            };
            
            console.log('Audio system initialized. Use testAudio methods:');
            console.log('- testAudio.playWater() - Play water sound');
            console.log('- testAudio.playFootstep() - Play footstep sound');
            console.log('- testAudio.setVolume(0.5) - Set volume (0-1)');
            console.log('- testAudio.toggleAudio() - Toggle audio on/off');
            
            console.log('🔧 DEBUG MODE ENABLED - Debug functions available');
        } else {
            console.log('✅ Production mode - Debug functions disabled for security');
        }
    }
    
    initializeNPCs() {
        // Skip NPC initialization in multiplayer mode
        const urlParams = new URLSearchParams(window.location.search);
        const isMultiplayer = urlParams.get('multiplayer') === 'true';
        
        if (isMultiplayer) {
            console.log('NPC system enabled in multiplayer mode - MMO RPG mode!');
        }
        
        if (!this.npcManager || !this.npcFactory) {
            console.log('NPC system not available - skipping NPC initialization');
            return;
        }
        
        // Load NPCs from world data first
        if (this.world.npcData && this.world.npcData.length > 0) {
            console.log('🐭 Creating NPCs from world data...');
            this.world.npcData.forEach(async npcConfig => {
                // Load custom image if NPC is marked as custom
                if (npcConfig.isCustom || npcConfig.type === 'custom') {
                    await this.loadCustomNPCImage(npcConfig);
                }
                
                const npc = new NPC(npcConfig);
                this.npcManager.addNPC(npc);
                console.log(`🐭 Created NPC: ${npc.name} at (${npc.x}, ${npc.y})`);
            });
        } else {
            console.log('🐭 No NPCs found in world data');
        }
        
        // Check if Bob is enabled in world generator settings (default: true)
        const bobEnabled = localStorage.getItem('bobEnabled');
        const shouldSpawnBob = bobEnabled === null ? true : bobEnabled === 'true';
        
        if (shouldSpawnBob) {
            // Create Bob near the player spawn point
            const worldDims = this.world.getDimensions();
            const playerSpawnPoint = this.world.getRandomSpawnPoint('player');
            this.npcFactory.createBobInWorld(worldDims.width, worldDims.height, playerSpawnPoint);
            console.log('✅ Bob NPC spawned (world generator setting: enabled)');
        } else {
            console.log('❌ Bob NPC not spawned (world generator setting: disabled)');
        }
        
        // Future NPC spawning based on density setting
        // const npcDensity = parseFloat(localStorage.getItem('npcDensity') || '1');
        
        // Create townies
        // this.npcFactory.createTownies(200, 200, 100);
        
        // Create guards
        // this.npcFactory.createGuards();
        
        // Create special NPCs
        // this.npcFactory.createSpecialNPCs();
        
        console.log(`Initialized ${this.npcManager.getAllNPCs().length} NPCs`);
    }
    
    /**
     * Load custom NPC image from persistent folder
     */
    async loadCustomNPCImage(npcConfig) {
        try {
            const npcName = npcConfig.name;
            
            // Use customImage path if provided, otherwise construct from name
            const imagePath = npcConfig.customImage || `assets/npc/persistent/${npcName}.png`;
            
            console.log(`🖼️ Loading custom image for ${npcName}: ${imagePath}`);
            
            // Check if it's already a base64 data URL
            if (imagePath.startsWith('data:image/')) {
                // Already a base64 data URL, no need to fetch
                npcConfig.customImage = imagePath;
                npcConfig.isCustom = true;
                console.log(`✅ Using existing base64 image for ${npcName}`);
                return;
            }
            
            // Try to load the image from file path
            const response = await fetch(imagePath);
            if (response.ok) {
                const blob = await response.blob();
                const reader = new FileReader();
                
                reader.onload = () => {
                    npcConfig.customImage = reader.result; // Base64 data URL
                    npcConfig.isCustom = true;
                    console.log(`✅ Loaded custom image for ${npcName}`);
                };
                
                reader.readAsDataURL(blob);
            } else {
                console.warn(`⚠️ Custom image not found for ${npcName}: ${imagePath}`);
            }
        } catch (error) {
            console.warn(`⚠️ Failed to load custom image for ${npcConfig.name}:`, error);
        }
    }
    
    handleInteraction() {
        if (!this.npcManager) {
            return;
        }
        
        const interaction = this.npcManager.checkInteractions(this.player);
        if (interaction) {
            this.handleNPCInteraction(interaction);
        }
    }
    
    handleNPCInteraction(interaction) {
        switch (interaction.type) {
            case "dialogue":
                this.showDialogue(interaction.npc, interaction.message);
                break;
            case "shop":
                this.openShop(interaction.npc, interaction.items);
                break;
            case "quest":
                this.showQuest(interaction.npc, interaction.quest);
                break;
        }
    }
    
    showDialogue(npcName, message) {
        // Simple dialogue display - can be enhanced with proper UI
        console.log(`${npcName}: ${message}`);
        
        // Create temporary dialogue display
        const dialogueDiv = document.createElement('div');
        dialogueDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            border: 2px solid #8A2BE2;
            max-width: 400px;
            text-align: center;
            z-index: 10000;
            font-family: Arial, sans-serif;
        `;
        
        // ✅ SECURITY FIX (VULN-002, VULN-015): Use DOM creation instead of innerHTML
        // Create title element
        const titleElement = document.createElement('h3');
        titleElement.style.cssText = 'color: #8A2BE2; margin: 0 0 10px 0;';
        titleElement.textContent = SecurityUtils.sanitizeText(npcName); // Sanitized
        
        // Create message element
        const messageElement = document.createElement('p');
        messageElement.style.cssText = 'margin: 0 0 15px 0;';
        messageElement.textContent = SecurityUtils.sanitizeText(message); // Sanitized
        
        // Create close button (no inline onclick)
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.cssText = `
            background: #8A2BE2;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 5px;
            cursor: pointer;
        `;
        closeButton.addEventListener('click', () => dialogueDiv.remove());
        
        // Assemble dialogue
        dialogueDiv.appendChild(titleElement);
        dialogueDiv.appendChild(messageElement);
        dialogueDiv.appendChild(closeButton);
        
        document.body.appendChild(dialogueDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (dialogueDiv.parentElement) {
                dialogueDiv.remove();
            }
        }, 5000);
    }
    
    openShop(npcName, items) {
        console.log(`Opening shop with ${npcName}:`, items);
        // TODO: Implement shop UI
        this.showDialogue(npcName, "Welcome to my shop! (Shop UI coming soon)");
    }
    
    showQuest(npcName, quest) {
        console.log(`Quest from ${npcName}:`, quest);
        // TODO: Implement quest UI
        this.showDialogue(npcName, `Quest: ${quest.title} - ${quest.description}`);
    }

    injectInventoryStyles() {
        // Check if styles already exist
        if (document.getElementById('inventory-styles')) {
            return;
        }
        
        // Create and inject inventory styles
        const styleElement = document.createElement('style');
        styleElement.id = 'inventory-styles';
        styleElement.textContent = this.inventory.getStyles();
        document.head.appendChild(styleElement);
        
        console.log('Inventory initialized. Press "I" to open inventory.');
    }

    toggleDebugMode() {
        // Toggle debug mode for UI
        if (this.ui && this.ui.toggleDebug) {
            this.ui.toggleDebug();
        }
        console.log('Debug mode toggled');
    }

    takeScreenshot() {
        // Create a screenshot of the current game state
        try {
            const canvas = this.canvas;
            const link = document.createElement('a');
            link.download = `runes-screenshot-${Date.now()}.png`;
            link.href = canvas.toDataURL();
            link.click();
            console.log('Screenshot saved!');
        } catch (error) {
            console.error('Failed to take screenshot:', error);
        }
    }

    toggleAudio() {
        // Toggle audio on/off
        if (this.audioManager) {
            const newState = !this.audioManager.isEnabled;
            this.audioManager.setEnabled(newState);
            console.log('Audio', newState ? 'enabled' : 'disabled');
        }
    }

    // Serialize game state for saving
    serializeGameState() {
        // Update playtime
        const currentPlaytime = this.playtime + Math.floor((Date.now() - this.playStartTime) / 1000);
        
        return {
            config: this.world.config,
            worldData: {
                tiles: this.world.tiles,
                width: this.world.width,
                height: this.world.height
            },
            playerState: {
                position: { x: this.player.x, y: this.player.y },
                health: this.ui.healthBar.getCurrentHealth(),
                name: this.player.nameTag ? this.player.nameTag.name : 'Player'
            },
            cameraState: {
                zoom: this.camera.zoom
            },
            metadata: {
                playtime: currentPlaytime,
                lastSaved: Date.now(),
                version: '1.0.0'
            }
        };
    }

    // Load game state from save data
    loadFromSaveData(saveData) {
        // Restore world
        this.world = new World(saveData.config);
        this.world.tiles = saveData.worldData.tiles;
        
        // Restore player
        this.player = new Player(this.width, this.height, this.world);
        this.player.game = this; // Give player reference to game instance
        if (saveData.playerState.position) {
            this.player.x = saveData.playerState.position.x;
            this.player.y = saveData.playerState.position.y;
        }
        
        // Restore camera
        this.camera = new Camera(this.width, this.height);
        if (saveData.cameraState && saveData.cameraState.zoom) {
            this.camera.zoom = saveData.cameraState.zoom;
        }
        
        // Restore metadata
        this.playtime = saveData.metadata?.playtime || 0;
        this.playStartTime = Date.now();
        
        console.log('Game loaded from save data');
    }

    // Auto-save to current slot
    autoSave() {
        if (this.saveSlot) {
            const gameState = this.serializeGameState();
            const success = SaveSystem.saveWorld(this.saveSlot, gameState);
            if (success) {
                console.log(`Auto-saved to slot ${this.saveSlot}`);
            }
        }
    }

    // Manual save (called from pause menu)
    saveGame() {
        // If no slot assigned, prompt for slot
        if (!this.saveSlot) {
            // Ask user for slot (1 or 2)
            const slot = prompt('Save to slot (1 or 2):');
            const slotNum = parseInt(slot);
            if (slotNum === 1 || slotNum === 2) {
                this.saveSlot = slotNum;
            } else {
                console.error('Invalid slot number');
                return false;
            }
        }
        
        const gameState = this.serializeGameState();
        const success = SaveSystem.saveWorld(this.saveSlot, gameState);
        
        if (success) {
            console.log(`Game saved to slot ${this.saveSlot}`);
            return true;
        }
        return false;
    }
}
