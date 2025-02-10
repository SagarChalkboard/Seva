'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const res = await fetch('/api/auth/check');
            if (!res.ok) {
                router.push('/login');
            }
        };
        
        checkAuth();
    }, [router]);

    return (
        <main className="min-h-screen bg-black pt-20">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold text-white">Dashboard</h1>
                {/* Add dashboard content */}
            </div>
        </main>
    );
}
