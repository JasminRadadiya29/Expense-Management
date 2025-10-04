import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, LayoutDashboard, Receipt, CheckSquare, Users, Settings } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="text-xl font-semibold text-slate-900">
                Expense Manager
              </Link>

              <div className="flex gap-4">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>

                {(user?.role === 'Employee' || user?.role === 'Manager' || user?.role === 'Admin') && (
                  <Link
                    to="/expenses"
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
                  >
                    <Receipt size={18} />
                    Expenses
                  </Link>
                )}

                {(user?.role === 'Manager' || user?.role === 'Admin') && (
                  <Link
                    to="/approvals"
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
                  >
                    <CheckSquare size={18} />
                    Approvals
                  </Link>
                )}

                {user?.role === 'Admin' && (
                  <>
                    <Link
                      to="/users"
                      className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
                    >
                      <Users size={18} />
                      Users
                    </Link>

                    <Link
                      to="/approval-rules"
                      className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
                    >
                      <Settings size={18} />
                      Rules
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-slate-900">{user?.name}</div>
                <div className="text-xs text-slate-600">{user?.role}</div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded transition"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
