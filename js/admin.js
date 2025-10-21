// Admin Panel Functionality
let adminProducts = [];
let adminMode = false;
let currentAdminUser = null;
let adminUsers = [];
let regularUsers = [];

// Initialize admin panel
document.addEventListener('DOMContentLoaded', async function() {
    checkAdminAuth();
    loadAdminProducts();
    loadAdminUsers();
    await loadRegularUsers();
    updateAnalytics();
});

// Admin authentication check
function checkAdminAuth() {
    const adminSession = localStorage.getItem('adminSession');
    if (!adminSession) {
        showAdminLogin();
        return false;
    }
    
    try {
        currentAdminUser = JSON.parse(adminSession);
        return true;
    } catch (e) {
        showAdminLogin();
        return false;
    }
}

// Show admin login
function showAdminLogin() {
    const modal = document.createElement('div');
    modal.className = 'admin-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Admin Login Required</h3>
            </div>
            <form id="adminLoginForm">
                <div class="form-group">
                    <label>Admin Username</label>
                    <input type="text" id="adminUsername" required>
                </div>
                <div class="form-group">
                    <label>Admin Password</label>
                    <input type="password" id="adminPassword" required>
                </div>
                <div class="form-actions">
                    <button type="submit" class="submit-btn">Login</button>
                    <button type="button" onclick="window.location.href='index.html'" class="cancel-btn">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('adminLoginForm').onsubmit = function(e) {
        e.preventDefault();
        handleAdminLogin();
    };
}

// Handle admin login
function handleAdminLogin() {
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    // Check against stored admin users
    const admins = JSON.parse(localStorage.getItem('adminUsers') || '[]');
    const admin = admins.find(a => a.username === username && a.password === password);
    
    if (admin || (username === 'admin' && password === 'LHL2024')) {
        const adminData = admin || {
            id: 'default-admin',
            username: 'admin',
            email: 'admin@lohoba.com',
            role: 'super-admin',
            created: new Date().toISOString()
        };
        
        currentAdminUser = adminData;
        localStorage.setItem('adminSession', JSON.stringify(adminData));
        document.querySelector('.admin-modal').remove();
        showNotification('Admin login successful!', 'success');
    } else {
        showNotification('Invalid admin credentials!', 'error');
    }
}

// Load admin users
function loadAdminUsers() {
    const stored = localStorage.getItem('adminUsers');
    adminUsers = stored ? JSON.parse(stored) : [];
}

// Load regular users from Supabase
async function loadRegularUsers() {
    try {
        const { data: users, error } = await supabase.auth.admin.listUsers();
        if (error) {
            console.error('Error loading users from Supabase:', error);
            // Fallback to localStorage
            const stored = localStorage.getItem('lohobaUsers');
            regularUsers = stored ? JSON.parse(stored) : [];
        } else {
            regularUsers = users.map(user => ({
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.email,
                created_at: user.created_at,
                status: user.banned_until ? 'suspended' : 'active',
                last_sign_in_at: user.last_sign_in_at
            }));
        }
    } catch (error) {
        console.error('Error connecting to Supabase:', error);
        // Fallback to localStorage
        const stored = localStorage.getItem('lohobaUsers');
        regularUsers = stored ? JSON.parse(stored) : [];
    }
}

// Load products for admin management
function loadAdminProducts() {
    const savedProducts = localStorage.getItem('adminProducts');
    if (savedProducts) {
        try {
            adminProducts = JSON.parse(savedProducts);
        } catch (e) {
            adminProducts = window.sampleProducts || [];
        }
    } else {
        adminProducts = window.sampleProducts || [];
    }
    displayProductList();
}

