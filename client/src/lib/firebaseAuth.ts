// Firebase authentication helpers (from blueprint:firebase_barebones_javascript)
import { signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut as firebaseSignOut, onAuthStateChanged, type User } from "firebase/auth";
import { auth, googleProvider } from "./firebase";

// Call this function when the user clicks on the "Login" button
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
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      
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
