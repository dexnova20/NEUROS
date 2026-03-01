// ============================================
// OVERLAY MANAGER - Background & Visual Adaptation
// ============================================

export class OverlayManager {
  constructor() {
    this.bgOverlay = null;
    this.focusOverlay = null;
    this.initialized = false;
  }
  
  initialize() {
    if (this.initialized) return;
    
    this._createBackgroundOverlay();
    this._injectStyles();
    this.initialized = true;
    console.log('✅ Overlay system initialized');
  }
  
  _injectStyles() {
    if (document.getElementById('neuro-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'neuro-styles';
    style.textContent = `
      :root {
        --neuro-scale: 1;
        --neuro-line: 1.5;
        --neuro-spacing: 0em;
        --neuro-contrast: 1;
      }
      
      p, span, div, li, td, th, article, section, h1, h2, h3, h4, h5, h6, a, label, button {
        font-size: calc(1em * var(--neuro-scale)) !important;
        line-height: var(--neuro-line) !important;
        letter-spacing: var(--neuro-spacing) !important;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      
      body {
        filter: contrast(var(--neuro-contrast));
        transition: filter 0.4s ease;
      }
      
      #neuro-host, #neuro-host *, #neuro-bg-overlay, #neuro-focus-overlay {
        font-size: initial !important;
        line-height: initial !important;
        letter-spacing: initial !important;
        transition: none !important;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  _createBackgroundOverlay() {
    if (this.bgOverlay) return;
    
    this.bgOverlay = document.createElement('div');
    this.bgOverlay.id = 'neuro-bg-overlay';
    this.bgOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 1;
      opacity: 0;
      background: transparent;
      transition: opacity 0.4s ease, background 0.4s ease;
    `;
    
    document.body.appendChild(this.bgOverlay);
  }
  
  updateBackground(state) {
    if (!this.bgOverlay) this._createBackgroundOverlay();
    
    if (state === "high") {
      this.bgOverlay.style.background = 'rgba(220, 230, 255, 0.25)';
      this.bgOverlay.style.opacity = '1';
    } else if (state === "mild") {
      this.bgOverlay.style.background = 'rgba(230, 240, 255, 0.15)';
      this.bgOverlay.style.opacity = '1';
    } else {
      this.bgOverlay.style.opacity = '0';
    }
  }
  
  applyTypography(scale, lineHeight, spacing) {
    const root = document.documentElement;
    root.style.setProperty('--neuro-scale', scale);
    root.style.setProperty('--neuro-line', lineHeight);
    root.style.setProperty('--neuro-spacing', spacing);
  }
  
  applyContrast(contrast) {
    const root = document.documentElement;
    root.style.setProperty('--neuro-contrast', contrast);
  }
  
  enableFocusMode() {
    if (this.focusOverlay) return;
    
    this.focusOverlay = document.createElement('div');
    this.focusOverlay.id = 'neuro-focus-overlay';
    this.focusOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 2;
      background: radial-gradient(circle at 50% 40%, transparent 30%, rgba(0, 0, 0, 0.4) 70%);
      opacity: 0;
      transition: opacity 0.6s ease;
    `;
    
    document.body.appendChild(this.focusOverlay);
    setTimeout(() => this.focusOverlay.style.opacity = '1', 50);
    console.log('🎯 Focus mode enabled');
  }
  
  disableFocusMode() {
    if (!this.focusOverlay) return;
    
    this.focusOverlay.style.opacity = '0';
    setTimeout(() => {
      if (this.focusOverlay) {
        this.focusOverlay.remove();
        this.focusOverlay = null;
      }
    }, 600);
    console.log('🎯 Focus mode disabled');
  }
}
