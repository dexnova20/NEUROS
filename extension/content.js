// ============================================
// NEUROADAPTIVE OS - Production Intelligence Layer v2.0
// ============================================
// Architecture: Modular, stable, production-ready
// Features: Friction detection, personalization, adaptive UI
// ============================================

// ============================================
// 1️⃣ SINGLE AUTHORITATIVE CONTROL SIGNAL
// ============================================

let finalAdaptiveScore = 0.2; // ONLY variable that controls UI state

// ============================================
// USER AUTHENTICATION & PROFILE
// ============================================

let currentUser = null; // { user_id, username, profile }
let authChecked = false;

// ============================================
// USER PREFERENCE PROFILING
// ============================================

let operatingMode = 'adaptive'; // 'adaptive' or 'personalized'
let userPreferences = {
  scale: 1.0,
  lineHeight: 1.5,
  letterSpacing: 0,
  contrast: 1.0,
  fontFamily: 'default'
};
// Hybrid Intelligence: Track which settings user has explicitly locked
let userLockedSettings = {
  scale: false,
  lineHeight: false,
  letterSpacing: false
};
let aiConfidence = 0.5; // AI suggestion aggressiveness (0-1)
let aiAcceptCount = 0;
let aiRejectCount = 0;
let manualAdjustmentCount = 0;
let lastManualAdjustmentTime = 0;

// ============================================
// DIAGNOSTIC SIGNALS (DO NOT CONTROL UI)
// ============================================

// Backend signal
let backendScore = 0.2;

// Friction components (diagnostic only)
let scrollHistory = [];
let rereadCount = 0;
let lastScrollY = 0;
let rageClickCount = 0;
let tabSwitchCount = 0;
let paragraphReadTimes = [];

// Baseline calibration (diagnostic only)
let calibrationMode = true;
let calibrationStartTime = Date.now();
const CALIBRATION_DURATION = 20000;
let baselineMetrics = {
  scrollRate: 0,
  rageClickRate: 0,
  rereadRate: 0,
  samples: 0
};

// Smoothing buffer
let scoreHistory = [];

// Graph data (diagnostic only)
let graphScores = [];

// ============================================
// 2️⃣ RATE LIMIT STATE CHANGES
// ============================================

let currentState = "normal";
let lastStateChangeTime = 0;
const MIN_STATE_DURATION = 3000;

// ============================================
// 3️⃣ DEMO MODE PRIORITY LOCK
// ============================================

let demoMode = false;
let demoInterval = null;

// ============================================
// CACHED DOM ELEMENTS
// ============================================

let panel = null;
let scoreText = null;
let stateText = null;
let statusDot = null;
let frictionText = null;
let backendText = null;
let controlStatus = null;
let graphCanvas = null;
let graphCtx = null;

// ============================================
// EVENT TRACKING
// ============================================

document.addEventListener('visibilitychange', () => {
  if (document.hidden) tabSwitchCount++;
});

window.addEventListener('scroll', () => {
  scrollHistory.push(Date.now());
  if (scrollHistory.length > 20) scrollHistory.shift();
  
  const currentScrollY = window.scrollY;
  if (currentScrollY < lastScrollY - 100) rereadCount++;
  lastScrollY = currentScrollY;
}, { passive: true });

let lastClickTime = 0;
document.addEventListener('click', () => {
  const now = Date.now();
  if (now - lastClickTime < 500) rageClickCount++;
  lastClickTime = now;
});

// ============================================
// BASELINE CALIBRATION - Improved Stability
// ============================================

function updateBaseline() {
  if (!calibrationMode) return;
  
  const elapsed = Date.now() - calibrationStartTime;
  if (elapsed >= CALIBRATION_DURATION) {
    calibrationMode = false;
    console.log('✅ Baseline calibrated:', baselineMetrics);
    return;
  }
  
  const windowSize = 10;
  const scrollRate = scrollHistory.length / windowSize;
  const rageRate = rageClickCount / windowSize;
  const rereadRate = rereadCount / windowSize;
  
  // Incremental averaging (prevents baseline drift)
  const n = baselineMetrics.samples;
  baselineMetrics.scrollRate = (baselineMetrics.scrollRate * n + scrollRate) / (n + 1);
  baselineMetrics.rageClickRate = (baselineMetrics.rageClickRate * n + rageRate) / (n + 1);
  baselineMetrics.rereadRate = (baselineMetrics.rereadRate * n + rereadRate) / (n + 1);
  baselineMetrics.samples++;
}

function recalibrateBaseline() {
  calibrationMode = true;
  calibrationStartTime = Date.now();
  baselineMetrics = { scrollRate: 0, rageClickRate: 0, rereadRate: 0, samples: 0 };
  console.log('🔄 Baseline recalibration started');
}

// ============================================
// WEIGHTED FRICTION SCORE - Production Stable
// ============================================

function computeFrictionScore() {
  const windowSize = 10;
  
  // Scroll variance (erratic scrolling indicator)
  let scrollVariance = 0;
  if (scrollHistory.length > 1) {
    const intervals = [];
    for (let i = 1; i < scrollHistory.length; i++) {
      intervals.push(scrollHistory[i] - scrollHistory[i-1]);
    }
    const mean = intervals.reduce((a,b) => a+b, 0) / intervals.length;
    scrollVariance = intervals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intervals.length;
    scrollVariance = Math.sqrt(scrollVariance) / 1000; // Normalize to seconds
  }
  
  const rageRate = rageClickCount / windowSize;
  const rereadRate = rereadCount / windowSize;
  const tabRate = tabSwitchCount / windowSize;
  
  // Baseline adjustment (prevents false positives)
  let adjScroll = scrollVariance;
  let adjRage = rageRate;
  let adjReread = rereadRate;
  
  if (!calibrationMode && baselineMetrics.samples > 0) {
    adjScroll = Math.max(0, scrollVariance - baselineMetrics.scrollRate * 0.5);
    adjRage = Math.max(0, rageRate - baselineMetrics.rageClickRate);
    adjReread = Math.max(0, rereadRate - baselineMetrics.rereadRate);
  }
  
  // Consistent normalization (mathematically stable)
  const normScroll = Math.min(1, adjScroll / 5);
  const normRage = Math.min(1, adjRage / 3);
  const normReread = Math.min(1, adjReread / 10);
  const normTab = Math.min(1, tabRate / 2);
  
  // Weighted composite (sum = 1.0 for stability)
  const frictionScore = 
    0.30 * normScroll +
    0.25 * normRage +
    0.20 * normReread +
    0.15 * normTab +
    0.10 * 0; // Reserved for future paragraph timing
  
  return {
    friction: Math.min(1, frictionScore),
    components: {
      scroll: normScroll,
      rage: normRage,
      reread: normReread,
      tab: normTab
    }
  };
}

// ============================================
// COMPUTE FINAL ADAPTIVE SCORE - Single Authority
// ============================================

function computeFinalScore() {
  // Demo mode has absolute priority (prevents interference)
  if (demoMode) {
    graphScores.push(finalAdaptiveScore);
    if (graphScores.length > 10) graphScores.shift();
    return { friction: finalAdaptiveScore, components: { scroll: 0, rage: 0, reread: 0, tab: 0 } };
  }
  
  // Compute friction components
  const frictionData = computeFrictionScore();
  const frictionScore = frictionData.friction;
  
  // Combine backend + friction (weighted blend)
  const combinedScore = (backendScore * 0.6) + (frictionScore * 0.4);
  
  // Temporal smoothing (moving average prevents oscillation)
  scoreHistory.push(combinedScore);
  if (scoreHistory.length > 5) scoreHistory.shift();
  
  const smoothedScore = scoreHistory.reduce((a, b) => a + b, 0) / scoreHistory.length;
  
  // Update single authoritative control signal
  finalAdaptiveScore = smoothedScore;
  
  // Update graph for diagnostic display
  graphScores.push(finalAdaptiveScore);
  if (graphScores.length > 10) graphScores.shift();
  
  return frictionData;
}

// ============================================
// HYSTERESIS STATE MACHINE (CONTROL)
// ============================================

function determineState(score) {
  const confidenceBoost = (aiConfidence - 0.5) * 0.1;
  
  if (currentState === "normal") {
    if (score > (0.45 + confidenceBoost)) return "mild";
  } else if (currentState === "mild") {
    if (score > (0.75 + confidenceBoost)) return "high"; // Dyslexia mode at 0.75
    if (score < 0.35) return "normal";
  } else if (currentState === "high") {
    if (score < 0.65) return "mild"; // Hysteresis: deactivate at 0.65
  }
  return currentState;
}

// ============================================
// INJECT CSS STYLES
// ============================================

