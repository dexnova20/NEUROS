// ============================================
// ADAPTATION ENGINE - Platform-Agnostic Core
// ============================================
// Universal UI adaptation logic

class AdaptationEngine {
  constructor() {
    this.currentState = 'normal';
    this.lastStateChangeTime = 0;
    this.MIN_STATE_DURATION = 3000;
  }
  
  determineState(score) {
    if (this.currentState === 'normal') {
      if (score > 0.5) return 'mild';
    } else if (this.currentState === 'mild') {
      if (score > 0.75) return 'high';
      if (score < 0.4) return 'normal';
    } else if (this.currentState === 'high') {
      if (score < 0.65) return 'mild';
    }
    return this.currentState;
  }
  
  canChangeState() {
    const now = Date.now();
    return (now - this.lastStateChangeTime) >= this.MIN_STATE_DURATION;
  }
  
  updateState(newScore) {
    const newState = this.determineState(newScore);
    
    if (newState !== this.currentState && this.canChangeState()) {
      this.currentState = newState;
      this.lastStateChangeTime = Date.now();
      return { changed: true, state: newState };
    }
    
    return { changed: false, state: this.currentState };
  }
  
  getAdaptationParams(state) {
    if (state === 'high') {
      return { scale: 1.15, lineHeight: 1.9, spacing: '0.05em', message: '🟠 Reading mode optimized for comfort' };
    } else if (state === 'mild') {
      return { scale: 1.08, lineHeight: 1.7, spacing: '0.03em', message: '🟡 Reading mode adjusted' };
    } else {
      return { scale: 1.0, lineHeight: 1.5, spacing: '0em', message: null };
    }
  }
  
  applyToDOM(params) {
    const root = document.documentElement;
    root.style.setProperty('--neuro-scale', params.scale);
    root.style.setProperty('--neuro-line', params.lineHeight);
    root.style.setProperty('--neuro-spacing', params.spacing);
  }
  
  reset() {
    this.currentState = 'normal';
    this.lastStateChangeTime = 0;
  }
}

window.AdaptationEngine = AdaptationEngine;
