// src/components/Notifications.js
'use client';
import { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { Bell, X, MapPin, Package, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Notifications() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, clearNotification, clearAllNotifications } = useSocket();
  const router = useRouter();
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    // Check if there are any unread notifications
    if (notifications.length > 0) {
      setHasUnread(true);
    }
  }, [notifications]);

  // Reset unread indicator when notifications are opened
  const handleOpen = () => {
    setIsOpen(true);
    setHasUnread(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new-listing':
        return <Package className="w-5 h-5 text-green-400" />;
      case 'reservation':
        return <MapPin className="w-5 h-5 text-purple-400" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-blue-400" />;
      default:
        return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const handleNotificationClick = (notification, index) => {
    // Navigate based on notification type
    switch (notification.type) {
      case 'new-listing':
        router.push(`/find-food?highlight=${notification.data._id}`);
        break;
      case 'reservation':
        router.push(`/dashboard?tab=listings&highlight=${notification.data.listingId}`);
        break;
      case 'message':
        router.push(`/messages/${notification.data.senderId}`);
        break;
    }
    clearNotification(index);
    setIsOpen(false);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button 
        className="relative p-2 text-gray-300 hover:text-white"
        onClick={handleOpen}
      >
        <Bell className="w-6 h-6" />
        {hasUnread && (
          <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full"></span>
        )}
      </button>
      
      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-800 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-800">
            <h3 className="text-lg font-medium text-white">Notifications</h3>
            <div className="flex space-x-2">
              {notifications.length > 0 && (
                <button 
                  className="text-xs text-gray-400 hover:text-white"
                  onClick={clearAllNotifications}
                >
                  Clear all
                </button>
              )}
              <button 
                className="text-gray-400 hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-6 text-center text-gray-500">
                <p>No notifications</p>
              </div>
            ) : (
              <div>
                {notifications.map((notification, index) => (
                  <div 
                    key={index} 
                    className="px-4 py-3 border-b border-gray-800 hover:bg-gray-800 cursor-pointer transition-colors"
                    onClick={() => handleNotificationClick(notification, index)}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm text-white">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTime(notification.timestamp || new Date())}
                        </p>
                      </div>
                      <button 
                        className="text-gray-500 hover:text-gray-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearNotification(index);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}