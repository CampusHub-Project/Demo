import { createContext, useState, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // LocalStorage'dan kullanıcıyı yükle (Sayfa yenilense de oturum gitmez)
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password }); //
    localStorage.setItem('token', data.token); //
    localStorage.setItem('user', JSON.stringify(data.user)); //
    setUser(data.user); //
    return data.user.role; // Login ekranındaki yönlendirme için rolü döndür
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);