// ============================================
// PERSONALIZATION ENGINE - Platform-Agnostic Core
// ============================================
// Universal preference management and learning

class PersonalizationEngine {
  constructor(storageAdapter) {
    this.storage = storageAdapter;
    this.operatingMode = 'adaptive';
    this.userPreferences = {
      scale: 1.0,
      lineHeight: 1.5,
      letterSpacing: 0,
      contrast: 1.0,
      fontFamily: 'default'
    };
  }
  
  async loadPreferences() {
    try {
      const result = await this.storage.getStorage(['userPreferences', 'operatingMode']);
      if (result.userPreferences) {
        this.userPreferences = { ...this.userPreferences, ...result.userPreferences };
      }
      if (result.operatingMode) {
        this.operatingMode = result.operatingMode;
      }
    } catch (error) {
      console.log('⚠️ Could not load preferences');
    }
  }
  
  async savePreferences() {
    try {
      await this.storage.setStorage({ 
        userPreferences: this.userPreferences,
        operatingMode: this.operatingMode
      });
    } catch (error) {
      console.log('⚠️ Could not save preferences');
    }
  }
  
  applyPreset(presetName) {
    switch(presetName) {
      case 'low-vision':
        this.userPreferences = { scale: 1.25, lineHeight: 1.9, letterSpacing: 0.08, contrast: 1.3, fontFamily: 'default' };
        break;
      case 'dyslexia':
        this.userPreferences = { scale: 1.15, lineHeight: 1.8, letterSpacing: 0.12, contrast: 1.1, fontFamily: 'default' };
        break;
      case 'high-contrast':
        this.userPreferences = { scale: 1.1, lineHeight: 1.7, letterSpacing: 0.05, contrast: 1.5, fontFamily: 'default' };
        break;
      default:
        this.userPreferences = { scale: 1.0, lineHeight: 1.5, letterSpacing: 0, contrast: 1.0, fontFamily: 'default' };
    }
    this.savePreferences();
  }
  
  setMode(mode) {
    this.operatingMode = mode;
    this.savePreferences();
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

window.PersonalizationEngine = PersonalizationEngine;
