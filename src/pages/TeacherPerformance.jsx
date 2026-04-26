import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Presentation, Loader2, Filter } from 'lucide-react';

export default function TeacherPerformance() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [studentsData, setStudentsData] = useState([]);
  const [quizSummaries, setQuizSummaries] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState('All');
  
  useEffect(() => {
    if (!currentUser || !db) return;

    let quizzesMap = {};
    let attemptsList = [];

    const computeData = () => {
      const performanceRecords = [];
      const quizStatsMap = {}; 

      Object.values(quizzesMap).forEach(q => {
        quizStatsMap[q.id] = { totalScore: 0, attemptCount: 0, title: q.title };
      });

      attemptsList.forEach(attempt => {
        const quiz = quizzesMap[attempt.quizId];
        
        if (quiz) {
          performanceRecords.push({
            id: attempt.id,
            studentName: attempt.studentName || 'Unknown Student',
            userId: attempt.userId,
            quizTitle: quiz.title,
            quizId: quiz.id,
            score: attempt.score,
            completedAt: attempt.completedAt || attempt.timestamp || new Date().toISOString()
          });

          if (quizStatsMap[attempt.quizId]) {
            quizStatsMap[attempt.quizId].totalScore += attempt.score;
            quizStatsMap[attempt.quizId].attemptCount++;
          }
        }
      });

      performanceRecords.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
      setStudentsData(performanceRecords);

      const summaries = Object.values(quizStatsMap).map(stats => ({
        title: stats.title,
        totalAttempts: stats.attemptCount,
        averageScore: stats.attemptCount > 0 ? Math.round(stats.totalScore / stats.attemptCount) : 0
      })).filter(s => s.totalAttempts > 0);

      setQuizSummaries(summaries);
      setLoading(false);
    };

    const unsubQuizzes = onSnapshot(query(collection(db, 'quizzes'), where('createdBy', '==', currentUser.uid)), (snap) => {
      const newQuizzesMap = {};
      snap.forEach(doc => { newQuizzesMap[doc.id] = { id: doc.id, ...doc.data() }; });
      quizzesMap = newQuizzesMap;
      computeData();
    });

    const unsubAttempts = onSnapshot(collection(db, 'attempts'), (snap) => {
      attemptsList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      computeData();
    });

    return () => {
      unsubQuizzes();
      unsubAttempts();
    };
  }, [currentUser]);

  const filteredData = selectedQuiz === 'All' 
    ? studentsData 
    : studentsData.filter(record => record.quizTitle === selectedQuiz);

  const uniqueQuizTitles = [...new Set(studentsData.map(r => r.quizTitle))];

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 pb-12 px-4 md:px-0">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">Class Performance</h1>
          <p className="text-gray-500 text-sm md:font-medium">Monitor your students' latest quiz attempts in real-time.</p>
        </div>
      </div>

      {!loading && quizSummaries.length > 0 && (
        <div className="mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Quiz Summaries</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizSummaries.map((summary, index) => (
              <div key={index} className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
                <h3 className="font-semibold text-gray-800 line-clamp-1" title={summary.title}>{summary.title}</h3>
                <div className="flex justify-between text-xs md:text-sm mt-1 md:mt-2">
                  <span className="text-gray-500">Attempts:</span>
                  <span className="font-bold text-primary-600">{summary.totalAttempts}</span>
                </div>
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-gray-500">Avg Score:</span>
                  <span className="font-bold text-primary-600">{summary.averageScore}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <h3 className="font-bold text-lg text-gray-900">Recent Submissions</h3>
           <div className="flex items-center gap-2">
             <Filter className="w-4 h-4 text-primary-400" />
             <select 
                value={selectedQuiz}
                onChange={(e) => setSelectedQuiz(e.target.value)}
                className="px-3 py-1.5 border border-primary-200 rounded-xl text-sm bg-primary-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none text-primary-900 font-medium"
             >
               <option value="All">All Quizzes</option>
               {uniqueQuizTitles.map((title, i) => (
                 <option key={i} value={title}>{title}</option>
               ))}
             </select>
           </div>
        </div>
        
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100 font-semibold">
              <tr>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Quiz Title</th>
                <th className="px-6 py-4 text-center">Score</th>
                <th className="px-6 py-4">Completed On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-500" />
                    Fetching real-time data...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    <Presentation className="w-10 h-10 mx-auto mb-3 text-primary-200" />
                    No submissions yet.
                  </td>
                </tr>
              ) : (
                filteredData.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">{record.studentName}</td>
                    <td className="px-6 py-4 text-gray-600">{record.quizTitle}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-lg font-bold text-xs ${
                        record.score >= 80 ? 'bg-primary-50 text-primary-700' :
                        record.score >= 60 ? 'bg-primary-50 text-primary-600' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {record.score}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(record.completedAt).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-gray-100">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-500" />
              Loading data...
            </div>
          ) : filteredData.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Presentation className="w-10 h-10 mx-auto mb-3 text-primary-200" />
              No submissions yet.
            </div>
          ) : (
            filteredData.map((record) => (
              <div key={record.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-gray-900">{record.studentName}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{record.quizTitle}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-lg font-bold text-[10px] ${
                    record.score >= 80 ? 'bg-primary-50 text-primary-700' :
                    record.score >= 60 ? 'bg-primary-50 text-primary-600' :
                    'bg-red-50 text-red-700'
                  }`}>
                    {record.score}%
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 font-medium">
                  Completed on {new Date(record.completedAt).toLocaleDateString()} at {new Date(record.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
