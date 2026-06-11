// ===== STATE =====
const state = {
  authMode: 'seller',
  authTab: 'login',
  currentUser: null,
  currentUserType: null,
  users: {
    sellers: {
      'seller1': { password: 'pass123', email: 'seller1@bazaar.com' },
      'shopking': { password: 'shop456', email: 'shop@bazaar.com' }
    },
    buyers: {
      'buyer1': { password: 'buy123', email: 'buyer1@bazaar.com', phone: '+91 98765 43210', address: '12, MG Road, Sector 17, Chandigarh, Punjab 160017' },
      'shopaholic': { password: 'shop789', email: 'shop@buy.com', phone: '+91 91234 56789', address: '45, Green Park Colony, New Delhi 110016' }
    }
  },
  products: [
    { id: 'p1', name: 'Wireless Noise-Cancelling Headphones', price: 4999, category: 'Electronics', desc: 'Premium audio experience with 40hr battery life and ANC technology.', seller: 'seller1', img: null, stock: 15, unitsSold: 0 },
    { id: 'p2', name: 'Handcrafted Leather Wallet', price: 899, category: 'Fashion', desc: 'Genuine leather bifold wallet with RFID blocking technology.', seller: 'shopking', img: null, stock: 30, unitsSold: 0 },
    { id: 'p3', name: 'Organic Green Tea Set', price: 599, category: 'Food & Beverages', desc: 'Premium single-origin green tea from Darjeeling hills, 100g pack.', seller: 'seller1', img: null, stock: 50, unitsSold: 0 },
    { id: 'p4', name: 'Yoga Mat Pro', price: 1299, category: 'Sports & Fitness', desc: 'Non-slip premium TPE yoga mat 6mm thick, eco-friendly material.', seller: 'shopking', img: null, stock: 20, unitsSold: 0 },
    { id: 'p5', name: 'Scented Soy Candle Set', price: 749, category: 'Home & Garden', desc: 'Set of 3 handpoured soy candles with vanilla, lavender, sandalwood.', seller: 'seller1', img: null, stock: 25, unitsSold: 0 }
  ],
  // orders: array of { id, buyerUsername, buyerPhone, buyerAddress, items:[{productId,name,qty,price,seller}], total, timestamp }
  orders: [],
  cart: [],
  activeFilter: 'All',
  sellerActiveTab: 'add'
};

