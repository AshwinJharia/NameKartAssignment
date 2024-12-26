import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { VITE_API_URL } from "../config/api";

const SocketContext = createContext();

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io(VITE_API_URL, {
        auth: {
          token: localStorage.getItem("token"),
        },
      });

      newSocket.on("connect", () => {
        console.log("Connected to WebSocket server");
      });

      newSocket.on("notification", (notification) => {
        setNotifications((prev) => [notification, ...prev]);
      });

      newSocket.on("disconnect", () => {
        console.log("Disconnected from WebSocket server");
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const markNotificationAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value = {
    socket,
    notifications,
    markNotificationAsRead,
    clearNotifications,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
} 