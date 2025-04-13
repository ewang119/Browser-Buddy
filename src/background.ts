import { loadPetData } from "./popup/storage"

// Set alarm when extension installs
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('checkBreak', { periodInMinutes: 1 });

  // Load pet data from storage
  chrome.storage.local.get(['petData'], async (result) => {
    let petData = result.petData;

    if (!petData) {
      try {
        petData = await loadPetData(); // Wait for the Promise to resolve
      } catch (error) {
        console.error('Failed to load pet data:', error);
        petData = null; // Fallback to null if loading fails
      }
    }

    const timerSetPet = {
      ...petData,
      nextBreak: Date.now() + 45 * 60 * 1000, // Set next break to 30 seconds from now, should be 25 after testing
      lastBreak: Date.now(), // Set last break to now
      isOnBreak: false, // Set isOnBreak to false
    };

    chrome.storage.local.set({ petData: timerSetPet }, () => {
      console.log('Pet data initialized:', timerSetPet);
    });
  });
});

// Run every minute
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkBreak') {
    chrome.storage.local.get(['petData'], (result) => {
      const petData = result.petData
      if (!petData) return

      const now = Date.now()

      // If break time has arrived and pet is not already on break
      if (!petData.isOnBreak && now >= petData.nextBreak) {
        // Change extension icon to alert the user
        chrome.action.setIcon({ path: 'warning.png' })

      }

      else {
        // Return icon to normal
        chrome.action.setIcon({ path: 'icon128.png' })
      }
    })
  }
})


chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'SET_ICON') {
    chrome.action.setIcon({ path: 'icon128.png' });
    sendResponse({ success: true }); // Optional, but recommended
  }

  return true;
});