document.addEventListener('DOMContentLoaded', () => {
  const API = 'http://localhost:8080/api';

  // Search + Filter
  const search = document.getElementById('menuSearch');
  const pills = Array.from(document.querySelectorAll('.pill'));
  const cards = Array.from(document.querySelectorAll('.menu-card'));

  function filter() {
    const q = (search?.value || '').trim().toLowerCase();
    const activeCat = pills.find(p => p.classList.contains('active'))?.dataset.cat || 'all';

    cards.forEach(card => {
      const title = card.querySelector('h3').textContent.toLowerCase();
      const desc = card.querySelector('.muted').textContent.toLowerCase();
      const cat = card.dataset.cat;

      const matchesQ = q === '' || title.includes(q) || desc.includes(q);
      const matchesCat = activeCat === 'all' || cat === activeCat;
      card.style.display = (matchesQ && matchesCat) ? '' : 'none';
    });
  }

  search?.addEventListener('input', filter);
  pills.forEach(p => p.addEventListener('click', () => {
    pills.forEach(x => x.classList.remove('active'));
    p.classList.add('active');
    filter();
  }));

  // Theme Toggle
  const themeToggle = document.getElementById('themeToggle');
  let dark = true;
  themeToggle.addEventListener('click', () => {
    dark = !dark;
    if (!dark) {
      document.documentElement.style.setProperty('--bg', '#ffffff');
      document.documentElement.style.setProperty('--card', '#f7f7f7');
      document.documentElement.style.setProperty('--muted', '#6c6c6c');
      document.body.style.color = '#111';
      themeToggle.textContent = 'Dark Mode';
    } else {
      document.documentElement.style.setProperty('--bg', '#131212');
      document.documentElement.style.setProperty('--card', '#1e1a1a');
      document.documentElement.style.setProperty('--muted', '#bdb5b5');
      document.body.style.color = '#f2efe9';
      themeToggle.textContent = 'Light Mode';
    }
  });

  // Cart
  const cart = {};
  function updateBadge() {
    const total = Object.values(cart).reduce((a, b) => a + b, 0);
    const badge = document.querySelector('.icon-btn:nth-child(2)');
    badge.textContent = total ? `Cart (${total})` : 'Cart';
  }

  // Add to Cart
  document.querySelectorAll('.add').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.menu-card');
      const title = card.querySelector('h3').textContent.trim();
      const itemId = btoa(title).slice(0, 12);
      cart[itemId] = (cart[itemId] || 0) + 1;

      fetch(`${API}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `itemId=${itemId}&action=add`
      }).catch(() => {});

      updateBadge();
      alert(`${title} added!`);
    });
  });

  // Claim Offer
  document.querySelectorAll('.btn-outline').forEach(btn => {
    btn.addEventListener('click', async () => {
      const title = btn.closest('.offer-card').querySelector('h3').textContent.trim();
      const offerId = btoa(title).slice(0, 12);
      try {
        const res = await fetch(`${API}/claim?offerId=${offerId}`, { method: 'POST' });
        const txt = await res.text();
        alert(txt);
      } catch { alert('Backend not running!'); }
    });
  });

  // Order Now
  document.querySelectorAll('.trending-card .btn-primary').forEach(btn => {
    btn.addEventListener('click', async () => {
      const title = btn.closest('.trending-card').querySelector('h3').textContent.trim();
      const itemId = btoa(title).slice(0, 12);
      try {
        const res = await fetch(`${API}/order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId, title, quantity: 1 })
        });
        const txt = await res.text();
        alert(txt);
      } catch { alert('Order failed!'); }
    });
  });

  // Show Cart - Pretty Popup
document.querySelector('.icon-btn:nth-child(2)').addEventListener('click', async () => {
  try {
    const res = await fetch(`${API}/cart`);
    const txt = await res.text();

    // Parse: "Cart: {VHJvcGljYWwg=1, UmlidXllIFN0ZWF=2}"
    const match = txt.match(/\{([^}]+)\}/);
    if (!match) {
      alert('Your cart is empty!');
      return;
    }

    const items = match[1].split(', ');
    let message = 'Your Cart:\n\n';

    items.forEach(item => {
      const [encodedId, qty] = item.split('=');
      const itemName = atob(encodedId); // Decode Base64
      message += `• ${itemName} × ${qty}\n`;
    });

    alert(message);
  } catch {
    alert('Failed to load cart');
  }
});