function injectStyles() {
  if (document.getElementById('neuro-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'neuro-styles';
  style.textContent = `
    :root {
      --na-scale: 1;
      --na-line: 1.5;
      --na-spacing: 0em;
      --na-word-spacing: 0em;
    }
    
    /* Base readable text - NO stacking, absolute values */
    body:not(.na-dyslexia-mode) p,
    body:not(.na-dyslexia-mode) span,
    body:not(.na-dyslexia-mode) div,
    body:not(.na-dyslexia-mode) li,
    body:not(.na-dyslexia-mode) td,
    body:not(.na-dyslexia-mode) th,
    body:not(.na-dyslexia-mode) article,
    body:not(.na-dyslexia-mode) section,
    body:not(.na-dyslexia-mode) h1,
    body:not(.na-dyslexia-mode) h2,
    body:not(.na-dyslexia-mode) h3,
    body:not(.na-dyslexia-mode) h4,
    body:not(.na-dyslexia-mode) h5,
    body:not(.na-dyslexia-mode) h6,
    body:not(.na-dyslexia-mode) a,
    body:not(.na-dyslexia-mode) label {
      font-size: calc(1em * var(--na-scale)) !important;
      line-height: var(--na-line) !important;
      letter-spacing: var(--na-spacing) !important;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
    
    /* Dyslexia Assist Mode */
    body.na-dyslexia-mode {
      --na-scale: 1.08;
      --na-line: 2.0;
      --na-spacing: 0.05em;
      --na-word-spacing: 0.15em;
    }
    
    body.na-dyslexia-mode p,
    body.na-dyslexia-mode span,
    body.na-dyslexia-mode div,
    body.na-dyslexia-mode li,
    body.na-dyslexia-mode td,
    body.na-dyslexia-mode article {
      font-size: calc(1em * var(--na-scale)) !important;
      line-height: var(--na-line) !important;
      letter-spacing: var(--na-spacing) !important;
      word-spacing: var(--na-word-spacing) !important;
      transition: all 0.4s ease !important;
    }
    
    /* Blur distractions in dyslexia mode */
    body.na-dyslexia-mode aside,
    body.na-dyslexia-mode nav:not(main nav),
    body.na-dyslexia-mode [class*="sidebar"],
    body.na-dyslexia-mode [class*="ad-"] {
      opacity: 0.3 !important;
      filter: grayscale(70%) !important;
      transition: opacity 0.4s ease, filter 0.4s ease !important;
    }
    
    /* Highlight main content */
    body.na-dyslexia-mode main,
    body.na-dyslexia-mode article,
    body.na-dyslexia-mode [role="main"] {
      background: rgba(255, 252, 240, 0.3) !important;
      padding: 20px !important;
      border-radius: 8px !important;
    }
    
    /* Focus Isolation Mode */
    .na-focus-main {
      position: relative;
      z-index: 10;
      background: rgba(255, 252, 240, 0.05) !important;
      box-shadow: 0 0 0 2px rgba(107, 138, 255, 0.15) !important;
      border-radius: 8px !important;
      transition: all 0.4s ease !important;
    }
    
    .na-focus-blur {
      opacity: 0.4 !important;
      filter: blur(5px) grayscale(60%) !important;
      transition: opacity 0.4s ease, filter 0.4s ease !important;
    }
    
    /* Exclude panel */
    #neuro-host, #neuro-host *, #neuro-bg-overlay {
      font-size: initial !important;
      line-height: initial !important;
      letter-spacing: initial !important;
      word-spacing: initial !important;
      transition: none !important;
    }
  `;
  
  document.head.appendChild(style);
  console.log('✅ Adaptive CSS injected');
}

// ============================================
// FOCUS ISOLATION MODE
// ============================================

let focusIsolationActive = false;
let mainContentElement = null;
let feedbackNotification = null;
let suggestionPrompt = null;

function detectMainContent() {
  // Priority 1: Semantic HTML
  let main = document.querySelector('main, article, [role="main"]');
  if (main) return main;
  
  // Priority 2: Text density heuristic
  const candidates = document.querySelectorAll('div, section');
  let bestCandidate = null;
  let maxScore = 0;
  
  candidates.forEach(el => {
    const textLength = el.innerText?.length || 0;
    const paragraphs = el.querySelectorAll('p').length;
    const score = textLength + (paragraphs * 100);
    
    if (score > maxScore && textLength > 500) {
      maxScore = score;
      bestCandidate = el;
    }
  });
  
  return bestCandidate || document.body;
}

function activateFocusIsolation() {
  if (focusIsolationActive) return;
  focusIsolationActive = true;
  
  mainContentElement = detectMainContent();
  mainContentElement.classList.add('na-focus-main');
  
  // Target non-essential elements
  const nonEssential = document.querySelectorAll('aside, nav:not(main nav), [class*="sidebar"], [class*="side-"], [id*="sidebar"], [class*="ad-"], [class*="banner"], [id*="ad-"]');
  nonEssential.forEach(el => {
    if (!mainContentElement.contains(el)) {
      el.classList.add('na-focus-blur');
    }
  });
  
  console.log('✅ Focus Isolation activated');
}

function deactivateFocusIsolation() {
  if (!focusIsolationActive) return;
  focusIsolationActive = false;
  
  document.querySelectorAll('.na-focus-main').forEach(el => el.classList.remove('na-focus-main'));
  document.querySelectorAll('.na-focus-blur').forEach(el => el.classList.remove('na-focus-blur'));
  
  console.log('✅ Focus Isolation deactivated');
}

function showAdaptationFeedback(message) {
  if (feedbackNotification) feedbackNotification.remove();
  
  feedbackNotification = document.createElement('div');
  feedbackNotification.style.cssText = `
    position: fixed;
    top: 24px;
    left: 50%;
    transform: translateX(-50%) translateY(-20px);
    padding: 12px 20px;
    background: rgba(18, 18, 22, 0.95);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.9);
    font-family: Inter, system-ui, sans-serif;
    font-size: 13px;
    font-weight: 500;
    z-index: 2147483646;
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    pointer-events: none;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  `;
  feedbackNotification.textContent = message;
  document.body.appendChild(feedbackNotification);
  
  requestAnimationFrame(() => {
    feedbackNotification.style.opacity = '1';
    feedbackNotification.style.transform = 'translateX(-50%) translateY(0)';
  });
  
  setTimeout(() => {
    if (feedbackNotification) {
      feedbackNotification.style.opacity = '0';
      feedbackNotification.style.transform = 'translateX(-50%) translateY(-20px)';
      setTimeout(() => feedbackNotification?.remove(), 300);
    }
  }, 2000);
}

function showAISuggestion(state, params) {
  if (suggestionPrompt) suggestionPrompt.remove();
  
  suggestionPrompt = document.createElement('div');
  suggestionPrompt.style.cssText = `
    position: fixed;
    top: 24px;
    left: 50%;
    transform: translateX(-50%) translateY(-20px);
    padding: 16px 20px;
    background: rgba(18, 18, 22, 0.98);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(79, 109, 255, 0.3);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.9);
    font-family: Inter, system-ui, sans-serif;
    font-size: 13px;
    z-index: 2147483646;
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(79, 109, 255, 0.2);
    min-width: 320px;
  `;
  
  const message = state === 'high' ? 'Reading mode intensified for comfort.' : 'Reading mode adjusted for clarity.';
  
  suggestionPrompt.innerHTML = `
    <div style="margin-bottom: 12px; font-weight: 500;">${message}</div>
    <div style="font-size: 11px; color: rgba(255, 255, 255, 0.6); margin-bottom: 12px;">Keep this as your default?</div>
    <div style="display: flex; gap: 8px;">
      <button id="ai-keep" style="
        flex: 1;
        padding: 8px 16px;
        background: #4F6DFF;
        border: none;
        border-radius: 6px;
        color: white;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        font-family: inherit;
      ">Keep as Default</button>
      <button id="ai-revert" style="
        flex: 1;
        padding: 8px 16px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        color: rgba(255, 255, 255, 0.8);
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        font-family: inherit;
      ">Revert</button>
    </div>
  `;
  
  document.body.appendChild(suggestionPrompt);
  
  requestAnimationFrame(() => {
    suggestionPrompt.style.opacity = '1';
    suggestionPrompt.style.transform = 'translateX(-50%) translateY(0)';
  });
  
  document.getElementById('ai-keep').onclick = () => {
    aiAcceptCount++;
    aiConfidence = Math.min(1, aiConfidence + 0.05); // Gradual confidence increase
    userPreferences.scale = params.scale;
    userPreferences.lineHeight = params.lineHeight;
    userPreferences.letterSpacing = parseFloat(params.spacing);
    saveUserPreferences();
    dismissSuggestion();
    showAdaptationFeedback('✓ Preference saved - AI confidence increased');
    console.log(`🧠 AI confidence: ${(aiConfidence * 100).toFixed(0)}%`);
  };
  
  document.getElementById('ai-revert').onclick = () => {
    aiRejectCount++;
    aiConfidence = Math.max(0.1, aiConfidence - 0.05); // Gradual confidence decrease
    saveUserPreferences();
    applyPersonalizedAdaptation();
    dismissSuggestion();
    showAdaptationFeedback('Reverted - AI will be less aggressive');
    console.log(`🧠 AI confidence: ${(aiConfidence * 100).toFixed(0)}%`);
  };
  
  setTimeout(() => dismissSuggestion(), 10000);
}

function dismissSuggestion() {
  if (suggestionPrompt) {
    suggestionPrompt.style.opacity = '0';
    suggestionPrompt.style.transform = 'translateX(-50%) translateY(-20px)';
    setTimeout(() => suggestionPrompt?.remove(), 300);
  }
}



// ============================================
// APPLY ADAPTATION (CONTROL)
// ============================================

function applyAdaptation(state) {
  const root = document.documentElement;
  const body = document.body;
  
  // State-based fixed values (NO stacking)
  let scale, lineHeight, spacing, message;
  
  if (state === "high") {
    // Activate Dyslexia Assist Mode
    body.classList.add('na-dyslexia-mode');
    scale = 1.08; // Clamped
    lineHeight = 2.0; // Clamped
    spacing = '0.05em'; // Clamped
    message = '🟠 Dyslexia Assist Mode activated';
  } else if (state === "mild") {
    body.classList.remove('na-dyslexia-mode');
    scale = 1.05; // Clamped
    lineHeight = 1.7;
    spacing = '0.02em';
    message = '🟡 Reading mode adjusted';
  } else {
    body.classList.remove('na-dyslexia-mode');
    scale = 1.0;
    lineHeight = 1.5;
    spacing = '0em';
  }
  
  // Respect user-locked settings
  if (userLockedSettings.scale) scale = userPreferences.scale;
  if (userLockedSettings.lineHeight) lineHeight = userPreferences.lineHeight;
  if (userLockedSettings.letterSpacing) spacing = userPreferences.letterSpacing + 'em';
  
  // Set CSS variables (absolute, not incremental)
  root.style.setProperty('--na-scale', scale);
  root.style.setProperty('--na-line', lineHeight);
  root.style.setProperty('--na-spacing', spacing);
  
  if ((state === 'high' || (state === 'mild' && aiConfidence > 0.7)) && !userLockedSettings.scale && operatingMode === 'adaptive') {
    showAISuggestion(state, { scale, lineHeight, spacing });
  } else if (message) {
    showAdaptationFeedback(message);
  }
  
  checkForLearningOpportunity(scale, lineHeight);
}

function applyPersonalizedAdaptation() {
  const root = document.documentElement;
  const body = document.body;
  
  // Remove dyslexia mode in personalized mode
  body.classList.remove('na-dyslexia-mode');
  
  // No clamping - use user preferences directly
  const scale = userPreferences.scale;
  const lineHeight = userPreferences.lineHeight;
  const spacing = userPreferences.letterSpacing;
  
  root.style.setProperty('--na-scale', scale);
  root.style.setProperty('--na-line', lineHeight);
  root.style.setProperty('--na-spacing', spacing + 'em');
  
  console.log('🎨 Personalized adaptation applied:', userPreferences);
}

function checkForLearningOpportunity(appliedScale, appliedLineHeight) {
  // Simple learning: If user increases scale 3+ times in session, update baseline
  const now = Date.now();
  if (now - lastManualAdjustmentTime < 300000) { // Within 5 minutes
    manualAdjustmentCount++;
    if (manualAdjustmentCount >= 3) {
      // Incrementally increase user's preferred scale
      userPreferences.scale = Math.min(1.5, userPreferences.scale + 0.05);
      userPreferences.lineHeight = Math.min(2.2, userPreferences.lineHeight + 0.1);
      saveUserPreferences();
      console.log('🧠 Learning: Updated baseline preferences', userPreferences);
      manualAdjustmentCount = 0;
    }
  }
  lastManualAdjustmentTime = now;
}

// ============================================
// UPDATE UI (SINGLE CONTROL PATH)
// ============================================

function updateUI() {
  // Personalized mode: Skip adaptive logic
  if (operatingMode === 'personalized') {
    applyPersonalizedAdaptation();
    updatePanel({ friction: 0, components: { scroll: 0, rage: 0, reread: 0, tab: 0 } });
    return;
  }
  
  // Adaptive mode: Use friction engine
  const frictionData = computeFinalScore();
  
  // Determine new state based on ONLY finalAdaptiveScore
  const newState = determineState(finalAdaptiveScore);
  
  // 2️⃣ Rate limit state changes
  const now = Date.now();
  const timeSinceChange = now - lastStateChangeTime;
  
  if (newState !== currentState && timeSinceChange >= MIN_STATE_DURATION) {
    currentState = newState;
    lastStateChangeTime = now;
    applyAdaptation(newState);
    console.log(`🔄 State: ${newState} | Final Score: ${finalAdaptiveScore.toFixed(2)}`);
  }
  
  // Update panel (diagnostic display)
  updatePanel(frictionData);
  updateGraph();
}

// ============================================
// GRAPH (DIAGNOSTIC DISPLAY)
// ============================================

function createGraph() {
  const canvas = document.createElement('canvas');
  canvas.width = 180;
  canvas.height = 50;
  canvas.style.cssText = 'width: 100%; height: 50px; margin: 8px 0;';
  graphCanvas = canvas;
  graphCtx = canvas.getContext('2d');
  return canvas;
}

function updateGraph() {
  if (!graphCtx || graphScores.length < 1) return;
  
  const width = graphCanvas.width;
  const height = graphCanvas.height;
  
  graphCtx.clearRect(0, 0, width, height);
  
  // Background
  graphCtx.fillStyle = darkTheme ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)';
  graphCtx.fillRect(0, 0, width, height);
  
  // Draw grid lines
  graphCtx.strokeStyle = darkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
  graphCtx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = (height / 4) * i;
    graphCtx.beginPath();
    graphCtx.moveTo(0, y);
    graphCtx.lineTo(width, y);
    graphCtx.stroke();
  }
  
  if (graphScores.length < 2) return;
  
  const step = width / (graphScores.length - 1);
  
  // Draw line
  graphCtx.strokeStyle = '#4F6DFF';
  graphCtx.lineWidth = 2;
  graphCtx.beginPath();
  
  graphScores.forEach((score, i) => {
    const x = i * step;
    const y = height - (score * height);
    if (i === 0) graphCtx.moveTo(x, y);
    else graphCtx.lineTo(x, y);
  });
  
  graphCtx.stroke();
  
  // Fill area under line
  graphCtx.fillStyle = 'rgba(79, 109, 255, 0.15)';
  graphCtx.lineTo(width, height);
  graphCtx.lineTo(0, height);
  graphCtx.closePath();
  graphCtx.fill();
}

