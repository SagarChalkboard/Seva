// src/components/shared/Navbar.js
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import NavContent from './NavContent';

export default function Navbar() {
    const [mounted, setMounted] = useState(false);
    
    // Run only on the client
    useEffect(() => {
        setMounted(true);
    }, []);

    // Until mounted, render nothing to avoid hydration mismatches
    if (!mounted) return null;

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
                    <NavContent />
                </div>
            </div>
        </nav>
    );
}