import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ChangePassword from './pages/ChangePassword';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeExpenses from './pages/EmployeeExpenses';
import ManagerDashboard from './pages/ManagerDashboard';
import ApprovalRules from './pages/ApprovalRules';
import Layout from './components/Layout';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'Admin') {
    return <AdminDashboard />;
  } else if (user.role === 'Manager') {
    return <ManagerDashboard />;
  } else {
    return <EmployeeExpenses />;
  }
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
              <div className="text-slate-600">Loading...</div>
            </div>
          }>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/change-password" element={
                <ProtectedRoute>
                  <ChangePassword />
                </ProtectedRoute>
              } />

              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardRouter />} />

                <Route path="expenses" element={
                  <ProtectedRoute allowedRoles={['Employee', 'Manager', 'Admin']}>
                    <EmployeeExpenses />
                  </ProtectedRoute>
                } />

                <Route path="approvals" element={
                  <ProtectedRoute allowedRoles={['Manager', 'Admin']}>
                    <ManagerDashboard />
                  </ProtectedRoute>
                } />

                <Route path="users" element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />

                <Route path="approval-rules" element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <ApprovalRules />
                  </ProtectedRoute>
                } />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
