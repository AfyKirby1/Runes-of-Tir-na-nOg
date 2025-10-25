#!/usr/bin/env python3
"""
Runes of Tir na nÓg - Multiplayer WebSocket Server
Handles real-time multiplayer game state synchronization
"""

import asyncio
import websockets
import json
import logging
from datetime import datetime
from typing import Dict, Set, Optional
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GameServer:
    def __init__(self):
        self.players: Dict[str, Dict] = {}  # {player_id: {name, x, y, color, connected_at}}
        self.npcs: Dict[str, Dict] = {}  # {npc_id: {name, x, y, health, behavior, etc.}}
        self.game_state = {
            'world_data': None,
            'server_start_time': datetime.now().isoformat(),
            'max_players': 8
        }
        self.player_colors = [
            '#4ade80',  # Green
            '#3b82f6',  # Blue  
            '#ef4444',  # Red
            '#f59e0b',  # Orange
            '#8b5cf6',  # Purple
            '#06b6d4',  # Cyan
            '#84cc16',  # Lime
            '#f97316'   # Orange-red
        ]
        self.used_colors: Set[str] = set()
        
        # Load world data
        self.load_world_data()
        
        # Initialize NPCs from world data
        self.initialize_npcs()
    
    def load_world_data(self):
        """Load the Tir na nÓg world data"""
        try:
            world_path = os.path.join(os.path.dirname(__file__), 'worlds', 'world.json')
            if os.path.exists(world_path):
                with open(world_path, 'r') as f:
                    self.game_state['world_data'] = json.load(f)
                logger.info(f"Loaded world data from {world_path}")
            else:
                logger.warning(f"World file not found at {world_path}")
        except Exception as e:
            logger.error(f"Failed to load world data: {e}")
    
    def initialize_npcs(self):
        """Initialize NPCs from world data"""
        try:
            if self.game_state['world_data'] and 'npcs' in self.game_state['world_data']:
                for npc_data in self.game_state['world_data']['npcs']:
                    npc_id = npc_data.get('id', f"npc_{len(self.npcs) + 1}")
                    self.npcs[npc_id] = {
                        'id': npc_id,
                        'name': npc_data.get('name', 'Unknown NPC'),
                        'x': npc_data.get('x', 100),
                        'y': npc_data.get('y', 100),
                        'health': npc_data.get('health', 100),
                        'max_health': npc_data.get('health', 100),
                        'behavior': npc_data.get('behavior', 'wander'),
                        'wander_radius': npc_data.get('wanderRadius', 50),
                        'interactable': npc_data.get('interactable', True),
                        'color': npc_data.get('color', '#8b4513'),
                        'dialogue': npc_data.get('dialogue', ['Hello!']),
                        'width': npc_data.get('width', 32),
                        'height': npc_data.get('height', 32),
                        'is_custom': npc_data.get('isCustom', False),
                        'custom_image': npc_data.get('customImage', None),
                        'last_movement': datetime.now().isoformat(),
                        'target_x': npc_data.get('x', 100),
                        'target_y': npc_data.get('y', 100),
                        'is_moving': False
                    }
                logger.info(f"Initialized {len(self.npcs)} NPCs from world data")
            else:
                logger.warning("No NPC data found in world file")
        except Exception as e:
            logger.error(f"Failed to initialize NPCs: {e}")
    
    def get_available_color(self) -> str:
        """Get an available player color"""
        for color in self.player_colors:
            if color not in self.used_colors:
                self.used_colors.add(color)
                return color
        
        # If all colors used, return a default
        return '#d4af37'  # Gold
    
    def release_color(self, color: str):
        """Release a player color when they disconnect"""
        self.used_colors.discard(color)
    
    def validate_username(self, username: str) -> bool:
        """Validate username according to game rules"""
        if not username or len(username) < 1 or len(username) > 20:
            return False
        
        # Only allow alphanumeric, spaces, and basic punctuation
        import re
        pattern = r'^[a-zA-Z0-9\s\-_\.]+$'
        return bool(re.match(pattern, username))
    
    async def handle_player_connection(self, websocket, path=None):
        """Handle a new player connection"""
        player_id = None
        try:
            logger.info(f"New connection from {websocket.remote_address}")
            
            async for message in websocket:
                try:
                    data = json.loads(message)
                    message_type = data.get('type')
                    logger.info(f"Received message type: {message_type} from {websocket.remote_address}")
                    
                    if message_type == 'join':
                        player_id = await self.handle_player_join(websocket, data)
                    elif message_type == 'position_update':
                        await self.handle_position_update(player_id, data)
                    elif message_type == 'ping':
                        await self.send_to_player(websocket, {'type': 'pong', 'timestamp': data.get('timestamp')})
                    elif message_type == 'npc_interact':
                        await self.handle_npc_interaction(player_id, data)
                    elif message_type == 'npc_attack':
                        await self.handle_npc_attack(player_id, data)
                    else:
                        logger.warning(f"Unknown message type: {message_type}")
                        
                except json.JSONDecodeError:
                    logger.error("Invalid JSON received")
                    await self.send_error(websocket, "Invalid message format")
                except Exception as e:
                    logger.error(f"Error processing message: {e}")
                    await self.send_error(websocket, "Server error")
                    
        except websockets.exceptions.ConnectionClosed:
            logger.info(f"Player {player_id} disconnected")
        except Exception as e:
            logger.error(f"Connection error: {e}")
        finally:
            if player_id:
                await self.handle_player_disconnect(player_id)
    
    async def handle_player_join(self, websocket, data):
        """Handle player joining the game"""
        username = data.get('username', '').strip()
        logger.info(f"Player attempting to join with username: '{username}'")
        
        # Validate username
        if not self.validate_username(username):
            logger.warning(f"Invalid username rejected: '{username}'")
            await self.send_error(websocket, "Invalid username")
            return None
        
        # Check if username is already taken
        for player_data in self.players.values():
            if player_data.get('name') == username:
                await self.send_error(websocket, "Username already taken")
                return None
        
        # Check player limit
        if len(self.players) >= self.game_state['max_players']:
            await self.send_error(websocket, "Server is full")
            return None
        
        # Generate player ID and assign color
        player_id = f"player_{len(self.players) + 1}_{datetime.now().strftime('%H%M%S')}"
        player_color = self.get_available_color()
        
        # Add player to game state
        self.players[player_id] = {
            'name': username,
            'x': 100,  # Default spawn position
            'y': 100,
            'color': player_color,
            'connected_at': datetime.now().isoformat(),
            'websocket': websocket
        }
        
        logger.info(f"Player {username} ({player_id}) joined successfully. Total players: {len(self.players)}")
        
        # Send join confirmation to player
        await self.send_to_player(websocket, {
            'type': 'join_success',
            'player_id': player_id,
            'player_data': self.players[player_id],
            'game_state': self.get_public_game_state(),
            'npcs': self.get_npcs_data()
        })
        
        # Notify other players
        await self.broadcast_to_others(player_id, {
            'type': 'player_joined',
            'player_id': player_id,
            'player_data': self.players[player_id]
        })
        
        logger.info(f"Player {username} joined as {player_id}")
        return player_id
    
    async def handle_position_update(self, player_id, data):
        """Handle player position updates"""
        if player_id not in self.players:
            return
        
        # Update player position
        self.players[player_id]['x'] = data.get('x', self.players[player_id]['x'])
        self.players[player_id]['y'] = data.get('y', self.players[player_id]['y'])
        
        # Broadcast position to other players
        await self.broadcast_to_others(player_id, {
            'type': 'player_position',
            'player_id': player_id,
            'x': self.players[player_id]['x'],
            'y': self.players[player_id]['y']
        })
    
    async def handle_player_disconnect(self, player_id):
        """Handle player disconnection"""
        if player_id in self.players:
            player_data = self.players[player_id]
            color = player_data.get('color')
            name = player_data.get('name')
            
            # Release color
            self.release_color(color)
            
            # Remove player
            del self.players[player_id]
            
            # Notify other players
            await self.broadcast_to_all({
                'type': 'player_left',
                'player_id': player_id,
                'player_name': name
            })
            
            logger.info(f"Player {name} ({player_id}) disconnected")
    
    async def handle_npc_interaction(self, player_id, data):
        """Handle NPC interaction from player"""
        if player_id not in self.players:
            return
        
        npc_id = data.get('npc_id')
        if npc_id not in self.npcs:
            await self.send_error(self.players[player_id]['websocket'], "NPC not found")
            return
        
        npc = self.npcs[npc_id]
        player = self.players[player_id]
        
        # Check if player is close enough to interact
        distance = ((player['x'] - npc['x'])**2 + (player['y'] - npc['y'])**2)**0.5
        if distance > 100:  # Interaction range
            await self.send_error(self.players[player_id]['websocket'], "Too far from NPC")
            return
        
        # Send interaction response
        await self.send_to_player(self.players[player_id]['websocket'], {
            'type': 'npc_interaction_response',
            'npc_id': npc_id,
            'npc_name': npc['name'],
            'dialogue': npc['dialogue']
        })
        
        logger.info(f"Player {player['name']} interacted with NPC {npc['name']}")
    
    async def handle_npc_attack(self, player_id, data):
        """Handle NPC attack from player"""
        if player_id not in self.players:
            return
        
        npc_id = data.get('npc_id')
        if npc_id not in self.npcs:
            await self.send_error(self.players[player_id]['websocket'], "NPC not found")
            return
        
        npc = self.npcs[npc_id]
        player = self.players[player_id]
        
        # Check if player is close enough to attack
        distance = ((player['x'] - npc['x'])**2 + (player['y'] - npc['y'])**2)**0.5
        if distance > 80:  # Attack range
            await self.send_error(self.players[player_id]['websocket'], "Too far from NPC")
            return
        
        # Calculate damage (simple system)
        damage = 10  # Base damage
        npc['health'] = max(0, npc['health'] - damage)
        
        # Broadcast NPC health update
        await self.broadcast_to_all({
            'type': 'npc_health_update',
            'npc_id': npc_id,
            'health': npc['health'],
            'max_health': npc['max_health']
        })
        
        # Check if NPC is defeated
        if npc['health'] <= 0:
            await self.broadcast_to_all({
                'type': 'npc_defeated',
                'npc_id': npc_id,
                'npc_name': npc['name']
            })
            logger.info(f"NPC {npc['name']} defeated by {player['name']}")
        else:
            logger.info(f"Player {player['name']} attacked NPC {npc['name']} for {damage} damage")
    
    def get_npcs_data(self):
        """Get NPC data for clients"""
        return {
            npc_id: {
                'id': npc['id'],
                'name': npc['name'],
                'x': npc['x'],
                'y': npc['y'],
                'health': npc['health'],
                'max_health': npc['max_health'],
                'behavior': npc['behavior'],
                'color': npc['color'],
                'width': npc['width'],
                'height': npc['height'],
                'is_custom': npc['is_custom'],
                'custom_image': npc['custom_image']
            }
            for npc_id, npc in self.npcs.items()
        }
    
    async def send_to_player(self, websocket, message):
        """Send message to specific player"""
        try:
            await websocket.send(json.dumps(message))
        except websockets.exceptions.ConnectionClosed:
            pass
    
    async def broadcast_to_others(self, exclude_player_id, message):
        """Broadcast message to all players except one"""
        for player_id, player_data in self.players.items():
            if player_id != exclude_player_id:
                websocket = player_data.get('websocket')
                if websocket:
                    await self.send_to_player(websocket, message)
    
    async def broadcast_to_all(self, message):
        """Broadcast message to all players"""
        for player_data in self.players.values():
            websocket = player_data.get('websocket')
            if websocket:
                await self.send_to_player(websocket, message)
    
    async def send_error(self, websocket, error_message):
        """Send error message to player"""
        await self.send_to_player(websocket, {
            'type': 'error',
            'message': error_message
        })
    
    def get_public_game_state(self):
        """Get public game state (without sensitive data)"""
        return {
            'world_data': self.game_state['world_data'],
            'server_start_time': self.game_state['server_start_time'],
            'max_players': self.game_state['max_players'],
            'current_players': len(self.players),
            'players': {
                pid: {
                    'name': data['name'],
                    'x': data['x'],
                    'y': data['y'],
                    'color': data['color'],
                    'connected_at': data['connected_at']
                }
                for pid, data in self.players.items()
            }
        }

async def main():
    """Start the multiplayer server"""
    server = GameServer()
    
    # Create a wrapper function for the WebSocket handler
    async def websocket_handler(websocket, path=None):
        await server.handle_player_connection(websocket)
    
    # Start WebSocket server
    start_server = websockets.serve(
        websocket_handler,
        "localhost",
        1234,  # Multiplayer server port
        ping_interval=20,
        ping_timeout=10
    )
    
    logger.info("Starting Runes of Tir na nÓg Multiplayer Server...")
    logger.info("WebSocket server running on ws://localhost:1234")
    logger.info("Press Ctrl+C to stop")
    
    try:
        await start_server
        await asyncio.Future()  # Run forever
    except KeyboardInterrupt:
        logger.info("Server stopped")

if __name__ == "__main__":
    asyncio.run(main())
