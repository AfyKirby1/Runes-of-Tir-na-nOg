# NPC Functionality Document - Runes of Tir na nÓg

**Version**: 0.5.5  
**Date**: December 2024  
**Status**: Production Ready

---

## Executive Summary

The NPC system in Runes of Tir na nÓg provides a comprehensive framework for creating, managing, and interacting with Non-Player Characters. The system supports multiple NPC types, behaviors, visual rendering modes, and integration with both single-player and multiplayer environments.

---

## Core Architecture

### File Structure
```
RunesOfTirNaNog/npc/
├── NPC.js              # Core NPC class and NPCManager
├── NPCConfig.js         # Predefined configurations and factory
├── README.md           # System documentation
├── BOB_IMPLEMENTATION.md # Special Bob NPC guide
└── BOB_TOGGLE_GUIDE.md  # User settings guide

RunesOfTirNaNog/assets/npc/
└── persistent/
    ├── Rat.json        # Custom NPC configuration
    └── Rat.png         # Custom NPC sprite
```

### Key Classes
- **NPC**: Individual character with properties, behaviors, and interactions
- **NPCManager**: Manages all NPCs in the game world
- **NPCFactory**: Creates NPCs from predefined configurations
- **NPC_CONFIGS**: Predefined NPC templates

---

## NPC Types & Categories

### 1. Standard NPCs
| Type | Description | Behavior | Visual |
|------|-------------|----------|---------|
| **Townie** | Regular citizens | Wander/Idle | Colored rectangles |
| **Merchant** | Shopkeepers | Idle | Blue rectangles |
| **Quest Giver** | Quest providers | Guard/Idle | Green rectangles |
| **Guard** | Security NPCs | Patrol/Guard | Gray rectangles |

### 2. Special NPCs
| Name | Type | Description | Special Features |
|------|------|-------------|-------------------|
| **Bob** | Special | Player doppelganger | Player model rendering, enhanced AI |
| **Mysterious Stranger** | Special | Dark robed figure | Idle behavior |
| **Traveling Bard** | Special | Storyteller | Wander behavior |

### 3. Custom NPCs
- **Rat**: Custom sprite-based NPC with JSON configuration
- **Blocky Builder Integration**: Support for imported custom NPCs
- **Persistent Storage**: NPCs saved in world data

---

## Behavior System

### Behavior Types
1. **Idle**: NPCs stay in place, occasionally look around
2. **Patrol**: Move between defined patrol points
3. **Wander**: Random movement within radius of home point
4. **Follow**: Follow the player
5. **Guard**: Guard specific area, return to post if too far
6. **Hostile**: Chase and attack player when detected

### AI Features
- **Smooth Movement**: Acceleration/deceleration physics
- **Collision Detection**: World-aware pathfinding
- **Detection Radius**: Player awareness system
- **Action Cooldowns**: Prevents spam actions
- **Direction Awareness**: 8-directional movement

### Enhanced Behaviors (Bob)
- **Intelligent Wandering**: Approaches player when nearby
- **Exploration Preference**: Seeks unexplored areas
- **Mysterious Insights**: Random dialogue generation
- **Restless Movement**: Subtle movements even when idle

---

## Visual Rendering System

### Rendering Modes

#### 1. Standard Rendering
- Colored rectangular bodies
- Simple face with eyes
- Direction indicator arrow
- Name tags with health bars
- Animation frames for movement

