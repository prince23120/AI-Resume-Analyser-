import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FileText, History, LogOut, User as UserIcon, Sun, Moon } from 'lucide-react';

const Navbar = ({ user, onLogout, theme, toggleTheme }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass-card sticky top-0 z-50 px-6 py-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/10 group-hover:scale-105 transition-all duration-300">
            <FileText className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white group-hover:text-indigo-300 transition-colors duration-300">
            Resume<span className="text-indigo-400 font-medium">Craft</span>
          </span>
        </Link>

        {/* Navigation Items */}
        <div className="flex items-center space-x-6">
          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 bg-slate-900/50 hover:bg-slate-800/60 border border-slate-800/60 text-slate-300 rounded-xl transition cursor-pointer flex items-center justify-center"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="h-4.5 w-4.5 text-amber-400" />
            ) : (
              <Moon className="h-4.5 w-4.5 text-indigo-500" />
            )}
          </button>

          {user ? (
            <>
              <Link
                to="/"
                className={`flex items-center space-x-1 text-sm font-medium transition duration-150 ${
                  isActive('/')
                    ? 'text-indigo-400 border-b-2 border-indigo-400 pb-1'
                    : 'text-slate-300 hover:text-indigo-400'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Upload</span>
              </Link>
              <Link
                to="/history"
                className={`flex items-center space-x-1 text-sm font-medium transition duration-150 ${
                  isActive('/history')
                    ? 'text-indigo-400 border-b-2 border-indigo-400 pb-1'
                    : 'text-slate-300 hover:text-indigo-400'
                }`}
              >
                <History className="h-4 w-4" />
                <span>History</span>
              </Link>
              <div className="h-4 w-px bg-slate-800"></div>
              <div className="flex items-center space-x-2 text-slate-300">
                <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/20 flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-indigo-400" />
                </div>
                <span className="text-sm font-medium hidden md:inline">{user.name}</span>
              </div>
              <button
                onClick={handleLogoutClick}
                className="flex items-center space-x-1 text-sm font-medium text-slate-400 hover:text-rose-400 transition duration-150 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-slate-300 hover:text-indigo-400 transition duration-150"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition duration-150 shadow-md shadow-indigo-600/20"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
