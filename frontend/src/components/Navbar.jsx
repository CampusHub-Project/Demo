import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios'; // Api importu eklendi
import { useAuth } from '../context/AuthContext';
import { 
  Bell, User, LogOut, Home as HomeIcon, 
  LayoutGrid, Shield, Crown 
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Kullanıcı değiştikçe (Login/Logout) bildirim kontrolü yap
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      
      // Canlılık hissi için her 3 dakikada bir kontrol edebiliriz
      const interval = setInterval(fetchUnreadCount, 180000);
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0); // Kullanıcı yoksa sayıyı sıfırla
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    // SADECE kullanıcı nesnesi varsa isteği gönder (401 hatasını önler)
    if (!user) return;

    try {
      const { data } = await api.get('/notifications/');
      // Backend'den gelen notifications listesindeki okunmamışları say
      if (data && data.notifications) {
        const count = data.notifications.filter(n => !n.is_read).length;
        setUnreadCount(count);
      }
    } catch (err) {
      // 401 (Unauthorized) hatalarını konsolda gürültü yapmaması için yutuyoruz
      if (err.response?.status !== 401) {
        console.error('Bildirim sayısı senkronize edilemedi');
      }
    }
  };

  const handleCloseNotif = () => {
    setIsNotifOpen(false);
    fetchUnreadCount(); // Dropdown kapandığında sayıyı tazele
  };

  const handleLogout = () => {
    logout();
    setUnreadCount(0);
    navigate('/login');
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition shadow-indigo-100 shadow-lg">
              <span className="text-white font-black text-lg">C</span>
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tighter">
              CampusHub
            </span>
          </Link>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-600 hover:text-blue-600 flex items-center font-bold text-sm transition group">
              <HomeIcon size={18} className="mr-2 group-hover:scale-110 transition" /> 
              Ana Sayfa
            </Link>
            <Link to="/clubs" className="text-gray-600 hover:text-blue-600 flex items-center font-bold text-sm transition group">
              <LayoutGrid size={18} className="mr-2 group-hover:scale-110 transition" /> 
              Kulüpler
            </Link>
          </div>

          {/* Right Action Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Admin/President Dashboards */}
                {user.role === 'admin' && (
                  <Link to="/admin/dashboard" className="hidden lg:flex items-center space-x-2 bg-red-50 text-red-600 px-3 py-2 rounded-lg font-black hover:bg-red-600 hover:text-white transition uppercase text-[10px] tracking-widest border border-red-100">
                    <Shield size={16} />
                    <span>Admin</span>
                  </Link>
                )}

                {user.role === 'club_admin' && (
                  <Link to="/dashboard" className="hidden lg:flex items-center space-x-2 bg-yellow-50 text-yellow-700 px-3 py-2 rounded-lg font-black hover:bg-yellow-600 hover:text-white transition uppercase text-[10px] tracking-widest border border-yellow-100">
                    <Crown size={16} />
                    <span>Başkan</span>
                  </Link>
                )}

                {/* Notifications Icon */}
                <div className="relative">
                  <button 
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className={`relative p-2 rounded-xl transition ${isNotifOpen ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    <Bell size={22} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  <NotificationDropdown 
                    isOpen={isNotifOpen} 
                    onClose={handleCloseNotif} 
                  />
                </div>

                {/* User Profile Capsule */}
                <Link to="/profile" className="flex items-center space-x-3 bg-gray-50 px-3 py-1.5 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-white transition group shadow-sm">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-white font-black text-xs uppercase">
                      {user.full_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-black text-gray-800 leading-none group-hover:text-blue-600 transition uppercase tracking-tighter">
                      {user.full_name?.split(' ')[0]}
                    </p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Profilim</p>
                  </div>
                </Link>

                {/* Logout Button */}
                <button 
                  onClick={handleLogout} 
                  className="text-gray-400 hover:text-red-500 p-2 rounded-xl transition hover:bg-red-50"
                  title="Güvenli Çıkış"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="text-gray-600 font-bold text-sm px-4 py-2 hover:text-blue-600 transition">
                  Giriş
                </Link>
                <Link to="/register" className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl font-black text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition active:scale-95">
                  Katıl
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}