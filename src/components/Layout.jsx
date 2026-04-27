import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../services/auth';
import { 
  LayoutDashboard, 
  PlusCircle, 
  MessageSquare, 
  BarChart2, 
  LogOut, 
  BookOpen,
  Menu
} from 'lucide-react';

export default function DashboardLayout() {
  const { userData } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Generate Quiz', path: '/dashboard/generate', icon: PlusCircle },
    { name: 'AI Tutor', path: '/dashboard/tutor', icon: MessageSquare },
    { name: 'Performance', path: '/dashboard/performance', icon: BarChart2 },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-gray-200 flex flex-col transform transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center px-6 border-b border-gray-200 shrink-0">
          <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2">
            <div className="bg-primary-500 p-1.5 rounded-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">Quizify</span>
          </Link>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-gray-200 shrink-0">
          <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-gray-50">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold shrink-0">
              {userData?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-semibold text-gray-900 truncate">{userData?.name || 'User'}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500 truncate mt-0.5">
                <span className="font-bold text-primary-600">Lvl {userData?.level || 1}</span>
                <span>•</span>
                <span className="font-bold text-amber-500">{userData?.xpPoints || 0} XP</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-600" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        
        {/* Mobile Top Header */}
        <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-4 md:hidden shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-primary-500 p-1.5 rounded-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">Quizify</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto w-full p-4 md:p-8">
          <Outlet />
        </main>

      </div>
    </div>
  );
}
