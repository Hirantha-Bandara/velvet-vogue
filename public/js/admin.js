// Admin Panel JavaScript
let currentUser = null;
let products = [];
let orders = [];
let customers = [];

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is admin
    checkAdminAccess();
    
    // Load initial data
    loadDashboardData();
    loadProducts();
    loadOrders();
    loadCustomers();
    
    // Setup event listeners
    setupEventListeners();
    setupCharts();
    
    // Update last updated time
    updateLastUpdated();
});

// Check admin access
function checkAdminAccess() {
    const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
    const adminUser = JSON.parse(localStorage.getItem('velvetVogueAdmin'));
    
    if (!isAdminLoggedIn && !adminUser) {
        // Redirect to login page
        window.location.href = 'login.html?redirect=admin';
        return;
    }
    
    currentUser = adminUser || {
        name: 'Admin User',
        email: 'admin@velvetvogue.com',
        role: 'Administrator'
    };
    
    // Update UI with user info
    updateUserInfo();
}

function updateUserInfo() {
    const userName = document.querySelector('.user-name');
    const userRole = document.querySelector('.user-role');
    
    if (userName) userName.textContent = currentUser.name;
    if (userRole) userRole.textContent = currentUser.role;
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.admin-menu .nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.dataset.section;
            showSection(sectionId);
            
            // Update active state
            document.querySelectorAll('.admin-menu .nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            document.querySelector('.admin-sidebar').classList.toggle('active');
        });
    }
    
    // Search functionality
    const productSearch = document.getElementById('productSearch');
    if (productSearch) {
        productSearch.addEventListener('input', debounce(filterProducts, 300));
    }
    
    const orderSearch = document.getElementById('orderSearch');
    if (orderSearch) {
        orderSearch.addEventListener('input', debounce(filterOrders, 300));
    }
    
    // Filters
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterProducts);
    }
    
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', filterProducts);
    }
    
    const orderStatusFilter = document.getElementById('orderStatusFilter');
    if (orderStatusFilter) {
        orderStatusFilter.addEventListener('change', filterOrders);
    }
    
    // Settings tabs
    document.querySelectorAll('.settings-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            showSettingsTab(tabId);
            
            // Update active state
            document.querySelectorAll('.settings-tabs .tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
        
        // Load section-specific data
        switch(sectionId) {
            case 'dashboard':
                loadDashboardData();
                break;
            case 'products':
                loadProducts();
                break;
            case 'orders':
                loadOrders();
                break;
            case 'customers':
                loadCustomers();
                break;
            case 'analytics':
                loadAnalytics();
                break;
        }
    }
}

function showSettingsTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.settings-tabs .tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    const tab = document.getElementById(tabId + 'Tab');
    if (tab) {
        tab.classList.add('active');
    }
}

// Dashboard Functions
async function loadDashboardData() {
    try {
        // Load products
        const productsResponse = await fetch('/api/products');
        const productsData = await productsResponse.json();
        products = productsData.products || [];
        
        // Load orders from localStorage (simulated)
        orders = JSON.parse(localStorage.getItem('velvetVogueOrders')) || [];
        
        // Load customers from localStorage (simulated)
        customers = JSON.parse(localStorage.getItem('velvetVogueUsers')) || [];
        
        // Update stats
        updateDashboardStats();
        
        // Update activity list
        updateActivityList();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Failed to load dashboard data', 'error');
    }
}

function updateDashboardStats() {
    // Total orders
    const totalOrders = orders.length;
    document.getElementById('totalOrders').textContent = totalOrders;
    
    // Total revenue
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    document.getElementById('totalRevenue').textContent = `£${totalRevenue.toFixed(2)}`;
    
    // Total products
    document.getElementById('totalProducts').textContent = products.length;
    
    // Total customers
    document.getElementById('totalCustomers').textContent = customers.length;
    
    // Order status stats
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    const shippedOrders = orders.filter(o => o.status === 'shipped').length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
    
    document.getElementById('pendingOrders').textContent = pendingOrders;
    document.getElementById('completedOrders').textContent = completedOrders;
    document.getElementById('shippedOrders').textContent = shippedOrders;
    document.getElementById('cancelledOrders').textContent = cancelledOrders;
}

