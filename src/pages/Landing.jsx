import { Link } from 'react-router-dom';
import { Brain, FileText, Trophy, Target, ArrowRight, CheckCircle2, BookOpen } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary-100 selection:text-primary-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--color-primary-100),_transparent_40%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-sm font-medium mb-8 animate-fade-in-up">
              <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-pulse"></span>
              AI-Powered Learning Platform
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
              Learn Smarter with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">AI Generated Quizzes</span>
            </h1>
            <p className="text-lg text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              Transform your study materials into interactive quizzes instantly. Generate questions from topics or upload PDFs, track your learning progress, and boost retention with gamified learning.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="w-full sm:w-auto px-8 py-4 rounded-full bg-gray-900 text-white font-medium hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2">
                Get Started for Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/login" className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-gray-700 font-medium hover:bg-gray-50 border border-gray-200 transition-all shadow-sm flex items-center justify-center">
                Log In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-surface max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 rounded-3xl shadow-sm border border-gray-100 mb-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Supercharge your study sessions</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Everything you need to master your subjects faster and retain information longer.</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { tag: 'AI Quiz Generator', desc: 'Instantly create customized quizzes from any topic.', icon: Brain, color: 'bg-indigo-50 text-indigo-600' },
            { tag: 'Upload PDFs', desc: 'Extract key concepts from your study notes and documents.', icon: FileText, color: 'bg-rose-50 text-rose-600' },
            { tag: 'Instant Feedback', desc: 'Get detailed explanations for every right and wrong answer.', icon: Target, color: 'bg-emerald-50 text-emerald-600' },
            { tag: 'Gamified Progress', desc: 'Earn XP, unlock achievements, and level up your knowledge.', icon: Trophy, color: 'bg-amber-50 text-amber-600' }
          ].map((feature, i) => (
            <div key={i} className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-md hover:bg-white transition-all group">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${feature.color}`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.tag}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-primary-600" />
            <span className="font-bold text-lg text-gray-900">Quizify</span>
          </div>
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Quizify AI. Built for the modern student.</p>
        </div>
      </footer>
    </div>
  );
}
