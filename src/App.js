import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import VoterDashboard from './components/VoterDashboard';
import PollDetails from './components/PollDetails';
import './styles.css';

// Protected route component to check authentication and role
const ProtectedRoute = ({ element, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // If no specific roles are required or user has the required role
  if (allowedRoles.length === 0 || allowedRoles.includes(user.role)) {
    return element;
  }
  
  // Redirect to appropriate dashboard if authenticated but wrong role
  return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />;
};

// Redirect to dashboard if already logged in
const RedirectIfAuthenticated = ({ element }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (isAuthenticated) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />;
  }
  
  return element;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={<RedirectIfAuthenticated element={<Login />} />} 
          />
          <Route 
            path="/register" 
            element={<RedirectIfAuthenticated element={<Register />} />} 
          />
          
          {/* Protected routes */}
          <Route 
            path="/admin" 
            element={<ProtectedRoute element={<AdminDashboard />} allowedRoles={['admin']} />} 
          />
          <Route 
            path="/dashboard" 
            element={<ProtectedRoute element={<VoterDashboard />} allowedRoles={['voter', 'candidate']} />} 
          />
          <Route 
            path="/polls/:pollId" 
            element={<ProtectedRoute element={<PollDetails />} allowedRoles={['voter', 'candidate', 'admin']} />} 
          />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
