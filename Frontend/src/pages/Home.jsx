import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Search, Calendar as CalendarIcon, MapPin, Loader2, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import WeatherWidget from '../components/WeatherWidget';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");

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
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Kulüpler, konserler, workshoplar ve daha fazlası. Kampüsteki tüm etkinlikleri keşfet, arkadaşlarınla katıl!
          </p>
          
          <div className="bg-white p-3 rounded-3xl shadow-2xl flex flex-col md:flex-row gap-3 max-w-3xl mx-auto">
            <div className="flex-1 flex items-center px-4 bg-gray-50 rounded-2xl">
              <Search className="text-gray-400 mr-3" size={22} />
              <input 
                type="text"
                placeholder="Etkinlik ara... (örn: hackathon, konser)"
                className="w-full py-4 outline-none bg-transparent text-gray-700 placeholder:text-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center px-4 bg-gray-50 rounded-2xl">
              <CalendarIcon className="text-gray-400 mr-3" size={22} />
              <input 
                type="date"
                className="bg-transparent py-4 outline-none text-gray-700"
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
          {/* Sol: Hava Durumu */}
          <div className="lg:col-span-1">
            <WeatherWidget />
          </div>
          
          {/* Sağ: Hızlı İstatistikler */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-6 border-2 border-blue-100 hover:shadow-lg transition">
              <div className="text-4xl font-black text-blue-600 mb-2">{events.length}</div>
              <div className="text-sm text-gray-600 font-semibold">Aktif Etkinlik</div>
            </div>
            <div className="bg-white rounded-2xl p-6 border-2 border-green-100 hover:shadow-lg transition">
              <div className="text-4xl font-black text-green-600 mb-2">12</div>
              <div className="text-sm text-gray-600 font-semibold">Aktif Kulüp</div>
            </div>
            <div className="bg-white rounded-2xl p-6 border-2 border-purple-100 hover:shadow-lg transition">
              <div className="text-4xl font-black text-purple-600 mb-2">250+</div>
              <div className="text-sm text-gray-600 font-semibold">Öğrenci</div>
            </div>
            <div className="bg-white rounded-2xl p-6 border-2 border-orange-100 hover:shadow-lg transition">
              <div className="text-4xl font-black text-orange-600 mb-2">48</div>
              <div className="text-sm text-gray-600 font-semibold">Bu Ay</div>
            </div>
          </div>
        </div>

        {/* Etkinlik Başlığı */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-black text-gray-900 flex items-center">
              <TrendingUp className="mr-3 text-blue-600" size={32} />
              Yaklaşan Etkinlikler
            </h2>
            {searchTerm && (
              <p className="text-gray-500 mt-2">
                "<span className="text-blue-600 font-semibold">{searchTerm}</span>" için sonuçlar
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Toplam Etkinlik</p>
            <p className="text-3xl font-black text-blue-600">{events.length}</p>
          </div>
        </div>

        {/* Etkinlik Listesi */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={56} />
            <p className="text-gray-500 font-medium">Etkinlikler yükleniyor...</p>
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map(event => (
              <Link 
                to={`/events/${event.id}`} 
                key={event.id}
                className="group bg-white rounded-3xl border-2 border-gray-100 overflow-hidden hover:shadow-2xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="relative h-52 overflow-hidden">
                  <img 
                    src={event.image_url || 'https://via.placeholder.com/400x200?text=CampusHub'} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    alt={event.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="inline-block bg-white/95 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-blue-600 shadow-lg mb-2">
                      {event.club_name}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition line-clamp-2">
                    {event.title}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarIcon size={16} className="mr-2 text-blue-500" />
                      <span className="font-medium">{new Date(event.date).toLocaleDateString('tr-TR', { 
                        day: 'numeric', 
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin size={16} className="mr-2 text-red-500" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="text-blue-600 font-semibold text-sm group-hover:text-blue-700">
                      Detayları Gör →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500 text-xl font-semibold mb-2">Etkinlik Bulunamadı</p>
            <p className="text-gray-400">Arama kriterlerinizi değiştirip tekrar deneyin.</p>
          </div>
        )}
      </div>
    </div>
  );
}