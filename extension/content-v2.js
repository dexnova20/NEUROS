// ============================================
// NEUROADAPTIVE OS - Production Intelligence Layer
// ============================================

import { ScoringEngine } from './modules/scoring.js';
import { PersonalizationEngine } from './modules/personalization.js';
import { OverlayManager } from './modules/overlay.js';
import { StateController } from './modules/stateController.js';

// ============================================
// CORE SYSTEM INITIALIZATION
// ============================================

class NeuroAdaptiveOS {
  constructor() {
    // Core engines
    this.scoring = new ScoringEngine();
    this.personalization = new PersonalizationEngine();
    this.overlay = new OverlayManager();
    this.state = new StateController();
    
    // UI components
    this.panel = null;
    this.shadowRoot = null;
    this.panelVisible = false;
    this.darkTheme = true;
    
    // Graph data
    this.graphScores = [];
    this.graphCanvas = null;
    this.graphCtx = null;
    
    // Cached DOM references
    this.cachedElements = {};
    
    // System state
    this.initialized = false;
  }
  
  async initialize() {
    if (this.initialized) return;
    
    console.log('🚀 NeuroAdaptiveOS initializing...');
    
    // Initialize subsystems
    this.overlay.initialize();
    await this.personalization.loadPreferences();
    
    // Create UI
    this.createPanel();
    
    // Start main loop
    this.startMainLoop();
    
    // Apply initial state
    if (this.personalization.getMode() === 'personalized') {
      this.applyPersonalizedMode();
    }
    
    this.initialized = true;
    console.log('✅ NeuroAdaptiveOS ready');
  }
  
  // ============================================
  // MAIN CONTROL LOOP
  // ============================================
  
  startMainLoop() {
    setInterval(() => {
      // Skip if demo mode active
      if (this.state.isDemoMode()) return;
      
      // Update baseline calibration
      if (this.scoring.isCalibrating()) {
        this.scoring.updateBaseline();
      }
      
      // Update backend score
      this.scoring.updateBackendScore();
      
      // Compute final score
      const { finalScore, frictionData } = this.scoring.computeFinalScore();
      
      // Update state
      const stateChanged = this.state.updateState(finalScore);
      
      // Apply adaptations if state changed
      if (stateChanged && this.personalization.getMode() === 'adaptive') {
        this.applyAdaptiveMode();
      }
      
      // Update UI
      this.updatePanel(frictionData);
      this.updateGraph();
      
      // Reset counters
      this.scoring.resetCounters();
      
    }, 10000);
  }
  
  // ============================================
  // ADAPTATION APPLICATION
  // ============================================
  
  applyAdaptiveMode() {
    const state = this.state.getState();
    let scale, lineHeight, spacing;
    
    if (state === "high") {
      scale = 1.15;
      lineHeight = 1.9;
      spacing = '0.05em';
    } else if (state === "mild") {
      scale = 1.08;
      lineHeight = 1.7;
      spacing = '0.03em';
    } else {
      scale = 1.0;
      lineHeight = 1.5;
      spacing = '0em';
    }
    
    this.overlay.applyTypography(scale, lineHeight, spacing);
    this.overlay.updateBackground(state);
    
    console.log(`🎯 Applied ${state} adaptation`);
  }
  
  applyPersonalizedMode() {
    const prefs = this.personalization.getPreferences();
    
    this.overlay.applyTypography(prefs.scale, prefs.lineHeight, prefs.letterSpacing + 'em');
    this.overlay.applyContrast(prefs.contrast);
    
    if (prefs.focusMode) {
      this.overlay.enableFocusMode();
    } else {
      this.overlay.disableFocusMode();
    }
    
    console.log('🎨 Applied personalized preferences');
  }
  
  // ============================================
  // UI PANEL CREATION
  // ============================================
  
  createPanel() {
    const host = document.createElement('div');
    host.id = 'neuro-host';
    this.shadowRoot = host.attachShadow({ mode: 'open' });
    
    const style = this.getPanelStyles();
    const toggleBtn = this.createToggleButton();
    const panel = this.createPanelContent();
    
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(toggleBtn);
    this.shadowRoot.appendChild(panel);
    document.body.appendChild(host);
    
    this.cacheElements();
    this.attachEventListeners();
    
    console.log('✅ Panel created');
  }
  
