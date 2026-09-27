/* ================================================================
   M N ENTERPRISES — FIREBASE DATABASE LAYER (firebase-db.js)
   ================================================================
   Unified data layer — uses Firebase Firestore when configured,
   falls back to localStorage for local development.
   
   USAGE:
     await MN_DB.orders.save(orderObj)
     await MN_DB.orders.getAll()
     await MN_DB.orders.update(id, { status: "confirmed" })
     MN_DB.orders.listen(callback)   ← real-time listener
     
     await MN_DB.auth.signIn(email, password)
     await MN_DB.auth.signUp(name, email, password)
     MN_DB.auth.onUserChange(callback)
   ================================================================ */

const MN_DB = (() => {
  /* ---- Helpers ---- */
  const LS = {
    get(k, def=[])  { try { return JSON.parse(localStorage.getItem(k) ?? null) ?? def; } catch { return def; } },
    set(k, v)       { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} },
    del(k)          { try { localStorage.removeItem(k); } catch(e){} }
  };

  const USE_FIREBASE = () => !!window._db;
  const db   = () => window._db;
  const auth = () => window._auth;

  /* ================================================================
     ORDERS
  ================================================================ */
  const orders = {
    /* Save a new order */
    async save(order) {
      if (USE_FIREBASE()) {
        await db().collection("orders").doc(order.id).set({
          ...order,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      } else {
        const list = LS.get("mn_orders", []);
        const idx  = list.findIndex(o => o.id === order.id);
        if (idx >= 0) list[idx] = { ...list[idx], ...order };
        else list.unshift(order);
        LS.set("mn_orders", list.slice(0, 200));
      }
      // Also keep local copy for customer's "my orders" page
      const myIds = LS.get("mn_my_order_ids", []);
      if (!myIds.includes(order.id)) myIds.unshift(order.id);
      LS.set("mn_my_order_ids", myIds.slice(0, 100));
    },

    /* Get all orders (admin view) */
    async getAll() {
      if (USE_FIREBASE()) {
        const snap = await db().collection("orders")
          .orderBy("createdAt", "desc")
          .limit(200)
          .get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
      return LS.get("mn_orders", []);
    },

    /* Get orders for a specific customer phone */
    async getByPhone(phone) {
      if (USE_FIREBASE()) {
        const snap = await db().collection("orders")
          .where("phone", "==", phone)
          .orderBy("createdAt", "desc")
          .get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
      const myIds = LS.get("mn_my_order_ids", []);
      const all   = LS.get("mn_orders", []);
      return all.filter(o => myIds.includes(o.id) || o.phone === phone);
    },

    /* Get a single order */
    async get(id) {
      if (USE_FIREBASE()) {
        const doc = await db().collection("orders").doc(id).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
      }
      return LS.get("mn_orders", []).find(o => o.id === id) || null;
    },

    /* Update an order (partial update) */
    async update(id, updates) {
      if (USE_FIREBASE()) {
        await db().collection("orders").doc(id).update({
          ...updates,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      } else {
        const list = LS.get("mn_orders", []);
        const idx  = list.findIndex(o => o.id === id);
        if (idx >= 0) list[idx] = { ...list[idx], ...updates };
        LS.set("mn_orders", list);
      }
    },

    /* Delete an order */
    async delete(id) {
      if (USE_FIREBASE()) {
        await db().collection("orders").doc(id).delete();
      } else {
        const list = LS.get("mn_orders", []).filter(o => o.id !== id);
        LS.set("mn_orders", list);
      }
    },

    /* Real-time listener — calls callback(orders[]) on any change */
    listen(callback) {
      if (USE_FIREBASE()) {
        return db().collection("orders")
          .orderBy("createdAt", "desc")
          .limit(200)
          .onSnapshot(snap => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            callback(list);
          }, err => console.error("Orders listener error:", err));
      } else {
        // localStorage polling fallback (every 3s)
        callback(LS.get("mn_orders", []));
        const interval = setInterval(() => callback(LS.get("mn_orders", [])), 3000);
        return () => clearInterval(interval); // returns unsubscribe fn
      }
    }
  };

  /* ================================================================
     AUTHENTICATION
  ================================================================ */
  const _AUTH_ADMIN_USER = "admin";
  const _AUTH_ADMIN_PASS = "mn2026";

  const authLayer = {
    /* Customer sign-up */
    async signUp(name, email, password) {
      if (!name || !email || !password)
        return { ok: false, msg: "All fields are required." };
      if (password.length < 6)
        return { ok: false, msg: "Password must be at least 6 characters." };

      if (USE_FIREBASE()) {
        try {
          const cred = await auth().createUserWithEmailAndPassword(email, password);
          await cred.user.updateProfile({ displayName: name });
          // Save extra profile data to Firestore
          await db().collection("users").doc(cred.user.uid).set({
            uid:       cred.user.uid,
            name:      name.trim(),
            email:     email.toLowerCase().trim(),
            role:      "customer",
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
          return { ok: true, user: { uid: cred.user.uid, name, email, role: "customer" } };
        } catch (e) {
          return { ok: false, msg: _firebaseAuthError(e) };
        }
      } else {
        // localStorage fallback
        const users = LS.get("mn_users", []);
        if (users.find(u => u.email.toLowerCase() === email.toLowerCase()))
          return { ok: false, msg: "An account with this email already exists." };
        const user = {
          id: "u" + Date.now(), name: name.trim(),
          email: email.toLowerCase().trim(),
          password, role: "customer",
          createdAt: new Date().toISOString()
        };
        users.push(user);
        LS.set("mn_users", users);
        LS.set("mn_session", { userId: user.id, name: user.name, email: user.email, role: "customer", loggedInAt: new Date().toISOString() });
        return { ok: true };
      }
    },

    /* Customer sign-in */
    async signIn(email, password) {
      if (!email || !password)
        return { ok: false, msg: "Email and password are required." };

      if (USE_FIREBASE()) {
        try {
          const cred = await auth().signInWithEmailAndPassword(email, password);
          const uid  = cred.user.uid;
          // Fetch user profile
          let role = "customer";
          try {
            const prof = await db().collection("users").doc(uid).get();
            if (prof.exists) role = prof.data().role || "customer";
          } catch(e){}
          const session = {
            userId: uid, name: cred.user.displayName || email,
            email: cred.user.email, role,
            loggedInAt: new Date().toISOString()
          };
          LS.set("mn_session", session);
          return { ok: true, user: session };
        } catch (e) {
          return { ok: false, msg: _firebaseAuthError(e) };
        }
      } else {
        const user = LS.get("mn_users", []).find(
          u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (!user) return { ok: false, msg: "Incorrect email or password." };
        LS.set("mn_session", { userId: user.id, name: user.name, email: user.email, role: "customer", loggedInAt: new Date().toISOString() });
        return { ok: true };
      }
    },

    /* Admin sign-in (separate flow, stays credential-based) */
    async signInAdmin(username, password) {
      if (!username || !password)
        return { ok: false, msg: "Username and password are required." };

      const adminSession = { userId: "admin_root", name: "Store Administrator", role: "admin", loggedInAt: new Date().toISOString() };

      if (USE_FIREBASE()) {
        try {
          const adminDoc = await db().collection("config").doc("admin").get();
          const stored   = adminDoc.exists ? adminDoc.data() : {};
          const uOk  = username === (stored.username || _AUTH_ADMIN_USER);
          const pOk  = password === (stored.password || _AUTH_ADMIN_PASS);
          if (uOk && pOk) {
            LS.set("mn_admin_session", adminSession);
            return { ok: true };
          }
          return { ok: false, msg: "Incorrect admin credentials." };
        } catch(e) {
          const uOk = username === _AUTH_ADMIN_USER;
          const pOk = password === _AUTH_ADMIN_PASS;
          if (uOk && pOk) {
            LS.set("mn_admin_session", adminSession);
            return { ok: true };
          }
          return { ok: false, msg: "Incorrect admin credentials." };
        }
      } else {
        const ap  = localStorage.getItem("mn_admin_pass") || _AUTH_ADMIN_PASS;
        if (username === _AUTH_ADMIN_USER && password === ap) {
          LS.set("mn_admin_session", adminSession);
          return { ok: true };
        }
        return { ok: false, msg: "Incorrect admin credentials." };
      }
    },

    /* Sign out */
    async signOut() {
      const isAdm = document.documentElement.dataset.page === "admin";
      if (isAdm) {
        LS.del("mn_admin_session");
      } else {
        if (USE_FIREBASE()) {
          try { await auth().signOut(); } catch(e) {}
        }
        LS.del("mn_customer_session");
        const s = LS.get("mn_session", null);
        if (s && s.role !== "admin") LS.del("mn_session");
      }
    },

    /* Get current session (sync, context-aware) */
    currentUser() {
      const isAdm = document.documentElement.dataset.page === "admin";
      if (isAdm) return LS.get("mn_admin_session", null);
      return LS.get("mn_customer_session", null) || LS.get("mn_session", null);
    },
    getSession() {
      return this.currentUser();
    },
    isLoggedIn() {
      return !!this.currentUser();
    },
    isAdmin() {
      const s = LS.get("mn_admin_session", null);
      return !!(s && s.role === "admin");
    },

    /* Listen for Firebase auth state changes */
    onUserChange(callback) {
      if (USE_FIREBASE()) {
        return auth().onAuthStateChanged(async fbUser => {
          if (fbUser) {
            let role = "customer";
            try {
              const prof = await db().collection("users").doc(fbUser.uid).get();
              if (prof.exists) role = prof.data().role || "customer";
            } catch(e){}
            const session = {
              userId: fbUser.uid, name: fbUser.displayName || fbUser.email,
              email: fbUser.email, role: "customer", loggedInAt: new Date().toISOString()
            };
            LS.set("mn_customer_session", session);
            LS.set("mn_session", session);
            callback(session);
          } else {
            LS.del("mn_customer_session");
            const s = LS.get("mn_session", null);
            if (s && s.role !== "admin") LS.del("mn_session");
            callback(null);
          }
        });
      }
      callback(this.currentUser());
      return () => {};
    },

    /* Legacy compat wrappers */
    signup(name, email, password) { return this.signUp(name, email, password); },
    loginCustomer(email, password){ return this.signIn(email, password); },
    loginAdmin(u, p) { return this.signInAdmin(u, p); },
    logout() {
      this.signOut().then(() => {
        const isAdmin = document.documentElement.dataset.page === "admin";
        window.location.href = isAdmin ? "login.html" : "login.html";
      });
    },
    requireAuth(redirect="login.html")  { if (!this.isLoggedIn()) { window.location.href = redirect; return false; } return true; },
    requireAdmin(redirect="admin/login.html") {
      if (!this.isAdmin()) {
        const isAdm = document.documentElement.dataset.page === "admin";
        window.location.href = isAdm ? "login.html" : redirect;
        return false;
      }
      return true;
    }
  };

  /* ================================================================
     USERS (customer profiles)
  ================================================================ */
  const users = {
    async save(uid, data) {
      if (USE_FIREBASE()) {
        await db().collection("users").doc(uid).set(data, { merge: true });
      } else {
        const list = LS.get("mn_users", []);
        const idx  = list.findIndex(u => u.id === uid);
        if (idx >= 0) list[idx] = { ...list[idx], ...data };
        else list.push({ id: uid, ...data });
        LS.set("mn_users", list);
      }
    },

    async get(uid) {
      if (USE_FIREBASE()) {
        const doc = await db().collection("users").doc(uid).get();
        return doc.exists ? { uid: doc.id, ...doc.data() } : null;
      }
      return LS.get("mn_users", []).find(u => u.id === uid) || null;
    },

    async getAll() {
      if (USE_FIREBASE()) {
        const snap = await db().collection("users").get();
        return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
      }
      return LS.get("mn_users", []);
    }
  };

  /* ================================================================
     WHATSAPP THREADS
  ================================================================ */
  const waThreads = {
    async save(thread) {
      if (USE_FIREBASE()) {
        await db().collection("wa_threads").doc(thread.phone).set({
          ...thread,
          lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      } else {
        const all = LS.get("mn_wa_threads", {});
        all[thread.phone] = thread;
        LS.set("mn_wa_threads", all);
      }
    },

    async get(phone) {
      if (USE_FIREBASE()) {
        const doc = await db().collection("wa_threads").doc(phone).get();
        return doc.exists ? { phone: doc.id, ...doc.data() } : null;
      }
      return (LS.get("mn_wa_threads", {}))[phone] || null;
    },

    async getAll() {
      if (USE_FIREBASE()) {
        const snap = await db().collection("wa_threads")
          .orderBy("lastUpdated", "desc").limit(200).get();
        return snap.docs.map(d => ({ phone: d.id, ...d.data() }));
      }
      return Object.values(LS.get("mn_wa_threads", {}))
        .sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0));
    },

    listen(callback) {
      if (USE_FIREBASE()) {
        return db().collection("wa_threads")
          .orderBy("lastUpdated", "desc")
          .limit(200)
          .onSnapshot(snap => callback(snap.docs.map(d => ({ phone: d.id, ...d.data() }))));
      }
      callback(Object.values(LS.get("mn_wa_threads", {})));
      const interval = setInterval(() =>
        callback(Object.values(LS.get("mn_wa_threads", {}))), 3000);
      return () => clearInterval(interval);
    }
  };

  /* ================================================================
     SHOP CONFIG
  ================================================================ */
  const config = {
    async get() {
      if (USE_FIREBASE()) {
        try {
          const doc = await db().collection("config").doc("shop").get();
          return doc.exists ? doc.data() : {};
        } catch(e) { return {}; }
      }
      return LS.get("mn_shop_config", {});
    },

    async set(data) {
      if (USE_FIREBASE()) {
        await db().collection("config").doc("shop").set(data, { merge: true });
      } else {
        LS.set("mn_shop_config", { ...(LS.get("mn_shop_config", {})), ...data });
      }
    }
  };

  /* ================================================================
     FIREBASE ERROR MESSAGES
  ================================================================ */
  function _firebaseAuthError(e) {
    const map = {
      "auth/email-already-in-use":   "An account with this email already exists.",
      "auth/invalid-email":           "Invalid email address.",
      "auth/weak-password":           "Password must be at least 6 characters.",
      "auth/user-not-found":          "No account found with this email.",
      "auth/wrong-password":          "Incorrect password. Please try again.",
      "auth/too-many-requests":       "Too many attempts. Please try again later.",
      "auth/network-request-failed":  "Network error. Check your internet connection.",
      "auth/invalid-credential":      "Incorrect email or password."
    };
    return map[e.code] || e.message || "Authentication failed.";
  }

  /* ================================================================
     PUBLIC API
  ================================================================ */
  return {
    orders,
    auth:      authLayer,
    users,
    waThreads,
    config,
    isFirebase: USE_FIREBASE,
    /* Status check */
    status() {
      return USE_FIREBASE()
        ? "🔥 Firebase (Firestore + Auth)"
        : "💾 localStorage (offline mode)";
    }
  };
})();

/* ----------------------------------------------------------------
   Override global AUTH to use MN_DB.auth (backward compatibility)
   The existing auth.js still loads, then we patch it here.
---------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  if (typeof AUTH !== "undefined") {
    // Patch existing AUTH methods to use MN_DB.auth
    AUTH.signup        = (n,e,p)  => MN_DB.auth.signUp(n,e,p);
    AUTH.loginCustomer = (e,p)    => MN_DB.auth.signIn(e,p);
    AUTH.loginAdmin    = (u,p)    => MN_DB.auth.signInAdmin(u,p);
    AUTH.logout        = ()       => MN_DB.auth.logout();
    AUTH.currentUser   = ()       => MN_DB.auth.currentUser();
    AUTH.getSession    = ()       => MN_DB.auth.getSession();
    AUTH.isLoggedIn    = ()       => MN_DB.auth.isLoggedIn();
    AUTH.isAdmin       = ()       => MN_DB.auth.isAdmin();
  }
});
