import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom'; // useLocation eklendi
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShieldCheck, Crown, Loader2, KeyRound } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const [role, setRole] = useState('student'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Yönlendirme bilgisini almak için
  const toast = useToast();

  // Eğer EventDetail gibi bir sayfadan yönlendirilmişse, o sayfanın yolunu alır, yoksa role göre varsayılana gider
  const from = location.state?.from;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userRole = await login(email, password, role); 
      
      toast.success(`👋 Tekrar Hoş Geldiniz!`);
      
      // --- AKILLI YÖNLENDİRME MANTIĞI ---
      // 1. Eğer özel bir 'from' adresi varsa (örn: etkinlik detayı), oraya geri dön.
      // 2. Yoksa, role göre ilgili dashboard'a git.
      if (from) {
        navigate(from, { replace: true });
      } else {
        if (userRole === 'admin') {
          navigate('/admin/dashboard');
        } else if (userRole === 'club_admin') {
          navigate('/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Hatalı e-posta veya şifre!";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-700 to-indigo-900 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        {/* Rol Seçici Tablar */}
        <div className="flex bg-gray-100 p-1.5 m-8 mb-4 rounded-2xl border border-gray-200">
          {['student', 'club_admin', 'admin'].map((r) => (
            <button
              key={r}
              type="button"
              disabled={loading}
              onClick={() => setRole(r)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                role === r 
                  ? 'bg-white shadow-sm text-indigo-600 ring-1 ring-black/5' 
                  : 'text-gray-400 hover:text-gray-600'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {r === 'student' ? 'Öğrenci' : r === 'club_admin' ? 'Başkan' : 'Admin'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.form 
            key={role}
            initial={{ y: 10, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: -10, opacity: 0 }}
            onSubmit={handleLogin} 
            className="p-8 pt-0 space-y-4"
          >
            <div className="text-left mb-8">
              <div className="flex items-center space-x-3 mb-2">
                <div className={`p-3 rounded-2xl bg-opacity-10 ${
                  role === 'student' ? 'bg-blue-500 text-blue-600' : 
                  role === 'club_admin' ? 'bg-yellow-500 text-yellow-600' : 
                  'bg-red-500 text-red-600'
                }`}>
                  {role === 'student' && <User size={28} />}
                  {role === 'club_admin' && <Crown size={28} />}
                  {role === 'admin' && <ShieldCheck size={28} />}
                </div>
                <div>
                  <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter italic leading-none">
                    {role === 'student' ? 'Öğrenci' : role === 'club_admin' ? 'Başkan' : 'Admin'}
                  </h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Sisteme Giriş Yap</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-left">
              <div className="group">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">E-Posta Adresi</label>
                <input 
                  type="email" 
                  placeholder="name@university.edu.tr" 
                  required
                  disabled={loading}
                  value={email}
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all disabled:opacity-50 font-bold text-sm"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="group">
                <div className="flex justify-between items-center mb-1 ml-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Şifre</label>
                  <Link 
                    to="/forgot-password"
                    className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline italic transition-colors hover:text-indigo-800"
                  >
                    Şifremi Unuttum?
                  </Link>
                </div>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  required
                  disabled={loading}
                  value={password}
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all disabled:opacity-50 font-bold text-sm"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-5 rounded-2xl font-black text-white shadow-xl transition-all active:scale-[0.98] flex items-center justify-center space-x-3 mt-4 ${
                role === 'student' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 
                role === 'club_admin' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' : 
                'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
              } disabled:opacity-70 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  <span className="uppercase tracking-widest">Doğrulanıyor...</span>
                </>
              ) : (
                <>
                  <KeyRound size={20} />
                  <span className="uppercase tracking-widest italic">KAMPÜSE GİRİŞ YAP</span>
                </>
              )}
            </button>
          </motion.form>
        </AnimatePresence>

        <div className="p-8 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Henüz bir hesabın yok mu? <Link to="/register" className="text-indigo-600 hover:underline">Şimdi Kaydol</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}