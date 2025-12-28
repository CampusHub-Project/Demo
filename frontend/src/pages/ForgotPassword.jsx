import { useState } from 'react';
import axios from '../api/axios'; // Kendi ekseninde axios instance'ın

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/auth/forgot-password', { email });
            setMessage(response.data.message);
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'Bir hata oluştu.');
            setMessage('');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="p-8 bg-white shadow-md rounded-lg w-96">
                <h2 className="text-2xl font-bold mb-4">Şifremi Unuttum</h2>
                <p className="text-gray-600 mb-4 text-sm">E-posta adresinizi girin, size bir sıfırlama linki gönderelim.</p>
                
                {message && <div className="p-3 mb-4 text-green-700 bg-green-100 rounded">{message}</div>}
                {error && <div className="p-3 mb-4 text-red-700 bg-red-100 rounded">{error}</div>}

                <input
                    type="email"
                    placeholder="E-posta Adresi"
                    className="w-full p-2 border rounded mb-4"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                    Sıfırlama Linki Gönder
                </button>
            </form>
        </div>
    );
};

export default ForgotPassword;