import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Calendar, MapPin, Users, Send, MessageSquare, 
  Clock, ArrowLeft, CheckCircle, ShieldCheck, Lock, Loader2 
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();
  
  const [event, setEvent] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      fetchEventDetails();
      fetchComments();
    }
  }, [id, authLoading]);

  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/events/${id}`);
      setEvent(data.event);
      if (data.event?.is_joined) setHasJoined(true);
    } catch (err) {
      toast.error('Etkinlik bilgileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data } = await api.get(`/events/${id}/comments`);
      // Backend'deki 'comments' anahtarıyla eşleşir
      setComments(data.comments || []);
    } catch (err) {
      console.error('Yorumlar yüklenemedi');
    }
  };

  const handleJoin = async () => {
    if (!user) {
      toast.warning('Etkinliğe katılmak için giriş yapmalısınız!');
      setTimeout(() => navigate('/login', { state: { from: location.pathname } }), 1000); 
      return;
    }
    if (user.role === 'admin') {
      toast.error('Sistem yöneticileri etkinliklere katılamaz.');
      return;
    }
    if (hasJoined) return;
    setIsJoining(true);
    try {
      await api.post(`/events/${id}/join`);
      setHasJoined(true);
      setEvent(prev => ({ ...prev, participant_count: (prev.participant_count || 0) + 1 }));
      toast.success('🎉 Etkinliğe katıldınız!');
    } catch (err) {
      toast.error("Katılım hatası oluştu");
    } finally {
      setIsJoining(false);
    }
  };

  const handleAddComment = async (e) => {
    if (e) e.preventDefault(); 
    if (!user) {
      toast.warning("Yorum yapmak için giriş yapmalısınız!");
      setTimeout(() => navigate('/login', { state: { from: location.pathname } }), 1000);
      return;
    }

    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const { data } = await api.post(`/events/${id}/comments`, { content: newComment });
      if (data && data.comment) {
        // Backend'in add_comment içinde döndüğü yeni yapıya göre state güncelleme
        setComments(prev => [data.comment, ...prev]);
        setNewComment(""); 
        toast.success("✅ Yorumunuz eklendi!");
      } else {
        await fetchComments();
        setNewComment("");
      }
    } catch (err) {
      toast.error("Yorum gönderilemedi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || (loading && !event)) return <LoadingSpinner size="lg" text="Kampüs verileri yükleniyor..." />;
  if (!event) return <div className="text-center py-20 font-black uppercase italic text-gray-400">Etkinlik Bulunamadı.</div>;

  const isFull = event.capacity > 0 && event.participant_count >= event.capacity;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 font-sans text-left selection:bg-indigo-100">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 hover:text-indigo-600 mb-8 font-black uppercase text-[10px] tracking-widest transition-all italic">
          <ArrowLeft size={18} className="mr-2" /> Geri Dön
        </button>

        {/* --- ETKİNLİK BANNER KARTI --- */}
        <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden mb-12">
          <div className="relative h-96">
            <img src={event.image_url || 'https://via.placeholder.com/1200x600'} className="w-full h-full object-cover" alt={event.title} />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent"></div>
            <div className="absolute bottom-10 left-10 text-white text-left">
              <span className="bg-indigo-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase mb-4 inline-block tracking-[0.2em] shadow-lg italic">{event.club_name}</span>
              <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">{event.title}</h1>
            </div>
          </div>

          <div className="p-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-left">
               <div className="flex items-center p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100">
                 <Calendar className="text-indigo-600 mr-4" size={28} />
                 <div className="text-left font-black uppercase italic">
                    <p className="text-[10px] text-indigo-400 tracking-widest leading-none mb-1">Tarih</p>
                    <p className="text-gray-800 text-sm">{event.date}</p>
                 </div>
               </div>
               <div className="flex items-center p-6 bg-rose-50 rounded-[2rem] border border-rose-100">
                 <MapPin className="text-rose-600 mr-4" size={28} />
                 <div className="text-left font-black uppercase italic">
                    <p className="text-[10px] text-rose-400 tracking-widest leading-none mb-1">Konum</p>
                    <p className="text-gray-800 text-sm">{event.location}</p>
                 </div>
               </div>
               <div className="flex items-center p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100">
                 <Users className="text-emerald-600 mr-4" size={28} />
                 <div className="text-left font-black uppercase italic">
                    <p className="text-[10px] text-emerald-400 tracking-widest leading-none mb-1">Doluluk</p>
                    <p className="text-gray-800 text-sm">{event.participant_count} / {event.capacity || '∞'}</p>
                 </div>
               </div>
            </div>

            <div className="mb-10 border-t border-gray-50 pt-10 text-left">
              <h3 className="text-[10px] font-black text-gray-400 uppercase mb-4 flex items-center tracking-[0.3em] italic"># ETKİNLİK PROTOKOLÜ</h3>
              <p className="text-gray-700 text-2xl leading-relaxed font-medium italic max-w-4xl">"{event.description}"</p>
            </div>

            <div className="flex justify-center">
              {user?.role === 'admin' ? (
                <div className="flex items-center space-x-4 px-10 py-5 bg-amber-50 border-2 border-amber-100 rounded-[2rem] shadow-xl">
                  <ShieldCheck className="text-amber-600" size={32} />
                  <div className="text-left">
                    <p className="text-[12px] font-black text-amber-800 uppercase tracking-widest mb-1 leading-none">ADMİN ERİŞİMİ</p>
                    <p className="text-[10px] font-bold text-amber-600 uppercase italic text-left">Yönetim modunda görüntüleniyor.</p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleJoin}
                  disabled={isJoining || hasJoined || (isFull && !hasJoined)}
                  className={`px-16 py-6 rounded-[2rem] font-black text-xl shadow-2xl transition-all flex items-center gap-4 active:scale-95 italic tracking-tighter ${
                    hasJoined ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-200 cursor-default' : isFull ? 'bg-gray-200 text-gray-400 grayscale' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {isJoining ? <Loader2 className="animate-spin" size={24} /> : 
                   hasJoined ? <><CheckCircle size={28} /> KAYIT TAMAMLANDI</> : 
                   isFull ? 'KONTENJAN DOLDU' : 'ETKİNLİĞE KATIL 🚀'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* --- TARTIŞMA / YORUM ALANI --- */}
        <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-gray-100 text-left">
          <h2 className="text-3xl font-black mb-10 flex items-center tracking-tighter uppercase italic text-gray-900 leading-none">
            <MessageSquare className="mr-4 text-indigo-600" size={36} /> Tartışma Paneli ({comments.length})
          </h2>
          
          <form onSubmit={handleAddComment} className="mb-12 relative group text-left">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={!user}
              placeholder={user ? "Fikirlerini ve sorularını toplulukla paylaş..." : "Yorum yapmak için önce sisteme giriş yapmalısınız..."}
              className={`w-full p-8 border-4 rounded-[2.5rem] outline-none transition-all resize-none h-32 font-bold italic shadow-inner text-lg ${
                !user 
                  ? 'bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400' 
                  : 'bg-gray-50 border-transparent focus:border-indigo-500 focus:bg-white text-gray-700'
              }`}
            />
            <button 
              type="submit"
              disabled={isSubmitting || !user}
              className="absolute bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-2xl hover:bg-indigo-700 transition shadow-xl flex items-center justify-center group-active:scale-95 disabled:grayscale"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : user ? <Send size={24} /> : <Lock size={24} />}
            </button>
          </form>

          {/* YORUM LİSTESİ */}
          <div className="space-y-6">
            <AnimatePresence>
              {comments.length > 0 ? comments.map((comment) => {
                // Backend'deki 'user_id' alanını kullanarak navigasyon yapar
                const targetId = comment.user_id;
                // Backend'deki 'username' alanını isme basar
                const displayName = comment.username || "KAMPÜS ÜYESİ";
                // Backend'deki 'department' alanını departmana basar
                const dept = comment.department || "ÖĞRENCİ";

                return (
                  <motion.div 
                    key={comment.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-6 p-8 bg-gray-50 rounded-[2.5rem] border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-2xl transition-all duration-500 group relative overflow-hidden"
                  >
                    {/* AVATAR - Tıklanabilir */}
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (targetId) navigate(`/profile/${targetId}`);
                        else toast.error("Kullanıcı ID verisi eksik.");
                      }}
                      className="relative shrink-0 cursor-pointer group/avatar"
                    >
                      <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-tr from-indigo-500 to-purple-600 p-0.5 shadow-xl group-hover/avatar:rotate-6 transition-transform">
                        <img 
                          src={comment.user_photo || `https://ui-avatars.com/api/?name=${displayName}&background=fff&color=6366f1`} 
                          className="w-full h-full rounded-[1.4rem] object-cover border-4 border-white"
                          alt="avatar"
                        />
                      </div>
                    </div>

                    <div className="flex-1 text-left">
                      <div className="flex justify-between items-start mb-3">
                        {/* İSİM VE BÖLÜM - Tıklanabilir */}
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (targetId) navigate(`/profile/${targetId}`);
                          }}
                          className="group/name flex flex-col items-start cursor-pointer text-left"
                        >
                          <span className="text-lg font-black text-gray-900 uppercase italic tracking-tighter group-hover:text-indigo-600 transition-colors leading-none mb-1">
                            {displayName}
                          </span>
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">
                            {dept}
                          </span>
                        </div>
                        
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">
                          {comment.created_at}
                        </span>
                      </div>

                      <p className="text-gray-700 font-medium italic leading-relaxed text-lg text-left">
                        "{comment.content}"
                      </p>
                    </div>

                    {/* Görsel İpucu - Dekoratif */}
                    <div className="absolute top-4 right-8 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="text-[10px] font-black text-indigo-100 uppercase tracking-[0.4em] rotate-12 italic">
                        PROFILI GÖR
                      </div>
                    </div>
                  </motion.div>
                );
              }) : (
                <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100">
                  <MessageSquare size={48} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-gray-400 font-black uppercase italic tracking-widest text-sm leading-none">Tartışmayı sen başlat!</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}