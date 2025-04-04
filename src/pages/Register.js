import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

const Register = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "voter", // Default role
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const response = await authAPI.register(
        user.name,
        user.email,
        user.password,
        user.role
      );
      
      console.log("Registration successful:", response.data);
      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err.response?.data?.error || 
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Create Account</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && (
          <div className="success-message">
            Registration successful! Redirecting to login...
          </div>
        )}
        
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input 
              type="text" 
              id="name"
              name="name" 
              placeholder="Enter your full name" 
              value={user.name}
              onChange={handleChange} 
              required 
              disabled={loading || success}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email"
              name="email" 
              placeholder="Enter your email" 
              value={user.email}
              onChange={handleChange} 
              required 
              disabled={loading || success}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password"
              name="password" 
              placeholder="Create a password (min. 8 characters)" 
              value={user.password}
              onChange={handleChange} 
              required 
              minLength={8}
              disabled={loading || success}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select 
              id="role"
              name="role" 
              value={user.role}
              onChange={handleChange}
              disabled={loading || success}
            >
              <option value="voter">Voter</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <button 
            type="submit" 
            className="register-button"
            disabled={loading || success}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        
        <div className="login-link">
          Already have an account? <Link to="/">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
