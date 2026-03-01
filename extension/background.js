// ============================================
// BACKGROUND.JS - Service Worker
// Runs in background, handles extension lifecycle
// ============================================

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('✅ NeuroAdaptiveOS extension installed');
  
  // Initialize storage with default settings
  chrome.storage.local.set({
    enabled: true,
    totalPredictions: 0
  });
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PREDICTION_RECEIVED') {
    // Update statistics when prediction is received
    chrome.storage.local.get(['totalPredictions'], (result) => {
      chrome.storage.local.set({
        totalPredictions: (result.totalPredictions || 0) + 1
      });
    });
  }
  
  return true; // keep message channel open for async response
});

console.log('✅ NeuroAdaptiveOS background service worker loaded');
