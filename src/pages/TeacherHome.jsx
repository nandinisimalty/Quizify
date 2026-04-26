import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, TrendingUp, Activity, Target, Presentation } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function TeacherHome() {
  const { currentUser, userData } = useAuth();
  
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [quizzesCreated, setQuizzesCreated] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || !db) return;

    let quizzesMap = {};
    let attemptsList = [];
    let unsubQuizzes, unsubAttempts;

    const computeStats = () => {
      let totalScore = 0;
      let attemptCount = 0;
      const recentList = [];

      attemptsList.forEach(attempt => {
        const quiz = quizzesMap[attempt.quizId];
        
        if (quiz) {
          attemptCount++;
          totalScore += attempt.score;
          recentList.push({
            id: attempt.id,
            studentName: attempt.studentName || 'Unknown Student',
            quizTitle: quiz.title,
            score: attempt.score,
            completedAt: attempt.completedAt || attempt.timestamp || new Date().toISOString()
          });
        }
      });

      recentList.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
      setRecentAttempts(recentList.slice(0, 5)); // Top 5 recent

      setQuizzesCreated(Object.keys(quizzesMap).length);
      setTotalAttempts(attemptCount);
      setAvgScore(attemptCount > 0 ? Math.round(totalScore / attemptCount) : 0);
      setLoading(false);
    };

    unsubQuizzes = onSnapshot(query(collection(db, 'quizzes'), where('createdBy', '==', currentUser.uid)), (snap) => {
      const newQuizzesMap = {};
      snap.forEach(doc => { newQuizzesMap[doc.id] = { id: doc.id, ...doc.data() }; });
      quizzesMap = newQuizzesMap;
      computeStats();
    });

    unsubAttempts = onSnapshot(collection(db, 'attempts'), (snap) => {
      attemptsList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      computeStats();
    });

    return () => {
      unsubQuizzes();
      unsubAttempts();
    };
  }, [currentUser]);

  const stats = [
    { label: 'Total Quizzes Created', value: loading ? '...' : quizzesCreated.toString(), icon: FileText, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Total Attempts', value: loading ? '...' : totalAttempts.toString(), icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Average Score', value: loading ? '...' : `${avgScore}%`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 pb-10 px-4 md:px-0">
      
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col justify-center">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Welcome back, {userData?.name || 'Teacher'}! 👋</h1>
        <p className="text-gray-500 text-base md:text-lg">
          Here's an overview of your quizzes and student performance.
        </p>
      </div>

      {/* Stats */}
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

      {/* Recent Activity */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col mt-4 md:mt-8">
        <div className="px-4 py-4 md:px-6 md:py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
             <TrendingUp className="w-5 h-5 text-primary-500" />
             Recent Class Activity
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {loading ? (
             <div className="p-8 text-center text-gray-500 h-full flex items-center justify-center">
               <p className="font-medium text-sm">Loading activity...</p>
             </div>
          ) : recentAttempts.length === 0 ? (
             <div className="p-8 text-center text-gray-500 h-full flex flex-col items-center justify-center">
               <Presentation className="w-10 h-10 mb-3 text-primary-200" />
               <p className="font-medium text-sm">No attempts yet. Your students haven't played any quizzes.</p>
             </div>
          ) : (
            recentAttempts.map((attempt) => (
              <div key={attempt.id} className="px-4 py-3 md:px-6 md:py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{attempt.studentName}</h4>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">Completed: {attempt.quizTitle}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold ${
                    attempt.score >= 80 ? 'bg-emerald-50 text-emerald-700' : 
                    attempt.score >= 60 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
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
  );
}