// ============================================
// PANEL (SHADOW DOM ISOLATION)
// ============================================

let shadowRoot = null;
let panelVisible = false;
let darkTheme = true;

function createPanel() {
  const host = document.createElement('div');
  host.id = 'neuro-host';
  shadowRoot = host.attachShadow({ mode: 'open' });
  
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    
    @keyframes pulse-ring {
      0% { transform: scale(0.8); opacity: 1; }
      100% { transform: scale(1.4); opacity: 0; }
    }
    
    @keyframes neural-pulse {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.8; }
    }
    
    #toggle-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(79, 70, 229, 0.4);
      z-index: 2147483647;
      transition: all 0.3s ease;
    }
    #toggle-btn::before {
      display: none;
    }
    #toggle-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(79, 70, 229, 0.6);
    }
    
    #panel {
      position: fixed;
      bottom: 100px;
      right: 24px;
      width: 380px;
      min-width: 320px;
      max-height: 85vh;
      min-height: 400px;
      background: #000000;
      backdrop-filter: blur(60px) saturate(200%);
      -webkit-backdrop-filter: blur(60px) saturate(200%);
      border: 2px solid rgba(107, 138, 255, 0.3);
      border-radius: 24px;
      z-index: 2147483647;
      font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
      color: rgba(255, 255, 255, 0.95);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 100px rgba(107, 138, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);
      overflow: hidden;
      transition: box-shadow 0.3s ease;
      display: flex;
      flex-direction: column;
      resize: both;
    }
    #panel::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      opacity: 0;
      pointer-events: none;
      z-index: 0;
    }
    #panel::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 0;
      opacity: 0;
    }
    #panel.light {
      background: #FFFFFF;
      color: rgba(0, 0, 0, 0.9);
      border-color: rgba(0, 0, 0, 0.1);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5);
    }
    #panel.light .metric-label,
    #panel.light .subtitle,
    #panel.light .components-text,
    #panel.light .control-status {
      color: rgba(0, 0, 0, 0.6);
    }
    #panel.light .metric-value {
      color: rgba(0, 0, 0, 0.95);
    }
    #panel.light .title-text {
      background: linear-gradient(135deg, #4F6DFF 0%, #4CAF8D 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    #panel.light .tagline {
      color: rgba(0, 0, 0, 0.4);
    }
    #panel.light .privacy-badge {
      color: rgba(76, 175, 141, 1);
    }
    #panel.light .state-badge {
      background: linear-gradient(135deg, rgba(79, 109, 255, 0.15), rgba(79, 109, 255, 0.08));
      color: #4F6DFF;
      border-color: rgba(79, 109, 255, 0.4);
    }
    #panel.light .control-source {
      background: rgba(79, 109, 255, 0.08);
      border-color: rgba(79, 109, 255, 0.2);
      color: rgba(0, 0, 0, 0.9);
    }
    #panel.light .control-source #source-indicator {
      color: #4F6DFF;
    }
    #panel.light .control-source #override-indicator {
      color: rgba(76, 175, 141, 1);
    }
    #panel.light .ai-confidence {
      background: rgba(0, 0, 0, 0.04);
      border-color: rgba(0, 0, 0, 0.08);
      color: rgba(0, 0, 0, 0.9);
    }
    #panel.light .ai-confidence #confidence-value {
      color: rgba(0, 0, 0, 0.8);
    }
    #panel.light .calibration-badge {
      background: rgba(76, 175, 141, 0.15);
      color: rgba(76, 175, 141, 1);
    }
    #panel.light * {
      color: rgba(0, 0, 0, 0.9) !important;
    }
    #panel.light .title-text {
      background: linear-gradient(135deg, #4F6DFF 0%, #4CAF8D 100%) !important;
      -webkit-background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      background-clip: text !important;
    }
    #panel.light .metric-value.accent {
      color: #4F6DFF !important;
    }
    #panel.light .state-badge {
      color: #4F6DFF !important;
    }
    #panel.light .btn-primary {
      color: white !important;
    }
    #panel.light .btn-success {
      color: white !important;
    }
    #panel.light .icon-btn {
      color: rgba(0, 0, 0, 0.5);
    }
    #panel.light .icon-btn:hover {
      background: rgba(0, 0, 0, 0.06);
      color: rgba(0, 0, 0, 0.8);
    }
    #panel.light .divider {
      background: rgba(0, 0, 0, 0.08);
    }
    #panel.light .panel-header,
    #panel.light .panel-footer {
      border-color: rgba(0, 0, 0, 0.08);
    }
    #panel.light .graph-container {
      background: rgba(0, 0, 0, 0.03);
      border-color: rgba(0, 0, 0, 0.06);
    }
    #panel.hidden {
      opacity: 0;
      transform: scale(0.92) translateY(12px);
      pointer-events: none;
    }
    
    @keyframes panelOpen {
      from {
        opacity: 0;
        transform: scale(0.92) translateY(12px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    
    #panel.opening {
      animation: panelOpen 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    .panel-header {
      padding: 24px 28px;
      border-bottom: 1px solid rgba(107, 138, 255, 0.2);
      position: relative;
      background: linear-gradient(180deg, rgba(107, 138, 255, 0.08), transparent);
      flex-shrink: 0;
      cursor: move;
      user-select: none;
      z-index: 10;
    }
    .panel-header::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(107, 138, 255, 0.5), transparent);
    }
    
    .panel-title {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 4px;
    }
    
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #7DD3C0;
      box-shadow: 0 0 12px rgba(125, 211, 192, 0.6);
      transition: all 0.4s ease;
      animation: pulse 2s ease-in-out infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(1.1); }
    }
    
    .title-text {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: -0.03em;
      background: linear-gradient(135deg, #6B8AFF 0%, #7DD3C0 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: none;
      position: relative;
      z-index: 10;
    }
    
    .subtitle {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.4);
      margin-left: 16px;
      letter-spacing: 0.02em;
    }
    
    .tagline {
      font-size: 10px;
      color: rgba(255, 255, 255, 0.3);
      margin-left: 16px;
      margin-top: 2px;
      font-style: italic;
      letter-spacing: 0.03em;
    }
    
    .privacy-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-left: 16px;
      margin-top: 4px;
      font-size: 9px;
      color: rgba(76, 175, 141, 0.8);
      font-weight: 500;
      letter-spacing: 0.02em;
    }
    .privacy-badge svg {
      width: 10px;
      height: 10px;
      opacity: 0.8;
    }
    
    .panel-controls {
      position: absolute;
      top: 16px;
      right: 16px;
      display: flex;
      gap: 8px;
    }
    
    .icon-btn {
      background: linear-gradient(135deg, rgba(107, 138, 255, 0.1), rgba(125, 211, 192, 0.1));
      border: 1px solid rgba(107, 138, 255, 0.3);
      color: rgba(255, 255, 255, 0.7);
      cursor: pointer;
      font-size: 18px;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
    .icon-btn:hover {
      background: linear-gradient(135deg, rgba(107, 138, 255, 0.3), rgba(125, 211, 192, 0.3));
      color: rgba(255, 255, 255, 1);
      transform: translateY(-2px) rotate(5deg);
      box-shadow: 0 6px 16px rgba(107, 138, 255, 0.4);
    }
    
    .panel-body {
      padding: 20px;
      overflow-y: auto;
      overflow-x: hidden;
      position: relative;
      z-index: 1;
      flex: 1;
      min-height: 0;
    }
    .panel-body::-webkit-scrollbar {
      width: 6px;
    }
    .panel-body::-webkit-scrollbar-track {
      background: rgba(107, 138, 255, 0.05);
      border-radius: 3px;
    }
    .panel-body::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, #6B8AFF, #7DD3C0);
      border-radius: 3px;
    }
    .panel-body::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, #8BA3FF, #9DE5D4);
    }
    
    .metric-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
    }
    
    .metric-label {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
      font-weight: 500;
    }
    
    .metric-value {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 500;
      font-variant-numeric: tabular-nums;
    }
    
    .metric-value.accent {
      color: #4F6DFF;
    }
    
    .state-badge {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      background: linear-gradient(135deg, rgba(107, 138, 255, 0.2), rgba(107, 138, 255, 0.1));
      color: #6B8AFF;
      border: 1px solid rgba(107, 138, 255, 0.4);
      transition: all 0.4s ease;
      box-shadow: 0 4px 12px rgba(107, 138, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1);
      animation: neural-pulse 2s ease-in-out infinite;
    }
    
    .divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.06);
      margin: 16px 0;
    }
    
    .graph-container {
      margin: 16px 0;
      padding: 16px;
      background: linear-gradient(135deg, rgba(107, 138, 255, 0.05), rgba(125, 211, 192, 0.05));
      border-radius: 12px;
      border: 1px solid rgba(107, 138, 255, 0.2);
      box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.2);
    }
    
    .components-text {
      font-size: 10px;
      color: rgba(255, 255, 255, 0.35);
      font-variant-numeric: tabular-nums;
      letter-spacing: 0.02em;
    }
    
    .control-status {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.4);
      margin-bottom: 16px;
    }
    
    .control-source {
      padding: 8px 12px;
      background: rgba(79, 109, 255, 0.08);
      border-radius: 6px;
      border: 1px solid rgba(79, 109, 255, 0.15);
      margin-bottom: 12px;
    }
    
    .ai-confidence {
      padding: 8px 12px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.06);
      margin-bottom: 12px;
    }
    
    .panel-footer {
      padding: 16px 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex-shrink: 0;
    }
    
    .btn {
      width: 100%;
      padding: 10px 16px;
      border: none;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #6B8AFF 0%, #8BA3FF 100%);
      color: white;
      border: 1px solid rgba(107, 138, 255, 0.4);
      box-shadow: 0 4px 20px rgba(107, 138, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2);
      position: relative;
      overflow: hidden;
    }
    .btn-primary::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }
    .btn-primary:hover::before {
      left: 100%;
    }
    .btn-primary:hover {
      background: linear-gradient(135deg, #8BA3FF 0%, #6B8AFF 100%);
      box-shadow: 0 8px 28px rgba(107, 138, 255, 0.5), 0 0 40px rgba(107, 138, 255, 0.3);
      transform: translateY(-3px);
    }
    
    .btn-success {
      background: linear-gradient(135deg, #7DD3C0 0%, #9DE5D4 100%);
      color: white;
      border: 1px solid rgba(125, 211, 192, 0.4);
      box-shadow: 0 4px 20px rgba(125, 211, 192, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2);
      position: relative;
      overflow: hidden;
    }
    .btn-success::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }
    .btn-success:hover::before {
      left: 100%;
    }
    .btn-success:hover {
      background: linear-gradient(135deg, #9DE5D4 0%, #7DD3C0 100%);
      box-shadow: 0 8px 28px rgba(125, 211, 192, 0.5), 0 0 40px rgba(125, 211, 192, 0.3);
      transform: translateY(-3px);
    }
    
    .btn-secondary {
      background: rgba(255, 255, 255, 0.04);
      color: rgba(255, 255, 255, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.9);
    }
    #panel.light .btn-secondary {
      background: rgba(0, 0, 0, 0.04);
      color: rgba(0, 0, 0, 0.7);
      border: 1px solid rgba(0, 0, 0, 0.08);
    }
    #panel.light .btn-secondary:hover {
      background: rgba(0, 0, 0, 0.08);
      color: rgba(0, 0, 0, 0.9);
    }
    
    .mode-toggle {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }
    
    .mode-btn {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.03);
      color: rgba(255, 255, 255, 0.6);
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }
    .mode-btn:hover {
      background: rgba(255, 255, 255, 0.06);
      color: rgba(255, 255, 255, 0.8);
      transform: translateY(-1px);
    }
    .mode-btn.active {
      background: #4F6DFF;
      color: white;
      border-color: #4F6DFF;
      box-shadow: 0 4px 12px rgba(79, 109, 255, 0.3);
    }
    #panel.light .mode-btn {
      border-color: rgba(0, 0, 0, 0.1);
      background: rgba(0, 0, 0, 0.03);
      color: rgba(0, 0, 0, 0.6);
    }
    #panel.light .mode-btn:hover {
      background: rgba(0, 0, 0, 0.06);
      color: rgba(0, 0, 0, 0.8);
    }
    #panel.light .mode-btn.active {
      background: #4F6DFF;
      color: white;
      border-color: #4F6DFF;
    }
    
    .slider-group {
      margin-bottom: 16px;
    }
    
    .settings-group {
      margin-bottom: 16px;
    }
    
    .settings-header {
      font-size: 11px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.7);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 12px;
    }
    #panel.light .settings-header {
      color: rgba(0, 0, 0, 0.7);
    }
    
    .slider-label {
      display: block;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 8px;
      font-weight: 500;
    }
    #panel.light .slider-label {
      color: rgba(0, 0, 0, 0.6);
    }
    
    .slider {
      width: 100%;
      height: 4px;
      border-radius: 2px;
      background: rgba(255, 255, 255, 0.1);
      outline: none;
      -webkit-appearance: none;
    }
    .slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #4F6DFF;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .slider::-webkit-slider-thumb:hover {
      transform: scale(1.2);
      box-shadow: 0 0 0 4px rgba(79, 109, 255, 0.2);
    }
    #panel.light .slider {
      background: rgba(0, 0, 0, 0.1);
    }
    
    .preset-label {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 8px;
      font-weight: 500;
    }
    #panel.light .preset-label {
      color: rgba(0, 0, 0, 0.5);
    }
    
    .preset-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 16px;
    }
    
    .preset-btn {
      padding: 8px 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.03);
      color: rgba(255, 255, 255, 0.7);
      border-radius: 6px;
      font-size: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }
    .preset-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.9);
      border-color: rgba(255, 255, 255, 0.2);
    }
    #panel.light .preset-btn {
      border-color: rgba(0, 0, 0, 0.1);
      background: rgba(0, 0, 0, 0.03);
      color: rgba(0, 0, 0, 0.7);
    }
    #panel.light .preset-btn:hover {
      background: rgba(0, 0, 0, 0.08);
      color: rgba(0, 0, 0, 0.9);
      border-color: rgba(0, 0, 0, 0.2);
    }
    
    .calibration-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: rgba(79, 109, 255, 0.1);
      border-radius: 6px;
      font-size: 11px;
      color: rgba(79, 109, 255, 0.9);
      margin-bottom: 16px;
    }
    
    .scalability-note {
      font-size: 9px;
      color: rgba(255, 255, 255, 0.3);
      text-align: center;
      margin-top: 12px;
      letter-spacing: 0.02em;
    }
    #panel.light .scalability-note {
      color: rgba(0, 0, 0, 0.3);
    }
  `;
  
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'toggle-btn';
  toggleBtn.innerHTML = `
    <svg width="28" height="28" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="56" fill="none" stroke="#ffffff" stroke-width="3"/>
      <circle cx="64" cy="32" r="3" fill="#ffffff" opacity="0.8"/>
      <circle cx="88" cy="48" r="3" fill="#ffffff" opacity="0.8"/>
      <circle cx="88" cy="80" r="3" fill="#ffffff" opacity="0.8"/>
      <circle cx="64" cy="96" r="3" fill="#ffffff" opacity="0.8"/>
      <circle cx="40" cy="80" r="3" fill="#ffffff" opacity="0.8"/>
      <circle cx="40" cy="48" r="3" fill="#ffffff" opacity="0.8"/>
      <path d="M 20 64 Q 35 50, 50 64 T 80 64 T 108 64" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
      <circle cx="64" cy="64" r="6" fill="#ffffff"/>
    </svg>
  `;
  toggleBtn.onclick = () => togglePanel();
  
  const panel = document.createElement('div');
  panel.id = 'panel';
  panel.className = 'hidden';
  panel.innerHTML = `
    <div class="panel-header">
      <div class="panel-title">
        <div class="status-dot" id="neuro-dot"></div>
        <span class="title-text">NeuroAdaptive</span>
      </div>
      <div class="subtitle">Personalized Reading Layer</div>
      <div class="tagline">Your web, adapted.</div>
      <div class="privacy-badge">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <span>Data processed locally</span>
      </div>
      <div class="panel-controls">
        <button class="icon-btn" id="theme-btn">☀</button>
        <button class="icon-btn" id="close-btn">×</button>
      </div>
    </div>
    
    <div class="panel-body">
      <div class="mode-toggle">
        <button class="mode-btn active" id="mode-adaptive">Adaptive</button>
        <button class="mode-btn" id="mode-personalized">Personalized</button>
      </div>
      
      <div class="divider"></div>
      
      <div id="adaptive-section">
        <div class="calibration-badge" id="calibration-status">
          <span>⏱</span>
          <span>Calibrating baseline...</span>
        </div>
        
        <div class="metric-row">
          <span class="metric-label">Final Score</span>
          <span class="metric-value accent" id="neuro-score">0.00</span>
        </div>
        
        <div class="metric-row">
          <span class="metric-label">State</span>
          <span class="state-badge" id="neuro-state">NORMAL</span>
        </div>
        
        <div class="divider"></div>
        
        <div class="metric-row">
          <span class="metric-label">Backend</span>
          <span class="metric-value" id="neuro-backend">0.00</span>
        </div>
        
        <div class="metric-row">
          <span class="metric-label">Friction</span>
          <span class="metric-value" id="neuro-friction">0.00</span>
        </div>
        
        <div class="graph-container" id="graph-container"></div>
        
        <div class="components-text" id="friction-breakdown">Components: --</div>
        
        <div class="divider"></div>
        
        <div class="control-status" id="control-status">Control: Stable</div>
        
        <div class="control-source" id="control-source">
          <div style="font-size: 10px; color: rgba(255, 255, 255, 0.4); margin-bottom: 4px;">Control Source</div>
          <div id="source-indicator" style="font-size: 11px; color: rgba(79, 109, 255, 0.9); font-weight: 500;">AI Adaptive</div>
          <div id="override-indicator" style="font-size: 9px; color: rgba(76, 175, 141, 0.8); margin-top: 4px; display: none;">✓ User Override Active</div>
        </div>
        
        <div class="ai-confidence" id="ai-confidence">
          <div style="font-size: 10px; color: rgba(255, 255, 255, 0.4); margin-bottom: 4px;">AI Confidence</div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="flex: 1; height: 4px; background: rgba(255, 255, 255, 0.1); border-radius: 2px; overflow: hidden;">
              <div id="confidence-bar" style="height: 100%; background: #4F6DFF; width: 50%; transition: width 0.3s ease;"></div>
            </div>
            <span id="confidence-value" style="font-size: 11px; color: rgba(255, 255, 255, 0.7); font-weight: 500;">50%</span>
          </div>
        </div>
        
        <button class="btn btn-secondary" id="recalibrate-btn" style="font-size: 11px; padding: 8px 12px; margin-top: 8px;">Recalibrate Baseline</button>
      </div>
      
      <div id="personalized-section" style="display: none;">
        <div class="settings-group">
          <div class="settings-header">Quick Controls</div>
          
          <div class="slider-group">
            <label class="slider-label">Scale: <span id="scale-value">1.00</span>x</label>
            <input type="range" id="scale-slider" min="0.8" max="2.0" step="0.05" value="1.0" class="slider">
          </div>
          
          <div class="slider-group">
            <label class="slider-label">Line Height: <span id="line-value">1.5</span></label>
            <input type="range" id="line-slider" min="1.2" max="3.0" step="0.1" value="1.5" class="slider">
          </div>
          
          <div class="slider-group">
            <label class="slider-label">Letter Spacing: <span id="spacing-value">0.00</span>em</label>
            <input type="range" id="spacing-slider" min="0" max="0.3" step="0.01" value="0" class="slider">
          </div>
        </div>
        
        <div class="divider"></div>
        
        <div class="settings-group">
          <div class="settings-header">Accessibility Presets</div>
          <div class="preset-buttons">
            <button class="preset-btn" id="preset-low-vision">Low Vision</button>
            <button class="preset-btn" id="preset-dyslexia">Dyslexia</button>
            <button class="preset-btn" id="preset-contrast">High Contrast</button>
          </div>
        </div>
        
        <div class="divider"></div>
        
        <div class="settings-group">
          <button class="btn btn-success" id="save-prefs">Save Preferences</button>
          <button class="btn btn-secondary" id="reset-prefs" style="margin-top: 8px;">Reset to Default</button>
          <div class="scalability-note">Designed for multi-browser support.</div>
        </div>
      </div>
    </div>
    
    <div class="panel-footer">
      <button class="btn btn-primary" id="toggleFocus">Focus Mode: OFF</button>
      <button class="btn btn-primary" id="simulateHigh">Simulate High Load</button>
      <button class="btn btn-success" id="resetSim">Reset to Normal</button>
      <button class="btn btn-secondary" id="toggleDemo">Demo Mode: OFF</button>
    </div>
  `;
  
  shadowRoot.appendChild(style);
  shadowRoot.appendChild(toggleBtn);
  shadowRoot.appendChild(panel);
  document.body.appendChild(host);
  
  // Add icon3.jfif as background (optional - remove if causing issues)
  try {
    const bgImageUrl = chrome.runtime.getURL('icon3.jfif');
    const bgStyle = document.createElement('style');
    bgStyle.textContent = `#panel::before { background-image: url('${bgImageUrl}'); }`;
    shadowRoot.appendChild(bgStyle);
  } catch (e) {
    console.log('Background image not loaded:', e);
  }
  
  // Make panel draggable
  const panelHeader = shadowRoot.querySelector('.panel-header');
  let isDragging = false;
  let currentX, currentY, initialX, initialY;
  
  panelHeader.addEventListener('mousedown', (e) => {
    if (e.target.closest('.icon-btn')) return;
    isDragging = true;
    initialX = e.clientX - panel.offsetLeft;
    initialY = e.clientY - panel.offsetTop;
    panel.style.transition = 'none';
  });
  
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    currentX = e.clientX - initialX;
    currentY = e.clientY - initialY;
    panel.style.left = currentX + 'px';
    panel.style.top = currentY + 'px';
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
  });
  
  document.addEventListener('mouseup', () => {
    isDragging = false;
    panel.style.transition = 'box-shadow 0.3s ease';
  });
  
  const graphContainer = shadowRoot.getElementById('graph-container');
  graphContainer.appendChild(createGraph());
  
  scoreText = shadowRoot.getElementById('neuro-score');
  stateText = shadowRoot.getElementById('neuro-state');
  statusDot = shadowRoot.getElementById('neuro-dot');
  frictionText = shadowRoot.getElementById('neuro-friction');
  backendText = shadowRoot.getElementById('neuro-backend');
  controlStatus = shadowRoot.getElementById('control-status');
  
  shadowRoot.getElementById('close-btn').onclick = () => togglePanel();
  
  shadowRoot.getElementById('theme-btn').onclick = () => {
    darkTheme = !darkTheme;
    const panel = shadowRoot.getElementById('panel');
    const themeBtn = shadowRoot.getElementById('theme-btn');
    if (darkTheme) {
      panel.classList.remove('light');
      themeBtn.textContent = '☀';
    } else {
      panel.classList.add('light');
      themeBtn.textContent = '🌙';
    }
  };
  
  shadowRoot.getElementById('simulateHigh').onclick = () => {
    // Stop demo mode if running
    if (demoMode) {
      demoMode = false;
      if (demoInterval) {
        clearInterval(demoInterval);
        demoInterval = null;
      }
      const btn = shadowRoot.getElementById('toggleDemo');
      btn.textContent = 'Demo Mode: OFF';
    }
    
    lastStateChangeTime = 0;
    scoreHistory = [0.85, 0.85, 0.85, 0.85, 0.85];
    finalAdaptiveScore = 0.85;
    currentState = "high";
    applyAdaptation("high");
    updatePanel({ friction: 0.85, components: { scroll: 0, rage: 0, reread: 0, tab: 0 } });
    console.log('🔴 Simulated HIGH load');
  };
  
  shadowRoot.getElementById('resetSim').onclick = () => {
    // Stop demo mode if running
    if (demoMode) {
      demoMode = false;
      if (demoInterval) {
        clearInterval(demoInterval);
        demoInterval = null;
      }
      const btn = shadowRoot.getElementById('toggleDemo');
      btn.textContent = 'Demo Mode: OFF';
    }
    
    // Reset all scores and state
    lastStateChangeTime = 0;
    scoreHistory = [0.2, 0.2, 0.2, 0.2, 0.2];
    finalAdaptiveScore = 0.2;
    backendScore = 0.2;
    graphScores = [];
    
    // Reset friction counters
    scrollHistory = [];
    rereadCount = 0;
    rageClickCount = 0;
    tabSwitchCount = 0;
    paragraphReadTimes = [];
    
    // Force state to normal
    currentState = "normal";
    applyAdaptation("normal");
    
    // Update UI
    updatePanel({ friction: 0.2, components: { scroll: 0, rage: 0, reread: 0, tab: 0 } });
    updateGraph();
    
    console.log('🔄 Complete Reset: All systems normal');
  };
  
  shadowRoot.getElementById('toggleDemo').onclick = () => {
    demoMode = !demoMode;
    const btn = shadowRoot.getElementById('toggleDemo');
    btn.textContent = `Demo Mode: ${demoMode ? 'ON' : 'OFF'}`;
    if (demoMode) startDemoMode();
    else stopDemoMode();
  };
  
  shadowRoot.getElementById('toggleFocus').onclick = () => {
    focusIsolationActive = !focusIsolationActive;
    const btn = shadowRoot.getElementById('toggleFocus');
    
    if (focusIsolationActive) {
      activateFocusIsolation();
      btn.textContent = 'Focus Mode: ON';
    } else {
      deactivateFocusIsolation();
      btn.textContent = 'Focus Mode: OFF';
    }
  };
  
  // Mode toggle
  shadowRoot.getElementById('mode-adaptive').onclick = () => {
    operatingMode = 'adaptive';
    saveUserPreferences();
    updateModeUI();
    console.log('🔄 Switched to Adaptive Mode');
  };
  
  shadowRoot.getElementById('mode-personalized').onclick = () => {
    operatingMode = 'personalized';
    saveUserPreferences();
    applyPersonalizedAdaptation();
    updateModeUI();
    console.log('🎨 Switched to Personalized Mode');
  };
  
  // Sliders
  const scaleSlider = shadowRoot.getElementById('scale-slider');
  const lineSlider = shadowRoot.getElementById('line-slider');
  const spacingSlider = shadowRoot.getElementById('spacing-slider');
  
  scaleSlider.oninput = () => {
    userPreferences.scale = parseFloat(scaleSlider.value);
    shadowRoot.getElementById('scale-value').textContent = userPreferences.scale.toFixed(2);
    userLockedSettings.scale = true;
    applyPersonalizedAdaptation();
    manualAdjustmentCount++;
    lastManualAdjustmentTime = Date.now();
  };
  
  lineSlider.oninput = () => {
    userPreferences.lineHeight = parseFloat(lineSlider.value);
    shadowRoot.getElementById('line-value').textContent = userPreferences.lineHeight.toFixed(1);
    userLockedSettings.lineHeight = true;
    applyPersonalizedAdaptation();
  };
  
  spacingSlider.oninput = () => {
    userPreferences.letterSpacing = parseFloat(spacingSlider.value);
    shadowRoot.getElementById('spacing-value').textContent = userPreferences.letterSpacing.toFixed(2);
    userLockedSettings.letterSpacing = true;
    applyPersonalizedAdaptation();
  };
  
  // Presets
  shadowRoot.getElementById('preset-low-vision').onclick = () => applyPreset('low-vision');
  shadowRoot.getElementById('preset-dyslexia').onclick = () => applyPreset('dyslexia');
  shadowRoot.getElementById('preset-contrast').onclick = () => applyPreset('high-contrast');
  
  // Save/Reset
  shadowRoot.getElementById('save-prefs').onclick = () => {
    saveUserPreferences();
    alert('✅ Preferences saved! They will apply to all websites.');
  };
  
  shadowRoot.getElementById('reset-prefs').onclick = () => {
    applyPreset('default');
    updateSlidersFromPreferences();
    alert('🔄 Reset to default settings');
  };
  
  // Initialize sliders from loaded preferences
  updateSlidersFromPreferences();
  updateModeUI();
  
  // Recalibrate button
  shadowRoot.getElementById('recalibrate-btn').onclick = () => {
    recalibrateBaseline();
    const btn = shadowRoot.getElementById('recalibrate-btn');
    btn.textContent = 'Recalibrating...';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Recalibrate Baseline';
      btn.disabled = false;
    }, CALIBRATION_DURATION);
  };
}

