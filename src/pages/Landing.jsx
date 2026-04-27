import { Link } from 'react-router-dom';
import { Brain, FileText, Trophy, Target, ArrowRight, BookOpen } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white selection:bg-primary-100 selection:text-primary-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-40 md:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-6">
              Master your subjects with interactive quizzes
            </h1>
            <p className="text-base text-gray-400 mb-10 leading-relaxed">
              Transform study notes into personalized quizzes instantly. 
              Track your progress and stay consistent with your learning.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login" className="w-full sm:w-auto px-8 py-3 rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 transition-all shadow-sm flex items-center justify-center gap-2">
                Student Login
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/login" className="w-full sm:w-auto px-8 py-3 rounded-xl bg-white text-gray-500 text-sm font-bold hover:bg-gray-50 border border-gray-100 transition-all flex items-center justify-center">
                Teacher Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 border-t border-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { title: 'Smart Generation', desc: 'Quizzes from any topic.', icon: Brain, color: 'text-primary-600' },
              { title: 'PDF Analysis', desc: 'Notes to study material.', icon: FileText, color: 'text-rose-500' },
              { title: 'Clear Goals', desc: 'Targeted practice.', icon: Target, color: 'text-emerald-500' },
              { title: 'Achievements', desc: 'Track your growth.', icon: Trophy, color: 'text-amber-500' }
            ].map((feature, i) => (
              <div key={i} className="text-center">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 mx-auto bg-gray-50">
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <h3 className="text-xs font-bold text-gray-900 mb-1 uppercase tracking-wider">{feature.title}</h3>
                <p className="text-[13px] text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4 opacity-50 grayscale">
            <BookOpen className="w-4 h-4 text-primary-600" />
            <span className="font-bold text-sm text-gray-900">Quizify</span>
          </div>
          <p className="text-gray-400 text-[10px] uppercase tracking-widest font-medium">© {new Date().getFullYear()} Quizify • Built for focus</p>
        </div>
      </footer>
    </div>
  );
}


