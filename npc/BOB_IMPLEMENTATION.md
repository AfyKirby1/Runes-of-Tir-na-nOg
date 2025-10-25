# Bob NPC Implementation Guide

## Overview
Bob is a wandering NPC character that spawns randomly in the game world. He uses the exact same visual model as the player character, creating an interesting "doppelganger" effect.

## Features

### Visual Appearance
- **Identical to Player**: Bob looks exactly like the player character
- **Size**: 12x12 pixels
- **Color**: Beige (#f4e4bc)
- **Gold Name Tag**: Displays "Bob" above his head in gold (#d4af37)
- **Green Interaction Indicator**: Shows when player is near

### Behavior
- **Wander Pattern**: Moves randomly within 150 pixel radius of spawn point
- **Speed**: 0.5 units (slower than player)
- **Animated Movement**: Legs animate when walking left/right
- **Direction-Aware Arms**: Arms position based on movement direction

### Dialogue
Bob has 6 unique dialogue lines:
1. "Hey there! I'm Bob, just wandering around."
2. "Have you seen anything interesting?"
3. "I love exploring this world!"
4. "The weather is perfect for an adventure!"
5. "Sometimes I feel like we're the same person..." (meta-humor)
6. "Do you ever get the feeling you're being watched?" (meta-humor)

### Spawning
- **Random Location**: Spawns at random coordinates in the world
- **Safe Margins**: 200px margin from world edges to avoid spawning in water or off-map
- **One per World**: Only one Bob spawns per game session
- **Console Logging**: Spawn location logged to console for debugging

## Technical Implementation

### Files Modified

#### 1. `game/npc/NPCConfig.js`
Added Bob configuration in the `special` NPCs section:
```javascript
bob: {
    name: "Bob",
    description: "A friendly wandering character who seems oddly familiar.",
    color: "#f4e4bc",
    behavior: "wander",
    wanderRadius: 150,
    speed: 0.5,
    width: 12,
    height: 12,
    usePlayerModel: true, // KEY FLAG
    dialogue: [...]
}
```

Added `createBobInWorld()` method to spawn Bob at random location.

#### 2. `game/npc/NPC.js`
Added player model rendering support:
- `usePlayerModel` flag in constructor
- `playerDirection` property for direction tracking
- `legAngle` and `legSwingSpeed` for animation
- `renderPlayerModel()` method that replicates player rendering
- Updated `moveTowards()` to update player direction
- Updated `updateMovement()` to animate legs

#### 3. `game/core/Game.js`
- Uncommented NPC system imports
- Modified `initializeNPCs()` to call `createBobInWorld()`

## How to Test

### 1. Launch the Game
Use `launch.bat` to start the server and open the game.

### 2. Start a New Game
- Click "New Game" from the landing page
- Select any world type (small, medium, or large)
- Enter the game

### 3. Find Bob
- Bob spawns at a random location
- Check the console log for spawn coordinates: "Spawning Bob at (X, Y)"
- Navigate towards those coordinates to find Bob
- Look for a character identical to yourself with "Bob" name tag

### 4. Interact with Bob
- Walk near Bob (within interaction radius)
- Press the interact key (typically E or Space)
- Bob will display a random dialogue message

### 5. Observe Behavior
- Bob wanders randomly within his radius
- Watch his legs animate when moving left/right
- See his arms position based on movement direction
- Note how he looks exactly like the player character

## Debug Commands

Open browser console (F12) and check for:
```
NPC created: Bob (townie) at (X, Y)
Spawning Bob at (X, Y)
Added NPC: Bob (npc_XXXXX)
Initialized 1 NPCs
```

## Future Enhancements

### Color Variants
Create Bob variants with different colors:
```javascript
redBob: {
    ...bobConfig,
    name: "Red Bob",
    color: "#ff6b6b"
}
```

### Size Variants
Create giant or tiny Bobs:
```javascript
giantBob: {
    ...bobConfig,
    name: "Giant Bob",
    width: 24,
    height: 24,
    size: 24
}
```

### Multiple Bobs
Spawn multiple Bob NPCs at different locations:
```javascript
for (let i = 0; i < 5; i++) {
    this.npcFactory.createBobInWorld(worldWidth, worldHeight);
}
```

### Custom Behaviors
Change Bob's behavior:
- `behavior: "follow"` - Bob follows the player
- `behavior: "patrol"` - Bob patrols between points
- `behavior: "idle"` - Bob stays in one place

## Troubleshooting

### Bob Doesn't Spawn
- Check console for NPC system initialization message
- Verify NPC imports are uncommented in `Game.js`
- Check for JavaScript errors in console

### Bob Not Visible
- Bob may have spawned far from player spawn point
- Use console log to find spawn coordinates
- Navigate to those coordinates

### Bob Doesn't Move
- Check `behavior: "wander"` is set in config
- Verify `speed: 0.5` is set
- Check console for NPC update errors

### Can't Interact with Bob
- Walk closer to Bob (within ~30 pixels)
- Check `interactable: true` in config (default)
- Verify interaction key binding in settings

## Architecture Notes

### Player Model Reuse
Instead of creating a sprite image, Bob reuses the player rendering code. This provides:
- **Consistency**: Guaranteed identical appearance
- **Performance**: No image loading required
- **Maintainability**: Updates to player appearance automatically apply to Bob
- **Flexibility**: Easy to create variants by changing config values

### Design Pattern
The `usePlayerModel` flag creates a reusable pattern for player-like NPCs:
1. Set `usePlayerModel: true` in config
2. NPC constructor initializes player-specific properties
3. Render method calls `renderPlayerModel()` instead of standard rendering
4. Movement updates `playerDirection` for proper arm/leg positioning

This pattern can be extended to any NPC that should look like the player.

---

**Implementation Date**: October 19, 2025  
**Version**: 0.5.4  
**Status**: ✅ Complete & Verified

