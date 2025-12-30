// Products JavaScript - Shared functionality

// Load and display featured products
async function loadFeaturedProducts() {
    try {
        const response = await fetch('/api/products');
        const data = await response.json();
        const products = data.products || [];
        
        // Get featured products (first 4)
        const featuredProducts = products.filter(p => p.featured).slice(0, 4);
        
        displayFeaturedProducts(featuredProducts);
    } catch (error) {
        console.error('Error loading featured products:', error);
    }
}

function displayFeaturedProducts(products) {
    const container = document.getElementById('featuredProducts');
    if (!container) return;
    
    let html = '';
    products.forEach(product => {
        html += `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image || 'images/default-product.jpg'}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-price">£${product.price.toFixed(2)}</div>
                    <div class="product-rating">
                        ${generateStarRating(product.rating)}
                    </div>
                    <div class="product-actions">
                        <button class="product-btn primary add-to-cart-btn" data-id="${product.id}">
                            <i class="fas fa-shopping-bag"></i> Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Add event listeners
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.dataset.id;
            const product = products.find(p => p.id === productId);
            if (product) {
                addToCart(product.id, product.name, product.price, 1, product.image);
            }
        });
    });
}

// Generate star rating HTML
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

// Load featured products on homepage
if (document.getElementById('featuredProducts')) {
    loadFeaturedProducts();
}

// Product Page JavaScript
let currentProduct = null;
let selectedSize = null;
let selectedColor = null;
let selectedQuantity = 1;

document.addEventListener('DOMContentLoaded', function() {
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id') || 'VV001';
    
    // Load product data
    loadProduct(productId);
    
    // Setup tab switching
    setupTabs();
    
    // Setup option selection
    setupOptions();
});

async function loadProduct(productId) {
    try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
            throw new Error('Product not found');
        }
        
        currentProduct = await response.json();
        displayProduct(currentProduct);
        loadRelatedProducts(currentProduct.category[0], productId);
    } catch (error) {
        console.error('Error loading product:', error);
        document.getElementById('productContainer').innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle"></i>
                <h2>Product Not Found</h2>
                <p>The product you're looking for doesn't exist or has been removed.</p>
                <a href="shop.html" class="btn btn-primary">Browse All Products</a>
            </div>
        `;
    }
}

function displayProduct(product) {
    const container = document.getElementById('productContainer');
    
    // Update breadcrumb
    const category = product.category[0] || 'Shop';
    document.getElementById('productCategory').textContent = product.name;
    
    // Create product HTML
    const productHTML = `
        <div class="product-images">
            <div class="thumbnail-list" id="thumbnailList">
                <!-- Thumbnails will be added here -->
            </div>
            <div class="main-image">
                <img src="${product.image || 'images/default-product.jpg'}" alt="${product.name}" id="mainProductImage">
                <button class="zoom-btn" onclick="zoomImage()">
                    <i class="fas fa-search-plus"></i>
                </button>
            </div>
        </div>
        <div class="product-info">
            <h1>${product.name}</h1>
            <div class="product-sku">SKU: ${product.id}</div>
            <div class="product-price">£${product.price.toFixed(2)}</div>
            <div class="product-rating">
                <div class="rating-stars">
                    ${generateStarRating(product.rating)}
                </div>
                <span class="rating-count">${product.rating} (24 reviews)</span>
            </div>
            <p class="product-description-short">${product.description}</p>
            
            <div class="product-options">
                <div class="option-group">
                    <label>Size:</label>
                    <div class="size-options" id="sizeOptions">
                        <!-- Size options will be added here -->
                    </div>
                </div>
                
                <div class="option-group">
                    <label>Color:</label>
                    <div class="color-options" id="colorOptions">
                        <!-- Color options will be added here -->
                    </div>
                </div>
                
                <div class="option-group">
                    <label>Quantity:</label>
                    <div class="quantity-selector">
                        <button class="quantity-btn minus" onclick="updateQuantity(-1)">-</button>
                        <input type="number" value="1" min="1" max="10" class="quantity-input" id="quantityInput">
                        <button class="quantity-btn plus" onclick="updateQuantity(1)">+</button>
                    </div>
                </div>
            </div>
            
            <div class="product-actions">
                <button class="action-btn primary" onclick="addToCartCurrent()">
                    <i class="fas fa-shopping-bag"></i> Add to Cart
                </button>
                <button class="action-btn success" onclick="buyNow()">
                    <i class="fas fa-check-circle"></i> Buy Now
                </button>
                <button class="action-btn secondary" onclick="addToWishlist()">
                    <i class="far fa-heart"></i> Add to Wishlist
                </button>
                <button class="action-btn outline">
                    <i class="fas fa-share-alt"></i> Share
                </button>
            </div>
            
            <div class="product-meta">
                <div class="meta-item">
                    <div class="meta-icon">
                        <i class="fas fa-shipping-fast"></i>
                    </div>
                    <div class="meta-text">
                        <h4>Free Shipping</h4>
                        <p>On orders over £50</p>
                    </div>
                </div>
                <div class="meta-item">
                    <div class="meta-icon">
                        <i class="fas fa-undo"></i>
                    </div>
                    <div class="meta-text">
                        <h4>30-Day Returns</h4>
                        <p>Easy return policy</p>
                    </div>
                </div>
                <div class="meta-item">
                    <div class="meta-icon">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <div class="meta-text">
                        <h4>Secure Payment</h4>
                        <p>100% secure & safe</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = productHTML;
    
    // Update description in tabs
    document.getElementById('productDescription').textContent = product.description;
    
    // Generate thumbnails (simulate multiple images)
    generateThumbnails(product);
    
    // Generate size options
    generateSizeOptions(product.sizes);
    
    // Generate color options
    generateColorOptions(product.colors);
    
    // Setup quantity input
    setupQuantityInput();
}

function generateThumbnails(product) {
    const thumbnailList = document.getElementById('thumbnailList');
    if (!thumbnailList) return;
    
    // Create 4 thumbnails (first is main image, others are variations)
    for (let i = 0; i < 4; i++) {
        const thumbnail = document.createElement('div');
        thumbnail.className = `thumbnail ${i === 0 ? 'active' : ''}`;
        thumbnail.innerHTML = `<img src="${product.image || 'images/default-product.jpg'}" alt="${product.name} ${i + 1}">`;
        
        thumbnail.addEventListener('click', function() {
            // Update main image
            document.getElementById('mainProductImage').src = this.querySelector('img').src;
            
            // Update active thumbnail
            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
        
        thumbnailList.appendChild(thumbnail);
    }
}

function generateSizeOptions(sizes) {
    const sizeOptions = document.getElementById('sizeOptions');
    if (!sizeOptions) return;
    
    sizes.forEach((size, index) => {
        const option = document.createElement('button');
        option.className = `size-option ${index === 0 ? 'selected' : ''}`;
        option.textContent = size;
        
        option.addEventListener('click', function() {
            // Update selected size
            document.querySelectorAll('.size-option').forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            selectedSize = size;
        });
        
        sizeOptions.appendChild(option);
    });
    
    // Set first size as default
    selectedSize = sizes[0];
}

function generateColorOptions(colors) {
    const colorOptions = document.getElementById('colorOptions');
    if (!colorOptions) return;
    
    colors.forEach((color, index) => {
        const option = document.createElement('button');
        option.className = `color-option ${index === 0 ? 'selected' : ''}`;
        option.style.backgroundColor = getColorValue(color);
        option.title = color;
        
        option.addEventListener('click', function() {
            // Update selected color
            document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            selectedColor = color;
        });
        
        colorOptions.appendChild(option);
    });
    
    // Set first color as default
    selectedColor = colors[0];
}

function getColorValue(colorName) {
    const colors = {
        'Black': '#000000',
        'White': '#FFFFFF',
        'Blue': '#2196F3',
        'Red': '#F44336',
        'Green': '#4CAF50',
        'Yellow': '#FFEB3B',
        'Purple': '#9C27B0',
        'Pink': '#E91E63',
        'Brown': '#795548',
        'Gray': '#9E9E9E',
        'Navy': '#0D47A1',
        'Burgundy': '#880E4F',
        'Tan': '#D7CCC8',
        'Floral': 'linear-gradient(45deg, #FF4081, #E91E63, #9C27B0)'
    };
    
    return colors[colorName] || colorName;
}

function setupQuantityInput() {
    const quantityInput = document.getElementById('quantityInput');
    if (quantityInput) {
        quantityInput.addEventListener('change', function() {
            let value = parseInt(this.value);
            if (isNaN(value) || value < 1) value = 1;
            if (value > 10) value = 10;
            this.value = value;
            selectedQuantity = value;
        });
        
        quantityInput.addEventListener('input', function() {
            selectedQuantity = parseInt(this.value) || 1;
        });
    }
}

function updateQuantity(change) {
    const input = document.getElementById('quantityInput');
    if (!input) return;
    
    let value = parseInt(input.value) + change;
    if (value < 1) value = 1;
    if (value > 10) value = 10;
    
    input.value = value;
    selectedQuantity = value;
}

function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // Update active button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding pane
            tabPanes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === tabId) {
                    pane.classList.add('active');
                }
            });
        });
    });
}

function setupOptions() {
    // Color and size selection already handled in their generation functions
}

function addToCartCurrent() {
    if (!currentProduct) return;
    
    addToCart(
        currentProduct.id,
        currentProduct.name,
        currentProduct.price,
        selectedQuantity,
        currentProduct.image
    );
    
    showNotification(`${currentProduct.name} added to cart!`, 'success');
}

function addToWishlist() {
    if (!currentProduct) return;
    
    // Get existing wishlist or create new
    let wishlist = JSON.parse(localStorage.getItem('velvetVogueWishlist')) || [];
    
    // Check if already in wishlist
    const existing = wishlist.find(item => item.id === currentProduct.id);
    if (!existing) {
        wishlist.push({
            id: currentProduct.id,
            name: currentProduct.name,
            price: currentProduct.price,
            image: currentProduct.image
        });
        
        localStorage.setItem('velvetVogueWishlist', JSON.stringify(wishlist));
        showNotification(`${currentProduct.name} added to wishlist!`, 'success');
    } else {
        showNotification(`${currentProduct.name} is already in your wishlist`, 'info');
    }
}

function buyNow() {
    if (!currentProduct) return;
    
    // Add to cart with selected options
    addToCart(
        currentProduct.id,
        currentProduct.name,
        currentProduct.price,
        selectedQuantity,
        currentProduct.image
    );
    
    // Redirect to checkout
    setTimeout(() => {
        window.location.href = 'checkout.html';
    }, 300);
}

function zoomImage() {
    const mainImage = document.getElementById('mainProductImage');
    if (!mainImage) return;
    
    // Create zoom overlay
    const overlay = document.createElement('div');
    overlay.className = 'zoom-overlay';
    overlay.innerHTML = `
        <div class="zoom-container">
            <img src="${mainImage.src}" alt="${mainImage.alt}">
            <button class="close-zoom">&times;</button>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Add styles
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3000;
        animation: fadeIn 0.3s ease;
    `;
    
    const container = overlay.querySelector('.zoom-container');
    container.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        position: relative;
        animation: zoomIn 0.3s ease;
    `;
    
    container.querySelector('img').style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: contain;
    `;
    
    // Close button
    overlay.querySelector('.close-zoom').style.cssText = `
        position: absolute;
        top: 15px;
        right: 15px;
        background: none;
        border: none;
        color: white;
        font-size: 2rem;
        cursor: pointer;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    overlay.querySelector('.close-zoom').addEventListener('click', () => {
        overlay.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => overlay.remove(), 300);
    });
    
    // Close on background click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => overlay.remove(), 300);
        }
    });
}

async function loadRelatedProducts(category, excludeId) {
    try {
        const response = await fetch(`/api/products?category=${category}`);
        const data = await response.json();
        const products = data.products || [];
        
        // Filter out current product and get up to 4 related products
        const relatedProducts = products
            .filter(p => p.id !== excludeId)
            .slice(0, 4);
        
        displayRelatedProducts(relatedProducts);
    } catch (error) {
        console.error('Error loading related products:', error);
    }
}

function displayRelatedProducts(products) {
    const container = document.getElementById('relatedProducts');
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = '<p>No related products found.</p>';
        return;
    }
    
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
                    <div class="product-rating">
                        ${generateStarRating(product.rating)}
                    </div>
                    <div class="product-actions">
                        <a href="product.html?id=${product.id}" class="product-btn secondary">
                            <i class="fas fa-eye"></i> View
                        </a>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Star rating helper function
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

// Animations
document.head.insertAdjacentHTML('beforeend', `
<style>
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    @keyframes zoomIn {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
    }
</style>
`);