  getPanelStyles() {
    const style = document.createElement('style');
    style.textContent = `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      
      #toggle-btn {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: rgba(18, 18, 22, 0.9);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        z-index: 2147483647;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      #toggle-btn:hover {
        transform: translateY(-2px) scale(1.05);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
        border-color: rgba(79, 109, 255, 0.3);
      }
      
      #panel {
        position: fixed;
        bottom: 84px;
        right: 24px;
        width: 340px;
        max-height: 600px;
        background: rgba(18, 18, 22, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        z-index: 2147483647;
        font-family: Inter, system-ui, sans-serif;
        color: rgba(255, 255, 255, 0.9);
        box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6);
        overflow: hidden;
        transform-origin: bottom right;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      #panel.hidden {
        opacity: 0;
        transform: scale(0.95) translateY(8px);
        pointer-events: none;
      }
      #panel.light {
        background: rgba(255, 255, 255, 0.95);
        color: rgba(0, 0, 0, 0.9);
        border-color: rgba(0, 0, 0, 0.08);
      }
      
      .panel-header {
        padding: 16px 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      }
      
      .panel-title {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 4px;
      }
      
      .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #4CAF8D;
        transition: background 0.3s ease;
        animation: pulse 2s ease-in-out infinite;
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }
      
      .title-text {
        font-size: 14px;
        font-weight: 600;
        letter-spacing: -0.01em;
      }
      
      .subtitle {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.4);
        margin-left: 16px;
      }
      
      .panel-controls {
        position: absolute;
        top: 16px;
        right: 16px;
        display: flex;
        gap: 8px;
      }
      
      .icon-btn {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.4);
        cursor: pointer;
        font-size: 16px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: all 0.2s ease;
      }
      .icon-btn:hover {
        background: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.8);
        transform: scale(1.1);
      }
      
      .panel-body {
        padding: 20px;
        max-height: 380px;
        overflow-y: auto;
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
      }
      .mode-btn:hover {
        background: rgba(255, 255, 255, 0.06);
        transform: translateY(-1px);
      }
      .mode-btn.active {
        background: #4F6DFF;
        color: white;
        border-color: #4F6DFF;
        box-shadow: 0 4px 12px rgba(79, 109, 255, 0.3);
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
        font-weight: 600;
      }
      
      .state-badge {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        background: rgba(79, 109, 255, 0.15);
        color: #4F6DFF;
        transition: all 0.3s ease;
      }
      
      .divider {
        height: 1px;
        background: rgba(255, 255, 255, 0.06);
        margin: 16px 0;
      }
      
      .graph-container {
        margin: 16px 0;
        padding: 12px;
        background: rgba(30, 32, 38, 0.5);
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.04);
      }
      
      .components-text {
        font-size: 10px;
        color: rgba(255, 255, 255, 0.35);
        font-variant-numeric: tabular-nums;
      }
      
      .control-status {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.4);
        margin-bottom: 16px;
      }
      
      .panel-footer {
        padding: 16px 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.06);
        display: flex;
        flex-direction: column;
        gap: 8px;
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
      }
      
      .btn-primary {
        background: #4F6DFF;
        color: white;
      }
      .btn-primary:hover {
        background: #6B85FF;
        box-shadow: 0 4px 12px rgba(79, 109, 255, 0.3);
        transform: translateY(-1px);
      }
      
      .btn-success {
        background: #4CAF8D;
        color: white;
      }
      .btn-success:hover {
        background: #5FC49F;
        box-shadow: 0 4px 12px rgba(76, 175, 141, 0.3);
        transform: translateY(-1px);
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
      
      .loading {
        opacity: 0.5;
        pointer-events: none;
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
        animation: fadeIn 0.3s ease;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-4px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    return style;
  }
  
  createToggleButton() {
    const btn = document.createElement('button');
    btn.id = 'toggle-btn';
    btn.innerHTML = `
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
    return btn;
  }
  
  createPanelContent() {
    const panel = document.createElement('div');
    panel.id = 'panel';
    panel.className = 'hidden';
    panel.innerHTML = `
      <div class="panel-header">
        <div class="panel-title">
          <div class="status-dot" id="neuro-dot"></div>
          <span class="title-text">NeuroAdaptive</span>
        </div>
        <div class="subtitle">Intelligence Layer</div>
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
        </div>
        
        <div id="personalized-section" style="display: none;">
          <p style="font-size: 12px; color: rgba(255, 255, 255, 0.6); margin-bottom: 16px;">
            Personalized mode active. Preferences applied.
          </p>
        </div>
      </div>
      
      <div class="panel-footer">
        <button class="btn btn-primary" id="simulateHigh">Simulate High Load</button>
        <button class="btn btn-success" id="resetSim">Reset to Normal</button>
        <button class="btn btn-secondary" id="toggleDemo">Demo Mode: OFF</button>
      </div>
    `;
    return panel;
  }
  