function updateModeUI() {
  const adaptiveBtn = shadowRoot.getElementById('mode-adaptive');
  const personalizedBtn = shadowRoot.getElementById('mode-personalized');
  const adaptiveSection = shadowRoot.getElementById('adaptive-section');
  const personalizedSection = shadowRoot.getElementById('personalized-section');
  
  if (operatingMode === 'adaptive') {
    adaptiveBtn.classList.add('active');
    personalizedBtn.classList.remove('active');
    adaptiveSection.style.display = 'block';
    personalizedSection.style.display = 'none';
  } else {
    adaptiveBtn.classList.remove('active');
    personalizedBtn.classList.add('active');
    adaptiveSection.style.display = 'none';
    personalizedSection.style.display = 'block';
  }
}

function updateSlidersFromPreferences() {
  const scaleSlider = shadowRoot.getElementById('scale-slider');
  const lineSlider = shadowRoot.getElementById('line-slider');
  const spacingSlider = shadowRoot.getElementById('spacing-slider');
  
  scaleSlider.value = userPreferences.scale;
  lineSlider.value = userPreferences.lineHeight;
  spacingSlider.value = userPreferences.letterSpacing;
  
  shadowRoot.getElementById('scale-value').textContent = userPreferences.scale.toFixed(2);
  shadowRoot.getElementById('line-value').textContent = userPreferences.lineHeight.toFixed(1);
  shadowRoot.getElementById('spacing-value').textContent = userPreferences.letterSpacing.toFixed(2);
}

