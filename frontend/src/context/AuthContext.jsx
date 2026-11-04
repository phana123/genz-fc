import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { csrfCookieUrl } from '../services/api';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('genz-user')); } catch { return null; } });
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem('genz-user')) { setReady(true); return; }
    axios.get('http://localhost:8000/api/me', { withCredentials: true, withXSRFToken: true }).then(({ data }) => { setUser(data); localStorage.setItem('genz-user', JSON.stringify(data)); }).catch(() => setUser(null)).finally(() => setReady(true));
  }, []);
  const value = useMemo(() => ({ user, ready, async login(email, password) { await axios.get(csrfCookieUrl, { withCredentials: true, withXSRFToken: true }); const { data } = await axios.post('http://localhost:8000/api/login', { email, password }, { withCredentials: true, withXSRFToken: true, headers: { Accept: 'application/json' } }); localStorage.setItem('genz-user', JSON.stringify(data.user)); setUser(data.user); }, async updateProfile(profile) { const isFormData = profile instanceof FormData; if (isFormData) { const { data } = await axios.post('http://localhost:8000/api/profile', profile, { withCredentials: true, withXSRFToken: true }); localStorage.setItem('genz-user', JSON.stringify(data)); setUser(data); return data; } const { data } = await axios.put('http://localhost:8000/api/profile', profile, { withCredentials: true, withXSRFToken: true }); localStorage.setItem('genz-user', JSON.stringify(data)); setUser(data); return data; }, async logout() { try { await axios.post('http://localhost:8000/api/logout', {}, { withCredentials: true, withXSRFToken: true }); } finally { localStorage.removeItem('genz-user'); setUser(null); } } }), [user, ready]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
