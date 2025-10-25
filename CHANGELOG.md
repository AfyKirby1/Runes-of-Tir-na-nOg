# Changelog - Runes of Tir na nÓg

All notable changes to this project will be documented in this file.

## [v2.0] - 2025-01-27 - Combat System Complete

### Added
- **Combat System**: Complete RPG combat with player and NPC attacks
- **Player Attack System**: Spacebar attack with 1 damage and RuneScape Classic-style weapon animations
- **Hostile NPC Behavior**: Rats chase and attack players with detection radius and attack cooldowns
- **Health Bar System**: Above-character health bars for player and all NPCs with color-coded states
- **Floating Damage Numbers**: Animated damage numbers that float upward and fade out
- **Visual Attack Effects**: RuneScape Classic-style weapon swings and claw attacks
- **NPC Health Tracking**: Real-time health monitoring with death states
- **Mobile Loading Screen**: Comprehensive loading screen for multiplayer connections with progress simulation
- **Mobile Zoom Controls**: Touch-friendly zoom in/out buttons for mobile devices
- **Mobile Default Zoom**: Automatic maximum zoom on touch devices for better mobile experience
- **Compact Pause Menu**: Streamlined pause menu with Settings and Quit to Menu options
- **Multiplayer Menu System**: Smart menu behavior that doesn't pause game in multiplayer mode

### Fixed
- **Spacebar Keybind Conflict**: Fixed Spacebar triggering both attack and chat - now only attacks
- **NPC Visual Clutter**: Removed green interaction dots, showing only names
- **Rat Name Positioning**: Moved rat names closer to sprites for better visual hierarchy
- **Loading Screen Flicker**: Fixed bare green screen flash by showing loading screen immediately on multiplayer detection
- **Pause Menu CSS**: Added missing base CSS for compact pause menu to display properly
- **ESC Key Behavior**: ESC key now opens compact menu in multiplayer instead of traditional pause menu
- **Window Blur Handling**: Clicking outside game window no longer pauses game in multiplayer mode
- **Tab Visibility**: Switching tabs no longer pauses game in multiplayer mode
- **NPC Sync Preservation**: All pause triggers respect multiplayer mode to maintain NPC synchronization
- **Mobile Menu Responsiveness**: Menu page optimized for mobile with responsive design

### Changed
- **Player Size**: Increased from 12px to 18px for better visibility
- **Health Display**: Moved from bottom screen to above-character for immersive experience
- **Attack Visuals**: Replaced complex arcs with simple RuneScape Classic-style weapon animations
- **NPC Appearance**: Cleaner look with health bars and proper name positioning
- **Pause Button Icon**: Changed from ⏸ to ⚙ in multiplayer mode to reflect menu functionality
- **Menu Titles**: Dynamic titles ("Game Paused" vs "Game Menu") based on game mode
- **Mobile Zoom Default**: Touch devices now start at maximum zoom level (3.0x) for better visibility
- **Loading Screen Integration**: Loading screen shows immediately when multiplayer parameter detected
- **Event Handler Logic**: Window blur and visibility change handlers respect multiplayer mode

## [v1.2] - 2025-10-16

### Added
- **Multiplayer UI System**: Complete username management and server connection UI
- **Inventory System**: Full RPG-style inventory with 8 equipment slots and 24 item slots
- **Health Bar System**: 10-heart health display with pixel-perfect rendering
- **Ground Texture System**: Pixel art ground textures with seamless coverage
- **Enhanced UI System**: Real-time debug information and performance monitoring

### Features
- **Equipment Slots**: Helmet, necklace, chest, weapon, 2 rings, legs, boots
- **Item Storage**: 24-slot grid for general inventory items
- **Character Stats**: Attack, defense, and speed stat display
- **Resource Tracking**: Gold and weight/capacity display
- **Medieval Theme**: Golden borders and shadows throughout UI
- **Game Pause Integration**: Automatic pause when inventory opens

### Technical
- **Modular Architecture**: Clean separation of concerns
- **Performance Optimized**: Viewport culling and 60 FPS target
- **Pixel Art Support**: Crisp rendering for retro aesthetics
- **Testing Framework**: Console commands for debugging
- **Responsive Design**: Adapts to screen sizes and zoom levels

## [v1.1] - 2025-10-12

### Fixed
- **Menu Background Animation**: Eliminated jarring diagonal shift with visible jump-back
- **Smooth Animations**: 19 floating shapes with seamless loops
- **Zero Artifacts**: No black boxes or edge glitches at any viewport size

### Added
- **Professional Quality**: Fade transitions for smooth appearance
- **Random Directions**: Mix of upward/downward movements
- **Preserved Particles**: Golden pixel particles remain untouched

## [v1.0] - 2025-10-10

### Initial Release
- **Core Game Loop**: 60 FPS game loop with delta time
- **Player Movement**: 8-directional WASD movement
- **Camera System**: Smooth following with zoom and mouse look
- **World Generation**: Procedural tile-based world
- **Basic UI**: Health display and pause functionality
- **Input System**: Keyboard and mouse handling
- **Asset Loading**: Texture loading with fallback systems

---

## 📋 Documentation Updates

### January 27, 2025
- **SUMMARY.md**: Updated with comprehensive documentation status following user rules
- **ARCHITECTURE.md**: Enhanced with complete combat system architecture details
- **SCRATCHPAD.md**: Updated with all resolved issues and debug locations
- **SBOM.md**: Current security and dependency tracking maintained
- **README.md**: Clean, fun, and informative documentation maintained

### Documentation Standards
Following user rules for comprehensive documentation maintenance:
- ✅ Maintain `debugs` folder for active issues and debug locations
- ✅ Create and update `My_Thoughts.md` for AI communication
- ✅ Maintain `CHANGELOG.md` for version logging and working features
- ✅ Create `ARCHITECTURE.md` for project structure and functional bits
- ✅ Maintain `SBOM.md` for security purposes (list and date all packages)
- ✅ Keep `SCRATCHPAD.md` for continuous reference (never delete, only compact old updates)
- ✅ Update `SUMMARY.md` regularly to assist with project tracking
- ✅ Keep `README.md` clean, fun, and informative

---

**Format**: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
**Versioning**: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
**Documentation**: Following user rules for comprehensive project documentation

