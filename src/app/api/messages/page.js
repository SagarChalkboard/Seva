// src/app/messages/page.js
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MessageSquare, User, ChevronRight } from 'lucide-react';
import MessagingInterface from '@/components/MessagingInterface';
import { useSocket } from '@/context/SocketContext';

export default function Messages() {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { socket, isConnected } = useSocket();
    
    // Check for user ID in query parameters
    useEffect(() => {
        const userId = searchParams.get('userId');
        const userName = searchParams.get('userName');
        
        if (userId && userName) {
            setSelectedUser({
                id: userId,
                name: userName
            });
        }
    }, [searchParams]);
    
    // Fetch conversations
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                setLoading(true);
                const res = await fetch('/api/messages');
                
                if (!res.ok) {
                    throw new Error('Failed to fetch conversations');
                }
                
                const data = await res.json();
                setConversations(data.conversations || []);
            } catch (err) {
                console.error('Error fetching conversations:', err);
                setError('Could not load conversations');
            } finally {
                setLoading(false);
            }
        };
        
        fetchConversations();
    }, []);
    
    // Listen for new messages
    useEffect(() => {
        if (!socket || !isConnected) return;
        
        const handleNewMessage = (data) => {
            // Update conversations list with new message
            setConversations(prev => {
                // Check if conversation exists
                const existingConvIndex = prev.findIndex(
                    conv => conv.userId === data.senderId
                );
                
                if (existingConvIndex >= 0) {
                    // Update existing conversation
                    const updatedConversations = [...prev];
                    updatedConversations[existingConvIndex] = {
                        ...updatedConversations[existingConvIndex],
                        lastMessage: data.content,
                        timestamp: new Date(),
                        unreadCount: selectedUser?.id === data.senderId 
                            ? 0 
                            : updatedConversations[existingConvIndex].unreadCount + 1
                    };
                    
                    // Move conversation to top
                    const [conversation] = updatedConversations.splice(existingConvIndex, 1);
                    return [conversation, ...updatedConversations];
                } else {
                    // Add new conversation
                    return [{
                        userId: data.senderId,
                        name: data.senderName,
                        lastMessage: data.content,
                        timestamp: new Date(),
                        unreadCount: 1
                    }, ...prev];
                }
            });
        };
        
        socket.on('new-message', handleNewMessage);
        
        // Clean up
        return () => {
            socket.off('new-message', handleNewMessage);
        };
    }, [socket, isConnected, selectedUser]);
    
    // Format time
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return date.toLocaleDateString([], { weekday: 'short' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };
    
    const handleSelectConversation = (conversation) => {
        setSelectedUser({
            id: conversation.userId,
            name: conversation.name
        });
        
        // Update URL without reloading
        router.push(`/messages?userId=${conversation.userId}&userName=${encodeURIComponent(conversation.name)}`, { shallow: true });
        
        // Reset unread count
        setConversations(prev => 
            prev.map(conv => 
                conv.userId === conversation.userId 
                    ? { ...conv, unreadCount: 0 } 
                    : conv
            )
        );
    };
    
    const handleCloseMessage = () => {
        setSelectedUser(null);
        router.push('/messages', { shallow: true });
    };
    
    // Show messaging interface if user is selected
    if (selectedUser) {
        return (
            <MessagingInterface 
                userId={selectedUser.id}
                userName={selectedUser.name}
                onClose={handleCloseMessage}
            />
        );
    }
    
    return (
        <main className="min-h-screen bg-black pt-20">
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
                        Messages
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Connect with food sharers in your community
                    </p>
                </div>
                
                <div className="bg-gray-900 rounded-2xl border border-purple-500/20">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
                        </div>
                    ) : error ? (
                        <div className="p-6 text-center">
                            <p className="text-red-400">{error}</p>
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="py-16 text-center">
                            <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                                <MessageSquare className="w-8 h-8 text-purple-400" />
                            </div>
                            <h3 className="text-white text-lg font-medium mb-2">No messages yet</h3>
                            <p className="text-gray-400 max-w-sm mx-auto">
                                Start a conversation by reserving food or sharing with others in your community
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-800">
                            {conversations.map((conversation) => (
                                <button
                                    key={conversation.userId}
                                    className="w-full flex items-center p-4 hover:bg-gray-800/50 text-left transition-colors"
                                    onClick={() => handleSelectConversation(conversation)}
                                >
                                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div className="ml-4 flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="text-white font-medium truncate">{conversation.name}</h3>
                                            <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                                                {formatTime(conversation.timestamp)}
                                            </span>
                                        </div>
                                        <p className="text-gray-400 text-sm truncate">
                                            {conversation.lastMessage}
                                        </p>
                                    </div>
                                    <div className="ml-4 flex items-center">
                                        {conversation.unreadCount > 0 && (
                                            <span className="bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-2">
                                                {conversation.unreadCount}
                                            </span>
                                        )}
                                        <ChevronRight className="w-5 h-5 text-gray-400" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}