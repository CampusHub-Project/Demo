import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return alert("Şifreler uyuşmuyor!");
        }

        try {
            const response = await axios.post('/auth/reset-password', { token, password });
            alert(response.data.message);
            navigate('/login'); // Başarılıysa login'e yönlendir
        } catch (err) {
            setMessage(err.response?.data?.error || 'Hata oluştu.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="p-8 bg-white shadow-md rounded-lg w-96">
                <h2 className="text-2xl font-bold mb-4">Yeni Şifre Belirle</h2>
                
                {message && <div className="p-3 mb-4 text-red-700 bg-red-100 rounded">{message}</div>}

                <input
                    type="password"
                    placeholder="Yeni Şifre"
                    className="w-full p-2 border rounded mb-2"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Şifre Tekrar"
                    className="w-full p-2 border rounded mb-4"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
                    Şifreyi Güncelle
                </button>
            </form>
        </div>
    );
};

export default ResetPassword;