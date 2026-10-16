import { createContext, useContext, useState, useEffect } from 'react';
import { loginPatient, logoutPatient } from '../../api/authApi';
import store from '../../store/store';
const AuthContext = createContext(null);
export function AuthProvider({
  children
}) {
  const [user, setUser] = useState(() => {
    try {
      return localStorage.getItem('medislotToken') ? JSON.parse(localStorage.getItem('carevistaUser')) : null;
    } catch {
      return null;
    }
  });
  const [message, setMessage] = useState('');
  function clear() {
    try {
      const saved = user || JSON.parse(localStorage.getItem("carevistaUser"));
      if (saved?.id) sessionStorage.removeItem("carevistaAppointments:" + saved.id);
    } catch {}
    localStorage.removeItem('medislotToken');
    localStorage.removeItem('carevistaUser');
    localStorage.removeItem('medislotExpiresAt');
    setUser(null);
    store.dispatch({
      type: 'session/clear'
    });
  }
  useEffect(() => {
    const expire = () => {
      clear();
      setMessage('Your session expired or is unauthorized. Please log in again.');
    };
    window.addEventListener('session-expired', expire);
    return () => window.removeEventListener('session-expired', expire);
  }, []);
  useEffect(() => {
    if (!user) return;
    const expires = Number(localStorage.getItem('medislotExpiresAt'));
    const timer = setTimeout(() => window.dispatchEvent(new Event('session-expired')), Math.max(0, expires - Date.now()));
    return () => clearTimeout(timer);
  }, [user]);
  async function login(email, password) {
    const data = await loginPatient({
      email,
      password
    });
    localStorage.setItem('medislotExpiresAt', data.expiresAt);
    setUser(data.user);
    setMessage('');
  }
  async function logout() {
    try {
      await logoutPatient();
    } catch {
      console.info('Session cleared locally.');
    } finally {
      clear();
    }
  }
  return <AuthContext.Provider value={{
    user,
    login,
    logout,
    message,
    isAuthenticated: !!user
  }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
export default AuthContext;
