import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  User, Mail, BookOpen, Calendar, ShieldCheck, Edit3, 
  Save, X, Award, Loader2, Camera, Link, Check, MessageSquare, 
  ArrowRight, Palette, Building2, MapPin, Clock, Sparkles, ExternalLink,
  ArrowLeft // <-- HATA BURADAYDI, EKLENDİ
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const PRESET_GRADIENTS = [
  { id: 'blue', class: 'from-blue-600 via-indigo-600 to-purple-600', color: '#4f46e5' },
  { id: 'sunset', class: 'from-orange-500 via-pink-600 to-rose-600', color: '#e11d48' },
  { id: 'emerald', class: 'from-emerald-500 via-teal-600 to-cyan-700', color: '#0d9488' },
  { id: 'midnight', class: 'from-gray-800 via-slate-900 to-black', color: '#1e293b' },
  { id: 'royal', class: 'from-indigo-600 via-purple-600 to-blue-700', color: '#7c3aed' },
];

export default function Profile() {
  const { userId } = useParams(); 
  const { user: authUser } = useAuth(); 
  const navigate = useNavigate();
  const toast = useToast();

  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('none');
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [selectedBg, setSelectedBg] = useState(PRESET_GRADIENTS[0]);
  
  const [tempPhotoUrl, setTempPhotoUrl] = useState('');
  const [editForm, setEditForm] = useState({ bio: '', interests: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isOwnProfile = !userId || String(userId) === String(authUser?.sub || authUser?.id);
  const targetId = userId || authUser?.id || authUser?.sub;

  useEffect(() => {
    if (targetId) fetchProfile();
  }, [userId, targetId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      let response;
      if (isOwnProfile) {
        response = await api.get('/users/profile');
      } else {
        try {
          response = await api.get(`/users/${targetId}`);
        } catch (err) {
          response = await api.get(`/users/${targetId}/profile`);
        }
      }

      const data = response.data.user || response.data;
      setProfileData(data);
      
      setTempPhotoUrl(data.profile?.profile_photo || '');
      setEditForm({
        bio: data.profile?.bio || '',
        interests: data.profile?.interests || ''
      });

      const savedBgId = localStorage.getItem(`profile_bg_${data.profile?.id}`);
      if (savedBgId) {
        const bg = PRESET_GRADIENTS.find(g => g.id === savedBgId);
        if (bg) setSelectedBg(bg);
      }
    } catch (err) {
      toast.error("Profil bilgileri senkronize edilemedi.");
      if (!isOwnProfile) navigate('/discover');
    } finally {
      setLoading(false);
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
      toast.success('✅ Profil güncellendi!');
    } catch (err) {
      toast.error("Güncelleme başarısız.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoSave = async () => {
    setSaving(true);
    try {
      await api.put('/users/profile', { profile_photo: tempPhotoUrl });
      setProfileData(prev => ({
        ...prev,
        profile: { ...prev.profile, profile_photo: tempPhotoUrl }
      }));
      setIsEditingPhoto(false);
      toast.success('📸 Fotoğraf güncellendi!');
    } catch (err) {
      toast.error("Hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Kampüs Verileri İşleniyor..." />;
  if (!profileData) return null;

  const { profile, activities } = profileData;

  const statCards = [
    { id: 'events', label: 'Etkinlik Katılımı', value: activities?.participated_events?.length || 0, icon: Calendar },
    { id: 'clubs', label: 'Takip Edilen Kulüp', value: activities?.followed_clubs?.length || 0, icon: ShieldCheck },
    { id: 'points', label: 'Kampüs Puanı', value: (activities?.participated_events?.length || 0) * 10, icon: Award }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans text-left selection:bg-indigo-100">
      
      {/* 1. KAPAK */}
      <div className={`relative h-64 w-full bg-gradient-to-r transition-all duration-700 ${selectedBg.class} shadow-inner`}>
        <button onClick={() => navigate(-1)} className="absolute top-8 left-8 p-4 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-white/30 transition-all border border-white/20 shadow-xl z-30">
          <ArrowLeft size={24} />
        </button>
        <div className="absolute inset-0 overflow-hidden opacity-10 italic uppercase font-black text-white text-[15rem] leading-none select-none flex items-center justify-center">
          {profile?.full_name ? profile.full_name[0] : 'U'}
        </div>

        {isOwnProfile && (
          <div className="absolute top-8 right-8 z-30">
            <button onClick={() => setShowPalette(!showPalette)} className="bg-white/20 backdrop-blur-md text-white p-3 rounded-2xl hover:bg-white/30 border border-white/20 shadow-xl italic font-black text-[10px] uppercase">
              <Palette size={18} className="mr-2 inline" /> Stil
            </button>
            <AnimatePresence>
              {showPalette && (
                <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="absolute top-14 right-0 bg-white p-4 rounded-3xl shadow-2xl flex gap-3 border border-gray-100 min-w-max">
                  {PRESET_GRADIENTS.map((g) => (
                    <button key={g.id} onClick={() => { setSelectedBg(g); localStorage.setItem(`profile_bg_${profile.id}`, g.id); setShowPalette(false); }} className={`w-8 h-8 rounded-xl bg-gradient-to-br ${g.class} relative transition-transform hover:scale-110 shadow-sm`}>
                      {selectedBg.id === g.id && <Check className="text-white mx-auto" size={14} />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 text-left">
        {/* 2. KİMLİK KARTI */}
        <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 -mt-24 relative z-10 overflow-hidden mb-12">
          <div className="px-10 py-12">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-10 mb-12">
              <div className="relative group shrink-0">
                <div className={`p-1.5 rounded-[4rem] bg-gradient-to-tr ${selectedBg.class} shadow-2xl`}>
                  <img src={profile.profile_photo || `https://ui-avatars.com/api/?name=${profile.full_name}&background=fff&color=${selectedBg.color.replace('#','')}`} className="w-48 h-48 rounded-[3.5rem] object-cover border-8 border-white bg-white" alt="avatar" />
                </div>
                {isOwnProfile && (
                  <button onClick={() => setIsEditingPhoto(!isEditingPhoto)} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-[3.5rem] text-white z-20"><Camera size={40} /></button>
                )}
              </div>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-4 tracking-tighter uppercase italic leading-none">{profile.full_name}</h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-8 font-black uppercase italic">
                  {isOwnProfile && <span className="flex items-center text-[10px] text-gray-400 tracking-widest"><Mail size={14} className="mr-2 text-indigo-500" /> {profile.email}</span>}
                  <span className="flex items-center text-[10px] text-gray-400 tracking-widest"><BookOpen size={14} className="mr-2 text-indigo-500" /> {profile.department}</span>
                  <span className="px-3 py-1 rounded-lg text-[9px] font-black tracking-[0.2em] bg-indigo-50 text-indigo-600 border border-indigo-100">{profile.role}</span>
                </div>
                {isOwnProfile && (
                  <button onClick={() => setIsEditing(!isEditing)} className={`flex items-center mx-auto md:mx-0 space-x-3 px-12 py-5 rounded-2xl font-black uppercase italic text-xs tracking-widest transition-all shadow-xl active:scale-95 ${isEditing ? 'bg-gray-100 text-gray-500' : 'bg-gray-900 text-white hover:bg-black'}`}>
                    {isEditing ? <><X size={20} /> İptal</> : <><Edit3 size={20} /> Profili Düzenle</>}
                  </button>
                )}
              </div>
            </div>

            {/* Hakkımda */}
            <div className="bg-gray-50/50 rounded-[3rem] p-12 border border-gray-100 text-left">
              <h3 className="text-[10px] font-black text-indigo-600 uppercase mb-8 tracking-[0.4em] italic flex items-center gap-2"><Sparkles size={16}/> # Kampüs Manifestosu</h3>
              {isEditing ? (
                <div className="space-y-6">
                  <textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} className="w-full border-2 border-gray-100 rounded-[2rem] px-8 py-6 outline-none focus:border-indigo-500 focus:bg-white resize-none transition-all font-medium text-gray-700 shadow-inner text-xl" rows="4" placeholder="Kendinizden bahsedin..." />
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    <input type="text" value={editForm.interests} onChange={(e) => setEditForm({ ...editForm, interests: e.target.value })} className="flex-1 border-2 border-gray-100 rounded-[2rem] px-8 py-6 outline-none focus:border-indigo-500 shadow-inner font-bold italic" placeholder="İlgi alanları..." />
                    <button onClick={handleSave} disabled={saving} className="w-full md:w-auto bg-emerald-600 text-white px-14 py-6 rounded-[2rem] font-black uppercase italic tracking-widest shadow-2xl active:scale-95 transition-all flex items-center gap-3">
                      {saving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />} KAYDET
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-800 mb-10 font-medium italic leading-relaxed text-3xl max-w-5xl opacity-90 text-left">
                    {profile.bio ? `"${profile.bio}"` : "Henüz bir manifesto yazılmadı."}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {profile.interests?.split(',').map((interest, idx) => (
                      <span key={idx} className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-white border border-gray-100 shadow-sm text-gray-500 hover:text-indigo-600 transition-all">
                        #{interest.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. İSTATİSTİKLER */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {statCards.map((stat) => (
            <motion.div whileHover={{ y: -10 }} key={stat.id} onClick={() => stat.id !== 'points' && setActiveTab(activeTab === stat.id ? 'none' : stat.id)}
              className={`bg-white rounded-[4rem] p-12 border-4 transition-all cursor-pointer group shadow-xl ${activeTab === stat.id ? 'border-indigo-500 bg-indigo-50/20' : 'border-white'}`}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="p-5 rounded-3xl bg-gray-50 transition-transform group-hover:rotate-12 shadow-inner" style={{ color: selectedBg.color }}><stat.icon size={40} /></div>
                {stat.id !== 'points' && <ArrowRight size={28} className={`text-gray-200 transition-all ${activeTab === stat.id ? 'rotate-90 text-indigo-500' : 'group-hover:translate-x-2'}`} />}
              </div>
              <div className="text-left font-black uppercase">
                <div className="text-7xl text-gray-900 mb-2 tracking-tighter italic leading-none">{stat.value}</div>
                <div className="text-[11px] text-gray-400 tracking-[0.3em] italic">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 4. DİNAMİK PANEL */}
        <AnimatePresence mode="wait">
          {activeTab !== 'none' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-white rounded-[5rem] shadow-2xl border-2 border-gray-50 p-12 md:p-20 mb-16 overflow-hidden text-left">
              <div className="flex justify-between items-center mb-16">
                <h3 className="text-5xl font-black text-gray-900 uppercase tracking-tighter italic flex items-center">
                  {activeTab === 'events' ? <><Calendar className="mr-6 text-rose-500" size={56}/> Etkinlik Arşivi</> : <><ShieldCheck className="mr-6 text-indigo-500" size={56}/> Topluluk Portföyü</>}
                </h3>
                <button onClick={() => setActiveTab('none')} className="w-16 h-16 bg-gray-50 hover:bg-red-50 hover:text-red-500 rounded-3xl flex items-center justify-center transition-all text-gray-400 shadow-inner"><X size={32} /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {activeTab === 'events' ? (
                  activities?.participated_events?.length > 0 ? activities.participated_events.map(event => (
                    <motion.div whileHover={{ y: -8 }} key={event.id} onClick={() => navigate(`/events/${event.id}`)} className="group bg-gray-50 p-4 pb-10 rounded-[3rem] border border-transparent hover:border-rose-100 hover:bg-white hover:shadow-2xl transition-all cursor-pointer text-left">
                      <div className="h-56 rounded-[2.5rem] overflow-hidden mb-6 relative shadow-lg">
                        <img src={event.image_url || 'https://via.placeholder.com/600x400'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="event" />
                        <div className="absolute top-5 left-5 bg-white/95 backdrop-blur px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-rose-600 shadow-sm italic">KATILDI</div>
                      </div>
                      <div className="px-4 text-left font-black uppercase italic">
                        <h4 className="text-gray-900 text-xl tracking-tighter leading-tight group-hover:text-rose-600 transition-all mb-4 line-clamp-2">{event.title}</h4>
                        <div className="flex flex-col gap-2">
                           <div className="flex items-center text-gray-400 text-[10px] tracking-widest"><MapPin size={14} className="mr-2 text-rose-400" /> {event.location}</div>
                           <div className="flex items-center text-gray-400 text-[10px] tracking-widest"><Clock size={14} className="mr-2 text-indigo-400" /> {event.date}</div>
                        </div>
                      </div>
                    </motion.div>
                  )) : <div className="col-span-full py-20 text-center text-gray-300 font-black italic uppercase tracking-widest">Etkinlik verisi yok.</div>
                ) : (
                  activities?.followed_clubs?.length > 0 ? activities.followed_clubs.map(club => (
                    <motion.div whileHover={{ scale: 1.05 }} key={club.id} onClick={() => navigate(`/clubs/${club.id}`)} className="flex items-center p-10 bg-gray-50 rounded-[3.5rem] border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-2xl transition-all cursor-pointer group text-left">
                      <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center font-black mr-8 shadow-2xl group-hover:rotate-12 transition-transform uppercase text-white text-3xl bg-gradient-to-br ${selectedBg.class}`}>
                        {club.name[0]}
                      </div>
                      <div className="text-left font-black uppercase italic">
                        <h4 className="text-gray-900 text-2xl tracking-tighter mb-1 leading-none">{club.name}</h4>
                        <p className="text-[9px] text-indigo-500 tracking-[0.3em] not-italic font-bold">PROFİLİ GÖR →</p>
                      </div>
                    </motion.div>
                  )) : <div className="col-span-full py-20 text-center text-gray-300 font-black italic uppercase tracking-widest">Takip edilen topluluk yok.</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 5. TARTIŞMA AKIŞI */}
        <div className="bg-white rounded-[5rem] shadow-2xl border border-gray-100 p-12 md:p-20 text-left mb-20">
          <h3 className="text-4xl font-black text-gray-900 mb-16 flex items-center tracking-tighter uppercase italic leading-none">
            <MessageSquare size={48} className="mr-6 text-emerald-600" /> Fikir Arşivi
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {activities?.comments?.length > 0 ? activities.comments.map((comment) => (
              <div key={comment.id} onClick={() => navigate(`/events/${comment.event_id}`)} className="p-12 bg-[#fdfdfd] rounded-[4rem] border border-gray-100 hover:border-emerald-200 hover:bg-white hover:shadow-2xl transition-all duration-700 group relative overflow-hidden text-left cursor-pointer border-l-8" style={{ borderLeftColor: selectedBg.color }}>
                <p className="text-2xl text-gray-700 font-medium italic mb-10 leading-relaxed opacity-90">"{comment.content}"</p>
                <div className="flex justify-between items-end pt-8 border-t border-gray-50 font-black uppercase italic">
                  <div className="flex flex-col gap-3">
                    <span className="text-[10px] text-gray-400 tracking-[0.3em]">YAYINLANDIĞI DUVAR:</span>
                    <span className="text-lg text-emerald-600 tracking-tighter group-hover:underline">{comment.event_title || "Bir Etkinlik"}</span>
                  </div>
                  <div className="w-14 h-14 rounded-3xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:translate-x-3 transition-all shadow-sm">
                    <ArrowRight size={28} />
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-32 bg-gray-50 rounded-[4rem] border-4 border-dashed border-gray-100 text-gray-300 font-black italic uppercase tracking-[0.4em]">Henüz bir yorum paylaşılmadı.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}