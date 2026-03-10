import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { generateQuizQuestions } from '../services/ai';
import { extractTextFromPDF } from '../services/pdf';
import { 
  FileText, 
  Lightbulb, 
  Settings2, 
  Loader2, 
  AlertCircle,
  Upload
} from 'lucide-react';

export default function GenerateQuiz() {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') === 'pdf' ? 'pdf' : 'topic';
  const [type, setType] = useState(initialType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Form State
  const [topic, setTopic] = useState('');
  const [file, setFile] = useState(null);
  const [difficulty, setDifficulty] = useState('Medium');
  const [numQuestions, setNumQuestions] = useState(5);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);

    try {
      let textContent = null;
      let finalTopic = topic;

      if (type === 'pdf') {
        if (!file) throw new Error("Please upload a PDF document first.");
        textContent = await extractTextFromPDF(file);
        finalTopic = file.name.replace('.pdf', '');
      } else {
        if (!topic.trim()) throw new Error("Please enter a topic.");
      }

      const generatedData = await generateQuizQuestions({
        topic: finalTopic,
        textContent,
        difficulty,
        numQuestions: parseInt(numQuestions)
      });

      // Navigate to the player with the generated data
      // For a real app, we might save it to Firestore first and navigate to the Quiz ID
      navigate('/dashboard/play', { 
        state: { 
          quiz: { 
            topic: finalTopic,
            difficulty,
            questions: generatedData.questions,
            sourceType: type
          } 
        }
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to generate quiz. Please check your API key and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create a New Quiz</h1>
        <p className="text-gray-500">Generate personalized questions from any topic or document.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setType('topic')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors ${
              type === 'topic' 
                ? 'border-b-2 border-primary-600 text-primary-600 bg-primary-50/50' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Lightbulb className="w-5 h-5" />
            Topic Based
          </button>
          <button
            onClick={() => setType('pdf')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors ${
              type === 'pdf' 
                ? 'border-b-2 border-primary-600 text-primary-600 bg-primary-50/50' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-5 h-5" />
            PDF Document
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8">
          {error && (
            <div className="mb-6 bg-red-50 p-4 rounded-xl flex items-start gap-3 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Input Types */}
            {type === 'topic' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What do you want to learn about?
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., The French Revolution, React Hooks, Cellular Respiration"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-gray-900"
                  required={type === 'topic'}
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Study Document
                </label>
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 text-gray-400 mb-3" />
                    <p className="mb-1 text-sm text-gray-600">
                      <span className="font-semibold text-primary-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PDF documents only (Max 10 pages)</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="application/pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                    required={type === 'pdf'}
                  />
                </label>
                {file && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg">
                    <FileText className="w-4 h-4" />
                    <span className="font-medium truncate">{file.name}</span>
                  </div>
                )}
              </div>
            )}

            {/* Settings */}
            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-gray-400" />
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-900"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-gray-400" />
                  Number of Questions
                </label>
                <select
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-900"
                >
                  <option value="5">5 Questions</option>
                  <option value="10">10 Questions</option>
                  <option value="15">15 Questions</option>
                </select>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-primary-600 text-white font-bold text-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Generating Magic...
                  </>
                ) : (
                  <>
                    <Lightbulb className="w-6 h-6" />
                    Generate Quiz
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
