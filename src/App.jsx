import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PrivateRoute from './components/PrivateRoute';
import DashboardLayout from './components/Layout';
import TeacherLayout from './components/TeacherLayout';
import DashboardHome from './pages/DashboardHome';
import TeacherHome from './pages/TeacherHome';
import TeacherQuizzes from './pages/TeacherQuizzes';
import TeacherPerformance from './pages/TeacherPerformance';
import GenerateQuiz from './pages/GenerateQuiz';
import QuizPlayer from './pages/QuizPlayer';
import AITutor from './pages/AITutor';
import Performance from './pages/Performance';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Student Routes */}
          <Route element={<PrivateRoute allowedRoles={['student']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardHome />} />
              <Route path="/dashboard/generate" element={<GenerateQuiz />} />
              <Route path="/dashboard/play" element={<QuizPlayer />} />
              <Route path="/dashboard/tutor" element={<AITutor />} />
              <Route path="/dashboard/performance" element={<Performance />} />
            </Route>
          </Route>

          {/* Teacher Routes */}
          <Route element={<PrivateRoute allowedRoles={['teacher']} />}>
            <Route element={<TeacherLayout />}>
              <Route path="/teacher-dashboard" element={<TeacherHome />} />
              <Route path="/teacher-dashboard/quizzes" element={<TeacherQuizzes />} />
              <Route path="/teacher-dashboard/students" element={<TeacherPerformance />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