// Display product list in admin panel
function displayProductList() {
    const productList = document.getElementById('productList');
    if (!productList) return;
    
    if (adminProducts.length === 0) {
        productList.innerHTML = '<p class="no-data">No products found. Add your first product!</p>';
        return;
    }
    
    productList.innerHTML = adminProducts.map(product => `
        <div class="product-item">
            <img src="${product.preview}" alt="${product.name}" class="product-thumb">
            <div class="product-info">
                <h4>${product.name}</h4>
                <p class="product-brand">${product.brand}</p>
                <p class="product-price">₦${product.price}</p>
                <p class="product-type">${product.isAccessory ? 'Accessory' : 'Clothing'}</p>
            </div>
            <div class="product-actions">
                <button onclick="editProduct('${product.id}')" class="edit-btn">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button onclick="deleteProduct('${product.id}')" class="delete-btn">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Show management sections
function showProductManagement() {
    hideAllSections();
    document.getElementById('productManagement').style.display = 'block';
    loadAdminProducts();
}

function showOrderManagement() {
    hideAllSections();
    document.getElementById('orderManagement').style.display = 'block';
    loadOrders();
}

function showCustomerManagement() {
    hideAllSections();
    document.getElementById('customerManagement').style.display = 'block';
    loadCustomers();
}

async function showUserManagement() {
    hideAllSections();
    document.getElementById('userManagement').style.display = 'block';
    await displayUserList();
}

function showAdminManagement() {
    hideAllSections();
    document.getElementById('adminManagement').style.display = 'block';
    displayAdminList();
}

function showSecuritySettings() {
    hideAllSections();
    document.getElementById('securitySettings').style.display = 'block';
    loadSecuritySettings();
}

function showSettings() {
    hideAllSections();
    document.getElementById('settings').style.display = 'block';
    loadGeneralSettings();
}

function showAnalytics() {
    hideAllSections();
    document.getElementById('analytics').style.display = 'block';
    updateAnalytics();
}

function hideAllSections() {
    const sections = document.querySelectorAll('.management-section');
    sections.forEach(section => section.style.display = 'none');
}

// Product management functions
function showAddProductForm() {
    const modal = document.createElement('div');
    modal.className = 'admin-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Add New Product</h3>
                <button onclick="this.closest('.admin-modal').remove()" class="close-modal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form id="addProductForm">
                <div class="form-group">
                    <label>Product Name</label>
                    <input type="text" id="productName" required>
                </div>
                <div class="form-group">
                    <label>Brand</label>
                    <input type="text" id="productBrand" value="Lohoba Luxury" required>
                </div>
                <div class="form-group">
                    <label>Price (₦)</label>
                    <input type="number" id="productPrice" required>
                </div>
                <div class="form-group">
                    <label>Product Image</label>
                    <div class="image-upload-section" id="imageUploadArea" ondrop="handleDrop(event)" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)">
                        <div class="upload-icon">
                            <i class="fas fa-cloud-upload-alt" style="font-size: 48px; color: #007bff; margin-bottom: 15px;"></i>
                        </div>
                        <p style="margin: 10px 0; color: #666; font-size: 16px;">Drag & drop image here or click to browse</p>
                        <input type="file" id="productImageFile" accept="image/*" onchange="handleImageUpload(this)" style="display: none;">
                        <button type="button" onclick="document.getElementById('productImageFile').click()" class="upload-btn">
                            <i class="fas fa-upload"></i> Choose Image
                        </button>
                        <small style="color: #999; display: block; margin: 15px 0 10px 0;">Supports: JPG, PNG, GIF (max 2MB)</small>
                        <div style="display: flex; align-items: center; margin: 15px 0;">
                            <hr style="flex: 1; border: none; border-top: 1px solid #ddd;">
                            <span style="margin: 0 15px; color: #999; font-size: 14px;">OR</span>
                            <hr style="flex: 1; border: none; border-top: 1px solid #ddd;">
                        </div>
                        <input type="text" id="productImage" placeholder="Enter image URL" style="margin-bottom: 15px;">
                        <div id="imagePreview" class="image-preview"></div>
                    </div>
                </div>
                <div class="form-group">
                    <label>Category</label>
                    <select id="productType" required>
                        <option value="false">Clothing</option>
                        <option value="true">Accessory</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit" class="submit-btn">Add Product</button>
                    <button type="button" onclick="this.closest('.admin-modal').remove()" class="cancel-btn">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('addProductForm').onsubmit = function(e) {
        e.preventDefault();
        addNewProduct();
        modal.remove();
    };
}

function addNewProduct() {
    const imageUrl = document.getElementById('productImage').value || 'img/default-product.png';
    
    const newProduct = {
        id: Date.now().toString(),
        name: document.getElementById('productName').value,
        brand: document.getElementById('productBrand').value,
        price: document.getElementById('productPrice').value,
        preview: imageUrl,
        isAccessory: document.getElementById('productType').value === 'true'
    };
    
    adminProducts.push(newProduct);
    saveAdminProducts();
    displayProductList();
    updateAnalytics();
    showNotification('Product added successfully!');
}

// Handle drag and drop
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e, mode = 'add') {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        processImageFile(file, mode);
    }
}

// Handle image upload
function handleImageUpload(input, mode = 'add') {
    const file = input.files[0];
    if (!file) return;
    
    processImageFile(file, mode);
}

// Process image file (common function for upload and drag-drop)
function processImageFile(file, mode = 'add') {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('Please select a valid image file (JPG, PNG, GIF)!', 'error');
        return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        showNotification('Image size should be less than 2MB!', 'error');
        return;
    }
    
    // Show loading state
    const uploadArea = mode === 'edit' ? 
        document.getElementById('editImageUploadArea') : 
        document.getElementById('imageUploadArea');
    uploadArea.classList.add('uploading');
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageUrl = e.target.result;
        
        // Update the URL input
        const urlInput = mode === 'edit' ? 
            document.getElementById('editProductImage') : 
            document.getElementById('productImage');
        urlInput.value = imageUrl;
        
        // Show preview
        const previewDiv = mode === 'edit' ? 
            document.getElementById('editImagePreview') : 
            document.getElementById('imagePreview');
        previewDiv.innerHTML = `
            <div style="text-align: center; margin-top: 15px;">
                <p style="color: #28a745; margin-bottom: 10px; font-weight: 500;">
                    <i class="fas fa-check-circle"></i> Image uploaded successfully!
                </p>
                <img src="${imageUrl}" alt="Preview" style="max-width: 150px; max-height: 150px; border-radius: 8px; object-fit: cover; border: 3px solid #28a745; box-shadow: 0 4px 12px rgba(40,167,69,0.3);">
                <button type="button" onclick="removeImage('${mode}')" style="display: block; margin: 10px auto 0; background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        `;
        
        // Remove loading state
        uploadArea.classList.remove('uploading');
        uploadArea.classList.add('upload-success');
        
        showNotification('Image uploaded successfully!', 'success');
    };
    
    reader.onerror = function() {
        uploadArea.classList.remove('uploading');
        showNotification('Error reading image file!', 'error');
    };
    
    reader.readAsDataURL(file);
}

