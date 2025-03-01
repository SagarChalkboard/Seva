'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react'; // Assuming you're using Lucide icons

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Check authentication status on component mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/check');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                } else {
                    // Explicitly set user to null when not authenticated
                    setUser(null);
                }
            } catch (error) {
                console.error('Error checking auth:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setUser(null);
            router.push('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <nav className="bg-black/80 backdrop-blur-sm fixed w-full z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="text-xl font-bold text-white">
                            SEVA
                        </Link>
                    </div>
                    
                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link href="/" className="text-gray-300 hover:text-white px-3 py-2">
                            Home
                        </Link>
                        
                        {!loading && user ? (
                            <>
                                {/* Links for authenticated users */}
                                <Link href="/dashboard" className="text-gray-300 hover:text-white px-3 py-2">
                                    Dashboard
                                </Link>
                                <Link href="/find-food" className="text-gray-300 hover:text-white px-3 py-2">
                                    Find Food
                                </Link>
                                <Link href="/share-food" className="text-gray-300 hover:text-white px-3 py-2">
                                    Share Food
                                </Link>
                                <button 
                                    onClick={handleLogout}
                                    className="text-gray-300 hover:text-white px-3 py-2"
                                >
                                    Logout
                                </button>
                            </>
                        ) : !loading ? (
                            <>
                                {/* Links for unauthenticated users */}
                                <Link href="/login" className="text-gray-300 hover:text-white px-3 py-2">
                                    Login
                                </Link>
                                <Link href="/register" className="text-gray-300 hover:text-white px-3 py-2">
                                    Register
                                </Link>
                            </>
                        ) : null}
                    </div>
                    
                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-300 hover:text-white"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link href="/" className="text-gray-300 hover:text-white block px-3 py-2">
                            Home
                        </Link>
                        
                        {!loading && user ? (
                            <>
                                <Link href="/dashboard" className="text-gray-300 hover:text-white block px-3 py-2">
                                    Dashboard
                                </Link>
                                <Link href="/find-food" className="text-gray-300 hover:text-white block px-3 py-2">
                                    Find Food
                                </Link>
                                <Link href="/share-food" className="text-gray-300 hover:text-white block px-3 py-2">
                                    Share Food
                                </Link>
                                <button 
                                    onClick={handleLogout}
                                    className="text-gray-300 hover:text-white block px-3 py-2 w-full text-left"
                                >
                                    Logout
                                </button>
                            </>
                        ) : !loading ? (
                            <>
                                <Link href="/login" className="text-gray-300 hover:text-white block px-3 py-2">
                                    Login
                                </Link>
                                <Link href="/register" className="text-gray-300 hover:text-white block px-3 py-2">
                                    Register
                                </Link>
                            </>
                        ) : null}
                    </div>
                </div>
            )}
        </nav>
    );
} 