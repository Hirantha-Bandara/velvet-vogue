// Checkout Page JavaScript
let currentPaymentTab = 'card';

document.addEventListener('DOMContentLoaded', function() {
    // Load order summary
    loadOrderSummary();
    
    // Setup payment tabs
    setupPaymentTabs();
    
    // Setup form validation
    setupFormValidation();
    
    // Setup shipping options
    setupShippingOptions();
    
    // Setup input formatting
    setupInputFormatting();
});

function loadOrderSummary() {
    const orderItems = document.getElementById('orderItems');
    const orderTotals = document.getElementById('orderTotals');
    
    if (!orderItems || !orderTotals) return;
    
    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('velvetVogueCart')) || [];
    
    if (cart.length === 0) {
        window.location.href = 'cart.html';
        return;
    }
    
    // Render order items
    let itemsHtml = '';
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        itemsHtml += `
            <div class="order-item">
                <div class="order-item-image">
                    <img src="${item.image || 'images/default-product.jpg'}" alt="${item.name}">
                </div>
                <div class="order-item-details">
                    <div class="order-item-name">${item.name}</div>
                    <div class="order-item-meta">Qty: ${item.quantity} × £${item.price.toFixed(2)}</div>
                </div>
                <div class="order-item-price">£${itemTotal.toFixed(2)}</div>
            </div>
        `;
    });
    
    orderItems.innerHTML = itemsHtml;
    
    // Calculate shipping (free over £50)
    const shipping = subtotal >= 50 ? 0 : 4.99;
    const tax = subtotal * 0.2;
    const total = subtotal + shipping + tax;
    
    // Update order totals
    orderTotals.innerHTML = `
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
    
    // Update free shipping option
    updateFreeShippingOption(subtotal);
    
    // Store order total for modal
    localStorage.setItem('orderTotal', total.toFixed(2));
}

function updateFreeShippingOption(subtotal) {
    const freeShippingOption = document.getElementById('freeShippingOption');
    if (freeShippingOption) {
        if (subtotal >= 50) {
            freeShippingOption.disabled = false;
            freeShippingOption.parentElement.classList.remove('disabled');
        } else {
            freeShippingOption.disabled = true;
            freeShippingOption.parentElement.classList.add('disabled');
        }
    }
}

function setupPaymentTabs() {
    const tabButtons = document.querySelectorAll('.payment-tab');
    const tabContents = document.querySelectorAll('.payment-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            currentPaymentTab = tabId;
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId + 'Tab') {
                    content.classList.add('active');
                }
            });
        });
    });
}

function setupFormValidation() {
    // Card number validation
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function() {
            let value = this.value.replace(/\s/g, '').replace(/\D/g, '');
            let formatted = '';
            
            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) {
                    formatted += ' ';
                }
                formatted += value[i];
            }
            
            this.value = formatted.substring(0, 19);
        });
    }
    
    // Expiry date validation
    const expiryInput = document.getElementById('expiry');
    if (expiryInput) {
        expiryInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            
            this.value = value.substring(0, 5);
        });
    }
    
    // CVC validation
    const cvcInput = document.getElementById('cvc');
    if (cvcInput) {
        cvcInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').substring(0, 3);
        });
    }
}

function setupShippingOptions() {
    const shippingOptions = document.querySelectorAll('input[name="shipping"]');
    shippingOptions.forEach(option => {
        option.addEventListener('change', function() {
            // Update shipping cost in summary
            updateShippingCost(this.value);
        });
    });
}

function updateShippingCost(shippingMethod) {
    const cart = JSON.parse(localStorage.getItem('velvetVogueCart')) || [];
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    let shippingCost = 0;
    switch (shippingMethod) {
        case 'standard':
            shippingCost = 4.99;
            break;
        case 'express':
            shippingCost = 9.99;
            break;
        case 'free':
            shippingCost = 0;
            break;
    }
    
    // Recalculate totals
    const tax = subtotal * 0.2;
    const total = subtotal + shippingCost + tax;
    
    // Update totals display
    const orderTotals = document.getElementById('orderTotals');
    if (orderTotals) {
        orderTotals.innerHTML = `
            <div class="total-row">
                <span>Subtotal:</span>
                <span>£${subtotal.toFixed(2)}</span>
            </div>
            <div class="total-row">
                <span>Shipping:</span>
                <span>${shippingCost === 0 ? 'FREE' : `£${shippingCost.toFixed(2)}`}</span>
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
        
        // Update stored total
        localStorage.setItem('orderTotal', total.toFixed(2));
    }
}

function setupInputFormatting() {
    // Phone number formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            
            if (value.length > 0) {
                if (value.startsWith('0')) {
                    // UK format
                    if (value.length <= 4) {
                        value = value.replace(/(\d{4})/, '$1');
                    } else if (value.length <= 7) {
                        value = value.replace(/(\d{4})(\d{3})/, '$1 $2');
                    } else {
                        value = value.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
                    }
                } else {
                    // International format
                    if (value.length <= 3) {
                        value = `+${value}`;
                    } else if (value.length <= 6) {
                        value = value.replace(/(\d{3})(\d{3})/, '+$1 $2');
                    } else {
                        value = value.replace(/(\d{3})(\d{3})(\d{4})/, '+$1 $2 $3');
                    }
                }
            }
            
            this.value = value.substring(0, 16);
        });
    }
    
    // Postcode formatting
    const postcodeInput = document.getElementById('postcode');
    if (postcodeInput) {
        postcodeInput.addEventListener('input', function() {
            this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        });
    }
}

