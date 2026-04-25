import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../services/auth';
import { 
  Users, 
  Settings, 
  FileText, 
  LogOut, 
  BookOpen,
  Briefcase
} from 'lucide-react';

export default function TeacherLayout() {
  const { userData } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const menuItems = [
    { name: 'Dashboard', path: '/teacher-dashboard', icon: Briefcase },
    { name: 'Manage Quizzes', path: '/teacher-dashboard/quizzes', icon: FileText },
    { name: 'Class Performance', path: '/teacher-dashboard/students', icon: Users },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-secondary-200 flex flex-col shadow-sm">
        <div className="h-16 flex items-center px-6 border-b border-secondary-100 bg-secondary-50/50">
          <Link to="/teacher-dashboard" className="flex items-center gap-2 transition-transform hover:scale-105">
            <div className="bg-secondary-500 p-1.5 rounded-lg shadow-sm border border-secondary-400">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900 tracking-tight">Quizify <span className="text-secondary-600 font-extrabold text-sm ml-1">EDU</span></span>
          </Link>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  isActive 
                    ? 'bg-secondary-100 text-secondary-800 shadow-inner' 
                    : 'text-gray-600 hover:bg-secondary-50 hover:text-secondary-700'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-secondary-600' : 'text-gray-400 group-hover:text-secondary-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-700 font-bold shrink-0 border-2 border-secondary-200">
              {userData?.name?.charAt(0) || 'T'}
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-bold text-gray-900 truncate">{userData?.name || 'Teacher'}</p>
              <p className="text-xs text-secondary-600 font-semibold truncate">{userData?.post || 'Educator'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-accent-50 hover:text-accent-700 transition-colors border border-transparent hover:border-accent-200"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden bg-background">
        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
