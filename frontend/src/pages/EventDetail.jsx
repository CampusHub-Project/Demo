import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Calendar, MapPin, Users, Send, MessageSquare, 
  Clock, ArrowLeft, CheckCircle, AlertCircle, Loader2, ShieldCheck 
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
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
      setComments(data.comments || []);
    } catch (err) {
      console.error('Yorumlar yüklenemedi');
    }
  };

  const handleJoin = async () => {
    if (!user) {
      toast.warning('Katılmak için giriş yapmalısınız!');
      navigate('/login');
      return;
    }

    // GÜVENLİK: Admin katılımını frontend tarafında da engelle
    if (user.role === 'admin') {
      toast.error('Sistem yöneticileri etkinliklere katılımcı olarak dahil olamaz.');
      return;
    }

    if (hasJoined) return;
    setIsJoining(true);
    try {
      await api.post(`/events/${id}/join`);
      setHasJoined(true);
      setEvent(prev => ({ ...prev, participant_count: prev.participant_count + 1 }));
      toast.success('🎉 Etkinliğe katıldınız!');
    } catch (err) {
      toast.error("Katılım hatası oluştu");
    } finally {
      setIsJoining(false);
    }
  };

  const handleAddComment = async (e) => {
    if (e) e.preventDefault(); 
    
    if (!user) return toast.warning("Yorum yapmak için giriş yapın");
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const { data } = await api.post(`/events/${id}/comments`, { content: newComment });
      
      if (data && data.comment) {
        setComments(prevComments => [data.comment, ...prevComments]);
        setNewComment(""); 
        toast.success("✅ Yorumunuz eklendi!");
      }
    } catch (err) {
      toast.error("Yorum gönderilemedi, lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || (loading && !event)) return <LoadingSpinner size="lg" text="Yükleniyor..." />;
  if (!event) return <div className="text-center py-20 font-bold">Etkinlik bulunamadı.</div>;

  const isFull = event.capacity > 0 && event.participant_count >= event.capacity;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 font-sans">
      <div className="max-w-5xl mx-auto text-left">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-indigo-600 mb-6 font-bold transition">
          <ArrowLeft size={20} className="mr-2" /> Geri Dön
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden mb-8">
          <div className="relative h-80">
            <img src={event.image_url || 'https://via.placeholder.com/1200x400'} className="w-full h-full object-cover" alt={event.title} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute bottom-10 left-10 text-white text-left">
              <span className="bg-indigo-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase mb-3 inline-block tracking-widest">{event.club_name}</span>
              <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">{event.title}</h1>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
               <div className="flex items-center p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                 <Calendar className="text-indigo-600 mr-3" size={24} />
                 <div><p className="text-[9px] font-black text-indigo-400 uppercase">Tarih</p><p className="font-bold text-gray-800 text-sm">{event.date}</p></div>
               </div>
               <div className="flex items-center p-4 bg-rose-50 rounded-2xl border border-rose-100">
                 <MapPin className="text-rose-600 mr-3" size={24} />
                 <div><p className="text-[9px] font-black text-rose-400 uppercase">Konum</p><p className="font-bold text-gray-800 text-sm">{event.location}</p></div>
               </div>
               <div className="flex items-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                 <Users className="text-emerald-600 mr-3" size={24} />
                 <div><p className="text-[9px] font-black text-emerald-400 uppercase">Kontenjan</p><p className="font-bold text-gray-800 text-sm">{event.participant_count} / {event.capacity || '∞'}</p></div>
               </div>
            </div>

            <div className="mb-8 border-t pt-8">
              <h3 className="text-xs font-black text-gray-400 uppercase mb-3 flex items-center tracking-widest"><Clock size={16} className="mr-2"/> Etkinlik Hakkında</h3>
              <p className="text-gray-700 text-lg leading-relaxed font-medium italic">"{event.description}"</p>
            </div>

            <div className="flex flex-col items-center">
              {/* ADMİN KONTROLÜ VE BUTON ALANI */}
              {user?.role === 'admin' ? (
                <div className="flex flex-col items-center space-y-3">
                  <div className="flex items-center space-x-3 px-8 py-4 bg-amber-50 border-2 border-amber-200 rounded-2xl shadow-sm">
                    <ShieldCheck className="text-amber-600" size={24} />
                    <div>
                      <p className="text-[11px] font-black text-amber-800 uppercase tracking-widest leading-none mb-1">Yönetici Erişim Modu</p>
                      <p className="text-[10px] font-bold text-amber-600 uppercase tracking-tighter">Etkinlik katılımı yöneticiler için kapalıdır.</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold italic uppercase tracking-tighter">* Bu etkinliği Admin Panelinden yönetebilirsiniz.</p>
                </div>
              ) : (
                <button
                  onClick={handleJoin}
                  disabled={isJoining || hasJoined || (isFull && !hasJoined)}
                  className={`px-12 py-4 rounded-2xl font-black text-lg shadow-xl transition-all flex items-center gap-3 active:scale-95 ${
                    hasJoined ? 'bg-green-100 text-green-600 border-2 border-green-200 cursor-default' : isFull ? 'bg-gray-200 text-gray-400' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {isJoining ? <Loader2 className="animate-spin" size={20} /> : 
                   hasJoined ? <><CheckCircle size={22} /> KAYITLI</> : 
                   isFull ? 'KONTENJAN DOLU' : 'KATIL 🚀'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* YORUMLAR / TARTIŞMALAR BÖLÜMÜ */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <h2 className="text-xl font-black mb-6 flex items-center tracking-tight uppercase italic">
            <MessageSquare className="mr-3 text-indigo-600" /> Tartışma ({comments.length})
          </h2>
          
          <form onSubmit={handleAddComment} className="mb-8 relative group">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Fikirlerini toplulukla paylaş..."
              className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all resize-none h-28 text-gray-700 font-medium shadow-inner"
            />
            <button 
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="absolute bottom-4 right-4 bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 transition shadow-lg disabled:opacity-50 flex items-center justify-center"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            </button>
          </form>

          <div className="space-y-4">
            {comments.length > 0 ? comments.map((comment) => (
              <div key={comment.id} className="flex gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 text-left transition-all hover:bg-white hover:shadow-md">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-black shrink-0 uppercase text-xs shadow-sm">
                  {comment.username?.[0] || 'U'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-black text-gray-800 text-xs uppercase tracking-tight">{comment.username}</span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase">{comment.created_at}</span>
                  </div>
                  <p className="text-gray-600 text-sm font-medium leading-relaxed">{comment.content}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-300 font-bold italic">
                Henüz tartışma başlatılmamış. İlk yorumu sen yap!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}