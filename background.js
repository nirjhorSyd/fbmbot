chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { action, product } = message;
  console.log('Received product:', product);

  if (action === 'upload') {
    console.log('Action is fired');

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        const activeTab = tabs[0];
        console.log('Active tab:', activeTab);

        const allowedDomains = ['https://www.facebook.com/', 'https://portal.rbnapply.com/'];
        if (allowedDomains.some((domain) => activeTab.url.startsWith(domain))) {
          console.log('Landed on the perfect spot');

          chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            func: (product) => {
              // Helper function to set the value of an input based on its label
              const setInputValueByLabel = (labelText, value) => {
                const labelSpan = Array.from(document.querySelectorAll('span'))
                  .find((span) => span.textContent.trim() === labelText);
                if (labelSpan) {
                  const input = labelSpan.closest('label')?.querySelector('input, textarea');
                  if (input) {
                    input.value = value;
                    const event = new Event('input', { bubbles: true });
                    input.dispatchEvent(event);
                    console.log(`${labelText} field updated successfully with value:`, value);
                  } else {
                    console.error(`${labelText} input field not found.`);
                  }
                } else {
                  console.error(`Label with text "${labelText}" not found.`);
                }
              };

              // Function to wait for an element to appear and click it
              const waitForElementAndClick = async (selector) => {
                const timeout = 10000;
                const pollInterval = 100;
                const startTime = Date.now();

                return new Promise((resolve, reject) => {
                  const interval = setInterval(() => {
                    const element = document.querySelector(selector);
                    if (element) {
                      clearInterval(interval);
                      element.click();
                      console.log(`Element with selector "${selector}" clicked successfully.`);
                      resolve();
                    } else if (Date.now() - startTime > timeout) {
                      clearInterval(interval);
                      reject(`Element with selector "${selector}" not found or not visible within ${timeout}ms`);
                    }
                  }, pollInterval);
                });
              };

              // Update the Title field
              setInputValueByLabel('Title', product.name);

              // Update the Price field
              setInputValueByLabel('Price', product.price);

              // Handle image upload
              const uploadImage = async (imageUrl) => {
                try {
                  const fileInput = document.querySelector('input[type="file"]');
                  if (fileInput && imageUrl) {
                    console.log('Attempting to fetch image from URL:', imageUrl);

                    // Fetch the image as a blob
                    const response = await fetch(imageUrl);
                    const blob = await response.blob();
                    console.log('Image blob fetched:', blob);

                    // Create a File object from the blob
                    const file = new File([blob], 'product_image.jpg', { type: blob.type });
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);

                    // Assign the file to the input element
                    fileInput.files = dataTransfer.files;

                    // Dispatch a change event to trigger any associated listeners
                    const event = new Event('change', { bubbles: true });
                    fileInput.dispatchEvent(event);

                    console.log('Image uploaded successfully!');
                  } else {
                    console.error('File input field not found or no image URL provided.');
                  }
                } catch (error) {
                  console.error('Failed to fetch or upload image:', error);
                }
              };

              // Call the image upload function
              uploadImage(product.imageUrl);

              // Handle Category dropdown selection
              const selectCategory = (categoryName, callback) => {
                const categorySpan = Array.from(document.querySelectorAll('span'))
                  .find((span) => span.textContent.trim() === 'Category');
                if (categorySpan) {
                  const categoryLabel = categorySpan.closest('label');
                  if (categoryLabel) {
                    categoryLabel.click(); // Click the category label to open the dropdown
                    console.log('Category dropdown clicked.');

                    // Wait for the dropdown to open and then select the option
                    setTimeout(() => {
                      const categoryOption = Array.from(document.querySelectorAll('span'))
                        .find((span) => span.textContent.trim() === categoryName);
                      if (categoryOption) {
                        categoryOption.click();
                        console.log(`Category "${categoryName}" selected successfully.`);
                        if (callback) callback(); // Proceed to the next step after category selection
                      } else {
                        console.error(`Category "${categoryName}" not found in dropdown.`);
                      }
                    }, 2000);
                  } else {
                    console.error('Category label not found.');
                  }
                } else {
                  console.error('Category span with text "Category" not found.');
                }
              };

              // Handle Condition dropdown selection
              const selectCondition = (callback) => {
                const conditionLabel = document.querySelector('label[aria-label="Condition"]');
                if (conditionLabel) {
                  conditionLabel.click(); // Click the condition label to open the dropdown
                  console.log('Condition dropdown clicked.');

                  // Wait and check for the expanded dropdown
                  setTimeout(() => {
                    const conditionOption = Array.from(document.querySelectorAll('span'))
                      .find((span) => span.textContent.trim() === 'Used - Like New'); // Change text as needed

                    if (conditionOption) {
                      conditionOption.click(); // Click the desired condition option
                      console.log('Condition "Used - Like New" selected successfully.');
                      if (callback) callback(); // Proceed to the next step
                    } else {
                      console.error('Desired condition option not found.');
                    }
                  }, 1500); // Delay to ensure dropdown is expanded
                } else {
                  console.error('Condition label not found.');
                }
              };

              // Update Brand and Description after selecting Category and Condition
              const updateBrandAndDescription = () => {
                setInputValueByLabel('Brand', product.brand);
                setInputValueByLabel('Description', product.description);
                console.log('Brand and Description updated successfully.');

                // Click the Next button
                waitForElementAndClick('div[aria-label="Next"][role="button"]')
                  .then(() => {
                    console.log('Next button clicked successfully.');

                    // Wait for the Publish button and click it
                    waitForElementAndClick('div[aria-label="Publish"][role="button"]')
                      .then(() => {
                        console.log('Publish button clicked successfully.');
                      })
                      .catch((error) => {
                        console.error('Error:', error);
                      });
                  })
                  .catch((error) => {
                    console.error('Error clicking Next button:', error);
                  });
              };

              // Start the process: Select Category -> Condition -> Brand & Description
              selectCategory('Tools', () => {
                selectCondition(() => {
                  updateBrandAndDescription();
                });
              });

              // Debugging: Log the completed actions
              console.log('Product upload actions completed:', product);
            },
            args: [product],
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

    return true; // Keep the message channel open for async response
  }
});
