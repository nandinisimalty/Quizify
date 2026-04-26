import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { generateQuizQuestions } from '../services/ai';
import { Loader2, Plus, FileText, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';

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

      await addDoc(collection(db, 'quizzes'), quizData);
      
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

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      try {
        await deleteDoc(doc(db, 'quizzes', quizId));
        setSuccess("Quiz deleted successfully.");
        fetchQuizzes();
      } catch (err) {
        console.error("Delete error:", err);
        setError("Failed to delete quiz.");
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Quizzes</h1>
          <p className="text-gray-500 font-medium">Create AI-generated quizzes and manage assignments.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Create Quiz Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary-600" />
              Assign New Quiz
            </h2>
            
            {error && (
              <div className="mb-4 bg-red-50 p-3 rounded-xl flex items-start gap-2 text-red-700 text-sm border border-red-100">
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
                <label className="block text-sm font-semibold text-gray-700 mb-1">Quiz Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  placeholder="e.g. Chapter 1: Biomes"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Topic / Prompt for AI</label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  placeholder="e.g. Characteristics of Tundra biomes"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Questions</label>
                   <select
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  >
                    {[5, 10, 15, 20].map(num => (
                      <option key={num} value={num}>{num} Questions</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-white font-bold bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Generate & Assign
                    <FileText className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Quizzes Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-white">
              <h3 className="font-bold text-lg text-gray-900">Your Assigned Quizzes</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100 font-semibold">
                  <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Due Date</th>
                    <th className="px-6 py-4 text-center">Attempts</th>
                    <th className="px-6 py-4 text-center">Avg Score</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading && quizzes.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-500" />
                        Loading quizzes...
                      </td>
                    </tr>
                  ) : quizzes.length === 0 ? (
                    <tr>
                       <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
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
                            <div className="font-semibold text-gray-900">{quiz.title}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {quiz.questions?.length || 0} Qs • {quiz.difficulty}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            <span className={isPastDue ? 'text-red-500 flex items-center gap-1' : ''}>
                              {isPastDue && <AlertCircle className="w-3 h-3" />}
                              {due.toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center text-gray-600 font-medium">
                            {quiz.totalAttempts}
                          </td>
                          <td className="px-6 py-4 text-center text-gray-900 font-medium">
                            {quiz.averageScore}%
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleDeleteQuiz(quiz.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Quiz"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
