import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const registerUser = async (email, password, name, roleData) => {
  if (!auth) throw new Error("Firebase not initialized");
  
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Base user object
  const userData = {
    userId: user.uid,
    name,
    email,
    role: roleData.role || 'student',
    badges: [],
    createdAt: new Date().toISOString(),
    lastLoginDate: new Date().toISOString(),
    currentStreak: 1
  };

  if (roleData.role === 'student') {
    userData.level = 1;
    userData.xpPoints = 0;
  } else if (roleData.role === 'teacher') {
    userData.post = roleData.post || 'Teacher';
    userData.subjects = roleData.subjects || [];
  }
  
  
  await setDoc(doc(db, 'users', user.uid), userData);
  
  return user;
};

const formatAuthError = (error) => {
  if (!error || !error.code) return error?.message || 'Authentication failed.';

  switch (error.code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with that email.';
    case 'auth/wrong-password':
      return 'The password is incorrect. Please try again.';
    default:
      return error.message || 'Authentication failed. Please try again.';
  }
};

export const loginUser = async (email, password) => {
  if (!auth) throw new Error("Firebase not initialized");

  let userCredential;
  try {
    userCredential = await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    const message = formatAuthError(error);
    console.error('Firebase login error:', error.code, error.message);
    throw new Error(message);
  }

  try {
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    await setDoc(userDocRef, {
      lastLoginDate: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error("Error updating last login:", err);
  }

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