function togglePanel() {
  panelVisible = !panelVisible;
  const panel = shadowRoot.getElementById('panel');
  if (panelVisible) {
    panel.classList.remove('hidden');
    panel.classList.add('opening');
    setTimeout(() => panel.classList.remove('opening'), 400);
  } else {
    panel.classList.add('hidden');
  }
}

function updatePanel(frictionData) {
  if (!scoreText || !stateText || !statusDot) return;
  
  // Update control source indicator
  const sourceIndicator = shadowRoot.getElementById('source-indicator');
  
  if (operatingMode === 'personalized') {
    scoreText.textContent = 'N/A';
    stateText.textContent = 'PERSONALIZED';
    statusDot.style.background = "#4CAF8D";
    if (backendText) backendText.textContent = 'N/A';
    if (frictionText) frictionText.textContent = 'N/A';
    if (controlStatus) {
      controlStatus.textContent = 'Mode: User Preferences';
      controlStatus.style.color = 'rgba(76, 175, 141, 0.7)';
    }
    if (sourceIndicator) sourceIndicator.textContent = 'User Preference';
    return;
  }
  
  // Adaptive mode display
  scoreText.textContent = finalAdaptiveScore.toFixed(2);
  backendText.textContent = backendScore.toFixed(2);
  frictionText.textContent = frictionData.friction.toFixed(2);
  stateText.textContent = currentState.toUpperCase();
  
  if (currentState === "high") {
    statusDot.style.background = "#E6A23C";
  } else if (currentState === "mild") {
    statusDot.style.background = "#4F6DFF";
  } else {
    statusDot.style.background = "#4CAF8D";
  }
  
  // Update control source based on locked settings
  if (sourceIndicator) {
    const hasLocks = userLockedSettings.scale || userLockedSettings.lineHeight || userLockedSettings.letterSpacing;
    sourceIndicator.textContent = hasLocks ? 'Hybrid (User + AI)' : 'Proactive AI';
  }
  
  // Update override indicator
  const overrideIndicator = shadowRoot.getElementById('override-indicator');
  if (overrideIndicator) {
    const hasLocks = userLockedSettings.scale || userLockedSettings.lineHeight || userLockedSettings.letterSpacing;
    overrideIndicator.style.display = hasLocks ? 'block' : 'none';
  }
  
  // Update AI confidence display
  const confidenceBar = shadowRoot.getElementById('confidence-bar');
  const confidenceValue = shadowRoot.getElementById('confidence-value');
  if (confidenceBar && confidenceValue) {
    const confidencePercent = Math.round(aiConfidence * 100);
    confidenceBar.style.width = confidencePercent + '%';
    confidenceValue.textContent = confidencePercent + '%';
  }
  
  if (!calibrationMode) {
    const calibStatus = shadowRoot.getElementById('calibration-status');
    if (calibStatus) {
      calibStatus.innerHTML = '<span>✓</span><span>Baseline calibrated</span>';
      calibStatus.style.background = 'rgba(76, 175, 141, 0.1)';
      calibStatus.style.color = 'rgba(76, 175, 141, 0.9)';
    }
  }
  
  const breakdown = shadowRoot.getElementById('friction-breakdown');
  if (breakdown) {
    breakdown.textContent = `Scroll ${(frictionData.components.scroll * 100).toFixed(0)}% · Rage ${(frictionData.components.rage * 100).toFixed(0)}% · Reread ${(frictionData.components.reread * 100).toFixed(0)}%`;
  }
  
  const now = Date.now();
  const timeSinceChange = now - lastStateChangeTime;
  if (controlStatus) {
    if (timeSinceChange < 3000) {
      controlStatus.textContent = 'Control: Transitioning';
      controlStatus.style.color = 'rgba(230, 162, 60, 0.7)';
    } else {
      controlStatus.textContent = 'Control: Stable';
      controlStatus.style.color = 'rgba(76, 175, 141, 0.7)';
    }
  }
}

