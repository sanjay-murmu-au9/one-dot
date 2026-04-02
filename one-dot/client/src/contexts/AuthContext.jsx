import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Initialize user profile in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: userCredential.user.email,
      active_wallpaper_url: null,
      createdAt: new Date().toISOString()
    });
    return userCredential;
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const isNative = window.Capacitor?.isNativePlatform?.() ?? false;
    if (isNative) {
      await signInWithRedirect(auth, provider);
      return;
    }
    const userCredential = await signInWithPopup(auth, provider);
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: userCredential.user.email,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return userCredential;
  }

  useEffect(() => {
    // Handle redirect result on app load (for native Android)
    getRedirectResult(auth).then(async (result) => {
      if (result?.user) {
        await setDoc(doc(db, 'users', result.user.uid), {
          email: result.user.email,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
    }).catch(() => {});

    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
