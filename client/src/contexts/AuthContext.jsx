import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  deleteUser
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

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  async function deleteAccount() {
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    try {
      // Get user's ID token
      const token = await currentUser.getIdToken();

      // Call backend API to delete account
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://one-dot.onrender.com';
      console.log('[DeleteAccount] Using API URL:', apiBaseUrl);
      console.log('[DeleteAccount] Full endpoint:', `${apiBaseUrl}/api/auth/delete-account`);

      const response = await fetch(`${apiBaseUrl}/api/auth/delete-account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('[DeleteAccount] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[DeleteAccount] Error response:', errorData);
        throw new Error(errorData.error || 'Failed to delete account');
      }

      // Delete user from Firebase Auth (client-side)
      await deleteUser(currentUser);

      return true;
    } catch (error) {
      console.error('[DeleteAccount] Error details:', error);
      throw error;
    }
  }

  async function loginWithGoogle() {
    try {
      console.log('[AuthContext] Creating Google provider...');
      const provider = new GoogleAuthProvider();

      console.log('[AuthContext] Calling signInWithPopup...');
      const userCredential = await signInWithPopup(auth, provider);

      console.log('[AuthContext] Sign-in successful, user:', userCredential.user.email);
      console.log('[AuthContext] Saving user to Firestore...');

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      console.log('[AuthContext] User saved successfully');
      return userCredential;
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
      console.error('[AuthContext] Error code:', error.code);
      console.error('[AuthContext] Error message:', error.message);
      throw error;
    }
  }

  useEffect(() => {
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
    logout,
    resetPassword,
    deleteAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