#### 2. Player Model Rendering (Bob)
- Identical to player character appearance
- Animated legs when moving
- Direction-aware arm positioning
- Gold name tag (#d4af37)
- Same size as player (18px)

#### 3. Custom Image Rendering
- Loads external sprite images
- Cached image elements
- Fallback rendering if image fails
- Ground positioning for sprites

### Visual Features
- **Health Bars**: Color-coded (green/yellow/red)
- **Damage Numbers**: Floating damage indicators
- **Attack Effects**: Visual feedback for combat
- **Interaction Indicators**: Green dots (removed in current version)
- **Culling**: Off-screen NPCs not rendered

---

## Interaction System

### Interaction Mechanics
- **Detection Radius**: 30 pixels around player
- **Interaction Cooldown**: 500ms between interactions
- **Closest NPC Priority**: Interacts with nearest NPC
- **Key Bindings**: E key or Spacebar

### Interaction Types
1. **Dialogue**: Text-based conversations
2. **Shop**: Trading interface with merchants
3. **Quest**: Quest assignment and tracking
4. **Custom**: Extensible interaction system

### Dialogue System
- **Cycling Dialogue**: Multiple messages per NPC
- **Random Selection**: Bob has 15 unique dialogue lines
- **Type-Specific**: Different dialogue per NPC type
- **Meta-Humor**: Self-referential dialogue (Bob)

---

## Integration Points

### Game Loop Integration
```javascript
// Update Loop (Game.js)
this.npcManager.update(deltaTime, this);

// Render Loop (Game.js)
this.npcManager.render(this.ctx, this.camera);
```

### World System Integration
- **Collision Detection**: Uses world.canMove() for pathfinding
- **World Data**: NPCs loaded from world.npcData
- **Spawn Points**: NPCs positioned relative to world bounds
- **Tile Alignment**: NPCs snap to 16px tile grid

### Multiplayer Integration
- **Server Synchronization**: NPCs synced via NetworkManager
- **Client-Side Rendering**: Server NPCs rendered separately
- **State Management**: NPC health/status updates
- **Interaction Handling**: Server-side interaction processing

### Settings Integration
- **Bob Toggle**: User can enable/disable Bob spawning
- **NPC Density**: Placeholder for future NPC spawn control
- **LocalStorage**: Settings persist between sessions
- **New Game Requirement**: Settings apply to new worlds only

---

## Configuration System

### NPC Creation Methods

#### 1. Factory Methods
```javascript
// Create specific NPC types
npcManager.createTownie(config);
npcManager.createMerchant(config);
npcManager.createQuestGiver(config);
npcManager.createGuard(config);
```

#### 2. Configuration Templates
```javascript
// Use predefined configurations
NPC_CONFIGS.townies.farmer
NPC_CONFIGS.guards.town_guard_1
NPC_CONFIGS.special.bob
```

#### 3. Custom Creation
```javascript
// Direct NPC creation
const npc = new NPC({
    name: "Custom NPC",
    type: "townie",
    x: 100, y: 100,
    behavior: "wander",
    dialogue: ["Hello!"]
});
```

### Configuration Properties
- **Basic**: id, name, type, description, position
- **Visual**: color, sprite, scale, customImage, usePlayerModel
- **Behavior**: behavior, speed, patrolPoints, wanderRadius
- **Interaction**: dialogue, shopItems, quests, interactable
- **Combat**: health, attackDamage, attackRange, detectionRadius
- **AI**: actionCooldown, reactionTime, acceleration, deceleration

---

## Save System Integration

### Save Data Structure
```javascript
{
    id: "npc_unique_id",
    name: "NPC Name",
    type: "townie",
    x: 100, y: 100,
    behavior: "wander",
    patrolPoints: [...],
    dialogue: [...],
    shopItems: [...],
    quests: [...],
    isActive: true,
    isVisible: true
}
```

### Persistence Features
- **World Data**: NPCs saved in world files
- **State Preservation**: Health, position, dialogue index
- **Custom NPCs**: Persistent custom NPC configurations
- **Multiplayer Sync**: Server-side NPC state management

---

## Performance Considerations

### Optimization Features
- **Culling**: Off-screen NPCs not rendered
- **Update Throttling**: Action cooldowns prevent excessive updates
- **Image Caching**: Custom images cached after loading
- **Efficient Rendering**: Batch rendering through NPCManager

### Memory Management
- **Map Storage**: NPCs stored in Map for O(1) access
- **Cleanup**: Dead NPCs removed from active lists
- **Image Cleanup**: Failed image loads don't block rendering

---

## Debug & Development Tools

### Console Commands
```javascript
// Access NPC manager
window.npcManager = game.npcManager;

// Get all NPCs
npcManager.getAllNPCs();

// Get specific NPC
npcManager.getNPC('npc_id');

// Remove NPC
npcManager.removeNPC('npc_id');
```

### Debug Features
- **Console Logging**: NPC creation, movement, interactions
- **Spawn Coordinates**: Bob spawn location logged
- **Visual Indicators**: Name tags, health bars, direction arrows
- **Settings Debug**: localStorage inspection

---

## Current Limitations & Future Enhancements

### Current Limitations
1. **Limited NPC Types**: Only basic townie/merchant/guard types
2. **Simple Dialogue**: No branching dialogue trees
3. **Basic AI**: No complex decision-making or learning
4. **No NPC-to-NPC Interaction**: NPCs don't interact with each other
5. **Static Quests**: No dynamic quest generation
6. **Limited Customization**: Few visual customization options

### Planned Enhancements
1. **Advanced Dialogue System**: Branching conversations, choices
2. **NPC Relationships**: Reputation, friendship systems
3. **Dynamic Quests**: Procedurally generated quests
4. **Advanced AI**: State machines, goal-oriented behavior
5. **NPC-to-NPC Interaction**: NPCs talking to each other
6. **Animation System**: Sprite-based animations
7. **Voice Acting**: Audio dialogue support
8. **NPC Scheduling**: Day/night cycles, NPC routines

---

## Usage Examples

### Creating a Custom NPC
```javascript
const customNPC = new NPC({
    name: "Village Elder",
    type: "quest_giver",
    x: 300, y: 200,
    behavior: "idle",
    dialogue: [
        "Welcome, brave adventurer!",
        "I have a task for you...",
        "The village needs your help!"
    ],
    quests: [{
        id: "find_artifact",
        title: "Find the Lost Artifact",
        description: "Retrieve the ancient artifact from the cave",
        reward: { gold: 100, exp: 50 }
    }],
    color: "#8B4513"
});

npcManager.addNPC(customNPC);
```

### Modifying Bob's Behavior
```javascript
// Find Bob and change his behavior
const bob = npcManager.getAllNPCs().find(npc => npc.name === "Bob");
if (bob) {
    bob.behavior = "follow"; // Make Bob follow the player
    bob.speed = 1.0; // Increase Bob's speed
}
```

### Adding Custom Dialogue
```javascript
// Add new dialogue to existing NPC
const npc = npcManager.getNPC('npc_id');
if (npc) {
    npc.dialogue.push("This is new dialogue!");
}
```

---

## Technical Specifications

### System Requirements
- **Browser**: Modern browser with Canvas support
- **JavaScript**: ES6+ modules support
- **Memory**: ~1MB per 100 NPCs
- **Performance**: 60fps with 50+ NPCs

### Dependencies
- **Core Game Systems**: Player, World, Camera, UI
- **Input System**: Keyboard interaction handling
- **Audio System**: Sound effects for interactions
- **Network System**: Multiplayer synchronization

### Browser Compatibility
- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support

---

## Conclusion

The NPC system provides a solid foundation for character interaction in Runes of Tir na nÓg. With its modular design, multiple rendering modes, and comprehensive behavior system, it supports both simple townies and complex special characters like Bob. The system is well-integrated with the game's core systems and provides a good base for future enhancements.

The current implementation successfully balances functionality with performance, providing an engaging NPC experience while maintaining smooth gameplay. Future development should focus on expanding the dialogue system, adding more complex AI behaviors, and implementing NPC-to-NPC interactions to create a more dynamic and living world.

---

**Document Maintained By**: AI Assistant  
**Last Updated**: December 2024  
**Next Review**: Q1 2025
