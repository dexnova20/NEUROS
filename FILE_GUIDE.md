# NeuroAdaptive - File Guide for Team

This guide explains what each file does in our project. Written in simple language so anyone can understand.

---

## 📁 Project Folder Structure

```
NeuroAdaptive/
├── extension/              (The main browser extension code)
│   ├── core/              (Brain of the system - works on any browser)
│   ├── browser/           (Chrome-specific code)
│   ├── content.js         (Main file that runs everything)
│   ├── background.js      (Runs in background)
│   ├── popup.html         (Small popup window)
│   ├── popup.js           (Controls the popup)
│   ├── manifest.json      (Extension settings file)
│   └── styles.css         (Makes text adapt smoothly)
├── backend/               (Optional AI server)
│   ├── app.py            (Python server)
│   └── requirements.txt  (Python packages needed)
└── README.md             (Project documentation)
```

---

## 🎯 Main Files Explained

### **manifest.json** - Extension Settings File
**What it does**: Tells Chrome how to run our extension.

**Important parts**:
- Lists what permissions we need (like accessing tabs and saving data)
- Says which files to load and in what order
- Sets the extension name, version, and icon
- Tells Chrome to run our code on all websites

**Think of it as**: The instruction manual that Chrome reads first.

---

### **content.js** - The Main Controller (800 lines)
**What it does**: This is the boss file. It controls everything.

**Main jobs**:
1. Tracks what the user is doing (scrolling, clicking, switching tabs)
2. Calculates if the user is struggling (friction score)
3. Decides when to make text bigger or easier to read
4. Shows the control panel on the webpage
5. Asks the user if they like AI suggestions
6. Remembers user preferences

**Think of it as**: The brain that connects everything together.

