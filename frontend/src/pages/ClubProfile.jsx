import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Users, Calendar, Loader2, BellRing, ArrowLeft, 
  ShieldCheck, Trash2, Heart, Share2, MapPin, 
  Info, Sparkles, Edit, Save, XCircle, ShieldAlert, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClubProfile() {
  const { clubId } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', description: '' });

  // GÜVENLİ YETKİ KONTROLÜ (Optional Chaining ?. kullanımı beyaz ekranı önler)
  const isAdmin = user?.role === 'admin';
  const isPresidentOfThisClub = user?.role === 'club_admin' && club?.president_id === user?.id;
  const canEdit = isAdmin || isPresidentOfThisClub;

  useEffect(() => {
    if (clubId) fetchClubData();
  }, [clubId]);

  const fetchClubData = async () => {
    setLoading(true);
    try {
      const clubRes = await api.get(`/clubs/${clubId}`);
      const data = clubRes.data.club || clubRes.data;
      
      setClub(data);
      setIsFollowing(data.is_following);
      setEditData({ name: data.name || '', description: data.description || '' });

      // Diğer verileri sessizce çek (Hata alsa da sayfa açılır)
      try {
        const [eRes, mRes] = await Promise.allSettled([
          api.get(`/clubs/${clubId}/events`),
          api.get(`/clubs/${clubId}/members`)
        ]);
        
        if (eRes.status === 'fulfilled') setEvents(eRes.value.data.events || []);
        if (mRes.status === 'fulfilled') setMembers(mRes.value.data.members || []);
      } catch (e) { console.error("Detaylar çekilemedi"); }

    } catch (err) {
      console.error("Kulüp yükleme hatası:", err);
      toast.error("Kulüp bilgileri alınamadı.");
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user) return toast.warning("Giriş yapmalısınız!");
    try {
      await api.post(`/clubs/${clubId}/follow`);
      setIsFollowing(!isFollowing);
      setClub(prev => ({
        ...prev,
        follower_count: isFollowing ? prev.follower_count - 1 : prev.follower_count + 1
      }));
      toast.success(isFollowing ? "Takibi bıraktınız" : "Takip ediliyor");
    } catch (err) { toast.error("İşlem başarısız"); }
  };

  // YÜKLEME EKRANI (Zorunlu)
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
      <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
      <p className="font-black uppercase tracking-widest text-gray-400">Yükleniyor...</p>
    </div>
  );

  // VERİ YOKSA (Zorunlu)
  if (!club) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
      <ShieldAlert size={64} className="text-red-500 mb-4" />
      <h2 className="text-2xl font-black uppercase italic">Kulüp Verisi Alınamadı</h2>
      <button onClick={() => navigate('/clubs')} className="mt-4 text-indigo-600 font-bold underline">Listeye Dön</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans text-left relative selection:bg-indigo-100">
      
      {/* ÜYE MODAL */}
      <AnimatePresence>
        {showMembersModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMembersModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden z-[101]">
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Takipçiler & Üyeler</h3>
                <button onClick={() => setShowMembersModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-all text-gray-400"><X size={24}/></button>
              </div>
              <div className="p-8 max-h-[60vh] overflow-y-auto space-y-4">
                {members.length > 0 ? members.map(m => (
                  <div key={m.id} className="flex items-center justify-between group p-3 hover:bg-indigo-50 rounded-2xl transition-all border border-transparent hover:border-indigo-100">
                    <div className="flex items-center gap-4">
                      <img src={`https://ui-avatars.com/api/?name=${m.full_name}&background=6366f1&color=fff`} className="w-12 h-12 rounded-xl" />
                      <div className="text-left">
                        <p className="font-black text-gray-800 uppercase text-sm leading-none mb-1">{m.full_name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{m.department}</p>
                      </div>
                    </div>
                    {canEdit && (
                      <button className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18}/></button>
                    )}
                  </div>
                )) : <p className="text-gray-400 italic text-center py-10">Henüz kimse takip etmiyor.</p>}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NAV BUTONLARI */}
      <div className="fixed top-24 left-0 w-full px-6 md:px-12 z-40 flex justify-between pointer-events-none">
        <button onClick={() => navigate(-1)} className="pointer-events-auto p-4 bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white hover:scale-110 transition-all active:scale-90 shadow-indigo-100/50"><ArrowLeft size={24} /></button>
        {canEdit && (
          <div className="pointer-events-auto flex items-center space-x-3 bg-indigo-600 text-white px-6 py-3 rounded-3xl shadow-xl font-black uppercase text-[10px] tracking-widest italic animate-pulse-slow">
            <ShieldCheck size={18} />
            <span>{isAdmin ? 'Sistem Admini' : 'Kulüp Başkanı'}</span>
          </div>
        )}
      </div>

      {/* HERO SECTION */}
      <div className="relative h-[40vh] w-full overflow-hidden">
        <img src={club.cover_url || 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3'} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f8fafc] via-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* HEADER AREA */}
        <div className="relative -mt-24 flex flex-col md:flex-row items-center md:items-end justify-between gap-8 pb-12 border-b border-gray-200/50">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            <motion.img initial={{y: 20, opacity: 0}} animate={{y: 0, opacity: 1}} src={club.image_url} className="w-44 h-44 rounded-[3.5rem] border-[10px] border-[#f8fafc] shadow-2xl object-cover bg-white" />
            <div className="text-center md:text-left">
              {isEditing ? (
                <input className="text-4xl font-black uppercase italic tracking-tighter bg-white border-2 border-indigo-100 rounded-xl px-4 py-1 w-full focus:border-indigo-500 outline-none" value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} />
              ) : (
                <h1 className="text-6xl font-black text-gray-900 uppercase italic tracking-tighter leading-none mb-1">{club.name}</h1>
              )}
              
              <button onClick={() => setShowMembersModal(true)} className="flex items-center gap-4 mt-4 justify-center md:justify-start group bg-white/50 px-4 py-2 rounded-2xl border border-gray-100 hover:border-indigo-200 transition-all">
                <div className="flex flex-col text-left">
                  <span className="text-xl font-black text-indigo-600 leading-none">{club.follower_count || 0}</span>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Üye / Takipçi</span>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <span className="text-[10px] font-black text-indigo-400 uppercase group-hover:text-indigo-600 underline decoration-dotted">Listeyi Gör</span>
              </button>
            </div>
          </div>

          {/* TAKİP BUTONU */}
          <div className="flex items-center gap-3">
             {isAdmin ? (
                <div className="px-10 py-5 bg-amber-50 text-amber-600 border border-amber-200 rounded-[2rem] font-black uppercase text-xs tracking-widest flex items-center gap-2 shadow-sm">
                   <ShieldCheck size={20} /> Admin Modu
                </div>
             ) : (
                <button 
                  onClick={handleFollowToggle}
                  className={`px-10 py-5 rounded-[2.5rem] font-black uppercase italic tracking-widest shadow-xl transition-all active:scale-95 flex items-center gap-2 ${
                    isFollowing ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-200' : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700'
                  }`}
                >
                  <Heart size={20} className={isFollowing ? "fill-current" : ""} />
                  {isFollowing ? "Üyesiniz" : "Kulübe Katıl"}
                </button>
             )}
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12 text-left">
          <div className="lg:col-span-4 space-y-8">
            <section className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2"><Info size={18}/> Vizyon</h3>
                {canEdit && (
                  <button onClick={() => setIsEditing(!isEditing)} className="text-gray-400 hover:text-indigo-600 transition-colors">
                    {isEditing ? <XCircle size={20}/> : <Edit size={20}/>}
                  </button>
                )}
              </div>
              
              {isEditing ? (
                <div className="space-y-4">
                  <textarea className="w-full p-4 border-2 border-indigo-50 rounded-2xl min-h-[150px] outline-none focus:border-indigo-500 font-medium italic text-gray-600" value={editData.description} onChange={(e) => setEditData({...editData, description: e.target.value})} />
                  <button onClick={() => { setIsEditing(false); toast.success("Bilgiler güncellendi"); }} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase italic shadow-lg hover:bg-indigo-700 flex items-center justify-center gap-2 transition-all">
                    <Save size={18}/> Kaydet
                  </button>
                </div>
              ) : (
                <p className="text-gray-600 font-medium italic text-lg leading-relaxed opacity-80">"{club.description || 'Vizyon belirtilmedi.'}"</p>
              )}
            </section>
          </div>

          <div className="lg:col-span-8 space-y-8">
            <h2 className="text-4xl font-black text-gray-900 uppercase italic tracking-tighter flex items-center gap-4">
              <Sparkles size={32} className="text-amber-500" /> Etkinlik Takvimi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              {events.length > 0 ? events.map(event => (
                <motion.div whileHover={{ y: -8 }} key={event.id} className="group relative bg-white rounded-[3rem] overflow-hidden shadow-sm border border-gray-50 transition-all">
                  <div className="h-56 overflow-hidden cursor-pointer" onClick={() => navigate(`/events/${event.id}`)}>
                    <img src={event.image_url || 'https://via.placeholder.com/500'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-8">
                    <h4 className="text-xl font-black text-gray-800 uppercase tracking-tighter leading-tight">{event.title}</h4>
                    <div className="flex justify-between items-end mt-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-indigo-600 font-black uppercase tracking-widest flex items-center gap-1"><Calendar size={12}/> {event.date}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1"><MapPin size={12}/> {event.location}</span>
                      </div>
                      {canEdit && (
                        <div className="flex gap-2">
                           <button className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100"><Edit size={16}/></button>
                           <button className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-100"><Trash2 size={16}/></button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="col-span-2 py-20 text-center bg-white/50 border-4 border-dashed border-gray-100 rounded-[3rem] flex flex-col items-center">
                  <Calendar size={48} className="text-gray-200 mb-4" />
                  <p className="text-gray-400 font-black uppercase italic tracking-widest">Henüz bir etkinlik paylaşılmadı</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}