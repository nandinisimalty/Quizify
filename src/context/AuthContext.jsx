import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If auth is not initialized (e.g., config missing), just stop loading
    if (!auth) {
      setLoading(false);
      return;
    }

    let userUnsubscribe = null;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        if (db) {
          const userDocRef = doc(db, 'users', user.uid);
          userUnsubscribe = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
              setUserData({ userId: docSnap.id, ...docSnap.data() });
            }
          });
        } else {
          // Fallback if db is not available
          try {
            const { getUserDetails } = await import('../services/auth');
            const data = await getUserDetails(user.uid);
            setUserData(data);
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
        }
      } else {
        setUserData(null);
        if (userUnsubscribe) {
          userUnsubscribe();
          userUnsubscribe = null;
        }
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (userUnsubscribe) userUnsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    userData,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
