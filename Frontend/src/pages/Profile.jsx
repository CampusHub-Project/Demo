import { useEffect, useState } from 'react';
import api from '../api/axios';
import { 
  User, Mail, BookOpen, Calendar, ShieldCheck, Edit3, 
  Save, X, Award, TrendingUp, Target 
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext'; // Toast Context eklendi

export default function Profile() {
  const toast = useToast(); // Toast hook'u tanımlandı
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    bio: '',
    interests: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/users/profile');
      setProfileData(data);
      setEditForm({
        bio: data.profile.bio || '',
        interests: data.profile.interests || ''
      });
    } catch (err) {
      toast.error("Profil bilgileri yüklenemedi."); // Hata bildirimi eklendi
      console.error("Profil yüklenemedi");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/users/profile', editForm);
      setIsEditing(false);
      fetchProfile();
      toast.success('✅ Profil başarıyla güncellendi!'); // Başarı bildirimi eklendi
    } catch (err) {
      toast.error(err.response?.data?.error || "Güncelleme işlemi başarısız."); // Hata bildirimi eklendi
    } finally {
      setSaving(false);
    }
  };

  if (!profileData) return <LoadingSpinner size="lg" text="Profil yükleniyor..." />;

  const { profile, activities } = profileData;
  const stats = [
    { 
      label: 'Etkinliklere Katıldı', 
      value: activities.participated_events.length, 
      icon: Calendar,
      color: 'blue'
    },
    { 
      label: 'Kulüp Takip Ediyor', 
      value: activities.followed_clubs.length, 
      icon: ShieldCheck,
      color: 'green'
    },
    { 
      label: 'Toplam Puan', 
      value: activities.participated_events.length * 10, 
      icon: Award,
      color: 'yellow'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 overflow-hidden mb-8">
          
          {/* Cover Image */}
          <div className="h-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
          
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 mb-6">
              <div className="relative mb-4 md:mb-0">
                <img
                  src={profile.profile_photo || 'https://via.placeholder.com/150'}
                  className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-xl"
                  alt="Profile"
                />
                <div className="absolute -bottom-2 -right-2 bg-green-500 p-2 rounded-full border-4 border-white">
                  <ShieldCheck size={20} className="text-white" />
                </div>
              </div>

              <div className="md:ml-6 flex-1">
                <h1 className="text-4xl font-black text-gray-900 mb-1">
                  {profile.full_name}
                </h1>
                <div className="flex flex-wrap gap-3 mb-4">
                  <span className="flex items-center text-sm text-gray-600">
                    <Mail size={16} className="mr-1" /> {profile.email}
                  </span>
                  <span className="flex items-center text-sm text-gray-600">
                    <BookOpen size={16} className="mr-1" /> {profile.department}
                  </span>
                  <span className="flex items-center text-sm font-bold uppercase tracking-wider">
                    <User size={16} className="mr-1 text-blue-600" />
                    <span className="text-blue-600">{profile.role}</span>
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition shadow-lg ${
                  isEditing ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isEditing ? (
                  <> <X size={20} /> <span>İptal</span> </>
                ) : (
                  <> <Edit3 size={20} /> <span>Düzenle</span> </>
                )}
              </button>
            </div>

            {/* Bio Section */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Hakkımda</h3>
              {isEditing ? (
                <div className="space-y-4">
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
                    rows="3"
                    placeholder="Kendin hakkında bir şeyler yaz..."
                  />
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    <input
                      type="text"
                      value={editForm.interests}
                      onChange={(e) => setEditForm({ ...editForm, interests: e.target.value })}
                      className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="İlgi alanların (virgülle ayır)"
                    />
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="w-full md:w-auto flex items-center justify-center space-x-2 bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition disabled:opacity-50"
                    >
                      {saving ? <><Loader2 className="animate-spin" size={20} /> <span>Kaydediliyor...</span></> : <><Save size={20} /> <span>Kaydet</span></>}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-700 mb-3 italic">
                    {profile.bio || "Henüz bir biyografi eklenmemiş."}
                  </p>
                  {profile.interests && (
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.split(',').map((interest, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                          {interest.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            const colors = {
              blue: 'from-blue-500 to-indigo-600',
              green: 'from-green-500 to-emerald-600',
              yellow: 'from-yellow-500 to-orange-600'
            };
            return (
              <div key={idx} className="bg-white rounded-2xl p-6 border-2 border-gray-50 hover:shadow-xl transition-shadow group">
                <div className={`w-12 h-12 bg-gradient-to-br ${colors[stat.color]} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="text-white" size={24} />
                </div>
                <div className="text-4xl font-black text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500 font-bold uppercase tracking-widest">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Participated Events */}
          <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-50 p-8">
            <h3 className="text-xl font-black mb-6 flex items-center text-gray-800">
              <Calendar className="mr-3 text-blue-600" size={24} />
              Katıldığım Etkinlikler
            </h3>
            {activities.participated_events.length > 0 ? (
              <div className="space-y-3">
                {activities.participated_events.slice(0, 5).map(ev => (
                  <div key={ev.id} className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 hover:border-blue-300 transition-colors">
                    <h4 className="font-bold text-gray-900">{ev.title}</h4>
                    <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
                      <span className="text-blue-600">{ev.club_name}</span>
                      <span>{new Date(ev.date).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <Target size={48} className="mx-auto mb-3 opacity-20" />
                <p className="font-bold">Henüz bir etkinliğe katılmadın.</p>
              </div>
            )}
          </div>

          {/* Followed Clubs */}
          <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-50 p-8">
            <h3 className="text-xl font-black mb-6 flex items-center text-gray-800">
              <ShieldCheck className="mr-3 text-green-600" size={24} />
              Takip Ettiğim Kulüpler
            </h3>
            {activities.followed_clubs.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {activities.followed_clubs.map(club => (
                  <div key={club.id} className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl font-bold border border-green-100 hover:bg-green-600 hover:text-white transition-all cursor-default">
                    <ShieldCheck size={16} />
                    {club.name}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <TrendingUp size={48} className="mx-auto mb-3 opacity-20" />
                <p className="font-bold">Henüz bir kulüp takip etmiyorsun.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}