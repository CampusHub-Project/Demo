import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShieldCheck, Crown, Loader2 } from 'lucide-react';
import { useToast } from '../context/ToastContext'; // Toast entegrasyonu

export default function Login() {
  const [role, setRole] = useState('student'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Yüklenme durumu eklendi

  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Giriş işlemi başladı
    try {
      const userRole = await login(email, password);
      toast.success(`👋 Hoş geldiniz!`);
      
      // Role göre yönlendirme
      if (userRole === 'admin') navigate('/admin/dashboard');
      else if (userRole === 'club_admin') navigate('/dashboard');
      else navigate('/');
    } catch (err) {
      toast.error("Hatalı email veya şifre!");
    } finally {
      setLoading(false); // İşlem bittiğinde loading kapat
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Rol Seçici Tablar */}
        <div className="flex bg-gray-100 p-2 m-6 rounded-2xl">
          {['student', 'club_admin', 'admin'].map((r) => (
            <button
              key={r}
              disabled={loading} // Giriş yaparken rol değişimi engellendi
              onClick={() => setRole(r)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                role === r 
                  ? 'bg-white shadow-md text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {r === 'student' ? 'Öğrenci' : r === 'club_admin' ? 'Başkan' : 'Admin'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.form 
            key={role}
            initial={{ x: 10, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            exit={{ x: -10, opacity: 0 }}
            onSubmit={handleLogin} 
            className="p-8 pt-0 space-y-5"
          >
            <div className="text-center mb-6">
              {role === 'student' && <User className="mx-auto text-blue-500 mb-2" size={40} />}
              {role === 'club_admin' && <Crown className="mx-auto text-yellow-500 mb-2" size={40} />}
              {role === 'admin' && <ShieldCheck className="mx-auto text-red-500 mb-2" size={40} />}
              <h2 className="text-2xl font-black text-gray-800 uppercase">
                {role === 'student' ? 'Öğrenci' : role === 'club_admin' ? 'Kulüp Başkanı' : 'Admin'} Girişi
              </h2>
            </div>

            <input 
              type="email" 
              placeholder="E-posta" 
              required
              disabled={loading}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input 
              type="password" 
              placeholder="Şifre" 
              required
              disabled={loading}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
              onChange={(e) => setPassword(e.target.value)}
            />
            
            <button 
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-black text-white shadow-lg transition-all active:scale-95 flex items-center justify-center space-x-2 ${
                role === 'student' ? 'bg-blue-600 hover:bg-blue-700' : 
                role === 'club_admin' ? 'bg-yellow-600 hover:bg-yellow-700' : 
                'bg-red-600 hover:bg-red-700'
              } disabled:opacity-70 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>GİRİŞ YAPILIYOR...</span>
                </>
              ) : (
                <span>GİRİŞ YAP</span>
              )}
            </button>
          </motion.form>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}