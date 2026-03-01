// Background service worker for DigiCare Extension

chrome.action.onClicked.addListener((tab: chrome.tabs.Tab) => {
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_SIDEBAR' });
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message: any, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  if (message.type === 'GET_PATIENT_DATA') {
    // In production, this would call the actual ABHA API
    fetchPatientData(message.abhaId)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep the message channel open for async response
  }
});

async function fetchPatientData(abhaId: string) {
  // Simulated API call - replace with actual ABHA API integration
  // The actual implementation would use the ABHA Health Information Exchange APIs

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Return mock data for development
  return {
    abhaId,
    fetched: true,
    timestamp: new Date().toISOString()
  };
}

console.log('DigiCare Background Service Worker initialized');