// Remove uploaded image
function removeImage(mode = 'add') {
    const urlInput = mode === 'edit' ? 
        document.getElementById('editProductImage') : 
        document.getElementById('productImage');
    const previewDiv = mode === 'edit' ? 
        document.getElementById('editImagePreview') : 
        document.getElementById('imagePreview');
    const uploadArea = mode === 'edit' ? 
        document.getElementById('editImageUploadArea') : 
        document.getElementById('imageUploadArea');
    
    urlInput.value = mode === 'edit' ? '' : '';
    previewDiv.innerHTML = '';
    uploadArea.classList.remove('upload-success');
    
    showNotification('Image removed!', 'success');
}

function editProduct(productId) {
    const product = adminProducts.find(p => p.id === productId);
    if (!product) return;
    
    const modal = document.createElement('div');
    modal.className = 'admin-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Edit Product</h3>
                <button onclick="this.closest('.admin-modal').remove()" class="close-modal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form id="editProductForm">
                <div class="form-group">
                    <label>Product Name</label>
                    <input type="text" id="editProductName" value="${product.name}" required>
                </div>
                <div class="form-group">
                    <label>Brand</label>
                    <input type="text" id="editProductBrand" value="${product.brand}" required>
                </div>
                <div class="form-group">
                    <label>Price (₦)</label>
                    <input type="number" id="editProductPrice" value="${product.price}" required>
                </div>
                <div class="form-group">
                    <label>Product Image</label>
                    <div class="image-upload-section" id="editImageUploadArea" ondrop="handleDrop(event, 'edit')" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)">
                        <div class="current-image" style="margin-bottom: 15px;">
                            <p style="color: #666; margin-bottom: 10px;">Current Image:</p>
                            <img src="${product.preview}" alt="Current image" style="max-width: 120px; max-height: 120px; border-radius: 8px; border: 2px solid #ddd;">
                        </div>
                        <div class="upload-icon">
                            <i class="fas fa-cloud-upload-alt" style="font-size: 36px; color: #007bff; margin-bottom: 10px;"></i>
                        </div>
                        <p style="margin: 10px 0; color: #666;">Drag & drop new image or click to browse</p>
                        <input type="file" id="editProductImageFile" accept="image/*" onchange="handleImageUpload(this, 'edit')" style="display: none;">
                        <button type="button" onclick="document.getElementById('editProductImageFile').click()" class="upload-btn">
                            <i class="fas fa-upload"></i> Change Image
                        </button>
                        <small style="color: #999; display: block; margin: 15px 0 10px 0;">Supports: JPG, PNG, GIF (max 2MB)</small>
                        <div style="display: flex; align-items: center; margin: 15px 0;">
                            <hr style="flex: 1; border: none; border-top: 1px solid #ddd;">
                            <span style="margin: 0 15px; color: #999; font-size: 14px;">OR</span>
                            <hr style="flex: 1; border: none; border-top: 1px solid #ddd;">
                        </div>
                        <input type="text" id="editProductImage" value="${product.preview}" placeholder="Enter image URL">
                        <div id="editImagePreview" class="image-preview"></div>
                    </div>
                </div>
                <div class="form-group">
                    <label>Category</label>
                    <select id="editProductType" required>
                        <option value="false" ${!product.isAccessory ? 'selected' : ''}>Clothing</option>
                        <option value="true" ${product.isAccessory ? 'selected' : ''}>Accessory</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit" class="submit-btn">Update Product</button>
                    <button type="button" onclick="this.closest('.admin-modal').remove()" class="cancel-btn">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('editProductForm').onsubmit = function(e) {
        e.preventDefault();
        updateProduct(productId);
        modal.remove();
    };
}

