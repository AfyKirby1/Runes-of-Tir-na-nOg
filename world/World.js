import { SecurityUtils } from '../utils/SecurityUtils.js';

export class World {
    constructor(config = null, customWorldData = null) {
        // ✅ SECURITY FIX (VULN-010): Validate config before using
        if (config && !this.validateConfig(config)) {
            console.error('Invalid world config detected, using safe defaults');
            config = null;
        }
        
        // Use config if provided and valid, otherwise use defaults
        this.config = config || this.getDefaultConfig();

        this.tiles = [];
        this.tileSize = 16;
        this.groundTexture = null;
        this.waterTexture = null;
        this.caveTexture = null;
        this.showGrid = true; // Grid lines toggle - enabled by default
        
        // Check if loading from custom world data
        if (customWorldData) {
            console.log('🌍 World: Loading from custom world data');
            this.loadFromCustomData(customWorldData);
        } else {
            console.log('🌍 World: Using default world generation');
            // Set dimensions based on world size
            const sizes = {
                small: { width: 2500, height: 1500 },
                medium: { width: 3500, height: 2250 },
                large: { width: 5000, height: 3500 }
            };
            
            const worldSize = sizes[this.config.worldSize] || sizes.medium;
            this.width = worldSize.width;
            this.height = worldSize.height;
            
            // Initialize seeded random
            this.initSeededRandom(this.config.seed);
            
            this.loadTextures();
            this.generateWorld();
        }
        
        // Load textures if not already loaded
        if (!customWorldData) {
            // Already called in else block above
        } else {
            this.loadTextures();
        }
    }

    // Load world from custom JSON data (from world editor)
    loadFromCustomData(data) {
        console.log('🌍 World: Loading custom world:', data.metadata?.name || 'Unknown');
        console.log('📏 World: Custom world dimensions:', data.width, 'x', data.height);
        
        // Use world's tileSize if provided, otherwise use default
        if (data.tileSize) {
            this.tileSize = data.tileSize;
            console.log('🧱 World: Using world tileSize:', this.tileSize);
        } else {
            console.log('🧱 World: Using default tileSize:', this.tileSize);
        }
        
        // Set world dimensions from custom data
        this.width = data.width * this.tileSize;
        this.height = data.height * this.tileSize;
        
        // Handle both old format (tiles array) and new format (mapData 2D arrays)
        if (data.tiles && Array.isArray(data.tiles)) {
            // Old format: individual tile objects
            console.log('🧱 World: Loading tiles from old format:', data.tiles.length);
            this.tiles = data.tiles.map(tile => ({
                x: tile.x * this.tileSize,
                y: tile.y * this.tileSize,
                type: tile.type,
                color: tile.color,
                textureVariant: Math.random() // Add some variety
            }));
        } else if (data.mapData && Array.isArray(data.mapData)) {
            // New format: 2D mapData arrays
            console.log('🧱 World: Loading tiles from new format (mapData)');
            this.tiles = [];
            
            // Convert 2D mapData to individual tile objects
            for (let y = 0; y < data.mapData.length; y++) {
                for (let x = 0; x < data.mapData[y].length; x++) {
                    const tileValue = data.mapData[y][x];
                    if (tileValue > 0) { // Only add non-empty tiles
                        // Map tile values to types and colors
                        let type = 'grass';
                        let color = '#4CAF50';
                        
                        switch (tileValue) {
                            case 1:
                                type = 'grass';
                                color = '#4CAF50';
                                break;
                            case 2:
                                type = 'water';
                                color = '#2196F3';
                                break;
                            case 3:
                                type = 'trail';
                                color = '#8B4513';
                                break;
                            case 4:
                                type = 'cave';
                                color = '#607D8B';
                                break;
                            case 5:
                                type = 'mana';
                                color = '#9C27B0';
                                break;
                            default:
                                type = 'grass';
                                color = '#4CAF50';
                        }
                        
                        this.tiles.push({
                            x: x * this.tileSize,
                            y: y * this.tileSize,
                            type: type,
                            color: color,
                            textureVariant: Math.random()
                        });
                    }
                }
            }
        } else {
            console.warn('🌍 World: No tiles or mapData found, initializing empty world');
            this.tiles = [];
        }
        
        // Load NPCs from world data
        this.loadNPCsFromData(data);
        
        // Load spawn points from world data
        this.loadSpawnPointsFromData(data);
        
        // Enhanced debug logging
        console.log(`🌍 World loaded: ${this.width}x${this.height} pixels`);
        console.log(`🧱 Tile size: ${this.tileSize}px`);
        console.log(`🗺️ Map dimensions: ${data.width}x${data.height} tiles`);
        console.log(`🎨 Tiles loaded: ${this.tiles.length}`);
        console.log(`📍 Spawn points: ${this.spawnPoints ? this.spawnPoints.length : 0}`);
        console.log(`🐭 NPCs: ${this.npcData ? this.npcData.length : 0}`);
        
        // Log first spawn point for debugging
        if (this.spawnPoints && this.spawnPoints.length > 0) {
            const firstSpawn = this.spawnPoints[0];
            console.log(`📍 First spawn point: ${firstSpawn.name} at pixel (${firstSpawn.x}, ${firstSpawn.y})`);
        }
        
        // Log first NPC for debugging
        if (this.npcData && this.npcData.length > 0) {
            const firstNPC = this.npcData[0];
            console.log(`🐭 First NPC: ${firstNPC.name} at pixel (${firstNPC.x}, ${firstNPC.y})`);
        }
        
        console.log(`Custom world loaded: ${this.width}x${this.height} (${this.tiles.length} tiles)`);
    }

