import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext'; // Toast Context entegre edildi
import { 
  Users, CheckCircle, XCircle, Trash2, ShieldAlert, 
  TrendingUp, Calendar, Building2, Search, UserCog,
  Megaphone, AlertTriangle, BarChart3, ChevronLeft, ChevronRight
} from 'lucide-react';

export default function AdminDashboard() {
  const toast = useToast(); // Toast hook'u tanımlandı
  const [activeTab, setActiveTab] = useState('overview'); 
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchClubs();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, page, searchTerm]);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data.stats);
    } catch (err) {
      console.error('İstatistikler yüklenemedi');
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (searchTerm) params.append('search', searchTerm);
      
      const { data } = await api.get(`/admin/users?${params}`);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      toast.error('Kullanıcılar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchClubs = async () => {
    try {
      const { data } = await api.get('/clubs/my-clubs');
      setClubs(data.clubs);
    } catch (err) {
      console.error('Kulüpler yüklenemedi');
    }
  };

  const handleBanUser = async (userId) => {
    if (!window.confirm('Bu kullanıcının durumunu değiştirmek istediğinize emin misiniz?')) return;
    try {
      const { data } = await api.post(`/admin/users/${userId}/ban`);
      toast.success(data.message); // Alert yerine toast kullanıldı
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'İşlem başarısız');
    }
  };

  const handleApproveClub = async (clubId) => {
    try {
      await api.post(`/clubs/${clubId}/approve`);
      toast.success('✅ Kulüp başarıyla onaylandı!');
      fetchClubs();
      fetchStats();
    } catch (err) {
      toast.error('Onaylama işlemi başarısız.');
    }
  };

  const handleDeleteClub = async (clubId) => {
    if (!window.confirm('Bu kulübü silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/clubs/${clubId}`);
      toast.success('🗑️ Kulüp sistemden silindi.');
      fetchClubs();
      fetchStats();
    } catch (err) {
      toast.error('Silme işlemi başarısız.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-3xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <ShieldAlert size={40} />
                <h1 className="text-4xl font-black">Admin Kontrol Merkezi</h1>
              </div>
              <p className="text-red-100">Sistem yönetimi ve denetim paneli</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black">{stats?.users || 0}</div>
              <div className="text-sm text-red-100">Toplam Kullanıcı</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-sm p-2 mb-6 flex space-x-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'Genel Bakış', icon: BarChart3 },
            { id: 'users', label: 'Kullanıcılar', icon: Users },
            { id: 'clubs', label: 'Kulüpler', icon: Building2 },
            { id: 'announce', label: 'Duyuru', icon: Megaphone }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition ${
                  activeTab === tab.id
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-3xl shadow-sm p-8">
          {activeTab === 'overview' && <OverviewTab stats={stats} />}
          {activeTab === 'users' && (
            <UsersTab
              users={users}
              loading={loading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              handleBanUser={handleBanUser}
              pagination={pagination}
              page={page}
              setPage={setPage}
            />
          )}
          {activeTab === 'clubs' && (
            <ClubsTab
              clubs={clubs}
              handleApproveClub={handleApproveClub}
              handleDeleteClub={handleDeleteClub}
            />
          )}
          {activeTab === 'announce' && <AnnounceTab />}
        </div>
      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

function OverviewTab({ stats }) {
  if (!stats) return <div className="text-center py-10 text-gray-400">Veriler yükleniyor...</div>;

  const cards = [
    { label: 'Toplam Kullanıcı', value: stats.users, icon: Users, color: 'blue' },
    { label: 'Aktif Kulüpler', value: stats.active_clubs, icon: Building2, color: 'green' },
    { label: 'Onay Bekleyen', value: stats.pending_clubs, icon: AlertTriangle, color: 'yellow' },
    { label: 'Toplam Etkinlik', value: stats.events, icon: Calendar, color: 'purple' }
  ];

  return (
    <div>
      <h2 className="text-2xl font-black mb-6 flex items-center text-gray-800">
        <TrendingUp className="mr-3 text-red-600" size={28} />
        Sistem İstatistikleri
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          const colorClasses = {
            blue: 'from-blue-500 to-indigo-600',
            green: 'from-green-500 to-emerald-600',
            yellow: 'from-yellow-500 to-orange-600',
            purple: 'from-purple-500 to-pink-600'
          };
          return (
            <div key={idx} className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-100 rounded-2xl p-6 hover:shadow-xl transition">
              <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[card.color]} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className="text-white" size={24} />
              </div>
              <div className="text-4xl font-black text-gray-900 mb-1">{card.value}</div>
              <div className="text-sm text-gray-500 font-semibold">{card.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function UsersTab({ users, loading, searchTerm, setSearchTerm, handleBanUser, pagination, page, setPage }) {
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-black flex items-center text-gray-800">
          <Users className="mr-3 text-red-600" size={28} />
          Kullanıcı Yönetimi
        </h2>
        <div className="flex items-center bg-gray-50 px-4 py-2 rounded-xl border-2 border-gray-200">
          <Search size={20} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Ad, soyad veya email ara..."
            className="bg-transparent outline-none text-gray-700 w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Kullanıcılar yükleniyor...</div>
      ) : (
        <>
          <div className="space-y-3">
            {users.map(user => (
              <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{user.full_name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        {user.role}
                      </span>
                      <span className="text-xs text-gray-400">{user.department}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end space-x-3">
                  {user.is_active ? (
                    <span className="flex items-center text-sm font-bold text-green-600">
                      <CheckCircle size={16} className="mr-1" /> Aktif
                    </span>
                  ) : (
                    <span className="flex items-center text-sm font-bold text-red-600">
                      <XCircle size={16} className="mr-1" /> Yasaklı
                    </span>
                  ) || <span className="text-gray-300">Durum Belirsiz</span>}
                  
                  <button
                    onClick={() => handleBanUser(user.id)}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
                      user.is_active
                        ? 'bg-red-100 text-red-600 hover:bg-red-600 hover:text-white'
                        : 'bg-green-100 text-green-600 hover:bg-green-600 hover:text-white'
                    }`}
                  >
                    {user.is_active ? 'Yasakla' : 'Yasağı Kaldır'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <div className="flex items-center justify-center space-x-4 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg bg-gray-100 disabled:opacity-30 hover:bg-gray-200 transition"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="font-bold text-gray-700">
                Sayfa {page} / {pagination.total_pages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))}
                disabled={page === pagination.total_pages}
                className="p-2 rounded-lg bg-gray-100 disabled:opacity-30 hover:bg-gray-200 transition"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ClubsTab({ clubs, handleApproveClub, handleDeleteClub }) {
  const pendingClubs = clubs.filter(c => c.status === 'pending');
  const activeClubs = clubs.filter(c => c.status === 'active');

  return (
    <div>
      <h2 className="text-2xl font-black mb-6 flex items-center text-gray-800">
        <Building2 className="mr-3 text-red-600" size={28} />
        Kulüp Yönetimi
      </h2>

      {pendingClubs.length > 0 && (
        <div className="mb-10">
          <h3 className="text-lg font-bold text-yellow-600 mb-4 flex items-center bg-yellow-50 p-3 rounded-xl border border-yellow-100">
            <AlertTriangle className="mr-2" size={20} />
            Onay Bekleyen Kulüpler ({pendingClubs.length})
          </h3>
          <div className="space-y-3">
            {pendingClubs.map(club => (
              <div key={club.id} className="flex items-center justify-between p-4 bg-white border-2 border-yellow-100 rounded-2xl shadow-sm">
                <div className="flex items-center space-x-4">
                  <img src={club.image_url || 'https://via.placeholder.com/60'} className="w-14 h-14 rounded-xl object-cover shadow-inner" />
                  <div>
                    <div className="font-bold text-gray-900">{club.name}</div>
                    <div className="text-[10px] text-yellow-600 font-black tracking-widest uppercase">ONAY BEKLİYOR</div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApproveClub(club.id)}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition shadow-md"
                  >
                    <CheckCircle size={18} className="mr-2" /> Onayla
                  </button>
                  <button
                    onClick={() => handleDeleteClub(club.id)}
                    className="flex items-center px-4 py-2 bg-red-100 text-red-600 rounded-lg font-bold hover:bg-red-600 hover:text-white transition"
                  >
                    <Trash2 size={18} className="mr-2" /> Reddet
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-bold text-green-600 mb-4 flex items-center">
          <CheckCircle className="mr-2" size={20} />
          Aktif Kulüpler ({activeClubs.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeClubs.length > 0 ? (
            activeClubs.map(club => (
              <div key={club.id} className="flex items-center justify-between p-4 bg-green-50/50 border border-green-100 rounded-xl">
                <div className="flex items-center space-x-3">
                  <img src={club.image_url || 'https://via.placeholder.com/50'} className="w-12 h-12 rounded-lg object-cover" />
                  <div>
                    <div className="font-bold text-gray-900">{club.name}</div>
                    <div className="text-[10px] text-green-600 font-bold uppercase">AKTİF</div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteClub(club.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-10 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              Henüz aktif kulüp bulunmuyor.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AnnounceTab() {
  const toast = useToast(); // AnnounceTab için toast hook'u
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.warning('Lütfen bir mesaj yazın!');
      return;
    }

    if (!window.confirm('Bu duyuru TÜM kullanıcılara gönderilecek. Emin misiniz?')) return;

    setSending(true);
    try {
      const { data } = await api.post('/admin/announce', { message });
      toast.success(`📢 ${data.message}`);
      setMessage('');
    } catch (err) {
      toast.error('Duyuru gönderilemedi.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-black mb-6 flex items-center text-gray-800">
        <Megaphone className="mr-3 text-red-600" size={28} />
        Sistem Duyurusu Gönder
      </h2>
      <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start mb-4">
           <AlertTriangle className="text-red-500 mr-3 mt-1 shrink-0" size={20} />
           <p className="text-sm text-red-700 font-semibold">
            ⚠️ Dikkat: Yazdığınız mesaj platformdaki tüm aktif kullanıcılara anlık bildirim olarak iletilecektir.
           </p>
        </div>
        <textarea
          className="w-full p-4 border-2 border-red-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 resize-none bg-white transition-all"
          rows="5"
          placeholder="Örnek: Sistem bakımı nedeniyle 15:00-16:00 arası hizmet verilemeyecektir."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          onClick={handleSend}
          disabled={sending}
          className="mt-4 w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-4 rounded-xl font-black text-lg hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? 'Gönderiliyor...' : '📢 Duyuruyu Gönder'}
        </button>
      </div>
    </div>
  );
}