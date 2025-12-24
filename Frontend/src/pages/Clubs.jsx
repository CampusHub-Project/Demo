import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CheckCircle, Search, Sparkles, BellRing, Info, Loader2 } from 'lucide-react';

export default function Clubs() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/clubs/');
      setClubs(data.clubs);
    } catch (err) {
      toast.error("Kulüpler listesi alınamadı.");
      console.error("Kulüpler yüklenemedi", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (clubId) => {
    if (!user) {
      toast.warning('Takip etmek için giriş yapmalısın!');
      return;
    }
    try {
      await api.post(`/clubs/${clubId}/follow`);
      toast.success('🔔 Kulübü takip etmeye başladın!');
      // İsteğe bağlı: Takipçi sayısını güncellemek için listeyi yenileyebilirsin
    } catch (err) {
      toast.error(err.response?.data?.message || "Zaten takip ediyorsun.");
    }
  };

  // Arama filtresi
  const filteredClubs = clubs.filter(club => 
    club.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Bölümü */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2 text-blue-600 font-bold mb-2"
            >
              <Sparkles size={20} />
              <span className="uppercase tracking-wider text-sm">Kampüs Hayatına Katıl</span>
            </motion.div>
            <h1 className="text-5xl font-black text-gray-900 leading-tight">
              Öğrenci Kulüpleri
            </h1>
            <p className="text-gray-600 mt-4 text-lg">
              İlgi alanlarına uygun bir topluluk bul, etkinliklerden haberdar ol ve kampüsün aktif bir parçası ol.
            </p>
          </div>

          {/* Arama Çubuğu */}
          <div className="relative group w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Kulüp ara..."
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent shadow-xl rounded-2xl outline-none focus:border-blue-500 transition-all text-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {/* İçerik Alanı */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p className="font-medium">Kulüpler hazırlanıyor...</p>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence>
              {filteredClubs.map((club) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={club.id} 
                  className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col group"
                >
                  <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                  
                  <div className="p-8">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="relative">
                        <img 
                          src={club.image_url || 'https://via.placeholder.com/64'} 
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-50 shadow-inner group-hover:scale-105 transition-transform"
                        />
                        {club.status === 'active' && (
                          <div className="absolute -top-2 -right-2 bg-blue-500 text-white p-1 rounded-lg shadow-lg">
                            <CheckCircle size={14} />
                          </div>
                        )}
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-gray-800 leading-tight">
                          {club.name}
                        </h2>
                        <div className="flex items-center mt-1 text-blue-600 font-bold text-[10px] uppercase tracking-widest">
                          <BellRing size={12} className="mr-1" /> AKTİF TOPLULUK
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                      {club.description || "Bu kulüp topluluk üyelerini bekliyor. Henüz bir açıklama eklenmemiş."}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50">
                      <div className="flex items-center text-gray-400 text-xs font-bold uppercase tracking-wider">
                        <Users size={18} className="mr-2 text-blue-500" />
                        Takipçilere Katıl
                      </div>
                      <button 
                        onClick={() => handleFollow(club.id)}
                        className="px-6 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-black text-sm hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95"
                      >
                        Takip Et
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && filteredClubs.length === 0 && (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <Info className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 font-bold text-xl">Aradığın kriterlerde bir kulüp bulamadık.</p>
          </div>
        )}
      </div>
    </div>
  );
}