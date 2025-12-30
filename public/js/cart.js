// Cart Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Load cart items
    renderCartItems();
    
    // Load recently viewed products
    loadRecentlyViewed();
    
    // Setup checkout button
    setupCheckoutButton();
});

function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const itemCountElement = document.getElementById('itemCount');
    const checkoutButton = document.getElementById('checkoutBtn');
    
    if (!cartItemsContainer) return;
    
    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('velvetVogueCart')) || [];
    
    // Update item count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (itemCountElement) {
        itemCountElement.textContent = totalItems;
    }
    
    // Update cart count in header
    updateCartCount();
    
    // If cart is empty
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-bag"></i>
                <h3>Your cart is empty</h3>
                <p>Add some products to your cart!</p>
                <a href="shop.html" class="btn btn-primary">Continue Shopping</a>
            </div>
        `;
        
        // Disable checkout button
        if (checkoutButton) {
            checkoutButton.classList.add('disabled');
            checkoutButton.onclick = (e) => {
                e.preventDefault();
                showNotification('Your cart is empty!', 'error');
            };
        }
        
        // Update summary with zeros
        updateCartSummary(0);
        return;
    }
    
    // Enable checkout button
    if (checkoutButton) {
        checkoutButton.classList.remove('disabled');
        checkoutButton.onclick = null;
    }
    
    // Render cart items
    let html = '';
    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        html += `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image || 'images/default-product.jpg'}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h3 class="cart-item-title">${item.name}</h3>
                    <div class="cart-item-price">£${item.price.toFixed(2)}</div>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn minus" onclick="updateCartQuantity('${item.id}', -1)">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="10" 
                           onchange="updateCartQuantityInput('${item.id}', this.value)">
                    <button class="quantity-btn plus" onclick="updateCartQuantity('${item.id}', 1)">+</button>
                </div>
                <div class="cart-item-subtotal">
                    £${subtotal.toFixed(2)}
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
    
    // Calculate and update summary
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    updateCartSummary(subtotal);
}

function updateCartSummary(subtotal) {
    const cartSummary = document.getElementById('cartSummary');
    if (!cartSummary) return;
    
    const shipping = subtotal > 50 ? 0 : 4.99;
    const tax = subtotal * 0.2; // 20% VAT
    const total = subtotal + shipping + tax;
    
    cartSummary.innerHTML = `
        <div class="summary-row">
            <span>Subtotal:</span>
            <span>£${subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-row">
            <span>Shipping:</span>
            <span>${shipping === 0 ? 'FREE' : `£${shipping.toFixed(2)}`}</span>
        </div>
        <div class="summary-row">
            <span>Tax (20%):</span>
            <span>£${tax.toFixed(2)}</span>
        </div>
        <div class="summary-row total">
            <span>Total:</span>
            <span>£${total.toFixed(2)}</span>
        </div>
    `;
}

function updateCartQuantity(productId, change) {
    let cart = JSON.parse(localStorage.getItem('velvetVogueCart')) || [];
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex !== -1) {
        cart[itemIndex].quantity += change;
        
        // Remove if quantity is 0 or less
        if (cart[itemIndex].quantity < 1) {
            cart.splice(itemIndex, 1);
        }
        
        localStorage.setItem('velvetVogueCart', JSON.stringify(cart));
        renderCartItems();
        showNotification('Cart updated!', 'success');
    }
}

function updateCartQuantityInput(productId, newQuantity) {
    let cart = JSON.parse(localStorage.getItem('velvetVogueCart')) || [];
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex !== -1) {
        const quantity = parseInt(newQuantity);
        if (isNaN(quantity) || quantity < 1) {
            cart[itemIndex].quantity = 1;
        } else if (quantity > 10) {
            cart[itemIndex].quantity = 10;
        } else {
            cart[itemIndex].quantity = quantity;
        }
        
        localStorage.setItem('velvetVogueCart', JSON.stringify(cart));
        renderCartItems();
        showNotification('Cart updated!', 'success');
    }
}

function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        localStorage.removeItem('velvetVogueCart');
        renderCartItems();
        showNotification('Cart cleared!', 'success');
    }
}

function applyCoupon() {
    const couponCode = document.getElementById('couponCode').value.trim();
    const coupons = {
        'VELVET10': 0.1,  // 10% off
        'WELCOME20': 0.2, // 20% off
        'FREESHIP': 'free-shipping'
    };
    
    if (!couponCode) {
        showNotification('Please enter a coupon code', 'error');
        return;
    }
    
    if (coupons[couponCode.toUpperCase()]) {
        showNotification('Coupon applied successfully!', 'success');
        // In a real application, you would apply the discount here
    } else {
        showNotification('Invalid coupon code', 'error');
    }
}

function setupCheckoutButton() {
    const checkoutButton = document.getElementById('checkoutBtn');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', function(e) {
            const cart = JSON.parse(localStorage.getItem('velvetVogueCart')) || [];
            if (cart.length === 0) {
                e.preventDefault();
                showNotification('Your cart is empty!', 'error');
            }
        });
    }
}

async function loadRecentlyViewed() {
    try {
        const response = await fetch('/api/products');
        const data = await response.json();
        const products = data.products || [];
        
        // Get 4 random products for demonstration
        const randomProducts = [...products]
            .sort(() => 0.5 - Math.random())
            .slice(0, 4);
        
        displayRecentlyViewed(randomProducts);
    } catch (error) {
        console.error('Error loading recently viewed:', error);
    }
}

function displayRecentlyViewed(products) {
    const container = document.getElementById('recentlyViewed');
    if (!container) return;
    
    let html = '';
    products.forEach(product => {
        html += `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image || 'images/default-product.jpg'}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-price">£${product.price.toFixed(2)}</div>
                    <div class="product-actions">
                        <button class="product-btn primary" onclick="addToCart('${product.id}', '${product.name}', ${product.price}, 1, '${product.image}')">
                            <i class="fas fa-shopping-bag"></i> Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Export functions for use in main.js
window.updateCartQuantity = updateCartQuantity;
window.updateCartQuantityInput = updateCartQuantityInput;
window.clearCart = clearCart;
window.applyCoupon = applyCoupon;