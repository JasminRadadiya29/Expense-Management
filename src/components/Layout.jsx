import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, LayoutDashboard, Receipt, CheckSquare, Users, Settings, Key, Menu, X } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const NavLink = ({ to, icon: Icon, children, onClick }) => {
    const active = isActive(to);
    return (
      <Link
        to={to}
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
          active
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <Icon size={18} />
        <span>{children}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <Link 
              to="/dashboard" 
              className="flex items-center gap-3 group"
            >
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-200 group-hover:scale-105">
                <Receipt className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hidden sm:block">
                Expense Manager
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-2">
              <NavLink to="/dashboard" icon={LayoutDashboard}>
                Dashboard
              </NavLink>

              {(user?.role === 'Employee' || user?.role === 'Manager' || user?.role === 'Admin') && (
                <NavLink to="/expenses" icon={Receipt}>
                  Expenses
                </NavLink>
              )}

              {(user?.role === 'Manager' || user?.role === 'Admin') && (
                <NavLink to="/approvals" icon={CheckSquare}>
                  Approvals
                </NavLink>
              )}

              {user?.role === 'Admin' && (
                <>
                  <NavLink to="/users" icon={Users}>
                    Users
                  </NavLink>
                  <NavLink to="/approval-rules" icon={Settings}>
                    Rules
                  </NavLink>
                </>
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              {/* User Info - Desktop */}
              <div className="hidden md:block text-right mr-2">
                <div className="text-sm font-semibold text-slate-800">{user?.name}</div>
                <div className="text-xs text-slate-500 font-medium">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {user?.role}
                  </span>
                </div>
              </div>

              {/* Action Buttons - Desktop */}
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/change-password"
                  className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                  title="Change Password"
                >
                  <Key size={18} />
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-xl font-medium transition-all duration-200"
                  title="Logout"
                >
                  <LogOut size={18} />
                  <span className="hidden xl:inline">Logout</span>
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-slate-200/60">
              {/* User Info - Mobile */}
              <div className="px-4 py-3 mb-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <div className="text-sm font-semibold text-slate-800">{user?.name}</div>
                <div className="text-xs text-slate-600 mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white text-blue-700 shadow-sm">
                    {user?.role}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <NavLink to="/dashboard" icon={LayoutDashboard} onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </NavLink>

                {(user?.role === 'Employee' || user?.role === 'Manager' || user?.role === 'Admin') && (
                  <NavLink to="/expenses" icon={Receipt} onClick={() => setMobileMenuOpen(false)}>
                    Expenses
                  </NavLink>
                )}

                {(user?.role === 'Manager' || user?.role === 'Admin') && (
                  <NavLink to="/approvals" icon={CheckSquare} onClick={() => setMobileMenuOpen(false)}>
                    Approvals
                  </NavLink>
                )}

                {user?.role === 'Admin' && (
                  <>
                    <NavLink to="/users" icon={Users} onClick={() => setMobileMenuOpen(false)}>
                      Users
                    </NavLink>
                    <NavLink to="/approval-rules" icon={Settings} onClick={() => setMobileMenuOpen(false)}>
                      Rules
                    </NavLink>
                  </>
                )}

                <div className="pt-3 mt-3 border-t border-slate-200/60 space-y-1">
                  <Link
                    to="/change-password"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl font-medium transition-all duration-200"
                  >
                    <Key size={18} />
                    <span>Change Password</span>
                  </Link>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-medium transition-all duration-200"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;