function updateProduct(productId) {
    const index = adminProducts.findIndex(p => p.id === productId);
    if (index === -1) return;
    
    const imageUrl = document.getElementById('editProductImage').value || adminProducts[index].preview;
    
    adminProducts[index] = {
        ...adminProducts[index],
        name: document.getElementById('editProductName').value,
        brand: document.getElementById('editProductBrand').value,
        price: document.getElementById('editProductPrice').value,
        preview: imageUrl,
        isAccessory: document.getElementById('editProductType').value === 'true'
    };
    
    saveAdminProducts();
    displayProductList();
    showNotification('Product updated successfully!');
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        adminProducts = adminProducts.filter(p => p.id !== productId);
        saveAdminProducts();
        displayProductList();
        updateAnalytics();
        showNotification('Product deleted successfully!');
    }
}

function saveAdminProducts() {
    localStorage.setItem('adminProducts', JSON.stringify(adminProducts));
    window.sampleProducts = adminProducts;
}

function syncWithWebsite() {
    saveAdminProducts();
    if (window.opener && window.opener.refreshWebsiteProducts) {
        window.opener.refreshWebsiteProducts();
    }
    showNotification('Products synced with website!');
}

// Toggle admin mode
function toggleAdminMode() {
    adminMode = !adminMode;
    const btn = document.getElementById('adminModeBtn');
    if (adminMode) {
        btn.innerHTML = '<i class="fas fa-eye"></i> Disable Edit Mode';
        btn.classList.add('active');
        if (window.opener && window.opener.toggleAdminMode) {
            window.opener.toggleAdminMode(true);
        }
    } else {
        btn.innerHTML = '<i class="fas fa-edit"></i> Enable Edit Mode';
        btn.classList.remove('active');
        if (window.opener && window.opener.toggleAdminMode) {
            window.opener.toggleAdminMode(false);
        }
    }
}

// Load orders
function loadOrders() {
    const orderList = document.getElementById('orderList');
    const orders = JSON.parse(localStorage.getItem('lohobaOrders') || '[]');
    
    if (orders.length === 0) {
        orderList.innerHTML = '<p class="no-data">No orders found. Orders will appear here when customers make purchases.</p>';
        return;
    }
    
    orderList.innerHTML = orders.map(order => `
        <div class="order-item">
            <div class="order-header">
                <h4>Order #${order.id}</h4>
                <span class="order-date">${new Date(order.date).toLocaleDateString()}</span>
            </div>
            <div class="order-details">
                <p><strong>Customer:</strong> ${order.customerName || 'N/A'}</p>
                <p><strong>Email:</strong> ${order.customerEmail || 'N/A'}</p>
                <p><strong>Total:</strong> ₦${order.total}</p>
                <p><strong>Status:</strong> <span class="status ${order.status}">${order.status}</span></p>
            </div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-product">
                        <span>${item.name} x${item.quantity}</span>
                        <span>₦${item.price}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// Load customers
async function loadCustomers() {
    const customerList = document.getElementById('customerList');
    
    try {
        // Try to get users from Supabase
        const { data: users, error } = await supabase.auth.admin.listUsers();
        
        if (error) {
            // Fallback to local storage for demo purposes
            const localUsers = getLocalUsers();
            if (localUsers.length === 0) {
                customerList.innerHTML = '<p class="no-data">No registered users found. Users will appear here after they sign up.</p>';
                return;
            }
            
            customerList.innerHTML = localUsers.map(user => `
                <div class="customer-item">
                    <div class="customer-info">
                        <h4>${user.full_name || 'N/A'}</h4>
                        <p><strong>Email:</strong> ${user.email}</p>
                        <p><strong>Joined:</strong> ${user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
                        <p><strong>Status:</strong> <span class="status active">Active</span></p>
                    </div>
                    <div class="customer-actions">
                        <button onclick="viewUserDetails('${user.id}')" class="view-btn">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                    </div>
                </div>
            `).join('');
            return;
        }
        
        if (users.length === 0) {
            customerList.innerHTML = '<p class="no-data">No registered customers found.</p>';
            return;
        }
        
        customerList.innerHTML = users.map(user => `
            <div class="customer-item">
                <div class="customer-info">
                    <h4>${user.user_metadata?.full_name || 'N/A'}</h4>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Joined:</strong> ${new Date(user.created_at).toLocaleDateString()}</p>
                    <p><strong>Last Sign In:</strong> ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}</p>
                    <p><strong>Status:</strong> <span class="status active">Active</span></p>
                </div>
                <div class="customer-actions">
                    <button onclick="viewUserDetails('${user.id}')" class="view-btn">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        customerList.innerHTML = '<p class="no-data">Error loading customer data.</p>';
    }
}

