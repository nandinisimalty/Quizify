import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const registerUser = async (email, password, name) => {
  if (!auth) throw new Error("Firebase not initialized");
  
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Create user document in Firestore
  await setDoc(doc(db, 'users', user.uid), {
    userId: user.uid,
    name,
    email,
    level: 1,
    xpPoints: 0,
    createdAt: new Date().toISOString()
  });
  
  return user;
};

export const loginUser = async (email, password) => {
  if (!auth) throw new Error("Firebase not initialized");
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const logoutUser = async () => {
  if (!auth) throw new Error("Firebase not initialized");
  return signOut(auth);
};

export const getUserDetails = async (uid) => {
  if (!db) throw new Error("Firestore not initialized");
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  }
  return null;
};
