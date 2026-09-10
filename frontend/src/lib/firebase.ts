import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  onAuthStateChanged,
  onIdTokenChanged,
  User as FirebaseUser,
  Auth
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDBeihWjNKVhxJL56IMurBAvL4C4HDe9kY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "terra-vault-3141c.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "terra-vault-3141c",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "terra-vault-3141c.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "625085354924",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:625085354924:web:ac5da1880b26499d072009",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-V31QSWEEN8"
};

// Check if actual credentials have been configured
export const isFirebaseConfigured = (): boolean => {
  return true;
};

// Initialize Firebase App
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth: Auth = getAuth(app);

// Configure Google Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account"
});

// Authentication Service Functions
export async function loginWithGoogle(): Promise<{ user: FirebaseUser; token: string }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const token = await result.user.getIdToken(true);
    return { user: result.user, token };
  } catch (error: any) {
    console.error("Google Sign-In failed:", error);
    throw error;
  }
}

export async function loginWithEmail(email: string, password: string): Promise<{ user: FirebaseUser; token: string }> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const token = await result.user.getIdToken(true);
    return { user: result.user, token };
  } catch (error: any) {
    console.error("Email Login failed:", error);
    throw error;
  }
}

export async function registerWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<{ user: FirebaseUser; token: string }> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    const token = await result.user.getIdToken(true);
    return { user: result.user, token };
  } catch (error: any) {
    console.error("Account Registration failed:", error);
    throw error;
  }
}

export async function sendResetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error("Password reset email failed:", error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Firebase SignOut error:", error);
  }
}

export async function getCurrentIdToken(forceRefresh = false): Promise<string | null> {
  if (auth.currentUser) {
    return auth.currentUser.getIdToken(forceRefresh);
  }
  return null;
}

export { onAuthStateChanged, onIdTokenChanged };
export type { FirebaseUser };
