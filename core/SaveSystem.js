// Save System - Runes of Tir na nÓg
// Handles local storage save/load operations for world persistence

import { SecurityUtils } from '../utils/SecurityUtils.js';

export class SaveSystem {
    static SAVE_KEY_PREFIX = 'cfr_world_slot_';
    static MAX_SLOTS = 2;
    static MAX_SAVE_SIZE = 5 * 1024 * 1024; // 5MB limit

    /**
     * Save world data to a specific slot
     * @param {number} slotNumber - Save slot (1 or 2)
     * @param {object} worldData - Complete world state
     * @returns {boolean} Success status
     */
    static saveWorld(slotNumber, worldData) {
        if (slotNumber < 1 || slotNumber > this.MAX_SLOTS) {
            console.error(`Invalid slot number: ${slotNumber}`);
            return false;
        }

        try {
            const saveKey = `${this.SAVE_KEY_PREFIX}${slotNumber}`;
            const saveData = {
                ...worldData,
                metadata: {
                    ...worldData.metadata,
                    lastSaved: Date.now(),
                    version: '1.0.0'
                }
            };

            const jsonData = JSON.stringify(saveData);
            
            // ✅ SECURITY FIX (VULN-008): Check save size before storing
            const sizeInBytes = new Blob([jsonData]).size;
            if (sizeInBytes > this.MAX_SAVE_SIZE) {
                console.error(`Save data too large: ${(sizeInBytes / 1024 / 1024).toFixed(2)} MB (max: ${(this.MAX_SAVE_SIZE / 1024 / 1024)} MB)`);
                return false;
            }
            
            localStorage.setItem(saveKey, jsonData);
            
            console.log(`World saved to slot ${slotNumber} (${(sizeInBytes / 1024).toFixed(2)} KB)`);
            return true;
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                console.error('localStorage quota exceeded');
            }
            console.error('Failed to save world:', error);
            return false;
        }
    }

    /**
     * Load world data from a specific slot
     * @param {number} slotNumber - Save slot (1 or 2)
     * @returns {object|null} World data or null if slot is empty/invalid
     */
    static loadWorld(slotNumber) {
        if (slotNumber < 1 || slotNumber > this.MAX_SLOTS) {
            console.error(`Invalid slot number: ${slotNumber}`);
            return null;
        }

        try {
            const saveKey = `${this.SAVE_KEY_PREFIX}${slotNumber}`;
            const jsonData = localStorage.getItem(saveKey);
            
            if (!jsonData) {
                console.log(`Slot ${slotNumber} is empty`);
                return null;
            }

            // ✅ SECURITY FIX (VULN-003): Validate save data before loading
            const saveData = SecurityUtils.safeJSONParse(jsonData, null);
            
            if (!saveData) {
                console.error('Failed to parse save data - corrupted or invalid JSON');
                return null;
            }
            
            // Validate save data structure using SecurityUtils
            if (!SecurityUtils.validateSaveData(saveData)) {
                console.error('Invalid save data format - validation failed');
                return null;
            }
            
            console.log(`World loaded from slot ${slotNumber}`);
            return saveData;
        } catch (error) {
            console.error('Failed to load world:', error);
            return null;
        }
    }

    /**
     * Get metadata for a save slot without loading full world
     * @param {number} slotNumber - Save slot (1 or 2)
     * @returns {object|null} Metadata or null if slot is empty
     */
    static getWorldInfo(slotNumber) {
        if (slotNumber < 1 || slotNumber > this.MAX_SLOTS) {
            return null;
        }

        try {
            const saveKey = `${this.SAVE_KEY_PREFIX}${slotNumber}`;
            const jsonData = localStorage.getItem(saveKey);
            
            if (!jsonData) {
                return null;
            }

            const saveData = JSON.parse(jsonData);
            
            return {
                slotNumber,
                seed: saveData.config?.seed || 'Unknown',
                worldSize: saveData.config?.worldSize || 'Medium',
                lastSaved: saveData.metadata?.lastSaved || Date.now(),
                playtime: saveData.metadata?.playtime || 0,
                playerPos: saveData.playerState?.position || { x: 0, y: 0 },
                exists: true
            };
        } catch (error) {
            console.error(`Failed to get info for slot ${slotNumber}:`, error);
            return null;
        }
    }

    /**
     * Delete world data from a specific slot
     * @param {number} slotNumber - Save slot (1 or 2)
     * @returns {boolean} Success status
     */
    static deleteWorld(slotNumber) {
        if (slotNumber < 1 || slotNumber > this.MAX_SLOTS) {
            console.error(`Invalid slot number: ${slotNumber}`);
            return false;
        }

        try {
            const saveKey = `${this.SAVE_KEY_PREFIX}${slotNumber}`;
            localStorage.removeItem(saveKey);
            console.log(`Slot ${slotNumber} cleared`);
            return true;
        } catch (error) {
            console.error('Failed to delete world:', error);
            return false;
        }
    }

    /**
     * Check if a slot has saved data
     * @param {number} slotNumber - Save slot (1 or 2)
     * @returns {boolean} True if slot has data
     */
    static hasWorld(slotNumber) {
        if (slotNumber < 1 || slotNumber > this.MAX_SLOTS) {
            return false;
        }

        const saveKey = `${this.SAVE_KEY_PREFIX}${slotNumber}`;
        return localStorage.getItem(saveKey) !== null;
    }

    /**
     * Get all save slots info
     * @returns {Array} Array of slot info objects
     */
    static getAllSlots() {
        const slots = [];
        for (let i = 1; i <= this.MAX_SLOTS; i++) {
            const info = this.getWorldInfo(i);
            slots.push(info || { slotNumber: i, exists: false });
        }
        return slots;
    }

    /**
     * Format timestamp to readable date string
     * @param {number} timestamp - Unix timestamp
     * @returns {string} Formatted date
     */
    static formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }

    /**
     * Format playtime in seconds to readable string
     * @param {number} seconds - Playtime in seconds
     * @returns {string} Formatted playtime
     */
    static formatPlaytime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }
}