// Display user list
async function displayUserList() {
    const userList = document.getElementById('userList');
    if (!userList) return;
    
    userList.innerHTML = '<p class="no-data">Loading users...</p>';
    
    await loadRegularUsers();
    
    if (regularUsers.length === 0) {
        userList.innerHTML = '<p class="no-data">No users found.</p>';
        return;
    }
    
    userList.innerHTML = regularUsers.map(user => `
        <div class="user-item">
            <div class="user-info">
                <h4>${user.full_name || 'N/A'}</h4>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Joined:</strong> ${user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
                <p><strong>Last Sign In:</strong> ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}</p>
                <p><strong>Status:</strong> <span class="status ${user.status || 'active'}">${user.status || 'Active'}</span></p>
            </div>
            <div class="user-actions">
                <button onclick="viewUserDetails('${user.id}')" class="view-btn">
                    <i class="fas fa-eye"></i> View Details
                </button>
                <button onclick="toggleUserStatus('${user.id}')" class="status-btn">
                    <i class="fas fa-toggle-on"></i> ${user.status === 'suspended' ? 'Activate' : 'Suspend'}
                </button>
                <button onclick="deleteUser('${user.id}')" class="delete-btn">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Display admin list
function displayAdminList() {
    const adminList = document.getElementById('adminList');
    if (!adminList) return;
    
    if (adminUsers.length === 0) {
        adminList.innerHTML = '<p class="no-data">No admin users found. Create your first admin user!</p>';
        return;
    }
    
    adminList.innerHTML = adminUsers.map(admin => `
        <div class="admin-item">
            <div class="admin-info">
                <h4>${admin.username}</h4>
                <p><strong>Email:</strong> ${admin.email}</p>
                <p><strong>Role:</strong> <span class="role ${admin.role}">${admin.role}</span></p>
                <p><strong>Created:</strong> ${new Date(admin.created).toLocaleDateString()}</p>
            </div>
            <div class="admin-actions">
                <button onclick="editAdmin('${admin.id}')" class="edit-btn">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button onclick="deleteAdmin('${admin.id}')" class="delete-btn">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Create new user
function showCreateUserForm() {
    const modal = document.createElement('div');
    modal.className = 'admin-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Create New User</h3>
                <button onclick="this.closest('.admin-modal').remove()" class="close-modal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form id="createUserForm">
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" id="userFullName" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="userEmail" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="userPassword" required minlength="6">
                </div>
                <div class="form-actions">
                    <button type="submit" class="submit-btn">Create User</button>
                    <button type="button" onclick="this.closest('.admin-modal').remove()" class="cancel-btn">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('createUserForm').onsubmit = function(e) {
        e.preventDefault();
        createNewUser();
        modal.remove();
    };
}

// Create new admin
function showCreateAdminForm() {
    const modal = document.createElement('div');
    modal.className = 'admin-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Create New Admin</h3>
                <button onclick="this.closest('.admin-modal').remove()" class="close-modal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form id="createAdminForm">
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" id="adminNewUsername" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="adminNewEmail" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="adminNewPassword" required minlength="6">
                </div>
                <div class="form-group">
                    <label>Role</label>
                    <select id="adminRole" required>
                        <option value="admin">Admin</option>
                        <option value="super-admin">Super Admin</option>
                        <option value="moderator">Moderator</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit" class="submit-btn">Create Admin</button>
                    <button type="button" onclick="this.closest('.admin-modal').remove()" class="cancel-btn">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('createAdminForm').onsubmit = function(e) {
        e.preventDefault();
        createNewAdmin();
        modal.remove();
    };
}

// Create new user function
async function createNewUser() {
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;
    const fullName = document.getElementById('userFullName').value;
    
    try {
        const { data, error } = await supabase.auth.admin.createUser({
            email: email,
            password: password,
            user_metadata: {
                full_name: fullName
            },
            email_confirm: true
        });
        
        if (error) {
            showNotification(`Error creating user: ${error.message}`, 'error');
            return;
        }
        
        showNotification('User created successfully!', 'success');
        displayUserList();
        
    } catch (error) {
        console.error('Error creating user:', error);
        showNotification('Error creating user. Please try again.', 'error');
    }
}

// Create new admin function
function createNewAdmin() {
    const newAdmin = {
        id: Date.now().toString(),
        username: document.getElementById('adminNewUsername').value,
        email: document.getElementById('adminNewEmail').value,
        password: document.getElementById('adminNewPassword').value,
        role: document.getElementById('adminRole').value,
        created: new Date().toISOString()
    };
    
    adminUsers.push(newAdmin);
    localStorage.setItem('adminUsers', JSON.stringify(adminUsers));
    displayAdminList();
    showNotification('Admin created successfully!', 'success');
}

// Edit user
function editUser(userId) {
    const user = regularUsers.find(u => u.id === userId);
    if (!user) return;
    
    const modal = document.createElement('div');
    modal.className = 'admin-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Edit User</h3>
                <button onclick="this.closest('.admin-modal').remove()" class="close-modal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form id="editUserForm">
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" id="editUserFullName" value="${user.full_name || ''}" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="editUserEmail" value="${user.email}" required>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select id="editUserStatus" required>
                        <option value="active" ${user.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="suspended" ${user.status === 'suspended' ? 'selected' : ''}>Suspended</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit" class="submit-btn">Update User</button>
                    <button type="button" onclick="this.closest('.admin-modal').remove()" class="cancel-btn">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('editUserForm').onsubmit = function(e) {
        e.preventDefault();
        updateUser(userId);
        modal.remove();
    };
}

// Update user
function updateUser(userId) {
    const index = regularUsers.findIndex(u => u.id === userId);
    if (index === -1) return;
    
    regularUsers[index] = {
        ...regularUsers[index],
        full_name: document.getElementById('editUserFullName').value,
        email: document.getElementById('editUserEmail').value,
        status: document.getElementById('editUserStatus').value
    };
    
    localStorage.setItem('lohobaUsers', JSON.stringify(regularUsers));
    displayUserList();
    showNotification('User updated successfully!', 'success');
}

// Toggle user status
async function toggleUserStatus(userId) {
    const user = regularUsers.find(u => u.id === userId);
    if (!user) return;
    
    try {
        if (user.status === 'active') {
            // Suspend user
            const { error } = await supabase.auth.admin.updateUserById(userId, {
                ban_duration: '876000h' // Very long ban duration
            });
            
            if (error) {
                showNotification(`Error suspending user: ${error.message}`, 'error');
                return;
            }
            
            showNotification('User suspended successfully!', 'success');
        } else {
            // Activate user
            const { error } = await supabase.auth.admin.updateUserById(userId, {
                ban_duration: 'none'
            });
            
            if (error) {
                showNotification(`Error activating user: ${error.message}`, 'error');
                return;
            }
            
            showNotification('User activated successfully!', 'success');
        }
        
        displayUserList();
        
    } catch (error) {
        console.error('Error toggling user status:', error);
        showNotification('Error updating user status. Please try again.', 'error');
    }
}

// Delete user
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return;
    }
    
    try {
        const { error } = await supabase.auth.admin.deleteUser(userId);
        
        if (error) {
            showNotification(`Error deleting user: ${error.message}`, 'error');
            return;
        }
        
        showNotification('User deleted successfully!', 'success');
        displayUserList();
        
    } catch (error) {
        console.error('Error deleting user:', error);
        showNotification('Error deleting user. Please try again.', 'error');
    }
}

// Edit admin
function editAdmin(adminId) {
    const admin = adminUsers.find(a => a.id === adminId);
    if (!admin) return;
    
    const modal = document.createElement('div');
    modal.className = 'admin-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Edit Admin</h3>
                <button onclick="this.closest('.admin-modal').remove()" class="close-modal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form id="editAdminForm">
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" id="editAdminUsername" value="${admin.username}" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="editAdminEmail" value="${admin.email}" required>
                </div>
                <div class="form-group">
                    <label>Role</label>
                    <select id="editAdminRole" required>
                        <option value="admin" ${admin.role === 'admin' ? 'selected' : ''}>Admin</option>
                        <option value="super-admin" ${admin.role === 'super-admin' ? 'selected' : ''}>Super Admin</option>
                        <option value="moderator" ${admin.role === 'moderator' ? 'selected' : ''}>Moderator</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit" class="submit-btn">Update Admin</button>
                    <button type="button" onclick="this.closest('.admin-modal').remove()" class="cancel-btn">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('editAdminForm').onsubmit = function(e) {
        e.preventDefault();
        updateAdmin(adminId);
        modal.remove();
    };
}

// Update admin
function updateAdmin(adminId) {
    const index = adminUsers.findIndex(a => a.id === adminId);
    if (index === -1) return;
    
    adminUsers[index] = {
        ...adminUsers[index],
        username: document.getElementById('editAdminUsername').value,
        email: document.getElementById('editAdminEmail').value,
        role: document.getElementById('editAdminRole').value
    };
    
    localStorage.setItem('adminUsers', JSON.stringify(adminUsers));
    displayAdminList();
    showNotification('Admin updated successfully!', 'success');
}

// Delete admin
function deleteAdmin(adminId) {
    if (confirm('Are you sure you want to delete this admin?')) {
        adminUsers = adminUsers.filter(a => a.id !== adminId);
        localStorage.setItem('adminUsers', JSON.stringify(adminUsers));
        displayAdminList();
        showNotification('Admin deleted successfully!', 'success');
    }
}

// Load security settings
function loadSecuritySettings() {
    const securityContainer = document.getElementById('securityContainer');
    const settings = JSON.parse(localStorage.getItem('securitySettings') || '{}');
    
    securityContainer.innerHTML = `
        <div class="security-section">
            <h3>Password Policy</h3>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="requireStrongPassword" ${settings.requireStrongPassword ? 'checked' : ''}>
                    Require strong passwords (8+ chars, uppercase, lowercase, number)
                </label>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="enableTwoFactor" ${settings.enableTwoFactor ? 'checked' : ''}>
                    Enable two-factor authentication
                </label>
            </div>
        </div>
        
        <div class="security-section">
            <h3>Session Management</h3>
            <div class="form-group">
                <label>Session timeout (minutes)</label>
                <input type="number" id="sessionTimeout" value="${settings.sessionTimeout || 30}" min="5" max="480">
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="forceLogoutInactive" ${settings.forceLogoutInactive ? 'checked' : ''}>
                    Force logout inactive users
                </label>
            </div>
        </div>
        
        <div class="security-section">
            <h3>Access Control</h3>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="enableIPWhitelist" ${settings.enableIPWhitelist ? 'checked' : ''}>
                    Enable IP whitelist for admin access
                </label>
            </div>
            <div class="form-group">
                <label>Max login attempts</label>
                <input type="number" id="maxLoginAttempts" value="${settings.maxLoginAttempts || 5}" min="3" max="10">
            </div>
        </div>
        
        <div class="form-actions">
            <button onclick="saveSecuritySettings()" class="submit-btn">Save Security Settings</button>
        </div>
    `;
}

// Save security settings
function saveSecuritySettings() {
    const settings = {
        requireStrongPassword: document.getElementById('requireStrongPassword').checked,
        enableTwoFactor: document.getElementById('enableTwoFactor').checked,
        sessionTimeout: parseInt(document.getElementById('sessionTimeout').value),
        forceLogoutInactive: document.getElementById('forceLogoutInactive').checked,
        enableIPWhitelist: document.getElementById('enableIPWhitelist').checked,
        maxLoginAttempts: parseInt(document.getElementById('maxLoginAttempts').value)
    };
    
    localStorage.setItem('securitySettings', JSON.stringify(settings));
    showNotification('Security settings saved successfully!', 'success');
}

// Load general settings
function loadGeneralSettings() {
    const settingsContainer = document.getElementById('settingsContainer');
    const settings = JSON.parse(localStorage.getItem('generalSettings') || '{}');
    
    settingsContainer.innerHTML = `
        <div class="settings-section">
            <h3>Site Configuration</h3>
            <div class="form-group">
                <label>Site Name</label>
                <input type="text" id="siteName" value="${settings.siteName || 'Lohoba Luxury'}">
            </div>
            <div class="form-group">
                <label>Site Description</label>
                <textarea id="siteDescription" rows="3">${settings.siteDescription || 'Premium Fashion & Accessories'}</textarea>
            </div>
            <div class="form-group">
                <label>Contact Email</label>
                <input type="email" id="contactEmail" value="${settings.contactEmail || 'info@lohoba.com'}">
            </div>
        </div>
        
        <div class="settings-section">
            <h3>Business Settings</h3>
            <div class="form-group">
                <label>Currency</label>
                <select id="currency">
                    <option value="NGN" ${settings.currency === 'NGN' ? 'selected' : ''}>Nigerian Naira (₦)</option>
                    <option value="USD" ${settings.currency === 'USD' ? 'selected' : ''}>US Dollar ($)</option>
                    <option value="EUR" ${settings.currency === 'EUR' ? 'selected' : ''}>Euro (€)</option>
                </select>
            </div>
            <div class="form-group">
                <label>Tax Rate (%)</label>
                <input type="number" id="taxRate" value="${settings.taxRate || 0}" min="0" max="100" step="0.01">
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="enableInventoryTracking" ${settings.enableInventoryTracking ? 'checked' : ''}>
                    Enable inventory tracking
                </label>
            </div>
        </div>
        
        <div class="settings-section">
            <h3>Email Settings</h3>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="enableOrderEmails" ${settings.enableOrderEmails ? 'checked' : ''}>
                    Send order confirmation emails
                </label>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="enableNewsletters" ${settings.enableNewsletters ? 'checked' : ''}>
                    Enable newsletter subscriptions
                </label>
            </div>
        </div>
        
        <div class="form-actions">
            <button onclick="saveGeneralSettings()" class="submit-btn">Save Settings</button>
            <button onclick="resetToDefaults()" class="cancel-btn">Reset to Defaults</button>
        </div>
    `;
}

// Save general settings
function saveGeneralSettings() {
    const settings = {
        siteName: document.getElementById('siteName').value,
        siteDescription: document.getElementById('siteDescription').value,
        contactEmail: document.getElementById('contactEmail').value,
        currency: document.getElementById('currency').value,
        taxRate: parseFloat(document.getElementById('taxRate').value),
        enableInventoryTracking: document.getElementById('enableInventoryTracking').checked,
        enableOrderEmails: document.getElementById('enableOrderEmails').checked,
        enableNewsletters: document.getElementById('enableNewsletters').checked
    };
    
    localStorage.setItem('generalSettings', JSON.stringify(settings));
    showNotification('Settings saved successfully!', 'success');
}

// Reset to defaults
function resetToDefaults() {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
        localStorage.removeItem('generalSettings');
        loadGeneralSettings();
        showNotification('Settings reset to defaults!', 'success');
    }
}

