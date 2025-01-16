document.addEventListener('DOMContentLoaded', async () => {
  const productList = document.getElementById('productList');

  try {
    const response = await fetch('http://localhost:3000/products');
    const products = await response.json();

    products.forEach(product => {
      // Create product item
      const li = document.createElement('li');

      // Product image
      const img = document.createElement('img');
      img.src = product.imageUrl || 'default-image.png'; 
      img.alt = product.name;

      // Product details
      const productInfo = document.createElement('div');
      productInfo.className = 'product-info';
      productInfo.innerHTML = `
        <h4>${product.name}</h4>
        <p>Price: ${product.price}</p>
        <p>${product.description}</p>
      `;

      // Upload button
      const button = document.createElement('button');
      button.textContent = 'Upload';
      button.onclick = () => uploadProduct(product);

      // Append elements to the list item
      li.appendChild(img);
      li.appendChild(productInfo);
      li.appendChild(button);

      // Append list item to the product list
      productList.appendChild(li);
    });
  } catch (error) {
    console.error('Error fetching products:', error);
  }
});

async function uploadProduct(product) {
  
  chrome.runtime.sendMessage({ action: 'upload', product });
}
