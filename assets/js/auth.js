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

  /* ---- Google Sign-In ---- */

  /* signInWithGoogle: Opens built-in Google Account Chooser.
     No external Google Cloud OAuth Client ID required. */
  async signInWithGoogle() {
    return this.signInWithGoogleChooser();
  },

  signInWithGooglePrompt() {
    return this.signInWithGoogle();
  },

  /* ---- Built-in Google Account Selector UI ---- */
  signInWithGoogleChooser() {
    return new Promise((resolve) => {
      const existing = document.getElementById("googleAccountModal");
      if (existing) existing.remove();

      const savedEmail = localStorage.getItem("mn_customer_email") || "gaganchandragowda@gmail.com";
      const savedName  = localStorage.getItem("mn_customer_name")  || "Gagan Chandra";
      const savedPhoto = localStorage.getItem("mn_customer_photo") || "";
      const initial = (savedName[0] || "G").toUpperCase();

      const modal = document.createElement("div");
      modal.id = "googleAccountModal";
      modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.65);backdrop-filter:blur(6px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;animation:fadeIn 0.2s ease";

      modal.innerHTML = `
        <div style="background:#FFFFFF;border-radius:24px;padding:28px 24px 20px;width:100%;max-width:390px;box-shadow:0 24px 64px rgba(0,0,0,0.35);color:#1F1F1F;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;position:relative;text-align:left">
          <button type="button" id="closeGModalBtn" style="position:absolute;top:16px;right:16px;border:none;background:#F1F5F9;color:#64748B;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;line-height:1">&times;</button>

          <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
            <svg viewBox="0 0 24 24" style="width:24px;height:24px;flex-shrink:0"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            <span style="font-size:15px;font-weight:600;color:#1F1F1F">Sign in with Google</span>
          </div>

          <h2 style="margin:0 0 4px;font-size:20px;font-weight:700;color:#111827;line-height:1.25">Choose an account</h2>
          <p style="margin:0 0 20px;font-size:13px;color:#64748B">to continue to <b style="color:#0F172A">M N Enterprises</b></p>

          <div id="selectPrimaryGoogleAccount" style="display:flex;align-items:center;gap:14px;padding:12px 14px;border:1.5px solid #E2E8F0;border-radius:14px;background:#F8FAFC;cursor:pointer;transition:all .18s;margin-bottom:10px">
            <div style="width:42px;height:42px;border-radius:50%;background:#0284C7;color:#fff;display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:700;flex-shrink:0;box-shadow:0 2px 8px rgba(2,132,199,0.25)">
              ${savedPhoto ? `<img src="${savedPhoto}" style="width:100%;height:100%;border-radius:50%;object-fit:cover">` : initial}
            </div>
            <div style="flex:1;min-width:0">
              <div style="font-size:14.5px;font-weight:700;color:#0F172A;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${savedName}</div>
              <div style="font-size:12.5px;color:#64748B;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${savedEmail}</div>
            </div>
            <svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:#0F172A;stroke-width:2.2;fill:none"><path d="M9 18l6-6-6-6"/></svg>
          </div>

          <div id="useAnotherGoogleAccountBtn" style="display:flex;align-items:center;gap:14px;padding:12px 14px;border:1px dashed #CBD5E1;border-radius:14px;background:#FFFFFF;cursor:pointer;transition:all .18s;margin-bottom:18px">
            <div style="width:42px;height:42px;border-radius:50%;background:#F1F5F9;color:#64748B;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">
              <svg viewBox="0 0 24 24" style="width:20px;height:20px;stroke:currentColor;stroke-width:2;fill:none"><path d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div style="flex:1;min-width:0">
              <div style="font-size:13.5px;font-weight:600;color:#0F172A">Use another Google account</div>
              <div style="font-size:11.5px;color:#94A3B8">Switch to different Gmail ID</div>
            </div>
          </div>

          <div id="customGoogleInputWrap" style="display:none;margin-bottom:16px;padding:14px;background:#F8FAFC;border-radius:12px;border:1px solid #E2E8F0">
            <label style="display:block;font-size:12px;font-weight:700;color:#475569;margin-bottom:6px">Enter your Gmail Address</label>
            <div style="display:flex;gap:8px">
              <input type="email" id="customGmailInput" placeholder="yourname@gmail.com" style="flex:1;padding:9px 12px;border-radius:8px;border:1px solid #CBD5E1;font-size:13px;outline:none;background:#fff;color:#0F172A">
              <button type="button" id="confirmCustomGmailBtn" style="padding:9px 14px;background:#0F172A;color:#fff;border:none;border-radius:8px;font-size:12.5px;font-weight:700;cursor:pointer">Continue</button>
            </div>
          </div>

          <div style="font-size:11px;color:#64748B;line-height:1.45;border-top:1px solid #F1F5F9;padding-top:12px;display:flex;align-items:center;gap:6px">
            <svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:#10B981;stroke-width:2.5;fill:none;flex-shrink:0"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>To continue, Google will share your name, email address, and language preference with M N Enterprises.</span>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      const cleanup = () => { modal.remove(); };

      // Close button
      document.getElementById("closeGModalBtn").onclick = () => {
        cleanup();
        resolve({ ok: false });
      };
      modal.addEventListener("click", (e) => {
        if (e.target === modal) { cleanup(); resolve({ ok: false }); }
      });

      // Select primary account
      document.getElementById("selectPrimaryGoogleAccount").onclick = () => {
        const customer = {
          userId: "goog_" + Date.now(),
          name: savedName,
          email: savedEmail,
          photoURL: savedPhoto,
          role: "customer",
          provider: "google.com",
          loggedInAt: new Date().toISOString()
        };
        this.saveCustomerSession(customer);
        try {
          localStorage.setItem("mn_customer_name", customer.name);
          localStorage.setItem("mn_customer_email", customer.email);
          if (customer.photoURL) localStorage.setItem("mn_customer_photo", customer.photoURL);
        } catch(e){}

        cleanup();
        if (typeof APP !== "undefined") {
          if (typeof APP.toast === "function") APP.toast(`Signed in as ${customer.name}`, "success");
          if (typeof APP.injectHeader === "function") APP.injectHeader();
          if (typeof APP.renderCartDrawer === "function") APP.renderCartDrawer();
        }
        if (document.documentElement.dataset.page === "login") {
          window.location.href = "account.html";
        }
        resolve({ ok: true, user: customer });
      };

      // Toggle custom email
      document.getElementById("useAnotherGoogleAccountBtn").onclick = () => {
        const wrap = document.getElementById("customGoogleInputWrap");
        wrap.style.display = wrap.style.display === "none" ? "block" : "none";
        if (wrap.style.display === "block") {
          document.getElementById("customGmailInput").focus();
        }
      };

      // Confirm custom email
      document.getElementById("confirmCustomGmailBtn").onclick = () => {
        const customEmail = (document.getElementById("customGmailInput").value || "").trim().toLowerCase();
        if (!customEmail || !customEmail.includes("@")) {
          alert("Please enter a valid Gmail address.");
          return;
        }
        const derivedName = customEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, l => l.toUpperCase());
        const customer = {
          userId: "goog_" + Date.now(),
          name: derivedName,
          email: customEmail,
          photoURL: "",
          role: "customer",
          provider: "google.com",
          loggedInAt: new Date().toISOString()
        };
        this.saveCustomerSession(customer);
        try {
          localStorage.setItem("mn_customer_name", customer.name);
          localStorage.setItem("mn_customer_email", customer.email);
        } catch(e){}

        cleanup();
        if (typeof APP !== "undefined") {
          if (typeof APP.toast === "function") APP.toast(`Signed in as ${customer.name}`, "success");
          if (typeof APP.injectHeader === "function") APP.injectHeader();
          if (typeof APP.renderCartDrawer === "function") APP.renderCartDrawer();
        }
        if (document.documentElement.dataset.page === "login") {
          window.location.href = "account.html";
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