// Admin logout
function adminLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminSession');
        window.location.reload();
    }
}

// Get local users for demo
function getLocalUsers() {
    const users = localStorage.getItem('lohobaUsers');
    return users ? JSON.parse(users) : [];
}

// View user details
function viewUserDetails(userId) {
    const modal = document.createElement('div');
    modal.className = 'admin-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>User Details</h3>
                <button onclick="this.closest('.admin-modal').remove()" class="close-modal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="user-details">
                <p><strong>User ID:</strong> ${userId}</p>
                <p><strong>Account Status:</strong> Active</p>
                <p><strong>Total Orders:</strong> ${getUserOrderCount(userId)}</p>
                <p><strong>Total Spent:</strong> ₦${getUserTotalSpent(userId).toLocaleString()}</p>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Get user order count
function getUserOrderCount(userId) {
    const orders = JSON.parse(localStorage.getItem('lohobaOrders') || '[]');
    return orders.filter(order => order.userId === userId).length;
}

// Get user total spent
function getUserTotalSpent(userId) {
    const orders = JSON.parse(localStorage.getItem('lohobaOrders') || '[]');
    return orders
        .filter(order => order.userId === userId)
        .reduce((total, order) => total + parseFloat(order.total || 0), 0);
}

// Update analytics
async function updateAnalytics() {
    const totalProductsEl = document.getElementById('totalProducts');
    const totalOrdersEl = document.getElementById('totalOrders');
    const totalCustomersEl = document.getElementById('totalCustomers');
    const totalRevenueEl = document.getElementById('totalRevenue');
    const totalAdminsEl = document.getElementById('totalAdmins');
    
    if (totalProductsEl) totalProductsEl.textContent = adminProducts.length;
    
    const orders = JSON.parse(localStorage.getItem('lohobaOrders') || '[]');
    if (totalOrdersEl) totalOrdersEl.textContent = orders.length;
    
    const revenue = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
    if (totalRevenueEl) totalRevenueEl.textContent = `₦${revenue.toLocaleString()}`;
    
    // Get user count from Supabase
    try {
        const { data: users, error } = await supabase.auth.admin.listUsers();
        if (!error && users) {
            if (totalCustomersEl) totalCustomersEl.textContent = users.length;
        } else {
            if (totalCustomersEl) totalCustomersEl.textContent = regularUsers.length;
        }
    } catch (error) {
        if (totalCustomersEl) totalCustomersEl.textContent = regularUsers.length;
    }
    
    if (totalAdminsEl) totalAdminsEl.textContent = adminUsers.length;
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `admin-notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#dc3545' : '#28a745'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Subtle admin access functionality for main site
let clickCount = 0;
let clickTimer = null;

function handleUserClick(event) {
    event.preventDefault();
    clickCount++;
    
    if (clickTimer) {
        clearTimeout(clickTimer);
    }
    
    clickTimer = setTimeout(() => {
        clickCount = 0;
    }, 3000);
    
    if (clickCount === 5) {
        const adminCode = prompt("Enter access code:");
        if (adminCode === "LHL2024") {
            window.location.href = "admin.html";
        } else if (adminCode !== null) {
            console.log("Invalid access code");
        }
        clickCount = 0;
    } else if (clickCount === 1) {
        setTimeout(() => {
            if (clickCount === 1) {
                window.location.href = "user.html";
            }
        }, 500);
    }
}