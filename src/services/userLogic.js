import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';

// Helper to calculate level based on XP
export const calculateLevel = (xp) => {
  if (xp >= 1000) return 5;
  if (xp >= 500) return 4;
  if (xp >= 250) return 3;
  if (xp >= 100) return 2;
  return 1;
};


