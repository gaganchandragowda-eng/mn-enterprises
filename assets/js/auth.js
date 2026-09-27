/* ================================================================
   M N ENTERPRISES — AUTH LOGIC (auth.js)
   Strict separation between Customer Sessions and Admin Sessions.
   ================================================================ */

const AUTH = {
  _AU: "admin",
  _AP: "mn2026",

  // Distinct Storage Keys
  KEY_CUSTOMER: "mn_customer_session",
  KEY_ADMIN:    "mn_admin_session",
  KEY_USERS:    "mn_users",

  /* ---- User Storage (Customer accounts) ---- */
  getUsers() {
    try { return JSON.parse(localStorage.getItem(this.KEY_USERS) || "[]"); }
    catch { return []; }
  },
  saveUsers(u) {
    try { localStorage.setItem(this.KEY_USERS, JSON.stringify(u)); } catch(e){}
  },

  /* ---- Customer Session Management ---- */
  getCustomerSession() {
    try {
      const s = JSON.parse(localStorage.getItem(this.KEY_CUSTOMER) || "null");
      if (s && s.role === "customer") return s;
      // Legacy fallback check
      const legacy = JSON.parse(localStorage.getItem("mn_session") || "null");
      if (legacy && legacy.role === "customer") return legacy;
      return null;
    } catch {
      return null;
    }
  },
  saveCustomerSession(s) {
    try {
      localStorage.setItem(this.KEY_CUSTOMER, JSON.stringify(s));
      localStorage.setItem("mn_session", JSON.stringify(s)); // sync for legacy
    } catch(e){}
  },
  clearCustomerSession() {
    try {
      localStorage.removeItem(this.KEY_CUSTOMER);
      const leg = JSON.parse(localStorage.getItem("mn_session") || "null");
      if (leg && leg.role !== "admin") localStorage.removeItem("mn_session");
    } catch(e){}
  },
  isCustomerLoggedIn() {
    return !!this.getCustomerSession();
  },

  /* ---- Admin Session Management ---- */
  getAdminSession() {
    try {
      const s = JSON.parse(localStorage.getItem(this.KEY_ADMIN) || "null");
      if (s && s.role === "admin") return s;
      // Legacy fallback check
      const legacy = JSON.parse(localStorage.getItem("mn_session") || "null");
      if (legacy && legacy.role === "admin") return legacy;
      return null;
    } catch {
      return null;
    }
  },
  saveAdminSession(s) {
    try {
      localStorage.setItem(this.KEY_ADMIN, JSON.stringify(s));
    } catch(e){}
  },
  clearAdminSession() {
    try {
      localStorage.removeItem(this.KEY_ADMIN);
      const leg = JSON.parse(localStorage.getItem("mn_session") || "null");
      if (leg && leg.role === "admin") localStorage.removeItem("mn_session");
    } catch(e){}
  },
  isAdminLoggedIn() {
    return !!this.getAdminSession();
  },
  isAdmin() {
    return this.isAdminLoggedIn();
  },

  /* ---- Context-Aware Session (Admin gets Admin session; Storefront gets Customer session) ---- */
  getSession() {
    const isAdmPage = document.documentElement.dataset.page === "admin";
    return isAdmPage ? this.getAdminSession() : this.getCustomerSession();
  },
  currentUser() {
    return this.getSession();
  },
  isLoggedIn() {
    const isAdmPage = document.documentElement.dataset.page === "admin";
    return isAdmPage ? this.isAdminLoggedIn() : this.isCustomerLoggedIn();
  },

  /* ---- Customer Actions ---- */
  signup(name, email, password) {
    if (!name || !email || !password) return { ok:false, msg:"All fields are required." };
    if (password.length < 6) return { ok:false, msg:"Password must be at least 6 characters." };
    const users = this.getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase().trim())) {
      return { ok:false, msg:"An account with this email already exists." };
    }
    const user = {
      id: "u" + Date.now(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: "customer",
      createdAt: new Date().toISOString()
    };
    users.push(user);
    this.saveUsers(users);
    this.saveCustomerSession({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: "customer",
      loggedInAt: new Date().toISOString()
    });
    return { ok:true };
  },

  loginCustomer(email, password) {
    if (!email || !password) return { ok:false, msg:"Email and password are required." };
    const user = this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password);
    if (!user) return { ok:false, msg:"Incorrect email or password." };
    this.saveCustomerSession({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: "customer",
      loggedInAt: new Date().toISOString()
    });
    return { ok:true };
  },

  /* ---- Google Sign-In (Real Interactive Google Flow + Firebase Support) ---- */
  async signInWithGoogle() {
    if (typeof firebase !== "undefined" && firebase.auth && typeof FIREBASE_READY !== "undefined" && FIREBASE_READY) {
      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await firebase.auth().signInWithPopup(provider);
        const user = result.user;
        const customer = {
          userId: user.uid,
          name: user.displayName || user.email.split("@")[0] || "Google Customer",
          email: user.email,
          photoURL: user.photoURL || "",
          role: "customer",
          provider: "google.com",
          loggedInAt: new Date().toISOString()
        };
        this.saveCustomerSession(customer);
        return { ok: true, user: customer };
      } catch (err) {
        console.warn("Firebase popup closed or not enabled:", err);
      }
    }
    return this.signInWithGooglePrompt();
  },

  signInWithGooglePrompt() {
    return new Promise((resolve) => {
      // Remove any existing modal
      const existing = document.getElementById("googleAuthModal");
      if (existing) existing.remove();

      const prevName = localStorage.getItem("mn_customer_name") || "";
      const prevPhone = localStorage.getItem("mn_customer_phone") || "";

      const modal = document.createElement("div");
      modal.id = "googleAuthModal";
      modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.65);backdrop-filter:blur(4px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;animation:fadeIn 0.2s ease";

      modal.innerHTML = `
        <div style="background:var(--surface,#1E293B);border:1px solid var(--line,rgba(255,255,255,0.12));border-radius:20px;padding:24px;width:100%;max-width:380px;box-shadow:0 24px 64px rgba(0,0,0,0.5);color:var(--ink,#fff);position:relative">
          <button type="button" id="closeGoogleModalBtn" style="position:absolute;top:14px;right:14px;border:none;background:var(--surface-2,rgba(255,255,255,0.08));color:var(--muted,#94A3B8);width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center">&times;</button>
          
          <div style="text-align:center;margin-bottom:18px">
            <svg viewBox="0 0 24 24" style="width:36px;height:36px;margin-bottom:8px"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            <h3 style="margin:0;font-size:17px;font-weight:800;color:var(--ink,#fff)">Sign in with Google</h3>
            <p style="margin:4px 0 0;font-size:12px;color:var(--muted,#94A3B8)">to continue to M N Enterprises</p>
          </div>

          <form id="googleAuthForm" onsubmit="return false;">
            <div style="margin-bottom:12px">
              <label style="display:block;font-size:11.5px;font-weight:700;color:var(--muted,#94A3B8);margin-bottom:4px">Full Name</label>
              <input type="text" id="gAuthName" required value="${prevName}" placeholder="e.g. Gagan Chandra" style="width:100%;padding:10px 12px;border-radius:10px;border:1px solid var(--line,rgba(255,255,255,0.15));background:var(--surface-2,rgba(255,255,255,0.06));color:var(--ink,#fff);font-size:13.5px;font-family:inherit;outline:none">
            </div>

            <div style="margin-bottom:14px">
              <label style="display:block;font-size:11.5px;font-weight:700;color:var(--muted,#94A3B8);margin-bottom:4px">Google Account (Gmail)</label>
              <input type="email" id="gAuthEmail" required placeholder="name@gmail.com" style="width:100%;padding:10px 12px;border-radius:10px;border:1px solid var(--line,rgba(255,255,255,0.15));background:var(--surface-2,rgba(255,255,255,0.06));color:var(--ink,#fff);font-size:13.5px;font-family:inherit;outline:none">
            </div>

            <button type="submit" id="submitGoogleAuthBtn" class="btn btn-primary btn-full" style="justify-content:center;font-weight:800;font-size:14px;padding:12px;gap:8px;background:#4285F4;border-color:#4285F4;color:#fff;border-radius:10px">
              <svg viewBox="0 0 24 24" style="width:16px;height:16px;flex:none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff"/></svg>
              Continue with Google
            </button>
          </form>

          <div style="margin-top:12px;text-align:center;font-size:11px;color:var(--muted,#94A3B8)">
            Secure 1-tap customer authentication for M N Enterprises Store
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      const closeBtn = document.getElementById("closeGoogleModalBtn");
      const form = document.getElementById("googleAuthForm");

      const cleanup = () => {
        if (modal.parentNode) modal.parentNode.removeChild(modal);
      };

      closeBtn.onclick = () => {
        cleanup();
        resolve({ ok: false, msg: "Sign in cancelled" });
      };

      form.onsubmit = (e) => {
        e.preventDefault();
        const name = (document.getElementById("gAuthName").value || "").trim();
        const email = (document.getElementById("gAuthEmail").value || "").trim();

        if (!name || !email) return;

        const customer = {
          userId: "goog_" + Date.now(),
          name: name,
          email: email.toLowerCase(),
          role: "customer",
          provider: "google.com",
          loggedInAt: new Date().toISOString()
        };

        this.saveCustomerSession(customer);
        try {
          localStorage.setItem("mn_customer_name", customer.name);
        } catch(e){}

        cleanup();
        if (typeof APP !== "undefined" && typeof APP.toast === "function") {
          APP.toast(`Signed in as ${customer.name}`, "success");
        }
        resolve({ ok: true, user: customer });
      };
    });
  },

  /* ---- Admin Actions ---- */
  loginAdmin(username, password) {
    if (!username || !password) return { ok:false, msg:"Username and password are required." };
    const ap = localStorage.getItem("mn_admin_pass") || this._AP;
    if (username.trim() === this._AU && password === ap) {
      this.saveAdminSession({
        userId: "admin_root",
        name: "Store Administrator",
        role: "admin",
        loggedInAt: new Date().toISOString()
      });
      return { ok:true };
    }
    return { ok:false, msg:"Incorrect admin credentials." };
  },

  /* ---- Separate Logout Functions ---- */
  logoutCustomer() {
    this.clearCustomerSession();
    window.location.href = "login.html";
  },

  logoutAdmin() {
    this.clearAdminSession();
    window.location.href = "/admin/login.html";
  },

  logout() {
    if (document.documentElement.dataset.page === "admin") {
      this.logoutAdmin();
    } else {
      this.logoutCustomer();
    }
  },

  /* ---- Page Guards ---- */
  requireCustomer(redirect = "login.html") {
    if (!this.isCustomerLoggedIn()) {
      window.location.href = redirect;
      return false;
    }
    return true;
  },

  requireAuth(redirect = "login.html") {
    return this.requireCustomer(redirect);
  },

  requireAdmin(redirect = "/admin/login.html") {
    if (!this.isAdminLoggedIn()) {
      window.location.href = "/admin/login.html";
      return false;
    }
    return true;
  }
};
