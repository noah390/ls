// console.clear();

let contentTitle;

console.log(document.cookie);
function dynamicClothingSection(ob) {
  let boxDiv = document.createElement("div");
  boxDiv.id = "box";

  let boxLink = document.createElement("a");
  // boxLink.href = '#'
  boxLink.href = "contentDetails.html?" + ob.id;
  // console.log('link=>' + boxLink);

  let imgTag = document.createElement("img");
  // imgTag.id = 'image1'
  // imgTag.id = ob.photos
  imgTag.src = ob.preview;

  let detailsDiv = document.createElement("div");
  detailsDiv.id = "details";

  let h3 = document.createElement("h3");
  let h3Text = document.createTextNode(ob.name);
  h3.appendChild(h3Text);

  let h4 = document.createElement("h4");
  let h4Text = document.createTextNode(ob.brand);
  h4.appendChild(h4Text);

  let h2 = document.createElement("h2");
  let h2Text = document.createTextNode("₦" + ob.price);
  h2.appendChild(h2Text);

  // Enhanced checkout buttons
  let buttonContainer = document.createElement("div");
  buttonContainer.className = "button-container";
  
  let addToCartBtn = document.createElement("button");
  addToCartBtn.className = "add-to-cart";
  addToCartBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
  addToCartBtn.onclick = function() {
    addToCart(ob);
  };
  
  let whatsappBtn = document.createElement("button");
  whatsappBtn.className = "whatsapp-checkout";
  whatsappBtn.innerHTML = '<i class="fab fa-whatsapp"></i> Buy Now';
  whatsappBtn.onclick = function() {
    const message = `Hi! I want to order:\n\n📦 Product: ${ob.name}\n🏷️ Brand: ${ob.brand}\n💰 Price: ₦${ob.price}\n\nPlease confirm availability and delivery to Ibadan, Nigeria.`;
    const whatsappUrl = `https://wa.me/2349050120553?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  buttonContainer.appendChild(addToCartBtn);
  buttonContainer.appendChild(whatsappBtn);
  
  // Add admin edit button if admin is logged in
  if (window.isAdminLoggedIn) {
    let editBtn = document.createElement("button");
    editBtn.className = "admin-edit-btn";
    editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
    editBtn.style.cssText = 'background: #ffc107; color: #333; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; margin-top: 5px; width: 100%;';
    editBtn.onclick = function() {
      editProductOnPage(ob);
    };
    buttonContainer.appendChild(editBtn);
  }

  boxDiv.appendChild(boxLink);
  boxLink.appendChild(imgTag);
  boxLink.appendChild(detailsDiv);
  detailsDiv.appendChild(h3);
  detailsDiv.appendChild(h4);
  detailsDiv.appendChild(h2);
  detailsDiv.appendChild(buttonContainer);

  return boxDiv;
}

//  TO SHOW THE RENDERED CODE IN CONSOLE
// console.log(dynamicClothingSection());

// console.log(boxDiv)

let mainContainer = document.getElementById("mainContainer");
let containerClothing = document.getElementById("containerClothing");
let containerAccessories = document.getElementById("containerAccessories");
// mainContainer.appendChild(dynamicClothingSection('hello world!!'))

// BACKEND CALLING

// Function to load and display products
function loadProducts(products) {
  // Clear existing products
  if (containerClothing) containerClothing.innerHTML = '';
  if (containerAccessories) containerAccessories.innerHTML = '';
  
  // Initialize cart when products load
  setTimeout(initializeCart, 100);
  
  for (let i = 0; i < products.length; i++) {
    if (products[i].isAccessory) {
      console.log(products[i]);
      if (containerAccessories) {
        containerAccessories.appendChild(
          dynamicClothingSection(products[i])
        );
      }
    } else {
      console.log(products[i]);
      if (containerClothing) {
        containerClothing.appendChild(
          dynamicClothingSection(products[i])
        );
      }
    }
  }
  
  // Update global products reference
  window.sampleProducts = products;
}

// Load products with admin override support
function initializeProducts() {
  // Check for admin-modified products first
  const adminProducts = localStorage.getItem('adminProducts');
  if (adminProducts) {
    try {
      const products = JSON.parse(adminProducts);
      window.sampleProducts = products;
      loadProducts(products);
      return;
    } catch (e) {
      console.log('Error loading admin products, using defaults');
    }
  }
  
  // Try to load from API, fallback to sample products
  let httpRequest = new XMLHttpRequest();

  httpRequest.onreadystatechange = function() {
    if (this.readyState === 4) {
      if (this.status == 200) {
        console.log('API call successful');
        contentTitle = JSON.parse(this.responseText);
        loadProducts(contentTitle);
      } else {
        console.log("API call failed, using sample products");
        // Use sample products as fallback
        if (typeof window.sampleProducts !== 'undefined') {
          loadProducts(window.sampleProducts);
        }
      }
    }
  };

  httpRequest.open(
    "GET",
    "https://5d76bf96515d1a0014085cf9.mockapi.io/product",
    true
  );
  httpRequest.send();

  // Also load sample products immediately if available (for offline use)
  if (typeof window.sampleProducts !== 'undefined') {
    setTimeout(() => {
      if (!contentTitle || contentTitle.length === 0) {
        loadProducts(window.sampleProducts);
      }
    }, 2000);
  }
}

// Initialize products
initializeProducts();
// Cart functionality
let cart = [];

function initializeCart() {
  try {
    cart = JSON.parse(localStorage.getItem('lohobaCart')) || [];
  } catch (e) {
    cart = [];
  }
  updateCartBadge();
}

function addToCart(product) {
  const existingItem = cart.find(item => item.id === product.id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({...product, quantity: 1});
  }
  
  saveCart();
  updateCartBadge();
  showNotification(`${product.name} added to cart!`);
}

function saveCart() {
  try {
    localStorage.setItem('lohobaCart', JSON.stringify(cart));
  } catch (e) {
    console.error('Failed to save cart');
  }
}

function updateCartBadge() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('badge');
  if (badge) {
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'block' : 'none';
  }
  
  // Update cart link to show total
  const cartLink = document.querySelector('a[href="cart.html"]');
  if (cartLink && totalItems > 0) {
    cartLink.title = `View Cart (${totalItems} items)`;
  }
}

function showNotification(message) {
  const existing = document.querySelector('.cart-notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.className = 'cart-notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 90px;
    right: 20px;
    background: #28a745;
    color: white;
    padding: 12px 20px;
    border-radius: 5px;
    z-index: 10000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 10);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => notification.remove(), 300);
  }, 2500);
}

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeCart);
} else {
  initializeCart();
}

// Make loadProducts globally available for admin panel
window.loadProducts = loadProducts;
window.editProductOnPage = editProductOnPage;

// Global function to refresh products (called by admin panel)
window.refreshWebsiteProducts = function() {
  const adminProducts = localStorage.getItem('adminProducts');
  if (adminProducts) {
    try {
      const products = JSON.parse(adminProducts);
      window.sampleProducts = products;
      loadProducts(products);
      showNotification('Products updated from admin panel!');
    } catch (e) {
      console.log('Error refreshing products');
    }
  }
};

// Listen for storage changes to sync across tabs
window.addEventListener('storage', function(e) {
  if (e.key === 'adminProducts') {
    const products = JSON.parse(e.newValue || '[]');
    if (products.length > 0) {
      window.sampleProducts = products;
      loadProducts(products);
      showNotification('Products synced!');
    }
  }
});

// Periodic sync check
setInterval(() => {
  const adminProducts = localStorage.getItem('adminProducts');
  if (adminProducts) {
    try {
      const products = JSON.parse(adminProducts);
      if (JSON.stringify(products) !== JSON.stringify(window.sampleProducts)) {
        window.sampleProducts = products;
        loadProducts(products);
      }
    } catch (e) {
      // Silent fail
    }
  }
}, 5000);

// Admin state management
window.isAdminLoggedIn = false;

// Function to toggle admin mode
window.toggleAdminMode = function(isAdmin) {
  window.isAdminLoggedIn = isAdmin;
  // Refresh products to show/hide edit buttons
  const currentProducts = window.sampleProducts || [];
  if (currentProducts.length > 0) {
    loadProducts(currentProducts);
  }
};

// Edit product directly on page
function editProductOnPage(product) {
  const modal = document.createElement('div');
  modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 30000; display: flex; align-items: center; justify-content: center;';
  
  modal.innerHTML = `
    <div style="background: white; padding: 30px; border-radius: 8px; width: 90%; max-width: 500px; max-height: 90%; overflow-y: auto;">
      <h3 style="margin: 0 0 20px 0;">Edit Product</h3>
      <form id="editProductPageForm">
        <input type="text" id="editPageProductName" value="${product.name}" required style="width: 100%; padding: 10px; margin: 8px 0; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
        <input type="text" id="editPageProductBrand" value="${product.brand}" required style="width: 100%; padding: 10px; margin: 8px 0; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
        <input type="number" id="editPageProductPrice" value="${product.price}" required style="width: 100%; padding: 10px; margin: 8px 0; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
        <input type="text" id="editPageProductImage" value="${product.preview}" required style="width: 100%; padding: 10px; margin: 8px 0; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
        <select id="editPageProductType" required style="width: 100%; padding: 10px; margin: 8px 0; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
          <option value="false" ${!product.isAccessory ? 'selected' : ''}>Clothing</option>
          <option value="true" ${product.isAccessory ? 'selected' : ''}>Accessory</option>
        </select>
        <div style="display: flex; gap: 10px; margin-top: 20px;">
          <button type="submit" style="flex: 1; background: #007bff; color: white; border: none; padding: 12px; border-radius: 4px; cursor: pointer;">Update Product</button>
          <button type="button" onclick="this.closest('div[style*=\"position: fixed\"]').remove()" style="flex: 1; background: #6c757d; color: white; border: none; padding: 12px; border-radius: 4px; cursor: pointer;">Cancel</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.querySelector('#editProductPageForm').onsubmit = (e) => {
    e.preventDefault();
    const index = window.sampleProducts.findIndex(p => p.id === product.id);
    if (index !== -1) {
      window.sampleProducts[index] = {
        ...product,
        name: document.getElementById('editPageProductName').value,
        brand: document.getElementById('editPageProductBrand').value,
        price: document.getElementById('editPageProductPrice').value,
        preview: document.getElementById('editPageProductImage').value,
        isAccessory: document.getElementById('editPageProductType').value === 'true'
      };
      
      localStorage.setItem('adminProducts', JSON.stringify(window.sampleProducts));
      modal.remove();
      loadProducts(window.sampleProducts);
    }
  };
}

// Check for admin-modified products on load
document.addEventListener('DOMContentLoaded', function() {
  const adminProducts = localStorage.getItem('adminProducts');
  if (adminProducts) {
    try {
      const products = JSON.parse(adminProducts);
      window.sampleProducts = products;
      setTimeout(() => loadProducts(products), 1000);
    } catch (e) {
      console.log('Error loading admin products');
    }
  }
});