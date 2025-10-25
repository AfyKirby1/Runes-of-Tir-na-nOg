# How to Start Multiplayer Server

## Quick Start

1. **Open Command Prompt/Terminal**
2. **Navigate to server directory**:
   ```bash
   cd RunesOfTirNaNog/server
   ```
3. **Start the server**:
   ```bash
   start_server.bat
   ```

## What You Should See

```
Starting Runes of Tir na nOg Multiplayer Server...

Installing dependencies...

Starting WebSocket server on ws://localhost:1234
Press Ctrl+C to stop the server

Starting Runes of Tir na nÓg Multiplayer Server...
WebSocket server running on ws://localhost:1234
Press Ctrl+C to stop
```

## Testing the Server

In another terminal window:
```bash
cd RunesOfTirNaNog/server
python test_server.py
```

You should see:
```
✓ Connected to server successfully!
✓ Sent join message
✓ Server responded with join_success
✓ Player ID: player_1_...
✓ Player name: TestPlayer
```

## Troubleshooting

- **"Connection refused"**: Server is not running
- **"ModuleNotFoundError: No module named 'websockets'"**: Run `pip install websockets`
- **"Python is not installed"**: Install Python 3.7+ from python.org

## Port Information

- **HTTP Server**: http://localhost:8000 (serves game files)
- **WebSocket Server**: ws://localhost:1234 (multiplayer communication)
