import {
  signInAnonymously,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  linkWithPopup,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "./client";

/**
 * Initializes anonymous authentication seamlessly.
 * Ensures every visitor immediately has a persistent guest identity in Cloud Firestore.
 */
export async function initAnonymousAuth(): Promise<User | null> {
  if (typeof window === "undefined") return null;

  try {
    if (auth.currentUser) {
      return auth.currentUser;
    }
    const userCred = await signInAnonymously(auth);
    return userCred.user;
  } catch (error) {
    console.error("TasteMem: Failed to sign in anonymously with Firebase Auth", error);
    return null;
  }
}

/**
 * Subscribe to Auth state changes.
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  if (typeof window === "undefined") return () => {};
  return onAuthStateChanged(auth, callback);
}

/**
 * Optional: Link anonymous guest account with Google Provider for cross-device sync.
 */
export async function linkWithGoogle(): Promise<User | null> {
  if (!auth.currentUser) return null;
  const provider = new GoogleAuthProvider();
  try {
    const cred = await linkWithPopup(auth.currentUser, provider);
    return cred.user;
  } catch (err: any) {
    if (err.code === "auth/credential-already-in-use") {
      // Sign in directly with Google
      const cred = await signInWithPopup(auth, provider);
      return cred.user;
    }
    console.error("TasteMem: Failed to link Google account", err);
    throw err;
  }
}
