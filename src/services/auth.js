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
  
  // Create user document in Firestore
  await setDoc(doc(db, 'users', user.uid), userData);
  
  return user;
};

export const loginUser = async (email, password) => {
  if (!auth) throw new Error("Firebase not initialized");
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  
  // Update last login date for streak checking
  try {
    const today = new Date().toISOString().split('T')[0];
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    const docSnap = await getDoc(userDocRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const lastLogin = data.lastLoginDate?.split('T')[0];
      
      let newStreak = data.currentStreak || 0;
      
      if (lastLogin) {
        const lastDate = new Date(lastLogin);
        const currentDate = new Date(today);
        const diffTime = Math.abs(currentDate - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1; // reset streak
        }
      } else {
         newStreak = 1;
      }
      
      await setDoc(userDocRef, { 
        lastLoginDate: new Date().toISOString(),
        currentStreak: newStreak
      }, { merge: true });
    }
  } catch (err) {
    console.error("Error updating streak:", err);
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
