// ============================================
// SCORING ENGINE - Platform-Agnostic Core
// ============================================
// Universal friction detection and baseline calibration

class ScoringEngine {
  constructor() {
    this.scrollHistory = [];
    this.rereadCount = 0;
    this.lastScrollY = 0;
    this.rageClickCount = 0;
    this.tabSwitchCount = 0;
    
    this.calibrationMode = true;
    this.calibrationStartTime = Date.now();
    this.CALIBRATION_DURATION = 20000;
    this.baselineMetrics = { scrollRate: 0, rageClickRate: 0, rereadRate: 0, samples: 0 };
    
    this.scoreHistory = [];
    this.backendScore = 0.2;
  }
  
  updateBaseline() {
    if (!this.calibrationMode) return;
    
    const elapsed = Date.now() - this.calibrationStartTime;
    if (elapsed >= this.CALIBRATION_DURATION) {
      this.calibrationMode = false;
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
    if (this.scoreHistory.length > 5) this.scoreHistory.shift();
    
    const smoothedScore = this.scoreHistory.reduce((a, b) => a + b, 0) / this.scoreHistory.length;
    
    return { finalScore: smoothedScore, frictionData };
  }
  
  resetCounters() {
    this.scrollHistory = [];
    this.rereadCount = 0;
    this.rageClickCount = 0;
    this.tabSwitchCount = 0;
  }
  
  recalibrate() {
    this.calibrationMode = true;
    this.calibrationStartTime = Date.now();
    this.baselineMetrics = { scrollRate: 0, rageClickRate: 0, rereadRate: 0, samples: 0 };
  }
}

window.ScoringEngine = ScoringEngine;
