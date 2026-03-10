import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PrivateRoute from './components/PrivateRoute';
import DashboardLayout from './components/Layout';

// Mock dashboard page component for now
function DashboardHome() {
  return <div className="p-8"><h1 className="text-3xl font-bold">Dashboard Home</h1></div>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardHome />} />
              <Route path="/dashboard/generate" element={<div className="font-bold text-2xl">Generate Quiz</div>} />
              <Route path="/dashboard/tutor" element={<div className="font-bold text-2xl">AI Tutor</div>} />
              <Route path="/dashboard/performance" element={<div className="font-bold text-2xl">Performance</div>} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
