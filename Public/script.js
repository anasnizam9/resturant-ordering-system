document.addEventListener('DOMContentLoaded', () => {
  const API = 'http://localhost:8080/api';
  const cart = new Map(); // Local cache: itemId → { name, price, qty }

  // DOM Elements
  const searchInput = document.getElementById('menuSearch');
  const pills = document.querySelectorAll('.pill');
  const menuCards = document.querySelectorAll('.menu-card');
  const themeToggle = document.getElementById('themeToggle');
  const cartIcon = document.querySelector('.icon-btn:nth-child(2)');
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  const cartItemsEl = document.getElementById('cartItems');
  const cartTotalEl = document.getElementById('cartTotal');
  const closeCartBtn = document.getElementById('closeCart');
  const checkoutBtn = document.getElementById('checkoutBtn');

  // Checkout modal elements
  const checkoutModal = document.getElementById('checkoutModal');
  const checkoutOverlay = document.getElementById('checkoutOverlay');
  const closeCheckoutBtn = document.getElementById('closeCheckout');
  const checkoutForm = document.getElementById('checkoutForm');
  const checkoutItemsEl = document.getElementById('checkoutItems');
  const checkoutTotalEl = document.getElementById('checkoutTotal');

  // === 1. MENU SEARCH & FILTER ===
  function filterMenu() {
    const query = searchInput?.value.trim().toLowerCase() || '';
    const activeCat = document.querySelector('.pill.active')?.dataset.cat || 'all';

    menuCards.forEach(card => {
      const title = card.querySelector('h3').textContent.toLowerCase();
      const desc = card.querySelector('.muted').textContent.toLowerCase();
      const cat = card.dataset.cat;

      const matchesSearch = query === '' || title.includes(query) || desc.includes(query);
      const matchesCat = activeCat === 'all' || cat === activeCat;

      card.style.display = (matchesSearch && matchesCat) ? '' : 'none';
    });
  }

  searchInput?.addEventListener('input', filterMenu);
  pills.forEach(pill => pill.addEventListener('click', () => {
    pills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    filterMenu();
  }));

  // === 2. THEME TOGGLE ===
  let isDark = true;
  themeToggle?.addEventListener('click', () => {
    isDark = !isDark;
    const root = document.documentElement;
    if (isDark) {
      root.style.setProperty('--bg', '#131212');
      root.style.setProperty('--card', '#1e1a1a');
      root.style.setProperty('--muted', '#bdb5b5');
      document.body.style.color = '#f2efe9';
      themeToggle.textContent = 'Light Mode';
    } else {
      root.style.setProperty('--bg', '#ffffff');
      root.style.setProperty('--card', '#f7f7f7');
      root.style.setProperty('--muted', '#6c6c6c');
      document.body.style.color = '#111';
      themeToggle.textContent = 'Dark Mode';
    }
  });

  // === 3. CART LOGIC ===
  async function fetchCartFromServer() {
    try {
      const res = await fetch(`${API}/cart`);
      const text = await res.text();
      const match = text.match(/\{([^}]+)\}/);
      if (!match) return new Map();

      const serverCart = new Map();
      match[1].split(', ').forEach(item => {
        const [id, qty] = item.split('=');
        if (id && qty) {
          const name = atob(id);
          const menuCard = findMenuCard(name);
          const price = menuCard ? getPrice(menuCard) : 9.99;
          serverCart.set(id, { name, price, qty: parseInt(qty) });
        }
      });
      return serverCart;
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      return new Map();
    }
  }

  function findMenuCard(name) {
    return [...menuCards].find(card => 
      card.querySelector('h3').textContent.trim() === name
    );
  }

  function getPrice(card) {
    return parseFloat(card.querySelector('.price').textContent.replace('$', '')) || 9.99;
  }

  function updateCartBadge() {
    const totalItems = Array.from(cart.values()).reduce((sum, item) => sum + item.qty, 0);
    cartIcon.textContent = totalItems > 0 ? `Cart (${totalItems})` : 'Cart';
  }

  // === 4. ADD TO CART ===
  // For Full Menu items
  document.querySelectorAll('.menu-card .add').forEach(btn => {
    btn.addEventListener('click', async () => {
      const card = btn.closest('.menu-card');
      const title = card.querySelector('h3').textContent.trim();
      const price = getPrice(card);
      const itemId = btoa(title).slice(0, 12);

      await fetch(`${API}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `itemId=${itemId}&action=add`
      });

      // Update local cache
      const existing = cart.get(itemId);
      if (existing) {
        existing.qty++;
      } else {
        cart.set(itemId, { name: title, price, qty: 1 });
      }

      updateCartBadge();
      showToast(`"${title}" added to cart!`);
    });
  });

  // For Trending Now items
  document.querySelectorAll('.trending-card .add').forEach(btn => {
    btn.addEventListener('click', async () => {
      const card = btn.closest('.trending-card');
      const title = card.querySelector('h3').textContent.trim();
      const priceText = card.querySelector('.price').textContent.replace('$', '');
      const price = parseFloat(priceText) || 9.99;
      const itemId = btoa(title).slice(0, 12);

      await fetch(`${API}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `itemId=${itemId}&action=add`
      });

      // Update local cache
      const existing = cart.get(itemId);
      if (existing) {
        existing.qty++;
      } else {
        cart.set(itemId, { name: title, price, qty: 1 });
      }

      updateCartBadge();
      showToast(`"${title}" added to cart!`);
    });
  });

  // === 5. UPDATE QUANTITY (from sidebar) ===
  window.updateQty = async (itemId, change) => {
    const item = cart.get(itemId);
    if (!item) return;

    const newQty = item.qty + change;
    if (newQty <= 0) {
      await fetch(`${API}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `itemId=${itemId}&action=remove`
      });
      cart.delete(itemId);
    } else {
      for (let i = 0; i < Math.abs(change); i++) {
        await fetch(`${API}/cart`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `itemId=${itemId}&action=add`
        });
      }
      item.qty = newQty;
    }

    await renderCart();
    updateCartBadge();
  };

  // === 6. RENDER CART SIDEBAR ===
  async function renderCart() {
    cartItemsEl.innerHTML = '';
    const items = Array.from(cart.values());

    if (items.length === 0) {
      cartItemsEl.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
      cartTotalEl.textContent = '$0.00';
      return;
    }

    let total = 0;
    items.forEach(item => {
      const itemTotal = item.price * item.qty;
      total += itemTotal;

      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <div style="display:flex;align-items:center;">
  <img src="images/${getImageName(item.name)}.png" 
       alt="${item.name}" 
       onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
       style="width:60px;height:60px;object-fit:cover;border-radius:8px;margin-right:12px;">
  <div style="width:60px;height:60px;background:var(--accent);color:white;border-radius:8px;margin-right:12px;display:none;align-items:center;justify-content:center;font-size:12px;font-weight:600;">
    ${item.name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0,2)}
  </div>
</div>
        <div class="item-info">
          <h4>${item.name}</h4>
          <div class="item-price">$${item.price.toFixed(2)}</div>
          <div class="quantity-controls">
            <button class="quantity-btn" onclick="updateQty('${btoa(item.name).slice(0,12)}', -1)">−</button>
            <span class="quantity">${item.qty}</span>
            <button class="quantity-btn" onclick="updateQty('${btoa(item.name).slice(0,12)}', 1)">+</button>
          </div>
        </div>
      `;
      cartItemsEl.appendChild(div);
    });

    cartTotalEl.textContent = '$' + total.toFixed(2);
  }

  function getImageName(itemName) {
  // 1. Try to find the image from the original menu card
  const menuCard = [...document.querySelectorAll('.menu-card')].find(card =>
    card.querySelector('h3').textContent.trim() === itemName
  );

  if (menuCard) {
    const img = menuCard.querySelector('img');
    if (img && img.src) {
      const filename = img.src.split('/').pop().split('.').shift();
      return filename || 'buff';
    }
  }

  // 2. Try to find from trending cards
  const trendingCard = [...document.querySelectorAll('.trending-card')].find(card =>
    card.querySelector('h3').textContent.trim() === itemName
  );

  if (trendingCard) {
    const img = trendingCard.querySelector('img');
    if (img && img.src) {
      const filename = img.src.split('/').pop().split('.').shift();
      return filename || 'buff';
    }
  }

  // 3. Fallback: slugify the name
  return itemName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .split('-')
    .slice(0, 3)
    .join('-');
}

  // === 7. OPEN / CLOSE SIDEBAR ===
  function openCart() {
    sidebar.classList.add('open');
    overlay.classList.add('open');
    renderCart();
  }

  function closeCart() {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  }

  cartIcon.addEventListener('click', openCart);
  overlay.addEventListener('click', closeCart);
  closeCartBtn.addEventListener('click', closeCart);

  // === 8. CHECKOUT ===
  checkoutBtn.addEventListener('click', () => {
    if (cart.size === 0) {
      showToast('Your cart is empty!');
      return;
    }
    openCheckoutModal();
  });

  function openCheckoutModal() {
    // Populate checkout items
    checkoutItemsEl.innerHTML = '';
    let total = 0;

    Array.from(cart.values()).forEach(item => {
      const itemTotal = item.price * item.qty;
      total += itemTotal;

      const div = document.createElement('div');
      div.className = 'checkout-item';
      div.innerHTML = `
        <div>
          <div class="checkout-item-name">${item.name}</div>
          <div class="checkout-item-qty">${item.qty} × $${item.price.toFixed(2)}</div>
        </div>
        <div style="font-weight: 600;">$${itemTotal.toFixed(2)}</div>
      `;
      checkoutItemsEl.appendChild(div);
    });

    checkoutTotalEl.textContent = '$' + total.toFixed(2);

    // Open modal
    checkoutModal.classList.add('open');
    checkoutOverlay.classList.add('open');
    closeCart(); // Close cart sidebar
  }

  function closeCheckoutModal() {
    checkoutModal.classList.remove('open');
    checkoutOverlay.classList.remove('open');
    checkoutForm.reset();
  }

  closeCheckoutBtn.addEventListener('click', closeCheckoutModal);
  checkoutOverlay.addEventListener('click', closeCheckoutModal);

  // Handle form submission
  checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(checkoutForm);
    const customerName = formData.get('customerName');
    const customerEmail = formData.get('customerEmail');
    const customerPhone = formData.get('customerPhone');
    const customerAddress = formData.get('customerAddress');

    // Validate phone number
    if (customerPhone.length < 10) {
      showToast('Phone number must be at least 10 digits!');
      return;
    }

    // Prepare order data
    const orderItems = Array.from(cart.values()).map(item => ({
      name: item.name,
      price: item.price,
      quantity: item.qty
    }));

    const orderData = {
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        address: customerAddress
      },
      items: orderItems,
      total: Array.from(cart.values()).reduce((sum, item) => sum + (item.price * item.qty), 0)
    };

    try {
      // Send order to backend
      const response = await fetch(`${API}/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `userName=${encodeURIComponent(customerName)}&userEmail=${encodeURIComponent(customerEmail)}&itemId=${orderItems[0]?.name || 'order'}`
      });

      const result = await response.text();
      
      // Clear cart
      cart.clear();
      updateCartBadge();
      
      // Close modal
      closeCheckoutModal();
      
      // Show success message
      showSuccessModal(customerName, orderData.total);
      
      console.log('Order placed:', orderData);
    } catch (error) {
      console.error('Order failed:', error);
      showToast('Failed to place order. Please try again.');
    }
  });

  function showSuccessModal(customerName, total) {
    const successModal = document.createElement('div');
    successModal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--card);
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 10px 50px rgba(0,0,0,0.5);
      z-index: 10002;
      text-align: center;
      max-width: 400px;
      width: 90%;
    `;
    
    successModal.innerHTML = `
      <div style="font-size: 60px; color: var(--accent); margin-bottom: 20px;">✓</div>
      <h2 style="color: var(--accent); margin: 0 0 16px 0;">Order Placed Successfully!</h2>
      <p style="font-size: 16px; margin-bottom: 8px;">Thank you, <strong>${customerName}</strong>!</p>
      <p style="font-size: 18px; color: var(--accent); font-weight: 700; margin-bottom: 20px;">Total: $${total.toFixed(2)}</p>
      <p style="color: var(--muted); font-size: 14px; margin-bottom: 24px;">Your order will be delivered soon. You'll receive a confirmation email shortly.</p>
      <button onclick="this.parentElement.remove(); document.querySelector('.checkout-overlay').classList.remove('open')" 
              style="background: var(--accent); color: white; border: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 16px;">
        Close
      </button>
    `;
    
    document.body.appendChild(successModal);
  }

  // === 9. TOAST NOTIFICATION ===
  function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
      background: var(--accent); color: white; padding: 12px 24px;
      border-radius: 8px; font-weight: 600; z-index: 10000;
      animation: toast 3s ease forwards;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes toast { 0%, 100% { opacity: 0; transform: translateX(-50%) translateY(20px); }
                       10%, 90% { opacity: 1; transform: translateX(-50%) translateY(0); } }
  `;
  document.head.appendChild(style);

  // === 10. INITIALIZE ===
  updateCartBadge();
  filterMenu(); // Initial filter
});