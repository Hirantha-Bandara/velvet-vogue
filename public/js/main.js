// Main JavaScript for Velvet Vogue Website

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart count
    updateCartCount();
    
    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navMenu.contains(event.target) && !menuToggle.contains(event.target)) {
                navMenu.classList.remove('active');
            }
        });
    }
    
    // Set active nav link based on current page
    setActiveNavLink();
    
    // Initialize dark mode toggle if exists
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
        
        // Check for saved dark mode preference
        if (localStorage.getItem('darkMode') === 'enabled') {
            enableDarkMode();
        }
    }
});

// Cart Management Functions
let cart = JSON.parse(localStorage.getItem('velvetVogueCart')) || [];

function addToCart(productId, productName, price, quantity = 1, image = '') {
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: price,
            quantity: quantity,
            image: image
        });
    }
    
    saveCart();
    updateCartCount();
    showNotification(`${productName} added to cart!`, 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
}

function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    // Read current cart from localStorage to avoid stale in-memory state
    const currentCart = JSON.parse(localStorage.getItem('velvetVogueCart')) || [];
    const totalItems = currentCart.reduce((sum, item) => sum + item.quantity, 0);

    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });

    // Update cart page if exists - prefer cart.js renderer if available
    if (window.location.pathname.includes('cart.html')) {
        if (typeof window.renderCartItems === 'function') {
            window.renderCartItems();
        } else if (typeof renderCartItems === 'function') {
            renderCartItems();
        }
        if (typeof updateCartTotal === 'function') updateCartTotal();
    }
}

function saveCart() {
    localStorage.setItem('velvetVogueCart', JSON.stringify(cart));
}

function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function clearCart() {
    cart = [];
    saveCart();
    updateCartCount();
}

// Cart Page Functions
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-bag"></i>
                <h3>Your cart is empty</h3>
                <p>Add some products to your cart!</p>
                <a href="shop.html" class="btn btn-primary">Continue Shopping</a>
            </div>
        `;
        return;
    }
    
    let html = '';
    cart.forEach(item => {
        html += `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image || 'images/default-product.jpg'}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <p class="cart-item-price">£${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn minus" onclick="updateQuantity('${item.id}', -1)">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn plus" onclick="updateQuantity('${item.id}', 1)">+</button>
                </div>
                <div class="cart-item-subtotal">
                    £${(item.price * item.quantity).toFixed(2)}
                </div>
                <div class="cart-item-remove">
                    <button class="remove-btn" onclick="removeFromCart('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    cartItemsContainer.innerHTML = html;
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity < 1) {
            removeFromCart(productId);
        } else {
            saveCart();
            updateCartCount();
        }
    }
}

function updateCartTotal() {
    const cartTotalElement = document.getElementById('cartTotal');
    const cartSubtotalElement = document.getElementById('cartSubtotal');
    
    if (cartTotalElement) {
        const subtotal = getCartTotal();
        const shipping = subtotal > 50 ? 0 : 4.99;
        const tax = subtotal * 0.2; // 20% VAT
        const total = subtotal + shipping + tax;
        
        if (cartSubtotalElement) {
            cartSubtotalElement.textContent = `£${subtotal.toFixed(2)}`;
        }
        
        cartTotalElement.innerHTML = `
            <div class="total-row">
                <span>Subtotal:</span>
                <span>£${subtotal.toFixed(2)}</span>
            </div>
            <div class="total-row">
                <span>Shipping:</span>
                <span>${shipping === 0 ? 'FREE' : `£${shipping.toFixed(2)}`}</span>
            </div>
            <div class="total-row">
                <span>Tax (20%):</span>
                <span>£${tax.toFixed(2)}</span>
            </div>
            <div class="total-row grand-total">
                <span>Total:</span>
                <span>£${total.toFixed(2)}</span>
            </div>
        `;
    }
}

// Utility Functions
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage || 
            (currentPage === '' && linkHref === 'index.html') ||
            (linkHref !== 'index.html' && currentPage.includes(linkHref.replace('.html', '')))) {
            link.classList.add('active');
        }
    });
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background-color: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3'};
        color: white;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 1rem;
        animation: slideIn 0.3s ease;
    `;
    
    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 3000);
}

// Dark Mode Functions
function toggleDarkMode() {
    if (document.body.classList.contains('dark-mode')) {
        disableDarkMode();
    } else {
        enableDarkMode();
    }
}

function enableDarkMode() {
    document.body.classList.add('dark-mode');
    localStorage.setItem('darkMode', 'enabled');
}

function disableDarkMode() {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('darkMode', 'disabled');
}

// Form Validation
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return true;
    
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('error');
            isValid = false;
        } else {
            input.classList.remove('error');
            
            // Email validation
            if (input.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value)) {
                    input.classList.add('error');
                    isValid = false;
                }
            }
            
            // Password validation
            if (input.type === 'password' && input.value.length < 6) {
                input.classList.add('error');
                isValid = false;
            }
        }
    });
    
    return isValid;
}

// Product Search
function searchProducts(query) {
    if (!query.trim()) return;
    
    // Store search query in sessionStorage for shop page
    sessionStorage.setItem('searchQuery', query);
    window.location.href = 'shop.html';
}

// Admin Login Simulation
function adminLogin(username, password) {
    // Simulated admin credentials (in real app, this would be server-side)
    const adminCredentials = {
        username: 'admin',
        password: 'admin123'
    };
    
    if (username === adminCredentials.username && password === adminCredentials.password) {
        localStorage.setItem('isAdminLoggedIn', 'true');
        return true;
    }
    return false;
}

function checkAdminLogin() {
    if (window.location.pathname.includes('admin.html') && 
        localStorage.getItem('isAdminLoggedIn') !== 'true') {
        window.location.href = 'login.html?redirect=admin';
        return false;
    }
    return true;
}

// Export functions for use in other files
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.searchProducts = searchProducts;
window.validateForm = validateForm;