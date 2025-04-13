// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message/*, sender, sendResponse*/) => {
  if (message.type === 'SHOW_NOTIFICATION') {
    const { title, message: notificationMessage, iconUrl } = message;
    
    chrome.notifications.create({
      type: 'basic',
      iconUrl: iconUrl,
      title: title,
      message: notificationMessage,
      priority: 2,
      requireInteraction: true,
      silent: false
    }, (notificationId) => {
      if (chrome.runtime.lastError) {
        console.error('Error creating notification:', chrome.runtime.lastError);
      } else {
        console.log('Notification created with ID:', notificationId);
      }
    });
  }
}); 