function updateActivityList() {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;
    
    // Sort orders by date (newest first)
    const recentOrders = [...orders]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    let html = '';
    
    recentOrders.forEach(order => {
        const timeAgo = getTimeAgo(new Date(order.date));
        const statusClass = order.status === 'delivered' ? 'success' : 'warning';
        
        html += `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-shopping-cart"></i>
                </div>
                <div class="activity-content">
                    <p>Order #${order.id} placed by ${order.customer.firstName} ${order.customer.lastName}</p>
                    <span class="activity-time">${timeAgo}</span>
                </div>
                <span class="activity-badge ${statusClass}">£${order.total.toFixed(2)}</span>
            </div>
        `;
    });
    
    activityList.innerHTML = html || '<p class="no-data">No recent activity</p>';
}

function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
}

// Product Management Functions
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        const data = await response.json();
        products = data.products || [];
        renderProductsTable();
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Failed to load products', 'error');
    }
}

function renderProductsTable(filteredProducts = null) {
    const tableBody = document.getElementById('productsTableBody');
    const productsCount = document.getElementById('productsCount');
    
    if (!tableBody) return;
    
    const productsToShow = filteredProducts || products;
    
    if (productsToShow.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="no-data">No products found</td>
            </tr>
        `;
        if (productsCount) productsCount.textContent = '0';
        return;
    }
    
    let html = '';
    productsToShow.forEach(product => {
        const status = getStockStatus(product.stock);
        const categories = product.category.map(cat => {
            const categoryNames = {
                'men': 'Men',
                'women': 'Women',
                'formal': 'Formal',
                'casual': 'Casual',
                'accessories': 'Accessories'
            };
            return categoryNames[cat] || cat;
        }).join(', ');
        
        html += `
            <tr>
                <td>${product.id}</td>
                <td>
                    <div class="product-cell">
                        <img src="${product.image || 'https://images.unsplash.com/photo-1558769132-cb1faced3188?w=100&h=100&fit=crop'}" 
                             alt="${product.name}" class="product-thumb">
                        <div>
                            <strong>${product.name}</strong>
                            <small>${product.description.substring(0, 50)}...</small>
                        </div>
                    </div>
                </td>
                <td>${categories}</td>
                <td>£${product.price.toFixed(2)}</td>
                <td>${product.stock}</td>
                <td><span class="status-badge status-${status.replace('-', '-')}">${status}</span></td>
                <td>
                    <div class="rating">
                        ${generateStarRating(product.rating)}
                        <small>(${product.rating})</small>
                    </div>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="editProduct('${product.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteProduct('${product.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="action-btn view" onclick="viewProduct('${product.id}')" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
    if (productsCount) productsCount.textContent = productsToShow.length;
}

function getStockStatus(stock) {
    if (stock === 0) return 'out-of-stock';
    if (stock <= 10) return 'low-stock';
    return 'in-stock';
}

function filterProducts() {
    const searchTerm = document.getElementById('productSearch')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    
    let filtered = products;
    
    // Search filter
    if (searchTerm) {
        filtered = filtered.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.id.toLowerCase().includes(searchTerm)
        );
    }
    
    // Category filter
    if (categoryFilter) {
        filtered = filtered.filter(product => 
            product.category.includes(categoryFilter)
        );
    }
    
    // Status filter
    if (statusFilter) {
        filtered = filtered.filter(product => {
            const status = getStockStatus(product.stock);
            return status === statusFilter;
        });
    }
    
    renderProductsTable(filtered);
}

// Order Management Functions
function loadOrders() {
    // Load from localStorage (simulated)
    orders = JSON.parse(localStorage.getItem('velvetVogueOrders')) || [];
    renderOrdersTable();
}

