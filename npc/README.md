# NPC System - Chronicles of the Forgotten Realm

## Overview
The NPC (Non-Player Character) system provides a comprehensive framework for creating and managing interactive characters throughout the game world. This includes townies, merchants, quest givers, guards, and other special NPCs.

## Files
- `NPC.js` - Core NPC class and NPCManager
- `NPCConfig.js` - Predefined NPC configurations and factory
- `Game.js` - Integration with main game loop

## Features

### NPC Types
- **Townies**: Regular citizens with dialogue and wandering behavior
- **Merchants**: Shopkeepers with inventory systems
- **Quest Givers**: Characters that provide quests to players
- **Guards**: Security NPCs with patrol and guard behaviors
- **Special**: Unique NPCs with custom behaviors

### Behaviors
- **Idle**: NPCs stay in place, occasionally looking around
- **Patrol**: NPCs move between defined patrol points
- **Wander**: NPCs randomly wander within a defined radius
- **Follow**: NPCs follow the player
- **Guard**: NPCs guard a specific area

### Interaction System
- **Dialogue**: Text-based conversations with NPCs
- **Shop**: Trading interface with merchants
- **Quest**: Quest assignment and tracking
- **Detection**: Automatic interaction detection when near NPCs

## Usage

### Creating NPCs
```javascript
// Create a townie
const townie = npcManager.createTownie({
    name: "Village Elder",
    x: 300,
    y: 200,
    dialogue: ["Welcome to our village!", "How can I help you?"]
});

// Create a merchant
const merchant = npcManager.createMerchant({
    name: "Silas the Trader",
    x: 400,
    y: 300,
    shopItems: [
        { id: "health_potion", name: "Health Potion", price: 25 }
    ]
});
```

### Using Predefined Configurations
```javascript
// Create all townies from config
npcFactory.createTownies(200, 200, 100);

// Create guards
npcFactory.createGuards();

// Create special NPCs
npcFactory.createSpecialNPCs();
```

### Interaction
- **E Key** or **Spacebar**: Interact with nearby NPCs
- **Detection Radius**: 30 pixels around player
- **Cooldown**: 500ms between interactions

## NPC Properties

### Basic Properties
- `id`: Unique identifier
- `name`: Display name
- `type`: NPC category (townie, merchant, etc.)
- `description`: NPC description
- `x`, `y`: Position coordinates
- `width`, `height`: NPC dimensions

### Visual Properties
- `sprite`: Custom sprite (optional)
- `color`: Base color for rendering
- `scale`: Size multiplier
- `animationFrame`: Current animation frame

### Behavior Properties
- `behavior`: Current behavior type
- `speed`: Movement speed
- `patrolPoints`: Array of patrol coordinates
- `wanderRadius`: Maximum wander distance
- `homeX`, `homeY`: Home/base position

### Interaction Properties
- `interactable`: Can player interact with this NPC
- `dialogue`: Array of dialogue messages
- `shopItems`: Merchant inventory
- `quests`: Available quests

## Customization

### Adding New NPC Types
1. Extend the NPC class or create new factory methods
2. Add new behavior types to the AI system
3. Update interaction handling for new features

### Custom Behaviors
```javascript
// Add custom behavior
npc.handleCustomBehavior = function(deltaTime, game) {
    // Custom AI logic here
};
```

### Custom Interactions
```javascript
// Override interaction method
npc.interact = function(player) {
    return {
        type: "custom",
        data: "Custom interaction data"
    };
};
```

## Integration

The NPC system is fully integrated into the main game:
- **Update Loop**: NPCs update every frame
- **Render Loop**: NPCs render with proper camera transforms
- **Input System**: E/Space key handling for interactions
- **Save System**: NPC states can be saved and loaded

## Debugging

### Console Commands
```javascript
// Access NPC manager
window.npcManager = game.npcManager;

// Get all NPCs
npcManager.getAllNPCs();

// Get NPC by ID
npcManager.getNPC('npc_id');

// Remove NPC
npcManager.removeNPC('npc_id');
```

### Visual Indicators
- **Green Dot**: Interactable NPCs show a green indicator
- **Name Tags**: NPC names display when zoomed in
- **Direction Arrow**: Shows NPC facing direction

## Future Enhancements
- Advanced dialogue trees
- NPC-to-NPC interactions
- Dynamic quest generation
- NPC relationships and reputation
- Advanced AI behaviors
- Custom sprite support
- Animation system integration
