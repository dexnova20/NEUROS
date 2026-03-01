// Focus Mode - Deep concentration assistant
let focusModeActive = false;

function toggleFocusMode() {
  focusModeActive = !focusModeActive;
  
  if (focusModeActive) {
    applyFocusMode();
  } else {
    removeFocusMode();
  }
  
  return focusModeActive;
}

function detectMainContent() {
  // ML-based heuristics for main content detection
  const candidates = [];
  
  // Score elements by content density
  document.querySelectorAll('article, main, [role="main"], .content, .post, .article').forEach(el => {
    const textLength = el.innerText?.length || 0;
    const linkDensity = el.querySelectorAll('a').length / Math.max(1, textLength / 100);
    const paragraphs = el.querySelectorAll('p').length;
    
    if (textLength > 200 && linkDensity < 0.5 && paragraphs > 2) {
      candidates.push({ el, score: textLength + (paragraphs * 50) - (linkDensity * 100) });
    }
  });
  
  // Return highest scoring element
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0]?.el || document.querySelector('main, article, [role="main"]');
}

function detectAds() {
  const adSelectors = [
    'ins.adsbygoogle',
    'iframe[src*="doubleclick"]',
    'iframe[src*="googlesyndication"]',
    'iframe[src*="adservice"]',
    '[data-ad-slot]',
    '[data-google-query-id]',
    'div[id^="google_ads_"]',
    'div[id^="div-gpt-ad"]'
  ];
  
  return document.querySelectorAll(adSelectors.join(','));
}

function applyFocusMode() {
  // Detect main content
  const mainContent = detectMainContent();
  if (mainContent) {
    mainContent.setAttribute('data-neuro-main', 'true');
    
    // Mark important elements in main content
    mainContent.querySelectorAll('h1, h2, h3, h4, strong, b, em').forEach(el => {
      el.setAttribute('data-neuro-important', 'true');
    });
  }
  
  // Mark ads
  detectAds().forEach(ad => {
    ad.setAttribute('data-neuro-ad', 'true');
  });
  
  // Inject focus styles
  const style = document.createElement('style');
  style.id = 'neuro-focus-mode';
  style.textContent = `
    /* Blur ONLY ads */
    [data-neuro-ad="true"] {
      filter: blur(12px) !important;
      opacity: 0.2 !important;
      pointer-events: none !important;
      transition: filter 0.4s ease, opacity 0.4s ease !important;
    }
    
    /* Highlight main content */
    [data-neuro-main="true"] {
      box-shadow: 0 0 0 2px rgba(107, 138, 255, 0.4), 0 0 20px rgba(107, 138, 255, 0.2) !important;
      border-radius: 8px !important;
      transition: box-shadow 0.4s ease !important;
    }
    
    /* Emphasize important content */
    [data-neuro-important="true"] {
      font-weight: 700 !important;
      text-decoration: underline !important;
      text-decoration-color: rgba(107, 138, 255, 0.5) !important;
      text-decoration-thickness: 2px !important;
      text-underline-offset: 3px !important;
      transition: all 0.3s ease !important;
    }
  `;
  
  document.head.appendChild(style);
  console.log('Focus Mode: Activated');
}

function removeFocusMode() {
  const style = document.getElementById('neuro-focus-mode');
  if (style) style.remove();
  
  // Remove markers
  document.querySelectorAll('[data-neuro-main]').forEach(el => el.removeAttribute('data-neuro-main'));
  document.querySelectorAll('[data-neuro-ad]').forEach(el => el.removeAttribute('data-neuro-ad'));
  document.querySelectorAll('[data-neuro-important]').forEach(el => el.removeAttribute('data-neuro-important'));
  
  console.log('Focus Mode: Deactivated');
}

function isFocusModeActive() {
  return focusModeActive;
}
