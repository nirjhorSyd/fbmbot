chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { action, product } = message;
  console.log('Received product:', product);

  if (action === 'upload') {
    console.log('Action is fired');

    // Query the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        const activeTab = tabs[0];
        console.log('Active tab:', activeTab);

        // Check if the URL matches allowed domains
        const allowedDomains = ['https://www.facebook.com/', 'https://portal.rbnapply.com/'];
        if (allowedDomains.some((domain) => activeTab.url.startsWith(domain))) {
          console.log('Landed on the perfect spot');

          // Execute the script in the active tab
          chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            func: (product) => {
              // Populate form fields
              const titleField = document.querySelector('[placeholder="Title"]');
              const priceField = document.querySelector('[placeholder="Price"]');
              const descriptionField = document.querySelector('[placeholder="Description"]');
              const imageInput = document.querySelector('input[type="file"]'); // Adjust selector as needed
              const submitButton = document.querySelector('[type="submit"]'); // Adjust selector as needed

              const email = document.querySelector('[placeholder="Email address or phone number"]');
              const pass = document.querySelector('[type="password"]');
              const loginbtn = document.querySelector('[name="login"]');
              console.log(loginbtn);
              //console.log(pass);
              //console.log(email);
              
              // Populate title, price, and description fields
              if (titleField) titleField.value = product.name;
              if (priceField) priceField.value = product.price;
              if (descriptionField) descriptionField.value = product.description;

              if (email) email.value = "sydulislammazumder@gmail.com";
              if (pass) pass.value = "I am batman";

              if (loginbtn) {
                
                loginbtn.click();

              }
              console.log(product.imageUrl)
              // Check if product.imageUrl exists before attempting to upload image
              if (imageInput && product.imageUrl) {
                console.log('Attempting to fetch image from URL:', product.imageUrl);
                fetch(product.imageUrl)
                  .then((response) => response.blob())
                  .then((blob) => {
                    console.log('Image blob fetched:', blob);
                    const file = new File([blob], 'product_image.jpg', { type: blob.type });
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    imageInput.files = dataTransfer.files;

                    // Trigger change event
                    const event = new Event('change', { bubbles: true });
                    imageInput.dispatchEvent(event);

                    console.log('Image uploaded successfully!');
                  })
                  .catch((error) => {
                    console.error('Failed to fetch image:', error);
                  });
              } else {
                console.error('No image URL provided.');
              }

              // Ensure submit button is available before clicking
              // if (submitButton) {
              //   submitButton.click();
              //   console.log('Submit button clicked!');
              // } else {
              //   console.error('Submit button not found on this page.');
              // }
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
