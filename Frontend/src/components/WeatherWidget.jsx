import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Cloud, CloudRain, Sun, Wind, Loader2, MapPin } from 'lucide-react';

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('Istanbul');
  const [inputCity, setInputCity] = useState('Istanbul');

  useEffect(() => {
    fetchWeather();
  }, [city]);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/weather/?city=${city}`);
      setWeather(data.weather);
    } catch (err) {
      console.error('Hava durumu yüklenemedi:', err);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputCity.trim()) {
      setCity(inputCity.trim());
    }
  };

  const getWeatherIcon = (description) => {
    const desc = description.toLowerCase();
    if (desc.includes('yağmur') || desc.includes('çiseleme')) {
      return <CloudRain className="text-blue-500" size={48} />;
    }
    if (desc.includes('bulut') || desc.includes('kapalı')) {
      return <Cloud className="text-gray-500" size={48} />;
    }
    if (desc.includes('kar')) {
      return <Cloud className="text-blue-300" size={48} />;
    }
    return <Sun className="text-yellow-500" size={48} />;
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-center h-32">
          <Loader2 className="animate-spin" size={40} />
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="bg-gradient-to-br from-gray-400 to-gray-600 rounded-3xl p-6 text-white shadow-xl">
        <div className="text-center">
          <Cloud size={48} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">Hava durumu yüklenemedi</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-3xl p-6 text-white shadow-xl">
      {/* Şehir Arama */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2">
          <MapPin size={18} className="mr-2" />
          <input
            type="text"
            value={inputCity}
            onChange={(e) => setInputCity(e.target.value)}
            placeholder="Şehir ara..."
            className="bg-transparent outline-none flex-1 text-white placeholder:text-white/70"
          />
          <button type="submit" className="text-xs font-bold bg-white/30 px-3 py-1 rounded-lg hover:bg-white/40 transition">
            Ara
          </button>
        </div>
      </form>

      {/* Hava Durumu Bilgisi */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <MapPin size={20} />
            <h3 className="text-2xl font-black">{weather.city}</h3>
          </div>
          <div className="text-6xl font-black mb-2">
            {Math.round(weather.temperature)}°
          </div>
          <div className="text-lg font-semibold opacity-90 mb-3">
            {weather.description}
          </div>
          <div className="flex items-center space-x-2 text-sm opacity-80">
            <Wind size={16} />
            <span>Rüzgar: {weather.wind_speed} km/s</span>
          </div>
        </div>
        <div className="ml-4">
          {getWeatherIcon(weather.description)}
        </div>
      </div>

      {/* Dekoratif Alt Bilgi */}
      <div className="mt-4 pt-4 border-t border-white/20 text-xs text-white/70">
        🌤️ Open-Meteo API • Cache: 15dk
      </div>
    </div>
  );
}