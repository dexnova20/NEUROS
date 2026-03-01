// ============================================
// STATE CONTROLLER - Hysteresis & Rate Limiting
// ============================================

export class StateController {
  constructor() {
    this.currentState = "normal";
    this.lastStateChangeTime = 0;
    this.MIN_STATE_DURATION = 3000;
    this.finalAdaptiveScore = 0.2;
    
    this.demoMode = false;
    this.demoInterval = null;
  }
  
  determineState(score) {
    if (this.currentState === "normal") {
      if (score > 0.5) return "mild";
    } else if (this.currentState === "mild") {
      if (score > 0.75) return "high";
      if (score < 0.4) return "normal";
    } else if (this.currentState === "high") {
      if (score < 0.65) return "mild";
    }
    return this.currentState;
  }
  
  canChangeState() {
    const now = Date.now();
    return (now - this.lastStateChangeTime) >= this.MIN_STATE_DURATION;
  }
  
  updateState(newScore) {
    this.finalAdaptiveScore = newScore;
    
    const newState = this.determineState(newScore);
    
    if (newState !== this.currentState && this.canChangeState()) {
      this.currentState = newState;
      this.lastStateChangeTime = Date.now();
      console.log(`🔄 State: ${newState} | Score: ${newScore.toFixed(2)}`);
      return true;
    }
    
    return false;
  }
  
  forceState(state, score) {
    this.currentState = state;
    this.finalAdaptiveScore = score;
    this.lastStateChangeTime = 0;
  }
  
  getState() {
    return this.currentState;
  }
  
  getScore() {
    return this.finalAdaptiveScore;
  }
  
  getTimeSinceChange() {
    return Date.now() - this.lastStateChangeTime;
  }
  
  startDemoMode(callback) {
    if (this.demoMode) return;
    
    this.demoMode = true;
    let demoScore = 0.2;
    let step = 0;
    
    this.demoInterval = setInterval(() => {
      if (step < 30) {
        demoScore += 0.02;
        step++;
      }
      
      this.finalAdaptiveScore = demoScore;
      const newState = this.determineState(demoScore);
      
      if (newState !== this.currentState && this.canChangeState()) {
        this.currentState = newState;
        this.lastStateChangeTime = Date.now();
      }
      
      if (callback) callback(demoScore, newState);
    }, 167);
    
    console.log('🎬 Demo mode started');
  }
  
  stopDemoMode() {
    if (!this.demoMode) return;
    
    this.demoMode = false;
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
    
    this.finalAdaptiveScore = 0.2;
    console.log('⏹️ Demo mode stopped');
  }
  
  isDemoMode() {
    return this.demoMode;
  }
  
  reset() {
    this.currentState = "normal";
    this.finalAdaptiveScore = 0.2;
    this.lastStateChangeTime = 0;
    this.stopDemoMode();
  }
}
