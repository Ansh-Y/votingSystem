import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ element, allowedRoles }) => {
  const { currentUser, isLoggedIn } = useAuth();
  
  // Check if user is logged in
  if (!isLoggedIn()) {
    return <Navigate to="/" replace />;
  }
  
  // Check if user has required role
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Redirect to appropriate dashboard based on role
    if (currentUser.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (currentUser.role === 'candidate') {
      return <Navigate to="/candidate" replace />;
    } else if (currentUser.role === 'voter') {
      return <Navigate to="/voter" replace />;
    }
    
    // Fallback to login
    return <Navigate to="/" replace />;
  }
  
  // Render the protected component
  return element;
};

export default ProtectedRoute; 