#!/usr/bin/env python3
"""
Test script to verify the multiplayer server is working
"""

import asyncio
import websockets
import json

async def test_connection():
    """Test connection to the multiplayer server"""
    try:
        print("Testing connection to ws://localhost:1234...")
        
        async with websockets.connect("ws://localhost:1234") as websocket:
            print("✓ Connected to server successfully!")
            
            # Test join message
            join_message = {
                "type": "join",
                "username": "TestPlayer"
            }
            
            await websocket.send(json.dumps(join_message))
            print("✓ Sent join message")
            
            # Wait for response
            response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
            data = json.loads(response)
            
            if data.get("type") == "join_success":
                print("✓ Server responded with join_success")
                print(f"✓ Player ID: {data.get('player_id')}")
                print(f"✓ Player name: {data.get('player_data', {}).get('name')}")
            else:
                print(f"✗ Unexpected response: {data}")
                
    except asyncio.TimeoutError:
        print("✗ Connection timeout - server may not be running")
    except ConnectionRefusedError:
        print("✗ Connection refused - server is not running on localhost:1234")
    except Exception as e:
        print(f"✗ Error: {e}")

if __name__ == "__main__":
    print("Runes of Tir na nÓg - Server Connection Test")
    print("=" * 50)
    asyncio.run(test_connection())
    print("=" * 50)
    print("Test completed!")
