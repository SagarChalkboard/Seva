'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavContent() {
    const pathname = usePathname();
    const isProtectedRoute = ['/dashboard', '/share-food', '/find-food'].includes(pathname);

    return (
        <div className="hidden md:flex items-center space-x-8">
            {isProtectedRoute ? (
                <>
                    <Link 
                        href="/share-food" 
                        className="text-gray-300 hover:text-white transition-colors"
                    >
                        Share Food
                    </Link>
                    <Link 
                        href="/find-food" 
                        className="text-gray-300 hover:text-white transition-colors"
                    >
                        Find Food
                    </Link>
                    <button 
                        onClick={async () => {
                            await fetch('/api/auth/logout', { method: 'POST' });
                            window.location.href = '/';
                        }}
                        className="text-gray-300 hover:text-white transition-colors"
                    >
                        Logout
                    </button>
                </>
            ) : (
                <>
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
                </>
            )}
        </div>
    );
} 