// ===== PARTICLES =====
(function() {
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let particles = [];
  function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
  window.addEventListener('resize', resize); resize();
  for (let i = 0; i < 60; i++) particles.push({ x: Math.random()*innerWidth, y: Math.random()*innerHeight, r: Math.random()*1.5+0.5, dx: (Math.random()-0.5)*0.3, dy: (Math.random()-0.5)*0.3, o: Math.random()*0.5+0.1 });
  function animate() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach(p => {
      p.x+=p.dx; p.y+=p.dy;
      if(p.x<0||p.x>canvas.width) p.dx*=-1;
      if(p.y<0||p.y>canvas.height) p.dy*=-1;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(240,192,64,${p.o})`; ctx.fill();
    });
    requestAnimationFrame(animate);
  }
  animate();
})();

// ===== NAVIGATION =====
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
function goToAuth(type) {
  state.authMode = type;
  state.authTab = 'login';
  updateAuthUI();
  showScreen('auth');
}
function goBack() { showScreen('landing'); }

// ===== AUTH UI =====
function updateAuthUI() {
  const badge = document.getElementById('auth-type-badge');
  const title = document.getElementById('auth-title');
  const sub = document.getElementById('auth-subtitle');
  const submit = document.getElementById('auth-submit');
  const loginTab = document.getElementById('login-tab');
  const regTab = document.getElementById('register-tab');

  badge.className = 'auth-type ' + state.authMode;
  badge.textContent = state.authMode === 'seller' ? 'Seller' : 'Buyer';

  const isLogin = state.authTab === 'login';
  document.getElementById('login-fields').style.display = isLogin ? 'block' : 'none';
  document.getElementById('register-fields').style.display = isLogin ? 'none' : 'block';

  // Show phone/address only for buyer registration
  const showBuyerFields = !isLogin && state.authMode === 'buyer';
  document.getElementById('reg-phone-group').style.display = showBuyerFields ? 'block' : 'none';
  document.getElementById('reg-address-group').style.display = showBuyerFields ? 'block' : 'none';

  if (isLogin) {
    title.textContent = 'Welcome Back';
    sub.textContent = `Sign in to your ${state.authMode} account`;
    submit.textContent = 'Sign In';
  } else {
    title.textContent = 'Create Account';
    sub.textContent = `Register as a new ${state.authMode}`;
    submit.textContent = 'Create Account';
  }
  submit.className = 'submit-btn ' + state.authMode;
  loginTab.className = 'auth-tab' + (isLogin ? ' active ' + state.authMode : '');
  regTab.className = 'auth-tab' + (!isLogin ? ' active ' + state.authMode : '');

  document.querySelectorAll('#auth .form-input').forEach(inp => {
    inp.classList.remove('seller-focus','buyer-focus');
    inp.classList.add(state.authMode + '-focus');
  });
  document.getElementById('auth-error').style.display = 'none';
  // Clear inputs
  ['auth-username','auth-password','reg-username','reg-password','reg-email','reg-phone','reg-address'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.value = '';
  });
}
function switchAuthTab(tab) { state.authTab = tab; updateAuthUI(); }

function handleAuth() {
  const errEl = document.getElementById('auth-error');
  errEl.style.display = 'none';
  const db = state.users[state.authMode + 's'];

  if (state.authTab === 'login') {
    const username = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value;
    if (!username || !password) { showAuthError('Please fill in all fields.'); return; }
    if (!db[username]) { showAuthError('Username not found.'); return; }
    if (db[username].password !== password) { showAuthError('Incorrect password.'); return; }
    loginSuccess(username, state.authMode);
  } else {
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;
    const email = document.getElementById('reg-email').value.trim();
    if (!username || !password) { showAuthError('Username and password are required.'); return; }
    if (db[username]) { showAuthError('Username already taken.'); return; }
    if (password.length < 4) { showAuthError('Password must be at least 4 characters.'); return; }
    const userData = { password, email };
    if (state.authMode === 'buyer') {
      const phone = document.getElementById('reg-phone').value.trim();
      const address = document.getElementById('reg-address').value.trim();
      if (!phone) { showAuthError('Mobile number is required for buyers.'); return; }
      if (!address) { showAuthError('Delivery address is required for buyers.'); return; }
      userData.phone = phone;
      userData.address = address;
    }
    db[username] = userData;
    loginSuccess(username, state.authMode);
  }
}

function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  el.textContent = msg;
  el.style.display = 'block';
}

function loginSuccess(username, type) {
  state.currentUser = username;
  state.currentUserType = type;
  if (type === 'seller') {
    document.getElementById('seller-name-display').textContent = username;
    document.getElementById('seller-avatar').textContent = username[0].toUpperCase();
    showSellerTab('add');
    updateSellerStats();
    checkNewOrders();
    showScreen('seller-dash');
  } else {
    document.getElementById('buyer-name-display').textContent = username;
    document.getElementById('buyer-avatar').textContent = username[0].toUpperCase();
    state.cart = [];
    updateCartUI();
    buildFilterButtons();
    renderBuyerProducts();
    showScreen('buyer-dash');
  }
  showToast('👋 Welcome, ' + username + '!', 'success');
}

function logout() {
  state.currentUser = null;
  state.currentUserType = null;
  state.cart = [];
  showScreen('landing');
  showToast('You have been signed out.', '');
}

// ===== SELLER =====
function showSellerTab(tab) {
  state.sellerActiveTab = tab;
  ['add','products','orders'].forEach(t => {
    document.getElementById('stab-' + t).classList.toggle('active', t === tab);
    document.getElementById('seller-' + t + '-tab').style.display = t === tab ? 'block' : 'none';
  });
  if (tab === 'products') renderSellerProducts();
  if (tab === 'orders') { renderSellerOrders(); clearOrderBadge(); }
}

function previewImage(e) {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const img = document.getElementById('img-preview');
    img.src = ev.target.result; img.style.display = 'block';
    document.querySelector('.upload-text').style.display = 'none';
    document.querySelector('.upload-icon').style.display = 'none';
  };
  reader.readAsDataURL(file);
}

function addProduct() {
  const name = document.getElementById('p-name').value.trim();
  const price = parseFloat(document.getElementById('p-price').value);
  const category = document.getElementById('p-category').value;
  const desc = document.getElementById('p-desc').value.trim();
  const stock = parseInt(document.getElementById('p-stock').value) || 1;
  const imgEl = document.getElementById('img-preview');
  if (!name) { showToast('⚠️ Please enter a product name.', 'error'); return; }
  if (!price || price <= 0) { showToast('⚠️ Please enter a valid price.', 'error'); return; }
  if (!category) { showToast('⚠️ Please select a category.', 'error'); return; }
  state.products.unshift({ id: 'p'+Date.now(), name, price, category, desc, stock, seller: state.currentUser, img: imgEl.style.display!=='none' ? imgEl.src : null, unitsSold: 0 });
  // reset form
  ['p-name','p-price','p-desc'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('p-category').value = '';
  document.getElementById('p-stock').value = '1';
  imgEl.src=''; imgEl.style.display='none';
  document.querySelector('.upload-text').style.display='block';
  document.querySelector('.upload-icon').style.display='block';
  document.getElementById('p-image').value='';
  updateSellerStats();
  showToast('✅ Product listed successfully!', 'success');
  showSellerTab('products');
}

function deleteProduct(id) {
  state.products = state.products.filter(p => p.id !== id);
  renderSellerProducts();
  updateSellerStats();
  showToast('🗑️ Product removed.', '');
}

function updateSellerStats() {
  const mine = state.products.filter(p => p.seller === state.currentUser);
  const totalUnitsSold = mine.reduce((s,p) => s + p.unitsSold, 0);
  const revenue = mine.reduce((s,p) => s + p.unitsSold * p.price, 0);
  const myOrders = state.orders.filter(o => o.items.some(i => i.seller === state.currentUser));
  const cats = [...new Set(mine.map(p=>p.category))].length;

  document.getElementById('seller-stats').innerHTML = `
    <div class="stat-card" style="animation-delay:0.05s">
      <div class="stat-label">Total Products</div>
      <div class="stat-value green">${mine.length}</div>
    </div>
    <div class="stat-card" style="animation-delay:0.1s">
      <div class="stat-label">Units Sold</div>
      <div class="stat-value gold">${totalUnitsSold}</div>
    </div>
    <div class="stat-card" style="animation-delay:0.15s">
      <div class="stat-label">Total Revenue</div>
      <div class="stat-value green">₹${revenue.toLocaleString('en-IN')}</div>
    </div>
    <div class="stat-card" style="animation-delay:0.2s">
      <div class="stat-label">Total Orders</div>
      <div class="stat-value blue">${myOrders.length}</div>
    </div>
    <div class="stat-card" style="animation-delay:0.25s">
      <div class="stat-label">Categories</div>
      <div class="stat-value gold">${cats}</div>
    </div>
  `;
}

function renderSellerProducts() {
  const grid = document.getElementById('seller-products-grid');
  const mine = state.products.filter(p => p.seller === state.currentUser);
  if (!mine.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><span class="empty-icon">📦</span><div class="empty-title">No products yet</div><div class="empty-desc">Add your first product to start selling!</div></div>`;
    return;
  }
  grid.innerHTML = mine.map((p, i) => `
    <div class="product-card" style="animation-delay:${i*0.05}s">
      <div class="product-img-wrap">
        ${p.img ? `<img class="product-img" src="${p.img}" alt="${p.name}">` : `<div class="product-img-placeholder">${getCatEmoji(p.category)}</div>`}
      </div>
      <div class="product-body">
        <div class="product-name">${p.name}</div>
        <div class="product-desc">${p.desc||'No description.'}</div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <span class="category-tag">${p.category}</span>
          <span style="font-size:11px;color:var(--muted)">Stock: <strong style="color:var(--text)">${p.stock}</strong></span>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <span style="font-size:11px;color:var(--muted)">Sold: <strong style="color:var(--seller)">${p.unitsSold}</strong></span>
          <span style="font-size:11px;color:var(--muted)">Rev: <strong style="color:var(--accent)">₹${(p.unitsSold*p.price).toLocaleString('en-IN')}</strong></span>
        </div>
        <div class="product-footer">
          <div class="product-price">₹${p.price.toLocaleString('en-IN')}</div>
        </div>
      </div>
      <button class="delete-btn" onclick="deleteProduct('${p.id}')">✕</button>
    </div>
  `).join('');
}

// ===== ORDERS (SELLER VIEW) =====
function renderSellerOrders() {
  const panel = document.getElementById('seller-orders-panel');
  const myOrders = state.orders.filter(o => o.items.some(i => i.seller === state.currentUser)).reverse();
  if (!myOrders.length) {
    panel.innerHTML = `<div class="empty-state"><span class="empty-icon">📬</span><div class="empty-title">No orders yet</div><div class="empty-desc">When buyers add your products to cart and place orders, they'll appear here with their contact details.</div></div>`;
    return;
  }
  panel.innerHTML = myOrders.map((order, idx) => {
    const myItems = order.items.filter(i => i.seller === state.currentUser);
    const myTotal = myItems.reduce((s,i) => s+i.price*i.qty, 0);
    const buyer = state.users.buyers[order.buyerUsername] || {};
    const dt = new Date(order.timestamp);
    const timeStr = dt.toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
    return `
    <div class="order-card" style="animation-delay:${idx*0.06}s">
      <div class="order-header">
        <div>
          <div class="order-id">Order #${order.id}</div>
          <div class="order-time">${timeStr}</div>
        </div>
        <span class="order-status new">New Order</span>
      </div>
      <div class="order-buyer-info">
        <div class="buyer-info-block">
          <div class="buyer-info-label">👤 Buyer</div>
          <div class="buyer-info-value">${order.buyerUsername}</div>
        </div>
        <div class="buyer-info-block">
          <div class="buyer-info-label">📞 Mobile</div>
          <div class="buyer-info-value phone">${order.buyerPhone || 'Not provided'}</div>
        </div>
        <div class="buyer-info-block" style="grid-column:1/-1">
          <div class="buyer-info-label">📍 Delivery Address</div>
          <div class="buyer-info-value addr">${order.buyerAddress || 'Not provided'}</div>
        </div>
      </div>
      <div class="order-items-list">
        ${myItems.map(item => `
          <div class="order-item-row">
            <span class="order-item-name">${item.name}</span>
            <span class="order-item-qty">× ${item.qty}</span>
            <span class="order-item-price">₹${(item.price*item.qty).toLocaleString('en-IN')}</span>
          </div>
        `).join('')}
        <div class="order-total-row">
          <span class="order-total-label">Your Revenue</span>
          <span class="order-total-val">₹${myTotal.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>`;
  }).join('');
}

function checkNewOrders() {
  const mine = state.orders.filter(o => o.items.some(i => i.seller === state.currentUser) && !o.seenBy?.includes(state.currentUser));
  const badge = document.getElementById('orders-badge');
  const dot = document.getElementById('notif-dot');
  if (mine.length > 0) {
    badge.textContent = mine.length;
    badge.style.display = 'flex';
    dot.classList.add('show');
  } else {
    badge.style.display = 'none';
    dot.classList.remove('show');
  }
}

function clearOrderBadge() {
  // Mark orders as seen
  state.orders.forEach(o => {
    if (o.items.some(i => i.seller === state.currentUser)) {
      if (!o.seenBy) o.seenBy = [];
      if (!o.seenBy.includes(state.currentUser)) o.seenBy.push(state.currentUser);
    }
  });
  document.getElementById('orders-badge').style.display = 'none';
  document.getElementById('notif-dot').classList.remove('show');
}

// ===== BUYER =====
function buildFilterButtons() {
  const cats = ['All', ...new Set(state.products.map(p => p.category))];
  document.getElementById('filter-row').innerHTML = cats.map(c =>
    `<button class="filter-btn ${c===state.activeFilter?'active':''}" onclick="setFilter('${c}',this)">${c}</button>`
  ).join('');
}

function setFilter(cat, btn) {
  state.activeFilter = cat;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderBuyerProducts();
}

function filterProducts() { renderBuyerProducts(); }

function renderBuyerProducts() {
  const grid = document.getElementById('buyer-products-grid');
  const search = document.getElementById('search-input').value.toLowerCase();
  let prods = state.products;
  if (state.activeFilter !== 'All') prods = prods.filter(p => p.category === state.activeFilter);
  if (search) prods = prods.filter(p => p.name.toLowerCase().includes(search) || (p.desc&&p.desc.toLowerCase().includes(search)));
  if (!prods.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><span class="empty-icon">🔍</span><div class="empty-title">No products found</div><div class="empty-desc">Try adjusting your filters.</div></div>`;
    return;
  }
  grid.innerHTML = prods.map((p, i) => {
    const inCart = state.cart.find(c => c.id === p.id);
    return `
    <div class="product-card" style="animation-delay:${i*0.04}s">
      <div class="product-img-wrap">
        ${p.img ? `<img class="product-img" src="${p.img}" alt="${p.name}">` : `<div class="product-img-placeholder">${getCatEmoji(p.category)}</div>`}
      </div>
      <div class="product-body">
        <div class="product-name">${p.name}</div>
        <div class="product-seller">by <span>${p.seller}</span></div>
        <div class="product-desc">${p.desc||'No description.'}</div>
        <div style="margin-bottom:14px"><span class="category-tag">${p.category}</span></div>
        <div class="product-footer">
          <div class="product-price">₹${p.price.toLocaleString('en-IN')}</div>
          <button class="cart-btn ${inCart?'added':''}" onclick="addToCart('${p.id}')">
            ${inCart ? '✓ Added' : '🛒 Add'}
          </button>
        </div>
      </div>
    </div>`;
  }).join('');
}

// ===== CART =====
function addToCart(id) {
  const product = state.products.find(p => p.id === id);
  if (!product) return;
  const existing = state.cart.find(c => c.id === id);
  if (existing) existing.qty++;
  else state.cart.push({ ...product, qty: 1 });
  updateCartUI();
  renderBuyerProducts();
  showToast(`🛒 "${product.name}" added!`, 'success');
}

function updateCartQty(id, delta) {
  const item = state.cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) state.cart = state.cart.filter(c => c.id !== id);
  updateCartUI();
  renderBuyerProducts();
}

function updateCartUI() {
  const count = state.cart.reduce((s,c) => s+c.qty, 0);
  const countEl = document.getElementById('cart-count');
  countEl.textContent = count;
  countEl.style.display = count > 0 ? 'flex' : 'none';
  const total = state.cart.reduce((s,c) => s+c.price*c.qty, 0);
  document.getElementById('cart-total').textContent = '₹' + total.toLocaleString('en-IN');
  const list = document.getElementById('cart-items-list');
  if (!state.cart.length) {
    list.innerHTML = `<div class="empty-state" style="padding:36px 0"><span class="empty-icon" style="font-size:44px">🛒</span><div class="empty-title" style="font-size:17px">Cart is empty</div><div class="empty-desc">Add products to get started!</div></div>`;
    return;
  }
  list.innerHTML = state.cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img">
        ${item.img ? `<img src="${item.img}" alt="${item.name}">` : getCatEmoji(item.category)}
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-seller">by ${item.seller}</div>
        <div class="cart-item-price">₹${(item.price*item.qty).toLocaleString('en-IN')}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="updateCartQty('${item.id}',-1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="updateCartQty('${item.id}',1)">+</button>
        </div>
      </div>
    </div>
  `).join('');
}

function toggleCart() {
  document.getElementById('cart-sidebar').classList.toggle('open');
  document.getElementById('cart-overlay').classList.toggle('show');
}

function placeOrder() {
  if (!state.cart.length) { showToast('⚠️ Your cart is empty!', 'error'); return; }
  const buyerInfo = state.users.buyers[state.currentUser] || {};
  const total = state.cart.reduce((s,c) => s+c.price*c.qty, 0);

  // Build order
  const order = {
    id: 'ORD' + Date.now(),
    buyerUsername: state.currentUser,
    buyerPhone: buyerInfo.phone || 'Not provided',
    buyerAddress: buyerInfo.address || 'Not provided',
    items: state.cart.map(c => ({ productId: c.id, name: c.name, qty: c.qty, price: c.price, seller: c.seller })),
    total,
    timestamp: Date.now(),
    seenBy: []
  };

  state.orders.push(order);

  // Update units sold on products
  state.cart.forEach(cartItem => {
    const prod = state.products.find(p => p.id === cartItem.id);
    if (prod) {
      prod.unitsSold = (prod.unitsSold || 0) + cartItem.qty;
      prod.stock = Math.max(0, prod.stock - cartItem.qty);
    }
  });

  const list = document.getElementById('cart-items-list');
  list.innerHTML = `
    <div class="order-confirmed">
      <span class="confirmed-icon">🎉</span>
      <div class="confirmed-title">Order Placed!</div>
      <div class="confirmed-msg">
        Your order of <strong style="color:var(--accent)">₹${total.toLocaleString('en-IN')}</strong> has been placed!<br><br>
        <span style="color:var(--muted)">Sellers will contact you at your registered mobile number and deliver to your address.</span><br><br>
        <span style="font-size:12px;color:var(--muted)">📞 ${buyerInfo.phone||'—'}<br>📍 ${buyerInfo.address||'—'}</span>
      </div>
    </div>`;
  document.getElementById('cart-total').textContent = '₹0';
  state.cart = [];
  updateCartUI();
  renderBuyerProducts();
  showToast('🎉 Order placed successfully!', 'success');
  setTimeout(() => { updateCartUI(); }, 6000);
}

// ===== HELPERS =====
function getCatEmoji(cat) {
  return { 'Electronics':'💻','Fashion':'👗','Home & Garden':'🏡','Sports & Fitness':'⚽','Books & Media':'📚','Food & Beverages':'🍵','Beauty & Health':'💄','Toys & Games':'🎮','Art & Crafts':'🎨','Automotive':'🚗','Other':'📦' }[cat] || '📦';
}
function showToast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + type;
  setTimeout(() => t.classList.remove('show'), 3000);
}

// Init
updateAuthUI();