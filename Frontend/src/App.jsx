import React from 'react'; 
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext'; // YENİ
import Navbar from './components/Navbar';

// Sayfa importları
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Clubs from './pages/Clubs';
import EventDetail from './pages/EventDetail';
import Profile from './pages/Profile';
import ClubDashboard from './pages/ClubDashboard';
import CreateEvent from './pages/CreateEvent';
import AdminDashboard from './pages/AdminDashboard';
import ClubMembers from './pages/ClubMembers';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/" />;
  return children;
};

const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider> {/* YENİ - Toast Provider Eklendi */}
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Auth Sayfaları */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Genel Sayfalar */}
              <Route path="/" element={<Layout><Home /></Layout>} />
              <Route path="/clubs" element={<Layout><Clubs /></Layout>} />
              <Route path="/events/:id" element={<Layout><EventDetail /></Layout>} />
              
              {/* Korumalı Sayfalar */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Layout><Profile /></Layout>
                </ProtectedRoute>
              } />

              {/* Kulüp Başkanı Rotaları */}
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRole="club_admin">
                  <Layout><ClubDashboard /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/club/:clubId/create-event" element={
                <ProtectedRoute allowedRole="club_admin">
                  <Layout><CreateEvent /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/club/:clubId/members" element={
                <ProtectedRoute allowedRole="club_admin">
                  <Layout><ClubMembers /></Layout>
                </ProtectedRoute>
              } />

              {/* Admin Rotaları */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRole="admin">
                  <Layout><AdminDashboard /></Layout>
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;