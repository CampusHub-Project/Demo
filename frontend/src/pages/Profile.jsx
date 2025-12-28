import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
  User, Mail, BookOpen, Calendar, ShieldCheck, Edit3, 
  Save, X, Award, Loader2, Camera, Link, Check, MessageSquare, ArrowRight, ChevronDown
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Profile() {
  const navigate = useNavigate();
  const toast = useToast();
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Detay paneli yönetimi: 'none', 'events', 'clubs'
  const [activeTab, setActiveTab] = useState('none');
  
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [tempPhotoUrl, setTempPhotoUrl] = useState('');
  const [editForm, setEditForm] = useState({ bio: '', interests: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/users/profile');
      setProfileData(data);
      setTempPhotoUrl(data.profile.profile_photo || '');
      setEditForm({
        bio: data.profile.bio || '',
        interests: data.profile.interests || ''
      });
    } catch (err) {
      toast.error("Profil bilgileri yüklenemedi.");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/users/profile', editForm);
      setProfileData(prev => ({
        ...prev,
        profile: { ...prev.profile, bio: editForm.bio, interests: editForm.interests }
      }));
      setIsEditing(false);
      toast.success('✅ Profil başarıyla güncellendi!');
    } catch (err) {
      toast.error(err.response?.data?.error || "Güncelleme işlemi başarısız.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoSave = async () => {
    if (tempPhotoUrl && !tempPhotoUrl.startsWith('http')) {
      toast.error("Lütfen geçerli bir URL girin");
      return;
    }
    setSaving(true);
    try {
      await api.put('/users/profile', { profile_photo: tempPhotoUrl });
      setProfileData(prev => ({
        ...prev,
        profile: { ...prev.profile, profile_photo: tempPhotoUrl }
      }));
      setIsEditingPhoto(false);
      toast.success('📸 Profil fotoğrafı güncellendi!');
    } catch (err) {
      toast.error("Fotoğraf güncellenirken bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  if (!profileData) return <LoadingSpinner size="lg" text="Profil yükleniyor..." />;

  const { profile, activities } = profileData;

  const stats = [
    { 
      id: 'events', 
      label: 'Etkinlik Katılımı', 
      value: activities?.participated_events?.length || 0, 
      icon: Calendar, 
      color: 'blue' 
    },
    { 
      id: 'clubs', 
      label: 'Takip Edilen Kulüp', 
      value: activities?.followed_clubs?.length || 0, 
      icon: ShieldCheck, 
      color: 'green' 
    },
    { 
      id: 'points', 
      label: 'Kampüs Puanı', 
      value: (activities?.participated_events?.length || 0) * 10, 
      icon: Award, 
      color: 'yellow' 
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Üst Kart: Profil Özeti */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 overflow-hidden mb-8">
          <div className="h-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
          
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 mb-6">
              <div className="relative mb-4 md:mb-0 group">
                <img
                  src={profile.profile_photo || `https://ui-avatars.com/api/?name=${profile.full_name}&background=6366f1&color=fff`}
                  className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-xl transition-all group-hover:brightness-75"
                  alt="Profile"
                />
                <button 
                  onClick={() => setIsEditingPhoto(!isEditingPhoto)}
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                >
                  <Camera size={32} />
                </button>
              </div>

              <div className="md:ml-6 flex-1 text-left">
                <h1 className="text-4xl font-black text-gray-900 mb-1 tracking-tighter uppercase">{profile.full_name}</h1>
                <div className="flex flex-wrap gap-3 mb-4 font-bold">
                  <span className="flex items-center text-sm text-gray-500 italic"><Mail size={16} className="mr-1" /> {profile.email}</span>
                  <span className="flex items-center text-sm text-gray-500"><BookOpen size={16} className="mr-1" /> {profile.department}</span>
                  <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{profile.role}</span>
                </div>
              </div>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition shadow-lg ${
                  isEditing ? 'bg-gray-200 text-gray-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isEditing ? <><X size={20} /> <span>İptal</span></> : <><Edit3 size={20} /> <span>Düzenle</span></>}
              </button>
            </div>

            <AnimatePresence>
              {isEditingPhoto && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
                  <div className="bg-indigo-50 p-4 rounded-2xl border-2 border-indigo-100 flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full relative">
                      <Link size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
                      <input 
                        type="text" value={tempPhotoUrl} onChange={(e) => setTempPhotoUrl(e.target.value)}
                        placeholder="Profil fotoğrafı URL'sini yapıştırın..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-white outline-none focus:border-indigo-300 text-sm"
                      />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <button onClick={handlePhotoSave} disabled={saving} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2">
                         {saving ? <Loader2 className="animate-spin" size={18}/> : <Check size={18}/>} Onayla
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h3 className="text-xs font-black text-gray-400 uppercase mb-3 tracking-widest text-left">Hakkımda</h3>
              {isEditing ? (
                <div className="space-y-4">
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all"
                    rows="3"
                    placeholder="Biyografinizi yazın..."
                  />
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    <input
                      type="text" value={editForm.interests}
                      onChange={(e) => setEditForm({ ...editForm, interests: e.target.value })}
                      className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="İlgi alanları (virgülle ayırın)"
                    />
                    <button onClick={handleSave} disabled={saving} className="w-full md:w-auto bg-green-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2">
                      {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} <span>Kaydet</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-left">
                  <p className="text-gray-700 mb-4 italic leading-relaxed">{profile.bio || "Henüz bir biyografi eklenmemiş."}</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests?.split(',').map((interest, idx) => (
                      <span key={idx} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-tighter">
                        #{interest.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* İstatistik Kartları (Tıklanabilir) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <div 
              key={stat.id} 
              onClick={() => stat.id !== 'points' && setActiveTab(activeTab === stat.id ? 'none' : stat.id)}
              className={`bg-white rounded-3xl p-6 border-2 transition-all cursor-pointer group shadow-sm hover:shadow-xl ${
                activeTab === stat.id ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-4 rounded-2xl bg-gray-50 text-indigo-500 group-hover:scale-110 transition-transform`}>
                  <stat.icon size={24} />
                </div>
                {stat.id !== 'points' && (
                  <ArrowRight size={18} className={`text-gray-300 transition-transform ${activeTab === stat.id ? 'rotate-90 text-indigo-500' : 'group-hover:translate-x-1'}`} />
                )}
              </div>
              <div className="text-left">
                <div className="text-4xl font-black text-gray-900 mb-1">{stat.value}</div>
                <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Dinamik Liste Paneli */}
        <AnimatePresence mode="wait">
          {activeTab !== 'none' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl shadow-xl border-2 border-indigo-100 p-8 mb-8 overflow-hidden"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tighter italic flex items-center">
                  {activeTab === 'events' ? <><Calendar className="mr-3 text-blue-500"/> Katıldığım Etkinlikler</> : <><ShieldCheck className="mr-3 text-green-500"/> Takip Ettiğim Kulüpler</>}
                </h3>
                <button onClick={() => setActiveTab('none')} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-400">
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeTab === 'events' ? (
                  activities.participated_events.length > 0 ? activities.participated_events.map(event => (
                    <div 
                      key={event.id}
                      onClick={() => navigate(`/events/${event.id}`)}
                      className="group bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:border-indigo-300 hover:bg-white transition-all cursor-pointer text-left"
                    >
                      <div className="h-32 rounded-xl overflow-hidden mb-3">
                        <img src={event.image_url || 'https://via.placeholder.com/300x150'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <h4 className="font-black text-gray-800 text-sm uppercase group-hover:text-indigo-600 transition">{event.title}</h4>
                      <div className="flex items-center mt-2 text-gray-400">
                        <Calendar size={12} className="mr-1" />
                        <span className="text-[10px] font-bold uppercase">{event.date}</span>
                      </div>
                    </div>
                  )) : <p className="col-span-full text-center py-10 text-gray-400 italic">Henüz bir etkinliğe katılmadınız.</p>
                ) : (
                  activities.followed_clubs.length > 0 ? activities.followed_clubs.map(club => (
                    <div 
                      key={club.id}
                      onClick={() => navigate(`/clubs/${club.id}`)}
                      className="flex items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-green-300 hover:bg-white transition-all cursor-pointer group"
                    >
                      <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center font-black mr-4 shadow-sm group-hover:rotate-12 transition-transform uppercase">
                        {club.name[0]}
                      </div>
                      <div className="text-left">
                        <h4 className="font-black text-gray-800 text-sm uppercase">{club.name}</h4>
                        <p className="text-[9px] text-gray-400 font-black tracking-widest uppercase">KULÜBÜ GÖR →</p>
                      </div>
                    </div>
                  )) : <p className="col-span-full text-center py-10 text-gray-400 italic">Henüz bir kulübü takip etmiyorsunuz.</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ALT KISIM: Yorumlar Bölümü */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-8">
          <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center tracking-tighter uppercase italic">
            <MessageSquare size={20} className="mr-2 text-indigo-500" /> Tartışmalardaki İzlerim
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activities?.comments?.length > 0 ? activities.comments.map((comment) => (
              <div 
                key={comment.id} 
                onClick={() => navigate(`/events/${comment.event_id}`)}
                className="p-5 bg-gray-50 rounded-3xl border border-gray-200 cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 transition-all group relative overflow-hidden text-left"
              >
                <p className="text-xs text-gray-700 font-medium italic mb-3">"{comment.content}"</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                    ETKİNLİK: {comment.event_title}
                  </span>
                  <span className="text-[9px] text-indigo-600 font-black opacity-0 group-hover:opacity-100 transition-opacity">
                    GİT →
                  </span>
                </div>
              </div>
            )) : (
              <div className="col-span-2 text-center py-10 bg-gray-50 rounded-3xl border border-dashed border-gray-300 text-gray-400 font-bold italic text-sm">
                Henüz bir tartışmaya katılmadınız.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}