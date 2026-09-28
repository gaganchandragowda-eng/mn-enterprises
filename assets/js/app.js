/* ================================================================
   M N ENTERPRISES — SHARED APP LOGIC (app.js)
   Load AFTER products.js and auth.js
   ================================================================ */

const APP = {
  WA: "919686311260",
  WA_HREF: "https://wa.me/919686311260",
  GSTIN: "29DTPG1328E1ZZ",

  /* GST Configuration */
  GST_RATES: [
    { label: "GST 0%  — Exempted",  rate: 0   },
    { label: "GST 5%  — Basic",     rate: 5   },
    { label: "GST 12% — Standard",  rate: 12  },
    { label: "GST 18% — General (Electrical/Plumbing)", rate: 18 },
    { label: "GST 28% — Luxury",    rate: 28  }
  ],
  DEFAULT_GST_RATE: 18,

  /* Returns current GST rate (from localStorage or default) */
  getGSTRate() {
    try {
      const saved = parseInt(localStorage.getItem("mn_gst_rate"), 10);
      if (!isNaN(saved)) return saved;
    } catch(e){}
    return this.DEFAULT_GST_RATE;
  },

  /* Save GST rate preference */
  setGSTRate(rate) {
    try { localStorage.setItem("mn_gst_rate", String(rate)); } catch(e){}
    this.renderCartDrawer();
  },

  /* Calculate GST breakdown from a subtotal */
  calcGST(subtotal, rate) {
    if (!rate) return { rate: 0, gstAmt: 0, cgst: 0, sgst: 0, total: subtotal };
    const gstAmt = Math.round(subtotal * rate / 100 * 100) / 100;
    const cgst   = Math.round(gstAmt / 2 * 100) / 100;
    const sgst   = Math.round(gstAmt / 2 * 100) / 100;
    return { rate, gstAmt, cgst, sgst, total: subtotal + gstAmt };
  },

  inr(n){ return "₹" + Number(n).toLocaleString("en-IN"); },

  escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  /* ---- Theme ---- */
  initTheme() {
    try {
      const t = localStorage.getItem("mn_theme");
      if (t) {
        document.documentElement.setAttribute("data-theme", t);
      } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.setAttribute("data-theme", "dark");
      }
    } catch(e){}
  },
  toggleTheme() {
    const cur = document.documentElement.getAttribute("data-theme");
    const sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = cur ? cur==="dark" : sysDark;
    const next = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try{ localStorage.setItem("mn_theme", next); } catch(e){}
    this._updateThemeIcon();
  },
  _updateThemeIcon() {
    const icon = document.getElementById("themeIcon");
    if (!icon) return;
    const cur = document.documentElement.getAttribute("data-theme");
    const sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = cur ? cur==="dark" : sysDark;
    icon.innerHTML = isDark
      ? `<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>`
      : `<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>`;
  },

  /* ---- Toast Notification (High Priority, Above All UI) ---- */
  toast(msg, type="info", dur=2500) {
    let stack = document.getElementById("toastStack");
    if (!stack) { stack=document.createElement("div"); stack.id="toastStack"; document.body.appendChild(stack); }
    const icons = {
      success:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color:var(--success)"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/></svg>`,
      error:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color:var(--danger)"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>`,
      info:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color:var(--teal)"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16v.01"/></svg>`
    };
    const t = document.createElement("div");
    t.className = `toast ${type}`;
    t.innerHTML = (icons[type]||icons.info) + `<span>${msg}</span>`;
    stack.appendChild(t);
    // Smooth entrance
    t.style.opacity = "0";
    t.style.transform = "translateY(-6px) scale(0.96)";
    t.style.transition = "all 0.22s ease-out";
    requestAnimationFrame(() => {
      t.style.opacity = "1";
      t.style.transform = "translateY(0) scale(1)";
    });
    // Disappear above all
    setTimeout(() => {
      t.style.transition = "all 0.25s ease-in";
      t.style.opacity = "0";
      t.style.transform = "translateY(-10px) scale(0.92)";
      setTimeout(() => t.remove(), 260);
    }, dur);
  },

  /* ---- Real-Time Dynamic Shop Open/Closed Status ---- */
  getShopStatus() {
    const now = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    const openMins = 6 * 60 + 30; // 6:30 AM = 390
    const closeMins = 21 * 60;    // 9:00 PM = 1260
    const isOpen = mins >= openMins && mins < closeMins;

    if (isOpen) {
      return {
        isOpen: true,
        badgeHtml: `<span class="store-status-pill"><span class="status-dot open"></span> Open Now · Closes 9:00 PM</span>`,
        text: "Open Now (6:30 AM – 9:00 PM)"
      };
    } else {
      return {
        isOpen: false,
        badgeHtml: `<span class="store-status-pill"><span class="status-dot closed"></span> Closed Now · Opens 6:30 AM</span>`,
        text: "Closed Now (Opens 6:30 AM)"
      };
    }
  },
  renderShopStatus() {
    const status = this.getShopStatus();
    const el = document.getElementById("shopLiveStatusPill");
    if (el) el.innerHTML = status.badgeHtml;
    const heroEl = document.getElementById("heroStatusBadge");
    if (heroEl) heroEl.innerHTML = status.badgeHtml;
  },

  /* ---- Wishlist / Save for Later ---- */
  getWishlist() {
    try { return JSON.parse(localStorage.getItem("mn_wishlist") || "[]"); } catch { return []; }
  },
  saveWishlist(list) {
    try { localStorage.setItem("mn_wishlist", JSON.stringify(list)); } catch(e){}
    this._updateWishlistUI();
  },
  isWishlisted(id) {
    return this.getWishlist().includes(id);
  },
  toggleWishlist(id) {
    let list = this.getWishlist();
    const idx = list.indexOf(id);
    let added = false;
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(id);
      added = true;
    }
    this.saveWishlist(list);
    this.toast(added ? "Saved to your Wishlist" : "Removed from Wishlist", "info", 1500);
    if (typeof renderProducts === "function") renderProducts();
  },
  _updateWishlistUI() {
    const count = this.getWishlist().length;
    const badge = document.getElementById("wishlistBadge");
    if (badge) {
      badge.textContent = count;
      badge.classList.toggle("hidden", count === 0);
    }
    const mobCount = document.getElementById("mobWishlistCount");
    if (mobCount) mobCount.textContent = count;
  },
  notifyStock(id) {
    const p = PRODUCTS.findById(id);
    if (!p) return;
    const msg = `Hi M N Enterprises,\n\nPlease notify me when this item is back in stock at your Bangarapet shop:\n• *${p.name}*\n• Brand: ${p.brand || "Authorised Brand"}\n• Price: ${this.inr(p.price)}\n\nThank you!`;
    window.open("https://wa.me/" + this.WA + "?text=" + encodeURIComponent(msg), "_blank");
  },

  /* ---- 1-Click Reorder Past Order ---- */
  reorderOrder(orderId) {
    let orders = [];
    try { orders = JSON.parse(localStorage.getItem("mn_orders") || "[]"); } catch(e){}
    const o = orders.find(x => x.id === orderId);
    if (!o || !o.items || !o.items.length) {
      this.toast("Order details not found", "error");
      return;
    }
    const cart = this.getCart();
    const allProds = PRODUCTS.getAll();
    let readdedCount = 0;

    o.items.forEach(it => {
      let p = allProds.find(x => x.name.toLowerCase() === (it.name || "").toLowerCase());
      if (p) {
        cart[p.id] = (cart[p.id] || 0) + (Number(it.qty) || 1);
        readdedCount++;
      }
    });

    if (readdedCount === 0) {
      this.toast("Could not match items with current catalog", "info");
      return;
    }
    this.saveCart(cart);
    this._updateCartUI();
    this.renderCartDrawer();
    this.toast(`Reordered ${readdedCount} products into your cart!`, "success", 2400);
    openCart();
  },

  /* ---- Cart ---- */
  getCart()    { try{ return JSON.parse(localStorage.getItem("mn_cart")||"{}"); } catch{ return {}; } },
  saveCart(c)  { try{ localStorage.setItem("mn_cart", JSON.stringify(c)); } catch(e){} },
  cartCount()  { return Object.values(this.getCart()).reduce((a,b)=>a+b,0); },
  cartTotal()  {
    const cart=this.getCart(), prods=PRODUCTS.getAll();
    return Object.entries(cart).reduce((s,[id,q])=>{ const p=prods.find(x=>x.id===id); return s+(p?p.price*q:0); },0);
  },
  changeQty(id, delta) {
    const cart=this.getCart();
    const next=(cart[id]||0)+delta;
    if(next<=0) delete cart[id]; else cart[id]=next;
    this.saveCart(cart);
    this._updateCartUI();
    if(typeof renderProducts==="function") renderProducts();
    if(document.getElementById("cartBody")) this.renderCartDrawer();
    APP.toast(delta>0?"Added to order":"Removed from order", "success", 1600);
  },
  _updateCartUI() {
    const n = this.cartCount();
    const badge = document.getElementById("cartBadge");
    if (badge) { badge.textContent = n; badge.classList.toggle("hidden", n === 0); }
    const mbbBadge = document.getElementById("mbbCartBadge");
    if (mbbBadge) { mbbBadge.textContent = n; mbbBadge.classList.toggle("hidden", n === 0); }
    const bar = document.getElementById("cartBar");
    if (bar) {
      bar.classList.toggle("show", n > 0);
      const ce = document.getElementById("cartBarCount"), te = document.getElementById("cartBarTotal");
      if (ce) ce.textContent = n + (n === 1 ? " item" : " items");
      if (te) te.textContent = this.inr(this.cartTotal());
    }
  },

  /* ---- Header injection ---- */
  injectHeader() {
    const el = document.getElementById("app-header");
    if (!el) return;
    const page = document.documentElement.dataset.page || "";
    if (page === "admin") return; // Admin panel has its own dedicated top bar
    const base = "";
    const user = AUTH.getCustomerSession();
    const links = [
      {href:"index.html",  id:"home",    label:"Home"},
      {href:"shop.html",   id:"shop",    label:"Shop"},
      {href:"about.html",  id:"about",   label:"About"},
      {href:"contact.html",id:"contact", label:"Contact"},
    ];
    el.innerHTML = `
    <header class="site-header">
      <div class="header-inner">
        <a href="${base}index.html" class="brand">
          <div class="brand-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 7l3 3-8 8H6v-3l8-8z"/><path d="M17 4l3 3"/>
            </svg>
          </div>
          <div>
            <div class="brand-name">M N Enterprises</div>
            <div class="brand-sub">Plumbing &amp; Electrical, Bangarapet</div>
          </div>
        </a>
        <!-- Amazon Style Desktop Deliver To Widget -->
        <div class="desktop-deliver-btn" onclick="APP.openDeliveryModal()" title="Choose delivery location in Bangarapet" role="button" tabindex="0">
          <svg class="dd-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <div class="dd-text-wrap">
            <span class="dd-label">Deliver to</span>
            <span class="dd-loc" id="deskDeliverLoc">${localStorage.getItem("mn_delivery_loc") || "Bangarapet 563114"}</span>
          </div>
        </div>

        <!-- First Line Main Navigation: Home, Shop, About Us, Contact -->
        <nav class="desktop-firstline-nav" aria-label="Main Navigation">
          <a href="${base}index.html" class="dfn-link ${page==='home'?'active':''}">Home</a>
          <a href="${base}shop.html" class="dfn-link ${page==='shop'?'active':''}">Shop</a>
          <a href="${base}about.html" class="dfn-link ${page==='about'?'active':''}">About Us</a>
          <a href="${base}contact.html" class="dfn-link ${page==='contact'?'active':''}">Contact</a>
        </nav>

        <!-- Amazon Style Desktop Global Search Bar with Visual Photo Search -->
        <div class="desktop-search-wrap">
          <form class="desktop-search-box" action="${base}shop.html" method="GET" onsubmit="if(!this.search.value.trim()){window.location.href='${base}shop.html';return false;}">
            <input type="search" name="search" id="headerSearchInput" class="dsb-input" placeholder="Search genuine KEI wires, GM bulbs, PVC pipes, water pumps, CCTV..." autocomplete="off" aria-label="Search products">
            <button type="button" class="dsb-photo-btn" onclick="APP.openPhotoModal()" title="Search / Identify by Photo" aria-label="Visual photo search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>
              </svg>
              <span>Photo</span>
            </button>
            <button type="submit" class="dsb-search-btn" aria-label="Search catalogue" title="Search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
          </form>
        </div>

        <div class="header-actions">
          <button class="iconbtn" id="themeToggle" title="Toggle theme" aria-label="Toggle theme">
            <svg id="themeIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></svg>
          </button>
          <button class="iconbtn" id="wishlistBtn" onclick="APP.openWishlistModal()" title="View Saved / Wishlist" aria-label="Wishlist">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            <span class="badge hidden" id="wishlistBadge">0</span>
          </button>
          ${user ? `
            <a href="${base}account.html" class="user-btn" title="My account">
              ${user.photoURL ? `<img src="${user.photoURL}" class="user-avatar" style="object-fit:cover;width:28px;height:28px;border-radius:50%" alt="User">` : `<div class="user-avatar">${(user.name||"U")[0].toUpperCase()}</div>`}
              <div class="user-btn-text">
                <span class="user-btn-greeting">Hello, ${(user.name||"User").split(" ")[0]}</span>
                <span class="user-btn-label">Account &amp; Orders</span>
              </div>
            </a>
          ` : `<a href="${base}login.html" class="user-btn user-btn-signin" title="Sign in to your account">
                 <div class="user-btn-text">
                   <span class="user-btn-greeting">Hello, Sign in</span>
                   <span class="user-btn-label">Account &amp; Orders</span>
                 </div>
               </a>`}
          <button class="iconbtn cart-header-btn" id="cartBtn" aria-label="Open cart" title="View order">
            <div style="position:relative;display:inline-flex;align-items:center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>
                <path d="M2 3h2l2.6 12.4a2 2 0 002 1.6h8.8a2 2 0 002-1.6L21 7H6"/>
              </svg>
              <span class="badge hidden" id="cartBadge">0</span>
            </div>
            <span class="desk-cart-label">Cart</span>
          </button>
          <button class="hamburger" id="hamburger" aria-label="Open menu" aria-expanded="false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          </button>
        </div>
      </div>

      <!-- Desktop & Tablet Sub-Navigation Category Bar -->
      <div class="desktop-cat-strip" id="desktopCatStrip">
        <div class="dcs-inner">
          <a href="${base}shop.html" class="dcs-link dcs-all ${page==='shop'?'active':''}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            <span>All Products</span>
          </a>
          <span class="dcs-divider"></span>
          <a href="${base}shop.html?cat=lighting" class="dcs-link">💡 Lighting</a>
          <a href="${base}shop.html?cat=plumbing" class="dcs-link">🚰 Plumbing</a>
          <a href="${base}shop.html?cat=electrical" class="dcs-link">⚡ Wires &amp; Cables</a>
          <a href="${base}shop.html?cat=pumps" class="dcs-link">💧 Water Pumps</a>
          <a href="${base}shop.html?cat=cctv" class="dcs-link">📹 CCTV Security</a>
          <a href="${base}shop.html?cat=network" class="dcs-link">🌐 WiFi &amp; Networking</a>
          <span class="dcs-divider"></span>
          <a href="#" onclick="APP.openRequirementModal();return false;" class="dcs-link dcs-highlight" title="Build My Requirement">📋 Build Requirement</a>
          <a href="#" onclick="APP.openPhotoModal();return false;" class="dcs-link dcs-highlight" title="Identify Broken Parts">📷 Visual Search</a>
          <a href="#" onclick="APP.openAskExpertModal();return false;" class="dcs-link" title="Ask Hardware Specialist">👨‍🔧 Ask Expert</a>
          <a href="${base}admin/login.html" class="dcs-link dcs-admin" title="Store Staff &amp; Billing Portal">🛠️ Admin Portal &rarr;</a>
        </div>
      </div>

      <!-- Amazon App Style Mobile Search Bar -->
      <div class="mobile-app-search-wrap">
        <form class="mobile-app-search-box" action="${base}shop.html" method="GET" onsubmit="if(!this.search.value.trim()){window.location.href='${base}shop.html';return false;}">
          <svg class="mas-icon-search" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="search" name="search" class="mas-input" placeholder="Search M N Enterprises..." autocomplete="off" aria-label="Search products">
          <button type="button" class="mas-icon-btn" onclick="APP.openPhotoModal()" title="Identify by Photo" aria-label="Photo search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>
            </svg>
          </button>
        </form>
      </div>

      <!-- Amazon App Style Mobile Deliver To Strip -->
      <div class="mobile-deliver-strip" onclick="APP.openDeliveryModal()">
        <svg class="mds-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        <span class="mds-text">Deliver to <b id="hdrDeliverLoc">${localStorage.getItem("mn_delivery_loc") || "Bangarapet 563114"}</b></span>
        <svg class="mds-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      <!-- Amazon App Style Horizontal Category Strip -->
      <div class="mobile-cat-pill-strip" id="mobileCatPillStrip">
        <a href="${base}shop.html?cat=lighting" class="mc-pill">
          <div class="mc-pill-icon">💡</div>
          <span>Lighting</span>
        </a>
        <a href="${base}shop.html?cat=plumbing" class="mc-pill">
          <div class="mc-pill-icon">🚰</div>
          <span>Plumbing</span>
        </a>
        <a href="${base}shop.html?cat=electrical" class="mc-pill">
          <div class="mc-pill-icon">⚡</div>
          <span>Wires</span>
        </a>
        <a href="${base}shop.html?cat=pumps" class="mc-pill">
          <div class="mc-pill-icon">💧</div>
          <span>Pumps</span>
        </a>
        <a href="${base}shop.html?cat=cctv" class="mc-pill">
          <div class="mc-pill-icon">📹</div>
          <span>CCTV</span>
        </a>
        <a href="${base}shop.html?cat=network" class="mc-pill">
          <div class="mc-pill-icon">🌐</div>
          <span>WiFi</span>
        </a>
        <a href="#" onclick="APP.openRequirementModal();return false;" class="mc-pill">
          <div class="mc-pill-icon">📋</div>
          <span>Custom</span>
        </a>
        <a href="#" onclick="APP.openPhotoModal();return false;" class="mc-pill">
          <div class="mc-pill-icon">📷</div>
          <span>Identify</span>
        </a>
      </div>

      <!-- Amazon Festival & Sale Promo Cards Carousel (Sticky on Mobile) -->
      <div id="promoBannerWrap" class="promo-banner-wrap-header"></div>
    </header>
    <div class="mobile-nav-backdrop" id="mobileNavBackdrop" onclick="document.getElementById('mobileNav').classList.remove('show');this.classList.remove('show')"></div>
    <nav class="mobile-nav" id="mobileNav" aria-label="Mobile navigation">
      <div class="amazon-drawer-header">
        <div class="adh-avatar">${user ? (user.photoURL ? `<img src="${user.photoURL}" style="width:100%;height:100%;border-radius:50%;object-fit:cover" alt="User">` : (user.name||"U")[0].toUpperCase()) : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`}</div>
        <div class="adh-info">
          <div class="adh-hello">Hello, ${user ? (user.name || "Customer") : "Sign in"}</div>
          <div class="adh-sub">${user ? "M N Customer Member" : "Welcome to M N Enterprises"}</div>
        </div>
        <button type="button" class="adh-close-btn" onclick="document.getElementById('mobileNav').classList.remove('show');const b=document.getElementById('mobileNavBackdrop');b&&b.classList.remove('show')" aria-label="Close menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="amazon-drawer-body">
        <div class="adh-section-title">Trending &amp; Fast Actions</div>
        <a href="${base}index.html" class="${page==='home'?'active':''}">🏠 Home</a>
        <a href="${base}shop.html" class="${page==='shop'?'active':''}">🛍️ Browse All Products</a>
        <a href="#" onclick="APP.openWishlistModal();return false;">❤️ Saved Items (<span id="mobWishlistCount">0</span>)</a>
        <a href="#" onclick="APP.openRequirementModal();return false;">📋 Build My Requirement</a>
        <a href="#" onclick="APP.openPhotoModal();return false;">📷 Send Photo to Identify</a>
        <a href="#" onclick="APP.openAskExpertModal();return false;">👨🔧 Ask Shop Expert</a>

        <div class="adh-section-title" style="margin-top:14px">Your Account &amp; Orders</div>
        ${user
          ? `<a href="${base}account.html">👤 My Account &amp; Orders</a>
             <a href="#" id="mobileLogout">🚪 Sign out</a>`
          : `<a href="${base}login.html">🔑 Sign in / Register</a>`}

        <div class="adh-section-title" style="margin-top:14px">Store Information</div>
        <a href="tel:+919686311260">📞 Call: +91 96863 11260</a>
        <a href="https://wa.me/919686311260" target="_blank">💬 Chat on WhatsApp</a>
        <a href="${base}contact.html">📍 APMC Road, Bangarapet 563114</a>
        <a href="${base}admin/login.html" style="color:var(--amber);font-weight:700">🛠️ Store Admin Portal &rarr;</a>
      </div>
    </nav>`;

    document.getElementById("themeToggle").onclick = () => this.toggleTheme();
    this._updateThemeIcon();
    const ham = document.getElementById("hamburger");
    const mob = document.getElementById("mobileNav");
    const backdrop = document.getElementById("mobileNavBackdrop");
    ham && mob && (ham.onclick = () => {
      mob.classList.toggle("show");
      backdrop && backdrop.classList.toggle("show", mob.classList.contains("show"));
      ham.setAttribute("aria-expanded", mob.classList.contains("show"));
    });
    const cartBtn = document.getElementById("cartBtn");
    cartBtn && (cartBtn.onclick = openCart);
    const mLogout = document.getElementById("mobileLogout");
    mLogout && (mLogout.onclick = (e) => { e.preventDefault(); AUTH.logoutCustomer(); });
  },

  /* ---- Shared UI ---- */
  injectSharedUI() {
    const el = document.getElementById("shared-ui");
    if (!el) return;
    const page = document.documentElement.dataset.page || "";
    if (page === "admin") return;
    const base = "";
    const user = AUTH.getCustomerSession();

    el.innerHTML = `
      <div class="overlay" id="overlay" onclick="closeAll()"></div>
      <div class="drawer" id="cartDrawer" role="dialog" aria-label="Your order">
        <div class="drawer-head">
          <div style="display:flex;align-items:center;justify-content:space-between;width:100%">
            <h3 id="cartDrawerTitle">Your order</h3>
            <div style="display:flex;align-items:center;gap:6px">
              <button class="iconbtn" id="cartViewToggleBtn" onclick="APP.toggleCartViewMode()" title="Switch to Table View" aria-label="Toggle table view" style="border:1px solid var(--line);border-radius:8px;padding:6px;width:34px;height:34px;display:flex;align-items:center;justify-content:center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:17px;height:17px"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
              </button>
              <button class="iconbtn" onclick="closeAll()" aria-label="Close cart" style="border:1px solid var(--line);border-radius:8px;padding:6px;width:34px;height:34px;display:flex;align-items:center;justify-content:center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
        </div>
        <div class="drawer-body" id="cartBody"></div>
        <div class="drawer-foot" id="cartFoot"></div>
      </div>
      <div class="cartbar" id="cartBar">
        <div>
          <b id="cartBarCount">0 items</b>
          <div class="cb-sub" id="cartBarTotal">₹0</div>
        </div>
        <button class="btn btn-amber" onclick="openCart()">Review order</button>
      </div>
      <button class="wa-float" onclick="window.open('${APP.WA_HREF}','_blank')" title="Chat on WhatsApp" aria-label="WhatsApp">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.71.45 3.38 1.3 4.86L2.05 22l5.36-1.4a9.87 9.87 0 004.63 1.18h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm5.8 14.13c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.8-.11-.42-.13-.95-.31-1.64-.6-2.88-1.24-4.76-4.15-4.9-4.34-.14-.19-1.17-1.56-1.17-2.97 0-1.41.74-2.1 1-2.39.26-.28.57-.35.76-.35h.55c.18 0 .42-.07.65.5.24.58.81 2 .88 2.15.07.14.12.31.02.5-.1.19-.15.31-.3.48-.14.17-.3.37-.43.5-.14.14-.29.29-.13.57.17.28.75 1.24 1.6 2 1.11.99 2.04 1.29 2.32 1.44.29.14.45.12.62-.07.17-.19.72-.84.91-1.13.19-.28.38-.24.64-.14.26.1 1.66.78 1.94.93.29.14.48.21.55.33.07.12.07.68-.16 1.36z"/></svg>
      </button>

      <!-- Amazon App Style Symmetrical 5-Icon Bottom Navigation Bar -->
      <nav class="mobile-bottom-bar" id="mobileBottomBar" aria-label="Mobile Navigation">
        <a href="${base}index.html" class="mbb-item ${page==='home'?'active':''}">
          <div class="mbb-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span>Home</span>
        </a>
        <a href="${base}${user ? 'account.html' : 'login.html'}" class="mbb-item ${page==='account'||page==='login'?'active':''}">
          <div class="mbb-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <span>You</span>
        </a>
        <button type="button" class="mbb-item mbb-cart-btn" onclick="openCart()" aria-label="View Cart">
          <div class="mbb-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>
              <path d="M2 3h2l2.6 12.4a2 2 0 002 1.6h8.8a2 2 0 002-1.6L21 7H6"/>
            </svg>
            <span class="mbb-badge hidden" id="mbbCartBadge">0</span>
          </div>
          <span>Cart</span>
        </button>
        <a href="${base}shop.html" class="mbb-item ${page==='shop'?'active':''}">
          <div class="mbb-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
              <rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>
            </svg>
          </div>
          <span>Shop</span>
        </a>
        <button type="button" class="mbb-item" onclick="const m=document.getElementById('mobileNav');const b=document.getElementById('mobileNavBackdrop');if(m){m.classList.toggle('show');b&&b.classList.toggle('show',m.classList.contains('show'))}" aria-label="Menu">
          <div class="mbb-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
            </svg>
          </div>
          <span>Menu</span>
        </button>
      </nav>

      <!-- Order Confirmation Success Modal with Bill Image & Full Invoice Link -->
      <div class="modal" id="successModal" role="dialog" aria-label="Order sent" style="max-width:440px">
        <button class="modal-close-btn" onclick="closeAll()" aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        <div class="success-check">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/></svg>
          <h3 id="successModalTitle" style="margin-top:8px">Order Placed Successfully!</h3>
          <p id="successModalDesc" style="font-size:13px;color:var(--muted);margin-top:6px">Your order has been notified to M N Enterprises counter. You can view your full GST invoice below.</p>
        </div>
        <div id="successReceiptPreview" style="margin:14px 0;text-align:center"></div>
        <div id="successList" style="margin-top:10px"></div>
        
        <a id="btnViewFullInvoice" class="btn btn-primary btn-full" style="justify-content:center;margin-top:12px;font-weight:700" href="invoice.html" target="_blank">
          📄 View &amp; Print Full Tax Invoice ↗
        </a>
        
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px">
          <button id="btnDlBill" class="btn btn-secondary btn-sm" style="justify-content:center" onclick="APP.downloadLastBillImage()">
            🖼️ Save Bill Image
          </button>
          <button class="btn btn-sm" style="justify-content:center;background:#25D366;color:#fff;border:none" onclick="APP.shareLastOrderWhatsApp()">
            📲 WhatsApp Bill
          </button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">
          <a href="account.html" class="btn btn-sm btn-secondary" style="justify-content:center;text-decoration:none;display:inline-flex;align-items:center">
            📦 Track in Account
          </a>
          <button class="btn btn-secondary btn-sm" style="justify-content:center" onclick="closeAll()">Close</button>
        </div>
      </div>

      <!-- Delivery Location Selector Modal -->
      <div class="customer-modal" id="deliveryModal" role="dialog" aria-label="Select Delivery Location">
        <div class="cmodal-header">
          <h3>📍 Select Delivery Location</h3>
          <button class="modal-close-btn" onclick="closeAll()" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="cmodal-body" id="deliveryModalContent">
          <p style="font-size:12.5px;color:var(--muted);margin-bottom:12px">Choose your delivery area in Bangarapet for fast store pickup or local fulfillment:</p>
          <div style="display:flex;flex-direction:column;gap:8px">
            <button class="btn btn-secondary btn-full" style="justify-content:flex-start;text-align:left;padding:10px 12px" onclick="APP.setDeliveryLocation('Bangarapet Town (563114)')">
              🏢 <b>Bangarapet Town</b> <span style="font-size:11px;color:var(--muted);margin-left:auto">Main Town</span>
            </button>
            <button class="btn btn-secondary btn-full" style="justify-content:flex-start;text-align:left;padding:10px 12px" onclick="APP.setDeliveryLocation('APMC Market Yard (563114)')">
              🛒 <b>APMC Market Yard &amp; Kempegowda Circle</b> <span style="font-size:11px;color:var(--muted);margin-left:auto">Local Area</span>
            </button>
            <button class="btn btn-secondary btn-full" style="justify-content:flex-start;text-align:left;padding:10px 12px" onclick="APP.setDeliveryLocation('KGF Road, Bangarapet (563114)')">
              🛣️ <b>KGF Road / Station Area</b> <span style="font-size:11px;color:var(--muted);margin-left:auto">Bangarapet</span>
            </button>
            <button class="btn btn-secondary btn-full" style="justify-content:flex-start;text-align:left;padding:10px 12px" onclick="APP.setDeliveryLocation('Desihalli, Bangarapet (563114)')">
              🏡 <b>Desihalli Extension</b> <span style="font-size:11px;color:var(--muted);margin-left:auto">Town Area</span>
            </button>
          </div>
          <div style="margin-top:14px;border-top:1px solid var(--line);padding-top:12px">
            <label style="font-size:12px;font-weight:700">Or Enter Specific Address / Site:</label>
            <input type="text" id="customDeliveryInput" class="mas-input" style="width:100%;border:1px solid var(--line);border-radius:8px;padding:9px 12px;margin:8px 0;background:var(--surface-2)" placeholder="e.g. Near Bus Stand, Bangarapet">
            <button class="btn btn-primary btn-full" onclick="APP.setCustomDeliveryLocation()">Apply Custom Address</button>
          </div>
        </div>
      </div>

      <!-- Real-Time Customer Order Status Pop-up Notification -->
      <div id="customerStatusNotification" style="position:fixed;bottom:24px;right:24px;z-index:99999;max-width:390px;background:var(--surface);border:1px solid var(--line);border-radius:16px;box-shadow:0 16px 48px rgba(0,0,0,0.28);padding:16px 18px;display:none;align-items:flex-start;gap:12px;transition:all 0.35s cubic-bezier(0.16,1,0.3,1);backdrop-filter:blur(8px)">
        <div id="csnIcon" style="width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;flex:none;background:rgba(59,130,246,0.15)">
          🔵
        </div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:6px">
            <span id="csnBadge" style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:100px;background:rgba(59,130,246,0.15);color:#2563EB">Order Update</span>
            <button onclick="document.getElementById('customerStatusNotification').style.display='none'" style="border:none;background:none;color:var(--muted);font-size:20px;line-height:1;cursor:pointer;padding:0 2px">&times;</button>
          </div>
          <div id="csnTitle" style="font-weight:700;font-size:14px;color:var(--ink);margin-top:4px">Order Status Updated</div>
          <div id="csnMsg" style="font-size:12.5px;color:var(--muted);margin-top:3px;line-height:1.4">Your order has been updated.</div>
          <div style="margin-top:10px;display:flex;gap:8px">
            <a id="csnLink" href="account.html" class="btn btn-sm btn-primary" style="font-size:11.5px;padding:6px 12px;text-decoration:none">View Order Tracking &rarr;</a>
          </div>
        </div>
      </div>

      <!-- Rich E-Commerce Product Details Modal (Amazon / Flipkart Style) -->
      <div class="product-detail-modal" id="productDetailModal" role="dialog" aria-label="Product Details">
        <button class="modal-close-btn" onclick="closeAll()" aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        <div id="productDetailContent"></div>
      </div>

      <!-- Wishlist Modal -->
      <div class="customer-modal" id="wishlistModal" role="dialog" aria-label="My Wishlist">
        <div class="cmodal-header">
          <h3>❤️ Saved Items (Wishlist)</h3>
          <button class="modal-close-btn" onclick="closeAll()" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="cmodal-body" id="wishlistModalContent"></div>
      </div>

      <!-- Requirement Builder Modal -->
      <div class="customer-modal" id="requirementModal" role="dialog" aria-label="Build Requirement" style="max-width:720px">
        <div class="cmodal-header">
          <div>
            <h3>📋 Build My Requirement</h3>
            <span style="font-size:12px;color:var(--muted)">ಪ್ರಾಜೆಕ್ಟ್ ಸಾಮಗ್ರಿ ಪಟ್ಟಿ — Instant Package Generator</span>
          </div>
          <button class="modal-close-btn" onclick="closeAll()" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="cmodal-body" id="reqModalContent"></div>
      </div>

      <!-- Send a Photo Modal -->
      <div class="customer-modal" id="photoModal" role="dialog" aria-label="Send Photo to Identify">
        <div class="cmodal-header">
          <h3>📷 Don't Know the Part Name?</h3>
          <button class="modal-close-btn" onclick="closeAll()" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="cmodal-body" id="photoModalContent"></div>
      </div>

      <!-- Ask a Shop Expert Modal -->
      <div class="customer-modal" id="expertModal" role="dialog" aria-label="Ask Shop Expert">
        <div class="cmodal-header">
          <h3>👨🔧 Ask M N Enterprises Expert</h3>
          <button class="modal-close-btn" onclick="closeAll()" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="cmodal-body" id="expertModalContent"></div>
      </div>`;
  },

  /* ---- Product Detail Modal Controller ---- */
  openProductDetail(id) {
    const p = PRODUCTS.findById(id);
    if (!p) return;
    const content = document.getElementById("productDetailContent");
    if (!content) return;
    const pct = p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0;
    const saveAmt = p.mrp - p.price;
    const cart = this.getCart();
    const curQty = cart[p.id] || 1;
    const compatibility = PRODUCTS.getCompatibility(p.id);
    const related = PRODUCTS.getRelated(p.id);

    let specsHtml = "";
    if (p.specs && typeof p.specs === "object") {
      specsHtml = `
        <div class="pdm-sec-title">Technical Specifications</div>
        <table class="pdm-specs-table">
          <tbody>
            ${Object.entries(p.specs).map(([k, v]) => `
              <tr>
                <td class="spec-key">${k}</td>
                <td class="spec-val">${v}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
    }

    let highlightsHtml = "";
    if (p.highlights && Array.isArray(p.highlights) && p.highlights.length) {
      highlightsHtml = `
        <div class="pdm-sec-title">Key Highlights</div>
        <ul class="pdm-highlights-list">
          ${p.highlights.map(h => `
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>${h}</span>
            </li>
          `).join("")}
        </ul>
      `;
    }

    content.innerHTML = `
      <div class="pdm-layout">
        <!-- Left: Image & Trust Badges -->
        <div class="pdm-left">
          <div class="pdm-img-container">
            <img src="${p.img}" alt="${p.name}" loading="eager" onerror="this.onerror=null;this.src='assets/img/products/gm-led-bulb-9w.jpg'">
          </div>
          <div class="pdm-trust-badges">
            <div class="pdm-trust-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>100% Genuine</span>
            </div>
            <div class="pdm-trust-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              <span>Shop Pickup</span>
            </div>
            <div class="pdm-trust-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h0M2 9.5h20"/></svg>
              <span>GST Invoice</span>
            </div>
          </div>
        </div>

        <!-- Right: Information & Actions -->
        <div class="pdm-right">
          ${p.brand ? `<span class="pdm-brand-pill">${p.brand}</span>` : ""}
          <h2 class="pdm-title">${p.name}</h2>
          
          <div class="pdm-meta-row">
            <span class="pdm-rating">
              <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              ${p.rating || "4.8"}
            </span>
            <span style="color:var(--muted)">(${p.reviews || 95} verified reviews)</span>
            <span class="pdm-stock-pill">● In Stock at Bangarapet Store</span>
          </div>

          <!-- Price Card -->
          <div class="pdm-price-card">
            <div class="pdm-price-row">
              <span class="pdm-price">${this.inr(p.price)}</span>
              ${p.mrp > p.price ? `
                <span class="pdm-mrp">${this.inr(p.mrp)}</span>
                <span class="pdm-save">Save ${this.inr(saveAmt)} (${pct}% OFF)</span>
              ` : ""}
            </div>
            <div class="pdm-price-note">Special store discount price • Direct retail billing at APMC Road shop</div>
          </div>

          <!-- Highlights -->
          ${highlightsHtml}

          <!-- Full Description -->
          <div class="pdm-sec-title">Product Details &amp; Application</div>
          <div class="pdm-full-desc">${p.desc || "Genuine hardware fitting stocked directly at M N Enterprises Bangarapet."}</div>

          <!-- Technical Specs -->
          ${specsHtml}

          <!-- Compatibility Information -->
          ${compatibility ? `
            <div class="pdm-sec-title">What Does This Fit? (Compatibility)</div>
            <div style="background:var(--surface-2);border:1px solid var(--line);border-radius:8px;padding:12px 14px;font-size:13px;color:var(--ink);margin-bottom:14px;display:flex;align-items:flex-start;gap:10px">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;color:var(--amber);flex:none;margin-top:2px"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
              <span>${compatibility}</span>
            </div>
          ` : ""}

          <!-- Frequently Bought Together / Related Products -->
          ${related && related.length ? `
            <div class="pdm-sec-title">You May Also Need (Companion Hardware)</div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));gap:10px;margin-bottom:18px">
              ${related.map(r => `
                <div style="background:var(--surface-2);border:1px solid var(--line);border-radius:8px;padding:8px;text-align:center;display:flex;flex-direction:column;justify-content:space-between">
                  <img src="${r.img}" style="width:100%;height:68px;object-fit:cover;border-radius:6px;background:var(--surface)" alt="${r.name}" onerror="this.onerror=null;this.src='assets/img/products/gm-led-bulb-9w.jpg'">
                  <div style="font-size:11.5px;font-weight:600;margin:6px 0 2px;line-height:1.2;color:var(--ink);height:28px;overflow:hidden">${r.name}</div>
                  <div style="font-size:12px;font-weight:700;color:var(--amber);margin-bottom:6px">${this.inr(r.price)}</div>
                  <button class="btn btn-sm btn-secondary" style="font-size:11px;padding:4px 6px;justify-content:center" onclick="APP.changeQty('${r.id}', 1)">+ Add</button>
                </div>
              `).join("")}
            </div>
          ` : ""}

          <!-- Actions -->
          <div class="pdm-actions-box">
            <div class="pdm-qty-line">
              <span style="font-weight:700;font-size:13.5px">Select Quantity:</span>
              <div class="stepper" style="height:36px">
                <button type="button" onclick="APP.detailQtyMod(-1, '${p.id}')">−</button>
                <span id="detailQtyVal">${curQty}</span>
                <button type="button" onclick="APP.detailQtyMod(1, '${p.id}')">+</button>
              </div>
            </div>
            <div class="pdm-btn-grid">
              <button class="btn btn-primary" style="justify-content:center;height:42px" onclick="APP.addDetailToCart('${p.id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px"><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/><path d="M2 3h2l2.6 12.4a2 2 0 002 1.6h8.8a2 2 0 002-1.6L21 7H6"/></svg>
                Add to Order
              </button>
              <button class="btn" style="background:#25D366;color:#fff;border:none;justify-content:center;height:42px" onclick="APP.enquireWhatsApp('${p.id}')">
                <svg viewBox="0 0 24 24" fill="currentColor" style="width:17px;height:17px"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.71.45 3.38 1.3 4.86L2.05 22l5.36-1.4a9.87 9.87 0 004.63 1.18h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm5.8 14.13c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.8-.11-.42-.13-.95-.31-1.64-.6-2.88-1.24-4.76-4.15-4.9-4.34-.14-.19-1.17-1.56-1.17-2.97 0-1.41.74-2.1 1-2.39.26-.28.57-.35.76-.35h.55c.18 0 .42-.07.65.5.24.58.81 2 .88 2.15.07.14.12.31.02.5-.1.19-.15.31-.3.48-.14.17-.3.37-.43.5-.14.14-.29.29-.13.57.17.28.75 1.24 1.6 2 1.11.99 2.04 1.29 2.32 1.44.29.14.45.12.62-.07.17-.19.72-.84.91-1.13.19-.28.38-.24.64-.14.26.1 1.66.78 1.94.93.29.14.48.21.55.33.07.12.07.68-.16 1.36z"/></svg>
                Ask on WhatsApp
              </button>
            </div>
            <a href="tel:+919686311260" class="btn btn-ghost btn-sm" style="justify-content:center;color:var(--muted)">
              📞 Need immediate phone assistance? Call 9686311260
            </a>
          </div>
        </div>
      </div>
    `;

    closeAll();
    document.getElementById("overlay")?.classList.add("show");
    document.getElementById("productDetailModal")?.classList.add("show");
  },

  detailQtyMod(delta, id) {
    const valEl = document.getElementById("detailQtyVal");
    if (!valEl) return;
    let cur = parseInt(valEl.textContent, 10) || 1;
    cur = Math.max(1, cur + delta);
    valEl.textContent = cur;
  },

  addDetailToCart(id) {
    const valEl = document.getElementById("detailQtyVal");
    const qty = parseInt(valEl?.textContent, 10) || 1;
    const cart = this.getCart();
    cart[id] = (cart[id] || 0) + qty;
    this.saveCart(cart);
    this._updateCartUI();
    if (typeof renderProducts === "function") renderProducts();
    this.toast(`Added ${qty} to your order`, "success");
    closeAll();
    openCart();
  },

  /* ---- Delivery Location Controller ---- */
  openDeliveryModal() {
    closeAll();
    document.getElementById("overlay")?.classList.add("show");
    document.getElementById("deliveryModal")?.classList.add("show");
  },

  setDeliveryLocation(loc) {
    if (!loc) return;
    try {
      localStorage.setItem("mn_delivery_loc", loc);
    } catch(e){}
    const el = document.getElementById("hdrDeliverLoc");
    if (el) el.textContent = loc;
    const deskEl = document.getElementById("deskDeliverLoc");
    if (deskEl) deskEl.textContent = loc;
    this.toast(`Delivery set to: ${loc}`, "success");
    closeAll();
  },

  setCustomDeliveryLocation() {
    const val = (document.getElementById("customDeliveryInput")?.value || "").trim();
    if (!val) {
      this.toast("Please enter your delivery street or landmark", "error");
      return;
    }
    this.setDeliveryLocation(val);
  },

  /* ---- Festival & Sale Promo Banners Controller (Amazon Style with Product Images) ---- */
  getPromoBanners() {
    try {
      const stored = JSON.parse(localStorage.getItem("mn_promo_banners") || "[]");
      if (stored && stored.length && stored.every(b => b.img && !b.img.includes("gm-led-bulb-9w.jpg") || b.id !== "b1")) return stored;
    } catch(e){}
    return [
      {
        id: "b1",
        badge: "⚡ 35% OFF • FESTIVAL SALE",
        title: "Ugadi Maha Sale — Flat 35% OFF",
        sub: "GM Modular Switches & KEI 90m Copper Wires at Counter Rates",
        link: "shop.html?cat=electrical",
        bg: "linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)",
        img: "assets/img/products/modular-switch.jpg",
        off: "35% OFF",
        active: true
      },
      {
        id: "b2",
        badge: "🚰 40% OFF • FESTIVE SALE",
        title: "Supreme & Finolex Pipe Combo Offer",
        sub: "CPVC & PVC Pipes with Solvent & Fittings Free Delivery in Bangarapet",
        link: "shop.html?cat=plumbing",
        bg: "linear-gradient(135deg, #064E3B 0%, #047857 100%)",
        img: "assets/img/products/cpvc-pipes.jpg",
        off: "40% OFF",
        active: true
      },
      {
        id: "b3",
        badge: "📹 30% OFF • SECURITY PACK",
        title: "HD CCTV 4-Camera Security Pack",
        sub: "Complete Dome + DVR + 500GB HDD Security Package with Store Guarantee",
        link: "shop.html?cat=cctv",
        bg: "linear-gradient(135deg, #701A75 0%, #86198F 100%)",
        img: "assets/img/products/cctv-camera.jpg",
        off: "30% OFF",
        active: true
      },
      {
        id: "b4",
        badge: "💧 20% OFF • PUMP SALE",
        title: "Crompton & Kirloskar Water Pumps",
        sub: "1.0 HP & 1.5 HP Openwell & Borewell Submersible Pumps at Store Rates",
        link: "shop.html?cat=pumps",
        bg: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)",
        img: "assets/img/products/water-pump.jpg",
        off: "20% OFF",
        active: true
      }
    ];
  },

  savePromoBanners(list) {
    try {
      localStorage.setItem("mn_promo_banners", JSON.stringify(list));
    } catch(e){}
  },

  renderPromoBanners(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const banners = this.getPromoBanners().filter(b => b.active !== false);
    if (!banners.length) { el.style.display = "none"; return; }
    el.innerHTML = `
      <div class="promo-banner-carousel">
        ${banners.map(b => `
          <a href="${b.link || 'shop.html'}" class="promo-banner-card" style="background:${b.bg || 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)'} !important">
            <div style="flex:1;min-width:0;padding-right:10px;display:flex;flex-direction:column;justify-content:space-between">
              <div>
                <span class="pbc-badge">${b.badge || 'FESTIVAL SALE'}</span>
                <div class="pbc-title">${b.title}</div>
                <div class="pbc-sub">${b.sub}</div>
              </div>
              <div style="margin-top:8px;display:inline-flex;align-items:center;gap:4px;font-size:11.5px;font-weight:700;color:var(--amber)">
                Shop Deals →
              </div>
            </div>
            ${b.img ? `
            <div style="flex:none;position:relative;width:90px;height:90px;background:#ffffff;border-radius:12px;display:flex;align-items:center;justify-content:center;padding:6px;box-shadow:0 4px 12px rgba(0,0,0,0.25)">
              <img src="${b.img}" alt="${b.title}" style="max-width:100%;max-height:100%;object-fit:contain;border-radius:8px" onerror="this.onerror=null;this.src='assets/img/products/gm-led-bulb-9w.jpg'">
              ${b.off ? `<span style="position:absolute;bottom:-4px;right:-4px;background:#EF4444;color:#fff;font-size:9px;font-weight:800;padding:2px 5px;border-radius:4px;box-shadow:0 2px 4px rgba(0,0,0,0.3)">${b.off}</span>` : ''}
            </div>` : ''}
          </a>
        `).join("")}
      </div>
    `;
  },

  /* ---- WhatsApp Monospace Table & Canvas Bill Generator (No AI) ---- */
  getWhatsAppFooter() {
    return [
      "------------------------------------",
      "Store: *M N Enterprises* - Bangarapet",
      "Location: APMC Road, Opp. Kempe Gowda Circle",
      "Phone: +91 96863 11260",
      "Hours: 6:30 AM - 9:00 PM (Everyday)"
    ].join("\n");
  },

  formatWhatsAppBill({ orderId, date, name, phone, note, slot, items, total, gstRate }) {
    const d = date ? new Date(date) : new Date();
    const dateStr = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const timeStr = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    const rawId = String(orderId || Date.now());
    const idStr = `#MN-${rawId.replace(/^ord/i, "").slice(-6).toUpperCase()}`;
    const rate = gstRate !== undefined ? gstRate : this.getGSTRate();

    // Monospaced fixed-width table (36 characters wide, 100% ASCII-compatible)
    const W = 36;
    const padR = (str, len) => (str.length > len ? str.slice(0, len - 1) + "." : str.padEnd(len, " "));
    const padL = (str, len) => (str.length > len ? str.slice(0, len) : str.padStart(len, " "));

    let t = "";
    t += "=".repeat(W) + "\n";
    t += "       M N ENTERPRISES\n";
    t += "    TAX INVOICE / BILL\n";
    t += "=".repeat(W) + "\n";
    t += `GSTIN: ${this.GSTIN}\n`;
    t += `Ref : ${idStr}\n`;
    t += `Date: ${dateStr} ${timeStr}\n`;
    if (name) t += `Cust: ${padR(name, 30)}\n`;
    if (phone) t += `Ph  : ${padR(phone, 30)}\n`;
    if (slot) t += `Slot: ${padR(slot, 30)}\n`;
    if (note) t += `Note: ${padR(note, 30)}\n`;
    t += "-".repeat(W) + "\n";
    t += `${padR("ITEM", 17)}${padL("QTY", 4)}${padL("RATE", 6)}${padL("TOTAL", 9)}\n`;
    t += "-".repeat(W) + "\n";

    let calcSubtotal = 0;
    let totalQty = 0;
    (items || []).forEach((item, idx) => {
      const num = idx + 1;
      const rawName = item.name || item.p?.name || item.product?.name || "Item";
      const itemName = `${num}.${rawName}`;
      const qty = Number(item.qty) || 1;
      totalQty += qty;
      const price = Number(item.price || item.p?.price || item.product?.price) || 0;
      const lineTotal = price * qty;
      calcSubtotal += lineTotal;

      const lineName = padR(itemName, 17);
      const lineQty = padL(String(qty), 4);
      const lineRate = padL(String(price), 6);
      const lineTot = padL(String(lineTotal), 9);
      t += `${lineName}${lineQty}${lineRate}${lineTot}\n`;
    });

    const subtotal = total !== undefined ? total : calcSubtotal;
    const gst = this.calcGST(subtotal, rate);

    t += "-".repeat(W) + "\n";
    t += `${padR("ITEMS: " + (items || []).length, 18)}${padL("QTY: " + totalQty, 18)}\n`;
    t += `${padR("SUBTOTAL (Rs):", 22)}${padL(subtotal.toLocaleString("en-IN"), 14)}\n`;
    if (rate > 0) {
      t += `${padR("CGST (" + (rate/2) + "%):", 22)}${padL(gst.cgst.toLocaleString("en-IN"), 14)}\n`;
      t += `${padR("SGST (" + (rate/2) + "%):", 22)}${padL(gst.sgst.toLocaleString("en-IN"), 14)}\n`;
      t += `${padR("GST TOTAL (" + rate + "%):", 22)}${padL(gst.gstAmt.toLocaleString("en-IN"), 14)}\n`;
    } else {
      t += `${padR("GST:", 22)}${padL("Exempted", 14)}\n`;
    }
    t += "=".repeat(W) + "\n";
    t += `${padR("TOTAL PAYABLE (Rs):", 22)}${padL(gst.total.toLocaleString("en-IN"), 14)}\n`;
    t += "=".repeat(W) + "\n";

    return [
      "*M N ENTERPRISES — TAX INVOICE*",
      `GSTIN: ${this.GSTIN} | APMC Road, Bangarapet`,
      "Phone: 096863 11260\n",
      "```",
      t.trimEnd(),
      "```\n",
      `*Fulfillment:* ${slot || "Store Pickup (APMC Road)"}`,
      "*Payment:* Cash on Counter / UPI (GPay, PhonePe)",
      "*Status:* Confirmed - Packing in progress\n",
      "_Thank you for shopping with M N Enterprises!_",
      this.getWhatsAppFooter()
    ].join("\n");
  },

  /* ---- Pure HTML5 Canvas Receipt Image Generator (0% AI, Offline, Instant) ---- */
  createBillReceiptCanvas({ orderId, date, name, phone, note, items, total, gstRate }) {
    const d = date ? new Date(date) : new Date();
    const dateStr = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const timeStr = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    const rawId = String(orderId || Date.now());
    const idStr = `#MN-${rawId.replace(/^ord/i, "").slice(-6).toUpperCase()}`;
    const rate = gstRate !== undefined ? gstRate : this.getGSTRate();

    const numItems = (items || []).length;
    const canvas = document.createElement("canvas");
    const W = 680;
    const rowHeight = 44;
    // Extra height for GST breakdown rows
    const gstExtraH = rate > 0 ? 90 : 52;
    const H = 460 + numItems * rowHeight + (note ? 32 : 0) + gstExtraH;

    canvas.width = W * 2;
    canvas.height = H * 2;
    const ctx = canvas.getContext("2d");
    ctx.scale(2, 2);

    // Canvas Background
    ctx.fillStyle = "#0B0F19";
    ctx.fillRect(0, 0, W, H);

    // Outer Receipt Card
    ctx.fillStyle = "#131C2E";
    ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(16, 16, W - 32, H - 32, 16);
    ctx.fill();
    ctx.stroke();

    // Top Amber Gold Accent Bar
    ctx.fillStyle = "#F59E0B";
    ctx.beginPath();
    ctx.roundRect(16, 16, W - 32, 8, [16, 16, 0, 0]);
    ctx.fill();

    // Store Branding
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 26px Archivo, sans-serif";
    ctx.fillText("M N ENTERPRISES", 40, 64);

    ctx.fillStyle = "#F59E0B";
    ctx.font = "bold 13px Inter, sans-serif";
    ctx.fillText("AUTHORISED ELECTRICAL & PLUMBING HARDWARE", 40, 86);

    ctx.fillStyle = "#CBD5E1";
    ctx.font = "11px Inter, sans-serif";
    ctx.fillText("#1 APMC Road, Opp. Kempe Gowda Circle, Bangarapet · Ph: 096863 11260", 40, 104);
    ctx.fillText(`GSTIN: ${this.GSTIN}`, 40, 118);

    // Dashed divider line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(40, 132);
    ctx.lineTo(W - 40, 132);
    ctx.stroke();
    ctx.setLineDash([]);

    // TAX INVOICE badge
    ctx.fillStyle = "#1E2A42";
    ctx.beginPath();
    ctx.roundRect(40, 138, 140, 22, 4);
    ctx.fill();
    ctx.fillStyle = "#F59E0B";
    ctx.font = "bold 11px Inter, sans-serif";
    ctx.fillText("TAX INVOICE", 55, 153);

    // Order Meta Info Box
    const metaH = note ? 82 : 56;
    ctx.fillStyle = "#1E2A42";
    ctx.beginPath();
    ctx.roundRect(40, 170, W - 80, metaH, 8);
    ctx.fill();

    ctx.fillStyle = "#94A3B8";
    ctx.font = "11px Inter, sans-serif";
    ctx.fillText("ORDER REF", 56, 190);
    ctx.fillText("DATE & TIME", 220, 190);
    ctx.fillText("CUSTOMER", 420, 190);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 13px Inter, sans-serif";
    ctx.fillText(idStr, 56, 208);
    ctx.fillText(`${dateStr} ${timeStr}`, 220, 208);
    const custDisplay = name ? (phone ? `${name} (${phone})` : name) : (phone ? `Ph: ${phone}` : "Counter Customer");
    ctx.fillText(custDisplay, 420, 208);

    if (note) {
      ctx.fillStyle = "#F59E0B";
      ctx.font = "italic 11.5px Inter, sans-serif";
      ctx.fillText(`Note: ${note}`, 56, 236);
    }

    // Table Header
    const tableTop = note ? 264 : 238;
    ctx.fillStyle = "#1A253C";
    ctx.beginPath();
    ctx.roundRect(40, tableTop, W - 80, 32, 6);
    ctx.fill();

    ctx.fillStyle = "#F59E0B";
    ctx.font = "bold 11px Inter, sans-serif";
    ctx.fillText("#", 54, tableTop + 20);
    ctx.fillText("ITEM DESCRIPTION", 80, tableTop + 20);
    ctx.fillText("QTY", 410, tableTop + 20);
    ctx.fillText("PRICE", 480, tableTop + 20);
    ctx.fillText("TOTAL", W - 100, tableTop + 20);

    // Table Rows
    let currentY = tableTop + 34;
    let calcSubtotal = 0;

    (items || []).forEach((item, idx) => {
      const num = idx + 1;
      const itemName = item.name || item.p?.name || item.product?.name || "Product";
      const qty = Number(item.qty) || 1;
      const price = Number(item.price || item.p?.price || item.product?.price) || 0;
      const lineTotal = price * qty;
      calcSubtotal += lineTotal;

      if (idx % 2 === 1) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
        ctx.fillRect(40, currentY, W - 80, rowHeight);
      }

      ctx.fillStyle = "#94A3B8";
      ctx.font = "bold 12px Inter, sans-serif";
      ctx.fillText(String(num), 54, currentY + 26);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "500 12.5px Inter, sans-serif";
      let displayItemName = itemName;
      if (displayItemName.length > 34) displayItemName = displayItemName.slice(0, 32) + "\u2026";
      ctx.fillText(displayItemName, 80, currentY + 26);

      ctx.fillStyle = "#CBD5E1";
      ctx.font = "600 12.5px Inter, sans-serif";
      ctx.fillText(String(qty), 415, currentY + 26);
      ctx.fillText("\u20b9" + price.toLocaleString("en-IN"), 480, currentY + 26);

      ctx.fillStyle = "#F59E0B";
      ctx.font = "bold 13px Inter, sans-serif";
      ctx.fillText("\u20b9" + lineTotal.toLocaleString("en-IN"), W - 105, currentY + 26);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
      ctx.beginPath();
      ctx.moveTo(40, currentY + rowHeight);
      ctx.lineTo(W - 40, currentY + rowHeight);
      ctx.stroke();

      currentY += rowHeight;
    });

    // GST Summary Box
    const subtotalAmt = total !== undefined ? total : calcSubtotal;
    const gst = this.calcGST(subtotalAmt, rate);
    const summaryTop = currentY + 16;
    const summaryH = rate > 0 ? 140 : 90;

    ctx.fillStyle = "#1E2A42";
    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(40, summaryTop, W - 80, summaryH, 10);
    ctx.fill();
    ctx.stroke();

    // Summary rows
    const col1 = 56;
    const col2 = W - 110;
    let sy = summaryTop + 22;

    const drawSummaryRow = (label, val, bold, color) => {
      ctx.fillStyle = color || "#94A3B8";
      ctx.font = (bold ? "bold" : "500") + " 12px Inter, sans-serif";
      ctx.fillText(label, col1, sy);
      ctx.textAlign = "right";
      ctx.fillStyle = color || (bold ? "#FFFFFF" : "#CBD5E1");
      ctx.fillText(val, col2, sy);
      ctx.textAlign = "left";
      sy += 20;
    };

    drawSummaryRow("Subtotal (excl. GST)", "\u20b9" + subtotalAmt.toLocaleString("en-IN"), false);
    if (rate > 0) {
      const halfRate = rate / 2;
      drawSummaryRow(`CGST @ ${halfRate}%`, "\u20b9" + gst.cgst.toLocaleString("en-IN"), false);
      drawSummaryRow(`SGST @ ${halfRate}%`, "\u20b9" + gst.sgst.toLocaleString("en-IN"), false);
      // Divider
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(col1, sy - 4); ctx.lineTo(W - 40, sy - 4); ctx.stroke();
      sy += 4;
      drawSummaryRow(`Total GST (${rate}%)`, "\u20b9" + gst.gstAmt.toLocaleString("en-IN"), true, "#F59E0B");
    } else {
      drawSummaryRow("GST", "Exempted", false, "#64748B");
    }

    // Divider before grand total
    ctx.strokeStyle = "rgba(245,158,11,0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(col1, sy); ctx.lineTo(W - 40, sy); ctx.stroke();
    sy += 14;

    ctx.fillStyle = "#94A3B8";
    ctx.font = "bold 12px Inter, sans-serif";
    ctx.fillText("TOTAL PAYABLE", col1, sy);
    ctx.fillStyle = "#F59E0B";
    ctx.font = "bold 22px Archivo, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("\u20b9" + gst.total.toLocaleString("en-IN"), col2 + 10, sy + 2);
    ctx.textAlign = "left";

    sy += 24;
    ctx.fillStyle = "#64748B";
    ctx.font = "11px Inter, sans-serif";
    ctx.fillText("Mode: Cash / UPI (GPay / PhonePe) · Store Pickup · APMC Road, Bangarapet", col1, sy);

    // Footer note
    ctx.fillStyle = "#64748B";
    ctx.font = "11px Inter, sans-serif";
    ctx.fillText("M N Enterprises · GSTIN: " + this.GSTIN + " · Open 6:30 AM\u20139:00 PM", 40, H - 32);

    return canvas;
  },

  downloadBillImage(orderData) {
    const canvas = this.createBillReceiptCanvas(orderData);
    const rawId = String(orderData.orderId || Date.now());
    const idStr = rawId.replace(/^ord/i, "").slice(-6).toUpperCase();
    const link = document.createElement("a");
    link.download = `MN-Enterprises-Bill-${idStr}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    this.toast("Bill Image downloaded! Ready to attach on WhatsApp.", "success");
  },

  async copyBillImage(orderData) {
    try {
      const canvas = this.createBillReceiptCanvas(orderData);
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        this.toast("Bill Image copied to clipboard! Paste (Ctrl+V) in WhatsApp.", "success");
      });
    } catch(err) {
      this.downloadBillImage(orderData);
    }
  },

  downloadLastBillImage() {
    if (this._lastOrderData) this.downloadBillImage(this._lastOrderData);
  },

  copyLastBillImage() {
    if (this._lastOrderData) this.copyBillImage(this._lastOrderData);
  },

  getCartOrderData() {
    const cart = this.getCart(), prods = PRODUCTS.getAll();
    const items = Object.entries(cart).map(([id, qty]) => ({ p: prods.find(x => x.id === id), qty })).filter(x => x.p);
    const name = (document.getElementById("custName")?.value || "").trim();
    const rawPhone = (document.getElementById("custPhone")?.value || "").trim();
    const phone = rawPhone.replace(/\D/g, "").slice(-10);
    const note = (document.getElementById("custNote")?.value || "").trim();
    const slot = (document.getElementById("custSlot")?.value || "").trim();
    return {
      orderId: "ord" + Date.now(),
      date: new Date(),
      name,
      phone,
      note,
      slot,
      items: items.map(({ p, qty }) => ({ name: p.name, qty, price: p.price })),
      total: this.cartTotal()
    };
  },

  downloadCartBillImage() {
    const orderData = this.getCartOrderData();
    if (!orderData.items.length) {
      this.toast("Your cart is empty", "info");
      return;
    }
    this.downloadBillImage(orderData);
  },

  copyCartBillImage() {
    const orderData = this.getCartOrderData();
    if (!orderData.items.length) {
      this.toast("Your cart is empty", "info");
      return;
    }
    this.copyBillImage(orderData);
  },

  openWhatsAppQuery(type) {
    let msg = "";
    if (type === "photo_id") {
      msg = `Hi M N Enterprises,\n\nI need help identifying a part / checking stock from a photo. Can you assist me?\n\n${this.getWhatsAppFooter()}`;
    } else {
      msg = `Hi M N Enterprises,\n\nI'd like to ask a question about products and availability at your Bangarapet shop.\n\n${this.getWhatsAppFooter()}`;
    }
    window.open("https://wa.me/" + this.WA + "?text=" + encodeURIComponent(msg), "_blank");
  },

  enquireWhatsApp(id) {
    const p = PRODUCTS.findById(id);
    if (!p) return;
    const valEl = document.getElementById("detailQtyVal");
    const qty = parseInt(valEl?.textContent, 10) || 1;
    const rate = this.getGSTRate();
    const W = 36;
    const padR = (str, len) => (str.length > len ? str.slice(0, len-1)+"." : str.padEnd(len, " "));
    const padL = (str, len) => (str.length > len ? str.slice(0, len) : str.padStart(len, " "));
    const mrpFmt   = Number(p.mrp||p.price).toLocaleString("en-IN");
    const subtotal = p.price * qty;
    const gst = this.calcGST(subtotal, rate);
    let t = "";
    t += "=".repeat(W) + "\n";
    t += "   PRODUCT ENQUIRY\n";
    t += "   M N ENTERPRISES\n";
    t += "=".repeat(W) + "\n";
    t += `GSTIN: ${this.GSTIN}\n`;
    t += "-".repeat(W) + "\n";
    t += `${padR("ITEM", 17)}${padL("QTY",4)}${padL("RATE",6)}${padL("TOTAL",9)}\n`;
    t += "-".repeat(W) + "\n";
    t += `${padR("1."+p.name, 17)}${padL(String(qty),4)}${padL(String(p.price),6)}${padL(String(p.price*qty),9)}\n`;
    t += "-".repeat(W) + "\n";
    t += `${padR("BRAND: "+(p.brand||"—"), W)}\n`;
    t += `${padR("MRP:", 20)} ${padL("Rs "+mrpFmt, W-21)}\n`;
    t += `${padR("SUBTOTAL:", 22)}${padL(subtotal.toLocaleString("en-IN"), 14)}\n`;
    if (rate > 0) {
      t += `${padR("CGST ("+(rate/2)+"%):", 22)}${padL(gst.cgst.toLocaleString("en-IN"), 14)}\n`;
      t += `${padR("SGST ("+(rate/2)+"%):", 22)}${padL(gst.sgst.toLocaleString("en-IN"), 14)}\n`;
    } else {
      t += `${padR("GST:", 22)}${padL("Exempted", 14)}\n`;
    }
    t += `${padR("TOTAL (GST INCL):", 22)}${padL(gst.total.toLocaleString("en-IN"), 14)}\n`;
    t += "=".repeat(W) + "\n";
    const msg = `Hi M N Enterprises,\n\nI am enquiring about the following product. Please let me know if it is in stock for pickup at your Bangarapet shop.\n\n\`\`\`\n${t.trimEnd()}\n\`\`\`\n\n_Is this available? What is today's price?_\n\n${this.getWhatsAppFooter()}`;
    window.open("https://wa.me/" + this.WA + "?text=" + encodeURIComponent(msg), "_blank");
  },

  /* ---- Cart & Checkout Drawer (Amazon Mobile Experience) ---- */
  cartStep: "cart", // "cart" or "checkout"
  cartViewMode: (function(){ try { return localStorage.getItem("mn_cart_view_mode") || "cards"; } catch(e){ return "cards"; } })(),

  toggleCartViewMode() {
    this.cartViewMode = (this.cartViewMode === "table" ? "cards" : "table");
    try { localStorage.setItem("mn_cart_view_mode", this.cartViewMode); } catch(e){}
    this.renderCartDrawer();
    this.toast(this.cartViewMode === "table" ? "Switched to Table View" : "Switched to Cards View", "info", 1400);
  },

  proceedToBuy() {
    const cart = this.getCart();
    if (!Object.keys(cart).length) {
      this.toast("Your cart is empty", "error");
      return;
    }
    this.cartStep = "checkout";
    this.renderCartDrawer();
  },

  backToCart() {
    this.cartStep = "cart";
    this.renderCartDrawer();
  },

  renderCartDrawer() {
    const body = document.getElementById("cartBody");
    const foot = document.getElementById("cartFoot");
    const toggleBtn = document.getElementById("cartViewToggleBtn");
    const drawerTitle = document.getElementById("cartDrawerTitle");
    if (!body) return;
    const cart = this.getCart(), prods = PRODUCTS.getAll();
    const items = Object.entries(cart).map(([id, qty]) => ({ p: prods.find(x => x.id === id), qty })).filter(x => x.p);
    
    if (toggleBtn) {
      toggleBtn.style.display = this.cartStep === "cart" && items.length > 0 ? "flex" : "none";
      if (this.cartViewMode === "table") {
        toggleBtn.title = "Switch to Cards View";
        toggleBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:17px;height:17px"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`;
      } else {
        toggleBtn.title = "Switch to Table View";
        toggleBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:17px;height:17px"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg>`;
      }
    }

    if (drawerTitle) {
      drawerTitle.textContent = this.cartStep === "checkout" ? "Review & Confirm Order" : "Your order";
    }

    if (!items.length) {
      this.cartStep = "cart";
      body.innerHTML = `
        <div class="empty-cart" style="text-align:center;padding:40px 16px">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:56px;height:56px;color:var(--muted);margin-bottom:12px"><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/><path d="M2 3h2l2.6 12.4a2 2 0 002 1.6h8.8a2 2 0 002-1.6L21 7H6"/></svg>
          <h3 style="font-size:16px;font-weight:700;color:var(--ink)">Your Amazon Cart is empty</h3>
          <p style="font-size:13px;color:var(--muted);margin:6px 0 16px">Explore our wholesale electrical and plumbing catalogue.</p>
          <a href="shop.html" class="btn btn-primary" onclick="closeAll()" style="justify-content:center">Shop Today's Deals</a>
        </div>`;
      if (foot) foot.innerHTML = "";
      return;
    }

    const totalItems = items.reduce((sum, x) => sum + x.qty, 0);
    const subTot = this.cartTotal();
    const gstRate = this.getGSTRate();
    const gstData = this.calcGST(subTot, gstRate);
    const userObj = (typeof AUTH !== "undefined" && typeof AUTH.currentUser === "function") ? AUTH.currentUser() : ((typeof AUTH !== "undefined" && typeof AUTH.getSession === "function") ? AUTH.getSession() : null);
    const savedName = localStorage.getItem("mn_customer_name") || userObj?.name || "";
    const savedPhone = localStorage.getItem("mn_customer_phone") || userObj?.phone || "";
    const deliveryLoc = localStorage.getItem("mn_delivery_loc") || "Bangarapet Town (563114)";

    /* ==========================================================
       VIEW 1: AMAZON CART REVIEW (CARDS OR TABLE CHOICE)
       ========================================================== */
    if (this.cartStep === "cart") {
      if (this.cartViewMode === "table") {
        // Structured Table View Choice
        body.innerHTML = `
          <div style="background:var(--surface);border:1px solid var(--line);border-radius:12px;overflow:hidden">
            <div style="padding:10px 12px;background:var(--surface-2);border-bottom:1px solid var(--line);font-size:12.5px;font-weight:800;color:var(--ink);display:flex;align-items:center;justify-content:space-between">
              <span>📋 Table Breakdown (${totalItems} items)</span>
              <button class="btn btn-ghost btn-sm" onclick="APP.toggleCartViewMode()" style="font-size:11px;color:var(--amber);padding:2px 4px">Switch to Cards ⊞</button>
            </div>
            <div style="overflow-x:auto">
              <table style="width:100%;border-collapse:collapse;font-size:12px;text-align:left">
                <thead>
                  <tr style="background:var(--surface-2);color:var(--muted);border-bottom:1px solid var(--line);font-size:10.5px;text-transform:uppercase">
                    <th style="padding:8px 8px">Item</th>
                    <th style="padding:8px 4px;text-align:center">Qty</th>
                    <th style="padding:8px 6px;text-align:right">Rate</th>
                    <th style="padding:8px 6px;text-align:right">Discount</th>
                    <th style="padding:8px 8px;text-align:right">Total</th>
                    <th style="padding:8px 4px;text-align:center"></th>
                  </tr>
                </thead>
                <tbody>
                  ${items.map(({ p, qty }, idx) => {
                    const pct = p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0;
                    const lineTot = p.price * qty;
                    return `
                      <tr style="border-bottom:1px solid var(--line)">
                        <td style="padding:8px 8px;color:var(--ink);font-weight:600">
                          <div style="display:flex;align-items:center;gap:6px">
                            <img src="${p.img || 'assets/img/products/gm-led-bulb-9w.jpg'}" style="width:28px;height:28px;object-fit:contain;background:#fff;border-radius:4px;border:1px solid var(--line);flex:none" alt="${p.name}">
                            <div style="min-width:0">
                              <div style="font-size:11.5px;line-height:1.2;font-weight:700">${idx + 1}. ${p.name}</div>
                              <div style="font-size:9.5px;color:var(--muted)">${p.brand || 'Genuine'}</div>
                            </div>
                          </div>
                        </td>
                        <td style="padding:8px 4px;text-align:center">
                          <div class="stepper" style="height:26px;display:inline-flex">
                            <button style="width:20px;font-size:12px" onclick="APP.changeQty('${p.id}',-1)">−</button>
                            <span style="width:20px;font-size:11px">${qty}</span>
                            <button style="width:20px;font-size:12px" onclick="APP.changeQty('${p.id}',1)">+</button>
                          </div>
                        </td>
                        <td style="padding:8px 6px;text-align:right;color:var(--muted);font-size:11px">${this.inr(p.price)}</td>
                        <td style="padding:8px 6px;text-align:right">
                          ${pct > 0 ? `<span style="color:#DC2626;font-weight:700;font-size:10.5px">${pct}% off</span>` : `<span style="color:var(--muted);font-size:10.5px">—</span>`}
                        </td>
                        <td style="padding:8px 8px;text-align:right;font-weight:800;color:var(--amber);font-size:12px">${this.inr(lineTot)}</td>
                        <td style="padding:8px 4px;text-align:center">
                          <button onclick="APP.changeQty('${p.id}', -${qty})" style="border:none;background:none;color:var(--danger);cursor:pointer;font-size:13px" title="Delete item">🗑️</button>
                        </td>
                      </tr>
                    `;
                  }).join("")}
                </tbody>
                <tfoot>
                  <tr style="background:var(--surface-2);font-weight:800">
                    <td colspan="4" style="padding:8px 8px;text-align:right;color:var(--ink)">Subtotal:</td>
                    <td style="padding:8px 8px;text-align:right;color:var(--amber)">${this.inr(subTot)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        `;
      } else {
        // Amazon Cards View Choice
        body.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:12px">
            ${items.map(({ p, qty }) => {
              const pct = p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0;
              return `
                <div style="background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:12px;display:grid;grid-template-columns:72px 1fr;gap:12px;position:relative">
                  <img src="${p.img || 'assets/img/products/gm-led-bulb-9w.jpg'}" alt="${p.name}" style="width:72px;height:72px;object-fit:contain;background:#fff;border-radius:8px;border:1px solid var(--line);padding:4px" onerror="this.onerror=null;this.src='assets/img/products/gm-led-bulb-9w.jpg'">
                  <div style="min-width:0;display:flex;flex-direction:column;justify-content:space-between">
                    <div>
                      <div style="font-size:13.5px;font-weight:700;line-height:1.3;color:var(--ink);margin-bottom:3px">${p.name}</div>
                      <div style="font-size:11px;color:var(--muted)">${p.brand || 'Genuine'} • <span style="color:#15803d;font-weight:600">In Stock</span></div>
                    </div>
                    <div style="margin-top:6px;display:flex;align-items:baseline;gap:6px">
                      <span style="font-size:15px;font-weight:800;color:var(--ink)">${this.inr(p.price)}</span>
                      ${p.mrp > p.price ? `<span style="font-size:12px;color:var(--muted);text-decoration:line-through">${this.inr(p.mrp)}</span><span style="font-size:11px;font-weight:700;color:#DC2626">${pct}% OFF</span>` : ''}
                    </div>
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px">
                      <div class="stepper" style="height:32px">
                        <button onclick="APP.changeQty('${p.id}',-1)">−</button>
                        <span style="width:28px">${qty}</span>
                        <button onclick="APP.changeQty('${p.id}',1)">+</button>
                      </div>
                      <button class="btn btn-ghost btn-sm" style="color:var(--danger);font-size:11px;padding:4px 6px" onclick="APP.changeQty('${p.id}', -${qty})">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        `;
      }

      if (foot) {
        foot.innerHTML = `
          <button class="btn btn-amber btn-full" style="justify-content:center;font-weight:800;font-size:14.5px;padding:12px" onclick="APP.proceedToBuy()">
            Proceed to Buy (${totalItems} item${totalItems === 1 ? '' : 's'})
          </button>
        `;
      }
      return;
    }

    /* ==========================================================
       VIEW 2: AMAZON PROCEED TO BUY / ORDER CONFIRMATION
       ========================================================== */
    body.innerHTML = `
      <!-- Back to Cart Header -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid var(--line)">
        <button class="btn btn-ghost btn-sm" onclick="APP.backToCart()" style="font-size:12.5px;font-weight:700;padding:4px 0">
          ← Back to Cart
        </button>
        <span style="font-size:12px;font-weight:700;color:var(--muted)">Step 2 of 2: Checkout</span>
      </div>

      <!-- Sign-In Identity Check -->
      ${userObj ? `
        <div style="background:rgba(34,197,94,0.1);border:1.5px solid rgba(34,197,94,0.3);border-radius:10px;padding:10px 12px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between">
          <div style="font-size:12.5px;color:#15803d;display:flex;align-items:center;gap:6px">
            <span style="font-size:14px">✓</span>
            <div>
              <div style="font-weight:800">Signed in with Google</div>
              <div style="font-size:11px;opacity:0.85">${this.escapeHtml(userObj.name)} (${this.escapeHtml(userObj.email)})</div>
            </div>
          </div>
          <a href="#" onclick="AUTH.signInWithGooglePrompt().then(()=>{ APP.renderCartDrawer(); });return false;" style="font-size:11px;font-weight:700;color:var(--amber)">Switch</a>
        </div>
      ` : `
        <div style="background:rgba(239,68,68,0.06);border:1.5px solid rgba(239,68,68,0.3);border-radius:12px;padding:14px;margin-bottom:14px;text-align:center">
          <div style="font-size:13.5px;font-weight:800;color:var(--ink);margin-bottom:4px">🔒 Sign-in with Google Required</div>
          <p style="font-size:12px;color:var(--muted);margin-bottom:12px">Sign in with Google is required to confirm your order, view invoices & track delivery.</p>
          <button type="button" class="btn btn-full btn-amber" style="justify-content:center;font-weight:800;font-size:13.5px;padding:11px 14px;gap:8px" onclick="AUTH.signInWithGooglePrompt().then(()=>{ APP.renderCartDrawer(); })">
            <svg viewBox="0 0 24 24" style="width:16px;height:16px;flex:none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff"/></svg>
            Sign in with Google to Continue
          </button>
        </div>
      `}

      <!-- Delivery / Store Fulfillment Details -->
      <div style="background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:12px;margin-bottom:14px">
        <div style="font-size:12.5px;font-weight:700;color:var(--ink);margin-bottom:8px;display:flex;align-items:center;justify-content:space-between">
          <span>📍 Delivery / Pickup Area:</span>
          <button class="btn btn-ghost btn-sm" onclick="APP.openDeliveryModal()" style="font-size:11px;color:var(--amber)">Change ▾</button>
        </div>
        <div style="font-size:13px;font-weight:800;color:var(--ink);background:var(--surface-2);padding:8px 10px;border-radius:8px;border:1px solid var(--line);margin-bottom:10px">
          ${deliveryLoc}
        </div>
        <div class="field" style="margin-bottom:8px">
          <label style="font-size:11.5px">Time Slot Preference</label>
          <select id="custSlot" style="width:100%;padding:8px 10px;border-radius:8px;border:1px solid var(--line);background:var(--surface-2);color:var(--ink);font-weight:600;font-size:12px">
            <option value="Store Pickup: Morning (7:00 AM – 11:00 AM)">🏬 Store Pickup: Morning (7:00 AM – 11:00 AM)</option>
            <option value="Store Pickup: Afternoon (11:00 AM – 4:00 PM)">🏬 Store Pickup: Afternoon (11:00 AM – 4:00 PM)</option>
            <option value="Store Pickup: Evening (4:00 PM – 8:30 PM)" selected>🏬 Store Pickup: Evening (4:00 PM – 8:30 PM)</option>
            <option value="Urgent Pickup: Within 1 Hour">⚡ Urgent Pickup: Within 1 Hour</option>
            <option value="Local Delivery: Bangarapet Town">🚚 Local Delivery: Bangarapet Town</option>
          </select>
        </div>
        <div class="field" style="margin-bottom:8px">
          <label style="font-size:11.5px">Your Name <span style="color:#ef4444">*</span></label>
          <input id="custName" value="${this.escapeHtml(savedName)}" placeholder="e.g. Ramesh" autocomplete="name" style="padding:8px 10px;font-size:13px">
        </div>
        <div class="field" style="margin-bottom:8px">
          <label style="font-size:11.5px">WhatsApp / Phone Number <span style="color:#ef4444">*</span></label>
          <div style="display:flex;gap:6px">
            <span style="padding:8px 10px;background:var(--surface-2);border:1px solid var(--line);border-radius:8px;font-size:12.5px;font-weight:600;color:var(--muted)">+91</span>
            <input type="tel" id="custPhone" value="${this.escapeHtml(savedPhone)}" placeholder="10-digit mobile number" maxlength="10" autocomplete="tel" style="flex:1;padding:8px 10px;font-size:13px">
          </div>
        </div>
        <div class="field"><label style="font-size:11.5px">Delivery note (optional)</label><input id="custNote" placeholder="e.g. call before store pickup" style="padding:8px 10px;font-size:12.5px"></div>
      </div>

      <!-- Structured Items Table in Checkout -->
      <div style="background:var(--surface);border:1px solid var(--line);border-radius:12px;overflow:hidden;margin-bottom:14px">
        <div style="padding:9px 12px;background:var(--surface-2);border-bottom:1px solid var(--line);font-size:12px;font-weight:800;color:var(--ink);display:flex;align-items:center;justify-content:space-between">
          <span>📋 Reviewed Items (${totalItems})</span>
          <span style="font-size:11px;color:var(--muted)">Counter Rates</span>
        </div>
        <div style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse;font-size:11.5px;text-align:left">
            <thead>
              <tr style="background:var(--surface-2);color:var(--muted);border-bottom:1px solid var(--line);font-size:10px;text-transform:uppercase">
                <th style="padding:6px 10px">Item</th>
                <th style="padding:6px 6px;text-align:center">Qty</th>
                <th style="padding:6px 8px;text-align:right">Rate</th>
                <th style="padding:6px 10px;text-align:right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(({ p, qty }, idx) => `
                <tr style="border-bottom:1px solid var(--line)">
                  <td style="padding:6px 10px;color:var(--ink);font-weight:600">
                    <div style="line-height:1.2">${idx + 1}. ${p.name}</div>
                  </td>
                  <td style="padding:6px 6px;text-align:center;font-weight:700;color:var(--ink)">${qty}</td>
                  <td style="padding:6px 8px;text-align:right;color:var(--muted)">${this.inr(p.price)}</td>
                  <td style="padding:6px 10px;text-align:right;font-weight:800;color:var(--amber)">${this.inr(p.price * qty)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Full Cost Breakdown (Amazon Style) -->
      <div style="background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:12px;margin-bottom:14px">
        <div style="font-size:13px;font-weight:800;color:var(--ink);margin-bottom:8px">Order Summary</div>
        <div style="display:flex;justify-content:space-between;font-size:12.5px;color:var(--muted);margin-bottom:4px">
          <span>Items Subtotal (${totalItems} items)</span><span>${this.inr(subTot)}</span>
        </div>
        ${gstRate > 0 ? `
          <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-bottom:4px">
            <span>CGST (${gstRate/2}%)</span><span>${this.inr(gstData.cgst)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-bottom:4px">
            <span>SGST (${gstRate/2}%)</span><span>${this.inr(gstData.sgst)}</span>
          </div>
        ` : `<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-bottom:4px"><span>GST</span><span>Exempted</span></div>`}
        <div style="display:flex;justify-content:space-between;font-size:12px;color:#15803d;font-weight:600;margin-bottom:4px">
          <span>Store Fulfillment / Delivery</span><span>FREE</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-weight:800;font-size:16px;padding-top:8px;border-top:1px solid var(--line);margin-top:6px">
          <span style="color:var(--ink)">Order Total:</span><span style="color:var(--amber)">${this.inr(gstData.total)}</span>
        </div>
      </div>
    `;

    if (foot) {
      if (userObj) {
        foot.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:8px">
            <button class="btn btn-amber btn-full" style="justify-content:center;font-weight:800;font-size:14px;padding:13px" onclick="APP.placeAppOrder()">
              ⚡ Confirm &amp; Place Order via App
            </button>
            <button class="btn btn-full" style="justify-content:center;background:#25D366;color:#fff;border:none;font-weight:700;font-size:13.5px;padding:12px" onclick="APP.sendOrder()">
              <svg viewBox="0 0 24 24" fill="currentColor" style="width:18px;height:18px;flex:none"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.71.45 3.38 1.3 4.86L2.05 22l5.36-1.4a9.87 9.87 0 004.63 1.18h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm5.8 14.13c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.8-.11-.42-.13-.95-.31-1.64-.6-2.88-1.24-4.76-4.15-4.9-4.34-.14-.19-1.17-1.56-1.17-2.97 0-1.41.74-2.1 1-2.39.26-.28.57-.35.76-.35h.55c.18 0 .42-.07.65.5.24.58.81 2 .88 2.15.07.14.12.31.02.5-.1.19-.15.31-.3.48-.14.17-.3.37-.43.5-.14.14-.29.29-.13.57.17.28.75 1.24 1.6 2 1.11.99 2.04 1.29 2.32 1.44.29.14.45.12.62-.07.17-.19.72-.84.91-1.13.19-.28.38-.24.64-.14.26.1 1.66.78 1.94.93.29.14.48.21.55.33.07.12.07.68-.16 1.36z"/></svg>
              Order via WhatsApp (Send Bill)
            </button>
          </div>
        `;
      } else {
        foot.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:8px">
            <button class="btn btn-full btn-amber" style="justify-content:center;font-weight:800;font-size:14px;padding:13px;gap:8px" onclick="AUTH.signInWithGooglePrompt().then(()=>{ APP.renderCartDrawer(); })">
              <svg viewBox="0 0 24 24" style="width:17px;height:17px;flex:none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff"/></svg>
              Sign in with Google to Place Order
            </button>
            <div style="font-size:11.5px;color:var(--muted);text-align:center">
              Order confirmation unlocks automatically after Google Sign-In
            </div>
          </div>
        `;
      }
    }
  },

  /* Place Order directly from App — notifies Admin instantly */
  placeAppOrder() {
    if (typeof AUTH !== "undefined" && !AUTH.isCustomerLoggedIn()) {
      this.toast("Please sign in with Google before placing your order", "error");
      AUTH.signInWithGooglePrompt().then(res => {
        if (res && res.ok) APP.renderCartDrawer();
      });
      return;
    }

    const cart=this.getCart(), prods=PRODUCTS.getAll();
    const items=Object.entries(cart).map(([id,qty])=>({p:prods.find(x=>x.id===id),qty})).filter(x=>x.p);
    if(!items.length) {
      this.toast("Your cart is empty", "error");
      return;
    }
    const name=(document.getElementById("custName")?.value||"").trim();
    const rawPhone=(document.getElementById("custPhone")?.value||"").trim();
    const phoneDigits = rawPhone.replace(/\D/g, "");

    if (!name) {
      this.toast("Please enter your name", "error");
      document.getElementById("custName")?.focus();
      return;
    }

    if (!phoneDigits || phoneDigits.length < 10) {
      this.toast("Please enter a valid 10-digit WhatsApp / Mobile number", "error");
      document.getElementById("custPhone")?.focus();
      return;
    }

    const phone = phoneDigits.slice(-10);

    // Save for future auto-fill
    try {
      localStorage.setItem("mn_customer_name", name);
      localStorage.setItem("mn_customer_phone", phone);
    } catch(e){}

    const note=(document.getElementById("custNote")?.value||"").trim();
    const slot=(document.getElementById("custSlot")?.value||"Store Pickup: Evening").trim();
    const orderId = "ord" + Date.now();
    const total = this.cartTotal();
    const orderItems = items.map(({p,qty})=>({ id: p.id, name: p.name, qty, price: p.price, img: p.img, brand: p.brand }));

    const orderData = {
      orderId,
      id: orderId,
      date: new Date().toISOString(),
      name,
      phone,
      note,
      slot,
      status: "placed", // placed | confirmed | ready | collected
      items: orderItems,
      total,
      orderSource: "app"
    };
    this._lastOrderData = orderData;

    // Track locally in customer's order list
    try {
      const myOrders = JSON.parse(localStorage.getItem("mn_my_order_ids") || "[]");
      if (!myOrders.includes(orderId)) myOrders.unshift(orderId);
      localStorage.setItem("mn_my_order_ids", JSON.stringify(myOrders.slice(0, 50)));
    } catch(e){}

    // Save to global orders & broadcast real-time popup to admin system
    const alertPayload = {
      id: orderId,
      name: name || "Customer",
      phone: phone || "",
      total: total,
      slot: slot || "Store Pickup",
      itemsCount: orderItems.length,
      itemsSummary: orderItems.map(x => `${x.qty}× ${x.name || 'item'}`).slice(0, 3).join(", "),
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      timestamp: Date.now(),
      source: "app"
    };
    // Save to DB (Firebase if configured, else localStorage)
    try {
      if (typeof MN_DB !== "undefined") {
        MN_DB.orders.save(orderData).catch(e => console.error("DB save error:", e));
      } else {
        const orders = JSON.parse(localStorage.getItem("mn_orders") || "[]");
        orders.unshift(orderData);
        localStorage.setItem("mn_orders", JSON.stringify(orders.slice(0,50)));
      }
      // Real-time broadcast (works cross-device via Firestore listener; localStorage for local dev)
      localStorage.setItem("mn_admin_new_order_alert", JSON.stringify(alertPayload));
      try { window.dispatchEvent(new CustomEvent("mn_order_alert", { detail: alertPayload })); } catch(e){}
    } catch(e){}

    // Render receipt image preview in modal
    try {
      const canvas = this.createBillReceiptCanvas(orderData);
      const prev = document.getElementById("successReceiptPreview");
      if (prev) {
        prev.innerHTML = `<img src="${canvas.toDataURL("image/png")}" alt="Bill Receipt Preview" style="width:100%;max-height:200px;object-fit:contain;border-radius:10px;border:1px solid var(--line);box-shadow:var(--shadow-sm);background:#0B0F19">`;
      }
    } catch(e){}

    const titleEl = document.getElementById("successModalTitle");
    if (titleEl) titleEl.textContent = "⚡ Order Placed via App!";
    const descEl = document.getElementById("successModalDesc");
    if (descEl) descEl.textContent = `Order #${orderId.slice(-6).toUpperCase()} received! Staff at M N Enterprises APMC Road has been notified. You can track this order in your account or also send a copy on WhatsApp.`;

    const sl=document.getElementById("successList");
    const gstD = this.calcGST(total, gstRate !== undefined ? gstRate : this.getGSTRate());
    if(sl) sl.innerHTML=items.map(({p,qty})=>`<div class="cart-item" style="gap:10px"><img src="${p.img||'assets/img/products/gm-led-bulb-9w.jpg'}" alt="${p.name}" style="width:44px;height:44px;object-fit:cover;border-radius:7px;border:1px solid var(--line);background:var(--surface-2);flex:none" onerror="this.onerror=null;this.src='assets/img/products/gm-led-bulb-9w.jpg'"><div style="flex:1;min-width:0"><div class="ci-name">${p.name}</div><div class="ci-sub">Qty ${qty} · <strong>${this.inr(p.price*qty)}</strong></div></div></div>`).join("")+`
    <div style="margin-top:8px;display:flex;flex-direction:column;gap:3px;padding:10px;background:var(--surface-2);border-radius:8px;border:1px solid var(--line)">
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted)"><span>Subtotal</span><span>${this.inr(total)}</span></div>
      ${gstD.rate > 0 ? `<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted)"><span>CGST (${gstD.rate/2}%)</span><span>${this.inr(gstD.cgst)}</span></div><div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted)"><span>SGST (${gstD.rate/2}%)</span><span>${this.inr(gstD.sgst)}</span></div>` : `<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted)"><span>GST</span><span>Exempted</span></div>`}
      <div style="display:flex;justify-content:space-between;font-weight:800;font-size:14px;padding-top:6px;border-top:1px solid var(--line);margin-top:4px;color:var(--amber)"><span>Total (incl. GST)</span><span>${this.inr(gstD.total)}</span></div>
    </div>`;
    
    closeAll();
    document.getElementById("overlay")?.classList.add("show");
    document.getElementById("successModal")?.classList.add("show");
    this.saveCart({});
    this._updateCartUI();
    if(typeof renderProducts==="function") renderProducts();
    this.renderCartDrawer();
    this.toast("Order placed! Admin notified instantly.", "success");
  },

  shareLastOrderWhatsApp() {
    if (!this._lastOrderData) {
      this.toast("No recent order found to share", "error");
      return;
    }
    const msg = this.formatWhatsAppBill(this._lastOrderData);
    window.open("https://wa.me/" + this.WA + "?text=" + encodeURIComponent(msg), "_blank");
  },

  sendOrder() {
    const cart=this.getCart(), prods=PRODUCTS.getAll();
    const items=Object.entries(cart).map(([id,qty])=>({p:prods.find(x=>x.id===id),qty})).filter(x=>x.p);
    if(!items.length) return;
    const name=(document.getElementById("custName")?.value||"").trim();
    const rawPhone=(document.getElementById("custPhone")?.value||"").trim();
    const phoneDigits = rawPhone.replace(/\D/g, "");

    if (!name) {
      this.toast("Please enter your name", "error");
      document.getElementById("custName")?.focus();
      return;
    }

    if (!phoneDigits || phoneDigits.length < 10) {
      this.toast("Please enter a valid 10-digit WhatsApp / Mobile number", "error");
      document.getElementById("custPhone")?.focus();
      return;
    }

    const phone = phoneDigits.slice(-10);

    // Save for future auto-fill
    try {
      localStorage.setItem("mn_customer_name", name);
      localStorage.setItem("mn_customer_phone", phone);
    } catch(e){}

    const note=(document.getElementById("custNote")?.value||"").trim();
    const slot=(document.getElementById("custSlot")?.value||"Store Pickup: Evening").trim();
    const orderId = "ord" + Date.now();
    const total = this.cartTotal();
    const orderItems = items.map(({p,qty})=>({ id: p.id, name: p.name, qty, price: p.price, img: p.img, brand: p.brand }));

    const orderData = {
      orderId,
      id: orderId,
      date: new Date().toISOString(),
      name,
      phone,
      note,
      slot,
      status: "placed", // placed | confirmed | ready | collected
      items: orderItems,
      total,
      orderSource: "whatsapp"
    };
    this._lastOrderData = orderData;

    // Track locally in customer's order list
    try {
      const myOrders = JSON.parse(localStorage.getItem("mn_my_order_ids") || "[]");
      if (!myOrders.includes(orderId)) myOrders.unshift(orderId);
      localStorage.setItem("mn_my_order_ids", JSON.stringify(myOrders.slice(0, 50)));
    } catch(e){}

    // Send formatted monospaced table bill on WhatsApp
    const msg = this.formatWhatsAppBill(orderData);
    window.open("https://wa.me/" + this.WA + "?text=" + encodeURIComponent(msg), "_blank");

    // Save to order history & notify admin system
    const alertPayload2 = {
      id: orderId, name: name || "Customer", phone: phone || "",
      total: total, slot: slot || "Store Pickup",
      itemsCount: orderItems.length,
      itemsSummary: orderItems.map(x => `${x.qty}× ${x.name || 'item'}`).slice(0, 3).join(", "),
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      timestamp: Date.now(), source: "whatsapp"
    };
    try {
      if (typeof MN_DB !== "undefined") {
        MN_DB.orders.save(orderData).catch(e => console.error("DB save error:", e));
      } else {
        const orders = JSON.parse(localStorage.getItem("mn_orders") || "[]");
        orders.unshift(orderData);
        localStorage.setItem("mn_orders", JSON.stringify(orders.slice(0,50)));
      }
      localStorage.setItem("mn_admin_new_order_alert", JSON.stringify(alertPayload2));
      try { window.dispatchEvent(new CustomEvent("mn_order_alert", { detail: alertPayload2 })); } catch(e){}
    } catch(e){}

    // Render receipt image preview in modal
    try {
      const canvas = this.createBillReceiptCanvas(orderData);
      const prev = document.getElementById("successReceiptPreview");
      if (prev) {
        prev.innerHTML = `<img src="${canvas.toDataURL("image/png")}" alt="Bill Receipt Preview" style="width:100%;max-height:200px;object-fit:contain;border-radius:10px;border:1px solid var(--line);box-shadow:var(--shadow-sm);background:#0B0F19">`;
      }
    } catch(e){}

    const titleEl = document.getElementById("successModalTitle");
    if (titleEl) titleEl.textContent = "Order & Bill Created!";
    const descEl = document.getElementById("successModalDesc");
    if (descEl) descEl.textContent = "WhatsApp has opened with your formatted table bill. You can also download or copy the official receipt image below.";

    const sl=document.getElementById("successList");
    const gstD2 = this.calcGST(total, this.getGSTRate());
    if(sl) sl.innerHTML=items.map(({p,qty})=>`<div class="cart-item" style="gap:10px"><img src="${p.img||'assets/img/products/gm-led-bulb-9w.jpg'}" alt="${p.name}" style="width:44px;height:44px;object-fit:cover;border-radius:7px;border:1px solid var(--line);background:var(--surface-2);flex:none" onerror="this.onerror=null;this.src='assets/img/products/gm-led-bulb-9w.jpg'"><div style="flex:1;min-width:0"><div class="ci-name">${p.name}</div><div class="ci-sub">Qty ${qty} · <strong>${this.inr(p.price*qty)}</strong></div></div></div>`).join("")+`
    <div style="margin-top:8px;display:flex;flex-direction:column;gap:3px;padding:10px;background:var(--surface-2);border-radius:8px;border:1px solid var(--line)">
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted)"><span>Subtotal</span><span>${this.inr(total)}</span></div>
      ${gstD2.rate > 0 ? `<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted)"><span>CGST (${gstD2.rate/2}%)</span><span>${this.inr(gstD2.cgst)}</span></div><div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted)"><span>SGST (${gstD2.rate/2}%)</span><span>${this.inr(gstD2.sgst)}</span></div>` : `<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted)"><span>GST</span><span>Exempted</span></div>`}
      <div style="display:flex;justify-content:space-between;font-weight:800;font-size:14px;padding-top:6px;border-top:1px solid var(--line);margin-top:4px;color:var(--amber)"><span>Total (incl. GST)</span><span>${this.inr(gstD2.total)}</span></div>
    </div>`;
    closeAll();
    document.getElementById("overlay")?.classList.add("show");
    document.getElementById("successModal")?.classList.add("show");
    this.saveCart({});
    this._updateCartUI();
    if(typeof renderProducts==="function") renderProducts();
    this.renderCartDrawer();
  },

  /* ---- Wishlist Modal Handlers ---- */
  openWishlistModal() {
    closeAll();
    const ids = this.getWishlist();
    const all = PRODUCTS.getAll();
    const items = ids.map(id => all.find(x => x.id === id)).filter(Boolean);
    const container = document.getElementById("wishlistModalContent");
    if (!container) return;

    if (!items.length) {
      container.innerHTML = `
        <div style="text-align:center;padding:36px 12px">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:48px;height:48px;color:var(--muted);margin-bottom:12px"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
          <h3 style="font-size:16px;color:var(--ink);margin:0">No Saved Items Yet</h3>
          <p style="font-size:13px;color:var(--muted);margin-top:6px;max-width:340px;margin-left:auto;margin-right:auto">Click the heart icon on any product in our catalogue to save items you are planning for construction or renovation.</p>
          <a href="index.html#categories" class="btn btn-primary btn-sm mt-12" style="display:inline-flex">View Specialties</a>
        </div>
      `;
    } else {
      const totalEst = items.reduce((s, p) => s + p.price, 0);
      container.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid var(--line)">
          <span style="font-weight:700;font-size:13.5px;color:var(--ink)">${items.length} saved ${items.length === 1 ? 'item' : 'items'}</span>
          <span style="font-weight:800;color:var(--amber);font-size:14px">Est: ${this.inr(totalEst)}</span>
        </div>
        <div style="max-height:320px;overflow-y:auto;display:flex;flex-direction:column;gap:8px">
          ${items.map(p => `
            <div style="display:flex;align-items:center;gap:12px;padding:8px 10px;background:var(--surface-2);border-radius:8px;border:1px solid var(--line)">
              <img src="${p.img}" style="width:44px;height:44px;object-fit:cover;border-radius:6px;background:var(--surface)" alt="${p.name}">
              <div style="flex:1;min-width:0">
                <div style="font-weight:600;font-size:13px;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.name}</div>
                <div style="font-size:12px;color:var(--amber);font-weight:700">${this.inr(p.price)}</div>
              </div>
              <button class="btn btn-sm btn-primary" onclick="APP.changeQty('${p.id}', 1);APP.toast('Added to cart','success');" style="padding:4px 8px;font-size:11px">+ Add</button>
              <button onclick="APP.toggleWishlist('${p.id}');APP.openWishlistModal();" style="border:none;background:transparent;color:var(--danger);cursor:pointer;padding:4px" title="Remove">✕</button>
            </div>
          `).join("")}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px">
          <button class="btn btn-secondary btn-sm" style="justify-content:center" onclick="APP.addAllWishlistToCart()">
            🛒 Add All to Order
          </button>
          <button class="btn btn-primary btn-sm" style="justify-content:center" onclick="APP.sendWishlistToWhatsApp()">
            📲 Enquire on WhatsApp
          </button>
        </div>
      `;
    }
    document.getElementById("overlay")?.classList.add("show");
    document.getElementById("wishlistModal")?.classList.add("show");
  },

  addAllWishlistToCart() {
    const ids = this.getWishlist();
    if (!ids.length) return;
    const cart = this.getCart();
    ids.forEach(id => {
      cart[id] = (cart[id] || 0) + 1;
    });
    this.saveCart(cart);
    this._updateCartUI();
    this.toast(`Added ${ids.length} items to your order`, "success");
    closeAll();
    openCart();
  },

  sendWishlistToWhatsApp() {
    const ids = this.getWishlist();
    const all = PRODUCTS.getAll();
    const items = ids.map(id => all.find(x => x.id === id)).filter(Boolean);
    if (!items.length) return;
    const subtotal = items.reduce((s, p) => s + p.price, 0);
    const rate = this.getGSTRate();
    const gst = this.calcGST(subtotal, rate);
    const W = 36;
    const padR = (str, len) => (str.length > len ? str.slice(0, len-1)+"." : str.padEnd(len, " "));
    const padL = (str, len) => (str.length > len ? str.slice(0, len) : str.padStart(len, " "));
    let t = "";
    t += "=".repeat(W) + "\n";
    t += "  REQUIREMENT / WISHLIST\n";
    t += "  M N ENTERPRISES\n";
    t += "=".repeat(W) + "\n";
    t += `GSTIN: ${this.GSTIN}\n`;
    t += `${padR("ITEM", 19)}${padL("RATE", 8)}${padL("EST", 9)}\n`;
    t += "-".repeat(W) + "\n";
    items.forEach((p, idx) => {
      t += `${padR((idx+1)+"."+p.name, 19)}${padL(String(p.price),8)}${padL(String(p.price),9)}\n`;
    });
    t += "-".repeat(W) + "\n";
    t += `${padR("SUBTOTAL (Rs):", 22)}${padL(subtotal.toLocaleString("en-IN"), 14)}\n`;
    if (rate > 0) {
      t += `${padR("CGST ("+(rate/2)+"%):", 22)}${padL(gst.cgst.toLocaleString("en-IN"), 14)}\n`;
      t += `${padR("SGST ("+(rate/2)+"%):", 22)}${padL(gst.sgst.toLocaleString("en-IN"), 14)}\n`;
    } else {
      t += `${padR("GST:", 22)}${padL("Exempted", 14)}\n`;
    }
    t += `${padR("TOTAL ESTIMATE (Rs):", 22)}${padL(gst.total.toLocaleString("en-IN"), 14)}\n`;
    t += "=".repeat(W) + "\n";
    const msg = [
      "Hi M N Enterprises,\n\nI have the following requirement / saved items. Please confirm availability and prices at your Bangarapet shop.",
      "\n```",
      t.trimEnd(),
      "```\n",
      `_Total ${items.length} items — Subtotal: ${this.inr(subtotal)} | GST (${rate}%): ${this.inr(gst.gstAmt)} | Total: ${this.inr(gst.total)}_`,
      this.getWhatsAppFooter()
    ].join("\n");
    window.open("https://wa.me/" + this.WA + "?text=" + encodeURIComponent(msg), "_blank");
  },

  /* ---- Requirement Builder Wizard ---- */
  openRequirementModal() {
    closeAll();
    this.renderRequirementModal("electrical");
    document.getElementById("overlay")?.classList.add("show");
    document.getElementById("requirementModal")?.classList.add("show");
  },

  renderRequirementModal(tab = "electrical") {
    const container = document.getElementById("reqModalContent");
    if (!container) return;

    if (tab === "electrical") {
      container.innerHTML = `
        <div class="req-tab-bar">
          <button class="req-tab-btn active" onclick="APP.renderRequirementModal('electrical')">⚡ House Wiring</button>
          <button class="req-tab-btn" onclick="APP.renderRequirementModal('plumbing')">🚿 Bathroom Plumbing</button>
          <button class="req-tab-btn" onclick="APP.renderRequirementModal('cctv')">📹 CCTV Security</button>
        </div>
        <p style="font-size:12.5px;color:var(--muted);margin-bottom:14px">Select your house room layout. Our estimation engine auto-calculates required wire coils, switches, power sockets, and MCB protection.</p>
        <div class="req-config-grid">
          <div class="req-cfg-item">
            <label>Bedrooms</label>
            <select id="reqBedrooms" onchange="APP.updateElectricalRequirement()">
              <option value="1">1 BHK</option>
              <option value="2" selected>2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4 BHK</option>
            </select>
          </div>
          <div class="req-cfg-item">
            <label>Bathrooms</label>
            <select id="reqBathrooms" onchange="APP.updateElectricalRequirement()">
              <option value="1">1 Bath</option>
              <option value="2" selected>2 Baths</option>
              <option value="3">3 Baths</option>
            </select>
          </div>
          <div class="req-cfg-item">
            <label>Hall / Living</label>
            <select id="reqHall" onchange="APP.updateElectricalRequirement()">
              <option value="1" selected>1 Hall</option>
              <option value="2">2 Halls</option>
            </select>
          </div>
          <div class="req-cfg-item">
            <label>Heavy Appliances</label>
            <select id="reqAC" onchange="APP.updateElectricalRequirement()">
              <option value="1">1 Geyser / AC</option>
              <option value="2" selected>2 Geysers / ACs</option>
              <option value="3">3+ High Power</option>
            </select>
          </div>
        </div>
        <div id="reqResultTable"></div>
      `;
      this.updateElectricalRequirement();
    } else if (tab === "plumbing") {
      container.innerHTML = `
        <div class="req-tab-bar">
          <button class="req-tab-btn" onclick="APP.renderRequirementModal('electrical')">⚡ House Wiring</button>
          <button class="req-tab-btn active" onclick="APP.renderRequirementModal('plumbing')">🚿 Bathroom Plumbing</button>
          <button class="req-tab-btn" onclick="APP.renderRequirementModal('cctv')">📹 CCTV Security</button>
        </div>
        <p style="font-size:12.5px;color:var(--muted);margin-bottom:14px">Configure your bathroom and kitchen plumbing. Auto-calculates CPVC SDR-11 hot/cold pipes, brass elbows for taps, tees, and solvent cement.</p>
        <div class="req-config-grid">
          <div class="req-cfg-item">
            <label>Bathrooms</label>
            <select id="reqPlumbBaths" onchange="APP.updatePlumbingRequirement()">
              <option value="1">1 Bathroom</option>
              <option value="2" selected>2 Bathrooms</option>
              <option value="3">3 Bathrooms</option>
            </select>
          </div>
          <div class="req-cfg-item">
            <label>Kitchen Sinks</label>
            <select id="reqPlumbKitchen" onchange="APP.updatePlumbingRequirement()">
              <option value="1" selected>1 Kitchen</option>
              <option value="2">2 Kitchens</option>
            </select>
          </div>
          <div class="req-cfg-item">
            <label>Water System</label>
            <select id="reqPlumbGeyser" onchange="APP.updatePlumbingRequirement()">
              <option value="solar_geyser" selected>Geyser + Overhead Tank</option>
              <option value="cold_only">Cold Water Only</option>
            </select>
          </div>
        </div>
        <div id="reqResultTable"></div>
      `;
      this.updatePlumbingRequirement();
    } else if (tab === "cctv") {
      container.innerHTML = `
        <div class="req-tab-bar">
          <button class="req-tab-btn" onclick="APP.renderRequirementModal('electrical')">⚡ House Wiring</button>
          <button class="req-tab-btn" onclick="APP.renderRequirementModal('plumbing')">🚿 Bathroom Plumbing</button>
          <button class="req-tab-btn active" onclick="APP.renderRequirementModal('cctv')">📹 CCTV Security</button>
        </div>
        <p style="font-size:12.5px;color:var(--muted);margin-bottom:14px">Complete CCTV security kit for home or shop with CP Plus cameras, 4/8-channel DVR, power supply, and Cat6 network cable.</p>
        <div class="req-config-grid">
          <div class="req-cfg-item">
            <label>Cameras Needed</label>
            <select id="reqCctvCams" onchange="APP.updateCctvRequirement()">
              <option value="2">2 Cameras (Small Shop / Gate)</option>
              <option value="4" selected>4 Cameras (Standard House / Store)</option>
              <option value="8">8 Cameras (Large Building / Godown)</option>
            </select>
          </div>
          <div class="req-cfg-item">
            <label>Night Vision</label>
            <select id="reqCctvType" onchange="APP.updateCctvRequirement()">
              <option value="ir" selected>IR Night Vision (20m)</option>
              <option value="color">Full-Color Night Vision</option>
            </select>
          </div>
        </div>
        <div id="reqResultTable"></div>
      `;
      this.updateCctvRequirement();
    }
  },

  updateElectricalRequirement() {
    const beds = parseInt(document.getElementById("reqBedrooms")?.value || "2", 10);
    const baths = parseInt(document.getElementById("reqBathrooms")?.value || "2", 10);
    const halls = parseInt(document.getElementById("reqHall")?.value || "1", 10);
    const acs = parseInt(document.getElementById("reqAC")?.value || "2", 10);

    // Engineering estimation rule
    const wire15Qty = Math.max(2, Math.round(beds * 1.2 + halls * 1.0));
    const wire25Qty = Math.max(1, Math.round(beds * 0.8 + acs * 0.7));
    const switchQty = beds * 6 + halls * 8 + baths * 2 + 6;
    const socketQty = beds * 2 + halls * 3 + acs + 2;
    const bulbQty = beds * 3 + halls * 4 + baths * 1 + 2;
    const mcbQty = Math.max(3, beds + acs + 2);

    const items = [
      { id: "p37", name: "KEI 1.5 sq mm Wire Coil (90m)", qty: wire15Qty, price: 1450 },
      { id: "p38", name: "KEI 2.5 sq mm Wire Coil (90m)", qty: wire25Qty, price: 2250 },
      { id: "p40", name: "GM Modular 6A 1-Way Switch", qty: switchQty, price: 28 },
      { id: "p41", name: "GM 16A Power Socket + Switch", qty: socketQty, price: 110 },
      { id: "p22", name: "GM 9W LED Bulb B22", qty: bulbQty, price: 50 },
      { id: "p42", name: "Havells Single Pole MCB", qty: mcbQty, price: 145 }
    ];

    this._renderRequirementOutput("House Electrical Wiring Requirement", items);
  },

  updatePlumbingRequirement() {
    const baths = parseInt(document.getElementById("reqPlumbBaths")?.value || "2", 10);
    const kitchens = parseInt(document.getElementById("reqPlumbKitchen")?.value || "1", 10);

    const pipeQty = baths * 5 + kitchens * 3;
    const elbowQty = baths * 8 + kitchens * 4;
    const brassElbowQty = baths * 4 + kitchens * 2; // For wall bib taps and showers
    const teeQty = baths * 4 + kitchens * 2;
    const mtaQty = baths * 3 + kitchens * 2;
    const solventQty = Math.max(1, Math.round((pipeQty + elbowQty) / 25));

    const items = [
      { id: "p35", name: "CPVC Pipe 3/4\" SDR-11 (3m)", qty: pipeQty, price: 185 },
      { id: "p32", name: "CPVC 90° Elbow 3/4\"", qty: elbowQty, price: 18 },
      { id: "p33", name: "CPVC Brass Elbow 3/4\" × 1/2\" (for taps)", qty: brassElbowQty, price: 65 },
      { id: "p30", name: "CPVC / PVC Equal Tee", qty: teeQty, price: 26 },
      { id: "p34", name: "CPVC Brass MTA 3/4\" × 1/2\"", qty: mtaQty, price: 58 },
      { id: "p36", name: "CPVC Heavy Duty Solvent Cement 100ml", qty: solventQty, price: 95 }
    ];

    this._renderRequirementOutput("Bathroom & Kitchen Plumbing Package", items);
  },

  updateCctvRequirement() {
    const cams = parseInt(document.getElementById("reqCctvCams")?.value || "4", 10);
    const dvrQty = 1;
    const psuQty = 1;
    const cableQty = Math.max(1, Math.round(cams / 2));

    const items = [
      { id: "p43", name: "CP Plus 2.4MP HD Dome Camera", qty: cams, price: 1250 },
      { id: "p44", name: `CP Plus ${cams <= 4 ? '4-Channel' : '8-Channel'} HD DVR`, qty: dvrQty, price: 2650 },
      { id: "p45", name: "12V 4-Channel Regulated CCTV Power Supply", qty: psuQty, price: 680 },
      { id: "p19", name: "D-Link Cat6 / CCTV Coaxial Cable (Bundle)", qty: cableQty, price: 1100 }
    ];

    this._renderRequirementOutput("Complete Home/Shop CCTV Security Setup", items);
  },

  _renderRequirementOutput(title, items) {
    const tableDiv = document.getElementById("reqResultTable");
    if (!tableDiv) return;

    const total = items.reduce((s, it) => s + it.price * it.qty, 0);
    window._lastReqPackage = { title, items, total };

    tableDiv.innerHTML = `
      <div class="order-table-wrap" style="margin-top:10px;margin-bottom:12px">
        <table class="order-table">
          <thead>
            <tr>
              <th style="width:36px;text-align:center">#</th>
              <th>Suggested Item</th>
              <th style="text-align:right;width:95px">Rate</th>
              <th style="text-align:center;width:60px">Qty</th>
              <th style="text-align:right;width:105px">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((it, idx) => `
              <tr>
                <td style="text-align:center;color:var(--muted)">${idx + 1}</td>
                <td style="font-weight:600">${it.name}</td>
                <td style="text-align:right">${this.inr(it.price)}</td>
                <td style="text-align:center;font-weight:700">×${it.qty}</td>
                <td style="text-align:right;font-weight:700;color:var(--amber)">${this.inr(it.price * it.qty)}</td>
              </tr>
            `).join("")}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" style="text-align:right;font-weight:700">Estimated Package Total:</td>
              <td style="text-align:right;font-weight:800;color:var(--amber);font-size:14px">${this.inr(total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <button class="btn btn-secondary" style="justify-content:center" onclick="APP.addRequirementToCart()">
          🛒 Add Package to Order
        </button>
        <button class="btn btn-primary" style="justify-content:center" onclick="APP.sendRequirementWhatsApp()">
          📲 Send Requirement on WhatsApp
        </button>
      </div>
    `;
  },

  addRequirementToCart() {
    const pkg = window._lastReqPackage;
    if (!pkg || !pkg.items) return;
    const cart = this.getCart();
    pkg.items.forEach(it => {
      cart[it.id] = (cart[it.id] || 0) + it.qty;
    });
    this.saveCart(cart);
    this._updateCartUI();
    this.toast(`Added ${pkg.items.length} items to your order`, "success");
    closeAll();
    openCart();
  },

  sendRequirementWhatsApp() {
    const pkg = window._lastReqPackage;
    if (!pkg || !pkg.items) return;
    const rate = this.getGSTRate();
    const subtotal = pkg.total || 0;
    const gst = this.calcGST(subtotal, rate);
    const W = 36;
    const padR = (str, len) => (str.length > len ? str.slice(0, len-1)+"." : str.padEnd(len, " "));
    const padL = (str, len) => (str.length > len ? str.slice(0, len) : str.padStart(len, " "));

    let t = "";
    t += "=".repeat(W) + "\n";
    t += "  " + padR(pkg.title.toUpperCase(), W - 2) + "\n";
    t += "     M N ENTERPRISES\n";
    t += "=".repeat(W) + "\n";
    t += `GSTIN: ${this.GSTIN}\n`;
    t += `${padR("ITEM", 17)}${padL("QTY",4)}${padL("RATE",6)}${padL("TOTAL",9)}\n`;
    t += "-".repeat(W) + "\n";

    let totalQty = 0;
    pkg.items.forEach((it, idx) => {
      const qty = Number(it.qty) || 1;
      totalQty += qty;
      const price = Number(it.price) || 0;
      const lineTotal = price * qty;
      t += `${padR((idx+1)+"."+it.name, 17)}${padL(String(qty),4)}${padL(String(price),6)}${padL(String(lineTotal),9)}\n`;
    });

    t += "-".repeat(W) + "\n";
    t += `${padR("ITEMS: " + pkg.items.length, 18)}${padL("QTY: " + totalQty, 18)}\n`;
    t += `${padR("SUBTOTAL (Rs):", 22)}${padL(subtotal.toLocaleString("en-IN"), 14)}\n`;
    if (rate > 0) {
      t += `${padR("CGST ("+(rate/2)+"%):", 22)}${padL(gst.cgst.toLocaleString("en-IN"), 14)}\n`;
      t += `${padR("SGST ("+(rate/2)+"%):", 22)}${padL(gst.sgst.toLocaleString("en-IN"), 14)}\n`;
    } else {
      t += `${padR("GST:", 22)}${padL("Exempted", 14)}\n`;
    }
    t += `${padR("TOTAL ESTIMATE (Rs):", 22)}${padL(gst.total.toLocaleString("en-IN"), 14)}\n`;
    t += "=".repeat(W) + "\n";

    const msg = [
      `*M N ENTERPRISES — REQUIREMENT ESTIMATE (TAX INVOICE)*`,
      `GSTIN: ${this.GSTIN} | Requirement: *${pkg.title}*`,
      `Date: ${new Date().toLocaleDateString("en-IN")}\n`,
      "```",
      t.trimEnd(),
      "```\n",
      `*Subtotal:* ₹${subtotal.toLocaleString("en-IN")} | *GST (${rate}%):* ₹${gst.gstAmt.toLocaleString("en-IN")} | *Total:* ₹${gst.total.toLocaleString("en-IN")}`,
      `*Store:* M N Enterprises, APMC Road, Bangarapet`,
      `Please confirm stock availability and best bulk contractor price for this list.\n`,
      this.getWhatsAppFooter()
    ].join("\n");

    window.open("https://wa.me/" + this.WA + "?text=" + encodeURIComponent(msg), "_blank");
  },

  /* ---- Send a Photo (Part Identification Tool) ---- */
  openPhotoModal() {
    closeAll();
    const container = document.getElementById("photoModalContent");
    if (container) {
      container.innerHTML = `
        <div style="text-align:center;margin-bottom:16px">
          <div style="width:54px;height:54px;border-radius:50%;background:rgba(245,158,11,0.15);color:var(--amber);display:flex;align-items:center;justify-content:center;margin:0 auto 10px">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:28px;height:28px"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
          </div>
          <h3 style="font-size:18px;margin:0;color:var(--ink)">Don't Know the Exact Part Name?</h3>
          <p style="font-size:13px;color:var(--muted);margin-top:6px">Take a picture of your old broken tap, burnt switch, pipe fitting, or wire sample. Our counter team at Bangarapet will identify it and confirm stock!</p>
        </div>

        <div style="border:2px dashed var(--line);border-radius:12px;padding:24px 16px;text-align:center;background:var(--surface-2);cursor:pointer;position:relative" onclick="document.getElementById('photoInput').click()">
          <input type="file" id="photoInput" accept="image/*" style="display:none" onchange="APP.handlePhotoSelect(event)">
          <div id="photoPreviewWrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:36px;height:36px;color:var(--muted);margin-bottom:8px"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <div style="font-weight:700;font-size:14px;color:var(--ink)">Click to upload or take photo</div>
            <div style="font-size:12px;color:var(--muted);margin-top:4px">Mobile camera, Gallery, JPG, PNG</div>
          </div>
        </div>

        <div class="field" style="margin-top:16px">
          <label>Add a short note (optional)</label>
          <input id="photoNote" placeholder="e.g. Need matching replacement for this tap / 1 inch fitting" autocomplete="off">
        </div>

        <div style="margin-top:18px;display:flex;gap:10px">
          <button class="btn btn-secondary" style="flex:1;justify-content:center" onclick="closeAll()">Cancel</button>
          <button class="btn btn-primary" style="flex:2;justify-content:center" onclick="APP.sendPhotoToWhatsApp()">
            <svg viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.71.45 3.38 1.3 4.86L2.05 22l5.36-1.4a9.87 9.87 0 004.63 1.18h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm5.8 14.13c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.8-.11-.42-.13-.95-.31-1.64-.6-2.88-1.24-4.76-4.15-4.9-4.34-.14-.19-1.17-1.56-1.17-2.97 0-1.41.74-2.1 1-2.39.26-.28.57-.35.76-.35h.55c.18 0 .42-.07.65.5.24.58.81 2 .88 2.15.07.14.12.31.02.5-.1.19-.15.31-.3.48-.14.17-.3.37-.43.5-.14.14-.29.29-.13.57.17.28.75 1.24 1.6 2 1.11.99 2.04 1.29 2.32 1.44.29.14.45.12.62-.07.17-.19.72-.84.91-1.13.19-.28.38-.24.64-.14.26.1 1.66.78 1.94.93.29.14.48.21.55.33.07.12.07.68-.16 1.36z"/></svg>
            Send Photo on WhatsApp
          </button>
        </div>
      `;
    }
    document.getElementById("overlay")?.classList.add("show");
    document.getElementById("photoModal")?.classList.add("show");
  },

  handlePhotoSelect(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const wrap = document.getElementById("photoPreviewWrap");
      if (wrap) {
        wrap.innerHTML = `<img src="${event.target.result}" style="max-height:160px;max-width:100%;object-fit:contain;border-radius:8px;border:1px solid var(--line)" alt="Preview"><div style="font-size:12px;color:var(--amber);margin-top:6px;font-weight:700">✓ Photo attached! Click below to send.</div>`;
      }
    };
    reader.readAsDataURL(file);
  },

  sendPhotoToWhatsApp() {
    const note = (document.getElementById("photoNote")?.value || "").trim();
    const msg = [
      "Hi M N Enterprises,\n\nI need help identifying a hardware / plumbing / electrical part from this photo.",
      note ? `*Note / Application:* ${note}` : "",
      "\nPlease let me know if you have a replacement in stock at your Bangarapet shop.\n",
      this.getWhatsAppFooter()
    ].filter(Boolean).join("\n");

    this.toast("Opening WhatsApp — please attach your photo in the chat!", "info", 3000);
    window.open("https://wa.me/" + this.WA + "?text=" + encodeURIComponent(msg), "_blank");
    closeAll();
  },

  /* ---- Ask a Shop Expert ---- */
  openAskExpertModal() {
    closeAll();
    const container = document.getElementById("expertModalContent");
    if (container) {
      container.innerHTML = `
        <div style="text-align:center;margin-bottom:16px">
          <h3 style="font-size:18px;margin:0;color:var(--ink)">👨🔧 Ask a Shop Expert</h3>
          <p style="font-size:13px;color:var(--muted);margin-top:6px">Not sure which brand, gauge, or fitting you need? Pick your requirement below for direct advice from our Bangarapet shop specialists.</p>
        </div>
        <div class="expert-grid">
          <div class="expert-card" onclick="APP.sendExpertInquiry('electrical')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>
            <h4>Electrical &amp; Wiring</h4>
            <p>House wire gauges, switches, MCBs, inverter lights</p>
          </div>
          <div class="expert-card" onclick="APP.sendExpertInquiry('plumbing')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
            <h4>Plumbing &amp; Pipes</h4>
            <p>CPVC hot/cold lines, PVC drainage, taps &amp; valves</p>
          </div>
          <div class="expert-card" onclick="APP.sendExpertInquiry('cctv')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="14" height="12" rx="2"/><path d="M16 10l6-3v10l-6-3"/></svg>
            <h4>CCTV &amp; Security</h4>
            <p>Home &amp; shop cameras, DVR channels, storage</p>
          </div>
          <div class="expert-card" onclick="APP.sendExpertInquiry('pumps')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C8 7 6 10.5 6 14a6 6 0 0012 0c0-3.5-2-7-6-12z"/></svg>
            <h4>Pumps &amp; Motors</h4>
            <p>Submersible, borewell, pressure booster pumps</p>
          </div>
          <div class="expert-card" style="grid-column:1/-1;background:rgba(239,68,68,0.08);border-color:rgba(239,68,68,0.3)" onclick="APP.sendExpertInquiry('urgent')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--danger)"><polygon points="12 2 2 22 22 22"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <h4 style="color:var(--danger)">🚨 Urgent Repair Requirement</h4>
            <p>Immediate burst pipe, burnt main switch, or urgent site delivery in Bangarapet</p>
          </div>
        </div>
      `;
    }
    document.getElementById("overlay")?.classList.add("show");
    document.getElementById("expertModal")?.classList.add("show");
  },

  sendExpertInquiry(cat) {
    const titles = {
      electrical: "Electrical & House Wiring",
      plumbing: "Plumbing, Pipes & Taps",
      cctv: "CCTV & Security Cameras",
      pumps: "Water Pumps & Tanks",
      urgent: "URGENT Hardware / Plumbing Repair"
    };
    const title = titles[cat] || "Hardware Advice";
    const msg = [
      `Hi M N Enterprises,\n\nI need advice from your counter expert regarding: *${title}*.`,
      "Can you guide me on the right product, brand, and pricing available at your Bangarapet shop?\n",
      this.getWhatsAppFooter()
    ].join("\n");

    window.open("https://wa.me/" + this.WA + "?text=" + encodeURIComponent(msg), "_blank");
    closeAll();
  },

  /* ---- Footer year ---- */
  setYear() {
    const el=document.getElementById("yr"); if(el) el.textContent=new Date().getFullYear();
  },

  /* ---- Init ---- */
  init() {
    this.initTheme();
    this.injectHeader();
    this.injectSharedUI();
    this._updateCartUI();
    this._updateWishlistUI();
    this.renderCartDrawer();
    this.renderShopStatus();
    this.setYear();
    this.initCustomerStatusNotifier();
  },

  /* Customer status notifier pop-up */
  initCustomerStatusNotifier() {
    if (document.documentElement.dataset.page === "admin") return;

    let knownStatuses = {};
    try {
      const orders = JSON.parse(localStorage.getItem("mn_orders") || "[]");
      orders.forEach(o => { knownStatuses[o.id] = o.status || "placed"; });
    } catch(e){}

    const handleStatusUpdate = (orderId, newStatus, extra = {}) => {
      const myOrderIds = JSON.parse(localStorage.getItem("mn_my_order_ids") || "[]");
      const userObj = (typeof AUTH !== "undefined" && typeof AUTH.currentUser === "function") ? AUTH.currentUser() : null;
      const myPhone = (localStorage.getItem("mn_customer_phone") || userObj?.phone || "").replace(/\D/g, "");

      const orders = JSON.parse(localStorage.getItem("mn_orders") || "[]");
      const order = orders.find(x => x.id === orderId);
      const ordPhone = (order?.phone || extra?.customerPhone || "").replace(/\D/g, "");

      const isMyOrder = myOrderIds.includes(orderId) || (myPhone && ordPhone && myPhone === ordPhone);

      // Show alert if it's the customer's order or demo mode
      if (isMyOrder || myOrderIds.length > 0 || !userObj) {
        this.showCustomerStatusPopUp(order || { id: orderId, status: newStatus, ...extra }, newStatus);
      }
    };

    window.addEventListener("storage", (e) => {
      if (e.key === "mn_order_status_update_alert" && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          if (data && data.orderId) {
            handleStatusUpdate(data.orderId, data.status, data);
          }
        } catch(err){}
      } else if (e.key === "mn_orders" && e.newValue) {
        try {
          const currentOrders = JSON.parse(e.newValue || "[]");
          currentOrders.forEach(o => {
            const prev = knownStatuses[o.id];
            const cur = o.status || "placed";
            if (prev !== undefined && prev !== cur) {
              handleStatusUpdate(o.id, cur, o);
            }
            knownStatuses[o.id] = cur;
          });
        } catch(err){}
      }
    });

    window.addEventListener("mn_order_status_update", (e) => {
      if (e.detail && e.detail.orderId) {
        handleStatusUpdate(e.detail.orderId, e.detail.status, e.detail);
      }
    });
  },

  showCustomerStatusPopUp(order, status) {
    const pop = document.getElementById("customerStatusNotification");
    if (!pop) return;

    const iconEl = document.getElementById("csnIcon");
    const badgeEl = document.getElementById("csnBadge");
    const titleEl = document.getElementById("csnTitle");
    const msgEl = document.getElementById("csnMsg");
    const linkEl = document.getElementById("csnLink");

    const orderNum = order.id ? "#" + order.id.slice(-6).toUpperCase() : "#ORDER";
    let icon = "🟡", badge = "Order Placed", bg = "rgba(245,158,11,0.15)", color = "#D97706";
    let title = `Order ${orderNum} Received`;
    let msg = "We have received your order enquiry and are checking stock.";

    if (status === "confirmed") {
      icon = "🔵"; badge = "Order Confirmed"; bg = "rgba(59,130,246,0.15)"; color = "#2563EB";
      title = `Order ${orderNum} Confirmed!`;
      msg = "Your requirement is confirmed and reserved. Our staff is preparing your package.";
    } else if (status === "ready") {
      icon = "🟢"; badge = "Ready for Pickup"; bg = "rgba(16,185,129,0.18)"; color = "#059669";
      title = `Order ${orderNum} Ready for Pickup! 🎉`;
      msg = "Your items are packed and waiting at M N Enterprises shop counter, APMC Road.";
    } else if (status === "collected") {
      icon = "⚪"; badge = "Collected & Complete"; bg = "rgba(71,85,105,0.15)"; color = "#475569";
      title = `Order ${orderNum} Completed`;
      msg = "Thank you for shopping at M N Enterprises Bangarapet! Have a great day.";
    } else if (status === "cancelled") {
      icon = "🔴"; badge = "Order Cancelled"; bg = "rgba(239,68,68,0.15)"; color = "#EF4444";
      title = `Order ${orderNum} Cancelled`;
      msg = "Your order was marked as cancelled. Message us on WhatsApp if you have questions.";
    }

    if (iconEl) { iconEl.textContent = icon; iconEl.style.background = bg; }
    if (badgeEl) { badgeEl.textContent = badge; badgeEl.style.background = bg; badgeEl.style.color = color; }
    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = msg;
    if (linkEl) linkEl.href = "account.html";

    pop.style.display = "flex";
    pop.style.opacity = "1";

    // Play subtle chime sound
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.42);
    } catch(e){}

    // Auto-dismiss after 10 seconds
    if (window._custStatusTimer) clearTimeout(window._custStatusTimer);
    window._custStatusTimer = setTimeout(() => {
      pop.style.transition = "opacity 0.4s ease";
      pop.style.opacity = "0";
      setTimeout(() => { pop.style.display = "none"; pop.style.opacity = "1"; pop.style.transition = ""; }, 420);
    }, 10000);
  }
};

