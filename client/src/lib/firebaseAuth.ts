// Firebase authentication helpers (from blueprint:firebase_barebones_javascript)
import { 
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  type User 
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";

// Email/password sign in
export async function signInWithEmail(email: string, password: string) {
  console.log('[firebaseAuth] Signing in with email:', email);
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('[firebaseAuth] Sign in successful:', result.user.email);
    return result;
  } catch (error) {
    console.error('[firebaseAuth] Sign in error:', error);
    throw error;
  }
}

// Email/password sign up
export async function signUpWithEmail(email: string, password: string) {
  console.log('[firebaseAuth] Signing up with email:', email);
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log('[firebaseAuth] Sign up successful:', result.user.email);
    return result;
  } catch (error) {
    console.error('[firebaseAuth] Sign up error:', error);
    throw error;
  }
}

// Google sign in with POPUP (works better in Replit's iframe environment)
export async function signInWithGoogle() {
  console.log('[firebaseAuth] Starting Google sign-in popup');
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log('[firebaseAuth] Google sign-in successful:', result.user.email);
    return result;
  } catch (error) {
    console.error('[firebaseAuth] Google sign-in error:', error);
    throw error;
  }
}

// Sign out
export async function signOut() {
  await firebaseSignOut(auth);
}

// Listen to auth state changes
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