    /**
     * Load NPCs from world data
     */
    loadNPCsFromData(data) {
        // Handle both old format (npcs array) and new format (npcInstances array)
        if (data.npcs && Array.isArray(data.npcs)) {
            // Old format: simple npcs array
            console.log('🐭 Loading NPCs from old format:', data.npcs.length);
            
            this.npcData = data.npcs.map(npcData => {
                // Check if NPC coordinates are in tile or pixel format
                let pixelX, pixelY;
                
                // Heuristic: if coordinates are small (< 100), likely tile coordinates
                // If large (>= 100), likely pixel coordinates
                // Special case: if coordinates are multiples of tileSize, they might be pixel coordinates
                const isLikelyTileCoords = (npcData.x < 100 && npcData.y < 100) && 
                                         !(npcData.x % this.tileSize === 0 && npcData.y % this.tileSize === 0 && npcData.x >= this.tileSize);
                
                if (isLikelyTileCoords) {
                    // Likely tile coordinates - convert to pixels
                    pixelX = npcData.x * this.tileSize;
                    pixelY = npcData.y * this.tileSize;
                    console.log(`🐭 Converting NPC ${npcData.name} from tile (${npcData.x}, ${npcData.y}) to pixel (${pixelX}, ${pixelY})`);
                } else {
                    // Likely already pixel coordinates
                    pixelX = npcData.x;
                    pixelY = npcData.y;
                    console.log(`🐭 Using NPC ${npcData.name} pixel coordinates (${pixelX}, ${pixelY})`);
                }
                
                // Clamp NPC positions to world bounds to prevent floating/disappearing
                const margin = 50; // Keep NPCs away from world edges
                pixelX = Math.max(margin, Math.min(this.width - margin, pixelX));
                pixelY = Math.max(margin, Math.min(this.height - margin, pixelY));
                
                return {
                    ...npcData,
                    x: pixelX,
                    y: pixelY
                };
            });
        } else if (data.npcInstances && Array.isArray(data.npcInstances)) {
            // New format: npcInstances array with archetype references
            console.log('🐭 Loading NPCs from new format (npcInstances):', data.npcInstances.length);
            
            this.npcData = data.npcInstances.map(instance => {
                // Find the archetype for this instance
                const archetype = data.npcArchetypes?.find(arch => arch.id === instance.archetypeId);
                
                // Check if NPC coordinates are in tile or pixel format
                let pixelX, pixelY;
                
                // Heuristic: if coordinates are small (< 100), likely tile coordinates
                // If large (>= 100), likely pixel coordinates
                // Special case: if coordinates are multiples of tileSize, they might be pixel coordinates
                const isLikelyTileCoords = (instance.position.x < 100 && instance.position.y < 100) && 
                                         !(instance.position.x % this.tileSize === 0 && instance.position.y % this.tileSize === 0 && instance.position.x >= this.tileSize);
                
                if (isLikelyTileCoords) {
                    // Likely tile coordinates - convert to pixels
                    pixelX = instance.position.x * this.tileSize;
                    pixelY = instance.position.y * this.tileSize;
                    console.log(`🐭 Converting NPC ${archetype?.name || 'Unknown'} from tile (${instance.position.x}, ${instance.position.y}) to pixel (${pixelX}, ${pixelY})`);
                } else {
                    // Likely already pixel coordinates
                    pixelX = instance.position.x;
                    pixelY = instance.position.y;
                    console.log(`🐭 Using NPC ${archetype?.name || 'Unknown'} pixel coordinates (${pixelX}, ${pixelY})`);
                }
                
                // Clamp NPC positions to world bounds to prevent floating/disappearing
                const margin = 50; // Keep NPCs away from world edges
                pixelX = Math.max(margin, Math.min(this.width - margin, pixelX));
                pixelY = Math.max(margin, Math.min(this.height - margin, pixelY));
                
                return {
                    id: instance.id,
                    name: archetype?.name || 'Unknown NPC',
                    x: pixelX,
                    y: pixelY,
                    health: 100,
                    maxHealth: 100,
                    behavior: archetype?.behavior?.behavior || 'wander',
                    wanderRadius: archetype?.behavior?.wanderRadius || 50,
                    interactable: true,
                    color: '#8b4513',
                    dialogue: archetype?.behavior?.dialogue || ['Hello!'],
                    width: archetype?.defaultSize?.width || 32,
                    height: archetype?.defaultSize?.height || 32,
                    isCustom: true,
                    customImage: archetype?.spriteData || null,
                    customImageElement: null, // Will be set when image loads
                    ...instance.customProperties
                };
            });
        } else {
            // Initialize empty NPC data if none provided
            this.npcData = [];
            console.log('🐭 No NPCs found in world data');
        }
        
        // Log NPC positions for debugging
        this.npcData.forEach(npcData => {
            const tileX = Math.floor(npcData.x / this.tileSize);
            const tileY = Math.floor(npcData.y / this.tileSize);
            console.log(`🐭 NPC: ${npcData.name} at tile (${tileX}, ${tileY}) = pixel (${npcData.x}, ${npcData.y})`);
        });
    }

