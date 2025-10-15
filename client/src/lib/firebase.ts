// Firebase configuration and initialization (from blueprint:firebase_barebones_javascript)
import { initializeApp } from "firebase/app";
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

console.log('[Firebase] Initializing with config:', {
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId
});

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

console.log('[Firebase] Auth initialized');

// Set persistence to LOCAL so auth state persists across page refreshes
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('[Firebase] Persistence set to LOCAL successfully');
  })
  .catch((error) => {
    console.error('[Firebase] Failed to set auth persistence:', error);
  });

export const googleProvider = new GoogleAuthProvider();
