import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { 
  CheckCircle2, XCircle, Clock, Info, 
  MessageSquare, User, Mail, Building2, Loader2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminClubRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/club-requests/all'); // Admin için tümünü çeken endpoint
      setRequests(data.requests);
    } catch (err) {
      toast.error("Başvurular yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (requestId, status) => {
    let reason = null;
    if (status === 'rejected') {
      reason = window.prompt("Lütfen reddetme nedenini belirtin:");
      if (!reason) return; // İptal edilirse işlemi durdur
    }

    setProcessingId(requestId);
    try {
      await api.post(`/club-requests/${requestId}/review`, { status, reason });
      toast.success(status === 'approved' ? "✅ Kulüp başarıyla kuruldu!" : "🚫 Başvuru reddedildi.");
      fetchRequests(); // Listeyi güncelle
    } catch (err) {
      toast.error("İşlem başarısız.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <Loader2 className="animate-spin mb-4" size={40} />
      <p className="font-black uppercase tracking-widest text-xs italic">Talepler Senkronize Ediliyor...</p>
    </div>
  );

  return (
    <div className="text-left">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter flex items-center gap-3">
          <Building2 className="text-indigo-600" size={32} /> Kulüp Kuruluş Talepleri
        </h2>
        <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">Öğrencilerden Gelen Yeni Topluluk Başvuruları</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence>
          {requests.filter(r => r.status === 'pending').map((req) => (
            <motion.div 
              key={req.request_id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all group"
            >
              <div className="flex flex-col lg:flex-row">
                {/* Sol Taraf: Kulüp Bilgileri */}
                <div className="flex-1 p-8 border-b lg:border-b-0 lg:border-r border-gray-50">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                      <Building2 size={28} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">{req.club_name}</h3>
                      <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                        {req.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 font-medium italic leading-relaxed mb-6">"{req.description}"</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-gray-400">
                      <User size={16} className="text-indigo-400" />
                      <span className="text-xs font-bold">{req.requester?.full_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Mail size={16} className="text-indigo-400" />
                      <span className="text-xs font-bold">{req.contact_email}</span>
                    </div>
                  </div>
                </div>

                {/* Sağ Taraf: Aksiyonlar */}
                <div className="bg-gray-50/50 p-8 flex flex-col justify-center gap-4 min-w-[240px]">
                  <button 
                    disabled={processingId === req.request_id}
                    onClick={() => handleReview(req.request_id, 'approved')}
                    className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase italic tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    {processingId === req.request_id ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle2 size={20} /> Onayla</>}
                  </button>
                  <button 
                    disabled={processingId === req.request_id}
                    onClick={() => handleReview(req.request_id, 'rejected')}
                    className="w-full py-4 bg-white border-2 border-rose-100 text-rose-500 rounded-2xl font-black uppercase italic tracking-widest hover:bg-rose-50 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    <XCircle size={20} /> Reddet
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {requests.filter(r => r.status === 'pending').length === 0 && (
          <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
            <Clock size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-black uppercase italic tracking-widest">Bekleyen kuruluş talebi bulunmuyor</p>
          </div>
        )}
      </div>
    </div>
  );
}