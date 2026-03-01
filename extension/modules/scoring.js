// ============================================
// SCORING ENGINE - Friction Detection & Analysis
// ============================================

export class ScoringEngine {
  constructor() {
    this.scrollHistory = [];
    this.rereadCount = 0;
    this.lastScrollY = 0;
    this.rageClickCount = 0;
    this.tabSwitchCount = 0;
    this.paragraphReadTimes = [];
    
    this.calibrationMode = true;
    this.calibrationStartTime = Date.now();
    this.CALIBRATION_DURATION = 20000;
    this.baselineMetrics = { scrollRate: 0, rageClickRate: 0, rereadRate: 0, samples: 0 };
    
    this.scoreHistory = [];
    this.SMOOTHING_WINDOW = 5;
    
    this.backendScore = 0.2;
    this.backendAvailable = true;
    
    this._initializeTracking();
  }
  
  _initializeTracking() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.tabSwitchCount++;
    });
    
    window.addEventListener('scroll', () => {
      const now = Date.now();
      this.scrollHistory.push(now);
      if (this.scrollHistory.length > 20) this.scrollHistory.shift();
      
      const currentScrollY = window.scrollY;
      if (currentScrollY < this.lastScrollY - 100) this.rereadCount++;
      this.lastScrollY = currentScrollY;
    }, { passive: true });
    
    let lastClickTime = 0;
    document.addEventListener('click', () => {
      const now = Date.now();
      if (now - lastClickTime < 500) this.rageClickCount++;
      lastClickTime = now;
    });
  }
  
  updateBaseline() {
    if (!this.calibrationMode) return;
    
    const elapsed = Date.now() - this.calibrationStartTime;
    if (elapsed >= this.CALIBRATION_DURATION) {
      this.calibrationMode = false;
      console.log('✅ Baseline calibrated:', this.baselineMetrics);
      return;
    }
    
    const windowSize = 10;
    const scrollRate = this.scrollHistory.length / windowSize;
    const rageRate = this.rageClickCount / windowSize;
    const rereadRate = this.rereadCount / windowSize;
    
    const n = this.baselineMetrics.samples;
    this.baselineMetrics.scrollRate = (this.baselineMetrics.scrollRate * n + scrollRate) / (n + 1);
    this.baselineMetrics.rageClickRate = (this.baselineMetrics.rageClickRate * n + rageRate) / (n + 1);
    this.baselineMetrics.rereadRate = (this.baselineMetrics.rereadRate * n + rereadRate) / (n + 1);
    this.baselineMetrics.samples++;
  }
  
  recalibrateBaseline() {
    this.calibrationMode = true;
    this.calibrationStartTime = Date.now();
    this.baselineMetrics = { scrollRate: 0, rageClickRate: 0, rereadRate: 0, samples: 0 };
    console.log('🔄 Baseline recalibration started');
  }
  
  computeFrictionScore() {
    const windowSize = 10;
    
    let scrollVariance = 0;
    if (this.scrollHistory.length > 1) {
      const intervals = [];
      for (let i = 1; i < this.scrollHistory.length; i++) {
        intervals.push(this.scrollHistory[i] - this.scrollHistory[i-1]);
      }
      const mean = intervals.reduce((a,b) => a+b, 0) / intervals.length;
      scrollVariance = intervals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intervals.length;
      scrollVariance = Math.sqrt(scrollVariance) / 1000;
    }
    
    const rageRate = this.rageClickCount / windowSize;
    const rereadRate = this.rereadCount / windowSize;
    const tabRate = this.tabSwitchCount / windowSize;
    
    let adjScroll = scrollVariance;
    let adjRage = rageRate;
    let adjReread = rereadRate;
    
    if (!this.calibrationMode && this.baselineMetrics.samples > 0) {
      adjScroll = Math.max(0, scrollVariance - this.baselineMetrics.scrollRate * 0.5);
      adjRage = Math.max(0, rageRate - this.baselineMetrics.rageClickRate);
      adjReread = Math.max(0, rereadRate - this.baselineMetrics.rereadRate);
    }
    
    const normScroll = Math.min(1, adjScroll / 5);
    const normRage = Math.min(1, adjRage / 3);
    const normReread = Math.min(1, adjReread / 10);
    const normTab = Math.min(1, tabRate / 2);
    
    const frictionScore = 0.30 * normScroll + 0.25 * normRage + 0.20 * normReread + 0.15 * normTab + 0.10 * 0;
    
    return {
      friction: Math.min(1, frictionScore),
      components: { scroll: normScroll, rage: normRage, reread: normReread, tab: normTab }
    };
  }
  
  computeFinalScore() {
    const frictionData = this.computeFrictionScore();
    const combinedScore = (this.backendScore * 0.6) + (frictionData.friction * 0.4);
    
    this.scoreHistory.push(combinedScore);
    if (this.scoreHistory.length > this.SMOOTHING_WINDOW) this.scoreHistory.shift();
    
    const smoothedScore = this.scoreHistory.reduce((a, b) => a + b, 0) / this.scoreHistory.length;
    
    return { finalScore: smoothedScore, frictionData: frictionData };
  }
  
  async updateBackendScore() {
    try {
      const windowSize = 10;
      const features = {
        scroll_rate: this.scrollHistory.length / windowSize,
        click_rate: (this.rageClickCount * 2) / windowSize,
        rage_click_count: this.rageClickCount,
        tab_switch_count: this.tabSwitchCount,
        avg_paragraph_read_time: this.paragraphReadTimes.length > 0 
          ? this.paragraphReadTimes.reduce((a, b) => a + b, 0) / this.paragraphReadTimes.length / 1000 : 3.0,
        timestamp: Date.now()
      };
      
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(features)
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const result = await response.json();
      this.backendScore = result.overload_score;
      this.backendAvailable = true;
    } catch (error) {
      this.backendScore = 0.5;
      this.backendAvailable = false;
    }
  }
  
  resetCounters() {
    this.scrollHistory = [];
    this.rereadCount = 0;
    this.rageClickCount = 0;
    this.tabSwitchCount = 0;
    this.paragraphReadTimes = [];
  }
  
  getBackendStatus() { return this.backendAvailable; }
  isCalibrating() { return this.calibrationMode; }
}
