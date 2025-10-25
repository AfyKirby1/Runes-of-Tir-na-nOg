# Runes of Tir na nÓg - World Generation Design Document

## 🌍 Vision Statement
Create a dynamic, immersive, and infinitely explorable world that combines procedural generation with handcrafted elements to offer players a sense of wonder, discovery, and meaningful progression throughout their journey.

## 🗺️ World Structure Framework

### Procedural Grid System
- **World Chunks**: 256x256 tile regions that generate on-demand
- **Biome Layers**: Overlapping biome generation with smooth transitions
- **Elevation System**: Three-dimensional terrain with hills, valleys, and plateaus
- **Resource Distribution**: Strategic placement of resources based on biome and elevation

### World Size & Scale
- **Base World**: 10,000x10,000 tiles (40x larger than current 3500x2250)
- **Biome Distribution**: 15+ distinct biomes with sub-regions
- **Point of Interest Density**: 1 interesting location per 500x500 area (400+ locations)

## 🌿 Biome System

### Primary Biomes
1. **Temperate Forest** (25% of world)
   - Dense tree coverage with mixed oak, birch, and maple
   - Abundant wildlife and berry bushes
   - Mossy rocks and small streams

2. **Grasslands** (20% of world)
   - Open plains with scattered trees
   - Herds of peaceful creatures
   - Ancient ruins and stone circles

3. **Desert** (12% of world)
   - Sandy terrain with cacti and oases
   - Hidden treasure vaults beneath sand dunes
   - Rare metal deposits in rocky outcrops

4. **Snowy Tundra** (8% of world)
   - Frozen landscapes with ice formations
   - Aurora effects and harsh weather
   - Frozen caves with unique resources

5. **Swamp/Marsh** (8% of world)
   - Muddy terrain with shallow water
   - Dangerous creatures and healing herbs
   - Sunken ruins and mysterious fog

6. **Mountain Ranges** (10% of world)
   - Elevation-based zones (foothills, peaks, valleys)
   - Rich mineral deposits and dangerous creatures
   - Ancient mountain temples

7. **Coastal Regions** (10% of world)
   - Beaches, cliffs, and shallow waters
   - Shipwrecks and underwater ruins
   - Fishing opportunities and seashells

8. **Jungle** (7% of world)
   - Dense vegetation with dangerous predators
   - Rare herbs and exotic materials
   - Ancient civilization ruins with puzzles

### Biome Transition Zones
- **Edge Blending**: 50-100 tile transition areas where two biomes mix
- **Hybrid Biomes**: Forest-Grassland, Desert-Oasis, Mountain-Forest edge zones
- **Unique Features**: Special resources and creatures only found in transition zones

## 🎯 Points of Interest (POIs)

### Towns & Villages (Tiered Systems)
1. **Hamlets** (25% of settlements)
   - 3-5 buildings, 8-15 NPCs
   - Basic shops and services
   - Local quests and rumors

2. **Villages** (50% of settlements)
   - 7-12 buildings, 15-40 NPCs
   - Craftsmen, inn, temple
   - More complex storylines

3. **Towns** (20% of settlements)
   - 15-25 buildings, 40-100 NPCs
   - Full economic systems
   - Guild halls and training areas

4. **Cities** (5% of settlements)
   - 50+ buildings, 100+ NPCs
   - Multiple districts and factions
   - Major story questlines

### Special Locations
1. **Dungeons** (Randomly distributed)
   - 3-5 levels of increasing difficulty
   - Unique bosses and rare rewards
   - Themed around current biome

2. **Ruins** (200+ across world)
   - Ancient temples, castles, civilizations
   - Puzzles, traps, and secret chambers
   - Historical narrative elements

3. **Resource Camps** (Mining, Logging, Fishing)
   - Player-built or NPC-operated
   - Sustainable resource gathering
   - Defense against monster attacks

4. **Shrines & Monuments**
   - Mystical locations with special effects
   - Stat bonuses, healing, or temporary powers
   - Unique story elements

## 👹 Mob & NPC System

### Passive Creatures
- **Wildlife**: Deer, rabbits, birds, fish (varies by biome)
- **Domestic Animals**: Cows, sheep, chickens (near settlements)
- **Insects**: Butterflies, beetles, fireflies (environmental detail)

### Neutral Creatures
- **Territorial**: Bears, wolves, territorial birds
- **Resource Protectors**: Bees guarding hives, birds protecting nests
- **Wandering**: Travelers, merchants with guarded caravans

### Hostile Creatures
1. **Common Enemies** (Spawn frequently)
   - Goblins, skeletons, wild animals
   - Weak individually, dangerous in groups

2. **Elite Enemies** (Rare spawns)
   - Chieftains, corrupted creatures
   - Better loot and experience rewards

3. **Boss Creatures** (Unique encounters)
   - Massive creatures in specific locations
   - Challenging combat with massive rewards

### NPC Types
1. **Merchants** (15-20 types per settlement)
   - General goods, armor/weapons, specialty items
   - Dynamic pricing based on supply/demand

2. **Service NPCs** (Healers, trainers, quest givers)
   - Skill advancement and healing services
   - Character customization options

