import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Bell, CheckCheck, Trash2, X } from 'lucide-react';

export default function NotificationDropdown({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications/');
      setNotifications(data.notifications);
    } catch (err) {
      console.error('Bildirimler yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notifId) => {
    try {
      await api.post(`/notifications/${notifId}/read`);
      // Lokal state'i güncelle
      setNotifications(prev => 
        prev.map(n => n.notification_id === notifId ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.error('İşaretleme başarısız');
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Tüm bildirimleri okundu olarak işaretlemek istiyor musunuz?')) {
      notifications.forEach(n => {
        if (!n.is_read) {
          handleMarkAsRead(n.notification_id);
        }
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay - Dışarı tıklayınca kapat */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />

      {/* Dropdown */}
      <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border-2 border-gray-100 z-50 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <Bell size={20} />
            <h3 className="font-bold text-lg">Bildirimler</h3>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="hover:bg-white/20 p-1 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="p-3 bg-gray-50 border-b flex items-center justify-between">
            <span className="text-xs text-gray-600 font-semibold">
              {notifications.length} bildirim
            </span>
            <button
              onClick={handleClearAll}
              className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center space-x-1"
            >
              <CheckCheck size={14} />
              <span>Tümünü Okundu İşaretle</span>
            </button>
          </div>
        )}

        {/* Notification List */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              Yükleniyor...
            </div>
          ) : notifications.length > 0 ? (
            notifications.map(notif => (
              <div
                key={notif.notification_id}
                className={`p-4 border-b hover:bg-gray-50 transition ${
                  !notif.is_read ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className={`text-sm leading-relaxed ${
                      !notif.is_read ? 'font-semibold text-gray-900' : 'text-gray-600'
                    }`}>
                      {notif.message}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs text-gray-400">
                        {new Date(notif.created_at).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {notif.club_id && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                          Kulüp
                        </span>
                      )}
                      {notif.event_id && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                          Etkinlik
                        </span>
                      )}
                    </div>
                  </div>
                  {!notif.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notif.notification_id)}
                      className="ml-2 p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                      title="Okundu işaretle"
                    >
                      <CheckCheck size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Bell size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400 font-semibold">Henüz bildirim yok</p>
              <p className="text-xs text-gray-400 mt-1">
                Yeni etkinlikler ve duyurular burada görünecek
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t text-center">
          <button className="text-xs text-blue-600 hover:text-blue-700 font-bold">
            Tüm Bildirimleri Görüntüle →
          </button>
        </div>
      </div>
    </>
  );
}