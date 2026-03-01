# 🚀 NeuroAdaptiveOS - Complete Setup Guide

This guide will walk you through setting up NeuroAdaptiveOS from scratch.

---

## ✅ Prerequisites

Before starting, make sure you have:
- **Python 3.8+** installed ([Download here](https://www.python.org/downloads/))
- **Google Chrome** browser
- **PowerShell** or **Command Prompt** (Windows)

---

## 📦 Step 1: Install Python Dependencies

Open **PowerShell** and navigate to the project folder:

```powershell
cd C:\Users\mshas\OneDrive\Desktop\NEUROS
```

Navigate to the backend folder:

```powershell
cd backend
```

Install all required Python packages:

```powershell
pip install Flask==3.0.0
pip install flask-cors==4.0.0
pip install bcrypt==4.1.2
```

**Or install all at once from requirements.txt:**

```powershell
pip install -r requirements.txt
```

---

## 🔧 Step 2: Verify Installation

Check if packages are installed correctly:

```powershell
pip list
```

You should see:
- Flask (3.0.0)
- flask-cors (4.0.0)
- bcrypt (4.1.2)

---

## 🖥️ Step 3: Start the Backend Server

While still in the `backend` folder, start the Flask server:

```powershell
python app.py
```

You should see:
```
✅ Database initialized
🚀 Starting NeuroAdaptiveOS backend...
📡 Listening on http://localhost:5000
📊 Ready to receive feature vectors
```

**Keep this PowerShell window open!** The server must stay running.

---

## 🌐 Step 4: Load the Chrome Extension

1. Open **Google Chrome**
2. Go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **"Load unpacked"**
5. Navigate to: `C:\Users\mshas\OneDrive\Desktop\NEUROS\extension`
6. Click **"Select Folder"**

The extension should now appear in your extensions list!

---

## ✨ Step 5: Test the Extension

1. Open any webpage (e.g., Wikipedia, news site)
2. Wait 1-2 seconds for the extension to load
3. You should see:
   - **Login/Signup modal** (if backend is running)
   - **OR** Extension works silently in adaptive mode (if backend is offline)

---

## 🔐 Step 6: Create an Account (Optional)

If the login modal appears:

**Option A: Sign Up**
1. Enter a username (min 3 characters)
2. Enter a password (min 6 characters)
3. Click **"Sign Up"**
4. Complete the 7-step onboarding questionnaire
5. Your preferences will be saved!

**Option B: Skip Authentication**
1. Click **"Skip (use adaptive mode)"**
2. Extension works locally without account
3. Preferences stored only on your device

---

## 🎯 Step 7: Use the Extension

### Adaptive Mode (Automatic)
- Extension tracks your behavior
- Adapts text when cognitive load detected
- Click the floating button (bottom-right) to see metrics

### Personalized Mode (Manual)
1. Click the floating button (bottom-right)
2. Switch to **"Personalized"** tab
3. Adjust sliders or select presets
4. Click **"Save Preferences"**
5. Settings apply to all websites!

---

## 🛑 Stopping the Server

When you're done:

1. Go to the PowerShell window running the server
2. Press `Ctrl + C`
3. Server will stop

---

## 🔄 Restarting Later

**Every time you want to use the extension with authentication:**

1. Open PowerShell
2. Navigate to backend folder:
   ```powershell
   cd C:\Users\mshas\OneDrive\Desktop\NEUROS\backend
   ```
3. Start server:
   ```powershell
   python app.py
   ```
4. Extension will automatically connect!

**Note:** Extension works without backend, but authentication and profile sync require the server running.

---

## 🐛 Troubleshooting

### "Module not found" error
```powershell
pip install Flask flask-cors bcrypt
```

### Backend won't start
- Check if Python is installed: `python --version`
- Make sure you're in the `backend` folder
- Try: `python -m flask run`

### Extension not loading
- Make sure Developer mode is enabled in Chrome
- Try reloading the extension in `chrome://extensions/`
- Check browser console (F12) for errors

### Login modal not appearing
- Backend must be running first
- Wait 1-2 seconds after page load
- Check if `http://localhost:5000/health` is accessible

### Port 5000 already in use
- Another app is using port 5000
- Stop other Flask apps
- Or change port in `app.py`: `app.run(debug=True, port=5001)`

---

## 📝 Quick Reference

### Start Backend
```powershell
cd C:\Users\mshas\OneDrive\Desktop\NEUROS\backend
python app.py
```

### Stop Backend
Press `Ctrl + C` in PowerShell

### Reload Extension
Go to `chrome://extensions/` → Click reload icon

### View Logs
- Backend: Check PowerShell window
- Extension: Press F12 in browser → Console tab

---

## 🎉 You're All Set!

NeuroAdaptiveOS is now running. Try:
- Scrolling rapidly on a webpage
- Clicking multiple times quickly
- Switching between tabs
- Watch the extension adapt the text automatically!

For demo mode, click the floating button and use **"Simulate High Load"** button.

---

**Need help?** Check the main README.md for detailed documentation.
