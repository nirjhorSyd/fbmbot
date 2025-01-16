chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { action, product } = message;
  console.log(product);

  if (action === 'upload') {
    console.log("Action is fired");
    // Query the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        const activeTab = tabs[0];
        console.log(activeTab);

        // Check if the URL matches allowed domains
        const allowedDomains = ['https://www.facebook.com/', 'https://portal.rbnapply.com/'];
        if (allowedDomains.some((domain) => activeTab.url.startsWith(domain))) {
          console.log("Landed on the perfect spot")
          chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            func: (product) => {
              const titleField = document.querySelector('[placeholder="Title"]');
              const priceField = document.querySelector('[placeholder="Price"]');
              const descriptionField = document.querySelector('[placeholder="Description"]');

              const submitButton = document.querySelector('[type="submit"]'); // Adjust selector as needed
            
              if (titleField) titleField.value = product.name;
              if (priceField) priceField.value = product.price;
              if (descriptionField) descriptionField.value = product.description;
              if (submitButton) {
                console.log(submitButton);
                submitButton.click();
                console.log('Submit button clicked!');
              } else {
                console.error('Submit button not found on this page.');
              }
            },
            args: [product]
          }, () => {
            if (chrome.runtime.lastError) {
              console.error('Script execution error:', chrome.runtime.lastError.message);
              sendResponse({ error: chrome.runtime.lastError.message });
            } else {
              sendResponse({ success: true });
            }
          });
        } else {
          console.error('URL not allowed:', activeTab.url);
          sendResponse({ error: 'This action is not allowed on the current URL.' });
        }
      } else {
        console.error('No active tab found.');
        sendResponse({ error: 'No active tab found.' });
      }
    });

    // Return true to keep the message channel open for async response
    return true;
  }
});