**Key features**:
- Runs a check every 10 seconds to see if text needs adjustment
- Uses smooth transitions so changes aren't jarring
- Respects user choices (if you manually adjust something, AI won't override it)

---

### **styles.css** - Smooth Text Adaptation
**What it does**: Makes text size, spacing, and line height change smoothly.

**How it works**:
- Uses CSS variables (like `--neuro-scale`) that can be changed by JavaScript
- Applies smooth 0.5-second transitions so changes feel natural
- Targets all text elements (paragraphs, headings, buttons, etc.)

**Think of it as**: The styling rules that make text adapt without looking glitchy.

---

## 🧠 Core Folder - The Smart Engine

These files work on any browser (Chrome, Firefox, Edge, etc.).

### **core/scoring.js** - Friction Detector (150 lines)
**What it does**: Figures out if the user is struggling to read.

**How it detects struggle**:
1. **Scroll variance** (30% importance) - Are they scrolling back and forth a lot?
2. **Rage clicks** (25% importance) - Are they clicking the same spot repeatedly?
3. **Re-reading** (20% importance) - Are they reading the same section again?
4. **Tab switching** (15% importance) - Are they switching tabs frequently?

**Think of it as**: A detective that watches user behavior to spot reading problems.

**Key methods**:
- `updateBaseline()` - Learns normal behavior in the first 20 seconds
- `computeFrictionScore()` - Calculates struggle level (0 = easy, 1 = very hard)
- `recalibrate()` - Resets if user clicks "Recalibrate" button

---

### **core/personalization.js** - User Preferences Manager (100 lines)
**What it does**: Saves and loads user settings.

**What it manages**:
- Mode (Adaptive or Personalized)
- Presets (Low Vision, Dyslexia, High Contrast)
- Custom adjustments (text size, spacing, line height)
- Which settings the user manually locked

**Think of it as**: A notebook that remembers what each user likes.

---

### **core/adaptation.js** - Decision Maker (80 lines)
**What it does**: Decides when to change text based on friction score.

**Three states**:
1. **Normal** - Everything is fine, no changes needed
2. **Mild** - User struggling a bit, make text slightly bigger
3. **High** - User struggling a lot, make text much bigger

**When it switches states**:
- Normal → Mild: When friction score goes above 0.45
- Mild → High: When friction score goes above 0.70
- High → Mild: When friction score drops below 0.60
- Mild → Normal: When friction score drops below 0.35

**Think of it as**: A thermostat that adjusts text instead of temperature.

---

## 🌐 Browser Folder - Chrome Connection

### **browser/chromeAdapter.js** - Chrome Translator (40 lines)
**What it does**: Talks to Chrome's special features.

**Why we need it**: Different browsers (Chrome, Firefox, Safari) have different ways of doing things. This file translates our code into Chrome language.

**What it handles**:
- Saving/loading data from Chrome storage
- Timing functions
- Detecting what browser is being used

**Think of it as**: A translator between our code and Chrome.

---

## 🖥️ UI Files - What Users See

### **popup.html** - Extension Popup Window
**What it does**: The small window that opens when you click the extension icon.

**What's inside**:
- Current mode display
- Test connection button (checks if backend server is running)
- Quick settings

**Think of it as**: The extension's mini control center.

---

### **popup.js** - Popup Controller
**What it does**: Makes the popup window interactive.

**Main jobs**:
- Shows current settings
- Handles button clicks
- Tests connection to backend server

---

### **background.js** - Background Worker
**What it does**: Runs in the background even when you're not on a webpage.

**Main jobs**:
- Keeps extension alive
- Handles messages between different parts of the extension
- Manages extension lifecycle

**Think of it as**: A security guard that's always on duty.

---

## 🤖 Backend Folder - Optional AI Server

### **backend/app.py** - Python Server (100 lines)
**What it does**: Optional AI server that predicts cognitive load.

**How it works**:
- Receives user behavior data
- Uses machine learning to predict struggle level
- Sends back a score (0 = easy, 1 = hard)

**Think of it as**: An optional AI assistant that gives a second opinion.

**Note**: The extension works fine without this. It's just an extra feature.

---

### **backend/requirements.txt** - Python Packages
**What it does**: Lists Python packages needed to run the server.

**Packages**:
- Flask - Web server framework
- flask-cors - Allows extension to talk to server

---

## 🔄 How Everything Works Together

**Step-by-step flow**:

1. **User visits a website** → content.js starts running
2. **User scrolls, clicks, reads** → content.js tracks all actions
3. **Every 10 seconds** → scoring.js calculates friction score
4. **Score is calculated** → adaptation.js decides if text should change
5. **If change needed** → content.js updates CSS variables
6. **Text adapts smoothly** → styles.css applies 0.5-second transition
7. **User sees easier text** → (hopefully doesn't even notice the change!)
8. **AI suggests change** → User can accept or reject
9. **User feedback saved** → AI learns and gets smarter

---

## 🛠️ For Developers - Quick Tips

### **To test changes**:
1. Edit the file you want to change
2. Go to `chrome://extensions/`
3. Click the reload button on NeuroAdaptive
4. Refresh the webpage you're testing on
5. Check the browser console (F12) for any errors

### **To see what's happening**:
- Open the control panel on any webpage (bottom-right corner)
- Watch the friction score and state changes
- Click "Demo Mode" to simulate high friction

### **Common tasks**:

| Task | File to Edit |
|------|--------------|
| Change when text adapts | core/adaptation.js |
| Add new friction signals | core/scoring.js |
| Change how text looks | styles.css |
| Modify control panel | content.js (search for "createPanel") |
| Add new user settings | core/personalization.js |
| Change AI behavior | content.js (search for "aiConfidence") |

---

## 📊 File Sizes Reference

| File | Lines | Complexity |
|------|-------|------------|
| content.js | ~800 | High (main controller) |
| scoring.js | ~150 | Medium (math calculations) |
| personalization.js | ~100 | Low (data management) |
| adaptation.js | ~80 | Low (simple logic) |
| chromeAdapter.js | ~40 | Low (simple wrapper) |
| app.py | ~100 | Medium (server code) |

**Total project**: ~1,330 lines of code

---

## 🎓 Key Concepts Explained Simply

### **Friction Score**
A number from 0 to 1 that shows how much the user is struggling:
- 0.0 - 0.3 = Reading easily
- 0.3 - 0.6 = Starting to struggle
- 0.6 - 1.0 = Struggling a lot

### **Adaptive State**
The current level of text adjustment:
- **Normal**: No changes (text looks normal)
- **Mild**: Small changes (text 8% bigger, more spacing)
- **High**: Big changes (text 15% bigger, lots of spacing)

### **User Lock**
When you manually adjust a setting, it gets "locked" so AI can't change it. This ensures your preferences are always respected.

### **AI Confidence**
A percentage (10% - 100%) that shows how much the AI trusts its suggestions. Goes up when you accept suggestions, goes down when you reject them.

### **Hysteresis**
A fancy word meaning "don't change back too quickly." If text gets bigger at score 0.45, it won't shrink until score drops to 0.35. This prevents constant back-and-forth changes.

---

## 🚀 Quick Start for New Team Members

1. **Read this file first** - Understand what each file does
2. **Read README.md** - Understand the big picture
3. **Open content.js** - See how everything connects
4. **Try Demo Mode** - See the system in action
5. **Make a small change** - Edit styles.css and test it
6. **Ask questions** - No question is too simple!

---

**Questions?** Ask the team lead or check the code comments in each file.

**Last Updated**: Proactive Hybrid Intelligence v2.0
