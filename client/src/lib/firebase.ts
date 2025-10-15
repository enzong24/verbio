// Firebase configuration and initialization (from blueprint:firebase_barebones_javascript)
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDMRWysyqw4WmbEE44WoC13AyNZ5efoFDc",
  authDomain: "verbio-cbb62.firebaseapp.com",
  projectId: "verbio-cbb62",
  storageBucket: "verbio-cbb62.firebasestorage.app",
  messagingSenderId: "844702758789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:844702758789:web:dfd11200833c287243f6ec",
  measurementId: "G-058P2R5D6T"
};

// Use single Firebase app instance - prevents multiple inits on hot reload
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

console.log('[Firebase] App initialized, existing apps:', getApps().length);

export const googleProvider = new GoogleAuthProvider();

// Initialize auth - MUST be called before any sign-in attempts
let authInitialized = false;

export async function initAuth() {
  if (authInitialized) {
    console.log('[Firebase] Auth already initialized');
    return;
  }
  
  try {
    await setPersistence(auth, browserLocalPersistence);
    authInitialized = true;
    console.log('[Firebase] Persistence set to LOCAL successfully');
  } catch (error) {
    console.error('[Firebase] Failed to set auth persistence:', error);
    throw error;
  }
}
