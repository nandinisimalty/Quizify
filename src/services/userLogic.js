import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';

// Helper to calculate level based on XP
export const calculateLevel = (xp) => {
  if (xp >= 1000) return 5;
  if (xp >= 500) return 4;
  if (xp >= 250) return 3;
  if (xp >= 100) return 2;
  return 1;
};

export const processUserActivity = async (userId, db) => {
  if (!userId || !db) return null;

  try {
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);
    
    if (!docSnap.exists()) return null;
    
    const data = docSnap.data();
    const today = new Date().toISOString().split('T')[0];
    
    const lastActive = data.lastActiveDate?.split('T')[0] || data.lastLoginDate?.split('T')[0];
    const lastBonus = data.lastBonusDate?.split('T')[0];
    
    let currentStreak = data.currentStreak || 0;
    let currentXp = data.xpPoints || 0;
    
    let earnedDailyBonus = false;
    let earnedStreakBonus = 0;
    
    let updates = {};
    let isModified = false;
    
    // 1. Daily Streak Logic
    if (lastActive) {
      const lastDate = new Date(lastActive);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Logged in yesterday
        if (today !== lastActive) {
            currentStreak += 1;
            updates.currentStreak = currentStreak;
            updates.lastActiveDate = new Date().toISOString();
            isModified = true;
        }
      } else if (diffDays > 1) {
        // Missed a day
        currentStreak = 1;
        updates.currentStreak = currentStreak;
        updates.lastActiveDate = new Date().toISOString();
        isModified = true;
      } else {
          // diffDays === 0 (already active today)
      }
    } else {
      // First time ever
      currentStreak = 1;
      updates.currentStreak = currentStreak;
      updates.lastActiveDate = new Date().toISOString();
      isModified = true;
    }
    
    // 2. Daily XP Bonus
    if (lastBonus !== today) {
      currentXp += 20;
      earnedDailyBonus = true;
      updates.lastBonusDate = new Date().toISOString();
      isModified = true;
    }
    
    // 3. Streak Bonus XP
    // Check if the streak milestone was hit TODAY and bonus wasn't already given
    const streakMilestones = data.streakMilestones || [];
    
    if (currentStreak === 3 && !streakMilestones.includes(3)) {
      earnedStreakBonus = 30;
      currentXp += 30;
      streakMilestones.push(3);
      updates.streakMilestones = streakMilestones;
      isModified = true;
    } else if (currentStreak === 5 && !streakMilestones.includes(5)) {
      earnedStreakBonus = 50;
      currentXp += 50;
      streakMilestones.push(5);
      updates.streakMilestones = streakMilestones;
      isModified = true;
    } else if (currentStreak === 7 && !streakMilestones.includes(7)) {
      earnedStreakBonus = 100;
      currentXp += 100;
      streakMilestones.push(7);
      updates.streakMilestones = streakMilestones;
      isModified = true;
    } else if (currentStreak < 3) {
      // Reset milestones if streak broke
      if (streakMilestones.length > 0) {
          updates.streakMilestones = [];
          isModified = true;
      }
    }
    
    // Calculate new level if XP changed
    if (earnedDailyBonus || earnedStreakBonus > 0) {
      updates.xpPoints = currentXp;
      const newLevel = calculateLevel(currentXp);
      if (newLevel !== data.level) {
        updates.level = newLevel;
      }
    }
    
    // Save if modified
    if (isModified) {
      await updateDoc(userDocRef, updates);
    }
    
    return {
      dailyBonus: earnedDailyBonus ? 20 : 0,
      streakBonus: earnedStreakBonus,
      newStreak: currentStreak,
      totalNewXp: currentXp,
      levelUpTo: updates.level || null
    };

  } catch (error) {
    console.error("Error processing user activity:", error);
    return null;
  }
};
