import { useEffect, useState } from 'react'; // useEffect eklendi
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext'; // useAuth eklendi
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import { 
  CalendarPlus, Type, MapPin, AlignLeft, 
  Users, Image as ImageIcon, ArrowLeft,
  Loader2, AlertCircle, ShieldAlert
} from 'lucide-react';

export default function CreateEvent() {
  const { clubId } = useParams();
  const { user } = useAuth(); // Kullanıcı bilgilerini aldık
  const navigate = useNavigate();
  const toast = useToast();
  
  const [loading, setLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false); // Yetki kontrolü state'i
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    capacity: 1,
    image_url: '',
    club_id: parseInt(clubId)
  });

  // --- YETKİ KONTROLÜ ---
  useEffect(() => {
    const checkAuth = async () => {
      // 1. Adminse direkt izin ver
      if (user?.role === 'admin') {
        setIsAuthorized(true);
        return;
      }

      // 2. Kulüp başkanıysa, bu kulübün başkanı mı kontrol et
      try {
        const { data } = await api.get(`/clubs/${clubId}`);
        const club = data.club || data;
        
        if (user?.role === 'club_admin' && club.president_id === user.id) {
          setIsAuthorized(true);
        } else {
          toast.error("Bu kulüp için etkinlik oluşturma yetkiniz yok!");
          navigate('/dashboard');
        }
      } catch (err) {
        toast.error("Kulüp bilgileri doğrulanamadı.");
        navigate('/dashboard');
      }
    };

    if (user && clubId) checkAuth();
  }, [user, clubId, navigate, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.capacity <= 0) {
      toast.error("Etkinlik kapasitesi en az 1 olmalıdır!");
      return;
    }

    setLoading(true);
    try {
      await api.post('/events/', formData);
      toast.success('🎉 Etkinlik oluşturuldu ve takipçilere bildirim gitti!');
      // Admin ise admin paneline, başkansa kendi dashboarduna döner
      navigate(user?.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || "Etkinlik oluşturulurken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const isCapacityValid = formData.capacity > 0;

  // Yetki yoksa ve yükleniyorsa hiçbir şey gösterme veya loader göster
  if (!isAuthorized && !loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-blue-600" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 text-left">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header ve Form yapısı senin paylaştığınla aynı kalsın... */}
        {/* Sadece Admin için bir uyarı badge'i ekleyebiliriz */}
        {user?.role === 'admin' && (
          <div className="mb-4 flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-amber-200">
            <ShieldAlert size={16} /> Admin Müdahale Modu: Bu etkinliği sistem adına oluşturuyorsunuz.
          </div>
        )}

        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-500 hover:text-blue-600 mb-6 font-bold transition-colors uppercase text-xs tracking-widest"
        >
          <ArrowLeft size={16} className="mr-2" /> Geri Dön
        </button>

        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-white/50">
          <div className="bg-blue-600 p-8 text-white text-center relative overflow-hidden">
            <div className="relative z-10 text-left">
              <CalendarPlus size={48} className="mb-4 opacity-90" />
              <h2 className="text-3xl font-black uppercase tracking-tight italic">Yeni Etkinlik</h2>
              <p className="text-blue-100 mt-2 font-bold uppercase text-[10px] tracking-[0.2em]">Topluluğunu harekete geçirme zamanı!</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Form Inputları (Title, Date, Location, Capacity, Image, Description) */}
            {/* ... senin mevcut inputların ... */}
            
            <div className="relative group">
              <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Etkinlik Adı" 
                required 
                disabled={loading}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold uppercase text-sm" 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative group">
                <input 
                  type="datetime-local" 
                  required 
                  disabled={loading}
                  className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-gray-600 text-sm" 
                  onChange={(e) => setFormData({...formData, date: e.target.value})} 
                />
              </div>

              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Mekan" 
                  required 
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-sm" 
                  onChange={(e) => setFormData({...formData, location: e.target.value})} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="relative group text-left">
                <Users className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${!isCapacityValid ? 'text-rose-500' : 'text-gray-400 group-focus-within:text-blue-600'}`} size={20} />
                <input 
                  type="number" 
                  min="1"
                  placeholder="Kapasite" 
                  value={formData.capacity}
                  disabled={loading}
                  required
                  className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all font-black text-sm ${!isCapacityValid ? 'border-rose-500 focus:border-rose-600' : 'border-transparent focus:border-blue-500 focus:bg-white'}`} 
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setFormData({...formData, capacity: isNaN(val) ? '' : val});
                  }} 
                />
              </div>

              <div className="relative group">
                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input 
                  type="url" 
                  placeholder="Kapak Görseli URL" 
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-sm" 
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})} 
                />
              </div>
            </div>

            <div className="relative group">
              <AlignLeft className="absolute left-4 top-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
              <textarea 
                placeholder="Etkinlik hakkında detaylı bilgi ver..." 
                rows="4" 
                disabled={loading}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-sm resize-none" 
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={loading || !isCapacityValid}
              className={`w-full py-5 rounded-2xl font-black text-xl transition-all shadow-xl active:scale-[0.98] flex items-center justify-center space-x-3 ${
                !isCapacityValid || loading 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
              }`}
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : <span className="tracking-tighter italic uppercase">ETKİNLİĞİ YAYINLA</span>}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}