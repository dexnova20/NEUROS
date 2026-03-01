// ============================================
// PERSONALIZATION ENGINE - User Preferences & Learning
// ============================================

export class PersonalizationEngine {
  constructor() {
    this.operatingMode = 'adaptive';
    this.userPreferences = {
      scale: 1.0,
      lineHeight: 1.5,
      letterSpacing: 0,
      contrast: 1.0,
      fontFamily: 'default',
      focusMode: false,
      dyslexiaFont: false
    };
    this.manualAdjustmentCount = 0;
    this.lastManualAdjustmentTime = 0;
    this.currentUser = null;
  }
  
  async loadPreferences() {
    try {
      const result = await chrome.storage.local.get(['userPreferences', 'operatingMode', 'currentUser']);
      if (result.userPreferences) {
        this.userPreferences = { ...this.userPreferences, ...result.userPreferences };
        console.log('✅ Loaded preferences:', this.userPreferences);
      }
      if (result.operatingMode) {
        this.operatingMode = result.operatingMode;
      }
      if (result.currentUser) {
        this.currentUser = result.currentUser;
      }
    } catch (error) {
      console.log('⚠️ Could not load preferences');
    }
  }
  
  async savePreferences() {
    try {
      await chrome.storage.local.set({ 
        userPreferences: this.userPreferences,
        operatingMode: this.operatingMode
      });
      console.log('💾 Saved preferences');
    } catch (error) {
      console.log('⚠️ Could not save preferences');
    }
  }
  
  async saveProfileToBackend(profileData) {
    if (!this.currentUser) return;
    
    try {
      await fetch('http://localhost:5000/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: this.currentUser.user_id,
          ...profileData
        })
      });
      
      this.currentUser.profile = { ...this.currentUser.profile, ...profileData };
      await chrome.storage.local.set({ currentUser: this.currentUser });
      console.log('💾 Profile synced to backend');
    } catch (error) {
      console.log('⚠️ Profile sync failed');
    }
  }
  
  applyPreset(presetName) {
    switch(presetName) {
      case 'low-vision':
        this.userPreferences = { scale: 1.25, lineHeight: 1.9, letterSpacing: 0.08, contrast: 1.3, fontFamily: 'default', focusMode: false, dyslexiaFont: false };
        break;
      case 'dyslexia':
        this.userPreferences = { scale: 1.15, lineHeight: 1.8, letterSpacing: 0.12, contrast: 1.1, fontFamily: 'default', focusMode: false, dyslexiaFont: true };
        break;
      case 'high-contrast':
        this.userPreferences = { scale: 1.1, lineHeight: 1.7, letterSpacing: 0.05, contrast: 1.5, fontFamily: 'default', focusMode: false, dyslexiaFont: false };
        break;
      case 'focus':
        this.userPreferences = { ...this.userPreferences, focusMode: true };
        break;
      default:
        this.userPreferences = { scale: 1.0, lineHeight: 1.5, letterSpacing: 0, contrast: 1.0, fontFamily: 'default', focusMode: false, dyslexiaFont: false };
    }
    this.savePreferences();
    console.log('🎨 Applied preset:', presetName);
  }
  
  trackManualAdjustment() {
    const now = Date.now();
    if (now - this.lastManualAdjustmentTime < 300000) {
      this.manualAdjustmentCount++;
      if (this.manualAdjustmentCount >= 3) {
        this.userPreferences.scale = Math.min(1.5, this.userPreferences.scale + 0.05);
        this.userPreferences.lineHeight = Math.min(2.2, this.userPreferences.lineHeight + 0.1);
        this.savePreferences();
        console.log('🧠 Learning: Updated baseline preferences');
        this.manualAdjustmentCount = 0;
      }
    }
    this.lastManualAdjustmentTime = now;
  }
  
  setMode(mode) {
    this.operatingMode = mode;
    this.savePreferences();
    console.log(`🔄 Mode: ${mode}`);
  }
  
  getMode() {
    return this.operatingMode;
  }
  
  getPreferences() {
    return this.userPreferences;
  }
  
  updatePreference(key, value) {
    this.userPreferences[key] = value;
  }
}