// ============================================
// DEMO MODE (PRIORITY LOCK)
// ============================================

function startDemoMode() {
  let demoScore = 0.2;
  let step = 0;
  
  // Initialize graph with starting point
  graphScores = [0.2];
  
  demoInterval = setInterval(() => {
    if (step < 30) {
      demoScore += 0.02;
      step++;
    }
    
    // 3️⃣ Demo mode directly sets finalAdaptiveScore
    finalAdaptiveScore = demoScore;
    
    // Add to graph
    graphScores.push(finalAdaptiveScore);
    if (graphScores.length > 10) graphScores.shift();
    
    // Determine state and apply
    const newState = determineState(finalAdaptiveScore);
    const now = Date.now();
    const timeSinceChange = now - lastStateChangeTime;
    
    if (newState !== currentState && timeSinceChange >= MIN_STATE_DURATION) {
      currentState = newState;
      lastStateChangeTime = now;
      applyAdaptation(newState);
    }
    
    // Update panel display
    updatePanel({ friction: demoScore, components: { scroll: 0, rage: 0, reread: 0, tab: 0 } });
    updateGraph();
    
  }, 167);
  
  console.log('🎬 Demo Mode: Gradual increase to 0.8');
}

function stopDemoMode() {
  if (demoInterval) {
    clearInterval(demoInterval);
    demoInterval = null;
  }
  finalAdaptiveScore = 0.2;
  updateUI();
  console.log('⏹️ Demo Mode: Stopped');
}

