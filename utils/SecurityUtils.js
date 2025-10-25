/**
 * Security Utilities for Runes of Tir na nÓg
 * Provides input validation, output sanitization, and security helpers
 * 
 * USAGE:
 * import { SecurityUtils } from './utils/SecurityUtils.js';
 * const safe = SecurityUtils.sanitizeHTML(userInput);
 * 
 * @module SecurityUtils
 * @version 1.0.0
 */

export class SecurityUtils {
    /**
     * HTML Sanitization
     * Removes potentially dangerous HTML/JavaScript from user input
     * 
     * @param {string} str - User input string
     * @returns {string} Sanitized string safe for HTML rendering
     */
    static sanitizeHTML(str) {
        if (typeof str !== 'string') {
            return '';
        }
        
        // Create temporary div for text-to-HTML conversion
        const div = document.createElement('div');
        div.textContent = str; // textContent automatically escapes HTML
        return div.innerHTML;
    }

    /**
     * Strict sanitization - removes all HTML tags
     * Use for names, titles, etc. where no formatting is allowed
     * 
     * @param {string} str - User input
     * @returns {string} Plain text only
     */
    static sanitizeText(str) {
        if (typeof str !== 'string') {
            return '';
        }
        
        return str
            .replace(/[<>'"]/g, '') // Remove HTML special chars
            .trim()
            .substring(0, 200); // Max length
    }

    /**
     * Validate and sanitize player name
     * 
     * @param {string} name - Player name input
     * @returns {string|null} Sanitized name or null if invalid
     */
    static validatePlayerName(name) {
        if (typeof name !== 'string') {
            return null;
        }
        
        // Remove HTML/script tags
        const cleaned = name
            .replace(/[<>]/g, '')
            .trim();
        
        // Validate length
        if (cleaned.length < 1 || cleaned.length > 20) {
            return null;
        }
        
        // Only allow alphanumeric, spaces, and basic punctuation
        const validPattern = /^[a-zA-Z0-9\s\-_\.]+$/;
        if (!validPattern.test(cleaned)) {
            return null;
        }
        
        return cleaned;
    }

    /**
     * Validate URL parameter
     * Prevents path traversal and injection attacks
     * 
     * @param {string} param - URL parameter value
     * @param {string[]} whitelist - Allowed values
     * @returns {string|null} Sanitized param or null if invalid
     */
    static validateURLParam(param, whitelist = []) {
        if (typeof param !== 'string') {
            return null;
        }
        
        // Remove path traversal attempts
        const cleaned = param.replace(/[\/\\.]/g, '');
        
        // Only alphanumeric and hyphens
        const sanitized = cleaned.replace(/[^a-z0-9-]/gi, '');
        
        // Check whitelist if provided
        if (whitelist.length > 0 && !whitelist.includes(sanitized)) {
            return null;
        }
        
        return sanitized;
    }

    /**
     * Validate save data structure
     * Prevents corrupted or malicious save data from crashing the game
     * 
     * @param {Object} saveData - Save data object
     * @returns {boolean} True if valid, false otherwise
     */
    static validateSaveData(saveData) {
        try {
            // Basic structure check
            if (!saveData || typeof saveData !== 'object') {
                return false;
            }
            
            // Version check
            if (!saveData.metadata?.version || saveData.metadata.version !== '1.0.0') {
                console.error('Save data version mismatch');
                return false;
            }
            
            // Validate worldData
            if (!saveData.worldData || typeof saveData.worldData !== 'object') {
                return false;
            }
            
            // Tile count validation (prevent memory exhaustion)
            if (!Array.isArray(saveData.worldData.tiles)) {
                return false;
            }
            
            const MAX_TILES = 1000000; // ~1M tiles max
            if (saveData.worldData.tiles.length > MAX_TILES) {
                console.error(`Too many tiles: ${saveData.worldData.tiles.length}`);
                return false;
            }
            
            // Validate playerState
            if (!saveData.playerState || typeof saveData.playerState !== 'object') {
                return false;
            }
            
            // Health validation
            const health = saveData.playerState.health;
            if (typeof health !== 'number' || !Number.isFinite(health) || 
                health < 0 || health > 1000) {
                console.error('Invalid health value');
                return false;
            }
            
            // Position validation
            const pos = saveData.playerState.position;
            if (!pos || !Number.isFinite(pos.x) || !Number.isFinite(pos.y)) {
                console.error('Invalid player position');
                return false;
            }
            
            // Name validation
            if (saveData.playerState.name) {
                const validName = this.validatePlayerName(saveData.playerState.name);
                if (!validName) {
                    console.error('Invalid player name in save');
                    return false;
                }
            }
            
            return true;
            
        } catch (error) {
            console.error('Save validation error:', error);
            return false;
        }
    }

    /**
     * Validate keybind settings
     * Prevents prototype pollution and invalid key codes
     * 
     * @param {Object} keybinds - Keybind configuration object
     * @param {Object} defaultKeybinds - Default keybinds for reference
     * @returns {Object} Validated and sanitized keybinds
     */
    static validateKeybinds(keybinds, defaultKeybinds) {
        // Whitelist of valid key codes
        const VALID_KEYS = new Set([
            'KeyA', 'KeyB', 'KeyC', 'KeyD', 'KeyE', 'KeyF', 'KeyG', 'KeyH',
            'KeyI', 'KeyJ', 'KeyK', 'KeyL', 'KeyM', 'KeyN', 'KeyO', 'KeyP',
            'KeyQ', 'KeyR', 'KeyS', 'KeyT', 'KeyU', 'KeyV', 'KeyW', 'KeyX',
            'KeyY', 'KeyZ',
            'Digit0', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5',
            'Digit6', 'Digit7', 'Digit8', 'Digit9',
            'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
            'ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight',
            'AltLeft', 'AltRight', 'Space', 'Enter', 'Escape', 'Tab',
            'Backspace', 'Delete', 'Insert', 'Home', 'End', 'PageUp', 'PageDown',
            'Equal', 'Minus', 'BracketLeft', 'BracketRight', 'Semicolon',
            'Quote', 'Backslash', 'Comma', 'Period', 'Slash', 'Backquote',
            'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'
        ]);
        
        const validated = {};
        
        // Only validate known actions from defaultKeybinds
        for (const [action, defaultKey] of Object.entries(defaultKeybinds)) {
            const userKey = keybinds[action];
            
            // Use user key if valid, otherwise use default
            if (typeof userKey === 'string' && VALID_KEYS.has(userKey)) {
                validated[action] = userKey;
            } else {
                validated[action] = defaultKey;
            }
        }
        
        return validated;
    }

    /**
     * Validate world configuration
     * Ensures tile percentages are valid and total 100%
     * 
     * @param {Object} config - World configuration
     * @returns {boolean} True if valid
     */
    static validateWorldConfig(config) {
        try {
            // Validate worldSize
            const validSizes = ['small', 'medium', 'large'];
            if (!validSizes.includes(config.worldSize)) {
                console.error('Invalid world size');
                return false;
            }
            
            // Validate seed (alphanumeric only)
            if (config.seed && typeof config.seed === 'string') {
                const validSeed = /^[a-zA-Z0-9]+$/;
                if (!validSeed.test(config.seed) || config.seed.length > 50) {
                    console.error('Invalid seed format');
                    return false;
                }
            }
            
            // Validate tile percentages
            const percentages = config.tilePercentages;
            if (!percentages || typeof percentages !== 'object') {
                return false;
            }
            
            // Check each percentage
            const requiredTypes = ['grass', 'water', 'wall', 'cave'];
            for (const type of requiredTypes) {
                const value = percentages[type];
                if (typeof value !== 'number' || value < 0 || value > 100) {
                    console.error(`Invalid ${type} percentage: ${value}`);
                    return false;
                }
            }
            
            // Check total equals 100
            const total = requiredTypes.reduce((sum, type) => sum + percentages[type], 0);
            if (Math.abs(total - 100) > 0.01) { // Allow for floating point errors
                console.error(`Tile percentages must total 100%, got ${total}%`);
                return false;
            }
            
            return true;
            
        } catch (error) {
            console.error('World config validation error:', error);
            return false;
        }
    }

    /**
     * Validate custom world data from JSON
     * 
     * @param {Object} worldData - Custom world data
     * @returns {boolean} True if valid
     */
    static validateCustomWorld(worldData) {
        try {
            // Basic structure
            if (!worldData || typeof worldData !== 'object') {
                return false;
            }
            
            // Version check - support both 1.0 and 2.0 formats
            // If no version specified, default to 2.0 if spawn points present, otherwise 1.0
            if (!worldData.version) {
                worldData.version = worldData.spawnPoints ? '2.0' : '1.0';
            }
            
            if (worldData.version !== '1.0' && worldData.version !== '2.0') {
                console.error('Unsupported world format version:', worldData.version);
                return false;
            }
            
            // Dimensions - support both worldWidth/worldHeight and width/height
            const worldWidth = worldData.worldWidth || worldData.width;
            const worldHeight = worldData.worldHeight || worldData.height;
            
            if (typeof worldWidth !== 'number' || typeof worldHeight !== 'number') {
                console.error('Missing world dimensions');
                return false;
            }
            
            // Bounds check
            const MAX_DIM = 500; // Max 500x500 tiles
            if (worldWidth > MAX_DIM || worldHeight > MAX_DIM ||
                worldWidth < 10 || worldHeight < 10) {
                console.error('World dimensions out of bounds');
                return false;
            }
            
            // Support both old format (tiles array) and new format (mapData 2D arrays)
            if (worldData.tiles && Array.isArray(worldData.tiles)) {
                // Old format: individual tile objects
                const expectedTiles = worldWidth * worldHeight;
                if (worldData.tiles.length > expectedTiles * 1.1) { // Allow 10% overhead
                    console.error('Too many tiles for world size');
                    return false;
                }
                
                // Validate each tile
                const validTypes = ['grass', 'water', 'wall', 'cave', 'mana'];
                for (const tile of worldData.tiles) {
                    if (!tile || typeof tile !== 'object') {
                        return false;
                    }
                    
                    // Type validation
                    if (!validTypes.includes(tile.type)) {
                        console.error(`Invalid tile type: ${tile.type}`);
                        return false;
                    }
                    
                    // Position validation
                    if (typeof tile.x !== 'number' || typeof tile.y !== 'number' ||
                        tile.x < 0 || tile.y < 0 ||
                        tile.x >= worldWidth || tile.y >= worldHeight) {
                        console.error(`Invalid tile position: ${tile.x}, ${tile.y}`);
                        return false;
                    }
                }
            } else if (worldData.mapData && Array.isArray(worldData.mapData)) {
                // New format: 2D mapData arrays
                if (worldData.mapData.length !== worldHeight) {
                    console.error('mapData height does not match world height');
                    return false;
                }
                
                for (let y = 0; y < worldData.mapData.length; y++) {
                    const row = worldData.mapData[y];
                    if (!Array.isArray(row) || row.length !== worldWidth) {
                        console.error(`mapData row ${y} is invalid`);
                        return false;
                    }
                    
                    // Validate tile values (should be numbers representing tile types)
                    for (let x = 0; x < row.length; x++) {
                        const tileValue = row[x];
                        if (typeof tileValue !== 'number' || tileValue < 0) {
                            console.error(`Invalid tile value at ${x},${y}: ${tileValue}`);
                            return false;
                        }
                    }
                }
            } else {
                console.error('Missing tiles array or mapData array');
                return false;
            }
            
            // Validate spawn points if present (version 2.0+)
            if (worldData.version === '2.0' && worldData.spawnPoints) {
                if (!this.validateSpawnPoints(worldData.spawnPoints, worldWidth, worldHeight)) {
                    return false;
                }
            }
            
            return true;
            
        } catch (error) {
            console.error('Custom world validation error:', error);
            return false;
        }
    }

    /**
     * Validate spawn points data structure
     * 
     * @param {Object} spawnPointsData - Spawn points data object
     * @param {number} worldWidth - World width for bounds checking
     * @param {number} worldHeight - World height for bounds checking
     * @returns {boolean} True if valid
     */
    static validateSpawnPoints(spawnPointsData, worldWidth, worldHeight) {
        try {
            // Basic structure check
            if (!spawnPointsData || typeof spawnPointsData !== 'object') {
                return false;
            }
            
            // Check required properties
            if (!Array.isArray(spawnPointsData.spawnPoints)) {
                console.error('Spawn points must be an array');
                return false;
            }
            
            if (typeof spawnPointsData.spawnCount !== 'number') {
                console.error('Spawn count must be a number');
                return false;
            }
            
            if (!Array.isArray(spawnPointsData.spawnTypes)) {
                console.error('Spawn types must be an array');
                return false;
            }
            
            // Validate spawn count matches array length
            if (spawnPointsData.spawnCount !== spawnPointsData.spawnPoints.length) {
                console.error('Spawn count mismatch');
                return false;
            }
            
            // Validate each spawn point
            const validSpawnTypes = ['player', 'enemy', 'npc', 'item'];
            for (const spawnPoint of spawnPointsData.spawnPoints) {
                if (!spawnPoint || typeof spawnPoint !== 'object') {
                    console.error('Invalid spawn point object');
                    return false;
                }
                
                // Required properties
                if (typeof spawnPoint.id !== 'number' || 
                    typeof spawnPoint.x !== 'number' || 
                    typeof spawnPoint.y !== 'number' ||
                    typeof spawnPoint.type !== 'string' ||
                    typeof spawnPoint.name !== 'string') {
                    console.error('Missing required spawn point properties');
                    return false;
                }
                
                // Type validation
                if (!validSpawnTypes.includes(spawnPoint.type)) {
                    console.error(`Invalid spawn point type: ${spawnPoint.type}`);
                    return false;
                }
                
                // Position validation - warn but don't reject world
                if (spawnPoint.x < 0 || spawnPoint.y < 0 ||
                    spawnPoint.x >= worldWidth || spawnPoint.y >= worldHeight) {
                    console.warn(`⚠️ Spawn point out of bounds: ${spawnPoint.x}, ${spawnPoint.y} - will be clamped during world loading`);
                    // Don't return false - let World.js handle the clamping
                }
                
                // Name validation
                if (spawnPoint.name.length < 1 || spawnPoint.name.length > 50) {
                    console.error(`Invalid spawn point name length: ${spawnPoint.name}`);
                    return false;
                }
            }
            
            return true;
            
        } catch (error) {
            console.error('Spawn points validation error:', error);
            return false;
        }
    }

    /**
     * Validate and sanitize settings data
     * 
     * @param {string} key - Setting key
     * @param {*} value - Setting value
     * @returns {*} Sanitized value or null if invalid
     */
    static validateSetting(key, value) {
        switch (key) {
            case 'renderDistance':
                // Must be one of the allowed values
                const validDistances = [16, 32, 48, 64, 80, 96, 112, 128];
                const num = parseInt(value);
                return validDistances.includes(num) ? num : 32; // Default
                
            case 'fogIntensity':
                // 0-100 percentage
                const fog = parseInt(value);
                return (fog >= 0 && fog <= 100) ? fog : 75; // Default
                
            default:
                console.warn(`Unknown setting: ${key}`);
                return null;
        }
    }

    /**
     * Check localStorage quota before writing
     * Prevents quota exceeded errors
     * 
     * @param {string} key - localStorage key
     * @param {string} value - Value to store
     * @param {number} maxSize - Max size in bytes (default 5MB)
     * @returns {boolean} True if safe to write
     */
    static checkStorageQuota(key, value, maxSize = 5 * 1024 * 1024) {
        try {
            const size = new Blob([value]).size;
            
            if (size > maxSize) {
                console.error(`Data too large: ${size} bytes (max: ${maxSize})`);
                return false;
            }
            
            // Try to get current usage (not supported in all browsers)
            if (navigator.storage && navigator.storage.estimate) {
                navigator.storage.estimate().then(estimate => {
                    const percentUsed = (estimate.usage / estimate.quota) * 100;
                    if (percentUsed > 90) {
                        console.warn(`Storage almost full: ${percentUsed.toFixed(1)}%`);
                    }
                });
            }
            
            return true;
            
        } catch (error) {
            console.error('Storage quota check failed:', error);
            return false;
        }
    }

    /**
     * Safe JSON parse with error handling
     * 
     * @param {string} jsonString - JSON string to parse
     * @param {*} fallback - Fallback value if parse fails
     * @returns {*} Parsed object or fallback
     */
    static safeJSONParse(jsonString, fallback = null) {
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('JSON parse error:', error);
            return fallback;
        }
    }

    /**
     * Generate Content Security Policy meta tag content
     * 
     * @returns {string} CSP content string
     */
    static getCSPContent() {
        return `
            default-src 'self';
            script-src 'self';
            style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
            font-src 'self' https://fonts.gstatic.com;
            img-src 'self' data:;
            connect-src 'self';
            frame-ancestors 'none';
            base-uri 'self';
            form-action 'self';
        `.replace(/\s+/g, ' ').trim();
    }

    /**
     * Rate limiting for actions (prevent spam/DoS)
     * 
     * @param {string} actionKey - Unique key for this action
     * @param {number} maxCalls - Max calls allowed
     * @param {number} timeWindow - Time window in milliseconds
     * @returns {boolean} True if action is allowed
     */
    static rateLimit(actionKey, maxCalls = 10, timeWindow = 1000) {
        if (!this._rateLimiters) {
            this._rateLimiters = new Map();
        }
        
        const now = Date.now();
        const limiter = this._rateLimiters.get(actionKey) || { calls: [], blocked: 0 };
        
        // Remove old calls outside time window
        limiter.calls = limiter.calls.filter(time => now - time < timeWindow);
        
        // Check if limit exceeded
        if (limiter.calls.length >= maxCalls) {
            limiter.blocked++;
            this._rateLimiters.set(actionKey, limiter);
            console.warn(`Rate limit exceeded for ${actionKey} (${limiter.blocked} blocked)`);
            return false;
        }
        
        // Add new call
        limiter.calls.push(now);
        this._rateLimiters.set(actionKey, limiter);
        return true;
    }
}

// Freeze the class to prevent modification
Object.freeze(SecurityUtils);

export default SecurityUtils;

