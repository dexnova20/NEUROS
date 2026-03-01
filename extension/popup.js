// ============================================
// POPUP.JS - Controls the extension popup UI
// ============================================

// Load statistics when popup opens
document.addEventListener('DOMContentLoaded', () => {
  // Get total predictions from storage
  chrome.storage.local.get(['totalPredictions'], (result) => {
    document.getElementById('totalPredictions').textContent = result.totalPredictions || 0;
  });
  
  // Check backend connection status
  checkBackendStatus();
});

// Test backend connection
document.getElementById('testBtn').addEventListener('click', async () => {
  const btn = document.getElementById('testBtn');
  btn.textContent = 'Testing...';
  btn.disabled = true;
  
  try {
    const response = await fetch('http://localhost:5000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scroll_rate: 1.5,
        click_rate: 0.3,
        rage_click_count: 0,
        tab_switch_count: 1,
        avg_paragraph_read_time: 3.2,
        timestamp: Date.now()
      })
    });
    
    const result = await response.json();
    alert(`✅ Backend Connected!\nCognitive Load Score: ${result.overload_score.toFixed(2)}`);
    document.getElementById('backendStatus').textContent = '✅ Connected';
    document.getElementById('backendStatus').style.color = '#2e7d32';
  } catch (error) {
    alert('❌ Backend not responding. Make sure Flask server is running on port 5000.');
    document.getElementById('backendStatus').textContent = '❌ Disconnected';
    document.getElementById('backendStatus').style.color = '#c62828';
  }
  
  btn.textContent = 'Test Backend Connection';
  btn.disabled = false;
});

// Check if backend is running
async function checkBackendStatus() {
  try {
    const response = await fetch('http://localhost:5000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: true })
    });
    
    if (response.ok) {
      document.getElementById('backendStatus').textContent = '✅ Connected';
      document.getElementById('backendStatus').style.color = '#2e7d32';
    }
  } catch (error) {
    document.getElementById('backendStatus').textContent = '❌ Disconnected';
    document.getElementById('backendStatus').style.color = '#c62828';
  }
}