// ============================================
// BACKEND COMMUNICATION
// ============================================

async function sendToBackend() {
  if (demoMode) return; // 3️⃣ Demo mode blocks backend updates
  
  try {
    // Calculate features from tracked behavior
    const windowSize = 10;
    const scrollRate = scrollHistory.length / windowSize;
    const clickRate = (rageClickCount * 2) / windowSize; // Approximate total clicks
    const avgReadTime = paragraphReadTimes.length > 0 
      ? paragraphReadTimes.reduce((a, b) => a + b, 0) / paragraphReadTimes.length / 1000
      : 3.0;
    
    const features = {
      scroll_rate: scrollRate,
      click_rate: clickRate,
      rage_click_count: rageClickCount,
      tab_switch_count: tabSwitchCount,
      avg_paragraph_read_time: avgReadTime,
      timestamp: Date.now()
    };
    
    console.log('📤 Sending to backend:', features);
    
    const response = await fetch('http://localhost:5000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(features)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();
    backendScore = result.overload_score;
    
    console.log('📥 Backend response:', result.overload_score.toFixed(2));
    
  } catch (error) {
    console.log('⚠️ Backend offline, using friction only:', error.message);
    backendScore = 0.5; // Neutral fallback
  }
}

// ============================================
// RESET COUNTERS
// ============================================

function resetCounters() {
  scrollHistory = [];
  rereadCount = 0;
  rageClickCount = 0;
  tabSwitchCount = 0;
  paragraphReadTimes = [];
}

// ============================================
// MAIN LOOP
// ============================================

setInterval(() => {
  if (calibrationMode) updateBaseline();
  sendToBackend();
  updateUI();
  resetCounters();
}, 10000);

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

async function checkAuth() {
  try {
    const result = await chrome.storage.local.get(['currentUser']);
    if (result.currentUser) {
      currentUser = result.currentUser;
      console.log('✅ User authenticated:', currentUser.username);
      
      // Load profile into userPreferences
      if (currentUser.profile) {
        userPreferences.scale = currentUser.profile.preferred_scale || 1.0;
        userPreferences.lineHeight = currentUser.profile.preferred_line_height || 1.5;
        userPreferences.letterSpacing = currentUser.profile.preferred_letter_spacing || 0;
        userPreferences.contrast = currentUser.profile.preferred_contrast || 1.0;
        
        // Apply preferences if onboarding completed
        if (currentUser.profile.onboarding_completed) {
          operatingMode = 'personalized';
          applyPersonalizedAdaptation();
        }
      }
      
      // Check if onboarding needed
      if (!currentUser.profile || !currentUser.profile.onboarding_completed) {
        showOnboarding();
      }
    } else {
      // No user logged in - show auth modal
      showAuthModal();
    }
    authChecked = true;
  } catch (error) {
    console.log('⚠️ Auth check failed:', error);
    showAuthModal();
    authChecked = true;
  }
}

async function loginUser(username, password) {
  try {
    const response = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      currentUser = {
        user_id: data.profile.user_id,
        username: data.profile.username,
        profile: data.profile
      };
      
      await chrome.storage.local.set({ currentUser });
      
      // Load preferences
      if (data.profile.onboarding_completed) {
        userPreferences.scale = data.profile.preferred_scale;
        userPreferences.lineHeight = data.profile.preferred_line_height;
        userPreferences.letterSpacing = data.profile.preferred_letter_spacing;
        userPreferences.contrast = data.profile.preferred_contrast;
        await saveUserPreferences();
        
        if (operatingMode === 'personalized') {
          applyPersonalizedAdaptation();
        }
      }
      
      return { success: true, needsOnboarding: !data.profile.onboarding_completed };
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.log('❌ Login failed:', error);
    return { success: false, error: 'Connection failed' };
  }
}

async function signupUser(username, password) {
  try {
    const response = await fetch('http://localhost:5000/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Auto-login after signup
      return await loginUser(username, password);
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.log('❌ Signup failed:', error);
    return { success: false, error: 'Connection failed' };
  }
}

async function saveProfileToBackend(profileData) {
  if (!currentUser) return;
  
  try {
    await fetch('http://localhost:5000/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: currentUser.user_id,
        ...profileData
      })
    });
    
    // Update local storage
    currentUser.profile = { ...currentUser.profile, ...profileData };
    await chrome.storage.local.set({ currentUser });
    
    console.log('💾 Profile synced to backend');
  } catch (error) {
    console.log('⚠️ Profile sync failed:', error);
  }
}

// ============================================
// USER PREFERENCE STORAGE
// ============================================

async function loadUserPreferences() {
  try {
    const result = await chrome.storage.local.get(['userPreferences', 'operatingMode', 'userLockedSettings', 'aiConfidence']);
    if (result.userPreferences) {
      userPreferences = result.userPreferences;
      console.log('✅ Loaded user preferences:', userPreferences);
    }
    if (result.operatingMode) {
      operatingMode = result.operatingMode;
      console.log('✅ Operating mode:', operatingMode);
    }
    if (result.userLockedSettings) {
      userLockedSettings = result.userLockedSettings;
    }
    if (result.aiConfidence !== undefined) {
      aiConfidence = result.aiConfidence;
    }
    
    // Apply personalized mode immediately if enabled
    if (operatingMode === 'personalized') {
      applyPersonalizedAdaptation();
    }
  } catch (error) {
    console.log('⚠️ Could not load preferences:', error);
  }
}

async function saveUserPreferences() {
  try {
    await chrome.storage.local.set({ 
      userPreferences: userPreferences,
      operatingMode: operatingMode,
      userLockedSettings: userLockedSettings,
      aiConfidence: aiConfidence
    });
    console.log('💾 Saved preferences:', userPreferences);
  } catch (error) {
    console.log('⚠️ Could not save preferences:', error);
  }
}

function applyPreset(presetName) {
  switch(presetName) {
    case 'low-vision':
      userPreferences = { scale: 1.25, lineHeight: 1.9, letterSpacing: 0.08, contrast: 1.3, fontFamily: 'default' };
      break;
    case 'dyslexia':
      userPreferences = { scale: 1.15, lineHeight: 1.8, letterSpacing: 0.12, contrast: 1.1, fontFamily: 'default' };
      break;
    case 'high-contrast':
      userPreferences = { scale: 1.1, lineHeight: 1.7, letterSpacing: 0.05, contrast: 1.5, fontFamily: 'default' };
      break;
    default:
      userPreferences = { scale: 1.0, lineHeight: 1.5, letterSpacing: 0, contrast: 1.0, fontFamily: 'default' };
  }
  saveUserPreferences();
  if (operatingMode === 'personalized') {
    applyPersonalizedAdaptation();
  }
  updatePanel({ friction: 0, components: { scroll: 0, rage: 0, reread: 0, tab: 0 } });
  console.log('🎨 Applied preset:', presetName);
}

function showAuthModal() {
  const authModal = document.createElement('div');
  authModal.id = 'neuro-auth-modal';
  authModal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2147483647;
    font-family: Inter, system-ui, sans-serif;
  `;
  
  authModal.innerHTML = `
    <div style="
      background: rgba(18, 18, 22, 0.95);
      border-radius: 16px;
      padding: 40px;
      width: 400px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
    ">
      <h2 style="color: #fff; margin: 0 0 8px 0; font-size: 24px; font-weight: 600;">Welcome to NeuroAdaptiveOS</h2>
      <p style="color: rgba(255, 255, 255, 0.6); margin: 0 0 32px 0; font-size: 14px;">Personalized accessibility for everyone</p>
      
      <div id="auth-form">
        <input type="text" id="auth-username" placeholder="Username" style="
          width: 100%;
          padding: 12px 16px;
          margin-bottom: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
          box-sizing: border-box;
        ">
        <input type="password" id="auth-password" placeholder="Password" style="
          width: 100%;
          padding: 12px 16px;
          margin-bottom: 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
          box-sizing: border-box;
        ">
        <div id="auth-error" style="color: #ff6b6b; font-size: 12px; margin-bottom: 16px; display: none;"></div>
        <button id="auth-login" style="
          width: 100%;
          padding: 12px;
          background: #4F6DFF;
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 8px;
        " type="button">Login</button>
        <button id="auth-signup" style="
          width: 100%;
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        " type="button">Sign Up</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(authModal);
  
  const showError = (msg) => {
    const errorEl = document.getElementById('auth-error');
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
  };
  
  // Add Enter key support
  const usernameInput = document.getElementById('auth-username');
  const passwordInput = document.getElementById('auth-password');
  
  const handleEnter = (e) => {
    if (e.key === 'Enter') {
      document.getElementById('auth-login').click();
    }
  };
  
  usernameInput.addEventListener('keypress', handleEnter);
  passwordInput.addEventListener('keypress', handleEnter);
  
  // Focus username field
  setTimeout(() => usernameInput.focus(), 100);
  
  document.getElementById('auth-login').onclick = async () => {
    const username = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value;
    
    if (!username || !password) {
      showError('Please enter username and password');
      return;
    }
    
    // Disable button during login
    const loginBtn = document.getElementById('auth-login');
    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';
    
    const result = await loginUser(username, password);
    
    if (result.success) {
      console.log('✅ Login successful');
      authModal.remove();
      
      if (result.needsOnboarding) {
        showOnboarding();
      } else {
        // User already completed onboarding, apply their preferences
        operatingMode = 'personalized';
        applyPersonalizedAdaptation();
        console.log('🎨 Applied saved preferences');
      }
    } else {
      loginBtn.disabled = false;
      loginBtn.textContent = 'Login';
      showError(result.error || 'Login failed');
    }
  };
  
  document.getElementById('auth-signup').onclick = async () => {
    const username = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value;
    
    if (!username || !password) {
      showError('Please enter username and password');
      return;
    }
    
    if (username.length < 3) {
      showError('Username must be at least 3 characters');
      return;
    }
    
    if (password.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }
    
    // Disable button during signup
    const signupBtn = document.getElementById('auth-signup');
    signupBtn.disabled = true;
    signupBtn.textContent = 'Creating account...';
    
    const result = await signupUser(username, password);
    
    if (result.success) {
      console.log('✅ Signup successful');
      authModal.remove();
      showOnboarding(); // Always show onboarding for new users
    } else {
      signupBtn.disabled = false;
      signupBtn.textContent = 'Sign Up';
      showError(result.error || 'Signup failed');
    }
  };
}

function showOnboarding() {
  let step = 1;
  const answers = {};
  
  const onboardingModal = document.createElement('div');
  onboardingModal.id = 'neuro-onboarding-modal';
  onboardingModal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2147483647;
    font-family: Inter, system-ui, sans-serif;
  `;
  
  const renderStep = () => {
    let content = '';
    
    if (step === 1) {
      content = `
        <h3 style="color: #fff; margin: 0 0 24px 0; font-size: 20px;">To personalize your reading experience...</h3>
        <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 24px; font-size: 14px;">Do you experience reading difficulty?</p>
        <button class="onboard-btn" data-value="yes">Yes</button>
        <button class="onboard-btn" data-value="no">No</button>
      `;
    } else if (step === 2) {
      content = `
        <h3 style="color: #fff; margin: 0 0 24px 0; font-size: 20px;">Text size preference</h3>
        <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 24px; font-size: 14px;">Do you prefer larger text by default?</p>
        <button class="onboard-btn" data-value="small">Small</button>
        <button class="onboard-btn" data-value="medium">Medium</button>
        <button class="onboard-btn" data-value="large">Large</button>
      `;
    } else if (step === 3) {
      content = `
        <h3 style="color: #fff; margin: 0 0 24px 0; font-size: 20px;">Vision preferences</h3>
        <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 24px; font-size: 14px;">Do you have low vision or eyesight difficulty?</p>
        <button class="onboard-btn" data-value="no">No</button>
        <button class="onboard-btn" data-value="mild">Mild</button>
        <button class="onboard-btn" data-value="moderate">Moderate</button>
        <button class="onboard-btn" data-value="severe">Severe</button>
      `;
    } else if (step === 4) {
      content = `
        <h3 style="color: #fff; margin: 0 0 24px 0; font-size: 20px;">Attention preferences</h3>
        <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 24px; font-size: 14px;">Do you experience attention-related challenges?</p>
        <button class="onboard-btn" data-value="no">No</button>
        <button class="onboard-btn" data-value="sometimes">Sometimes</button>
        <button class="onboard-btn" data-value="often">Often</button>
      `;
    } else if (step === 5) {
      content = `
        <h3 style="color: #fff; margin: 0 0 24px 0; font-size: 20px;">Contrast preference</h3>
        <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 24px; font-size: 14px;">Which contrast level do you prefer?</p>
        <button class="onboard-btn" data-value="high">High contrast</button>
        <button class="onboard-btn" data-value="soft">Soft contrast</button>
        <button class="onboard-btn" data-value="default">Default</button>
      `;
    } else if (step === 6) {
      content = `
        <h3 style="color: #fff; margin: 0 0 24px 0; font-size: 20px;">Font preference</h3>
        <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 24px; font-size: 14px;">Do you want dyslexia-friendly font?</p>
        <button class="onboard-btn" data-value="yes">Yes</button>
        <button class="onboard-btn" data-value="no">No</button>
      `;
    } else if (step === 7) {
      content = `
        <h3 style="color: #fff; margin: 0 0 24px 0; font-size: 20px;">Zoom level</h3>
        <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 16px; font-size: 14px;">What is your comfortable zoom level?</p>
        <input type="range" id="zoom-slider" min="100" max="150" value="100" step="5" style="width: 100%; margin-bottom: 8px;">
        <p style="color: #4F6DFF; text-align: center; font-size: 16px; font-weight: 600;"><span id="zoom-value">100</span>%</p>
        <button class="onboard-btn" data-value="continue" style="margin-top: 16px;">Continue</button>
      `;
    }
    
    onboardingModal.innerHTML = `
      <div style="
        background: rgba(18, 18, 22, 0.95);
        border-radius: 16px;
        padding: 40px;
        width: 480px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.1);
      ">
        <div style="color: rgba(255, 255, 255, 0.5); font-size: 12px; margin-bottom: 16px;">Step ${step} of 7</div>
        ${content}
        <button id="onboard-skip" style="
          width: 100%;
          padding: 12px;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.4);
          font-size: 12px;
          cursor: pointer;
          margin-top: 16px;
        ">Skip onboarding</button>
      </div>
    `;
    
    // Add button styles
    const style = document.createElement('style');
    style.textContent = `
      .onboard-btn {
        width: 100%;
        padding: 14px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        color: rgba(255, 255, 255, 0.9);
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        margin-bottom: 8px;
        transition: all 0.2s ease;
      }
      .onboard-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(79, 109, 255, 0.5);
      }
    `;
    onboardingModal.appendChild(style);
    
    // Handle zoom slider
    if (step === 7) {
      const slider = document.getElementById('zoom-slider');
      const valueDisplay = document.getElementById('zoom-value');
      slider.oninput = () => {
        valueDisplay.textContent = slider.value;
      };
    }
    
    // Handle button clicks
    document.querySelectorAll('.onboard-btn').forEach(btn => {
      btn.onclick = () => {
        const value = btn.getAttribute('data-value');
        
        if (step === 1) answers.readingDifficulty = value;
        else if (step === 2) answers.textSize = value;
        else if (step === 3) answers.vision = value;
        else if (step === 4) answers.attention = value;
        else if (step === 5) answers.contrast = value;
        else if (step === 6) answers.dyslexiaFont = value;
        else if (step === 7) {
          answers.zoomLevel = parseInt(document.getElementById('zoom-slider').value);
          completeOnboarding(answers);
          return;
        }
        
        step++;
        renderStep();
      };
    });
    
    document.getElementById('onboard-skip').onclick = () => {
      onboardingModal.remove();
      operatingMode = 'adaptive';
      console.log('🔄 Onboarding skipped, using adaptive mode');
    };
  };
  
  document.body.appendChild(onboardingModal);
  renderStep();
}

function completeOnboarding(answers) {
  // Map answers to preferences
  let scale = 1.0;
  let lineHeight = 1.5;
  let letterSpacing = 0;
  let contrast = 1.0;
  let attentionLevel = 'none';
  
  // Text size
  if (answers.textSize === 'large') scale = 1.2;
  else if (answers.textSize === 'medium') scale = 1.1;
  
  // Vision
  if (answers.vision === 'severe') {
    scale = Math.max(scale, 1.3);
    lineHeight = 2.0;
    letterSpacing = 0.1;
    contrast = 1.4;
  } else if (answers.vision === 'moderate') {
    scale = Math.max(scale, 1.2);
    lineHeight = 1.8;
    letterSpacing = 0.08;
    contrast = 1.2;
  } else if (answers.vision === 'mild') {
    scale = Math.max(scale, 1.1);
    lineHeight = 1.7;
    contrast = 1.1;
  }
  
  // Attention
  if (answers.attention === 'often') {
    attentionLevel = 'high';
    lineHeight = Math.max(lineHeight, 1.8);
    letterSpacing = Math.max(letterSpacing, 0.05);
  } else if (answers.attention === 'sometimes') {
    attentionLevel = 'medium';
  }
  
  // Contrast
  if (answers.contrast === 'high') contrast = Math.max(contrast, 1.5);
  else if (answers.contrast === 'soft') contrast = 0.9;
  
  // Zoom level
  if (answers.zoomLevel) {
    scale = Math.max(scale, answers.zoomLevel / 100);
  }
  
  // Apply preferences
  userPreferences.scale = scale;
  userPreferences.lineHeight = lineHeight;
  userPreferences.letterSpacing = letterSpacing;
  userPreferences.contrast = contrast;
  
  // Save to local storage
  saveUserPreferences();
  
  // Save to backend if authenticated
  if (currentUser) {
    saveProfileToBackend({
      preferred_scale: scale,
      preferred_line_height: lineHeight,
      preferred_letter_spacing: letterSpacing,
      preferred_contrast: contrast,
      dyslexia_font_enabled: answers.dyslexiaFont === 'yes',
      attention_assist_level: attentionLevel,
      onboarding_completed: true,
      questionnaire_data: answers
    });
  }
  
  // Switch to personalized mode
  operatingMode = 'personalized';
  applyPersonalizedAdaptation();
  
  // Remove modal
  document.getElementById('neuro-onboarding-modal').remove();
  
  console.log('✅ Onboarding completed:', answers);
  console.log('🎨 Applied preferences:', userPreferences);
}

// ============================================
// INITIALIZE - Instant Value Delivery
// ============================================

// CRITICAL: Load preferences FIRST to prevent flicker
(async function initializeNeuroOS() {
  // Step 1: Load preferences synchronously before any UI
  await loadUserPreferences();
  
  // Step 2: Inject styles immediately
  injectStyles();
  
  // Step 3: Apply saved preferences instantly (before page renders)
  if (operatingMode === 'personalized') {
    applyPersonalizedAdaptation();
  }
  
  // Step 4: Initialize focus isolation (inactive by default)
  
  // Step 5: Create panel (deferred, non-blocking)
  requestIdleCallback(() => createPanel(), { timeout: 1000 });
  
  console.log('✅ NeuroAdaptive Layer ready - Universal adaptation applied');
})();

// Layer active - browser-agnostic
authChecked = true;