3. **Resident NPCs** (Background characters)
   - Daily routines and random conversations
   - Minor quests and world flavor

## ⛏️ Resource & Crafting System

### Mineable Resources
1. **Ore Deposits** (Vein-based distribution)
   - Copper, tin, iron, silver, gold, mithril
   - Depth-based rarity (deeper = rarer ores)

2. **Stone Types** (Geological formations)
   - Limestone, granite, marble, obsidian
   - Different building and crafting properties

### Harvestable Resources
1. **Timber** (Tree-based)
   - Oak, birch, pine, magic wood types
   - Sustainable farming systems

2. **Herbalism** (Plant-based)
   - Healing herbs, cooking ingredients, crafting materials
   - Seasonal growth and regrowth cycles

3. **Fishing** (Water-based)
   - Different fish types by water body
   - Treasure and rare items as rare catches

### Resource Clustering
- **Natural Deposits**: Ore veins, herb gardens, tree groves
- **Resource Rich Areas**: Biome-specific material concentrations
- **Seasonal Variations**: Resource availability changes over time

## 📚 Quest & Progression System

### Quest Types
1. **Main Story Quests** (Global narrative)
   - Major plot advancement
   - Character development and world revelation

2. **Side Quests** (Settlement-specific)
   - NPC personal stories
   - Local problems and solutions

3. **Exploration Quests** (Discover-based)
   - Find specific locations
   - Map completion incentives

4. **Collection Quests** (Gathering-based)
   - Rare or difficult to obtain items
   - Skill development opportunities

### Skill Progression
1. **Combat Skills** (Swords, Archery, Magic)
   - Experience through combat
   - Skill trees and specialization

2. **Crafting Skills** (Smithing, Cooking, Enchanting)
   - Experience through crafting
   - Advanced recipes and techniques

3. **Exploration Skills** (Mining, Herbalism, Fishing)
   - Experience through resource gathering
   - Better yield and rare find chances

## 🎲 Random Spawns & Events

### Dynamic Events
1. **Weather Systems**
   - Rain, storms, blizzards affecting gameplay
   - Seasonal changes over time

2. **Monster Raids**
   - Groups of monsters migrating through areas
   - Temporary danger zones and rewards

3. **Festivals & Celebrations**
   - NPC celebrations in settlements
   - Special quests and rewards

### Random Encounters
1. **Travel Encounters**
   - Random events during long journeys
   - Opportunity for discovery and danger

2. **Mysterious Spawns**
   - Temporary structures or creatures
   - Limited-time events with unique rewards

## 🗡️ Combat & Challenge System

### Combat Types
1. **Open World Combat**
   - Encounter monsters in the wild
   - Environmental advantages and disadvantages

2. **Dungeon Combat**
   - Tactical, challenging encounters
   - Unique mechanics and puzzle elements

3. **Boss Combat**
   - Massive, complex encounters
   - Environmental interaction and multiple phases

### Challenge Scaling
- **Level-Based**: Enemies match player level in certain areas
- **Endgame Content**: High-level zones for max-level players
- **Risk/Reward**: Dangerous areas offer better rewards

## 🏗️ Settlement & Building System

### Player Settlements
1. **Campsites** (Beginner level)
   - Basic survival structures
   - Temporary and portable

2. **Outposts** (Intermediate level)
   - Permanent structures with basic functions
   - Resource storage and crafting

3. **Villages** (Advanced level)
   - Multiple buildings with different functions
   - NPC residents and automated systems

4. **Cities** (Expert level)
   - Complex urban environments
   - Economic systems and trade routes

### Building Constraints
- **Foundation Requirements**: Must build in appropriate terrain
- **Resource Needs**: Buildings require specific materials
- **Population Limits**: Advanced buildings require population thresholds

## 🎮 Player Progression & Endgame

### Early Game (Levels 1-20)
- Basic survival and exploration
- Learning combat and crafting systems
- Discovering the first few settlements

### Mid Game (Levels 21-50)
- Advanced crafting and better equipment
- Exploring multiple biomes
- Completing main story quests

### Late Game (Levels 51-80)
- High-level dungeons and raids
- Player settlement construction
- Faction and reputation systems

### Endgame (Level 80+)
- World event participation
- Player vs. player and guild systems
- Master crafting and legendary equipment

## 🔧 Technical Implementation Notes

### Procedural Generation Algorithms
- **Perlin Noise**: For natural terrain features
- **Voronoi Diagrams**: For biome and settlement distribution
- **Cellular Automata**: For cave systems and underground features

### Performance Considerations
- **Chunk Loading**: Only generate and render visible areas
- **LOD System**: Simplified rendering for distant features
- **Resource Management**: Asset streaming and caching

### Save System Integration
- **Persistent World**: Player changes remain in world
- **Procedural Seeding**: Same seed produces same world features
- **Dynamic Updates**: World can evolve based on player actions

---

*This design document serves as a foundation for the world generation system in Runes of Tir na nÓg. It balances procedural generation with handcrafted elements to create a world that feels both infinite and meaningful.*