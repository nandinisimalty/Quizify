import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, increment, collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { CheckCircle2, XCircle, ArrowRight, Trophy, Clock, AlertCircle } from 'lucide-react';

export default function QuizPlayer() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  
  const quiz = location.state?.quiz;
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState([]);
  const [timeLeft, setTimeLeft] = useState(60 * (quiz?.questions?.length || 5)); // 1 min per question
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!quiz) {
      navigate('/dashboard/generate');
      return;
    }
    
    if (timeLeft > 0 && !isFinished) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (timeLeft === 0 && !isFinished) {
      handleFinishQuiz();
    }
  }, [timeLeft, isFinished, quiz, navigate]);

  if (!quiz) return null;

  const currentQuestion = quiz.questions[currentQuestionIndex];

  const handleOptionSelect = (option) => {
    if (!isAnswerSubmitted) {
      setSelectedOption(option);
    }
  };

  const handleCheckAnswer = () => {
    if (!selectedOption) return;

    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    if (isCorrect) setScore(score + 1);

    setResults([...results, {
      question: currentQuestion.question,
      selectedOption,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect,
      explanation: currentQuestion.explanation
    }]);

    setIsAnswerSubmitted(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      handleFinishQuiz();
    }
  };

  const handleFinishQuiz = async () => {
    setIsFinished(true);
    
    // Calculate final score
    const finalScore = Math.round((score / quiz.questions.length) * 100);
    const xpEarned = finalScore; // 1 XP per percentage point
    
    // Save to Firestore if user is authenticated
    if (currentUser && db) {
      try {
        // Save Attempt
        await addDoc(collection(db, 'attempts'), {
          userId: currentUser.uid,
          topic: quiz.topic,
          difficulty: quiz.difficulty,
          score: finalScore,
          totalQuestions: quiz.questions.length,
          timestamp: new Date().toISOString()
        });

        // Update User XP and Level
        const newXp = (userData?.xpPoints || 0) + xpEarned;
        const newLevel = Math.floor(newXp / 100) + 1; // 100 XP per level

        await updateDoc(doc(db, 'users', currentUser.uid), {
          xpPoints: increment(xpEarned),
          level: newLevel
        });
      } catch (error) {
        console.error("Error saving quiz results:", error);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isFinished) {
    const finalPercentage = Math.round((score / quiz.questions.length) * 100);
    return (
      <div className="max-w-3xl mx-auto py-8 animate-fade-in-up">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary-100 mb-6">
            <Trophy className="w-12 h-12 text-primary-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Completed!</h2>
          <p className="text-gray-500 mb-8">You scored {score} out of {quiz.questions.length} ({finalPercentage}%)</p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors">
              Back to Dashboard
            </button>
            <button onClick={() => navigate('/dashboard/generate')} className="px-6 py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors">
              Generate Another Quiz
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900 px-2">Review Answers</h3>
          {results.map((res, idx) => (
            <div key={idx} className={`bg-white rounded-2xl p-6 border-2 shadow-sm ${res.isCorrect ? 'border-emerald-100' : 'border-red-100'}`}>
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {res.isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">{res.question}</h4>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 w-24">Your Answer:</span>
                      <span className={`font-medium ${res.isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>{res.selectedOption}</span>
                    </div>
                    {!res.isCorrect && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500 w-24">Correct Answer:</span>
                        <span className="font-medium text-emerald-700">{res.correctAnswer}</span>
                      </div>
                    )}
                  </div>
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <p className="text-sm text-blue-800"><span className="font-semibold">Explanation:</span> {res.explanation}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{quiz.topic}</h2>
          <p className="text-gray-500 text-sm">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium ${timeLeft < 60 ? 'bg-red-50 text-red-600' : 'bg-primary-50 text-primary-600'}`}>
          <Clock className="w-4 h-4" />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-100 rounded-full mb-8 overflow-hidden">
        <div 
          className="h-full bg-primary-500 transition-all duration-300" 
          style={{ width: `${((currentQuestionIndex) / quiz.questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-6">
        <h3 className="text-xl font-medium text-gray-900 mb-8 leading-relaxed">
          {currentQuestion.question}
        </h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            let stateClass = 'border-gray-200 hover:border-primary-300 hover:bg-primary-50';
            
            if (isAnswerSubmitted) {
              if (option === currentQuestion.correctAnswer) {
                stateClass = 'border-emerald-500 bg-emerald-50 text-emerald-900';
              } else if (option === selectedOption) {
                stateClass = 'border-red-500 bg-red-50 text-red-900';
              } else {
                stateClass = 'border-gray-200 opacity-50';
              }
            } else if (selectedOption === option) {
                stateClass = 'border-primary-500 bg-primary-50 ring-2 ring-primary-100';
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionSelect(option)}
                disabled={isAnswerSubmitted}
                className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all font-medium ${stateClass}`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {isAnswerSubmitted && option === currentQuestion.correctAnswer && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                  {isAnswerSubmitted && option === selectedOption && option !== currentQuestion.correctAnswer && <XCircle className="w-5 h-5 text-red-500" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Area */}
      {isAnswerSubmitted ? (
        <div className="animate-fade-in-up">
          <div className={`p-6 rounded-2xl mb-6 flex items-start gap-4 ${
            selectedOption === currentQuestion.correctAnswer ? 'bg-emerald-50 text-emerald-900 border border-emerald-100' : 'bg-red-50 text-red-900 border border-red-100'
          }`}>
            <div className="mt-1">
              {selectedOption === currentQuestion.correctAnswer ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : <XCircle className="w-6 h-6 text-red-600" />}
            </div>
            <div>
              <h4 className="font-bold mb-1">
                {selectedOption === currentQuestion.correctAnswer ? 'Correct!' : 'Incorrect'}
              </h4>
              <p className="text-sm opacity-90">{currentQuestion.explanation}</p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleNextQuestion}
              className="px-8 py-4 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-end">
          <button
            onClick={handleCheckAnswer}
            disabled={!selectedOption}
            className="px-8 py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Answer
          </button>
        </div>
      )}
    </div>
  );
}
