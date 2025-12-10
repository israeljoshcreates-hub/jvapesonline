// Admin panel JS for J_VAPES
// - Simple PIN protection (PIN = 254)
// - Load products.json, allow adding and deleting
// - Provide downloads for updated products.json and sitemap.xml

const ADMIN_PIN = '254';
let products = [];

const pinEntry = document.getElementById('pinEntry');
const pinInput = document.getElementById('pinInput');
const pinBtn = document.getElementById('pinBtn');
const pinCancel = document.getElementById('pinCancel');
const adminArea = document.getElementById('adminArea');
const productForm = document.getElementById('productForm');
const productsTableBody = document.querySelector('#productsTable tbody');
const downloadJSON = document.getElementById('downloadJSON');
const downloadSitemap = document.getElementById('downloadSitemap');

pinBtn.addEventListener('click', ()=>{
  if(pinInput.value === ADMIN_PIN){
    pinEntry.classList.add('hidden');
    adminArea.classList.remove('hidden');
    loadProducts();
  } else {
    alert('Invalid PIN');
  }
});

// Cancel button clears the PIN field and focuses it
pinCancel.addEventListener('click', ()=>{
  pinInput.value = '';
  pinInput.focus();
});

// allow Enter key to submit PIN
pinInput.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') pinBtn.click(); });

function loadProducts(){
  fetch('products.json')
    .then(r=>r.json())
    .then(data=>{
      products = data;
      renderProductsTable();
    })
    .catch(err=>console.error(err));
}

productForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const newProduct = {
    id: generateId(),
    name: formData.get('name') || '',
    brand: formData.get('brand') || '',
    puffs: formData.get('puffs') || '',
    price: parseFloat(formData.get('price') || 0),
    discount: parseFloat(formData.get('discount') || 0),
    img: formData.get('img') || ''
  };
  products.push(newProduct);
  renderProductsTable();
  form.reset();
});

function generateId(){
  return (products.reduce((m,p)=>Math.max(m,p.id||0),0) || 0) + 1;
}

function renderProductsTable(){
  productsTableBody.innerHTML='';
  products.forEach(p=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="py-2">${p.id}</td>
      <td class="py-2">${escapeHtml(p.name)}</td>
      <td class="py-2">${escapeHtml(p.brand)}</td>
      <td class="py-2">${escapeHtml(p.puffs)}</td>
      <td class="py-2">KES ${p.price}</td>
      <td class="py-2">${p.discount || 0}%</td>
      <td class="py-2"><button class="deleteBtn bg-red-100 px-2 py-1 rounded" data-id="${p.id}">Delete</button></td>
    `;
    productsTableBody.appendChild(tr);
  });
  // attach delete handlers
  productsTableBody.querySelectorAll('.deleteBtn').forEach(b=>b.addEventListener('click', ()=>{
    const id = parseInt(b.dataset.id);
    products = products.filter(p=>p.id !== id);
    renderProductsTable();
  }));
}

// Download products.json
downloadJSON.addEventListener('click', ()=>{
  const blob = new Blob([JSON.stringify(products, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'products.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
});

// Download sitemap.xml generated from current products
downloadSitemap.addEventListener('click', ()=>{
  const sitemap = buildSitemap();
  const blob = new Blob([sitemap], {type:'application/xml'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'sitemap.xml'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
});

function buildSitemap(){
  const base = (location.origin + location.pathname).replace(/index\.html$/, '');
  const urls = [];
  urls.push(`${base}`);
  products.forEach(p=>{
    // product anchor url (static site); update if you have product pages
    urls.push(`${base}index.html#product-${p.id}`);
  });
  const now = new Date().toISOString();
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  urls.forEach(u=>{
    xml += `  <url>\n    <loc>${u}</loc>\n    <lastmod>${now}</lastmod>\n  </url>\n`;
  });
  xml += '</urlset>';
  return xml;
}

function escapeHtml(str){ return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])); }

// On load: try to prefetch products for admin (if PIN entered later, loadProducts will be called)
// (End of admin.js)

// Footer helpers for admin: dynamic year and persistent warning banner
function setAdminCopyrightYear(){
  try{ const el = document.getElementById('copyrightYearAdmin'); if(el) el.textContent = new Date().getFullYear(); }catch(e){}
}

function initAdminWarningBanner(){
  try{
    const banner = document.getElementById('warningBannerAdmin');
    const dismiss = document.getElementById('dismissWarningAdmin');
    if(!banner) return;
    const dismissed = localStorage.getItem('jv_warning_dismissed') === '1';
    if(!dismissed) banner.classList.remove('hidden');
    if(dismiss) dismiss.addEventListener('click', ()=>{ try{ localStorage.setItem('jv_warning_dismissed','1'); }catch(e){}; banner.classList.add('hidden'); });
  }catch(e){}
}

// initialize footer helpers on load
window.addEventListener('DOMContentLoaded', ()=>{ setAdminCopyrightYear(); initAdminWarningBanner(); });