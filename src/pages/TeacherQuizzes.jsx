import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { generateQuizQuestions } from '../services/ai';
import { Loader2, Plus, FileText, AlertCircle, CheckCircle2, Users } from 'lucide-react';

export default function TeacherQuizzes() {
  const { currentUser } = useAuth();
  
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('Medium');
  const [dueDate, setDueDate] = useState('');

  // Fetch Teacher's Quizzes
  const fetchQuizzes = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'quizzes'), where('createdBy', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      const fetchedQuizzes = [];
      const now = new Date();

      querySnapshot.forEach((doc) => {
        fetchedQuizzes.push({ id: doc.id, ...doc.data() });
      });

      // Fetch attempt stats for each quiz
      const quizzesWithStats = await Promise.all(fetchedQuizzes.map(async (quiz) => {
        const attemptsQuery = query(collection(db, 'attempts'), where('quizId', '==', quiz.id));
        const attemptsSnap = await getDocs(attemptsQuery);
        let totalScore = 0;
        let attemptCount = 0;
        attemptsSnap.forEach(doc => {
          totalScore += doc.data().score || 0;
          attemptCount++;
        });
        
        return {
          ...quiz,
          totalAttempts: attemptCount,
          averageScore: attemptCount > 0 ? Math.round(totalScore / attemptCount) : 0
        };
      }));

      // Sort by creation date descending
      quizzesWithStats.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setQuizzes(quizzesWithStats);
    } catch (err) {
      console.error("Error fetching quizzes:", err);
      setError("Failed to load quizzes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [currentUser]);

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    if (!title || !topic || !numQuestions || !dueDate) {
      setError("Please fill all required fields.");
      return;
    }

    setIsCreating(true);
    setError('');
    setSuccess('');

    try {
      // 1. Generate questions via AI
      const aiResponse = await generateQuizQuestions({
        topic,
        numQuestions: parseInt(numQuestions),
        difficulty
      });

      if (!aiResponse || !aiResponse.questions || aiResponse.questions.length === 0) {
        throw new Error("AI failed to generate valid questions. Try another topic.");
      }

      // 2. Add to Firestore DB
      const quizData = {
        title,
        topic,
        questions: aiResponse.questions,
        difficulty,
        dueDate: new Date(dueDate).toISOString(),
        createdBy: currentUser.uid,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'quizzes'), quizData);
      
      // Update UI
      setSuccess("Quiz successfully created and assigned!");
      fetchQuizzes();
      
      // Reset Form
      setTitle('');
      setTopic('');
      setDueDate('');

    } catch (err) {
      console.error("Creation Error:", err);
      setError(err.message || "Failed to create quiz.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up pb-12">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Manage Quizzes</h1>
          <p className="text-gray-500 font-medium">Create AI-generated quizzes and track class attempts.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Create Quiz Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-secondary-500" />
              Assign New Quiz
            </h2>
            
            {error && (
              <div className="mb-4 bg-accent-50 p-3 rounded-xl flex items-start gap-2 text-accent-700 text-sm border border-accent-100">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 bg-emerald-50 p-3 rounded-xl flex items-start gap-2 text-emerald-700 text-sm border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{success}</p>
              </div>
            )}

            <form onSubmit={handleCreateQuiz} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Quiz Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all"
                  placeholder="e.g. Chapter 1: Biomes"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Topic / Prompt for AI</label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all"
                  placeholder="e.g. Characteristics of Tundra biomes"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Questions</label>
                   <select
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all"
                  >
                    {[5, 10, 15, 20].map(num => (
                      <option key={num} value={num}>{num} Questions</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-white font-bold bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 transition-all btn-bouncy disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating with AI...
                  </>
                ) : (
                  <>
                    Generate & Assign
                    <FileText className="w-5 h-5 ml-1" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Quizzes Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-900">Your Assigned Quizzes</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100 font-bold">
                  <tr>
                    <th className="px-6 py-4">Quiz Title & Info</th>
                    <th className="px-6 py-4">Due Date</th>
                    <th className="px-6 py-4 text-center">Attempts</th>
                    <th className="px-6 py-4 text-center">Avg Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading && quizzes.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-secondary-500" />
                        Loading quizzes...
                      </td>
                    </tr>
                  ) : quizzes.length === 0 ? (
                    <tr>
                       <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                        <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                        No quizzes created yet. Use the form to generate one!
                      </td>
                    </tr>
                  ) : (
                    quizzes.map((quiz) => {
                      const due = new Date(quiz.dueDate);
                      const isPastDue = due < new Date();
                      
                      return (
                        <tr key={quiz.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900 mb-1">{quiz.title}</div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200">
                                {quiz.questions?.length || 0} Qs
                              </span>
                              <span className={`px-2 py-0.5 rounded-full border ${
                                quiz.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                quiz.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-rose-50 text-rose-700 border-rose-200'
                              }`}>
                                {quiz.difficulty}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600 font-medium">
                            <span className={isPastDue ? 'text-rose-500 flex items-center gap-1' : ''}>
                              {isPastDue && <AlertCircle className="w-3 h-3" />}
                              {due.toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="inline-flex items-center justify-center bg-blue-50 text-blue-700 font-bold w-10 h-10 rounded-xl">
                              {quiz.totalAttempts}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                             <div className="inline-flex items-center justify-center font-extrabold text-gray-900">
                              {quiz.averageScore}%
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
