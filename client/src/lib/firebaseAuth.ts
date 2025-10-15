// Firebase authentication helpers (from blueprint:firebase_barebones_javascript)
import { 
  signInWithRedirect, 
  getRedirectResult, 
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
  return await signInWithEmailAndPassword(auth, email, password);
}

// Email/password sign up
export async function signUpWithEmail(email: string, password: string) {
  return await createUserWithEmailAndPassword(auth, email, password);
}

// Google sign in
export function signInWithGoogle() {
  signInWithRedirect(auth, googleProvider);
}

// Call this function on page load to handle redirect result
export async function handleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      // The signed-in user info
      const user = result.user;
      
      // Try to get credential from Google
      const googleCredential = GoogleAuthProvider.credentialFromResult(result);
      const token = googleCredential?.accessToken;
      
      return { user, token };
    }
    return null;
  } catch (error: any) {
    console.error('Firebase redirect error:', error);
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
