// J_VAPES Store App - Single Filter Architecture
// Configurable WhatsApp number (international, no + sign):
const WHATSAPP_NUMBER = '254741658556'; // updated to site contact number

// DOM elements cached for quick access
const productsGrid = document.getElementById('productsGrid');
const priceVal = document.getElementById('priceVal');
const noResults = document.getElementById('noResults');
const cartToggle = document.getElementById('cartToggle');
const cartSidebar = document.getElementById('cartSidebar');
const closeCart = document.getElementById('closeCart');
const cartItemsWrap = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');

// Global app object with all functionality
window.app = {
  data: [],
  state: {
    search: '',
    brand: '',
    puffs: '',
    sale: false,
    maxPrice: 5000
  },
  cart: JSON.parse(localStorage.getItem('jv_cart') || '{}'),
  view: 'store',

  // Initialize: load products and wire UI
  init: function() {
    fetch('products.json')
      .then(r => r.json())
      .then(data => {
        this.data = data || [];
        this.initFilters();
        this.renderStore();
        this.renderCart();
      })
      .catch(err => console.error('Failed to load products.json:', err));
    
    if (cartToggle) cartToggle.addEventListener('click', () => cartSidebar.classList.toggle('open'));
    if (closeCart) closeCart.addEventListener('click', () => cartSidebar.classList.remove('open'));
    if (checkoutBtn) checkoutBtn.addEventListener('click', () => this.handleCheckout());
    
    if (new URLSearchParams(location.search).get('openCart')) cartSidebar.classList.add('open');
  },

  // Populate filter dropdowns dynamically from product data
  initFilters: function() {
    const brandSel = document.getElementById('brandFilter');
    const puffSel = document.getElementById('puffFilter');
    const priceRange = document.getElementById('priceFilter');
    
    while (brandSel && brandSel.options.length > 1) brandSel.remove(1);
    while (puffSel && puffSel.options.length > 1) puffSel.remove(1);
    
    const brands = Array.from(new Set(this.data.map(p => p.brand))).sort();
    brands.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b;
      opt.textContent = b;
      if (brandSel) brandSel.appendChild(opt);
    });
    
    const puffs = Array.from(new Set(this.data.map(p => p.puffs))).sort((a, b) => parseInt(a) - parseInt(b));
    puffs.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p;
      opt.textContent = p;
      if (puffSel) puffSel.appendChild(opt);
    });
    
    if (priceRange) {
      const max = Math.max(...this.data.map(p => p.price), 5000);
      priceRange.max = Math.ceil(Math.max(max, 5000));
      priceRange.value = priceRange.max;
      this.state.maxPrice = priceRange.value;
      if (priceVal) priceVal.textContent = priceRange.value;
    }
  },

  // Called when search input changes
  handleSearch: function(val) {
    this.state.search = String(val || '').trim().toLowerCase();
    this.renderStore();
  },

  // Called when filter dropdown or range input changes
  handleFilter: function() {
    const brandSel = document.getElementById('brandFilter');
    const puffSel = document.getElementById('puffFilter');
    const saleSel = document.getElementById('saleFilterSelect');
    const priceRange = document.getElementById('priceFilter');
    
    this.state.brand = brandSel ? brandSel.value : '';
    this.state.puffs = puffSel ? puffSel.value : '';
    this.state.sale = saleSel ? (saleSel.value === '1') : false;
    this.state.maxPrice = priceRange ? parseInt(priceRange.value || 999999) : 999999;
    
    if (priceVal && priceRange) priceVal.textContent = priceRange.value;
    this.renderStore();
  },

  // Clear all active filters
  clearFilters: function() {
    const brandSel = document.getElementById('brandFilter');
    const puffSel = document.getElementById('puffFilter');
    const saleSel = document.getElementById('saleFilterSelect');
    const priceRange = document.getElementById('priceFilter');
    const searchEl = document.getElementById('searchInput');
    
    if (brandSel) brandSel.value = '';
    if (puffSel) puffSel.value = '';
    if (saleSel) saleSel.value = '';
    if (searchEl) searchEl.value = '';
    
    if (priceRange) {
      priceRange.value = priceRange.max;
      this.state.maxPrice = priceRange.value;
      if (priceVal) priceVal.textContent = priceRange.value;
    }
    
    this.state.search = '';
    this.state.brand = '';
    this.state.puffs = '';
    this.state.sale = false;
    
    this.renderStore();
  },

  // Core filtering logic: applies all active filters (AND logic)
  renderStore: function() {
    const q = this.state.search;
    const brand = this.state.brand;
    const puff = this.state.puffs;
    const sale = this.state.sale;
    const maxPrice = parseInt(this.state.maxPrice || 999999);
    
    const filtered = this.data.filter(p => {
      if (brand && p.brand !== brand) return false;
      if (puff && p.puffs !== puff) return false;
      if (sale && !(p.discount && p.discount > 0)) return false;
      
      const price = Math.round(p.price * (1 - (p.discount || 0) / 100));
      if (price > maxPrice) return false;
      
      if (q) {
        const hay = (p.name + ' ' + p.brand + ' ' + p.puffs).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    
    this.renderProducts(filtered);
  },

  // Render filtered product cards
  renderProducts: function(list) {
    productsGrid.innerHTML = '';
    
    if (!list || list.length === 0) {
      if (noResults) noResults.classList.remove('hidden');
      return;
    } else {
      if (noResults) noResults.classList.add('hidden');
    }
    
    list.forEach(p => {
      const card = document.createElement('div');
      card.className = 'bg-white p-3 rounded shadow-sm fade-in';
      
      const priceHtml = p.discount
        ? `<div class="text-sm text-red-600">KES ${Math.round(p.price * (1 - p.discount / 100))}</div><div class="text-xs text-gray-400 line-through">KES ${p.price}</div>`
        : `<div class="font-semibold">KES ${p.price}</div>`;
      
      card.innerHTML = `
        <div class="card-img mb-3" style="background-image:url('${p.img || 'https://via.placeholder.com/400x300?text=Image'}')"></div>
        <div class="text-sm text-gray-500 mb-1">${p.brand} • ${p.puffs} puffs</div>
        <div class="font-medium">${p.name}</div>
        <div class="mt-2 flex items-center justify-between">
          <div>${priceHtml}</div>
          <button class="addBtn bg-gray-100 px-3 py-1 rounded text-sm" data-id="${p.id}">Add</button>
        </div>
      `;
      productsGrid.appendChild(card);
    });
    
    productsGrid.querySelectorAll('.addBtn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'));
        this.addToCart(id);
      });
    });
  },

  // Cart operations
  addToCart: function(id) {
    this.cart[id] = (this.cart[id] || 0) + 1;
    localStorage.setItem('jv_cart', JSON.stringify(this.cart));
    this.renderCart();
  },

  removeFromCart: function(id) {
    delete this.cart[id];
    localStorage.setItem('jv_cart', JSON.stringify(this.cart));
    this.renderCart();
  },

  changeQty: function(id, qty) {
    if (qty <= 0) {
      this.removeFromCart(id);
      return;
    }
    this.cart[id] = qty;
    localStorage.setItem('jv_cart', JSON.stringify(this.cart));
    this.renderCart();
  },

  // Render cart sidebar
  renderCart: function() {
    cartItemsWrap.innerHTML = '';
    const ids = Object.keys(this.cart).map(n => parseInt(n));
    let total = 0;
    
    if (ids.length === 0) {
      cartItemsWrap.innerHTML = '<div class="text-sm text-gray-500">Cart is empty</div>';
    }
    
    ids.forEach(id => {
      const p = this.data.find(x => x.id === id);
      if (!p) return;
      
      const qty = this.cart[id];
      const unit = Math.round(p.price * (1 - (p.discount || 0) / 100));
      const line = unit * qty;
      total += line;
      
      const row = document.createElement('div');
      row.className = 'flex items-center gap-3 mb-3';
      row.innerHTML = `
        <img src="${p.img}" alt="${p.name}" class="w-14 h-14 object-cover rounded">
        <div class="flex-1 text-sm">
          <div class="font-medium">${p.name}</div>
          <div class="text-gray-500">KES ${unit} • ${p.puffs}</div>
          <div class="mt-1 flex items-center gap-2">
            <button class="qty minus" data-id="${id}">-</button>
            <input class="w-10 text-center qtyInput" data-id="${id}" value="${qty}" />
            <button class="qty plus" data-id="${id}">+</button>
            <button class="text-xs text-red-600 ml-2 remove" data-id="${id}">Remove</button>
          </div>
        </div>
        <div class="text-sm">KES ${line}</div>
      `;
      cartItemsWrap.appendChild(row);
    });
    
    if (cartCount) cartCount.textContent = Object.values(this.cart).reduce((a, b) => a + b, 0);
    if (cartTotal) cartTotal.textContent = `KES ${total}`;
    
    cartItemsWrap.querySelectorAll('.minus').forEach(b => {
      b.addEventListener('click', () => {
        const id = parseInt(b.dataset.id);
        this.changeQty(id, (this.cart[id] || 0) - 1);
      });
    });
    
    cartItemsWrap.querySelectorAll('.plus').forEach(b => {
      b.addEventListener('click', () => {
        const id = parseInt(b.dataset.id);
        this.changeQty(id, (this.cart[id] || 0) + 1);
      });
    });
    
    cartItemsWrap.querySelectorAll('.remove').forEach(b => {
      b.addEventListener('click', () => {
        this.removeFromCart(parseInt(b.dataset.id));
      });
    });
    
    cartItemsWrap.querySelectorAll('.qtyInput').forEach(inp => {
      inp.addEventListener('change', () => {
        const id = parseInt(inp.dataset.id);
        this.changeQty(id, parseInt(inp.value) || 1);
      });
    });
  },

  // WhatsApp checkout
  handleCheckout: function() {
    const ids = Object.keys(this.cart).map(k => parseInt(k));
    if (ids.length === 0) {
      alert('Your cart is empty');
      return;
    }
    
    let total = 0;
    const msgLines = [];
    msgLines.push('ORDER REQUEST - J_VAPES.KE');
    msgLines.push('------------------------');
    
    ids.forEach(id => {
      const p = this.data.find(x => x.id === id);
      const qty = this.cart[id];
      const unit = Math.round(p.price * (1 - (p.discount || 0) / 100));
      total += unit * qty;
      msgLines.push(`${qty}x ${p.brand} ${p.name} (${p.puffs}) - KES ${unit}`);
    });
    
    msgLines.push('------------------------');
    msgLines.push(`TOTAL: KES ${total}`);
    msgLines.push('Location:');
    
    const text = encodeURIComponent(msgLines.join('\n'));
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
    window.open(url, '_blank');
  },

  // Support logo click to reset view
  render: function() {
    try { this.renderStore(); } catch (e) { }
    try { if (cartSidebar) cartSidebar.classList.remove('open'); } catch (e) { }
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { }
  }
};

