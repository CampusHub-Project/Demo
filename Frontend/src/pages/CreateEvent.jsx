import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import { 
  CalendarPlus, 
  Type, 
  MapPin, 
  AlignLeft, 
  Users, 
  Image as ImageIcon, 
  ArrowLeft,
  Loader2 
} from 'lucide-react';

export default function CreateEvent() {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    capacity: 0,
    image_url: '',
    club_id: parseInt(clubId)
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/events/', formData);
      toast.success('🎉 Etkinlik oluşturuldu ve takipçilere bildirim gitti!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || "Etkinlik oluşturulurken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Geri Dön Butonu */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-500 hover:text-blue-600 mb-6 font-bold transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" /> Paneline Geri Dön
        </button>

        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-white/50">
          {/* Header */}
          <div className="bg-blue-600 p-8 text-white text-center relative overflow-hidden">
            <div className="relative z-10">
              <CalendarPlus size={48} className="mx-auto mb-4 opacity-90" />
              <h2 className="text-3xl font-black uppercase tracking-tight">Yeni Etkinlik</h2>
              <p className="text-blue-100 mt-2 font-medium">Topluluğunu harekete geçirme zamanı!</p>
            </div>
            {/* Dekoratif Arka Plan Halkası */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Etkinlik Adı */}
            <div className="relative group">
              <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Etkinlik Adı" 
                required 
                disabled={loading}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-medium" 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tarih */}
              <div className="relative group">
                <input 
                  type="datetime-local" 
                  required 
                  disabled={loading}
                  className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-medium text-gray-600" 
                  onChange={(e) => setFormData({...formData, date: e.target.value})} 
                />
              </div>

              {/* Mekan */}
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Mekan" 
                  required 
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-medium" 
                  onChange={(e) => setFormData({...formData, location: e.target.value})} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Kapasite */}
               <div className="relative group">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input 
                  type="number" 
                  placeholder="Kapasite (0 = Sınırsız)" 
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-medium" 
                  onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})} 
                />
              </div>

              {/* Görsel URL */}
              <div className="relative group">
                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input 
                  type="url" 
                  placeholder="Kapak Görseli URL" 
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-medium" 
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})} 
                />
              </div>
            </div>

            {/* Açıklama */}
            <div className="relative group">
              <AlignLeft className="absolute left-4 top-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
              <textarea 
                placeholder="Etkinlik hakkında detaylı bilgi ver..." 
                rows="4" 
                disabled={loading}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-medium resize-none" 
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center space-x-3"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  <span>OLUŞTURULUYOR...</span>
                </>
              ) : (
                <span>ETKİNLİĞİ YAYINLA</span>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}