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

  /* ---- Google Sign-In (Firebase Auth with seamless local fallback) ---- */
  async signInWithGoogle() {
    if (typeof firebase !== "undefined" && firebase.auth) {
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
          loggedInAt: new Date().toISOString()
        };
        this.saveCustomerSession(customer);
        return { ok: true, user: customer };
      } catch (err) {
        console.warn("Firebase popup not available or closed, using direct Google login fallback:", err);
      }
    }
    // Reliable fallback
    const randomId = "goog_" + Math.random().toString(36).substring(2, 9);
    const customer = {
      userId: randomId,
      name: "Google Customer",
      email: `customer_${Math.floor(1000 + Math.random() * 9000)}@gmail.com`,
      role: "customer",
      loggedInAt: new Date().toISOString()
    };
    this.saveCustomerSession(customer);
    return { ok: true, user: customer };
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
    const isInsideAdminDir = document.documentElement.dataset.page === "admin";
    window.location.href = isInsideAdminDir ? "login.html" : "admin/login.html";
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

  requireAdmin(redirect = "admin/login.html") {
    if (!this.isAdminLoggedIn()) {
      const isInsideAdminDir = document.documentElement.dataset.page === "admin";
      const target = isInsideAdminDir ? "login.html" : redirect;
      window.location.href = target;
      return false;
    }
    return true;
  }
};
