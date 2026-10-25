import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBjx1Hw_LLPCN98m2jGQKyktnLgxO0JMWs",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "weekendsahal.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "weekendsahal",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "weekendsahal.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1059415279275",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1059415279275:web:3c894783c9754fda1e59ee",
};

// Initialize Firebase App as Singleton
export const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firebase Auth & Firestore instances
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
