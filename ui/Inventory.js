/**
 * Inventory System for Runes of Tir na nÓg
 * Handles player inventory, equipment slots, and item management
 */

import { SecurityUtils } from '../utils/SecurityUtils.js';

export class Inventory {
    constructor(game) {
        this.game = game;
        this.isVisible = false;
        this.container = null;
        
        // Inventory data
        this.items = Array(24).fill(null); // 24 general inventory slots
        this.equipment = {
            helmet: null,
            necklace: null,
            chest: null,
            legs: null,
            boots: null,
            ring1: null,
            ring2: null,
            weapon: null
        };
        
        this.selectedSlot = null;
        this.draggedItem = null;
        
        this.init();
    }

    init() {
        this.createUI();
        this.attachEventListeners();
        
        // Add some sample items for demonstration
        this.addSampleItems();
    }

    createUI() {
        // Create main inventory container
        this.container = document.createElement('div');
        this.container.className = 'inventory-container';
        this.container.style.display = 'none';
        
        this.container.innerHTML = `
            <div class="inventory-panel">
                <div class="inventory-header">
                    <h2 class="inventory-title">
                        <i class="inv-icon">🎒</i> Inventory
                    </h2>
                    <button class="inventory-close" id="inventoryClose">✖</button>
                </div>
                
                <div class="inventory-content">
                    <!-- Left Side: Equipment Slots -->
                    <div class="equipment-section">
                        <h3 class="section-title">Equipment</h3>
                        <div class="equipment-grid">
                            <!-- Top Row: Helmet -->
                            <div class="equipment-slot empty-slot" data-slot="helmet">
                                <div class="slot-icon">⛑️</div>
                                <div class="slot-label">Helmet</div>
                            </div>
                            
                            <!-- Second Row: Necklace -->
                            <div class="equipment-slot empty-slot" data-slot="necklace">
                                <div class="slot-icon">📿</div>
                                <div class="slot-label">Necklace</div>
                            </div>
                            
                            <!-- Third Row: Weapon and Chest -->
                            <div class="equipment-row">
                                <div class="equipment-slot empty-slot" data-slot="weapon">
                                    <div class="slot-icon">⚔️</div>
                                    <div class="slot-label">Weapon</div>
                                </div>
                                <div class="equipment-slot empty-slot" data-slot="chest">
                                    <div class="slot-icon">🛡️</div>
                                    <div class="slot-label">Chest</div>
                                </div>
                            </div>
                            
                            <!-- Fourth Row: Rings -->
                            <div class="equipment-row">
                                <div class="equipment-slot empty-slot" data-slot="ring1">
                                    <div class="slot-icon">💍</div>
                                    <div class="slot-label">Ring</div>
                                </div>
                                <div class="equipment-slot empty-slot" data-slot="ring2">
                                    <div class="slot-icon">💍</div>
                                    <div class="slot-label">Ring</div>
                                </div>
                            </div>
                            
                            <!-- Fifth Row: Legs -->
                            <div class="equipment-slot empty-slot" data-slot="legs">
                                <div class="slot-icon">👖</div>
                                <div class="slot-label">Legs</div>
                            </div>
                            
                            <!-- Bottom Row: Boots -->
                            <div class="equipment-slot empty-slot" data-slot="boots">
                                <div class="slot-icon">👢</div>
                                <div class="slot-label">Boots</div>
                            </div>
                        </div>
                        
                        <!-- Character Stats -->
                        <div class="character-stats">
                            <div class="stat-row">
                                <span class="stat-label">⚔️ Attack:</span>
                                <span class="stat-value" id="statAttack">10</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label">🛡️ Defense:</span>
                                <span class="stat-value" id="statDefense">5</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label">💨 Speed:</span>
                                <span class="stat-value" id="statSpeed">8</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Right Side: General Inventory -->
                    <div class="items-section">
                        <h3 class="section-title">Items</h3>
                        <div class="items-grid" id="itemsGrid">
                            ${this.generateItemSlots()}
                        </div>
                        
                        <div class="inventory-footer">
                            <div class="gold-display">
                                <span class="gold-icon">💰</span>
                                <span class="gold-amount">1,250</span>
                                <span class="gold-label">Gold</span>
                            </div>
                            <div class="weight-display">
                                <span class="weight-icon">⚖️</span>
                                <span class="weight-value">12 / 50</span>
                                <span class="weight-label">Weight</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Item Tooltip (shown on hover) -->
                <div class="item-tooltip" id="itemTooltip" style="display: none;">
                    <div class="tooltip-name">Iron Sword</div>
                    <div class="tooltip-type">Weapon</div>
                    <div class="tooltip-stats">
                        <div>⚔️ Damage: +15</div>
                    </div>
                    <div class="tooltip-description">A sturdy iron blade forged by skilled blacksmiths.</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.container);
    }

    generateItemSlots() {
        let html = '';
        for (let i = 0; i < 24; i++) {
            html += `
                <div class="item-slot empty-slot" data-slot="${i}">
                    <div class="slot-number">${i + 1}</div>
                </div>
            `;
        }
        return html;
    }

    addSampleItems() {
        // Add some sample items to demonstrate the inventory
        this.items[0] = {
            id: 'potion_health',
            name: 'Health Potion',
            icon: '❤️',
            type: 'consumable',
            description: 'Restores 50 HP',
            quantity: 5
        };
        
        this.items[1] = {
            id: 'sword_iron',
            name: 'Iron Sword',
            icon: '⚔️',
            type: 'weapon',
            description: 'A sturdy iron blade',
            stats: { attack: 15 }
        };
        
        this.items[2] = {
            id: 'armor_leather',
            name: 'Leather Armor',
            icon: '🦺',
            type: 'chest',
            description: 'Light leather protection',
            stats: { defense: 10 }
        };
        
        this.items[5] = {
            id: 'ring_gold',
            name: 'Gold Ring',
            icon: '💍',
            type: 'ring',
            description: 'A shiny gold ring',
            stats: { luck: 5 }
        };
        
        this.updateItemsDisplay();
    }

    updateItemsDisplay() {
        const itemsGrid = document.getElementById('itemsGrid');
        if (!itemsGrid) return;
        
        const slots = itemsGrid.querySelectorAll('.item-slot');
        slots.forEach((slot, index) => {
            const item = this.items[index];
            if (item) {
                slot.classList.remove('empty-slot');
                slot.classList.add('has-item');
                
                // ✅ SECURITY FIX (VULN-001): Sanitize all user-controlled data
                const safeIcon = SecurityUtils.sanitizeHTML(item.icon || '📦');
                const safeQuantity = item.quantity ? SecurityUtils.sanitizeHTML(String(item.quantity)) : '';
                
                slot.innerHTML = `
                    <div class="slot-number">${index + 1}</div>
                    <div class="item-icon">${safeIcon}</div>
                    ${item.quantity ? `<div class="item-quantity">${safeQuantity}</div>` : ''}
                `;
                
                // ✅ SECURITY FIX (VULN-001): Sanitize tooltip data attributes
                slot.dataset.itemName = SecurityUtils.sanitizeText(item.name || '');
                slot.dataset.itemType = SecurityUtils.sanitizeText(item.type || '');
                slot.dataset.itemDesc = SecurityUtils.sanitizeText(item.description || '');
            } else {
                slot.classList.add('empty-slot');
                slot.classList.remove('has-item');
                slot.innerHTML = `<div class="slot-number">${index + 1}</div>`;
            }
        });
    }

    attachEventListeners() {
        // Close button
        setTimeout(() => {
            const closeBtn = document.getElementById('inventoryClose');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.hide());
            }
            
            // Item slot hover for tooltips
            this.container.addEventListener('mouseover', (e) => {
                const slot = e.target.closest('.item-slot.has-item');
                if (slot) {
                    this.showTooltip(slot, e);
                }
            });
            
            this.container.addEventListener('mouseout', (e) => {
                const slot = e.target.closest('.item-slot');
                if (slot) {
                    this.hideTooltip();
                }
            });
            
            // Item clicking
            this.container.addEventListener('click', (e) => {
                const itemSlot = e.target.closest('.item-slot.has-item');
                const equipSlot = e.target.closest('.equipment-slot');
                
                if (itemSlot) {
                    this.handleItemClick(itemSlot);
                } else if (equipSlot) {
                    this.handleEquipSlotClick(equipSlot);
                }
            });
        }, 100);
    }

    showTooltip(slot, event) {
        const tooltip = document.getElementById('itemTooltip');
        if (!tooltip || !slot.dataset.itemName) return;
        
        tooltip.querySelector('.tooltip-name').textContent = slot.dataset.itemName;
        tooltip.querySelector('.tooltip-type').textContent = slot.dataset.itemType;
        tooltip.querySelector('.tooltip-description').textContent = slot.dataset.itemDesc;
        
        tooltip.style.display = 'block';
        tooltip.style.left = (event.pageX + 15) + 'px';
        tooltip.style.top = (event.pageY + 15) + 'px';
    }

    hideTooltip() {
        const tooltip = document.getElementById('itemTooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }

    handleItemClick(slot) {
        const slotIndex = parseInt(slot.dataset.slot);
        const item = this.items[slotIndex];
        
        if (item) {
            console.log(`Clicked item: ${item.name}`);
            // TODO: Implement item usage/equipping logic
            slot.classList.add('selected');
            setTimeout(() => slot.classList.remove('selected'), 200);
        }
    }

    handleEquipSlotClick(slot) {
        const slotName = slot.dataset.slot;
        console.log(`Clicked equipment slot: ${slotName}`);
        // TODO: Implement unequip logic
    }

    show() {
        if (this.container) {
            this.container.style.display = 'flex';
            this.isVisible = true;
            console.log('Inventory opened');
            
            // Pause the game when inventory is open
            if (this.game) {
                this.game.pause();
            }
        }
    }

    hide() {
        if (this.container) {
            this.container.style.display = 'none';
            this.isVisible = false;
            console.log('Inventory closed');
            
            // Resume the game when inventory is closed
            if (this.game) {
                this.game.resume();
            }
        }
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * ✅ SECURITY FIX (VULN-001): Validate and sanitize item data
     * Prevents XSS attacks via malicious item data
     */
    validateItem(item) {
        if (!item || typeof item !== 'object') {
            console.error('Invalid item: not an object');
            return null;
        }
        
        // Validate required fields
        if (!item.id || !item.name || !item.type) {
            console.error('Invalid item: missing required fields (id, name, type)');
            return null;
        }
        
        // Create sanitized copy
        const sanitized = {
            id: SecurityUtils.sanitizeText(String(item.id)).substring(0, 50),
            name: SecurityUtils.sanitizeText(String(item.name)).substring(0, 100),
            type: SecurityUtils.sanitizeText(String(item.type)).substring(0, 50),
            icon: SecurityUtils.sanitizeText(String(item.icon || '📦')).substring(0, 10),
            description: SecurityUtils.sanitizeText(String(item.description || '')).substring(0, 200)
        };
        
        // Validate quantity if present
        if (item.quantity !== undefined) {
            const qty = parseInt(item.quantity);
            if (Number.isInteger(qty) && qty >= 0 && qty <= 999) {
                sanitized.quantity = qty;
            } else {
                sanitized.quantity = 1; // Default to 1 if invalid
            }
        }
        
        // Copy stats if present (validated)
        if (item.stats && typeof item.stats === 'object') {
            sanitized.stats = {};
            for (const [key, value] of Object.entries(item.stats)) {
                if (typeof value === 'number' && Number.isFinite(value)) {
                    sanitized.stats[key] = Math.max(-9999, Math.min(9999, value));
                }
            }
        }
        
        return sanitized;
    }

    addItem(item) {
        // ✅ SECURITY FIX (VULN-001): Validate item before adding
        const validatedItem = this.validateItem(item);
        if (!validatedItem) {
            console.error('Cannot add invalid item to inventory');
            return false;
        }
        
        // Find first empty slot
        const emptyIndex = this.items.findIndex(slot => slot === null);
        if (emptyIndex !== -1) {
            this.items[emptyIndex] = validatedItem;
            this.updateItemsDisplay();
            return true;
        }
        return false; // Inventory full
    }

    removeItem(index) {
        if (this.items[index]) {
            this.items[index] = null;
            this.updateItemsDisplay();
            return true;
        }
        return false;
    }

    getStyles() {
        return `
            .inventory-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.85);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 100000;
                font-family: 'Courier New', monospace;
                pointer-events: auto;
            }

            .inventory-panel {
                background: linear-gradient(135deg, rgba(26, 26, 46, 0.98), rgba(15, 15, 30, 0.98));
                border: 3px solid #d4af37;
                border-radius: 15px;
                box-shadow: 
                    0 0 40px rgba(212, 175, 55, 0.6),
                    inset 0 0 30px rgba(212, 175, 55, 0.1);
                padding: 0;
                max-width: 1000px;
                width: 90%;
                max-height: 90vh;
                overflow: hidden;
            }

            .inventory-header {
                background: linear-gradient(135deg, #8b5a2b, #654321);
                padding: 20px;
                border-bottom: 2px solid #d4af37;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .inventory-title {
                margin: 0;
                color: #d4af37;
                font-size: 1.8rem;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .inv-icon {
                font-size: 2rem;
                filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.8));
            }

            .inventory-close {
                background: rgba(139, 90, 43, 0.5);
                border: 2px solid #d4af37;
                color: #d4af37;
                font-size: 1.5rem;
                width: 40px;
                height: 40px;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: bold;
            }

            .inventory-close:hover {
                background: rgba(139, 90, 43, 0.8);
                border-color: #ffd700;
                color: #ffd700;
                transform: scale(1.1);
            }

            .inventory-content {
                display: flex;
                gap: 20px;
                padding: 20px;
                overflow-y: auto;
                max-height: calc(90vh - 100px);
            }

            /* Equipment Section */
            .equipment-section {
                flex: 0 0 300px;
                background: rgba(139, 90, 43, 0.2);
                border: 2px solid rgba(212, 175, 55, 0.4);
                border-radius: 10px;
                padding: 15px;
            }

            .section-title {
                color: #d4af37;
                font-size: 1.3rem;
                margin: 0 0 15px 0;
                text-align: center;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
            }

            .equipment-grid {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin-bottom: 20px;
            }

            .equipment-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
            }

            .equipment-slot {
                background: rgba(26, 26, 46, 0.8);
                border: 2px solid rgba(212, 175, 55, 0.5);
                border-radius: 8px;
                padding: 15px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
            }

            .equipment-slot:hover {
                background: rgba(139, 90, 43, 0.4);
                border-color: #d4af37;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
            }

            .equipment-slot.empty-slot {
                opacity: 0.6;
            }

            .slot-icon {
                font-size: 2rem;
                margin-bottom: 5px;
                filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.8));
            }

            .slot-label {
                color: #d4af37;
                font-size: 0.8rem;
                text-transform: uppercase;
                letter-spacing: 1px;
            }

            /* Character Stats */
            .character-stats {
                background: rgba(26, 26, 46, 0.6);
                border: 2px solid rgba(212, 175, 55, 0.4);
                border-radius: 8px;
                padding: 15px;
            }

            .stat-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid rgba(212, 175, 55, 0.2);
            }

            .stat-row:last-child {
                border-bottom: none;
            }

            .stat-label {
                color: #d4af37;
                font-size: 0.9rem;
            }

            .stat-value {
                color: #ffed4e;
                font-weight: bold;
                font-size: 1rem;
            }

            /* Items Section */
            .items-section {
                flex: 1;
                background: rgba(139, 90, 43, 0.2);
                border: 2px solid rgba(212, 175, 55, 0.4);
                border-radius: 10px;
                padding: 15px;
                display: flex;
                flex-direction: column;
            }

            .items-grid {
                display: grid;
                grid-template-columns: repeat(6, 1fr);
                gap: 8px;
                margin-bottom: 15px;
            }

            .item-slot {
                aspect-ratio: 1;
                background: rgba(26, 26, 46, 0.8);
                border: 2px solid rgba(212, 175, 55, 0.5);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                padding: 5px;
            }

            .item-slot:hover {
                background: rgba(139, 90, 43, 0.4);
                border-color: #d4af37;
                transform: scale(1.05);
                box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
            }

            .item-slot.empty-slot {
                opacity: 0.4;
            }

            .item-slot.has-item {
                opacity: 1;
            }

            .item-slot.selected {
                border-color: #4ade80;
                box-shadow: 0 0 15px rgba(74, 222, 128, 0.6);
            }

            .slot-number {
                position: absolute;
                top: 2px;
                left: 4px;
                font-size: 0.6rem;
                color: rgba(212, 175, 55, 0.5);
            }

            .item-icon {
                font-size: 2rem;
                filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.8));
            }

            .item-quantity {
                position: absolute;
                bottom: 2px;
                right: 4px;
                background: rgba(212, 175, 55, 0.8);
                color: #0a0a1a;
                font-size: 0.7rem;
                font-weight: bold;
                padding: 2px 5px;
                border-radius: 4px;
            }

            /* Inventory Footer */
            .inventory-footer {
                display: flex;
                justify-content: space-between;
                gap: 15px;
                margin-top: auto;
            }

            .gold-display, .weight-display {
                flex: 1;
                background: rgba(26, 26, 46, 0.8);
                border: 2px solid rgba(212, 175, 55, 0.5);
                border-radius: 8px;
                padding: 12px;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .gold-icon, .weight-icon {
                font-size: 1.5rem;
            }

            .gold-amount, .weight-value {
                color: #ffed4e;
                font-weight: bold;
                font-size: 1.1rem;
            }

            .gold-label, .weight-label {
                color: #d4af37;
                font-size: 0.9rem;
            }

            /* Item Tooltip */
            .item-tooltip {
                position: fixed;
                background: rgba(15, 15, 30, 0.98);
                border: 2px solid #d4af37;
                border-radius: 8px;
                padding: 15px;
                max-width: 250px;
                z-index: 100001;
                pointer-events: none;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.8);
            }

            .tooltip-name {
                color: #ffd700;
                font-size: 1.1rem;
                font-weight: bold;
                margin-bottom: 5px;
            }

            .tooltip-type {
                color: #a78bfa;
                font-size: 0.85rem;
                text-transform: uppercase;
                margin-bottom: 10px;
            }

            .tooltip-stats {
                color: #4ade80;
                font-size: 0.9rem;
                margin-bottom: 10px;
            }

            .tooltip-description {
                color: #d4d4f4;
                font-size: 0.85rem;
                font-style: italic;
            }

            /* Responsive adjustments */
            @media (max-width: 768px) {
                .inventory-content {
                    flex-direction: column;
                }
                
                .equipment-section {
                    flex: 0 0 auto;
                }
                
                .items-grid {
                    grid-template-columns: repeat(4, 1fr);
                }
            }
        `;
    }
}

