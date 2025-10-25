# Legacy Server Files

## 📁 What's in this folder?

This folder contains the **old local development server** files that were used before migrating to Railway hosting.

## 🚀 Current Setup

**Active Server:** Railway (wss://web-production-b1ed.up.railway.app)
**Location:** Separate repository (RunesOfTirNaNog-Server)

## 📋 Legacy Files

- `multiplayer_server.py` - Old local WebSocket server
- `requirements.txt` - Python dependencies for local server
- `start_server.bat` - Windows batch file to start local server
- `test_server.py` - Test script for local server connection
- `README.md` - Original server documentation
- `worlds/` - World data files (now served by Railway)

## ⚠️ Important Notes

- **DO NOT DELETE** - These files are kept for reference
- **DO NOT RUN** - The game now connects to Railway server
- **FOR DEVELOPMENT** - Use these files if you need to test locally

## 🔄 Migration History

- **Before:** Game connected to `ws://localhost:1234`
- **After:** Game connects to `wss://web-production-b1ed.up.railway.app`
- **Date:** October 22, 2025

## 🛠️ If You Need Local Testing

1. Move files back to `server/` folder
2. Update `NetworkManager.js` to use `ws://localhost:1234`
3. Run `start_server.bat`
4. Test locally
5. **Remember to change back to Railway URL when done!**
