// ============================================
// CHROME ADAPTER - Browser-Specific API Layer
// ============================================
// Isolates Chrome-specific APIs for cross-browser compatibility

class ChromeAdapter {
  // Storage API
  async getStorage(keys) {
    return await chrome.storage.local.get(keys);
  }
  
  async setStorage(data) {
    return await chrome.storage.local.set(data);
  }
  
  // Idle callback (fallback for browsers without requestIdleCallback)
  requestIdle(callback, options) {
    if (typeof requestIdleCallback !== 'undefined') {
      return requestIdleCallback(callback, options);
    }
    return setTimeout(callback, 1);
  }
  
  // Animation frame
  requestFrame(callback) {
    return requestAnimationFrame(callback);
  }
  
  // Platform detection
  getPlatform() {
    return 'chrome';
  }
  
  // Feature detection
  supportsBackdropFilter() {
    return CSS.supports('backdrop-filter', 'blur(10px)') || 
           CSS.supports('-webkit-backdrop-filter', 'blur(10px)');
  }
}

// Export singleton instance
window.browserAdapter = new ChromeAdapter();
