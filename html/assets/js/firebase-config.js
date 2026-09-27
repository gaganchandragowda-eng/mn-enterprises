/* ================================================================
   M N ENTERPRISES — FIREBASE CONFIGURATION
   ================================================================
   ⚠️  HOW TO CONFIGURE:
   1. Go to https://console.firebase.google.com
   2. Create a project (or use existing)
   3. Project Settings → Your Apps → Add Web App (</> icon)
   4. Copy the firebaseConfig values below
   5. Enable Firestore: Build → Firestore Database → Create database
   6. Enable Auth: Build → Authentication → Get Started → Email/Password
   ================================================================ */

const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyPLACEHOLDER_REPLACE_ME",
  authDomain:        "mn-enterprises-REPLACE.firebaseapp.com",
  projectId:         "mn-enterprises-REPLACE",
  storageBucket:     "mn-enterprises-REPLACE.appspot.com",
  messagingSenderId: "000000000000",
  appId:             "1:000000000000:web:REPLACE_ME"
};

/* ----------------------------------------------------------------
   Auto-detect if config has been filled in
---------------------------------------------------------------- */
const FIREBASE_READY = (
  FIREBASE_CONFIG.apiKey &&
  !FIREBASE_CONFIG.apiKey.includes("PLACEHOLDER") &&
  !FIREBASE_CONFIG.apiKey.includes("REPLACE")
);

if (FIREBASE_READY) {
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }
    window._db   = firebase.firestore();
    window._auth = firebase.auth();
    // Enable offline persistence (works even without internet temporarily)
    window._db.enablePersistence({ synchronizeTabs: true }).catch(() => {});
    console.log("✅ Firebase connected — M N Enterprises");
  } catch (e) {
    console.error("Firebase init error:", e);
    window._db   = null;
    window._auth = null;
  }
} else {
  window._db   = null;
  window._auth = null;
  console.warn("⚠️  Firebase not configured yet. Running in localStorage mode.");
  console.warn("   Open setup.html in your browser to configure Firebase.");
}
