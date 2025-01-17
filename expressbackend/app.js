const express = require('express');
const cors = require('cors');
const app = express();

// Use CORS middleware
app.use(cors());

// Example endpoint
app.get('/products', (req, res) => {
  res.json([
    {
      id: 1,
      name: "SwiftStride Pro Running Shoes",
      price: 455,
      brand: "Lotto",
      description: "Take your performance to the next level with the SwiftStride Pro Running Shoes.",
      imageUrl: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHNob2VzfGVufDB8fDB8fHww"
    },
    {
      id: 2,
      name: "LuxeWalk Leather Loafers",
      price: 299,
      brand: "Adidas",
      description: "Elevate your everyday look with LuxeWalk Leather Loafers. Crafted from premium full-grain leather, these loafers combine timeless style with unmatched comfort.",
      imageUrl: "https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8c2hvZXN8ZW58MHx8MHx8fDA%3D"
    }
  ]);
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
