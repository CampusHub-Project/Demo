import { useEffect, useState } from 'react';
import api from '../api/axios';
import { PlusCircle, Users, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ClubDashboard() {
  const [myClubs, setMyClubs] = useState([]);

  useEffect(() => {
    const fetchMyClubs = async () => {
      try {
        // Backend'deki ClubService.get_my_clubs metodunu çağırır
        const { data } = await api.get('/clubs/my-clubs');
        setMyClubs(data.clubs);
      } catch (err) {
        console.error("Kulüpleriniz yüklenemedi.");
      }
    };
    fetchMyClubs();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-black text-gray-900 mb-2">Başkan Paneli 👑</h1>
      <p className="text-gray-500 mb-10 text-lg">Yönettiğin kulüpler ve üyelerin burada görünür.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {myClubs.map(club => (
          <div key={club.id} className="bg-white rounded-3xl border-2 border-gray-100 p-6 shadow-sm">
            <div className="flex items-center space-x-4 mb-6">
              <img src={club.image_url || 'https://via.placeholder.com/60'} className="w-16 h-16 rounded-2xl object-cover" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{club.name}</h2>
                <span className="text-xs font-black bg-green-100 text-green-700 px-3 py-1 rounded-full uppercase">Aktif</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Etkinlik oluşturma rotasına yönlendirir */}
              <Link to={`/club/${club.id}/create-event`} className="flex flex-col items-center p-6 bg-blue-50 rounded-2xl text-blue-700 hover:bg-blue-600 hover:text-white transition">
                <PlusCircle size={28} className="mb-2" />
                <span className="font-bold">Etkinlik Ekle</span>
              </Link>
              {/* Üye yönetimi rotasına yönlendirir */}
              <Link to={`/club/${club.id}/members`} className="flex flex-col items-center p-6 bg-purple-50 rounded-2xl text-purple-700 hover:bg-purple-600 hover:text-white transition">
                <Users size={28} className="mb-2" />
                <span className="font-bold">Üyeleri Yönet</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}