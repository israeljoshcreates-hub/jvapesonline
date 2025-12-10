J_VAPES — Static Folder-based E-commerce

Contents
- `index.html` — Store front that loads `products.json` dynamically
- `admin.html` — Admin UI to add/delete products; produces downloadable `products.json` and `sitemap.xml`
- `products.json` — Product data (edit here or use admin UI to export updated JSON)
 - `returns.html` — Return & Refund Policy
- `css/style.css` — Additional styles on top of Tailwind CDN
- `js/app.js` — Main store app (search, filters, cart, WhatsApp checkout)
- `js/admin.js` — Admin UI logic
- `favicon.svg` — Simple favicon
- `sitemap.xml` — Generated sitemap (edit or regenerate via admin)

How to use
1. Open `index.html` in a static host (GitHub Pages recommended).
2. To add products: either edit `products.json` directly and redeploy, or open `admin.html`, enter PIN `254`, add products, then click "Download products.json" and replace the file in your repo and redeploy.

WhatsApp Checkout
- Configure the phone number in `js/app.js` by editing the `WHATSAPP_NUMBER` constant (international format without `+`, e.g. `254712345678`). The public contact number is +254 741 658 556 (WhatsApp).

Deploy to GitHub Pages
1. Commit the `jvapes` folder to a repository.
2. On GitHub, enable GitHub Pages from the `main` branch (or `gh-pages` branch).
3. Update `sitemap.xml` `loc` entries to reflect your published domain.

Notes & Limitations
- This is a static site. The admin UI offers a download flow for producing an updated `products.json` but does not commit changes automatically. For automatic commits, implement a server or GitHub API flow (requires secure token management).
- Admin PIN is client-side for convenience only. For production, protect the admin panel with server-side auth.

License: MIT (personal use)