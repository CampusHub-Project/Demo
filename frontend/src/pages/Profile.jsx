import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
  User, Mail, BookOpen, Calendar, ShieldCheck, Edit3, 
  Save, X, Award, Loader2, Camera, Link, Check, MessageSquare, ArrowRight, Palette
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

// Kapak için renk seçenekleri
const PRESET_GRADIENTS = [
  { id: 'blue', class: 'from-blue-600 via-indigo-600 to-purple-600', color: '#4f46e5' },
  { id: 'sunset', class: 'from-orange-500 via-pink-600 to-rose-600', color: '#e11d48' },
  { id: 'emerald', class: 'from-emerald-500 via-teal-600 to-cyan-700', color: '#0d9488' },
  { id: 'midnight', class: 'from-gray-800 via-slate-900 to-black', color: '#1e293b' },
  { id: 'royal', class: 'from-indigo-600 via-purple-600 to-blue-700', color: '#7c3aed' },
];

export default function Profile() {
  const navigate = useNavigate();
  const toast = useToast();
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('none');
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [showPalette, setShowPalette] = useState(false); // Renk seçici kontrolü
  const [selectedBg, setSelectedBg] = useState(PRESET_GRADIENTS[0]); // Seçili gradient
  
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
    { id: 'events', label: 'Etkinlik Katılımı', value: activities?.participated_events?.length || 0, icon: Calendar },
    { id: 'clubs', label: 'Takip Edilen Kulüp', value: activities?.followed_clubs?.length || 0, icon: ShieldCheck },
    { id: 'points', label: 'Kampüs Puanı', value: (activities?.participated_events?.length || 0) * 10, icon: Award }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-0 pb-20">
      {/* 1. ÖZELLEŞTİRİLEBİLİR KAPAK ALANI */}
      <div className={`relative h-56 md:h-64 w-full bg-gradient-to-r transition-all duration-700 ${selectedBg.class}`}>
        {/* Dekoratif Şekiller */}
        <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none italic uppercase font-black text-white text-[15rem] leading-none select-none">
          {profile.full_name[0]}
        </div>

        {/* Renk Seçici Buton */}
        <div className="absolute top-6 right-6 z-30">
          <button 
            onClick={() => setShowPalette(!showPalette)}
            className="bg-white/20 backdrop-blur-md text-white p-3 rounded-2xl hover:bg-white/30 transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-widest border border-white/20"
          >
            <Palette size={18} /> Kapağı Özelleştir
          </button>
          
          <AnimatePresence>
            {showPalette && (
              <motion.div 
                initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }}
                className="absolute top-14 right-0 bg-white p-4 rounded-3xl shadow-2xl flex gap-3 border border-gray-100 min-w-max"
              >
                {PRESET_GRADIENTS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => { setSelectedBg(g); setShowPalette(false); }}
                    className={`w-8 h-8 rounded-xl bg-gradient-to-br ${g.class} relative flex items-center justify-center transition-transform hover:scale-110 shadow-sm`}
                  >
                    {selectedBg.id === g.id && <Check className="text-white" size={14} />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {/* 2. PROFİL ANA KART (İsim Beyaz Bölümde) */}
        <div className="bg-white rounded-[3rem] shadow-xl border-2 border-gray-50 -mt-24 relative z-10 overflow-hidden mb-8">
          <div className="px-8 py-10 text-left">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
              {/* Profil Fotoğrafı (Seçili Gradient Rengiyle Çevrili) */}
              <div className="relative group shrink-0">
                <div className={`p-1.5 rounded-[2.5rem] bg-gradient-to-tr ${selectedBg.class} shadow-2xl`}>
                  <img
                    src={profile.profile_photo || `https://ui-avatars.com/api/?name=${profile.full_name}&background=${selectedBg.color.replace('#','')}&color=fff`}
                    className="w-40 h-40 rounded-[2rem] object-cover border-4 border-white transition-all group-hover:brightness-75"
                    alt="Profile"
                  />
                </div>
                <button 
                  onClick={() => setIsEditingPhoto(!isEditingPhoto)}
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white z-20"
                >
                  <Camera size={32} />
                </button>
              </div>

              {/* İSİM VE BİLGİLER (BEYAZ ALANDA) */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2 tracking-tighter uppercase italic leading-none">
                  {profile.full_name}
                </h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6 font-bold">
                  <span className="flex items-center text-xs text-gray-400 italic"><Mail size={14} className="mr-1 text-gray-300" /> {profile.email}</span>
                  <span className="flex items-center text-xs text-gray-400"><BookOpen size={14} className="mr-1 text-gray-300" /> {profile.department}</span>
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-gray-50 text-indigo-500 border border-indigo-50`}>
                    {profile.role}
                  </span>
                </div>
                
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`flex items-center mx-auto md:mx-0 space-x-2 px-8 py-3 rounded-2xl font-black uppercase italic text-xs tracking-widest transition shadow-lg ${
                    isEditing ? 'bg-gray-100 text-gray-500' : 'bg-gray-900 text-white hover:bg-black'
                  }`}
                >
                  {isEditing ? <><X size={16} /> İptal</> : <><Edit3 size={16} /> Profili Düzenle</>}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {isEditingPhoto && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-8">
                  <div className="bg-gray-50 p-6 rounded-[2rem] border-2 border-dashed border-gray-200 flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full relative">
                      <Link size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" value={tempPhotoUrl} onChange={(e) => setTempPhotoUrl(e.target.value)}
                        placeholder="Yeni fotoğraf URL'sini buraya yapıştırın..."
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-transparent outline-none focus:border-indigo-500 focus:bg-white text-sm font-bold shadow-inner"
                      />
                    </div>
                    <button onClick={handlePhotoSave} disabled={saving} className="w-full md:w-auto bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase italic tracking-widest flex items-center justify-center gap-2">
                      {saving ? <Loader2 className="animate-spin" size={18}/> : <Check size={18}/>} GÜNCELLE
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hakkımda Bölümü */}
            <div className="bg-gray-50/50 rounded-[2rem] p-8 border border-gray-100">
              <h3 className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-[0.2em] italic"># KAMPÜS BİYOGRAFİSİ</h3>
              {isEditing ? (
                <div className="space-y-4">
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    className="w-full border-2 border-gray-100 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500 focus:bg-white resize-none transition-all font-medium text-gray-700"
                    rows="3"
                    placeholder="Kendinizden bahsedin..."
                  />
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    <input
                      type="text" value={editForm.interests}
                      onChange={(e) => setEditForm({ ...editForm, interests: e.target.value })}
                      className="flex-1 border-2 border-gray-100 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500 focus:bg-white font-medium"
                      placeholder="İlgi alanları (Spor, Yazılım, Sanat...)"
                    />
                    <button onClick={handleSave} disabled={saving} className="w-full md:w-auto bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black uppercase italic tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-100">
                      {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} KAYDET
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-left">
                  <p className="text-gray-700 mb-6 font-medium italic leading-relaxed text-lg">
                    {profile.bio ? `"${profile.bio}"` : "Henüz bir biyografi eklenmemiş."}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests?.split(',').map((interest, idx) => (
                      <span key={idx} className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter bg-white border border-gray-100 shadow-sm text-gray-600 hover:text-indigo-600 transition-colors`}>
                        #{interest.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. İSTATİSTİK KARTLARI (Dinamik Renkli) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <div 
              key={stat.id} 
              onClick={() => stat.id !== 'points' && setActiveTab(activeTab === stat.id ? 'none' : stat.id)}
              className={`bg-white rounded-[2.5rem] p-8 border-2 transition-all cursor-pointer group shadow-sm hover:shadow-xl ${
                activeTab === stat.id ? 'border-indigo-500 ring-8 ring-indigo-50' : 'border-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-4 rounded-2xl bg-gray-50 transition-transform group-hover:scale-110`} style={{ color: selectedBg.color }}>
                  <stat.icon size={28} />
                </div>
                {stat.id !== 'points' && (
                  <ArrowRight size={20} className={`text-gray-200 transition-transform ${activeTab === stat.id ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                )}
              </div>
              <div className="text-left">
                <div className="text-5xl font-black text-gray-900 mb-1 tracking-tighter italic">{stat.value}</div>
                <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 4. DİNAMİK LİSTE PANELİ */}
        <AnimatePresence mode="wait">
          {activeTab !== 'none' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className={`bg-white rounded-[3rem] shadow-2xl border-2 border-indigo-50 p-8 md:p-12 mb-8 overflow-hidden`}
            >
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter italic flex items-center">
                  {activeTab === 'events' ? <><Calendar className="mr-4 text-blue-500" size={32}/> Etkinlik Geçmişim</> : <><ShieldCheck className="mr-4 text-emerald-500" size={32}/> Takip Listem</>}
                </h3>
                <button onClick={() => setActiveTab('none')} className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-2xl flex items-center justify-center transition text-gray-400">
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeTab === 'events' ? (
                  activities.participated_events.length > 0 ? activities.participated_events.map(event => (
                    <div 
                      key={event.id}
                      onClick={() => navigate(`/events/${event.id}`)}
                      className="group bg-white p-2 pb-6 rounded-[2rem] border border-gray-100 hover:shadow-xl transition-all cursor-pointer text-left"
                    >
                      <div className="h-40 rounded-[1.5rem] overflow-hidden mb-4 relative">
                        <img src={event.image_url || 'https://via.placeholder.com/300x150'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest text-indigo-600 shadow-sm">
                          ETKİNLİK
                        </div>
                      </div>
                      <div className="px-4">
                        <h4 className="font-black text-gray-900 text-sm uppercase italic tracking-tight group-hover:text-indigo-600 transition line-clamp-1">{event.title}</h4>
                        <div className="flex items-center mt-2 text-gray-400 font-bold text-[10px]">
                          <Calendar size={12} className="mr-2 text-indigo-400" />
                          <span className="uppercase">{event.date}</span>
                        </div>
                      </div>
                    </div>
                  )) : <p className="col-span-full text-center py-20 text-gray-300 font-black italic uppercase tracking-widest">Henüz bir etkinlikte bulunmadınız.</p>
                ) : (
                  activities.followed_clubs.length > 0 ? activities.followed_clubs.map(club => (
                    <div 
                      key={club.id}
                      onClick={() => navigate(`/clubs/${club.id}`)}
                      className="flex items-center p-6 bg-white rounded-[2rem] border border-gray-100 hover:shadow-xl transition-all cursor-pointer group"
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black mr-4 shadow-lg group-hover:rotate-12 transition-transform uppercase text-white bg-gradient-to-br ${selectedBg.class}`}>
                        {club.name[0]}
                      </div>
                      <div className="text-left">
                        <h4 className="font-black text-gray-900 text-sm uppercase italic tracking-tight">{club.name}</h4>
                        <p className="text-[8px] text-gray-400 font-black tracking-[0.2em] uppercase mt-1 group-hover:text-indigo-600 transition-colors">PROFİLİ GÖR →</p>
                      </div>
                    </div>
                  )) : <p className="col-span-full text-center py-20 text-gray-300 font-black italic uppercase tracking-widest">Henüz bir kulübü takip etmediniz.</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 5. ALT KISIM: Yorumlar Bölümü */}
        <div className="bg-white rounded-[3rem] shadow-xl border-2 border-gray-50 p-10">
          <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center tracking-tighter uppercase italic leading-none">
            <MessageSquare size={28} className="mr-4 text-indigo-600" /> Tartışmalardaki İzlerim
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activities?.comments?.length > 0 ? activities.comments.map((comment) => (
              <div 
                key={comment.id} 
                onClick={() => navigate(`/events/${comment.event_id}`)}
                className="p-8 bg-gray-50 rounded-[2.5rem] border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-2xl transition-all duration-500 group relative overflow-hidden text-left"
              >
                <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${selectedBg.class} opacity-20`}></div>
                <p className="text-lg text-gray-700 font-medium italic mb-6 leading-relaxed">"{comment.content}"</p>
                <div className="flex justify-between items-end">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">YORUM YAPILAN ETKİNLİK</span>
                    <span className="text-xs font-black text-indigo-600 uppercase italic tracking-tight group-hover:underline">
                      {comment.event_title}
                    </span>
                  </div>
                  <ArrowRight size={20} className="text-indigo-400 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            )) : (
              <div className="col-span-2 text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100 text-gray-300 font-black italic uppercase tracking-widest">
                Henüz bir fikir paylaşmadınız.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}