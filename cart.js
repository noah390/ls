let cart = [];

function initializeCart() {
  try {
    cart = JSON.parse(localStorage.getItem('lohobaCart')) || [];
  } catch (e) {
    cart = [];
  }
  displayCart();
  updateCartSummary();
}

function displayCart() {
  const cartContainer = document.getElementById('cartContainer');
  const totalItemElement = document.getElementById('totalItem');
  
  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-cart"></i>
        <h3>Your cart is empty</h3>
        <p>Add some luxury items to get started!</p>
        <a href="index.html" class="continue-shopping">Continue Shopping</a>
      </div>
    `;
    totalItemElement.textContent = 'Total Items: 0';
    return;
  }

  let cartHTML = '';
  let totalItems = 0;
  let totalPrice = 0;

  cart.forEach(item => {
    const itemTotal = parseInt(item.price) * item.quantity;
    totalItems += item.quantity;
    totalPrice += itemTotal;

    cartHTML += `
      <div class="cart-item" data-id="${item.id}">
        <img src="${item.preview}" alt="${item.name}">
        <div class="item-details">
          <h3>${item.name}</h3>
          <p class="brand">${item.brand}</p>
          <p class="price">₦${item.price}</p>
        </div>
        <div class="quantity-controls">
          <button onclick="updateQuantity('${item.id}', -1)">-</button>
          <span class="quantity">${item.quantity}</span>
          <button onclick="updateQuantity('${item.id}', 1)">+</button>
        </div>
        <div class="item-total">₦${itemTotal.toLocaleString()}</div>
        <button class="remove-item" onclick="removeItem('${item.id}')">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
  });

  cartHTML += `
    <div class="cart-summary">
      <div class="summary-row">
        <span>Total Items: ${totalItems}</span>
        <span class="total-price">₦${totalPrice.toLocaleString()}</span>
      </div>
      <div class="checkout-buttons">
        <button class="checkout-whatsapp" onclick="checkoutWhatsApp()">
          <i class="fab fa-whatsapp"></i> Checkout via WhatsApp
        </button>
        <button class="clear-cart" onclick="clearCart()">Clear Cart</button>
      </div>
    </div>
  `;

  cartContainer.innerHTML = cartHTML;
  totalItemElement.textContent = `Total Items: ${totalItems}`;
}

function updateQuantity(id, change) {
  const item = cart.find(item => item.id === id);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeItem(id);
      return;
    }
    saveCart();
    displayCart();
  }
}

function removeItem(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  displayCart();
}

function clearCart() {
  if (confirm('Are you sure you want to clear your cart?')) {
    cart = [];
    saveCart();
    displayCart();
  }
}

function checkoutWhatsApp() {
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  // Create order record
  const orderId = Date.now().toString();
  const totalPrice = cart.reduce((sum, item) => sum + (parseInt(item.price) * item.quantity), 0);
  
  const order = {
    id: orderId,
    date: new Date().toISOString(),
    items: [...cart],
    total: totalPrice,
    status: 'pending',
    customerName: getCurrentUserName(),
    customerEmail: getCurrentUserEmail()
  };
  
  // Save order to localStorage for admin tracking
  saveOrder(order);

  let message = '🛍️ *LOHOBA LUXURY ORDER*\n\n';
  message += `📋 Order ID: ${orderId}\n\n`;

  cart.forEach(item => {
    const itemTotal = parseInt(item.price) * item.quantity;
    message += `📦 ${item.name}\n`;
    message += `   Brand: ${item.brand}\n`;
    message += `   Price: ₦${item.price}\n`;
    message += `   Quantity: ${item.quantity}\n`;
    message += `   Subtotal: ₦${itemTotal.toLocaleString()}\n\n`;
  });

  message += `💰 *TOTAL: ₦${totalPrice.toLocaleString()}*\n\n`;
  message += `📍 Delivery to: Ibadan, Nigeria\n`;
  message += `Please confirm this order and provide delivery details.`;

  const whatsappUrl = `https://wa.me/2349050120553?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
  
  // Clear cart after order
  setTimeout(() => {
    if (confirm('Order sent! Clear your cart?')) {
      clearCart();
      showOrderConfirmation(orderId);
    }
  }, 1000);
}

function saveOrder(order) {
  try {
    const orders = JSON.parse(localStorage.getItem('lohobaOrders') || '[]');
    orders.push(order);
    localStorage.setItem('lohobaOrders', JSON.stringify(orders));
  } catch (e) {
    console.error('Failed to save order');
  }
}

function getCurrentUserName() {
  // Try to get from auth system
  if (window.currentUser && window.currentUser.user_metadata) {
    return window.currentUser.user_metadata.full_name || 'Guest';
  }
  return 'Guest';
}

function getCurrentUserEmail() {
  // Try to get from auth system
  if (window.currentUser) {
    return window.currentUser.email || '';
  }
  return '';
}

function showOrderConfirmation(orderId) {
  const modal = document.createElement('div');
  modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center;';
  
  modal.innerHTML = `
    <div style="background: white; padding: 30px; border-radius: 10px; text-align: center; max-width: 400px; margin: 20px;">
      <i class="fas fa-check-circle" style="color: #28a745; font-size: 48px; margin-bottom: 20px;"></i>
      <h3 style="margin: 0 0 15px 0; color: #333;">Order Placed Successfully!</h3>
      <p style="margin: 0 0 20px 0; color: #666;">Order ID: ${orderId}</p>
      <p style="margin: 0 0 25px 0; color: #666;">We'll contact you via WhatsApp to confirm your order details.</p>
      <button onclick="this.closest('div[style*=\"position: fixed\"]').remove()" style="background: #007bff; color: white; border: none; padding: 12px 25px; border-radius: 5px; cursor: pointer; font-size: 14px;">Close</button>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  setTimeout(() => {
    modal.remove();
  }, 5000);
}

function saveCart() {
  try {
    localStorage.setItem('lohobaCart', JSON.stringify(cart));
  } catch (e) {
    console.error('Failed to save cart');
  }
}

function updateCartSummary() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('badge');
  if (badge) {
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'block' : 'none';
  }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initializeCart);