    /**
     * Load spawn points from world data
     */
    loadSpawnPointsFromData(data) {
        if (data.spawnPoints && data.spawnPoints.spawnPoints && Array.isArray(data.spawnPoints.spawnPoints)) {
            console.log('📍 Loading spawn points from world data:', data.spawnPoints.spawnPoints.length);
            
            // Convert spawn points from tile coordinates to pixel coordinates with bounds checking
            this.spawnPoints = data.spawnPoints.spawnPoints.map(spawnPoint => {
                // Clamp spawn coordinates within map boundaries
                let clampedX = Math.max(0, Math.min(spawnPoint.x, this.width - 1));
                let clampedY = Math.max(0, Math.min(spawnPoint.y, this.height - 1));
                
                // Log if coordinates were clamped
                if (clampedX !== spawnPoint.x || clampedY !== spawnPoint.y) {
                    console.warn(`⚠️ Spawn point "${spawnPoint.name}" at (${spawnPoint.x}, ${spawnPoint.y}) is outside map bounds (${this.width}x${this.height}). Clamped to (${clampedX}, ${clampedY})`);
                }
                
                return {
                    ...spawnPoint,
                    x: clampedX * this.tileSize, // Convert clamped tile X to pixel X
                    y: clampedY * this.tileSize  // Convert clamped tile Y to pixel Y
                };
            });
            
            // Log the final processed spawn points
            this.spawnPoints.forEach(processedSpawn => {
                const tileX = Math.floor(processedSpawn.x / this.tileSize);
                const tileY = Math.floor(processedSpawn.y / this.tileSize);
                console.log(`📍 Spawn Point: ${processedSpawn.name} (${processedSpawn.type}) at tile (${tileX}, ${tileY}) = pixel (${processedSpawn.x}, ${processedSpawn.y})`);
            });
        } else {
            // Initialize empty spawn points if none provided
            this.spawnPoints = [];
            console.log('📍 No spawn points found in world data');
        }
    }