/* Global helpers */
function openCart() {
  closeAll();
  document.getElementById("overlay")?.classList.add("show");
  document.getElementById("cartDrawer")?.classList.add("show");
  APP.renderCartDrawer();
}
function closeAll() {
  ["overlay","cartDrawer","successModal","adminModal","productDetailModal","wishlistModal","requirementModal","photoModal","expertModal"].forEach(id=>{
    const el=document.getElementById(id); if(el){ el.classList.remove("show"); }
  });
}
function changeQty(id,delta){ APP.changeQty(id,delta); }
function openProductDetail(id){ APP.openProductDetail(id); }
function quickWaEnquire(e, id) {
  if (e) e.stopPropagation();
  const p = PRODUCTS.findById(id);
  if (!p) return;
  const W = 36;
  const padR = (str, len) => (str.length > len ? str.slice(0, len-1)+"." : str.padEnd(len, " "));
  const padL = (str, len) => (str.length > len ? str.slice(0, len) : str.padStart(len, " "));
  const priceFmt = Number(p.price).toLocaleString("en-IN");
  const mrpFmt   = Number(p.mrp||p.price).toLocaleString("en-IN");
  let t = "";
  t += "=".repeat(W) + "\n";
  t += "   PRODUCT AVAILABILITY ENQUIRY\n";
  t += "      M N ENTERPRISES\n";
  t += "=".repeat(W) + "\n";
  t += `${padR("ITEM", 17)}${padL("QTY",4)}${padL("RATE",6)}${padL("TOTAL",9)}\n`;
  t += "-".repeat(W) + "\n";
  t += `${padR("1."+p.name, 17)}${padL("1",4)}${padL(String(p.price),6)}${padL(String(p.price),9)}\n`;
  t += "-".repeat(W) + "\n";
  t += `${padR("BRAND: "+(p.brand||"—"), W)}\n`;
  t += `${padR("MRP:", 20)} ${padL("Rs "+mrpFmt, W-21)}\n`;
  t += `${padR("OFFER RATE:", 20)} ${padL("Rs "+priceFmt, W-21)}\n`;
  t += "=".repeat(W) + "\n";
  const msg = `Hi M N Enterprises,\n\nI want to enquire about this product for pickup at your Bangarapet shop:\n\n\`\`\`\n${t.trimEnd()}\n\`\`\`\n\n_Is this currently available in stock?_\n\n${APP.getWhatsAppFooter()}`;
  window.open("https://wa.me/" + APP.WA + "?text=" + encodeURIComponent(msg), "_blank");
}


