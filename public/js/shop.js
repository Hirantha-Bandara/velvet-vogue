// Shop Page JavaScript
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 9;
let currentView = 'grid';

document.addEventListener('DOMContentLoaded', function() {
    // Load products
    loadProducts();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load URL parameters
    loadUrlParameters();
});

async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        const data = await response.json();
        allProducts = data.products || [];
        
        // Load categories for filter
        loadCategories(data.categories || []);
        
        // Apply initial filters
        applyFilters();
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('productsContainer').innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Unable to load products</h3>
                <p>Please check your connection and try again.</p>
            </div>
        `;
    }
}

function loadCategories(categories) {
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter) return;
    
    let html = '';
    categories.forEach(category => {
        html += `
            <div class="filter-item">
                <input type="checkbox" id="cat-${category.id}" value="${category.id}">
                <label for="cat-${category.id}">${category.name}</label>
                <span class="filter-count">(${category.count})</span>
            </div>
        `;
    });
    
    categoryFilter.innerHTML = html;
}

function setupEventListeners() {
    // Price slider
    const priceSlider = document.getElementById('priceSlider');
    if (priceSlider) {
        priceSlider.addEventListener('input', function() {
            document.getElementById('priceValue').textContent = 
                this.value === '200' ? '£200+' : `£${this.value}`;
        });
    }
    
    // Sort select
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', applyFilters);
    }
    
    // View toggle buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentView = this.dataset.view;
            renderProducts();
        });
    });
    
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

function loadUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const search = urlParams.get('search');
    
    if (category) {
        const checkbox = document.querySelector(`#categoryFilter input[value="${category}"]`);
        if (checkbox) {
            checkbox.checked = true;
        }
    }
    
    if (search) {
        document.getElementById('searchInput').value = search;
    }
}

function applyFilters() {
    // Get selected categories
    const selectedCategories = Array.from(
        document.querySelectorAll('#categoryFilter input:checked')
    ).map(cb => cb.value);
    
    // Get max price
    const maxPrice = parseInt(document.getElementById('priceSlider').value);
    
    // Get sort option
    const sortBy = document.getElementById('sortSelect').value;
    
    // Apply filters
    filteredProducts = allProducts.filter(product => {
        // Category filter
        if (selectedCategories.length > 0) {
            const hasCategory = selectedCategories.some(cat => 
                product.category.includes(cat)
            );
            if (!hasCategory) return false;
        }
        
        // Price filter
        if (maxPrice < 200 && product.price > maxPrice) {
            return false;
        }
        
        // Search filter
        const searchQuery = sessionStorage.getItem('searchQuery');
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matches = product.name.toLowerCase().includes(query) ||
                           product.description.toLowerCase().includes(query) ||
                           product.category.some(cat => cat.toLowerCase().includes(query));
            if (!matches) return false;
        }
        
        return true;
    });
    
    // Sort products
    sortProducts(sortBy);
    
    // Reset to first page
    currentPage = 1;
    
    // Update product count
    updateProductsCount();
    
    // Render products
    renderProducts();
    
    // Clear search session
    sessionStorage.removeItem('searchQuery');
}

function sortProducts(sortBy) {
    switch (sortBy) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'rating':
            filteredProducts.sort((a, b) => b.rating - a.rating);
            break;
        default:
            // Default sorting (by ID or featured)
            filteredProducts.sort((a, b) => {
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return a.id.localeCompare(b.id);
            });
    }
}

function updateProductsCount() {
    const countElement = document.getElementById('productsCount');
    if (countElement) {
        countElement.textContent = `Showing ${filteredProducts.length} products`;
    }
}

function renderProducts() {
    const container = document.getElementById('productsContainer');
    if (!container) return;
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const pageProducts = filteredProducts.slice(startIndex, endIndex);
    
    if (pageProducts.length === 0) {
        container.innerHTML = `
            <div class="no-products">
                <i class="fas fa-search"></i>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms</p>
                <button class="btn btn-primary" onclick="clearFilters()">Clear All Filters</button>
            </div>
        `;
        document.getElementById('pagination').innerHTML = '';
        return;
    }
    
    // Render products based on view
    let html = '';
    if (currentView === 'grid') {
        container.classList.remove('list-view');
        pageProducts.forEach(product => {
            html += createProductCard(product);
        });
    } else {
        container.classList.add('list-view');
        pageProducts.forEach(product => {
            html += createProductCard(product, true);
        });
    }
    
    container.innerHTML = html;
    
    // Render pagination
    renderPagination(totalPages);
    
    // Add event listeners to product buttons
    addProductButtonListeners();
}

