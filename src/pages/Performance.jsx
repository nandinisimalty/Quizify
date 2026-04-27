import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Trophy, Star, Target, TrendingUp, Award, Zap, Clock, BookOpen, ChevronRight, Activity, BarChart2, Trash2 } from 'lucide-react';

export default function Performance() {
  const { currentUser, userData } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || !db) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const q = query(
      collection(db, 'attempts'),
      where('userId', '==', currentUser.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAttempts(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching attempts:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin text-primary-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Analyzing your progress...</p>
        </div>
      </div>
    );
  }

  const totalQuizzes = attempts.length;
  const avgScore = totalQuizzes > 0 ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / totalQuizzes) : 0;
  const highestScore = totalQuizzes > 0 ? Math.max(...attempts.map(a => a.score)) : 0;

  // Group by quiz
  const quizStats = attempts.reduce((acc, attempt) => {
    const title = attempt.topic || 'Custom Quiz';
    if (!acc[title]) {
      acc[title] = { title, count: 0, totalScore: 0 };
    }
    acc[title].count += 1;
    acc[title].totalScore += attempt.score;
    return acc;
  }, {});

  const quizWiseData = Object.values(quizStats).map(q => ({
    ...q,
    avgScore: Math.round(q.totalScore / q.count)
  }));

  const stats = [
    { label: 'Average Score', value: `${avgScore}%`, icon: TrendingUp, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Quizzes Done', value: totalQuizzes.toString(), icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Highest Score', value: `${highestScore}%`, icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const handleDeleteAttempt = async (attemptId) => {
    if (!window.confirm("Are you sure you want to delete this attempt? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'attempts', attemptId));
      // State is updated automatically via onSnapshot
    } catch (error) {
      console.error("Error deleting attempt:", error);
      alert("Failed to delete attempt. Please try again.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 pb-10 px-4 md:px-0">
      
      {/* Header Section */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Performance Analytics</h1>
        <p className="text-gray-500 text-base md:text-lg">
          Detailed insights into your learning journey and quiz attempts.
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Activity */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                 <Activity className="w-5 h-5 text-primary-500" />
                 Recent Attempts
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {attempts.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <p className="font-medium text-sm italic">No attempts yet. Play a quiz to see your scores!</p>
                </div>
              ) : (
                attempts.map((attempt) => (
                  <div key={attempt.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                        <Target className="w-5 h-5 text-primary-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-900">{attempt.topic || 'Custom Quiz'}</h4>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                          {new Date(attempt.timestamp?.toDate ? attempt.timestamp.toDate() : attempt.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold ${
                          attempt.score >= 80 ? 'bg-emerald-50 text-emerald-700' : 
                          attempt.score >= 60 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {attempt.score}%
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteAttempt(attempt.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
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

          {/* Quiz-wise Performance */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                 <BarChart2 className="w-5 h-5 text-primary-500" />
                 Topic-wise Performance
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4">
                {quizWiseData.length === 0 ? (
                  <p className="text-center text-gray-500 py-4 italic text-sm">No data available yet.</p>
                ) : (
                  quizWiseData.map((quiz, i) => (
                    <div key={i} className="p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-gray-900">{quiz.title}</h4>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">{quiz.count} attempts</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs font-bold text-gray-400 uppercase">Avg Score</p>
                          <p className="text-lg font-extrabold text-gray-900">{quiz.avgScore}%</p>
                        </div>
                        <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              quiz.avgScore >= 80 ? 'bg-emerald-500' : 
                              quiz.avgScore >= 60 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${quiz.avgScore}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Best Performance */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-purple-500" />
              Best Performance
            </h3>
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-10 h-10 text-purple-600" />
              </div>
              <h4 className="text-3xl font-extrabold text-gray-900 mb-1">{highestScore}%</h4>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Highest Ever Score</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


