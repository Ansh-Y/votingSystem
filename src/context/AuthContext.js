import React, { createContext, useState, useContext, useEffect } from 'react';
import { Auth } from '../services/api';

// Create the context
const AuthContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Check if user is already logged in on mount
  useEffect(() => {
    const verifyStoredAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          // Verify token with the backend
          const userData = await Auth.verifyToken();
          
          // Set user state if token is valid
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (err) {
        // Clear stored data if verification fails
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    
    verifyStoredAuth();
  }, []);
  
  // Debug function to check token
  const checkToken = () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    console.log("AuthContext - Current token:", token ? "exists" : "missing");
    console.log("AuthContext - Current user:", user);
    return { token, user };
  };
  
  // User login function
  const login = async (email, password) => {
    try {
      const response = await Auth.login(email, password);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      setIsAuthenticated(true);
      console.log("Login successful - token stored");
      checkToken();
      return response;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };
  
  // User registration function
  const register = async (name, email, password, role) => {
    const response = await Auth.register(name, email, password, role);
    return response;
  };
  
  // User logout function
  const logout = () => {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Reset state
    setUser(null);
    setIsAuthenticated(false);
  };
  
  // Update user data function (for profile updates)
  const updateUser = (userData) => {
    // Update local storage
    localStorage.setItem('user', JSON.stringify({
      ...user,
      ...userData
    }));
    
    // Update state
    setUser({
      ...user,
      ...userData
    });
  };
  
  // Also modify verifyToken to add logging
  const verifyToken = async () => {
    const token = localStorage.getItem('token');
    console.log("Verifying token...", token ? "Token exists" : "No token found");
    
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return false;
    }
    
    try {
      const response = await Auth.verifyToken();
      setUser(response.user);
      setIsAuthenticated(true);
      console.log("Token verified successfully - user:", response.user);
      return true;
    } catch (error) {
      console.error("Token verification failed:", error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Provide the auth context values
  const contextValue = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser,
    checkToken
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 