/* ================================================================
   M N ENTERPRISES — AUTH LOGIC (auth.js)
   ================================================================ */

const AUTH = {
  _AU: "admin", _AP: "mn2026",

  getUsers()    { try{ return JSON.parse(localStorage.getItem("mn_users")||"[]"); }  catch{ return []; } },
  saveUsers(u)  { try{ localStorage.setItem("mn_users", JSON.stringify(u)); } catch(e){} },
  getSession()  { try{ return JSON.parse(localStorage.getItem("mn_session")||"null"); } catch{ return null; } },
  currentUser() { return this.getSession(); },
  saveSession(s){ try{ localStorage.setItem("mn_session", JSON.stringify(s)); } catch(e){} },
  isLoggedIn()  { return !!this.getSession(); },
  isAdmin()     { const s=this.getSession(); return !!(s&&s.role==="admin"); },

  signup(name, email, password) {
    if (!name||!email||!password) return { ok:false, msg:"All fields are required." };
    if (password.length < 6) return { ok:false, msg:"Password must be at least 6 characters." };
    const users = this.getUsers();
    if (users.find(u => u.email.toLowerCase()===email.toLowerCase()))
      return { ok:false, msg:"An account with this email already exists." };
    const user = { id:"u"+Date.now(), name:name.trim(), email:email.toLowerCase().trim(), password, role:"customer", createdAt:new Date().toISOString() };
    users.push(user);
    this.saveUsers(users);
    this.saveSession({ userId:user.id, name:user.name, email:user.email, role:"customer", loggedInAt:new Date().toISOString() });
    return { ok:true };
  },

  loginCustomer(email, password) {
    if (!email||!password) return { ok:false, msg:"Email and password are required." };
    const user = this.getUsers().find(u => u.email.toLowerCase()===email.toLowerCase() && u.password===password);
    if (!user) return { ok:false, msg:"Incorrect email or password." };
    this.saveSession({ userId:user.id, name:user.name, email:user.email, role:"customer", loggedInAt:new Date().toISOString() });
    return { ok:true };
  },

  loginAdmin(username, password) {
    if (!username||!password) return { ok:false, msg:"Username and password are required." };
    const ap = localStorage.getItem("mn_admin_pass") || this._AP;
    if (username===this._AU && password===ap) {
      this.saveSession({ userId:"admin_root", name:"Admin", role:"admin", loggedInAt:new Date().toISOString() });
      return { ok:true };
    }
    return { ok:false, msg:"Incorrect admin credentials." };
  },

  logout() {
    try{ localStorage.removeItem("mn_session"); } catch(e){}
    window.location.href = (document.documentElement.dataset.page==="admin") ? "../login.html" : "login.html";
  },

  requireAuth(redirect="login.html")  { if(!this.isLoggedIn()){ window.location.href=redirect; return false; } return true; },
  requireAdmin(redirect="login.html") { if(!this.isAdmin())   { window.location.href=redirect; return false; } return true; }
};
