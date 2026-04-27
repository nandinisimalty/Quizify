import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-primary-50 p-2 rounded-lg group-hover:bg-primary-100 transition-colors">
              <BookOpen className="w-5 h-5 text-primary-600" />
            </div>
            <span className="font-bold text-lg tracking-tight text-gray-900">Quizify</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-500 hover:text-primary-600 text-sm font-semibold transition-colors">
              Log in
            </Link>
            <Link to="/signup" className="px-5 py-2 rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 transition-all shadow-sm active:scale-95">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

