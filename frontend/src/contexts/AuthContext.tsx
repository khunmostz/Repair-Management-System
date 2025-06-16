import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
    ID: number;
    username: string;
    email: string;
    fullName: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string, email: string, fullName: string, role: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:1234/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            // Set default authorization header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Load user from localStorage if available
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
        }
    }, [token]);

    const login = async (username: string, password: string) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, {
                username,
                password,
            });
            const { token, user } = response.data;
            setToken(token);
            setUser(user);
            localStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const register = async (username: string, password: string, email: string, fullName: string, role: string) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/register`, {
                username,
                password,
                email,
                fullName,
                role,
            });
            // You might want to automatically log in the user after registration
            const { token, user } = response.data;
            setToken(token);
            setUser(user);
            localStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const value = {
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!token,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