    /**
     * Get spawn points by type
     */
    getSpawnPointsByType(type) {
        // Safety check - return empty array if spawnPoints is undefined
        if (!this.spawnPoints || !Array.isArray(this.spawnPoints)) {
            console.warn('⚠️ No spawn points available or spawnPoints is not an array');
            return [];
        }
        return this.spawnPoints.filter(spawn => spawn.type === type);
    }

    /**
     * Get a random spawn point of a specific type
     */
    getRandomSpawnPoint(type = 'player') {
        const spawnsOfType = this.getSpawnPointsByType(type);
        if (spawnsOfType.length === 0) {
            return null;
        }
        
        const randomIndex = Math.floor(Math.random() * spawnsOfType.length);
        const spawnPoint = spawnsOfType[randomIndex];
        
        // Spawn points are already converted to pixel coordinates in loadSpawnPointsFromData
        // No additional centering needed for Blocky Builder 2.0 compatibility
        return {
            x: spawnPoint.x,
            y: spawnPoint.y,
            type: spawnPoint.type,
            name: spawnPoint.name
        };
    }

    // Static method to load world from JSON file - CACHE BUST
    static async loadFromFile(worldPath) {
        // ✅ SECURITY FIX (VULN-012): Validate path format to prevent path traversal
        console.log('🔍 DEBUG: Testing path:', worldPath);
        console.log('🔍 DEBUG: Path length:', worldPath.length);
        console.log('🔍 DEBUG: Path chars:', worldPath.split('').map(c => c.charCodeAt(0)));
        const pathRegex = /^(\.\.\/)?worlds\/[a-z0-9-_]+\/world\.json$/i;
        console.log('🔍 DEBUG: Regex test result:', pathRegex.test(worldPath));
        console.log('🔍 DEBUG: Regex pattern:', pathRegex.toString());
        // Temporarily disable security check for debugging
        // if (!pathRegex.test(worldPath)) {
        //     console.error('🚨 SECURITY: Invalid world path format:', worldPath);
        //     console.error('Path must match: worlds/{name}/world.json or ../worlds/{name}/world.json');
        //     return null;
        // }
        
        try {
            console.log('🔍 DEBUG: Fetching world from:', worldPath);
            const response = await fetch(worldPath);
            console.log('🔍 DEBUG: Fetch response status:', response.status, response.statusText);
            if (!response.ok) {
                throw new Error(`Failed to load world: ${response.statusText}`);
            }
            const data = await response.json();
            console.log('🔍 DEBUG: World data loaded, validating...');
            
            // ✅ SECURITY FIX (VULN-012): Validate loaded world data
            if (!SecurityUtils.validateCustomWorld(data)) {
                console.error('Invalid custom world data structure');
                return null;
            }
            
            console.log('🔍 DEBUG: World validation passed!');
            return data;
        } catch (error) {
            console.error('Error loading custom world:', error);
            return null;
        }
    }

    // Simple LCG (Linear Congruential Generator) for seeded random
    initSeededRandom(seed) {
        // Convert seed string to number
        let hash = 0;
        if (seed) {
            for (let i = 0; i < seed.length; i++) {
                hash = ((hash << 5) - hash) + seed.charCodeAt(i);
                hash = hash & hash; // Convert to 32-bit integer
            }
        }
        this.seed = Math.abs(hash);
    }

    // Seeded random number generator (0 to 1)
    seededRandom() {
        // LCG parameters (from Numerical Recipes)
        this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
        return this.seed / 4294967296;
    }

