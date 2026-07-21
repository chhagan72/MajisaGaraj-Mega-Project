import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import UserHome from './components/user/UserHome';
import AdminHome from './components/admin/AdminHome';
import ChangePassword from './components/ChangePassword';

function App() {
  // CORRECTED PROTECTION WRAPPER HOOK
  const ProtectedRoute = ({ children, allowedRoles }) => {
    /* FIX: Check both namespaces safely since different roles 
       now populate separate, isolated local storage tracks */
    const adminData = JSON.parse(localStorage.getItem('admin_data'));
    const userData = JSON.parse(localStorage.getItem('user_data'));
    
    // Select the active token index signature mapping present in the session frame
    const activeUser = allowedRoles.includes('admin') ? adminData : userData;

    // Handshake Validation clearances check
    if (!activeUser) return <Navigate to="/login" />;
    if (!allowedRoles.includes(activeUser.role)) return <Navigate to="/login" />;
    
    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/change-password" element={<ChangePassword />} />
        
        {/* Protected Dashboard Envelopes mapping points */}
        <Route 
          path="/user-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserHome />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminHome />
            </ProtectedRoute>
          } 
        />
        
        {/* Global Catch All Redirect Route */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;