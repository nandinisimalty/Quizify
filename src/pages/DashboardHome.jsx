import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, orderBy, limit, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { 
  PlusCircle, 
  FileText, 
  MessageSquare, 
  Trophy, 
  Target, 
  TrendingUp,
  Clock,
  Play,
  Loader2,
  Award,
  Zap,
  Star,
  Medal,
  Trash2,
  XCircle
} from 'lucide-react';

export default function DashboardHome() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  
  const [assignedQuizzes, setAssignedQuizzes] = useState([]);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bonusData, setBonusData] = useState(null);

  useEffect(() => {
    if (userData?.userId && db) {
      import('../services/userLogic').then(({ processUserActivity }) => {
        processUserActivity(userData.userId, db).then(result => {
           if (result && (result.dailyBonus > 0 || result.streakBonus > 0)) {
             setBonusData(result);
             setTimeout(() => setBonusData(null), 5000); // Auto dismiss
           }
        });
      });
    }
  }, [userData?.userId]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userData || !db) return;
      
      setLoading(true);
      try {
        // 1. Fetch Assigned Quizzes (Due Date >= Now)
        const nowIso = new Date().toISOString();
        const quizzesQuery = query(
          collection(db, 'quizzes'),
          where('dueDate', '>=', nowIso)
        );
        const quizzesSnap = await getDocs(quizzesQuery);
        
        let fetchedQuizzes = [];
        quizzesSnap.forEach(doc => {
          fetchedQuizzes.push({ id: doc.id, ...doc.data() });
        });
        
        fetchedQuizzes.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        setAssignedQuizzes(fetchedQuizzes);

        // 2. Fetch Recent Attempts
        const attemptsQuery = query(
          collection(db, 'attempts'),
          where('userId', '==', userData.userId)
        );
        const attemptsSnap = await getDocs(attemptsQuery);
        
        let fetchedAttempts = [];
        attemptsSnap.forEach(doc => {
          fetchedAttempts.push({ id: doc.id, ...doc.data() });
        });

        for (let attempt of fetchedAttempts) {
           const cachedQuiz = fetchedQuizzes.find(q => q.id === attempt.quizId);
           if (cachedQuiz) {
             attempt.topic = cachedQuiz.title;
             attempt.difficulty = cachedQuiz.difficulty;
           } else {
             attempt.topic = attempt.topic || 'Custom Quiz';
             attempt.difficulty = attempt.difficulty || 'Mixed';
           }
        }

        fetchedAttempts.sort((a, b) => new Date(b.completedAt || b.timestamp) - new Date(a.completedAt || a.timestamp));
        setRecentAttempts(fetchedAttempts); // Keep all for badge checking, slice for UI later

        // 3. Fetch Leaderboard (Top 5 Students by XP)
        const leaderQuery = query(
          collection(db, 'users'),
          where('role', '==', 'student'),
          orderBy('xpPoints', 'desc'),
          limit(5)
        );
        const leaderSnap = await getDocs(leaderQuery);
        const leaders = [];
        leaderSnap.forEach(doc => leaders.push({ id: doc.id, ...doc.data() }));
        setLeaderboard(leaders);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userData]);

  const handleStartQuiz = (quiz) => {
    navigate('/dashboard/play', { 
      state: { 
        quiz: {
          id: quiz.id,
          questions: quiz.questions, 
          topic: quiz.title, 
          difficulty: quiz.difficulty,
          sourceType: 'assigned'
        }
      } 
    });
  };

  const handleClearAttempts = async () => {
    if (!window.confirm("Are you sure you want to clear all your attempts?")) return;
    try {
      setLoading(true);
      const attemptsQuery = query(
        collection(db, 'attempts'),
        where('userId', '==', userData.userId)
      );
      const snapshot = await getDocs(attemptsQuery);
      
      const deletePromises = snapshot.docs.map(docSnapshot => 
        deleteDoc(doc(db, 'attempts', docSnapshot.id))
      );
      await Promise.all(deletePromises);
      
      await updateDoc(doc(db, 'users', userData.userId), {
        xpPoints: 0,
        level: 1
      });
      
      setRecentAttempts([]);
      window.location.reload();
    } catch (error) {
      console.error("Error deleting attempts:", error);
      alert("Failed to clear attempts.");
    } finally {
      setLoading(false);
    }
  };

  const currentLevel = userData?.level || 1;
  const currentXP = userData?.xpPoints || 0;
  
  const getLevelThresholds = (level) => {
    if (level === 1) return { min: 0, max: 100 };
    if (level === 2) return { min: 100, max: 250 };
    if (level === 3) return { min: 250, max: 500 };
    if (level === 4) return { min: 500, max: 1000 };
    return { min: 1000, max: 1000 };
  };

  const thresholds = getLevelThresholds(currentLevel);
  let progressPercent = 100;
  
  if (currentLevel < 5) {
    const levelRange = thresholds.max - thresholds.min;
    const xpInCurrentLevel = currentXP - thresholds.min;
    progressPercent = Math.min(100, Math.max(0, (xpInCurrentLevel / levelRange) * 100));
  }

  const uiAttempts = recentAttempts.slice(0, 5);
  const avgScore = recentAttempts.length > 0 
    ? Math.round(recentAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / recentAttempts.length)
    : 0;

  // Gamification: Evaluate Badges
  const hasFirstQuiz = recentAttempts.length > 0;
  const hasPerfectScore = recentAttempts.some(a => a.score === 100);
  const hasWeeklyStreak = (userData?.currentStreak || 0) >= 7;
  const isDedicated = currentLevel >= 5;

  const badges = [
    { title: 'First Steps', icon: Zap, earned: hasFirstQuiz, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { title: 'Perfect 100', icon: Target, earned: hasPerfectScore, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: '7-Day Streak', icon: Clock, earned: hasWeeklyStreak, color: 'text-coral-600', bg: 'bg-coral-100' },
    { title: 'Scholar Lvl 5', icon: Star, earned: isDedicated, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 pb-12">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-primary-100 to-primary-200 rounded-3xl p-6 md:p-10 overflow-hidden shadow-sm border border-primary-200/50">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-8 opacity-10">
          <Trophy className="w-48 h-48 md:w-64 md:h-64 text-primary-900" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-extrabold text-primary-900 mb-2 md:mb-4 tracking-tight">
              Welcome back, {userData?.name?.split(' ')[0] || 'Student'}!
            </h1>
            <p className="text-primary-700 text-lg mb-6">You're on a {userData?.currentStreak || 1} day learning streak! 🔥</p>
            
            {/* XP Bar */}
            <div className="bg-white/50 p-5 rounded-2xl backdrop-blur-md border border-white/40">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-sm font-bold text-primary-700 uppercase tracking-wider mb-1">Current Level</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-primary-900">{currentLevel}</span>
                    <span className="text-primary-600 font-medium">({currentXP} Total XP)</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-primary-900">
                    {currentLevel < 5 ? `${currentXP} / ${thresholds.max} XP` : `${currentXP} XP (Max Level)`}
                  </span>
                  {currentLevel < 5 && <p className="text-xs text-primary-600">to Level {currentLevel + 1}</p>}
                </div>
              </div>
              <div className="w-full h-3 bg-primary-900/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="bg-white/50 backdrop-blur-md px-8 py-6 rounded-2xl border border-white/40 text-center shrink-0">
             <p className="text-sm font-bold text-primary-700 uppercase tracking-wider mb-2">Daily Streak</p>
             <div className="flex items-center justify-center gap-3 mb-4">
               <span className="text-6xl font-extrabold text-primary-900 drop-shadow-md">{userData?.currentStreak || 1}</span>
               <span className="text-4xl animate-bounce">🔥</span>
             </div>
             <div className="flex gap-1.5 justify-center mb-2">
               {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                 const currentStreak = userData?.currentStreak || 1;
                 const effectiveDays = currentStreak % 7 === 0 && currentStreak > 0 ? 7 : currentStreak % 7;
                 const isActive = day <= effectiveDays;
                 return (
                   <div key={day} className={`w-6 h-6 rounded-full flex items-center justify-center ${isActive ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]' : 'bg-primary-200/50'}`}>
                     <span className={`text-[10px] ${isActive ? 'opacity-100' : 'opacity-30 grayscale'}`}>🔥</span>
                   </div>
                 );
               })}
             </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link to="/dashboard/generate" className="group bg-white p-6 rounded-2xl border-2 border-transparent shadow-sm hover:shadow-lg hover:border-primary-300 transition-all flex btn-bouncy">
          <div className="flex-1">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <PlusCircle className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Topic Quiz</h3>
            <p className="text-sm text-gray-500 font-medium">Generate a quiz from any subject or topic.</p>
          </div>
        </Link>

        <Link to="/dashboard/generate?type=pdf" className="group bg-white p-6 rounded-2xl border-2 border-transparent shadow-sm hover:shadow-lg hover:border-rose-300 transition-all flex btn-bouncy">
          <div className="flex-1">
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-rose-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">PDF Quiz</h3>
            <p className="text-sm text-gray-500 font-medium">Upload study notes and turn them into quizzes.</p>
          </div>
        </Link>

        <Link to="/dashboard/tutor" className="group bg-white p-6 rounded-2xl border-2 border-transparent shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all flex btn-bouncy">
          <div className="flex-1">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">AI Tutor</h3>
            <p className="text-sm text-gray-500 font-medium">Get explanations for complex concepts and answers.</p>
          </div>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Left Column (2 spans): Assigned Quizzes & Badges */}
        <div className="lg:col-span-2 flex flex-col gap-6 md:gap-8 order-1">
          
          {/* Assigned Quizzes */}
          <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-secondary-500" />
                Assigned Quizzes
              </h3>
            </div>
            <div className="overflow-y-auto divide-y divide-gray-100 max-h-96">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-secondary-500" />
                  Checking for assignments...
                </div>
              ) : assignedQuizzes.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">All caught up! No assigned quizzes pending.</p>
                </div>
              ) : (
                assignedQuizzes.map((quiz) => {
                  const due = new Date(quiz.dueDate);
                  return (
                    <div key={quiz.id} className="p-6 hover:bg-gray-50 transition-colors group">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-extrabold text-lg text-gray-900 mb-1">{quiz.title}</h4>
                          <p className="text-sm font-medium text-gray-500 mb-2">{quiz.topic}</p>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-xs font-bold text-secondary-600 bg-secondary-50 px-2 py-1 rounded-md">
                              <Clock className="w-3 h-3" />
                              Due: {due.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleStartQuiz(quiz)}
                          className="shrink-0 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm hover:shadow-md flex items-center gap-2 btn-bouncy"
                        >
                          Start
                          <Play className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Active Badges */}
          <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-sm p-6 flex flex-col">
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-amber-500" />
              Your Badges
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {badges.map((badge, i) => (
                <div key={i} className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                  badge.earned ? 'bg-white border-gray-100 shadow-sm' : 'bg-gray-50 border-transparent opacity-50 grayscale'
                }`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${badge.earned ? badge.bg : 'bg-gray-200'}`}>
                    <badge.icon className={`w-6 h-6 ${badge.earned ? badge.color : 'text-gray-400'}`} />
                  </div>
                  <span className="text-xs font-bold text-center text-gray-700">{badge.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Class Leaderboard & Recent Activity */}
        <div className="flex flex-col gap-6 md:gap-8 order-2">
          
          {/* Class Leaderboard */}
          <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
               <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                 <Medal className="w-5 h-5 text-yellow-500" />
                 Class Leaderboard
               </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {loading ? (
                 <div className="p-8 text-center text-gray-500">
                   <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-500" />
                 </div>
              ) : leaderboard.length === 0 ? (
                 <div className="p-6 text-center text-gray-500 text-sm">No students yet.</div>
              ) : (
                leaderboard.map((student, idx) => (
                  <div key={student.id} className={`px-6 py-4 flex items-center gap-4 ${student.id === userData?.userId ? 'bg-primary-50/50' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                      idx === 1 ? 'bg-gray-200 text-gray-700' :
                      idx === 2 ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 truncate">
                      <p className={`font-bold truncate text-sm ${student.id === userData?.userId ? 'text-primary-700' : 'text-gray-900'}`}>
                        {student.name} {student.id === userData?.userId && '(You)'}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">Lvl {student.level || 1}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-primary-600 text-sm">{student.xpPoints || 0} XP</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                 <TrendingUp className="w-5 h-5 text-primary-500" />
                 Recent Attempts
              </h3>
              {recentAttempts.length > 0 && (
                <button 
                  onClick={handleClearAttempts}
                  className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </button>
              )}
            </div>
            <div className="overflow-y-auto divide-y divide-gray-100 max-h-96">
              {uiAttempts.length === 0 ? (
                 <div className="p-8 text-center text-gray-500 h-full flex items-center justify-center">
                   <p className="font-medium text-sm">No attempts yet.</p>
                 </div>
              ) : (
                uiAttempts.map((attempt) => (
                  <div key={attempt.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shadow-inner">
                        <Target className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{attempt.topic}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mt-0.5">
                          <span className="capitalize">{attempt.difficulty}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-extrabold border-2 ${
                        attempt.score >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                        attempt.score >= 60 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {attempt.score}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Bonus Popups */}
      {bonusData && (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4 pointer-events-none">
          {bonusData.dailyBonus > 0 && (
            <div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-xl flex items-center gap-4 animate-fade-in-up pointer-events-auto">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">+{bonusData.dailyBonus} XP Daily Bonus</h4>
              </div>
            </div>
          )}
          {bonusData.streakBonus > 0 && (
            <div className="bg-white border border-orange-100 rounded-2xl p-4 shadow-xl flex items-center gap-4 animate-fade-in-up delay-100 pointer-events-auto">
              <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-lg">
                🔥
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{bonusData.newStreak} Day Streak! +{bonusData.streakBonus} XP</h4>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CheckCircle2(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}
