import { auth, googleProvider } from '../service/firebaseconfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '../service/firebaseconfig';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const signUp = async (email, password) => {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Error signing up with email and password", error);
  }
};

export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const userDocRef = doc(firestore, "users", user.uid);
      // Create new user document
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        createdAt: new Date()
      });
   
    alert("User signed in successfully");
  } catch (error) {
    console.error("Error signing in with email and password", error);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const user = userCredential.user;
    const userDocRef = doc(firestore, "users", user.uid);
      // Create new user document
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        createdAt: new Date()
      });
    alert("User signed in with Google");
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};


export const useSignOut = () => {
  const navigate = useNavigate();

  const signOutUser = async () => {
    try {
      await signOut(auth);
      alert('User signed out');
      navigate('/'); // Navigate to homepage
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return signOutUser;
};