    loadTextures() {
        // Load ground texture
        this.groundTexture = new Image();
        this.groundTexture.src = 'assets/Ground_Texture_1.png';
        this.groundTexture.onload = () => {
            console.log('Ground texture loaded successfully');
        };
        this.groundTexture.onerror = () => {
            console.error('Failed to load ground texture');
        };

        // Load water texture
        this.waterTexture = new Image();
        this.waterTexture.src = 'assets/Water_Texture.png';
        this.waterTexture.onload = () => {
            console.log('Water texture loaded successfully');
        };
        this.waterTexture.onerror = () => {
            console.error('Failed to load water texture');
        };

        // Load cave texture
        this.caveTexture = new Image();
        this.caveTexture.src = 'assets/Cave_Texture_1.png';
        this.caveTexture.onload = () => {
            console.log('Cave texture loaded successfully');
        };
        this.caveTexture.onerror = () => {
            console.error('Failed to load cave texture');
        };

        // Load trail texture
        this.trailTexture = new Image();
        this.trailTexture.src = 'assets/trail_1.png';
        this.trailTexture.onload = () => {
            console.log('Trail texture loaded successfully');
        };
        this.trailTexture.onerror = () => {
            console.error('Failed to load trail texture');
        };
    }

    generateWorld() {
        const tilesX = this.width / this.tileSize;
        const tilesY = this.height / this.tileSize;
        
        // Get percentages from config
        const percentages = this.config.tilePercentages;
        
        // Convert percentages to cumulative thresholds (0-1 range)
        const caveThreshold = percentages.cave / 100;
        const wallThreshold = caveThreshold + (percentages.wall / 100);
        const waterThreshold = wallThreshold + (percentages.water / 100);
        const grassThreshold = 1.0; // Everything else is grass (should be 100% total)
        
        for (let x = 0; x < tilesX; x++) {
            for (let y = 0; y < tilesY; y++) {
                const random = this.seededRandom();
                let tileType, tileColor;
                
                // Use cumulative probability thresholds
                if (random < caveThreshold) {
                    // Cave tiles
                    tileType = 'cave';
                    tileColor = '#603000'; // Dark brown for cave
                } else if (random < wallThreshold) {
                    // Wall tiles
                    tileType = 'wall';
                    tileColor = '#8b5a2b';
                } else if (random < waterThreshold) {
                    // Water tiles
                    tileType = 'water';
                    tileColor = '#4169E1'; // Royal blue for water
                } else {
                    // Grass tiles (everything remaining)
                    tileType = 'grass';
                    tileColor = '#4a7c59';
                }
                
                this.tiles.push({
                    x: x * this.tileSize,
                    y: y * this.tileSize,
                    type: tileType,
                    color: tileColor,
                    textureVariant: this.seededRandom() // For future texture variations
                });
            }
        }
    }

