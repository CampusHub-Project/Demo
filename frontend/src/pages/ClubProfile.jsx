import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Users, Calendar, Loader2, ArrowLeft, 
  ShieldCheck, Trash2, Heart, MapPin, 
  Info, Sparkles, Edit, Save, XCircle, ShieldAlert, X, Clock, UserPlus, Camera, Link as LinkIcon, CheckCircle2, Palette, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PRESET_GRADIENTS = [
  { id: 'indigo', class: 'from-indigo-600 via-blue-700 to-purple-800', color: '#4f46e5' },
  { id: 'sunset', class: 'from-rose-500 via-orange-600 to-amber-500', color: '#f43f5e' },
  { id: 'emerald', class: 'from-emerald-500 via-teal-600 to-cyan-700', color: '#10b981' },
  { id: 'midnight', class: 'from-gray-800 via-slate-900 to-black', color: '#1e293b' },
  { id: 'royal', class: 'from-violet-600 via-purple-700 to-fuchsia-800', color: '#8b5cf6' },
];

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [deletingId, setDeletingId] = useState(null); // Silme işlemi takibi
  
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [selectedBg, setSelectedBg] = useState(PRESET_GRADIENTS[0]);
  
  const [tempPhotoUrl, setTempPhotoUrl] = useState('');
  const [editData, setEditData] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isPresidentOfThisClub = club?.president_id === user?.sub || (user?.role === 'club_admin' && club?.president_id === user?.id);
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
      setTempPhotoUrl(data.image_url || '');
      
      const localBgId = localStorage.getItem(`club_bg_${clubId}`);
      const bgId = localBgId || data.bg_style || 'indigo';
      const savedBg = PRESET_GRADIENTS.find(g => g.id === bgId);
      if (savedBg) setSelectedBg(savedBg);

      if (data.events) setEvents(data.events);

      const mRes = await api.get(`/clubs/${clubId}/members`).catch(() => ({ data: { members: [] } }));
      setMembers(mRes.data.members || []);

    } catch (err) {
      toast.error("Kulüp bilgileri alınamadı.");
    } finally {
      setLoading(false);
    }
  };

  const updateClubInfo = async (payload) => {
    setSaving(true);
    try {
      if (payload.bg_style) {
        const newBg = PRESET_GRADIENTS.find(g => g.id === payload.bg_style);
        if (newBg) {
          setSelectedBg(newBg);
          localStorage.setItem(`club_bg_${clubId}`, payload.bg_style);
        }
      }
      await api.put(`/clubs/${clubId}`, payload); 
      setClub(prev => ({ ...prev, ...payload }));
      toast.success("✅ Güncellendi!");
    } catch (err) {
      if (!payload.bg_style) toast.error("Güncelleme başarısız.");
      else toast.success("✅ Görünüm tercihiniz kaydedildi!");
    } finally { 
      setSaving(false); 
      setIsEditingPhoto(false);
      setShowPalette(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user) return toast.warning("Giriş yapmalısınız!");
    setIsProcessing(true);
    try {
      if (isFollowing) {
        await api.post(`/clubs/${clubId}/leave`);
        setIsFollowing(false);
        setClub(prev => ({ ...prev, follower_count: (prev.follower_count || 1) - 1 }));
        toast.success("Takibi bıraktınız.");
      } else {
        await api.post(`/clubs/${clubId}/follow`);
        setIsFollowing(true);
        setClub(prev => ({ ...prev, follower_count: (prev.follower_count || 0) + 1 }));
        toast.success(`Artık ${club.name} üyesisin!`);
      }
    } catch (err) { toast.error("İşlem başarısız"); } finally { setIsProcessing(false); }
  };

  // --- YENİ: ETKİNLİK SİLME ---
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Bu etkinliği kalıcı olarak silmek istediğinize emin misiniz?")) return;
    
    setDeletingId(eventId);
    try {
      await api.delete(`/events/${eventId}`);
      setEvents(prev => prev.filter(ev => ev.id !== eventId));
      toast.success("🗑️ Etkinlik başarıyla silindi.");
    } catch (err) {
      toast.error("Silme işlemi başarısız oldu.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
      <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
      <p className="font-black uppercase tracking-widest text-gray-400 italic">Yükleniyor...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans text-left relative selection:bg-indigo-100 overflow-x-hidden">
      
      {/* ÜYE LİSTESİ MODAL */}
      <AnimatePresence>
        {showMembersModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMembersModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden z-[101]">
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Topluluk Üyeleri</h3>
                <button onClick={() => setShowMembersModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-all text-gray-400"><X size={24}/></button>
              </div>
              <div className="p-8 max-h-[60vh] overflow-y-auto space-y-4">
                {members.length > 0 ? members.map(m => (
                  <div key={m.id || m.user_id} className="flex items-center gap-4 p-3 hover:bg-indigo-50 rounded-2xl transition-all">
                    <img src={`https://ui-avatars.com/api/?name=${m.full_name}&background=${selectedBg.color.replace('#','')}&color=fff`} className="w-12 h-12 rounded-xl" alt="avatar" />
                    <div className="text-left font-bold uppercase text-[10px]">
                      <p className="text-gray-800 leading-none mb-1">{m.full_name}</p>
                      <p className="text-gray-400">{m.department || 'Üye'}</p>
                    </div>
                  </div>
                )) : <p className="text-gray-400 italic text-center py-10 font-bold uppercase text-[10px]">Henüz üye bulunmuyor.</p>}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NAV BUTONLARI */}
      <div className="fixed top-24 left-0 w-full px-6 md:px-12 z-40 flex justify-between pointer-events-none text-left">
        <button onClick={() => navigate(-1)} className="pointer-events-auto p-4 bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white hover:scale-110 transition-all text-gray-800"><ArrowLeft size={24} /></button>
        {canEdit && (
          <div className="pointer-events-auto flex items-center space-x-3 bg-gray-900 text-white px-6 py-3 rounded-3xl shadow-xl font-black uppercase text-[10px] tracking-widest italic animate-pulse">
            <ShieldCheck size={18} className="text-indigo-400" />
            <span>Yönetici Erişimi</span>
          </div>
        )}
      </div>

      {/* GRADYAN KAPAK ALANI */}
      <div className={`relative h-64 md:h-72 w-full bg-gradient-to-br transition-all duration-700 ${selectedBg.class}`}>
        <div className="absolute inset-0 overflow-hidden opacity-10 font-black italic text-white text-[15rem] leading-none select-none flex items-center justify-center">
          {club.name[0]}
        </div>
        {canEdit && (
          <div className="absolute top-6 right-6 z-30">
            <button onClick={() => setShowPalette(!showPalette)} className="bg-white/20 backdrop-blur-md text-white p-3 rounded-2xl hover:bg-white/30 transition-all flex items-center gap-2 font-black text-[10px] uppercase border border-white/20 tracking-widest">
              <Palette size={18} /> Görünüm
            </button>
            <AnimatePresence>
              {showPalette && (
                <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="absolute top-14 right-0 bg-white p-4 rounded-3xl shadow-2xl flex gap-3 border border-gray-100 min-w-max">
                  {PRESET_GRADIENTS.map((g) => (
                    <button key={g.id} onClick={() => updateClubInfo({ bg_style: g.id })} className={`w-8 h-8 rounded-xl bg-gradient-to-br ${g.class} relative flex items-center justify-center transition-transform hover:scale-125 shadow-sm`}>
                      {selectedBg.id === g.id && <Check className="text-white" size={14} />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="relative -mt-24 flex flex-col md:flex-row items-center md:items-end justify-between gap-8 pb-12 border-b border-gray-200/50">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            <div className="relative group shrink-0">
              <div className={`p-1.5 rounded-[3.5rem] bg-gradient-to-tr ${selectedBg.class} shadow-2xl`}>
                <motion.img initial={{y: 20, opacity: 0}} animate={{y: 0, opacity: 1}} src={club.image_url || `https://ui-avatars.com/api/?name=${club.name}&background=${selectedBg.color.replace('#','')}&color=fff`} className="w-44 h-44 rounded-[3rem] border-8 border-white object-cover bg-white shadow-inner" />
              </div>
              {canEdit && (
                <button onClick={() => setIsEditingPhoto(!isEditingPhoto)} className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-[3.5rem] text-white opacity-0 group-hover:opacity-100 transition-opacity border-8 border-transparent">
                  <Camera size={32} />
                </button>
              )}
            </div>

            <div className="text-center md:text-left">
              <h1 className="text-5xl md:text-7xl font-black text-gray-900 uppercase italic tracking-tighter leading-none mb-2">{club.name}</h1>
              <button onClick={() => setShowMembersModal(true)} className="flex items-center gap-4 mt-4 bg-white px-5 py-3 rounded-[1.5rem] border border-gray-100 hover:border-indigo-200 transition-all shadow-sm">
                <div className="flex flex-col text-left font-black" style={{ color: selectedBg.color }}>
                  <span className="text-2xl leading-none">{club.follower_count || 0}</span>
                  <span className="text-[9px] text-gray-400 uppercase tracking-widest mt-1 italic leading-none">Üye Sayısı</span>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <span className="text-[10px] font-black text-gray-400 uppercase group-hover:text-indigo-600 underline decoration-dotted tracking-widest italic leading-none">Listeyi Gör</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
             {isAdmin ? (
                <div className="px-10 py-5 bg-amber-50 text-amber-600 border-2 border-amber-100 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] flex items-center gap-2 italic"><ShieldAlert size={20} /> Sistem Admini</div>
             ) : isPresidentOfThisClub ? (
                <div className="px-10 py-5 bg-indigo-50 text-indigo-600 border-2 border-indigo-100 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] flex items-center gap-2 italic"><ShieldCheck size={20} /> Kulüp Başkanı</div>
             ) : (
                <button onClick={handleFollowToggle} disabled={isProcessing} className={`px-12 py-5 rounded-[2.5rem] font-black uppercase italic tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center gap-3 ${isFollowing ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-200 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200' : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700'}`}>
                  {isProcessing ? <Loader2 className="animate-spin" size={20} /> : (
                    <>{isFollowing ? <CheckCircle2 size={22} /> : <UserPlus size={22} />}{isFollowing ? "ÜYESİSİNİZ" : "KULÜBE KATIL"}</>
                  )}
                </button>
             )}
          </div>
        </div>

        {/* LOGO EDİT PANELİ */}
        <AnimatePresence>
          {isEditingPhoto && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-8">
              <div className="bg-gray-100 p-6 rounded-[2rem] border-2 border-gray-200 flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 w-full relative text-left">
                  <p className="text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest italic ml-2"># Yeni Logo URL</p>
                  <div className="relative"><LinkIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" /><input type="text" value={tempPhotoUrl} onChange={(e) => setTempPhotoUrl(e.target.value)} placeholder="https://..." className="w-full pl-12 pr-4 py-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-300 font-bold text-sm shadow-inner" /></div>
                </div>
                <div className="flex gap-2 w-full md:w-auto self-end">
                  <button onClick={() => setIsEditingPhoto(false)} className="flex-1 md:w-12 h-14 bg-white text-gray-400 rounded-2xl flex items-center justify-center hover:text-rose-500 transition-colors shadow-sm"><X size={24}/></button>
                  <button onClick={() => updateClubInfo({ image_url: tempPhotoUrl })} disabled={saving} className="flex-[2] md:px-8 h-14 bg-indigo-600 text-white rounded-2xl font-black uppercase italic tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-200">{saving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} GÜNCELLE</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-16 text-left">
          <div className="lg:col-span-4 font-black uppercase tracking-tighter">
            <section className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-gray-100 relative overflow-hidden group italic">
              <div className="absolute top-0 left-0 w-2 h-full opacity-30" style={{ backgroundColor: selectedBg.color }} />
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[10px] text-indigo-600 uppercase tracking-[0.3em] flex items-center gap-2 leading-none"><Info size={20}/> # Kulüp Vizyonu</h3>
                {canEdit && (
                  <button onClick={() => setIsEditing(!isEditing)} className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-indigo-600 transition-colors">{isEditing ? <XCircle size={20}/> : <Edit size={20}/>}</button>
                )}
              </div>
              {isEditing ? (
                <div className="space-y-4">
                  <textarea className="w-full p-5 border-2 border-indigo-50 rounded-2xl min-h-[180px] outline-none focus:border-indigo-500 font-bold italic text-gray-700 shadow-inner bg-gray-50" value={editData.description} onChange={(e) => setEditData({...editData, description: e.target.value})} />
                  <button onClick={() => updateClubInfo({ description: editData.description })} className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase italic shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"><Save size={18}/> Vizyonu Güncelle</button>
                </div>
              ) : (
                <p className="text-gray-700 font-medium italic text-xl leading-relaxed">"{club.description || 'Henüz bir vizyon metni belirtilmedi.'}"</p>
              )}
            </section>
          </div>

          <div className="lg:col-span-8 space-y-10">
            <h2 className="text-4xl font-black text-gray-900 uppercase italic tracking-tighter flex items-center gap-4 leading-none"><Sparkles size={36} className="text-amber-500" /> Etkinlik Takvimi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {events.length > 0 ? events.map(event => (
                <motion.div whileHover={{ y: -10 }} key={event.id} className="group bg-white rounded-[3.5rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-500">
                  <div className="h-60 overflow-hidden cursor-pointer relative" onClick={() => navigate(`/events/${event.id}`)}>
                    <img src={event.image_url || 'https://via.placeholder.com/500'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="event" />
                    <div className="absolute top-5 right-5 bg-white/95 backdrop-blur px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-indigo-600 shadow-xl italic leading-none">ETKİNLİK</div>
                  </div>
                  <div className="p-8">
                    <h4 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic leading-tight mb-6 group-hover:text-indigo-600 transition-colors line-clamp-2">{event.title}</h4>
                    <div className="flex justify-between items-end border-t border-gray-50 pt-6">
                      <div className="flex flex-col gap-3 font-black uppercase tracking-widest text-[9px]">
                        <span className="text-gray-900 flex items-center gap-2 italic leading-none"><Calendar size={14} className="text-indigo-600"/> {event.date}</span>
                        <span className="text-gray-400 flex items-center gap-2 leading-none"><MapPin size={14} className="text-rose-600"/> {event.location}</span>
                      </div>
                      
                      {/* EDİT VE SİLME BUTONLARI (Kusursuz Entegrasyon) */}
                      {canEdit && (
                        <div className="flex gap-2">
                           <button 
                              onClick={() => navigate(`/events/edit/${event.id}`)} 
                              className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100"
                              title="Düzenle"
                           >
                              <Edit size={16}/>
                           </button>
                           <button 
                              onClick={() => handleDeleteEvent(event.id)} 
                              disabled={deletingId === event.id}
                              className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all border border-transparent hover:border-rose-100 disabled:opacity-50"
                              title="Sil"
                           >
                              {deletingId === event.id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Trash2 size={16}/>
                              )}
                           </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="col-span-full py-28 text-center bg-white border-4 border-dashed border-gray-100 rounded-[4rem] flex flex-col items-center justify-center font-black uppercase italic text-gray-400 text-sm tracking-widest"><Calendar size={64} className="mb-6 opacity-20" />Henüz etkinlik paylaşılmadı</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}