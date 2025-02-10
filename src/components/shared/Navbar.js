// src/components/shared/Navbar.js
'use client';
import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-lg border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
                        SEVA
                    </Link>

                    <div className="hidden md:flex items-center space-x-8">
                        <Link 
                            href="/register" 
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                        >
                            Register
                        </Link>
                        <Link 
                            href="/login" 
                            className="text-gray-300 hover:text-white transition-colors"
                        >
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}