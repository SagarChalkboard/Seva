// src/components/shared/Navbar.js
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Notifications from '@/components/Notifications';
import { useSocket } from '@/context/SocketContext';
import { MessageSquare } from 'lucide-react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Add loading state
    const [unreadMessages, setUnreadMessages] = useState(0);
    const pathname = usePathname();
    const router = useRouter();
    const { isConnected, socket } = useSocket?.() || {};
    
    // Check auth status on component mount and after route changes
    useEffect(() => {
        checkAuthStatus();
    }, [pathname]);
    
    const checkAuthStatus = async () => {
        try {
            setIsLoading(true); // Set loading while checking
            
            const res = await fetch('/api/auth/check', {
                headers: { 'Cache-Control': 'no-cache' },
            });
            
            setIsLoggedIn(res.ok);
            
            // If logged in, fetch unread count
            if (res.ok) {
                fetchUnreadCount();
            }
        } catch (error) {
            console.error('Auth check error:', error);
            setIsLoggedIn(false);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Listen for new messages to update unread count
    useEffect(() => {
        if (!socket || !isConnected || !isLoggedIn) return;
        
        const handleNewMessage = (data) => {
            setUnreadMessages(prev => prev + 1);
        };
        
        socket.on('new-message', handleNewMessage);
        
        return () => {
            socket.off('new-message', handleNewMessage);
        };
    }, [socket, isConnected, isLoggedIn]);
    
    // Reset unread count when visiting messages page
    useEffect(() => {
        if (pathname === '/messages') {
            setUnreadMessages(0);
        }
    }, [pathname]);
    
    const fetchUnreadCount = async () => {
        try {
            const res = await fetch('/api/messages/unread');
            if (res.ok) {
                const data = await res.json();
                setUnreadMessages(data.count || 0);
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };
    
    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
            });
            setIsLoggedIn(false);
            router.push('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // If still loading, show minimal navbar
    if (isLoading) {
        return (
            <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-lg border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link 
                            href="/" 
                            className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400"
                        >
                            SEVA
                        </Link>
                        
                        {/* Loading indicator */}
                        <div className="w-8 h-8 rounded-full border-2 border-gray-800 border-t-purple-500 animate-spin"></div>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-lg border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        {/* Updated SEVA logo link */}
                        {isLoggedIn ? (
                            <Link href="/dashboard" className="text-xl font-bold text-white">
                                SEVA
                            </Link>
                        ) : (
                            <span className="text-xl font-bold text-white cursor-default">
                                SEVA
                            </span>
                        )}
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        {isLoggedIn ? (
                            <>
                                <Link 
                                    href="/find-food" 
                                    className={`text-sm font-medium transition-colors ${
                                        pathname === '/find-food' 
                                            ? 'text-purple-400' 
                                            : 'text-gray-300 hover:text-white'
                                    }`}
                                >
                                    Find Food
                                </Link>
                                <Link 
                                    href="/share-food"
                                    className={`text-sm font-medium transition-colors ${
                                        pathname === '/share-food' 
                                            ? 'text-purple-400' 
                                            : 'text-gray-300 hover:text-white'
                                    }`}
                                >
                                    Share Food
                                </Link>
                                <Link 
                                    href="/dashboard"
                                    className={`text-sm font-medium transition-colors ${
                                        pathname === '/dashboard' 
                                            ? 'text-purple-400' 
                                            : 'text-gray-300 hover:text-white'
                                    }`}
                                >
                                    Dashboard
                                </Link>
                                
                                {/* Messages Link with Unread Count */}
                                <Link 
                                    href="/messages"
                                    className={`text-sm font-medium transition-colors flex items-center ${
                                        pathname === '/messages' 
                                            ? 'text-purple-400' 
                                            : 'text-gray-300 hover:text-white'
                                    }`}
                                >
                                    <MessageSquare className="w-4 h-4 mr-1" />
                                    Messages
                                    {unreadMessages > 0 && (
                                        <span className="ml-1 bg-purple-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
                                            {unreadMessages > 99 ? '99+' : unreadMessages}
                                        </span>
                                    )}
                                </Link>
                                
                                {/* Logout Button */}
                                <button
                                    onClick={handleLogout}
                                    className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                                >
                                    Logout
                                </button>
                                
                                {/* Connection Status Indicator */}
                                <div className="flex items-center">
                                    <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <span className="text-xs text-gray-400">{isConnected ? 'Connected' : 'Offline'}</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link 
                                    href="/register" 
                                    className="text-gray-300 hover:text-white transition-colors"
                                >
                                    Sign Up
                                </Link>
                                <Link
                                    href="/login"
                                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                                >
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center space-x-4">
                        {isLoggedIn && (
                            <Link 
                                href="/messages"
                                className="relative text-gray-300 hover:text-white"
                            >
                                <MessageSquare className="w-6 h-6" />
                                {unreadMessages > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {unreadMessages > 9 ? '9+' : unreadMessages}
                                    </span>
                                )}
                            </Link>
                        )}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-md text-gray-400 hover:text-white focus:outline-none"
                        >
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                {isOpen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden bg-black/95 border-b border-white/10">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {isLoggedIn ? (
                            <>
                                <Link
                                    href="/find-food"
                                    className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Find Food
                                </Link>
                                <Link
                                    href="/share-food"
                                    className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Share Food
                                </Link>
                                <Link
                                    href="/dashboard"
                                    className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/messages"
                                    className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md flex items-center"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Messages
                                    {unreadMessages > 0 && (
                                        <span className="ml-2 bg-purple-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
                                            {unreadMessages > 99 ? '99+' : unreadMessages}
                                        </span>
                                    )}
                                </Link>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsOpen(false);
                                    }}
                                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/register"
                                    className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Sign Up
                                </Link>
                                <Link
                                    href="/login"
                                    className="block px-3 py-2 text-base font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}