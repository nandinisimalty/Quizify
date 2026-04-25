import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, FileText, CheckCircle2, TrendingUp, Presentation } from 'lucide-react';
import Mascot from '../components/Mascot';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';

export default function TeacherHome() {
  const { currentUser, userData } = useAuth();
  
  const [totalStudents, setTotalStudents] = useState(0);
  const [quizzesCreated, setQuizzesCreated] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherStats = async () => {
      if (!currentUser || !db) return setLoading(false);
      
      try {
        // 1. Total Students Profile Query
        const studentsQuery = query(collection(db, 'users'), where('role', '==', 'student'));
        const studentsSnapshot = await getCountFromServer(studentsQuery);
        setTotalStudents(studentsSnapshot.data().count);

        // 2. Quizzes Created Query
        const quizzesQuery = query(collection(db, 'quizzes'), where('createdBy', '==', currentUser.uid));
        const quizzesDocs = await getDocs(quizzesQuery);
        setQuizzesCreated(quizzesDocs.size);
        
        // Extract quiz IDs to fetch attempts for these specific quizzes
        const quizIds = quizzesDocs.docs.map(doc => doc.id);

        // 3. Average Class Score
        if (quizIds.length > 0) {
          // Note: Firestore 'in' queries support up to 10 array items. Limit or batch for large scale.
          // For simplicity in this intermediate version, we'll fetch all attempts and filter, 
          // or chunk queries if there are many quizzes.
          let totalScore = 0;
          let attemptCount = 0;
          
          // Chunk quizIds into arrays of 10 to respect Firestore 'in' limits
          for (let i = 0; i < quizIds.length; i += 10) {
            const chunk = quizIds.slice(i, i + 10);
            const attemptsQuery = query(collection(db, 'attempts'), where('quizId', 'in', chunk));
            const attemptsDocs = await getDocs(attemptsQuery);
            
            attemptsDocs.forEach(doc => {
              totalScore += doc.data().score || 0;
              attemptCount++;
            });
          }

          if (attemptCount > 0) {
            setAvgScore(Math.round(totalScore / attemptCount));
          } else {
            setAvgScore(0);
          }
        } else {
          setAvgScore(0);
        }

      } catch (error) {
        console.error("Error fetching teacher stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherStats();
  }, [currentUser]);

  const stats = [
    { label: 'Total Students', value: loading ? '...' : totalStudents.toString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Quizzes Created', value: loading ? '...' : quizzesCreated.toString(), icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Avg Class Score', value: loading ? '...' : `${avgScore}%`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up pb-10">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-3xl p-8 text-white shadow-xl overflow-hidden relative flex flex-col md:flex-row items-center gap-8 justify-between border-b-4 border-secondary-700">
        <div className="absolute top-0 right-0 opacity-10 translate-x-12 -translate-y-12">
          <Presentation className="w-96 h-96" />
        </div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm font-bold mb-4 shadow-sm">
            <CheckCircle2 className="w-4 h-4" />
            Teacher Dashboard
          </div>
          <h1 className="text-4xl font-extrabold mb-2">Welcome back, {userData?.post || 'Teacher'} {userData?.name?.split(' ')[0]}! 📚</h1>
          <p className="text-secondary-100 text-lg">
            Teaching {userData?.subjects?.join(', ') || 'various subjects'}. Ready to inspire your students today?
          </p>
        </div>

        <div className="relative z-10 bg-white/10 p-4 rounded-full backdrop-blur-md border border-white/20">
           <Mascot mood="happy" size="lg" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border-2 border-gray-100 flex items-center gap-5 hover:border-secondary-300 hover:shadow-md transition-all group card-bouncy">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${stat.bg}`}>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 mb-1">{stat.label}</p>
              <h3 className="text-4xl font-extrabold text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h3 className="font-extrabold text-xl text-gray-900">Recent Class Activity</h3>
        </div>
        <div className="p-8 text-center">
          <p className="text-gray-500">Analytics tracking will appear here as students complete your assigned quizzes.</p>
        </div>
      </div>
    </div>
  );
}
