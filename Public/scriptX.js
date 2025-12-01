/* --------------------------------------------------------------
   script.js – full front-end logic (search, filter, cart, order)
   -------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  const API = 'http://localhost:8080/api';   // <-- change if you deploy elsewhere

  /* ---------- 1. MENU SEARCH + CATEGORY FILTER ---------- */
  const search = document.getElementById('menuSearch');
  const pills = Array.from(document.querySelectorAll('.pill'));
  const cards = Array.from(document.querySelectorAll('.menu-card'));

  function filter() {
    const q = (search?.value || '').trim().toLowerCase();
    const activeCat = pills.find(p => p.classList.contains('active'))?.dataset.cat || 'all';

    cards.forEach(card => {
      const title = card.querySelector('h3').textContent.toLowerCase();
      const desc  = card.querySelector('.muted').textContent.toLowerCase();
      const cat   = card.dataset.cat;

      const matchesQ   = q === '' || title.includes(q) || desc.includes(q);
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

  /* ---------- 2. THEME TOGGLE (unchanged) ---------- */
  const themeToggle = document.getElementById('themeToggle');
  let dark = true;
  themeToggle.addEventListener('click', () => {
    dark = !dark;
    if (!dark) {
      document.documentElement.style.setProperty('--bg', '#ffffff');
      document.documentElement.style.setProperty('--card', '#f7f7f7');
      document.documentElement.style.setProperty('--muted', '#6c6c6c');
      document.documentElement.style.setProperty('--accent', '#ff7a1a');
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

  /* ---------- 3. CART (in-memory on client) ---------- */
  const cart = {};   // { itemId: quantity }

  function updateCartBadge() {
    const total = Object.values(cart).reduce((a, b) => a + b, 0);
    const badge = document.querySelector('.icon-btn:nth-child(2)'); // shopping cart button
    badge.textContent = total ? `Cart (${total})` : 'Cart';
  }

  /* ---------- 4. ADD TO CART ( + button ) ---------- */
  document.querySelectorAll('.add').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.menu-card');
      const title = card.querySelector('h3').textContent.trim();
      const price = card.querySelector('.price').textContent.trim();
      const itemId = btoa(title).slice(0, 12); // simple unique id

      cart[itemId] = (cart[itemId] || 0) + 1;

      // send to backend (optional – you can also keep only client-side)
      fetch(`${API}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `itemId=${itemId}&action=add`
      }).catch(() => {});

      updateCartBadge();
      alert(`${title} added to cart!`);
    });
  });

  /* ---------- 5. CLAIM OFFER BUTTONS ---------- */
  document.querySelectorAll('.btn-outline').forEach(btn => {
    btn.addEventListener('click', async () => {
      const offerCard = btn.closest('.offer-card');
      const offerTitle = offerCard.querySelector('h3').textContent.trim();
      const offerId = btoa(offerTitle).slice(0, 12);

      try {
        const resp = await fetch(`${API}/claim?offerId=${offerId}`, { method: 'POST' });
        const txt = await resp.text();
        alert(txt);
      } catch (e) {
        alert('Claim failed – is the backend running?');
      }
    });
  });

  /* ---------- 6. ORDER NOW (Trending section) ---------- */
  document.querySelectorAll('.trending-card .btn-primary').forEach(btn => {
    btn.addEventListener('click', async () => {
      const card = btn.closest('.trending-card');
      const title = card.querySelector('h3').textContent.trim();
      const price = card.querySelector('.price').textContent.trim();
      const itemId = btoa(title).slice(0, 12);

      // simple order payload
      const payload = JSON.stringify({ itemId, title, price, quantity: 1 });

      try {
        const resp = await fetch(`${API}/order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload
        });
        const txt = await resp.text();
        alert(txt);
      } catch (e) {
        alert('Order failed – backend not reachable');
      }
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

  // initialise badge
  updateCartBadge();
});