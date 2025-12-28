import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Search, Calendar as CalendarIcon, MapPin, Loader2, TrendingUp, Rocket, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import WeatherWidget from '../components/WeatherWidget';
import { useAuth } from '../context/AuthContext'; // Yetki kontrolü için eklendi

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  
  const { user } = useAuth(); // Kullanıcı bilgisi
  const navigate = useNavigate();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (dateFilter) params.append('date', dateFilter);

      const { data } = await api.get(`/events/?${params.toString()}`);
      setEvents(data.events);
    } catch (err) {
      console.error("Etkinlikler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchEvents();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, dateFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero & Arama Bölümü */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-4 inline-block">
            <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold">
              🎓 Kampüs Yaşamının Nabzı
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
            Her Etkinlikte <span className="text-yellow-300">Bir Anı</span>
          </h1>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto font-medium italic">
            Kulüpler, konserler, workshoplar ve daha fazlası. Kampüsteki tüm etkinlikleri keşfet!
          </p>
          
          <div className="bg-white p-3 rounded-3xl shadow-2xl flex flex-col md:flex-row gap-3 max-w-3xl mx-auto border border-white/20">
            <div className="flex-1 flex items-center px-4 bg-gray-50 rounded-2xl">
              <Search className="text-gray-400 mr-3" size={22} />
              <input 
                type="text"
                placeholder="Etkinlik ara... (örn: hackathon, konser)"
                className="w-full py-4 outline-none bg-transparent text-gray-700 placeholder:text-gray-400 font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center px-4 bg-gray-50 rounded-2xl">
              <CalendarIcon className="text-gray-400 mr-3" size={22} />
              <input 
                type="date"
                className="bg-transparent py-4 outline-none text-gray-700 font-medium"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ana İçerik */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        
        {/* Hava Durumu + İstatistik Kartları */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-1">
            <WeatherWidget />
          </div>
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-6 border-2 border-blue-100 hover:shadow-lg transition">
              <div className="text-4xl font-black text-blue-600 mb-2">{events.length}</div>
              <div className="text-sm text-gray-600 font-semibold uppercase tracking-tighter italic">Aktif Etkinlik</div>
            </div>
            <div className="bg-white rounded-2xl p-6 border-2 border-green-100 hover:shadow-lg transition">
              <div className="text-4xl font-black text-green-600 mb-2">12</div>
              <div className="text-sm text-gray-600 font-semibold uppercase tracking-tighter italic">Aktif Kulüp</div>
            </div>
            <div className="bg-white rounded-2xl p-6 border-2 border-purple-100 hover:shadow-lg transition">
              <div className="text-4xl font-black text-purple-600 mb-2">250+</div>
              <div className="text-sm text-gray-600 font-semibold uppercase tracking-tighter italic">Öğrenci</div>
            </div>
            <div className="bg-white rounded-2xl p-6 border-2 border-orange-100 hover:shadow-lg transition">
              <div className="text-4xl font-black text-orange-600 mb-2">48</div>
              <div className="text-sm text-gray-600 font-semibold uppercase tracking-tighter italic">Bu Ay</div>
            </div>
          </div>
        </div>

        {/* --- YENİ: KULÜP KURMA CTA BÖLÜMÜ --- */}
        {(!user || user.role !== 'admin') && (
          <div className="mb-16">
            <div className="relative overflow-hidden bg-indigo-600 rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-indigo-100 border border-indigo-500">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500 rounded-full opacity-30 blur-3xl"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">
                    Kendi Kulübünü Kurma Vakti Geldi!
                  </h2>
                  <p className="text-indigo-100 font-medium text-base italic opacity-90">
                    Kampüste yeni bir topluluk başlatmak ister misin? Hemen başvurunu yap, admin onayından sonra üyelerini toplamaya başla.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/create-club-request')}
                  className="group whitespace-nowrap bg-yellow-400 text-indigo-900 px-8 py-4 rounded-2xl font-black uppercase italic tracking-widest flex items-center gap-3 hover:bg-white transition-all active:scale-95 shadow-lg shadow-yellow-900/20"
                >
                  <Rocket size={22} className="group-hover:animate-bounce" />
                  Hemen Başvur
                  <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Etkinlik Başlığı */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter flex items-center">
              <TrendingUp className="mr-3 text-blue-600" size={32} />
              Yaklaşan Etkinlikler
            </h2>
            {searchTerm && (
              <p className="text-gray-500 mt-2 font-medium">
                "<span className="text-blue-600">{searchTerm}</span>" için bulunan sonuçlar
              </p>
            )}
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Canlı Etkinlik Sayısı</p>
            <p className="text-3xl font-black text-blue-600 italic">{events.length}</p>
          </div>
        </div>

        {/* Etkinlik Listesi */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={56} />
            <p className="text-gray-400 font-black uppercase italic tracking-widest text-sm">Etkinlikler Senkronize Ediliyor...</p>
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map(event => (
              <Link 
                to={`/events/${event.id}`} 
                key={event.id}
                className="group bg-white rounded-[2.5rem] border-2 border-gray-50 overflow-hidden hover:shadow-2xl hover:border-blue-100 transition-all duration-500 transform hover:-translate-y-2"
              >
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={event.image_url || 'https://via.placeholder.com/400x200?text=CampusHub'} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt={event.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg mb-2 italic">
                      {event.club_name}
                    </span>
                  </div>
                </div>
                <div className="p-7">
                  <h3 className="text-xl font-black text-gray-900 mb-4 group-hover:text-blue-600 transition uppercase italic tracking-tight line-clamp-2 leading-tight">
                    {event.title}
                  </h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-tight">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mr-3 text-blue-600">
                        <CalendarIcon size={16} />
                      </div>
                      {new Date(event.date).toLocaleDateString('tr-TR', { 
                        day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                    <div className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-tight">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center mr-3 text-rose-600">
                        <MapPin size={16} />
                      </div>
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                    <span className="text-blue-600 font-black text-[10px] uppercase italic tracking-[0.2em]">
                      İncele →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="col-span-full text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 shadow-inner">
            <div className="text-6xl mb-6">🔍</div>
            <p className="text-gray-900 text-xl font-black uppercase italic tracking-tighter mb-2">Sonuç Bulunamadı</p>
            <p className="text-gray-400 font-medium">Arama kriterlerinizi değiştirip tekrar deneyin.</p>
          </div>
        )}
      </div>
    </div>
  );
}