// Import required modules
const express = require('express');
const { v4: uuidv4 } = require('uuid');

// Custom middleware 
const logger = require('./middleware/logger');
const authenticate = require('./middleware/authenticate');
const { validateProduct } = require('./middleware/validators');
const errorHandler = require('./middleware/errorHandler');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(express.json());
app.use(logger);
app.use(authenticate);

// Sample in-memory products database
let products = [
  { id: '1', name: 'Laptop', description: 'High-performance laptop with 16GB RAM', price: 1200, category: 'electronics', inStock: true },
  { id: '2', name: 'Smartphone', description: 'Latest model with 128GB storage', price: 800, category: 'electronics', inStock: true },
  { id: '3', name: 'Coffee Maker', description: 'Programmable coffee maker with timer', price: 50, category: 'kitchen', inStock: false }
];

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Product API! Go to /api/products to see all products.');
});

// Get all products with filters, pagination, and search
app.get('/api/products', (req, res) => {
  let result = [...products];
  const { category, search, page = 1, limit = 10 } = req.query;

  if (category) {
    result = result.filter(product => product.category === category);
  }

  if (search) {
    result = result.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Pagination
  const total = result.length;
  const start = (page - 1) * limit;
  const end = start + Number(limit);
  result = result.slice(start, end);

  res.json({
    success: true,
    data: result,
    meta: { total, page, limit }
  });
});

// Get a specific product by ID
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// Create a new product
app.post('/api/products', validateProduct, (req, res) => {
  const newProduct = { id: uuidv4(), ...req.body };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// Update a product by ID
app.put('/api/products/:id', validateProduct, (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  if (productIndex === -1) return res.status(404).json({ error: 'Product not found' });

  products[productIndex] = { ...products[productIndex], ...req.body };
  res.json(products[productIndex]);
});

// Delete a product by ID
app.delete('/api/products/:id', (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  if (productIndex === -1) return res.status(404).json({ error: 'Product not found' });

  products.splice(productIndex, 1);
  res.status(204).send();
});

// Get product statistics
app.get('/api/products/stats', (req, res) => {
  const stats = {};
  products.forEach(p => {
    stats[p.category] = stats[p.category] || { total: 0, inStock: 0, outOfStock: 0 };
    stats[p.category].total++;
    p.inStock ? stats[p.category].inStock++ : stats[p.category].outOfStock++;
  });

  res.json(stats);
});

// Custom error handling middleware
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
