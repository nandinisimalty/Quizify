import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { Trophy, Star, Target, TrendingUp, Award, Zap } from 'lucide-react';

export default function Performance() {
  const { currentUser, userData } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttempts = async () => {
      if (!currentUser || !db) return setLoading(false);
      
      try {
        const q = query(
          collection(db, 'attempts'),
          where('userId', '==', currentUser.uid),
          orderBy('timestamp', 'asc')
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Mock data if empty for demonstration
        if (data.length === 0) {
          setAttempts([
            { topic: 'History', score: 60, timestamp: '2023-10-01T10:00:00Z' },
            { topic: 'Science', score: 80, timestamp: '2023-10-02T10:00:00Z' },
            { topic: 'Math', score: 75, timestamp: '2023-10-05T10:00:00Z' },
            { topic: 'History', score: 90, timestamp: '2023-10-08T10:00:00Z' },
          ]);
        } else {
          setAttempts(data);
        }
      } catch (error) {
        console.error("Error fetching attempts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, [currentUser]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading performance data...</div>;
  }

  // Calculate stats
  const totalQuizzes = attempts.length;
  const avgScore = totalQuizzes > 0 ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / totalQuizzes) : 0;
  
  // Topic-wise averages
  const topicStats = {};
  attempts.forEach(a => {
    if (!topicStats[a.topic]) topicStats[a.topic] = { total: 0, count: 0 };
    topicStats[a.topic].total += a.score;
    topicStats[a.topic].count += 1;
  });
  
  const topicData = Object.keys(topicStats).map(t => ({
    name: t,
    score: Math.round(topicStats[t].total / topicStats[t].count)
  }));

  // Progress over time
  const progressData = attempts.map((a, i) => ({
    name: `Quiz ${i + 1}`,
    score: a.score
  }));

  const badges = [
    { name: 'First Quiz', icon: Star, color: 'text-amber-500', bg: 'bg-amber-100', earned: totalQuizzes > 0 },
    { name: 'Perfect Score', icon: Award, color: 'text-emerald-500', bg: 'bg-emerald-100', earned: attempts.some(a => a.score === 100) },
    { name: 'Quiz Master (10+)', icon: Zap, color: 'text-purple-500', bg: 'bg-purple-100', earned: totalQuizzes >= 10 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up pb-12">
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance & Analytics</h1>
        <p className="text-gray-500">Track your learning progress and view your achievements.</p>
      </div>

      {/* Gamification Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-primary-900 rounded-3xl p-8 text-white shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 opacity-10 translate-x-12 -translate-y-12">
          <Trophy className="w-96 h-96" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-white/20 shadow-inner">
              <span className="text-4xl font-bold text-white">{userData?.level || 1}</span>
            </div>
            <div>
              <p className="text-indigo-200 font-medium tracking-wide uppercase text-sm mb-1">Current Level</p>
              <h2 className="text-4xl font-extrabold text-white mb-2">Level {userData?.level || 1} Scholar</h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium backdrop-blur-sm border border-white/10">
                  {userData?.xpPoints || 0} Total XP
                </span>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-1/3 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10">
            <div className="flex justify-between text-sm mb-2 font-medium text-indigo-100">
              <span>Progress to level { (userData?.level || 1) + 1}</span>
              <span>{(userData?.xpPoints || 0) % 100} / 100 XP</span>
            </div>
            <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]" 
                style={{ width: `${(userData?.xpPoints || 0) % 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-all group">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Target className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Quizzes</p>
            <h3 className="text-3xl font-bold text-gray-900">{totalQuizzes}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-all group">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Average Score</p>
            <h3 className="text-3xl font-bold text-gray-900">{avgScore}%</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-all group">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Star className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Badges Earned</p>
            <h3 className="text-3xl font-bold text-gray-900">{badges.filter(b => b.earned).length} / {badges.length}</h3>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Progress Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Score Timeline</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{stroke: '#e5e7eb', strokeWidth: 2, strokeDasharray: '3 3'}}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="var(--color-primary-500)" 
                  strokeWidth={4}
                  dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
                  activeDot={{ r: 6, fill: 'var(--color-primary-500)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Topic Breakdown */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Subject Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="score" fill="var(--color-primary-500)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Badges and Achievements */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Achievements</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((badge, idx) => (
            <div key={idx} className={`p-6 rounded-2xl flex flex-col items-center text-center transition-all ${
              badge.earned ? 'bg-white border-2 border-primary-100 shadow-sm' : 'bg-gray-50 border-2 border-transparent opacity-60 grayscale'
            }`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${badge.bg}`}>
                <badge.icon className={`w-8 h-8 ${badge.color}`} />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">{badge.name}</h4>
              <p className="text-xs text-gray-500">{badge.earned ? 'Unlocked!' : 'Locked'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
