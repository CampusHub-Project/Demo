import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import { Building2, Mail, Info, Send, Sparkles, ArrowLeft } from 'lucide-react';

export default function CreateClubRequest() {
  const [formData, setFormData] = useState({
    club_name: '', description: '', category: '', contact_email: '', additional_info: ''
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/club-requests/', formData);
      toast.success("🚀 Başvuru başarıyla admin panelinine iletildi!");
      navigate('/profile');
    } catch (err) {
      toast.error("Başvuru sırasında bir hata oluştu.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-32 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 font-bold hover:text-indigo-600 mb-8 transition-colors uppercase text-[10px] tracking-widest">
          <ArrowLeft size={16} /> Geri Dön
        </button>

        <div className="bg-white rounded-[3rem] shadow-2xl shadow-indigo-100/50 border border-gray-100 p-8 md:p-16 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Building2 size={200} className="text-indigo-600" />
          </div>

          <div className="relative z-10">
            <header className="mb-12">
              <div className="flex items-center gap-2 text-indigo-600 font-black mb-2 uppercase tracking-widest text-xs">
                <Sparkles size={18} /> <span>Yeni Bir Topluluk Başlat</span>
              </div>
              <h1 className="text-5xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">
                Kulüp Kurma Talebi
              </h1>
              <p className="text-gray-400 mt-4 font-medium">Kampüsün geleceğini şekillendirecek olan kulübü tanımla.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Kulüp Adı</label>
                  <div className="relative group">
                    <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                    <input required className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent rounded-3xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-gray-700"
                      placeholder="Örn: Yapay Zeka Kulübü" value={formData.club_name} onChange={(e) => setFormData({...formData, club_name: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Kategori</label>
                  <select required className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-3xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-gray-700 appearance-none"
                    value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                    <option value="">Seçiniz</option>
                    <option value="Teknoloji">Teknoloji</option>
                    <option value="Sanat">Sanat</option>
                    <option value="Spor">Spor</option>
                    <option value="Kültür">Kültür</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">İletişim E-postası</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                  <input required type="email" className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent rounded-3xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-gray-700"
                    placeholder="club@university.edu" value={formData.contact_email} onChange={(e) => setFormData({...formData, contact_email: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Kulüp Vizyonu ve Açıklama</label>
                <textarea required rows="5" className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-3xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-gray-700 resize-none"
                  placeholder="Kulübün amaçları nelerdir?" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>

              <button disabled={loading} className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase italic tracking-widest shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" /> : <><Send size={20} /> Başvuruyu Admin'e Gönder</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}