  cacheElements() {
    this.cachedElements = {
      panel: this.shadowRoot.getElementById('panel'),
      scoreText: this.shadowRoot.getElementById('neuro-score'),
      stateText: this.shadowRoot.getElementById('neuro-state'),
      statusDot: this.shadowRoot.getElementById('neuro-dot'),
      frictionText: this.shadowRoot.getElementById('neuro-friction'),
      backendText: this.shadowRoot.getElementById('neuro-backend'),
      controlStatus: this.shadowRoot.getElementById('control-status'),
      calibrationStatus: this.shadowRoot.getElementById('calibration-status'),
      frictionBreakdown: this.shadowRoot.getElementById('friction-breakdown')
    };
    
    const graphContainer = this.shadowRoot.getElementById('graph-container');
    this.graphCanvas = document.createElement('canvas');
    this.graphCanvas.width = 180;
    this.graphCanvas.height = 50;
    this.graphCanvas.style.cssText = 'width: 100%; height: 50px;';
    this.graphCtx = this.graphCanvas.getContext('2d');
    graphContainer.appendChild(this.graphCanvas);
  }
  
  attachEventListeners() {
    this.shadowRoot.getElementById('toggle-btn').onclick = () => this.togglePanel();
    this.shadowRoot.getElementById('close-btn').onclick = () => this.togglePanel();
    
    this.shadowRoot.getElementById('theme-btn').onclick = () => {
      this.darkTheme = !this.darkTheme;
      const panel = this.cachedElements.panel;
      const themeBtn = this.shadowRoot.getElementById('theme-btn');
      if (this.darkTheme) {
        panel.classList.remove('light');
        themeBtn.textContent = '☀';
      } else {
        panel.classList.add('light');
        themeBtn.textContent = '🌙';
      }
    };
    
    this.shadowRoot.getElementById('mode-adaptive').onclick = () => {
      this.personalization.setMode('adaptive');
      this.updateModeUI();
      this.applyAdaptiveMode();
    };
    
    this.shadowRoot.getElementById('mode-personalized').onclick = () => {
      this.personalization.setMode('personalized');
      this.updateModeUI();
      this.applyPersonalizedMode();
    };
    
    this.shadowRoot.getElementById('simulateHigh').onclick = () => {
      this.state.stopDemoMode();
      this.state.forceState('high', 0.85);
      this.applyAdaptiveMode();
      this.updatePanel({ friction: 0.85, components: { scroll: 0, rage: 0, reread: 0, tab: 0 } });
    };
    
    this.shadowRoot.getElementById('resetSim').onclick = () => {
      this.state.stopDemoMode();
      this.state.reset();
      this.scoring.resetCounters();
      this.graphScores = [];
      this.applyAdaptiveMode();
      this.updatePanel({ friction: 0.2, components: { scroll: 0, rage: 0, reread: 0, tab: 0 } });
    };
    
    this.shadowRoot.getElementById('toggleDemo').onclick = () => {
      const btn = this.shadowRoot.getElementById('toggleDemo');
      if (this.state.isDemoMode()) {
        this.state.stopDemoMode();
        btn.textContent = 'Demo Mode: OFF';
      } else {
        this.state.startDemoMode((score, state) => {
          this.graphScores.push(score);
          if (this.graphScores.length > 10) this.graphScores.shift();
          this.applyAdaptiveMode();
          this.updatePanel({ friction: score, components: { scroll: 0, rage: 0, reread: 0, tab: 0 } });
          this.updateGraph();
        });
        btn.textContent = 'Demo Mode: ON';
      }
    };
  }
  
  togglePanel() {
    this.panelVisible = !this.panelVisible;
    if (this.panelVisible) {
      this.cachedElements.panel.classList.remove('hidden');
    } else {
      this.cachedElements.panel.classList.add('hidden');
    }
  }
  
