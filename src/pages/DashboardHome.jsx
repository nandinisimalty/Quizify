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
  Trash2,
  CheckCircle2,
  Activity,
  ChevronRight
} from 'lucide-react';

export default function DashboardHome() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  
  const [assignedQuizzes, setAssignedQuizzes] = useState([]);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userData || !db) return;
      
      setLoading(true);
      try {
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
        setRecentAttempts(fetchedAttempts);

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

  const badges = [
    { title: 'First Steps', icon: Zap, earned: recentAttempts.length > 0, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { title: 'Perfect 100', icon: Target, earned: recentAttempts.some(a => a.score === 100), color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Scholar Lvl 5', icon: Star, earned: currentLevel >= 5, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const avgScore = recentAttempts.length > 0 
    ? Math.round(recentAttempts.reduce((sum, a) => sum + a.score, 0) / recentAttempts.length) 
    : 0;

  const stats = [
    { label: 'Total XP', value: currentXP.toString(), icon: Zap, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Quizzes Attempted', value: recentAttempts.length.toString(), icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Average Score', value: `${avgScore}%`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const handleDeleteAttempt = async (attemptId) => {
    if (!window.confirm("Are you sure you want to delete this attempt? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'attempts', attemptId));
      
      // Update local state for immediate feedback
      setRecentAttempts(prev => prev.filter(a => a.id !== attemptId));
    } catch (error) {
      console.error("Error deleting attempt:", error);
      alert("Failed to delete attempt. Please try again.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 pb-10 px-4 md:px-0">
      
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col justify-center">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Welcome back, {userData?.name?.split(' ')[0] || 'Student'}! 👋</h1>
        <p className="text-gray-500 text-base md:text-lg">
          Ready to level up your knowledge today?
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 mb-1 tracking-wide uppercase">{stat.label}</p>
              <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link 
          to="/dashboard/generate" 
          className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all text-center flex flex-col items-center justify-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
            <PlusCircle className="w-6 h-6 text-primary-600" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-2">Topic Quiz</h3>
          <p className="text-sm text-gray-500">Generate a quiz from any subject or topic.</p>
        </Link>

        <Link 
          to="/dashboard/generate?type=pdf" 
          className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all text-center flex flex-col items-center justify-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center mb-4 group-hover:bg-rose-100 transition-colors">
            <FileText className="w-6 h-6 text-rose-500" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-2">PDF Quiz</h3>
          <p className="text-sm text-gray-500">Upload study notes and turn them into quizzes.</p>
        </Link>

        <Link 
          to="/dashboard/tutor" 
          className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all text-center flex flex-col items-center justify-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
            <MessageSquare className="w-6 h-6 text-indigo-500" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-2">AI Tutor</h3>
          <p className="text-sm text-gray-500">Get explanations for complex concepts and answers.</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: XP & Quizzes */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* XP Progress Card */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">XP Progress</h3>
                <p className="text-sm text-gray-500">You're doing great! Keep going.</p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-bold">
                  Level {currentLevel}
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-gray-900">{currentXP} XP</span>
                {currentLevel < 5 && (
                  <span className="text-gray-400">{thresholds.max - currentXP} XP to level {currentLevel + 1}</span>
                )}
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Available Quizzes */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                 <FileText className="w-5 h-5 text-primary-500" />
                 Available Quizzes
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {loading ? (
                <div className="p-12 text-center text-gray-500">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-200" />
                  <p className="font-medium text-sm">Loading quizzes...</p>
                </div>
              ) : assignedQuizzes.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <p className="font-medium text-sm italic">No quizzes available right now. Check back later!</p>
                </div>
              ) : (
                assignedQuizzes.map((quiz) => (
                  <div key={quiz.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                        <Play className="w-5 h-5 text-primary-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-900">{quiz.title}</h4>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">Due: {new Date(quiz.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleStartQuiz(quiz)}
                      className="px-5 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-all flex items-center gap-2 shadow-sm"
                    >
                      START
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                 <Activity className="w-5 h-5 text-primary-500" />
                 Recent Activity
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {loading ? (
                <div className="p-12 text-center text-gray-500">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-200" />
                  <p className="font-medium text-sm">Loading activity...</p>
                </div>
              ) : recentAttempts.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <p className="font-medium text-sm italic">No recent activity. Try your first quiz!</p>
                </div>
              ) : (
                recentAttempts.slice(0, 5).map((attempt) => (
                  <div key={attempt.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                        <Target className="w-5 h-5 text-primary-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-900">{attempt.topic || 'Custom Quiz'}</h4>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                          {new Date(attempt.completedAt || attempt.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                          attempt.score >= 80 ? 'bg-emerald-50 text-emerald-700' : 
                          attempt.score >= 60 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {attempt.score}%
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteAttempt(attempt.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                        title="Delete attempt"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Badges */}
        <div className="space-y-8">
          {/* Badges Section */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Achievements
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {badges.map((badge, i) => (
                <div key={i} className={`flex items-center gap-4 p-3 rounded-2xl border border-gray-50 ${badge.earned ? 'bg-white' : 'bg-gray-50/50 grayscale opacity-50'}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${badge.earned ? badge.bg : 'bg-gray-100'}`}>
                    <badge.icon className={`w-6 h-6 ${badge.earned ? badge.color : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{badge.title}</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {badge.earned ? 'Unlocked' : 'Locked'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


