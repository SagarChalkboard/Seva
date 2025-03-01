// src/context/SocketContext.js
'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useRouter } from 'next/navigation';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check for user authentication
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const token = getCookie('token');

    if (!token) {
      console.log('No authentication token found');
      return;
    }

    // Get user's location
    const getLocation = () => {
      return new Promise((resolve) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude
              });
            },
            () => {
              console.warn('Unable to get location');
              resolve(null);
            }
          );
        } else {
          console.warn('Geolocation not supported');
          resolve(null);
        }
      });
    };

    const initializeSocket = async () => {
      try {
        const location = await getLocation();
        
        // Initialize socket connection
        const socketInstance = io(
          process.env.NODE_ENV === 'production'
            ? 'https://seva-app.vercel.app'
            : 'http://localhost:3000',
          {
            auth: { token },
            query: location ? {
              lat: location.lat,
              lng: location.lng,
              radius: 10 // 10km radius
            } : {}
          }
        );

        socketInstance.on('connect', () => {
          console.log('Socket connected');
          setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
          console.log('Socket disconnected');
          setIsConnected(false);
        });

        socketInstance.on('notification', (notification) => {
          console.log('Received notification:', notification);
          
          // Add notification to state
          setNotifications(prev => [notification, ...prev]);
          
          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification('SEVA', {
              body: notification.message,
              icon: '/logo.png'
            });
          }
        });

        socketInstance.on('listing-added', (data) => {
          console.log('New listing added:', data);
          // Handle new listing notification
          setNotifications(prev => [{
            type: 'new-listing',
            message: `New food available near you: ${data.listing.title}`,
            data: data.listing,
            timestamp: new Date()
          }, ...prev]);
        });

        socketInstance.on('error', (error) => {
          console.error('Socket error:', error);
        });

        setSocket(socketInstance);

        // Clean up on unmount
        return () => {
          socketInstance.disconnect();
        };
      } catch (error) {
        console.error('Error initializing socket:', error);
      }
    };

    initializeSocket();
  }, []);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  // Provide socket and related methods
  const value = {
    socket,
    isConnected,
    notifications,
    clearNotification: (index) => {
      setNotifications(prev => {
        const newNotifications = [...prev];
        newNotifications.splice(index, 1);
        return newNotifications;
      });
    },
    clearAllNotifications: () => {
      setNotifications([]);
    },
    sendMessage: (recipientId, content) => {
      if (socket) {
        socket.emit('send-message', { recipientId, content });
      }
    },
    createListing: (listing) => {
      if (socket) {
        socket.emit('new-listing', listing);
      }
    },
    reserveListing: (listingId) => {
      if (socket) {
        socket.emit('reserve-listing', { listingId });
      }
    }
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);