  updateModeUI() {
    const adaptiveBtn = this.shadowRoot.getElementById('mode-adaptive');
    const personalizedBtn = this.shadowRoot.getElementById('mode-personalized');
    const adaptiveSection = this.shadowRoot.getElementById('adaptive-section');
    const personalizedSection = this.shadowRoot.getElementById('personalized-section');
    
    if (this.personalization.getMode() === 'adaptive') {
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
  
  updatePanel(frictionData) {
    if (this.personalization.getMode() === 'personalized') {
      this.cachedElements.scoreText.textContent = 'N/A';
      this.cachedElements.stateText.textContent = 'PERSONALIZED';
      this.cachedElements.statusDot.style.background = '#4CAF8D';
      return;
    }
    
    const score = this.state.getScore();
    const state = this.state.getState();
    
    this.cachedElements.scoreText.textContent = score.toFixed(2);
    this.cachedElements.backendText.textContent = this.scoring.backendScore.toFixed(2);
    this.cachedElements.frictionText.textContent = frictionData.friction.toFixed(2);
    this.cachedElements.stateText.textContent = state.toUpperCase();
    
    if (state === 'high') {
      this.cachedElements.statusDot.style.background = '#E6A23C';
    } else if (state === 'mild') {
      this.cachedElements.statusDot.style.background = '#4F6DFF';
    } else {
      this.cachedElements.statusDot.style.background = '#4CAF8D';
    }
    
    if (!this.scoring.isCalibrating()) {
      this.cachedElements.calibrationStatus.innerHTML = '<span>✓</span><span>Baseline calibrated</span>';
      this.cachedElements.calibrationStatus.style.background = 'rgba(76, 175, 141, 0.1)';
      this.cachedElements.calibrationStatus.style.color = 'rgba(76, 175, 141, 0.9)';
    }
    
    this.cachedElements.frictionBreakdown.textContent = 
      `Scroll ${(frictionData.components.scroll * 100).toFixed(0)}% · ` +
      `Rage ${(frictionData.components.rage * 100).toFixed(0)}% · ` +
      `Reread ${(frictionData.components.reread * 100).toFixed(0)}%`;
    
    const timeSinceChange = this.state.getTimeSinceChange();
    if (timeSinceChange < 3000) {
      this.cachedElements.controlStatus.textContent = 'Control: Transitioning';
      this.cachedElements.controlStatus.style.color = 'rgba(230, 162, 60, 0.7)';
    } else {
      this.cachedElements.controlStatus.textContent = 'Control: Stable';
      this.cachedElements.controlStatus.style.color = 'rgba(76, 175, 141, 0.7)';
    }
    
    this.graphScores.push(score);
    if (this.graphScores.length > 10) this.graphScores.shift();
  }
  
  updateGraph() {
    if (!this.graphCtx || this.graphScores.length < 1) return;
    
    const width = this.graphCanvas.width;
    const height = this.graphCanvas.height;
    
    this.graphCtx.clearRect(0, 0, width, height);
    
    this.graphCtx.fillStyle = this.darkTheme ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)';
    this.graphCtx.fillRect(0, 0, width, height);
    
    this.graphCtx.strokeStyle = this.darkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    this.graphCtx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = (height / 4) * i;
      this.graphCtx.beginPath();
      this.graphCtx.moveTo(0, y);
      this.graphCtx.lineTo(width, y);
      this.graphCtx.stroke();
    }
    
    if (this.graphScores.length < 2) return;
    
    const step = width / (this.graphScores.length - 1);
    
    this.graphCtx.strokeStyle = '#4F6DFF';
    this.graphCtx.lineWidth = 2;
    this.graphCtx.beginPath();
    
    this.graphScores.forEach((score, i) => {
      const x = i * step;
      const y = height - (score * height);
      if (i === 0) this.graphCtx.moveTo(x, y);
      else this.graphCtx.lineTo(x, y);
    });
    
    this.graphCtx.stroke();
    
    this.graphCtx.fillStyle = 'rgba(79, 109, 255, 0.15)';
    this.graphCtx.lineTo(width, height);
    this.graphCtx.lineTo(0, height);
    this.graphCtx.closePath();
    this.graphCtx.fill();
  }
}

// ============================================
// INITIALIZE SYSTEM
// ============================================

const neuroOS = new NeuroAdaptiveOS();
neuroOS.initialize();

console.log('✅ NeuroAdaptiveOS Production Layer Loaded');