async function processCheckout(event) {
    event.preventDefault();
    
    // Validate form
    if (!validateCheckoutForm()) {
        showNotification('Please fill in all required fields correctly', 'error');
        return false;
    }
    
    // Get form data
    const formData = {
        customer: {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            postcode: document.getElementById('postcode').value,
            country: document.getElementById('country').value
        },
        shipping: document.querySelector('input[name="shipping"]:checked').value,
        paymentMethod: currentPaymentTab,
        notes: document.getElementById('notes').value,
        newsletter: document.getElementById('newsletter').checked,
        cart: JSON.parse(localStorage.getItem('velvetVogueCart')) || [],
        orderTotal: localStorage.getItem('orderTotal') || '0.00'
    };
    
    // Show loading state
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitButton.disabled = true;
    
    try {
        // Simulate API call
        await simulatePaymentProcessing(formData);
        
        // Generate order ID
        const orderId = 'VV-' + Date.now().toString().substring(5);
        
        // Save order to localStorage
        saveOrderToHistory(orderId, formData);
        
        // Clear cart
        localStorage.removeItem('velvetVogueCart');
        updateCartCount();
        
        // Show success modal
        showSuccessModal(orderId, formData.orderTotal);
        
    } catch (error) {
        showNotification('Payment failed. Please try again.', 'error');
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
        return false;
    }
    
    return false; // Prevent form submission
}

function validateCheckoutForm() {
    let isValid = true;
    
    // Required fields
    const requiredFields = [
        'firstName', 'lastName', 'email', 'phone',
        'address', 'city', 'postcode', 'country'
    ];
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field || !field.value.trim()) {
            isValid = false;
            field.classList.add('error');
        } else {
            field.classList.remove('error');
        }
    });
    
    // Email validation
    const emailField = document.getElementById('email');
    if (emailField && emailField.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value)) {
            isValid = false;
            emailField.classList.add('error');
        }
    }
    
    // Card validation (if card payment)
    if (currentPaymentTab === 'card') {
        const cardFields = ['cardNumber', 'expiry', 'cvc', 'cardName'];
        cardFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !field.value.trim()) {
                isValid = false;
                field.classList.add('error');
            }
        });
    }
    
    // Terms acceptance
    const termsCheckbox = document.getElementById('terms');
    if (!termsCheckbox || !termsCheckbox.checked) {
        isValid = false;
        termsCheckbox.classList.add('error');
    } else {
        termsCheckbox.classList.remove('error');
    }
    
    return isValid;
}

function simulatePaymentProcessing(orderData) {
    return new Promise((resolve, reject) => {
        // Simulate API delay
        setTimeout(() => {
            // Simulate 90% success rate
            const success = Math.random() > 0.1;
            
            if (success) {
                resolve({
                    success: true,
                    orderId: 'VV-' + Date.now(),
                    transactionId: 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase()
                });
            } else {
                reject(new Error('Payment processing failed'));
            }
        }, 2000);
    });
}

function saveOrderToHistory(orderId, orderData) {
    // Get existing orders
    let orders = JSON.parse(localStorage.getItem('velvetVogueOrders')) || [];
    
    // Create order object
    const order = {
        id: orderId,
        date: new Date().toISOString(),
        status: 'processing',
        items: orderData.cart,
        total: parseFloat(orderData.orderTotal),
        customer: orderData.customer,
        shipping: orderData.shipping,
        paymentMethod: orderData.paymentMethod
    };
    
    // Add to orders
    orders.unshift(order);
    
    // Save to localStorage
    localStorage.setItem('velvetVogueOrders', JSON.stringify(orders));
    
    // If user is logged in, also save to user profile
    const user = JSON.parse(localStorage.getItem('velvetVogueUser'));
    if (user) {
        user.orders = user.orders || [];
        user.orders.unshift(order.id);
        localStorage.setItem('velvetVogueUser', JSON.stringify(user));
    }
}

function showSuccessModal(orderId, orderTotal) {
    // Update modal content
    document.getElementById('orderId').textContent = orderId;
    document.getElementById('orderTotal').textContent = `£${parseFloat(orderTotal).toFixed(2)}`;
    
    // Show modal
    const modal = document.getElementById('successModal');
    modal.classList.add('active');
    
    // Disable form submission
    const form = document.getElementById('checkoutForm');
    form.style.opacity = '0.5';
    form.style.pointerEvents = 'none';
}

function closeModal() {
    const modal = document.getElementById('successModal');
    modal.classList.remove('active');
    
    // Redirect to home page after modal closes
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 300);
}

// Export functions
window.processCheckout = processCheckout;
window.closeModal = closeModal;