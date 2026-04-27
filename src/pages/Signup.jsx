import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/auth';
import { BookOpen, UserPlus, AlertCircle, GraduationCap, Briefcase, ArrowRight } from 'lucide-react';

export default function Signup() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Role specific state
  const [role, setRole] = useState('student'); // 'student' | 'teacher'
  const [post, setPost] = useState('');
  const [subjectsInput, setSubjectsInput] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleNextStep = (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const subjects = subjectsInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
      
      const roleData = {
        role,
        post: role === 'teacher' ? post : undefined,
        subjects: role === 'teacher' ? subjects : undefined
      };

      await registerUser(email, password, name, roleData);
      
      // Redirect based on role
      if (role === 'teacher') {
        navigate('/teacher-dashboard');
      } else {
        navigate('/dashboard');
      }
      
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to create an account. Please try again.');
      setStep(1); // Go back if Firebase auth fails (e.g., email already in use)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNlN2UzZWEiLz48L3N2Zz4=')]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up">
        <div className="flex justify-center">
          <div className="bg-gradient-to-tr from-primary-600 to-primary-400 p-3 rounded-2xl shadow-lg border-2 border-primary-200 transform -rotate-3">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
          Join Quizify
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Supercharge your learning journey today.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="bg-white py-6 px-4 md:py-8 shadow-xl sm:rounded-3xl sm:px-10 border border-gray-100">
          
          {/* Step Indicators */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full transition-colors ${step === 1 ? 'bg-primary-500 scale-125' : 'bg-primary-200'}`}></div>
              <div className={`w-3 h-3 rounded-full transition-colors ${step === 2 ? 'bg-primary-500 scale-125' : 'bg-primary-200'}`}></div>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-accent-50 p-4 rounded-xl flex items-center gap-3 text-accent-700 text-sm border border-accent-100">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {step === 1 ? (
            <form className="space-y-5" onSubmit={handleNextStep}>
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-gray-700">Full Name</label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 appearance-none block w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-gray-50"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-bold text-gray-700">Email address</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 appearance-none block w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-gray-50"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-bold text-gray-700">Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-gray-50"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-2 appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-gray-50"
                  placeholder="••••••••"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex justify-center items-center gap-2 py-2.5 md:py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-200"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-6 animate-fade-in-up" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-4 text-center text-lg">I am joining as a...</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                      role === 'student' ? 'border-primary-500 bg-primary-50 ring-4 ring-primary-100' : 'border-gray-200 bg-white hover:border-primary-300'
                    }`}
                  >
                    <div className={`p-3 rounded-full ${role === 'student' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'}`}>
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-gray-900">Student</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('teacher')}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                      role === 'teacher' ? 'border-secondary-500 bg-secondary-50 ring-4 ring-secondary-100' : 'border-gray-200 bg-white hover:border-secondary-300'
                    }`}
                  >
                    <div className={`p-3 rounded-full ${role === 'teacher' ? 'bg-secondary-100 text-secondary-600' : 'bg-gray-100 text-gray-500'}`}>
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-gray-900">Teacher</span>
                  </button>
                </div>
              </div>

              {role === 'teacher' && (
                <div className="space-y-5 bg-secondary-50 p-5 rounded-2xl border border-secondary-100 animate-fade-in-up">
                  <div>
                    <label htmlFor="post" className="block text-sm font-bold text-gray-700">What is your title/post?</label>
                    <input
                      id="post"
                      type="text"
                      required
                      value={post}
                      onChange={(e) => setPost(e.target.value)}
                      className="mt-2 appearance-none block w-full px-4 py-2.5 md:py-3 border border-secondary-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary-500 transition-all bg-white"
                      placeholder="e.g. High School Science Teacher, Professor"
                    />
                  </div>
                  <div>
                    <label htmlFor="subjects" className="block text-sm font-bold text-gray-700">Subjects you teach</label>
                    <p className="text-xs text-gray-500 mb-2">Comma separated</p>
                    <input
                      id="subjects"
                      type="text"
                      required
                      value={subjectsInput}
                      onChange={(e) => setSubjectsInput(e.target.value)}
                      className="appearance-none block w-full px-4 py-2.5 md:py-3 border border-secondary-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary-500 transition-all bg-white"
                      placeholder="e.g. Math, Physics, Chemistry"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 md:py-3 border border-gray-300 rounded-xl shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 flex justify-center items-center gap-2 py-2.5 md:py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white focus:outline-none focus:ring-4 disabled:opacity-70 disabled:cursor-not-allowed ${
                    role === 'teacher' ? 'bg-secondary-500 hover:bg-secondary-600 focus:ring-secondary-200' : 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-200'
                  }`}
                >
                  {loading ? 'Creating...' : (
                    <>
                      Create Account
                      <UserPlus className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 text-center pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-primary-600 hover:text-primary-500 hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