function createProductCard(product, isList = false) {
    const badge = product.featured ? '<span class="product-badge new">New</span>' : '';
    
    if (isList) {
        return `
            <div class="product-card" data-id="${product.id}">
                ${badge}
                <div class="product-image">
                    <img src="${product.image || 'https://images.unsplash.com/photo-1558769132-cb1faced3188?w=600&h=600&fit=crop'}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-meta">
                        <div class="product-price">£${product.price.toFixed(2)}</div>
                        <div class="product-rating">
                            ${generateStarRating(product.rating)}
                            <span>(${product.rating})</span>
                        </div>
                    </div>
                    <div class="product-actions">
                        <a href="product.html?id=${product.id}" class="product-btn secondary">
                            <i class="fas fa-eye"></i> View Details
                        </a>
                        <button class="product-btn primary add-to-cart-btn" data-id="${product.id}">
                            <i class="fas fa-shopping-bag"></i> Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    return `
        <div class="product-card" data-id="${product.id}">
            ${badge}
            <div class="product-image">
                <img src="${product.image || 'https://images.unsplash.com/photo-1558769132-cb1faced3188?w=600&h=600&fit=crop'}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description.substring(0, 60)}...</p>
                <div class="product-meta">
                    <div class="product-price">£${product.price.toFixed(2)}</div>
                    <div class="product-rating">
                        ${generateStarRating(product.rating)}
                    </div>
                </div>
                <div class="product-actions">
                    <a href="product.html?id=${product.id}" class="product-btn secondary">
                        <i class="fas fa-eye"></i>
                    </a>
                    <button class="product-btn primary add-to-cart-btn" data-id="${product.id}">
                        <i class="fas fa-shopping-bag"></i> Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;
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

function addProductButtonListeners() {
    // Add to cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.dataset.id;
            const product = allProducts.find(p => p.id === productId);
            if (product) {
                addToCart(product.id, product.name, product.price, 1, product.image);
            }
        });
    });
    

}

function renderPagination(totalPages) {
    const pagination = document.getElementById('pagination');
    if (!pagination || totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Previous button
    html += `
        <button class="pagination-btn ${currentPage === 1 ? 'disabled' : ''}" 
                onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
        html += `<button class="pagination-btn" onclick="changePage(1)">1</button>`;
        if (startPage > 2) {
            html += `<span class="pagination-dots">...</span>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        html += `
            <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                    onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += `<span class="pagination-dots">...</span>`;
        }
        html += `<button class="pagination-btn" onclick="changePage(${totalPages})">${totalPages}</button>`;
    }
    
    // Next button
    html += `
        <button class="pagination-btn ${currentPage === totalPages ? 'disabled' : ''}" 
                onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    pagination.innerHTML = html;
}

function changePage(page) {
    if (page < 1 || page > Math.ceil(filteredProducts.length / productsPerPage)) return;
    
    currentPage = page;
    renderProducts();
    
    // Scroll to top of products
    document.getElementById('productsContainer').scrollIntoView({
        behavior: 'smooth'
    });
}

function clearFilters() {
    // Uncheck all category checkboxes
    document.querySelectorAll('#categoryFilter input:checked').forEach(cb => {
        cb.checked = false;
    });
    
    // Reset price slider
    document.getElementById('priceSlider').value = 200;
    document.getElementById('priceValue').textContent = '£200+';
    
    // Reset sort select
    document.getElementById('sortSelect').value = 'default';
    
    // Clear search
    document.getElementById('searchInput').value = '';
    sessionStorage.removeItem('searchQuery');
    
    // Apply filters
    applyFilters();
}

function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    if (query) {
        sessionStorage.setItem('searchQuery', query);
        applyFilters();
    }
}



// Export functions
window.applyFilters = applyFilters;
window.clearFilters = clearFilters;
window.performSearch = performSearch;
window.changePage = changePage;