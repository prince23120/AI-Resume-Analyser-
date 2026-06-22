import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UploadResume from './pages/UploadResume';
import Dashboard from './pages/Dashboard';
import JobMatch from './pages/JobMatch';
import History from './pages/History';
import Loader from './components/Loader';
import api from './services/api';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch (err) {
        console.error('Initial auth verification failed:', err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader message="Verifying authentication credentials..." />
      </div>
    );
  }

  // Wrapper for protected client routes
  const ProtectedRoute = ({ children }) => {
    return user ? children : <Navigate to="/login" replace />;
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-x-hidden transition-colors duration-300">
        {/* Background gradient rings */}
        {theme === 'dark' && (
          <>
            <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/25 via-slate-950 to-slate-950 pointer-events-none z-0"></div>
            <div className="absolute top-[400px] right-[-200px] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
          </>
        )}

        <Navbar user={user} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />

        <main className="flex-1 w-full max-w-7xl mx-auto py-6 px-4 relative z-10">
          <Routes>
            <Route
              path="/login"
              element={user ? <Navigate to="/" replace /> : <Login onLoginSuccess={handleLoginSuccess} />}
            />
            <Route
              path="/signup"
              element={user ? <Navigate to="/" replace /> : <Signup onSignupSuccess={handleLoginSuccess} />}
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <UploadResume />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/:id"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/match/:id"
              element={
                <ProtectedRoute>
                  <JobMatch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="border-t border-slate-900/80 py-6 text-center text-xs text-slate-600 font-medium relative z-10">
          <p>© {new Date().getFullYear()} ResumeCraft. A human-centered platform for career growth. Powered by advanced matching intelligence.</p>
        </footer>
      </div>
    </Router>
  );
};

export default App;
