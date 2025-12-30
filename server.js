const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Serve main pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes
app.get('/api/products', async (req, res) => {
    try {
        const data = await fs.readFile(path.join(__dirname, 'public', 'data', 'products.json'), 'utf8');
        const products = JSON.parse(data);
        
        // Filter by category if provided
        if (req.query.category) {
            const filtered = products.products.filter(p => 
                p.category.includes(req.query.category)
            );
            res.json({ products: filtered, categories: products.categories });
        } else {
            res.json(products);
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to load products' });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const data = await fs.readFile(path.join(__dirname, 'public', 'data', 'products.json'), 'utf8');
        const products = JSON.parse(data);
        const product = products.products.find(p => p.id === req.params.id);
        
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to load product' });
    }
});

// Simulated checkout endpoint
app.post('/api/checkout', (req, res) => {
    // In a real application, this would integrate with Stripe/PayPal
    const { items, total, customer } = req.body;
    
    // Simulate payment processing
    setTimeout(() => {
        const success = Math.random() > 0.1; // 90% success rate for simulation
        
        if (success) {
            res.json({
                success: true,
                orderId: 'ORD-' + Date.now(),
                message: 'Payment successful! Order has been placed.',
                customer: customer
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Payment failed. Please try again.'
            });
        }
    }, 1500);
});

// Admin endpoints
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    // Simple authentication (in production, use proper authentication)
    if (username === 'admin@velvetvogue.com' && password === 'admin123') {
        res.json({ success: true, token: 'admin-token-' + Date.now() });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

app.post('/api/admin/products', async (req, res) => {
    try {
        const data = await fs.readFile(path.join(__dirname, 'public', 'data', 'products.json'), 'utf8');
        const products = JSON.parse(data);
        
        const newProduct = {
            id: 'VV' + (products.products.length + 1).toString().padStart(3, '0'),
            ...req.body,
            createdAt: new Date().toISOString()
        };
        
        products.products.push(newProduct);
        
        await fs.writeFile(
            path.join(__dirname, 'public', 'data', 'products.json'),
            JSON.stringify(products, null, 2)
        );
        
        res.json({ success: true, product: newProduct });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add product' });
    }
});

// Contact form endpoint
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    
    // In a real app, you would save to database or send email
    console.log('Contact form submission:', { name, email, message });
    
    res.json({
        success: true,
        message: 'Thank you for your message! We will get back to you soon.'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Velvet Vogue server running on http://localhost:${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin.html`);
});


// Admin authentication middleware
const adminAuth = (req, res, next) => {
    const token = req.headers.authorization;
    // Simple admin check (in production, use proper JWT)
    if (token === 'admin-token') {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// Protected admin routes
app.get('/api/admin/dashboard', adminAuth, async (req, res) => {
    try {
        const data = await fs.readFile(path.join(__dirname, 'public', 'data', 'products.json'), 'utf8');
        const products = JSON.parse(data);
        
        // Get orders from localStorage (simulated)
        const orders = JSON.parse(localStorage.getItem('velvetVogueOrders') || '[]');
        
        res.json({
            products: products.products || [],
            orders: orders,
            stats: {
                totalProducts: products.products?.length || 0,
                totalOrders: orders.length,
                totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
                pendingOrders: orders.filter(o => o.status === 'pending').length
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load dashboard data' });
    }
});

// Add this to your existing API routes