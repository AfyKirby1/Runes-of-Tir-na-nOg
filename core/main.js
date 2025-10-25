import { Game } from './Game.js';
import { SaveSystem } from './SaveSystem.js';

// SUPER OBVIOUS DEBUG MESSAGE
console.log('🚨🚨🚨 MAIN.JS LOADED - DEBUG VERSION ACTIVE 🚨🚨🚨');

window.addEventListener('load', async () => {
    try {
        let game;
        let worldConfig = null;
        let saveData = null;

        // Parse URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const isNewWorld = urlParams.get('new') === 'true';
        const slotParam = urlParams.get('slot');
        const isMultiplayer = urlParams.get('multiplayer') === 'true';
        const customWorld = urlParams.get('customWorld');

        // DEBUG: Log URL parameters immediately
        console.log('🔍 DEBUG: URL parameters detected:', {
            isMultiplayer,
            customWorld,
            isNewWorld,
            slotParam,
            fullURL: window.location.href,
            searchParams: window.location.search
        });

        if (isNewWorld) {
            // Load world config from sessionStorage
            const configJson = sessionStorage.getItem('worldConfig');
            if (configJson) {
                worldConfig = JSON.parse(configJson);
                
                // Prompt for save slot
                const slot = prompt('Save to slot (1 or 2):');
                const slotNum = parseInt(slot);
                if (slotNum === 1 || slotNum === 2) {
                    game = new Game(worldConfig, null);
                    game.saveSlot = slotNum;
                } else {
                    game = new Game(worldConfig, null);
                }
                
                // Clear session storage
                sessionStorage.removeItem('worldConfig');
            } else {
                game = new Game(null, null);
            }
        } else if (slotParam) {
            // Load from save slot
            const slotNum = parseInt(slotParam);
            if (slotNum >= 1 && slotNum <= SaveSystem.MAX_SLOTS) {
                saveData = SaveSystem.loadWorld(slotNum);
                if (saveData) {
                    game = new Game(null, saveData);
                    game.saveSlot = slotNum;
                } else {
                    console.error(`No save data found in slot ${slotNum}`);
                    game = new Game(null, null);
                }
            } else {
                console.error('Invalid slot number');
                game = new Game(null, null);
            }
        } else if (isMultiplayer) {
            // Load custom world for multiplayer
            console.log('🌍 Loading custom world for multiplayer...');
            console.log('🔍 URL params:', { isMultiplayer, customWorld, isNewWorld, slotParam });
            try {
                // Try to load the custom world data from Railway server
                console.log('🔍 Fetching world data from: https://web-production-b1ed.up.railway.app/worlds/world.json');
                const worldDataResponse = await fetch('https://web-production-b1ed.up.railway.app/worlds/world.json');
                console.log('📡 Fetch response status:', worldDataResponse.status, worldDataResponse.statusText);
                console.log('📡 Response headers:', Object.fromEntries(worldDataResponse.headers.entries()));
                
                if (worldDataResponse.ok) {
                    const customWorldData = await worldDataResponse.json();
                    console.log('✅ Custom world data loaded successfully:', customWorldData.metadata?.name || 'Tir na nÓg');
                    console.log('📏 World dimensions:', customWorldData.worldWidth, 'x', customWorldData.worldHeight);
                    console.log('🧱 Total tiles:', customWorldData.tiles?.length || 0);
                    console.log('🎮 Creating game with custom world data...');
                    game = new Game(null, null, customWorldData);
                } else {
                    console.warn('⚠️ Could not load custom world (HTTP', worldDataResponse.status, '), using default');
                    console.warn('🔄 Falling back to default world generation');
                    const responseText = await worldDataResponse.text();
                    console.warn('📄 Response body:', responseText);
                    game = new Game(null, null);
                }
            } catch (error) {
                console.warn('❌ Error loading custom world:', error);
                console.warn('🔄 Using default world instead');
                console.warn('❌ Error details:', error.message, error.stack);
                game = new Game(null, null);
            }
        } else if (customWorld) {
            // Load custom world
            console.log('🌍 Loading custom world:', customWorld);
            try {
                // Try to load the custom world data from the worlds directory
                const worldPath = `../worlds/${customWorld}/world.json`;
                console.log('🔍 Fetching world data from:', worldPath);
                const worldDataResponse = await fetch(worldPath);
                console.log('📡 Fetch response status:', worldDataResponse.status, worldDataResponse.statusText);
                
                if (worldDataResponse.ok) {
                    const customWorldData = await worldDataResponse.json();
                    console.log('✅ Custom world data loaded successfully:', customWorldData.metadata?.name || customWorld);
                    console.log('📏 World dimensions:', customWorldData.worldWidth, 'x', customWorldData.worldHeight);
                    console.log('🧱 Total tiles:', customWorldData.tiles?.length || 0);
                    console.log('🎮 Creating game with custom world data...');
                    game = new Game(null, null, customWorldData);
                } else {
                    console.error('❌ Failed to load custom world (HTTP', worldDataResponse.status, ')');
                    alert(`Failed to load custom world: ${customWorld}\n\nMake sure you have placed world.json in: RunesOfTirNaNog/worlds/${customWorld}/world.json`);
                    game = new Game(null, null);
                }
            } catch (error) {
                console.error('❌ Error loading custom world:', error);
                alert(`Failed to load custom world: ${customWorld}\n\nMake sure you have placed world.json in: RunesOfTirNaNog/worlds/${customWorld}/world.json`);
                game = new Game(null, null);
            }
        } else {
            // No parameters, create default world
            game = new Game(null, null);
        }

        window.game = game;

        // Initialize multiplayer if enabled
        if (isMultiplayer) {
            console.log('Multiplayer mode enabled - connecting to server...');
            game.connectToMultiplayer().then(success => {
                if (success) {
                    console.log('Successfully connected to multiplayer server');
                } else {
                    console.error('Failed to connect to multiplayer server');
                    console.error('Make sure the WebSocket server is running on wss://web-production-b1ed.up.railway.app/ws');
                }
            }).catch(error => {
                console.error('Multiplayer connection error:', error);
                console.error('Make sure the WebSocket server is running on wss://web-production-b1ed.up.railway.app/ws');
            });
        }

        // Make functions globally available for debugging
        window.setPlayerName = (name) => game.setPlayerName(name);
        window.getPlayerName = () => game.getPlayerName();
        window.connectMultiplayer = () => game.connectToMultiplayer();
        window.disconnectMultiplayer = () => game.disconnectFromMultiplayer();

        console.log('Runes of Tir na nÓg - Game initialized successfully');
        console.log('Components loaded:', {
            Player: '✓',
            Input: '✓',
            World: '✓',
            Camera: '✓',
            UI: '✓',
            GameLoop: '✓',
            NameTag: '✓',
            SaveSystem: '✓',
            NetworkManager: '✓'
        });
        console.log('Player name:', game.getPlayerName());
        console.log('Multiplayer enabled:', isMultiplayer);
        console.log('Try: setPlayerName("Your Name") to change the player name');
        console.log('Try: connectMultiplayer() to connect to server');
    } catch (error) {
        console.error('Failed to initialize game:', error);
    }
});

// Pause when window loses focus
document.addEventListener('visibilitychange', () => {
    if (window.game) {
        if (document.hidden) {
            window.game.pause();
        } else {
            window.game.resume();
        }
    }
});