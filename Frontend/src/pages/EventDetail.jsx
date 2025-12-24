import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Calendar, MapPin, Users, Send, MessageSquare, 
  Clock, ArrowLeft, CheckCircle, AlertCircle, Share2 
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [event, setEvent] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    fetchEventDetails();
    fetchComments();
  }, [id]);

  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/events/${id}`);
      setEvent(data.event);
    } catch (err) {
      console.error('Etkinlik yüklenemedi');
      toast.error('Etkinlik yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data } = await api.get(`/events/${id}/comments`);
      setComments(data.comments);
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

    setIsJoining(true);
    try {
      await api.post(`/events/${id}/join`);
      setHasJoined(true);
      toast.success('🎉 Etkinliğe başarıyla katıldınız!');
      fetchEventDetails();
      setTimeout(() => setHasJoined(false), 2000);
    } catch (err) {
      toast.error(err.response?.data?.error || "Katılım hatası");
    } finally {
      setIsJoining(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.warning('Yorum yapmak için giriş yapmalısınız!');
      return;
    }
    if (!newComment.trim()) return;
    
    try {
      await api.post(`/events/${id}/comments`, { content: newComment });
      setNewComment("");
      fetchComments();
      toast.success('✅ Yorumunuz eklendi!');
    } catch (err) {
      toast.error("Yorum gönderilemedi.");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `${event.title} - CampusHub`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('📋 Link kopyalandı!');
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Etkinlik yükleniyor..." />;
  if (!event) return (
    <div className="max-w-4xl mx-auto p-6 text-center">
      <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Etkinlik Bulunamadı</h2>
      <button 
        onClick={() => navigate('/')}
        className="text-blue-600 hover:text-blue-700 font-semibold"
      >
        ← Ana Sayfaya Dön
      </button>
    </div>
  );

  const isFull = event.capacity > 0 && event.participant_count >= event.capacity;
  const fillPercentage = event.capacity > 0 ? (event.participant_count / event.capacity) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 mb-6 font-semibold transition group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition" />
          <span>Geri Dön</span>
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 overflow-hidden mb-8">
          
          {/* Hero Image */}
          <div className="relative h-96 overflow-hidden">
            <img 
              src={event.image_url || 'https://via.placeholder.com/1200x400?text=CampusHub'} 
              className="w-full h-full object-cover"
              alt={event.title}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            
            {/* Floating Club Badge */}
            <div className="absolute top-6 left-6">
              <span className="bg-white/95 backdrop-blur-sm text-blue-600 px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                {event.club_name}
              </span>
            </div>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm p-3 rounded-full hover:bg-white transition shadow-lg"
            >
              <Share2 size={20} className="text-gray-700" />
            </button>

            {/* Title Overlay */}
            <div className="absolute bottom-6 left-6 right-6">
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2 leading-tight">
                {event.title}
              </h1>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            
            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="bg-blue-600 p-3 rounded-xl">
                  <Calendar className="text-white" size={24} />
                </div>
                <div>
                  <div className="text-xs text-blue-600 font-bold uppercase">Tarih & Saat</div>
                  <div className="font-bold text-gray-900">
                    {new Date(event.date).toLocaleDateString('tr-TR', { 
                      day: 'numeric', 
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(event.date).toLocaleTimeString('tr-TR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-2xl border border-red-100">
                <div className="bg-red-600 p-3 rounded-xl">
                  <MapPin className="text-white" size={24} />
                </div>
                <div>
                  <div className="text-xs text-red-600 font-bold uppercase">Konum</div>
                  <div className="font-bold text-gray-900">{event.location}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-2xl border border-green-100">
                <div className="bg-green-600 p-3 rounded-xl">
                  <Users className="text-white" size={24} />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-green-600 font-bold uppercase">Katılımcılar</div>
                  <div className="font-bold text-gray-900">
                    {event.participant_count} / {event.capacity || '∞'}
                  </div>
                  {event.capacity > 0 && (
                    <div className="mt-2">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            fillPercentage >= 90 ? 'bg-red-500' : 
                            fillPercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(fillPercentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                <Clock size={20} className="mr-2 text-blue-600" />
                Etkinlik Detayları
              </h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                {event.description || 'Bu etkinlik için henüz bir açıklama girilmemiş.'}
              </p>
            </div>

            {/* Join Button */}
            <div className="flex justify-center">
              <button
                onClick={handleJoin}
                disabled={isJoining || isFull || hasJoined}
                className={`px-12 py-4 rounded-2xl font-black text-lg shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                  hasJoined 
                    ? 'bg-green-600 text-white' 
                    : isFull 
                    ? 'bg-gray-400 text-white'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-2xl'
                }`}
              >
                {hasJoined ? (
                  <span className="flex items-center space-x-2">
                    <CheckCircle size={24} />
                    <span>Katıldın! 🎉</span>
                  </span>
                ) : isJoining ? (
                  'Katılıyor...'
                ) : isFull ? (
                  'Kontenjan Dolu ❌'
                ) : (
                  'Etkinliğe Katıl 🚀'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-8">
          <h3 className="text-2xl font-black mb-6 flex items-center">
            <MessageSquare className="mr-3 text-blue-600" size={28} />
            Yorumlar ({comments.length})
          </h3>

          {/* Comment Form */}
          {user ? (
            <form onSubmit={handleAddComment} className="mb-8">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center font-bold text-white">
                  {user.full_name?.charAt(0) || 'U'}
                </div>
                <input
                  type="text"
                  className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Yorumunuzu yazın..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl text-center">
              <p className="text-blue-700 font-semibold">
                Yorum yapmak için 
                <button 
                  onClick={() => navigate('/login')}
                  className="text-blue-600 hover:text-blue-800 font-bold ml-1 underline"
                >
                  giriş yapın
                </button>
              </p>
            </div>
          )}

          {/* Comments List */}
          {comments.length > 0 ? (
            <div className="space-y-6">
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200 hover:shadow-md transition">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center font-bold text-white text-lg flex-shrink-0">
                    {comment.user_name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-gray-900">{comment.user_name}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(comment.created_at).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400 font-semibold">Henüz yorum yok</p>
              <p className="text-sm text-gray-400">İlk yorumu sen yap! 💬</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}