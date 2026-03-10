import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  PlusCircle, 
  FileText, 
  MessageSquare, 
  Trophy, 
  Target, 
  TrendingUp,
  Clock
} from 'lucide-react';

export default function DashboardHome() {
  const { userData } = useAuth();
  
  // Mock data for now
  const stats = [
    { label: 'Total Quizzes', value: '12', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Average Score', value: '85%', icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Current Level', value: userData?.level || 1, icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Total XP', value: userData?.xpPoints || 0, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  const recentAttempts = [
    { id: 1, topic: 'Cell Biology', score: 90, date: '2 hours ago', difficulty: 'Medium' },
    { id: 2, topic: 'World History', score: 75, date: 'Yesterday', difficulty: 'Hard' },
    { id: 3, topic: 'Basic Calculus', score: 100, date: '3 days ago', difficulty: 'Easy' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl p-8 text-white shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-8 opacity-20">
          <Trophy className="w-64 h-64" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {userData?.name?.split(' ')[0] || 'Student'}! 👋</h1>
          <p className="text-primary-100">You're doing great. What would you like to learn today?</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link to="/dashboard/generate" className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-200 transition-all flex break-inside-avoid">
          <div className="flex-1">
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary-100 transition-all">
              <PlusCircle className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Topic Quiz</h3>
            <p className="text-sm text-gray-500">Generate a quiz from any subject or topic.</p>
          </div>
        </Link>

        <Link to="/dashboard/generate?type=pdf" className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-rose-200 transition-all flex">
          <div className="flex-1">
            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-rose-100 transition-all">
              <FileText className="w-6 h-6 text-rose-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">PDF Quiz</h3>
            <p className="text-sm text-gray-500">Upload study notes and turn them into quizzes.</p>
          </div>
        </Link>

        <Link to="/dashboard/tutor" className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex">
          <div className="flex-1">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-100 transition-all">
              <MessageSquare className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">AI Tutor</h3>
            <p className="text-sm text-gray-500">Get explanations for complex concepts and answers.</p>
          </div>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <h4 className="text-2xl font-bold text-gray-900">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-900">Recent Quizzes</h3>
          <Link to="/dashboard/performance" className="text-sm font-medium text-primary-600 hover:text-primary-700">View All</Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentAttempts.map((attempt) => (
            <div key={attempt.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{attempt.topic}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{attempt.date}</span>
                    <span>•</span>
                    <span className="capitalize">{attempt.difficulty}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                  attempt.score >= 80 ? 'bg-emerald-100 text-emerald-800' : 
                  attempt.score >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                }`}>
                  {attempt.score}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
