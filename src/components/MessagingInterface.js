// src/components/MessagingInterface.js
'use client';
import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/context/SocketContext';
import { Send, X, ArrowLeft, User } from 'lucide-react';

export default function MessagingInterface({ userId, userName, onClose }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const messagesEndRef = useRef(null);
    const { socket, isConnected, sendMessage } = useSocket();
    
    // Fetch message history
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/messages/${userId}`);
                
                if (!res.ok) {
                    throw new Error('Failed to fetch messages');
                }
                
                const data = await res.json();
                setMessages(data.messages || []);
            } catch (err) {
                console.error('Error fetching messages:', err);
                setError('Could not load messages');
            } finally {
                setLoading(false);
            }
        };
        
        fetchMessages();
    }, [userId]);
    
    // Handle receiving new messages
    useEffect(() => {
        if (!socket || !isConnected) return;
        
        const handleNewMessage = (data) => {
            if (data.senderId === userId) {
                setMessages(prev => [...prev, {
                    id: data.id || Date.now(),
                    content: data.content,
                    sender: 'other',
                    timestamp: data.timestamp || new Date(),
                    read: false
                }]);
            }
        };
        
        socket.on('new-message', handleNewMessage);
        
        // Clean up
        return () => {
            socket.off('new-message', handleNewMessage);
        };
    }, [socket, isConnected, userId]);
    
    // Scroll to bottom of message list when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    const handleSendMessage = async (e) => {
        e.preventDefault();
        
        if (!input.trim()) return;
        
        const messageContent = input.trim();
        setInput('');
        
        // Optimistically add the message
        const tempId = `temp-${Date.now()}`;
        const tempMessage = {
            id: tempId,
            content: messageContent,
            sender: 'me',
            timestamp: new Date(),
            read: false,
            pending: true
        };
        
        setMessages(prev => [...prev, tempMessage]);
        
        // Send via socket if connected
        if (isConnected && socket) {
            sendMessage(userId, messageContent);
            
            // Set up one-time handlers for confirmation
            socket.once('message-sent', (data) => {
                // Replace the pending message with the confirmed one
                setMessages(prev => prev.map(msg => 
                    msg.id === tempId ? {
                        ...msg, 
                        id: data.id || tempId,
                        pending: false
                    } : msg
                ));
            });
            
            socket.once('error', (error) => {
                // Mark message as failed
                setMessages(prev => prev.map(msg => 
                    msg.id === tempId ? {
                        ...msg,
                        error: true,
                        pending: false
                    } : msg
                ));
                
                setError('Failed to send message');
            });
        } else {
            // Fallback to REST API
            try {
                const res = await fetch(`/api/messages/${userId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: messageContent })
                });
                
                if (!res.ok) {
                    throw new Error('Failed to send message');
                }
                
                const data = await res.json();
                
                // Replace the pending message with the confirmed one
                setMessages(prev => prev.map(msg => 
                    msg.id === tempId ? {
                        ...msg,
                        id: data.message.id || tempId,
                        pending: false
                    } : msg
                ));
            } catch (err) {
                console.error('Error sending message:', err);
                
                // Mark message as failed
                setMessages(prev => prev.map(msg => 
                    msg.id === tempId ? {
                        ...msg,
                        error: true,
                        pending: false
                    } : msg
                ));
                
                setError('Failed to send message');
            }
        }
    };
    
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    
    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 md:p-0">
            <div className="bg-gray-900 w-full max-w-lg rounded-2xl flex flex-col h-[600px] max-h-[90vh] overflow-hidden border border-purple-500/20">
                {/* Header */}
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                    <div className="flex items-center">
                        <button 
                            onClick={onClose}
                            className="mr-3 text-gray-400 hover:text-white md:hidden"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                                <User className="w-5 h-5" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-white font-medium">{userName}</h3>
                                <p className="text-gray-400 text-sm">
                                    {isConnected ? 'Online' : 'Offline'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-white hidden md:block"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                {/* Message List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-950/50">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
                                <Send className="w-6 h-6 text-purple-400" />
                            </div>
                            <p>No messages yet</p>
                            <p className="text-sm mt-2">Send a message to start the conversation</p>
                        </div>
                    ) : (
                        <>
                            {messages.map((message) => (
                                <div 
                                    key={message.id}
                                    className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div 
                                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                                            message.sender === 'me'
                                                ? message.error
                                                    ? 'bg-red-900/50 text-white'
                                                    : message.pending
                                                    ? 'bg-indigo-600/50 text-white'
                                                    : 'bg-indigo-600 text-white'
                                                : 'bg-gray-800 text-white'
                                        }`}
                                    >
                                        <p>{message.content}</p>
                                        <div className="flex justify-end items-center mt-1 space-x-1">
                                            <span className="text-xs opacity-70">
                                                {formatTime(message.timestamp)}
                                            </span>
                                            {message.sender === 'me' && (
                                                <>
                                                    {message.pending && (
                                                        <span className="text-xs opacity-70">• Sending</span>
                                                    )}
                                                    {message.error && (
                                                        <span className="text-xs text-red-300">• Failed</span>
                                                    )}
                                                    {!message.pending && !message.error && (
                                                        <span className="text-xs opacity-70">• Sent</span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>
                
                {/* Message Input */}
                <form 
                    onSubmit={handleSendMessage}
                    className="border-t border-gray-800 p-4 bg-gray-900"
                >
                    {error && (
                        <div className="mb-2 text-sm text-red-400">{error}</div>
                    )}
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim()}
                            className="p-2 bg-purple-600 rounded-full text-white disabled:opacity-50"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}