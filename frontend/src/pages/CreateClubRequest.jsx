import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { Rocket, CheckCircle2, Home, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const CreateClubRequest = () => {
  const [formData, setFormData] = useState({ name: '', description: '', image_url: '' });
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false); // Başarı ekranı kontrolü
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/clubs', formData);
      setIsSubmitted(true); // Form başarıyla gittiğinde ekranı değiştir
      showToast("Başvurunuz başarıyla alındı!", "success");
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Başvuru sırasında bir hata oluştu.";
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  // 1. BAŞARI EKRANI (Submission Success)
  if (isSubmitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-2xl shadow-indigo-100 text-center border border-gray-50"
        >
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter mb-4">
            Başvuru Alındı!
          </h2>
          <p className="text-gray-500 font-medium italic mb-8 leading-relaxed">
            Kulüp kuruluş talebiniz sistem yöneticilerine iletildi. Onaylandığında bildirim alacaksınız.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase italic tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100"
            >
              <Home size={20} />
              Ana Sayfaya Dön
            </button>
            <button
              onClick={() => navigate('/clubs')}
              className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase italic tracking-widest flex items-center justify-center gap-3 hover:bg-gray-100 transition-all active:scale-95"
            >
              Kulüpleri İncele
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // 2. FORM EKRANI
  return (
    <div className="max-w-2xl mx-auto my-16 px-4">
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-indigo-50 border border-gray-50 overflow-hidden">
        <div className="bg-indigo-600 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-black/10"></div>
          <Rocket className="text-white/20 absolute -right-4 -bottom-4 rotate-12" size={120} />
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter relative z-10">
            Yeni Bir Topluluk Kur
          </h2>
          <p className="text-indigo-100 text-sm font-medium italic mt-2 relative z-10">
            Hayallerindeki kulübü başlatmak için ilk adımı at.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-6">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1 italic">
              Kulüp Adı
            </label>
            <input
              type="text"
              required
              placeholder="Örn: Dağcılık ve Kampçılık Kulübü"
              className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-gray-700 shadow-inner"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1 italic">
              Kulüp Amacı ve Açıklaması
            </label>
            <textarea
              required
              rows="4"
              placeholder="Kulübün ne yapacağını ve kime hitap edeceğini anlat..."
              className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-gray-700 shadow-inner resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1 italic">
              Logo Görsel Linki (URL)
            </label>
            <input
              type="url"
              placeholder="https://gorsel-linki.com/logo.png"
              className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-gray-700 shadow-inner"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-2xl text-white font-black uppercase italic tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl ${
              loading 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-95'
            }`}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Başvuruyu Gönder 
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateClubRequest;