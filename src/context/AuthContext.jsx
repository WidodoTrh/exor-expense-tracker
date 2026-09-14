import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [accessToken, setAccessToken] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function tryRefresh() {
            try {
                const res = await fetch('/api/auth/refresh', {
                    method: 'POST',
                    credentials: 'include',
                });
                if (res.ok) {
                    const data = await res.json();
                    console.log('data user ', data)
                    setAccessToken(data.access_token);
                    setUser(data.user);
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false);
            }
        }
        tryRefresh();
    }, []);

    const login = (token, userInfo) => {
        setAccessToken(token);
        setUser(userInfo);
    };

    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
        setAccessToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ accessToken, user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);