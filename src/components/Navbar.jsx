import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-[12px] bg-surface/80 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105">
            <div className="bg-primary-500 p-2 rounded-xl">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">Quizify</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Log in
            </Link>
            <Link to="/signup" className="px-5 py-2.5 rounded-full bg-primary-600 text-white font-medium hover:bg-primary-700 transition-all shadow-sm hover:shadow-md active:scale-95">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
