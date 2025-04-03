import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./components/AdminDashboard";
import CandidateDashboard from "./components/CandidateDashboard";
import VoterDashboard from "./components/VoterDashboard";

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute 
              element={<AdminDashboard />} 
              allowedRoles={["admin"]} 
            />
          } 
        />
        <Route 
          path="/candidate" 
          element={
            <ProtectedRoute 
              element={<CandidateDashboard />} 
              allowedRoles={["candidate"]} 
            />
          } 
        />
        <Route 
          path="/voter" 
          element={
            <ProtectedRoute 
              element={<VoterDashboard />} 
              allowedRoles={["voter"]} 
            />
          } 
        />
      </Routes>
    </AuthProvider>
  );
};

export default App;
