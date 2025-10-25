# Tír na nÓg World

This folder contains the custom-built world for **Tír na nÓg**.

## How to Use:

1. Open `world-editor.html` in your browser
2. Build your custom world
3. Export it as JSON
4. Rename the exported file to `world.json`
5. Place `world.json` in this folder
6. Click "Go to Tír na nÓg" in the game menu to play!

## File Structure:
```
tir-na-nog/
└── world.json    ← Place your exported world file here
```

The world file should have this structure:
```json
{
  "version": "1.0",
  "metadata": {
    "name": "Tír na nÓg",
    "created": "...",
    "editor": "Runes World Editor"
  },
  "worldWidth": 125,
  "worldHeight": 125,
  "tiles": [...]
}
```