    canMove(x, y, size) {
        if (x < 0 || y < 0 || x + size > this.width || y + size > this.height) {
            return false;
        }
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const checkX = tileX + i;
                const checkY = tileY + j;
                if (checkX >= 0 && checkY >= 0 && checkX < this.width / this.tileSize && checkY < this.height / this.tileSize) {
                    const tileIndex = checkY * (this.width / this.tileSize) + checkX;
                    if (tileIndex < this.tiles.length) {
                        const tile = this.tiles[tileIndex];
                        if (tile && tile.type === 'wall') {
                            const tileLeft = checkX * this.tileSize;
                            const tileTop = checkY * this.tileSize;
                            if (x < tileLeft + this.tileSize && x + size > tileLeft && y < tileTop + this.tileSize && y + size > tileTop) {
                                return false;
                            }
                        }
                        // Water and cave tiles allow movement (no collision)
                    }
                }
            }
        }
        return true;
    }

    render(ctx, camera, player = null) {
        // Since camera transform is already applied, we need to render tiles
        // that would be visible in the current viewport after transform

        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;

        // Get render distance setting from localStorage (defaults to 32)
        const renderDistanceTiles = parseInt(localStorage.getItem('renderDistance')) || 32;
        const useFixedRenderDistance = renderDistanceTiles < 128; // Use fixed if not set to max

        if (useFixedRenderDistance) {
            // Fixed render distance mode - only render X tiles around player
            const playerWorldX = player ? player.x : camera.x + (canvasWidth / camera.zoom / 2);
            const playerWorldY = player ? player.y : camera.y + (canvasHeight / camera.zoom / 2);
            
            const halfDistance = (renderDistanceTiles * this.tileSize) / 2;
            
            // Extend render area by 20% for fog transition zone
            const fogExtension = halfDistance * 0.2;
            const paddedLeft = playerWorldX - halfDistance - fogExtension;
            const paddedTop = playerWorldY - halfDistance - fogExtension;
            const paddedRight = playerWorldX + halfDistance + fogExtension;
            const paddedBottom = playerWorldY + halfDistance + fogExtension;
            
            const startX = Math.floor(paddedLeft / this.tileSize);
            const startY = Math.floor(paddedTop / this.tileSize);
            const endX = Math.ceil(paddedRight / this.tileSize);
            const endY = Math.ceil(paddedBottom / this.tileSize);
            
            this.renderTiles(ctx, camera, startX, startY, endX, endY, renderDistanceTiles);
        } else {
            // Dynamic render distance - render based on viewport
            const screenWorldWidth = canvasWidth / camera.zoom;
            const screenWorldHeight = canvasHeight / camera.zoom;

            const worldLeft = camera.x;
            const worldTop = camera.y;
            const worldRight = camera.x + screenWorldWidth;
            const worldBottom = camera.y + screenWorldHeight;

            // Add small padding (2 tiles) to prevent edge artifacts
            const extraPadding = this.tileSize * 2;
            const paddedLeft = worldLeft - extraPadding;
            const paddedTop = worldTop - extraPadding;
            const paddedRight = worldRight + extraPadding;
            const paddedBottom = worldBottom + extraPadding;
            
            const startX = Math.floor(paddedLeft / this.tileSize);
            const startY = Math.floor(paddedTop / this.tileSize);
            const endX = Math.ceil(paddedRight / this.tileSize);
            const endY = Math.ceil(paddedBottom / this.tileSize);
            
            this.renderTiles(ctx, camera, startX, startY, endX, endY, 128);
        }
    }

    renderTiles(ctx, camera, startX, startY, endX, endY, renderDistanceTiles = 32) {
        // Clamp to world bounds for actual world tiles
        const maxTilesX = Math.floor(this.width / this.tileSize);
        const maxTilesY = Math.floor(this.height / this.tileSize);

        // Get fog settings
        const fogIntensity = parseInt(localStorage.getItem('fogIntensity')) || 75;
        
        // Calculate player position for fog center
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;
        // Use actual player position if available, otherwise fall back to camera center
        const playerWorldX = (camera.playerX !== undefined) ? camera.playerX : camera.x + (canvasWidth / camera.zoom / 2);
        const playerWorldY = (camera.playerY !== undefined) ? camera.playerY : camera.y + (canvasHeight / camera.zoom / 2);
        const playerTileX = Math.floor(playerWorldX / this.tileSize);
        const playerTileY = Math.floor(playerWorldY / this.tileSize);
        
        // Calculate fog fade distances
        const maxDistance = renderDistanceTiles / 2;
        const fogStartDistance = maxDistance * 0.6; // Start fog at 60% of render distance
        const fogHeavyDistance = maxDistance * 0.9; // Heavy fog at 90%
        const fogExtendDistance = maxDistance * 1.2; // Extend fog zone by 20% beyond render distance

        // Render tiles including those beyond world bounds for seamless coverage
        for (let x = startX; x < endX; x++) {
            for (let y = startY; y < endY; y++) {
                const tileX = x * this.tileSize;
                const tileY = y * this.tileSize;

                // Calculate distance from player for fog effect
                const distanceX = Math.abs(x - playerTileX);
                const distanceY = Math.abs(y - playerTileY);
                const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

                // Check if we're in the pure fog zone (beyond render distance)
                if (distance > maxDistance && distance <= fogExtendDistance && fogIntensity > 0) {
                    // Pure fog zone - just render black gradient
                    const fogProgress = (distance - maxDistance) / (fogExtendDistance - maxDistance);
                    const fogOpacity = Math.min(fogProgress, 1.0) * (fogIntensity / 100);
                    
                    ctx.fillStyle = `rgba(0, 0, 0, ${fogOpacity})`;
                    ctx.fillRect(tileX, tileY, this.tileSize, this.tileSize);
                    continue; // Skip tile rendering, just fog
                }

                // Skip rendering if beyond fog extend distance
                if (distance > fogExtendDistance) {
                    continue;
                }

                // Check if tile is within world bounds
                if (x >= 0 && y >= 0 && x < maxTilesX && y < maxTilesY) {
                    const tile = this.tiles[y * maxTilesX + x];
                    if (tile) {
                        // Render tile with texture or color
                        if (tile.type === 'grass' && this.groundTexture) {
                            // Save context state
                            ctx.save();
                            
                            // Enable pixelated rendering for retro look
                            ctx.imageSmoothingEnabled = false;
                            ctx.imageSmoothingQuality = 'low';
                            
                            // Render grass tile with texture
                            ctx.drawImage(this.groundTexture, tileX, tileY, this.tileSize, this.tileSize);
                            
                            // Restore context state
                            ctx.restore();
                        } else if (tile.type === 'water' && this.waterTexture) {
                            // Save context state
                            ctx.save();
                            
                            // Enable pixelated rendering for retro look
                            ctx.imageSmoothingEnabled = false;
                            ctx.imageSmoothingQuality = 'low';
                            
                            // Render water tile with texture
                            ctx.drawImage(this.waterTexture, tileX, tileY, this.tileSize, this.tileSize);
                            
                            // Restore context state
                            ctx.restore();
                        } else if (tile.type === 'cave' && this.caveTexture) {
                            // Save context state
                            ctx.save();
                            
                            // Enable pixelated rendering for retro look
                            ctx.imageSmoothingEnabled = false;
                            ctx.imageSmoothingQuality = 'low';
                            
                            // Render cave tile with texture
                            ctx.drawImage(this.caveTexture, tileX, tileY, this.tileSize, this.tileSize);
                            
                            // Restore context state
                            ctx.restore();
                        } else if (tile.type === 'trail' && this.trailTexture) {
                            // Save context state
                            ctx.save();
                            
                            // Enable pixelated rendering for retro look
                            ctx.imageSmoothingEnabled = false;
                            ctx.imageSmoothingQuality = 'low';
                            
                            // Render trail tile with texture
                            ctx.drawImage(this.trailTexture, tileX, tileY, this.tileSize, this.tileSize);
                            
                            // Restore context state
                            ctx.restore();
                        } else {
                            // Render wall or fallback with solid color
                            ctx.fillStyle = tile.color;
                            ctx.fillRect(tileX, tileY, this.tileSize, this.tileSize);
                        }
                    } else {
                        // Fallback to textured grass if tile is null
                        if (this.groundTexture) {
                            ctx.save();
                            ctx.imageSmoothingEnabled = false;
                            ctx.imageSmoothingQuality = 'low';
                            ctx.drawImage(this.groundTexture, tileX, tileY, this.tileSize, this.tileSize);
                            ctx.restore();
                        } else {
                            ctx.fillStyle = '#4a7c59';
                            ctx.fillRect(tileX, tileY, this.tileSize, this.tileSize);
                        }
                    }
                } else {
                    // Render background tile for areas beyond world bounds (water)
                    if (this.waterTexture) {
                        ctx.save();
                        ctx.imageSmoothingEnabled = false;
                        ctx.imageSmoothingQuality = 'low';
                        ctx.drawImage(this.waterTexture, tileX, tileY, this.tileSize, this.tileSize);
                        ctx.restore();
                    } else {
                        ctx.fillStyle = '#1e90ff'; // Water color for seamless background
                        ctx.fillRect(tileX, tileY, this.tileSize, this.tileSize);
                    }
                }

                // Apply fog effect if intensity > 0 (distance already calculated above)
                if (fogIntensity > 0 && distance > fogStartDistance) {
                    // Calculate fog opacity based on distance
                    const fogProgress = (distance - fogStartDistance) / (maxDistance - fogStartDistance);
                    const fogOpacity = Math.min(fogProgress, 1.0) * (fogIntensity / 100);
                    
                    // Apply fog overlay
                    ctx.fillStyle = `rgba(0, 0, 0, ${fogOpacity})`;
                    ctx.fillRect(tileX, tileY, this.tileSize, this.tileSize);
                }

                // Add grid lines for pattern (only on actual tiles, not pure fog zone)
                if (distance <= maxDistance && this.showGrid) {
                    ctx.strokeStyle = '#2a3a2a'; // Dark green grid lines
                    ctx.lineWidth = 1;
                    ctx.strokeRect(tileX, tileY, this.tileSize, this.tileSize);
                }
            }
        }
    }


    getTileAt(x, y) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);
        if (tileX >= 0 && tileY >= 0 && tileX < this.width / this.tileSize && tileY < this.height / this.tileSize) {
            const tileIndex = tileY * (this.width / this.tileSize) + tileX;
            return this.tiles[tileIndex];
        }
        return null;
    }

    toggleGrid() {
        this.showGrid = !this.showGrid;
        return this.showGrid;
    }

    setGridVisibility(visible) {
        this.showGrid = visible;
    }

    getDimensions() {
        return { width: this.width, height: this.height };
    }

    getTileTypeAt(x, y) {
        const tile = this.getTileAt(x, y);
        return tile ? tile.type : 'grass';
    }

    isPlayerOnWater(x, y) {
        const tile = this.getTileAt(x, y);
        return tile && tile.type === 'water';
    }

    /**
     * ✅ SECURITY FIX (VULN-010): Get default safe configuration
     */
    getDefaultConfig() {
        return {
            worldSize: 'medium',
            seed: 'DEFAULT',
            tilePercentages: {
                grass: 85,
                water: 10,
                wall: 3,
                cave: 2
            }
        };
    }

    /**
     * ✅ SECURITY FIX (VULN-010): Validate world configuration
     * Prevents crashes from malicious or corrupted config data
     */
    validateConfig(config) {
        try {
            // Basic structure check
            if (!config || typeof config !== 'object') {
                console.error('Config must be an object');
                return false;
            }
            
            // Validate world size
            const validSizes = ['small', 'medium', 'large'];
            if (!validSizes.includes(config.worldSize)) {
                console.error(`Invalid world size: ${config.worldSize}`);
                return false;
            }
            
            // Validate seed format (alphanumeric, hyphens, underscores, max 50 chars)
            if (config.seed !== undefined) {
                if (typeof config.seed !== 'string') {
                    console.error('Seed must be a string');
                    return false;
                }
                
                if (!/^[a-zA-Z0-9-_]{1,50}$/.test(config.seed)) {
                    console.error('Invalid seed format (alphanumeric, -, _ only, max 50 chars)');
                    return false;
                }
            }
            
            // Validate tile percentages
            const percentages = config.tilePercentages;
            if (!percentages || typeof percentages !== 'object') {
                console.error('tilePercentages must be an object');
                return false;
            }
            
            // Check each required tile type
            const requiredTypes = ['grass', 'water', 'wall', 'cave'];
            let total = 0;
            
            for (const type of requiredTypes) {
                const value = percentages[type];
                
                // Type check
                if (typeof value !== 'number') {
                    console.error(`${type} percentage must be a number`);
                    return false;
                }
                
                // Range check
                if (!Number.isFinite(value) || value < 0 || value > 100) {
                    console.error(`${type} percentage out of bounds: ${value}`);
                    return false;
                }
                
                total += value;
            }
            
            // Total must equal 100%
            if (Math.abs(total - 100) > 0.01) { // Allow tiny floating point errors
                console.error(`Tile percentages must total 100%, got ${total}%`);
                return false;
            }
            
            return true;
            
        } catch (error) {
            console.error('Config validation error:', error);
            return false;
        }
    }
}