function renderOrdersTable(filteredOrders = null) {
    const tableBody = document.getElementById('ordersTableBody');
    
    if (!tableBody) return;
    
    const ordersToShow = filteredOrders || orders;
    
    if (ordersToShow.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="no-data">No orders found</td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    ordersToShow.forEach(order => {
        const orderDate = new Date(order.date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
        
        html += `
            <tr>
                <td>${order.id}</td>
                <td>
                    <strong>${order.customer.firstName} ${order.customer.lastName}</strong><br>
                    <small>${order.customer.email}</small>
                </td>
                <td>${orderDate}</td>
                <td>£${order.total.toFixed(2)}</td>
                <td><span class="status-badge status-${order.status}">${order.status}</span></td>
                <td>${order.paymentMethod}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view" onclick="viewOrderDetails('${order.id}')" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" onclick="updateOrderStatus('${order.id}')" title="Update">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

function filterOrders() {
    const searchTerm = document.getElementById('orderSearch')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('orderStatusFilter')?.value || '';
    const dateFilter = document.getElementById('orderDateFilter')?.value || '';
    
    let filtered = orders;
    
    // Search filter
    if (searchTerm) {
        filtered = filtered.filter(order => 
            order.id.toLowerCase().includes(searchTerm) ||
            order.customer.firstName.toLowerCase().includes(searchTerm) ||
            order.customer.lastName.toLowerCase().includes(searchTerm) ||
            order.customer.email.toLowerCase().includes(searchTerm)
        );
    }
    
    // Status filter
    if (statusFilter) {
        filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    // Date filter
    if (dateFilter) {
        const filterDate = new Date(dateFilter);
        filtered = filtered.filter(order => {
            const orderDate = new Date(order.date);
            return orderDate.toDateString() === filterDate.toDateString();
        });
    }
    
    renderOrdersTable(filtered);
}

// Customer Management Functions
function loadCustomers() {
    // Load from localStorage (simulated)
    customers = JSON.parse(localStorage.getItem('velvetVogueUsers')) || [];
    
    // Add mock customers if none exist
    if (customers.length === 0) {
        customers = [
            {
                id: 'CUST001',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                phone: '+44 20 7123 4567',
                joined: '2024-01-15',
                orders: 3,
                totalSpent: 275.97
            },
            {
                id: 'CUST002',
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane@example.com',
                phone: '+44 20 7123 4568',
                joined: '2024-02-20',
                orders: 5,
                totalSpent: 489.50
            }
        ];
        localStorage.setItem('velvetVogueUsers', JSON.stringify(customers));
    }
    
    renderCustomersTable();
}

function renderCustomersTable() {
    const tableBody = document.getElementById('customersTableBody');
    
    if (!tableBody) return;
    
    if (customers.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="no-data">No customers found</td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    customers.forEach(customer => {
        const joinDate = new Date(customer.joined).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
        
        html += `
            <tr>
                <td>${customer.id}</td>
                <td>${customer.firstName} ${customer.lastName}</td>
                <td>${customer.email}</td>
                <td>${customer.phone}</td>
                <td>${joinDate}</td>
                <td>${customer.orders || 0}</td>
                <td>£${(customer.totalSpent || 0).toFixed(2)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view" onclick="viewCustomer('${customer.id}')" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" onclick="editCustomer('${customer.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

// Product CRUD Operations
function showAddProductModal() {
    const modal = document.getElementById('addProductModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

async function saveProduct(event) {
    event.preventDefault();
    
    try {
        const formData = {
            name: document.getElementById('productName').value,
            price: parseFloat(document.getElementById('productPrice').value),
            category: Array.from(document.getElementById('productCategory').selectedOptions).map(opt => opt.value),
            stock: parseInt(document.getElementById('productStock').value),
            description: document.getElementById('productDescription').value,
            sizes: document.getElementById('productSizes').value.split(',').map(s => s.trim()).filter(s => s),
            colors: document.getElementById('productColors').value.split(',').map(c => c.trim()).filter(c => c),
            image: document.getElementById('productImage').value || 'https://images.unsplash.com/photo-1558769132-cb1faced3188?w=600&h=600&fit=crop',
            rating: 4.5, // Default rating
            featured: false
        };
        
        // Generate new ID
        const newId = 'VV' + (products.length + 1).toString().padStart(3, '0');
        formData.id = newId;
        
        // Save to "database" (localStorage)
        products.push(formData);
        
        // Update localStorage
        const allData = JSON.parse(localStorage.getItem('velvetVogueData') || '{}');
        allData.products = products;
        localStorage.setItem('velvetVogueData', JSON.stringify(allData));
        
        // Also update the API endpoint data
        await updateProductsAPI(formData);
        
        // Close modal
        closeModal('addProductModal');
        
        // Refresh products table
        loadProducts();
        
        // Update dashboard stats
        updateDashboardStats();
        
        showNotification('Product added successfully!', 'success');
        
    } catch (error) {
        console.error('Error saving product:', error);
        showNotification('Failed to add product', 'error');
    }
}

async function updateProductsAPI(productData) {
    try {
        // In a real application, this would be a POST request to your API
        const response = await fetch('/api/admin/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData)
        });
        
        if (!response.ok) {
            throw new Error('API update failed');
        }
        
        return await response.json();
    } catch (error) {
        console.error('API update error:', error);
        // Fallback to localStorage
    }
}

function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        showNotification('Product not found', 'error');
        return;
    }
    
    // Populate edit modal (similar to add modal)
    showNotification('Edit functionality would open here', 'info');
    
    // In a full implementation, you would:
    // 1. Open edit modal with pre-filled data
    // 2. Handle update on form submission
    // 3. Refresh the products table
}

function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    // Remove from products array
    const index = products.findIndex(p => p.id === productId);
    if (index !== -1) {
        products.splice(index, 1);
        
        // Update localStorage
        const allData = JSON.parse(localStorage.getItem('velvetVogueData') || '{}');
        allData.products = products;
        localStorage.setItem('velvetVogueData', JSON.stringify(allData));
        
        // Refresh table
        loadProducts();
        
        // Update dashboard stats
        updateDashboardStats();
        
        showNotification('Product deleted successfully!', 'success');
    }
}

function viewProduct(productId) {
    // Open product page in new tab
    window.open(`product.html?id=${productId}`, '_blank');
}

// Order Operations
function viewOrderDetails(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
        showNotification('Order not found', 'error');
        return;
    }
    
    // Format order date
    const orderDate = new Date(order.date).toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Create order details HTML
    const html = `
        <div class="order-details">
            <div class="order-header">
                <h3>Order #${order.id}</h3>
                <span class="status-badge status-${order.status}">${order.status}</span>
            </div>
            
            <div class="order-info-grid">
                <div class="info-section">
                    <h4>Customer Information</h4>
                    <p><strong>Name:</strong> ${order.customer.firstName} ${order.customer.lastName}</p>
                    <p><strong>Email:</strong> ${order.customer.email}</p>
                    <p><strong>Phone:</strong> ${order.customer.phone}</p>
                    <p><strong>Address:</strong> ${order.customer.address}, ${order.customer.city}, ${order.customer.postcode}</p>
                </div>
                
                <div class="info-section">
                    <h4>Order Information</h4>
                    <p><strong>Date:</strong> ${orderDate}</p>
                    <p><strong>Shipping:</strong> ${order.shipping}</p>
                    <p><strong>Payment:</strong> ${order.paymentMethod}</p>
                    <p><strong>Notes:</strong> ${order.notes || 'None'}</p>
                </div>
            </div>
            
            <div class="order-items-section">
                <h4>Order Items</h4>
                <table class="order-items-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td>£${item.price.toFixed(2)}</td>
                                <td>${item.quantity}</td>
                                <td>£${(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="order-totals">
                <div class="total-row">
                    <span>Subtotal:</span>
                    <span>£${(order.total / 1.2).toFixed(2)}</span>
                </div>
                <div class="total-row">
                    <span>Tax (20%):</span>
                    <span>£${(order.total * 0.2 / 1.2).toFixed(2)}</span>
                </div>
                <div class="total-row">
                    <span>Shipping:</span>
                    <span>£${(order.total - (order.total / 1.2) - (order.total * 0.2 / 1.2)).toFixed(2)}</span>
                </div>
                <div class="total-row grand-total">
                    <span>Total:</span>
                    <span>£${order.total.toFixed(2)}</span>
                </div>
            </div>
            
            <div class="order-actions">
                <button class="btn btn-primary" onclick="updateOrderStatus('${order.id}')">Update Status</button>
                <button class="btn btn-outline" onclick="printOrder('${order.id}')">Print</button>
            </div>
        </div>
    `;
    
    // Update modal content
    const modalContent = document.getElementById('orderDetailsContent');
    if (modalContent) {
        modalContent.innerHTML = html;
    }
    
    // Show modal
    const modal = document.getElementById('orderDetailsModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function updateOrderStatus(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
        showNotification('Order not found', 'error');
        return;
    }
    
    const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    const currentIndex = statuses.indexOf(order.status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    
    order.status = statuses[nextIndex];
    
    // Update localStorage
    localStorage.setItem('velvetVogueOrders', JSON.stringify(orders));
    
    // Refresh orders table
    loadOrders();
    
    // Update dashboard stats
    updateDashboardStats();
    
    showNotification(`Order status updated to: ${order.status}`, 'success');
}

function printOrder(orderId) {
    // In a full implementation, this would generate a printable order
    showNotification('Print functionality would open here', 'info');
}

// Analytics Functions
function loadAnalytics() {
    // Setup analytics charts
    setupAnalyticsCharts();
}

function setupAnalyticsCharts() {
    // Sales chart
    const salesCtx = document.getElementById('salesChart')?.getContext('2d');
    if (salesCtx) {
        new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Sales (£)',
                    data: [12000, 19000, 15000, 25000, 22000, 30000],
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '£' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Categories chart
    const categoriesCtx = document.getElementById('categoriesChart')?.getContext('2d');
    if (categoriesCtx) {
        new Chart(categoriesCtx, {
            type: 'doughnut',
            data: {
                labels: ["Men's Wear", "Women's Wear", "Formal", "Casual", "Accessories"],
                datasets: [{
                    data: [25, 35, 15, 20, 5],
                    backgroundColor: [
                        '#2196F3',
                        '#E91E63',
                        '#9C27B0',
                        '#FF9800',
                        '#4CAF50'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function generateStarRating(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i === fullStars && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    
    return stars;
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `admin-notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 1rem 1.5rem;
        background-color: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3'};
        color: white;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 2001;
        display: flex;
        align-items: center;
        gap: 1rem;
        animation: slideInRight 0.3s ease;
    `;
    
    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 3000);
}

function updateLastUpdated() {
    const element = document.getElementById('lastUpdated');
    if (element) {
        const now = new Date();
        element.textContent = now.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

function exportData() {
    // Create export data
    const exportData = {
        products: products,
        orders: orders,
        customers: customers,
        exportDate: new Date().toISOString()
    };
    
    // Convert to JSON
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    // Create download link
    const exportFileDefaultName = `velvet-vogue-data-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Data exported successfully!', 'success');
}

function refreshOrders() {
    loadOrders();
    showNotification('Orders refreshed', 'success');
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .product-cell {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .product-thumb {
        width: 50px;
        height: 50px;
        border-radius: 4px;
        object-fit: cover;
    }
    
    .rating {
        color: #FF9800;
    }
    
    .no-data {
        text-align: center;
        color: var(--gray);
        padding: 2rem;
        font-style: italic;
    }
    
    .order-details {
        max-height: 70vh;
        overflow-y: auto;
    }
    
    .order-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid var(--gray-light);
    }
    
    .order-info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
        margin-bottom: 2rem;
    }
    
    @media (max-width: 768px) {
        .order-info-grid {
            grid-template-columns: 1fr;
        }
    }
    
    .info-section h4 {
        margin-bottom: 1rem;
        color: var(--secondary);
    }
    
    .info-section p {
        margin-bottom: 0.5rem;
        color: var(--gray);
    }
    
    .order-items-section {
        margin-bottom: 2rem;
    }
    
    .order-items-section h4 {
        margin-bottom: 1rem;
        color: var(--secondary);
    }
    
    .order-items-table {
        width: 100%;
        border-collapse: collapse;
    }
    
    .order-items-table th,
    .order-items-table td {
        padding: 0.75rem;
        border-bottom: 1px solid var(--gray-light);
        text-align: left;
    }
    
    .order-items-table th {
        background-color: var(--light);
        font-weight: 600;
        color: var(--secondary);
    }
    
    .order-totals {
        margin: 2rem 0;
        padding: 1.5rem;
        background-color: var(--light);
        border-radius: var(--radius);
    }
    
    .total-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.75rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px dashed var(--gray-light);
    }
    
    .total-row:last-child {
        border-bottom: none;
    }
    
    .total-row.grand-total {
        font-size: 1.2rem;
        font-weight: 700;
        color: var(--primary);
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 2px solid var(--gray-light);
    }
    
    .order-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--gray-light);
    }
`;
document.head.appendChild(style);

// Initialize DataTables for better table functionality
$(document).ready(function() {
    $('#productsTable').DataTable({
        paging: true,
        searching: true,
        ordering: true,
        info: true,
        responsive: true
    });
    
    $('#ordersTable').DataTable({
        paging: true,
        searching: true,
        ordering: true,
        info: true,
        responsive: true
    });
    
    $('#customersTable').DataTable({
        paging: true,
        searching: true,
        ordering: true,
        info: true,
        responsive: true
    });
});