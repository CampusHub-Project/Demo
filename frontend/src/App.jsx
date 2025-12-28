import React from 'react'; 
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';

// Sayfa importları
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Home from './pages/Home';
import Clubs from './pages/Clubs';
import ClubProfile from './pages/ClubProfile'; // YENİ: Kulüp Detay/Profil Sayfası
import EventDetail from './pages/EventDetail';
import Profile from './pages/Profile';
import ClubDashboard from './pages/ClubDashboard';
import CreateEvent from './pages/CreateEvent';
import AdminDashboard from './pages/AdminDashboard';
import ClubMembers from './pages/ClubMembers';

// Rota Koruma Bileşeni
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/" />;
  return children;
};

// Genel Sayfa Düzeni (Navbar içeren)
const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <div className="pt-4"> {/* Navbar sonrası mesafe için */}
        {children}
      </div>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 font-sans">
            <Routes>
              {/* --- 1. AUTH ROTALARI (Navbar içermez) --- */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* --- 2. GENEL ROTALAR (Herkes görebilir) --- */}
              <Route path="/" element={<Layout><Home /></Layout>} />
              <Route path="/clubs" element={<Layout><Clubs /></Layout>} />
              
              {/* YENİ: Kulüp Profil Sayfası (Kullanıcılar takip eder, Adminler yönetir) */}
              <Route path="/clubs/:clubId" element={<Layout><ClubProfile /></Layout>} />
              
              <Route path="/events/:id" element={<Layout><EventDetail /></Layout>} />
              
              {/* --- 3. KORUMALI ROTALAR (Giriş şart) --- */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Layout><Profile /></Layout>
                </ProtectedRoute>
              } />

              {/* --- 4. KULÜP YÖNETİMİ ROTALARI (Sadece Kulüp Başkanları) --- */}
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

              {/* --- 5. ADMIN YÖNETİM ROTALARI (Sadece Sistem Adminleri) --- */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRole="admin">
                  <Layout><AdminDashboard /></Layout>
                </ProtectedRoute>
              } />

              {/* Dinamik Admin Sekmeleri (İstatistiklerden Yönlendirme İçin) */}
              <Route path="/admin/:tab" element={
                <ProtectedRoute allowedRole="admin">
                  <Layout><AdminDashboard /></Layout>
                </ProtectedRoute>
              } />

              {/* --- 6. HATA ROTALARI --- */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;