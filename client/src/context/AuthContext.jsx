import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('drivehire_token');
        if (token) {
            getMe()
                .then(res => setUser(res.data.user))
                .catch(() => {
                    localStorage.removeItem('drivehire_token');
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = (token, userData) => {
        localStorage.setItem('drivehire_token', token);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('drivehire_token');
        setUser(null);
    };

    const refreshUser = async () => {
        try {
            const res = await getMe();
            setUser(res.data.user);
        } catch (e) { console.error(e); }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, refreshUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
}
