import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';
import { connectWebSocket, disconnectWebSocket } from '../services/websocket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [wsConnected, setWsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleIncomingNotification = useCallback((notification) => {
    setNotifications((prev) => [notification, ...prev.slice(0, 49)]);
    setUnreadCount((c) => c + 1);

    // Browser notification for critical alerts
    if (notification.severity === 'CRITICAL' && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: `alert-${notification.id}`,
      });
    }
  }, []);

  // Connect WebSocket when user logs in
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (user && token) {
      connectWebSocket(
        user.username,
        token,
        handleIncomingNotification,
        () => setWsConnected(true),
        () => setWsConnected(false)
      );

      // Request browser notification permission
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
    return () => {
      if (!user) disconnectWebSocket();
    };
  }, [user, handleIncomingNotification]);

  const login = async (usernameOrEmail, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.login({ usernameOrEmail, password });
      const { accessToken, refreshToken, ...userData } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    disconnectWebSocket();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    setNotifications([]);
    setUnreadCount(0);
    setWsConnected(false);
  };

  const clearUnread = () => setUnreadCount(0);

  const hasRole = (...roles) => user && roles.includes(user.role);

  const isAdmin = () => user?.role === 'ADMIN';
  const isCoordinator = () => user?.role === 'CARE_COORDINATOR';
  const isDoctor = () => user?.role === 'DOCTOR';
  const isNurse = () => user?.role === 'NURSE';

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      loading,
      error,
      notifications,
      unreadCount,
      clearUnread,
      wsConnected,
      hasRole,
      isAdmin,
      isCoordinator,
      isDoctor,
      isNurse,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default AuthContext;
