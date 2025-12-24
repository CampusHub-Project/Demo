import { useState, useEffect } from 'react'; // useEffect eklenmeli
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, User, LogOut, Home as HomeIcon, LayoutGrid, Shield, Crown } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
// api importunuzu buraya eklediğinizden emin olun (örn: import api from '../api';)

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const { data } = await api.get('/notifications/');
      const count = data.notifications.filter(n => !n.is_read).length;
      setUnreadCount(count);
    } catch (err) {
      console.error('Bildirim sayısı alınamadı');
    }
  };

  const handleCloseNotif = () => {
    setIsNotifOpen(false);
    fetchUnreadCount();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition">
              <span className="text-white font-black text-lg">C</span>
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              CampusHub
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-600 hover:text-blue-600 flex items-center font-medium transition group">
              <HomeIcon size={18} className="mr-2 group-hover:scale-110 transition" /> 
              Ana Sayfa
            </Link>
            <Link to="/clubs" className="text-gray-600 hover:text-blue-600 flex items-center font-medium transition group">
              <LayoutGrid size={18} className="mr-2 group-hover:scale-110 transition" /> 
              Kulüpler
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Bildirimler */}
                <div className="relative">
                  <button 
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className="relative text-gray-500 hover:text-blue-600 transition p-2 hover:bg-blue-50 rounded-lg"
                  >
                    <Bell size={22} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  <NotificationDropdown 
                    isOpen={isNotifOpen} 
                    onClose={handleCloseNotif} 
                  />
                </div>

                {/* Dashboard Linkleri */}
                {user.role === 'admin' && (
                  <Link to="/admin/dashboard" className="flex items-center space-x-2 bg-red-50 text-red-600 px-3 py-2 rounded-lg font-semibold hover:bg-red-600 hover:text-white transition">
                    <Shield size={18} />
                    <span className="text-sm">Admin Panel</span>
                  </Link>
                )}

                {user.role === 'club_admin' && (
                  <Link to="/dashboard" className="flex items-center space-x-2 bg-yellow-50 text-yellow-700 px-3 py-2 rounded-lg font-semibold hover:bg-yellow-600 hover:text-white transition">
                    <Crown size={18} />
                    <span className="text-sm">Kulüp Paneli</span>
                  </Link>
                )}

                {/* Profil */}
                <Link to="/profile" className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-xl border-2 border-blue-100 hover:border-blue-300 transition group">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user.full_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition">
                    {user.full_name}
                  </span>
                </Link>

                {/* Logout */}
                <button 
                  onClick={handleLogout} 
                  className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                  title="Çıkış Yap"
                >
                  <LogOut size={22} />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-gray-600 font-semibold px-4 py-2 hover:text-blue-600 transition">
                  Giriş Yap
                </Link>
                <Link to="/register" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition transform">
                  Kaydol
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}