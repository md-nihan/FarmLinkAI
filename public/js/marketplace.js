// API Configuration
const API_BASE_URL = window.location.origin;

// State
let currentFilter = 'all';
let allProducts = [];
let selectedProductId = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupFilterButtons();
});

// Load products from API
async function loadProducts() {
    try {
        showLoading();
        
        const response = await fetch(`${API_BASE_URL}/api/products`);
        const data = await response.json();
        
        if (data.success && data.products) {
            allProducts = data.products;
            updateProductCount(data.products.length);
            renderProducts(data.products);
        } else {
            showEmptyState();
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showEmptyState();
    }
}

// Show loading state
function showLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('empty-state').style.display = 'none';
    document.getElementById('products-grid').style.display = 'none';
}

// Show empty state
function showEmptyState() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('empty-state').style.display = 'block';
    document.getElementById('products-grid').style.display = 'none';
}

// Update product count
function updateProductCount(count) {
    const countElement = document.getElementById('total-products');
    if (countElement) {
        // Animate number
        animateNumber(countElement, 0, count, 1000);
    }
}

// Animate number counting
function animateNumber(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.round(current);
    }, 16);
}

// Render products
function renderProducts(products) {
    const grid = document.getElementById('products-grid');
    
    if (!products || products.length === 0) {
        showEmptyState();
        return;
    }
    
    document.getElementById('loading').style.display = 'none';
    document.getElementById('empty-state').style.display = 'none';
    grid.style.display = 'grid';
    
    grid.innerHTML = products.map(product => createProductCard(product)).join('');
}

// Create product card HTML
function createProductCard(product) {
    const gradeClass = product.quality_grade.toLowerCase().includes('a') ? 'badge-a' : 
                       product.quality_grade.toLowerCase().includes('b') ? 'badge-b' : 'badge-c';
    
    // Handle image URL properly
    let imageUrl = 'https://via.placeholder.com/300x200?text=No+Image';
    if (product.image_url) {
      // If it's already a full URL, use it directly
      if (product.image_url.startsWith('http')) {
        imageUrl = product.image_url;
      } else {
        // Otherwise, construct the full URL
        // Make sure we don't double the slashes
        if (product.image_url.startsWith('/')) {
          imageUrl = `${API_BASE_URL}${product.image_url}`;
        } else {
          imageUrl = `${API_BASE_URL}/${product.image_url}`;
        }
      }
    }
    
    const createdDate = new Date(product.createdAt).toLocaleDateString();
    
    return `
        <div class="product-card glass-card" data-grade="${gradeClass}">
            <div class="product-image-container">
                <img src="${imageUrl}" alt="${product.product_name}" class="product-image" 
                     onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'; this.onerror=null;">
                <div class="product-badge ${gradeClass}">
                    ⭐ ${product.quality_grade}
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.product_name}</h3>
                
                <div class="product-details">
                    <div class="detail-item">
                        <span class="detail-icon">⚖️</span>
                        <span><strong>Quantity:</strong> ${product.quantity}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-icon">📅</span>
                        <span><strong>Listed:</strong> ${createdDate}</span>
                    </div>
                    ${product.quality_score ? `
                    <div class="detail-item">
                        <span class="detail-icon">🎯</span>
                        <span><strong>AI Score:</strong> ${product.quality_score}/100</span>
                    </div>
                    ` : ''}
                </div>
                
                <div class="farmer-info">
                    <p><strong>🧑‍🌾 Farmer:</strong> ${product.farmer_name || 'N/A'}</p>
                    ${product.farmer_location ? `<p><strong>📍 Location:</strong> ${product.farmer_location}</p>` : ''}
                </div>
                
                <div class="product-actions">
                    <button class="btn btn-primary" onclick="openOrderModal('${product._id}')">
                        🛒 Order Now
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Setup filter buttons
function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter products
            const filter = button.dataset.filter;
            currentFilter = filter;
            filterProducts(filter);
        });
    });
}

// Filter products
function filterProducts(filter) {
    let filtered = allProducts;
    
    if (filter === 'a') {
        filtered = allProducts.filter(p => p.quality_grade.toLowerCase().includes('a'));
    } else if (filter === 'b') {
        filtered = allProducts.filter(p => p.quality_grade.toLowerCase().includes('b'));
    }
    
    renderProducts(filtered);
}

// Open order modal
function openOrderModal(productId) {
    const product = allProducts.find(p => p._id === productId);
    
    if (!product) {
        showToast('Product not found', 'error');
        return;
    }
    
    selectedProductId = productId;
    
    // Populate modal with product info
    const productInfo = document.getElementById('order-product-info');
    productInfo.innerHTML = `
        <div class="product-details" style="margin-bottom: 20px;">
            <h4 style="margin-bottom: 10px;">📦 ${product.product_name}</h4>
            <p><strong>Quantity:</strong> ${product.quantity}</p>
            <p><strong>Quality:</strong> ${product.quality_grade}</p>
            <p><strong>Farmer:</strong> ${product.farmer_name || 'N/A'}</p>
            ${product.farmer_location ? `<p><strong>Location:</strong> ${product.farmer_location}</p>` : ''}
        </div>
    `;
    
    // Show modal
    const modal = document.getElementById('order-modal');
    modal.classList.add('active');
    
    // Setup form submit
    const form = document.getElementById('order-form');
    form.onsubmit = (e) => {
        e.preventDefault();
        placeOrder();
    };
}

// Close order modal
function closeOrderModal() {
    const modal = document.getElementById('order-modal');
    modal.classList.remove('active');
    selectedProductId = null;
    
    // Reset form
    document.getElementById('order-form').reset();
}

// Place order
async function placeOrder() {
    const buyerName = document.getElementById('buyer-name').value.trim();
    const buyerPhone = document.getElementById('buyer-phone').value.trim();
    
    if (!buyerName || !buyerPhone) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    try {
        // Disable submit button
        const submitBtn = document.querySelector('#order-form button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Placing Order...';
        
        const response = await fetch(`${API_BASE_URL}/api/products/order/${selectedProductId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                buyer_name: buyerName,
                buyer_phone: buyerPhone
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('✅ Order placed successfully! Farmer will contact you soon.', 'success');
            closeOrderModal();
            
            // Reload products to update availability
            setTimeout(() => {
                loadProducts();
            }, 1500);
        } else {
            showToast(data.message || 'Failed to place order', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Confirm Order';
        }
    } catch (error) {
        console.error('Error placing order:', error);
        showToast('An error occurred. Please try again.', 'error');
        
        const submitBtn = document.querySelector('#order-form button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirm Order';
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('.toast-icon');
    
    toastMessage.textContent = message;
    toastIcon.textContent = type === 'success' ? '✅' : '❌';
    
    toast.classList.add('active');
    
    setTimeout(() => {
        toast.classList.remove('active');
    }, 4000);
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        closeOrderModal();
    }
});

// Auto-refresh products every 30 seconds
setInterval(() => {
    loadProducts();
}, 30000);
