// API Configuration
const API_BASE_URL = window.location.origin;

// State
let allFarmers = [];
let allProducts = [];
let pendingFarmers = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check if admin is logged in
    const token = localStorage.getItem('adminToken');
    if (!token) {
        // Redirect to login page
        window.location.href = 'login.html';
        return;
    }
    
    loadFarmers();
    loadPendingFarmers();
    loadAllProducts();
    loadStats();
    setupEditFarmerForm();
});

// Add logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        window.location.href = 'login.html';
    }
}

// Load statistics
async function loadStats() {
    try {
        // Load farmers
        const farmersResponse = await fetch(`${API_BASE_URL}/api/farmers`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        const farmersData = await farmersResponse.json();
        
        if (farmersData.success) {
            const totalFarmers = farmersData.farmers.length;
            const activeFarmers = farmersData.farmers.filter(f => f.isActive).length;
            
            animateNumber(document.getElementById('total-farmers'), 0, totalFarmers, 1000);
            animateNumber(document.getElementById('active-farmers'), 0, activeFarmers, 1000);
        }
        
        // Load products
        const productsResponse = await fetch(`${API_BASE_URL}/api/products`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        const productsData = await productsResponse.json();
        
        if (productsData.success) {
            const totalProducts = productsData.products.length;
            const orderedProducts = productsData.products.filter(p => p.status === 'ordered').length;
            
            animateNumber(document.getElementById('total-products-admin'), 0, totalProducts, 1000);
            animateNumber(document.getElementById('total-orders'), 0, orderedProducts, 1000);
        }
    } catch (error) {
        console.error('Error loading stats:', error);
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

// Load pending farmers (new function)
async function loadPendingFarmers() {
    try {
        showPendingFarmersLoading();
        
        const response = await fetch(`${API_BASE_URL}/api/farmers?status=pending`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        const data = await response.json();
        
        if (data.success && data.farmers) {
            pendingFarmers = data.farmers;
            renderPendingFarmers(data.farmers);
        } else {
            showPendingFarmersEmpty();
        }
    } catch (error) {
        console.error('Error loading pending farmers:', error);
        showPendingFarmersEmpty();
    }
}

// Show pending farmers loading
function showPendingFarmersLoading() {
    document.getElementById('pending-farmers-loading').style.display = 'block';
    document.getElementById('pending-farmers-empty').style.display = 'none';
    document.getElementById('pending-farmers-table-container').style.display = 'none';
}

// Show pending farmers empty
function showPendingFarmersEmpty() {
    document.getElementById('pending-farmers-loading').style.display = 'none';
    document.getElementById('pending-farmers-empty').style.display = 'block';
    document.getElementById('pending-farmers-table-container').style.display = 'none';
}

// Render pending farmers
function renderPendingFarmers(farmers) {
    if (!farmers || farmers.length === 0) {
        showPendingFarmersEmpty();
        return;
    }
    
    document.getElementById('pending-farmers-loading').style.display = 'none';
    document.getElementById('pending-farmers-empty').style.display = 'none';
    document.getElementById('pending-farmers-table-container').style.display = 'block';
    
    const tbody = document.getElementById('pending-farmers-table-body');
    tbody.innerHTML = farmers.map(farmer => createPendingFarmerRow(farmer)).join('');
}

// Create pending farmer row
function createPendingFarmerRow(farmer) {
    const joinedDate = new Date(farmer.createdAt).toLocaleDateString();
    const location = `${farmer.village}, ${farmer.district}`;
    
    return `
        <tr>
            <td><strong>${farmer.name}</strong></td>
            <td>${farmer.phone}</td>
            <td>${location}</td>
            <td>${farmer.crops || 'N/A'}</td>
            <td>${joinedDate}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-small btn-primary" onclick="approveFarmer('${farmer._id}', '${farmer.name}')">
                        ✅ Approve
                    </button>
                    <button class="btn btn-small btn-delete" onclick="rejectFarmer('${farmer._id}', '${farmer.name}')">
                        ❌ Reject
                    </button>
                </div>
            </td>
        </tr>
    `;
}

// Approve farmer
async function approveFarmer(farmerId, farmerName) {
    if (!confirm(`Are you sure you want to approve farmer "${farmerName}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/farmers/approve/${farmerId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(`✅ Farmer ${farmerName} approved successfully!`, 'success');
            if (data.joinInstructions) {
                alert(`WhatsApp Join Steps for ${farmerName}:\n\n${data.joinInstructions}`);
            }
            loadPendingFarmers();
            loadFarmers();
            loadStats();
        } else {
            showToast(data.message || 'Failed to approve farmer', 'error');
        }
    } catch (error) {
        console.error('Error approving farmer:', error);
        showToast('An error occurred. Please try again.', 'error');
    }
}

// Reject farmer
async function rejectFarmer(farmerId, farmerName) {
    const reason = prompt(`Reason for rejecting farmer "${farmerName}" (optional):`);
    
    if (reason === null) {
        return; // User cancelled
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/farmers/reject/${farmerId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({ reason })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(`❌ Farmer ${farmerName} rejected!`, 'success');
            loadPendingFarmers();
            loadFarmers();
            loadStats();
        } else {
            showToast(data.message || 'Failed to reject farmer', 'error');
        }
    } catch (error) {
        console.error('Error rejecting farmer:', error);
        showToast('An error occurred. Please try again.', 'error');
    }
}

// Load farmers
async function loadFarmers() {
    try {
        showFarmersLoading();
        
        // Load only approved farmers
        console.log('Loading only approved farmers...');
        const response = await fetch(`${API_BASE_URL}/api/farmers?status=approved`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        const data = await response.json();
        
        console.log('Approved farmers loaded:', data);
        
        if (data.success && data.farmers) {
            allFarmers = data.farmers;
            renderFarmers(data.farmers);
        } else {
            showFarmersEmpty();
        }
    } catch (error) {
        console.error('Error loading farmers:', error);
        showFarmersEmpty();
    }
}

// Show farmers loading
function showFarmersLoading() {
    document.getElementById('farmers-loading').style.display = 'block';
    document.getElementById('farmers-empty').style.display = 'none';
    document.getElementById('farmers-table-container').style.display = 'none';
}

// Show farmers empty
function showFarmersEmpty() {
    document.getElementById('farmers-loading').style.display = 'none';
    document.getElementById('farmers-empty').style.display = 'block';
    document.getElementById('farmers-table-container').style.display = 'none';
}

// Render farmers
function renderFarmers(farmers) {
    if (!farmers || farmers.length === 0) {
        showFarmersEmpty();
        return;
    }
    
    document.getElementById('farmers-loading').style.display = 'none';
    document.getElementById('farmers-empty').style.display = 'none';
    document.getElementById('farmers-table-container').style.display = 'block';
    
    const tbody = document.getElementById('farmers-table-body');
    tbody.innerHTML = farmers.map(farmer => createFarmerRow(farmer)).join('');
}

// Create farmer row
function createFarmerRow(farmer) {
    const joinedDate = new Date(farmer.createdAt).toLocaleDateString();
    const statusClass = farmer.isActive ? 'status-active' : 'status-inactive';
    const statusText = farmer.isActive ? 'Active' : 'Inactive';
    
    // Show approval status for approved farmers
    const approvalStatus = farmer.approvalStatus === 'approved' ? 'Approved' : farmer.approvalStatus;
    
    return `
        <tr>
            <td><strong>${farmer.name}</strong></td>
            <td>${farmer.phone}</td>
            <td>${farmer.location || 'N/A'}</td>
            <td>
                <span class="status-badge ${statusClass}">${approvalStatus}</span>
            </td>
            <td>${joinedDate}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-small btn-edit" onclick="openEditModal('${farmer._id}')">
                        ✏️ Edit
                    </button>
                    <button class="btn btn-small btn-delete" onclick="deleteFarmer('${farmer._id}', '${farmer.name}')">
                        🗑️ Delete
                    </button>
                </div>
            </td>
        </tr>
    `;
}

// Open edit modal
function openEditModal(farmerId) {
    const farmer = allFarmers.find(f => f._id === farmerId);
    
    if (!farmer) {
        showToast('Farmer not found', 'error');
        return;
    }
    
    // Populate form
    document.getElementById('edit-farmer-id').value = farmer._id;
    document.getElementById('edit-farmer-name').value = farmer.name;
    document.getElementById('edit-farmer-phone').value = farmer.phone;
    document.getElementById('edit-farmer-location').value = farmer.location || '';
    document.getElementById('edit-farmer-status').value = farmer.isActive.toString();
    
    // Show modal
    const modal = document.getElementById('edit-modal');
    modal.classList.add('active');
}

// Close edit modal
function closeEditModal() {
    const modal = document.getElementById('edit-modal');
    modal.classList.remove('active');
    document.getElementById('edit-farmer-form').reset();
}

// Setup edit farmer form
function setupEditFarmerForm() {
    const form = document.getElementById('edit-farmer-form');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('edit-farmer-id').value;
        const name = document.getElementById('edit-farmer-name').value.trim();
        const phone = document.getElementById('edit-farmer-phone').value.trim();
        const location = document.getElementById('edit-farmer-location').value.trim();
        const isActive = document.getElementById('edit-farmer-status').value === 'true';
        
        try {
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';
            
            const response = await fetch(`${API_BASE_URL}/api/farmers/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify({ name, phone, location, isActive })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showToast('✅ Farmer updated successfully!', 'success');
                closeEditModal();
                loadFarmers();
                loadStats();
            } else {
                showToast(data.message || 'Failed to update farmer', 'error');
            }
            
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Changes';
            
        } catch (error) {
            console.error('Error updating farmer:', error);
            showToast('An error occurred. Please try again.', 'error');
            
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Changes';
        }
    });
}

// Delete farmer
async function deleteFarmer(farmerId, farmerName) {
    if (!confirm(`Are you sure you want to delete farmer "${farmerName}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/farmers/${farmerId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('✅ Farmer deleted successfully!', 'success');
            loadFarmers();
            loadStats();
        } else {
            showToast(data.message || 'Failed to delete farmer', 'error');
        }
    } catch (error) {
        console.error('Error deleting farmer:', error);
        showToast('An error occurred. Please try again.', 'error');
    }
}

// Load all products
async function loadAllProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/products`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        const data = await response.json();
        
        if (data.success && data.products) {
            allProducts = data.products;
            renderAllProducts(data.products);
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Render all products
function renderAllProducts(products) {
    const container = document.getElementById('products-table-container');
    
    if (!products || products.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 20px;">No products listed yet.</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="table-responsive">
            <table class="farmers-table products-mini-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Farmer</th>
                        <th>Quality</th>
                        <th>Status</th>
                        <th>Listed</th>
                    </tr>
                </thead>
                <tbody>
                    ${products.map(product => `
                        <tr>
                            <td><strong>${product.product_name}</strong></td>
                            <td>${product.quantity}</td>
                            <td>${product.farmer_name || 'N/A'}</td>
                            <td>${product.quality_grade}</td>
                            <td>
                                <span class="product-status-badge status-${product.status}">
                                    ${product.status}
                                </span>
                            </td>
                            <td>${new Date(product.createdAt).toLocaleDateString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
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
        closeEditModal();
    }
});