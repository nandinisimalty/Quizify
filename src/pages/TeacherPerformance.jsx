import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Users, Award, TrendingUp, Presentation, Loader2 } from 'lucide-react';

export default function TeacherPerformance() {
  const [loading, setLoading] = useState(true);
  const [studentsData, setStudentsData] = useState([]);
  
  useEffect(() => {
    const fetchClassPerformance = async () => {
      setLoading(true);
      try {
        // 1. Fetch all students
        const usersRef = collection(db, 'users');
        const studentsQuery = query(usersRef, where('role', '==', 'student'));
        const studentsSnap = await getDocs(studentsQuery);
        
        const studentsMap = {};
        studentsSnap.forEach(doc => {
          studentsMap[doc.id] = { id: doc.id, ...doc.data() };
        });

        // 2. Fetch all quizzes to map quizId -> title
        const quizzesRef = collection(db, 'quizzes');
        const quizzesSnap = await getDocs(quizzesRef);
        
        const quizzesMap = {};
        quizzesSnap.forEach(doc => {
          quizzesMap[doc.id] = { id: doc.id, ...doc.data() };
        });

        // 3. Fetch all attempts
        const attemptsRef = collection(db, 'attempts');
        const attemptsSnap = await getDocs(attemptsRef);
        
        const performanceRecords = [];
        
        attemptsSnap.forEach(doc => {
          const attempt = doc.data();
          const student = studentsMap[attempt.userId];
          const quiz = quizzesMap[attempt.quizId];
          
          if (student && quiz) {
            performanceRecords.push({
              id: doc.id,
              studentName: student.name,
              userId: student.id,
              quizTitle: quiz.title,
              quizId: quiz.id,
              score: attempt.score,
              completedAt: attempt.completedAt || attempt.timestamp || new Date().toISOString()
            });
          }
        });

        // Sort by completion date descending
        performanceRecords.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
        
        setStudentsData(performanceRecords);
      } catch (err) {
        console.error("Error fetching class performance:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClassPerformance();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up pb-12">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Class Performance</h1>
          <p className="text-gray-500 font-medium">Monitor your students' latest quiz attempts.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
           <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
             <TrophyIcon className="w-5 h-5 text-secondary-500" />
             Recent Submissions
           </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100 font-bold">
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
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-secondary-500" />
                    Crunching numbers...
                  </td>
                </tr>
              ) : studentsData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    <Presentation className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                    No recent submissions found.
                  </td>
                </tr>
              ) : (
                studentsData.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{record.studentName}</td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{record.quizTitle}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center px-3 py-1 bg-white border-2 rounded-xl font-extrabold ${
                        record.score >= 80 ? 'text-emerald-600 border-emerald-200' :
                        record.score >= 60 ? 'text-amber-600 border-amber-200' :
                        'text-rose-600 border-rose-200'
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
      </div>
    </div>
  );
}

// Simple Helper Icon
function TrophyIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
      <path d="M4 22h16"></path>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
    </svg>
  );
}