// Initialize on DOMContentLoaded
// Age gate handling: block init until age is confirmed
function isAgeConfirmed(){
  try{ return localStorage.getItem('jv_age_confirmed') === '1'; }catch(e){ return false; }
}
window.addEventListener('DOMContentLoaded', () => {
  // set dynamic year and init persistent warning banner
  try{ setCopyrightYear(); }catch(e){}
  try{ initWarningBanner(); }catch(e){}
  // Debug logs removed for production console cleanliness

  // If age not confirmed, redirect user to dedicated `age.html` (hidden from search engines)
  if(!isAgeConfirmed()){
    // Avoid redirect loop if already on age.html
    try{
      const path = location.pathname || '';
      if(!path.endsWith('age.html')){
        location.href = 'age.html';
        return;
      }
    }catch(e){
      try{ location.href = 'age.html'; return; }catch(e){}
    }
  }

  // Age confirmed: initialize app
  // Age confirmed — initializing app
  if (window.app) window.app.init();
});

// Footer helpers: dynamic year and persistent warning banner
function setCopyrightYear(){
  try{
    const el = document.getElementById('copyrightYear');
    if(el) el.textContent = new Date().getFullYear();
  }catch(e){}
}

function initWarningBanner(){
  try{
    const banner = document.getElementById('warningBanner');
    const dismiss = document.getElementById('dismissWarning');
    if(!banner) return;
    const dismissed = localStorage.getItem('jv_warning_dismissed') === '1';
    if(!dismissed){ banner.classList.remove('hidden'); }
    if(dismiss) dismiss.addEventListener('click', ()=>{
      try{ localStorage.setItem('jv_warning_dismissed','1'); }catch(e){}
      banner.classList.add('hidden');
    });
  }catch(e){}
}
