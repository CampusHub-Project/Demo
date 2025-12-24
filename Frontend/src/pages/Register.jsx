import { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, BookOpen, Loader2, ArrowLeft, Hash } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const [formData, setFormData] = useState({ 
    full_name: '', 
    email: '', 
    password: '', 
    department: '',
    student_number: '' // İsmi daha yaygın olan student_number ile değiştirdik
  });
  const [loading, setLoading] = useState(false);
  
  const toast = useToast();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Backend'in hangi ismi beklediğinden emin değilsek ikisini birden göndermek bir çözümdür:
    const payload = {
      ...formData,
      student_id: formData.student_number, // Hem id hem number olarak gönderiyoruz
      school_id: formData.student_number   // Hata mesajındaki school_id ihtimaline karşı
    };

    try {
      await api.post('/auth/register', payload);
      toast.success('🎉 Kayıt başarılı! Giriş yapabilirsiniz.');
      navigate('/login');
    } catch (err) {
      console.log("Hata Detayı:", err.response?.data); // Tarayıcı konsolunda tam hatayı görmek için
      toast.error(err.response?.data?.error || "Kayıt hatası oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-blue-900 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          <Link to="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors">
            <ArrowLeft size={16} className="mr-1" /> Giriş Sayfasına Dön
          </Link>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UserPlus className="text-indigo-600" size={32} />
            </div>
            <h2 className="text-3xl font-black text-gray-800">Aramıza Katıl</h2>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* Öğrenci Numarası Alanı */}
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Öğrenci Numarası (Okul ID)" 
                required
                disabled={loading}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:opacity-50"
                onChange={(e) => setFormData({...formData, student_number: e.target.value})} 
              />
            </div>

            {/* Ad Soyad */}
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Ad Soyad" 
                required
                disabled={loading}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:opacity-50"
                onChange={(e) => setFormData({...formData, full_name: e.target.value})} 
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="email" 
                placeholder="E-posta" 
                required
                disabled={loading}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:opacity-50"
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
              />
            </div>

            {/* Şifre */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="password" 
                placeholder="Şifre" 
                required
                disabled={loading}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:opacity-50"
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
              />
            </div>

            {/* Bölüm */}
            <div className="relative">
              <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Bölüm" 
                required
                disabled={loading}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:opacity-50"
                onChange={(e) => setFormData({...formData, department: e.target.value})} 
              />
            </div>

            <button 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black text-lg shadow-lg transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <span>HESAP OLUŞTUR</span>}
            </button>
          </form>

          <p className="text-center mt-8 text-gray-600">
            Zaten bir hesabın var mı? <Link to="/login" className="text-indigo-600 font-bold">Giriş Yap</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}