'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/shared/Navbar';

export default function Dashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/check');
                if (!res.ok) {
                    router.push('/login');
                } else {
                    setLoading(false);
                }
            } catch (error) {
                router.push('/login');
            }
        };
        
        checkAuth();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-black pt-20">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
                            Welcome to Your Dashboard
                        </h1>
                        <p className="text-gray-400 mt-2">
                            Make a difference in your community today
                        </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                        <Link href="/share-food" 
                            className="p-6 bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all group">
                            <h2 className="text-2xl font-semibold text-white mb-2">Share Food</h2>
                            <p className="text-gray-300 mb-4">List your excess food and help those in need</p>
                            <span className="text-purple-400 group-hover:text-purple-300 transition-colors">
                                Get Started →
                            </span>
                        </Link>

                        <Link href="/find-food"
                            className="p-6 bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl border border-blue-500/20 hover:border-blue-500/40 transition-all group">
                            <h2 className="text-2xl font-semibold text-white mb-2">Find Food</h2>
                            <p className="text-gray-300 mb-4">Discover available food donations near you</p>
                            <span className="text-blue-400 group-hover:text-blue-300 transition-colors">
                                Search Now →
                            </span>
                        </Link>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-gray-900 rounded-2xl p-6 border border-purple-500/20">
                        <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
                        <div className="space-y-4">
                            {/* Placeholder for recent activities */}
                            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-xl">
                                <div>
                                    <h3 className="text-white font-medium">Coming Soon!</h3>
                                    <p className="text-gray-400 text-sm">Track your food sharing journey here</p>
                                </div>
                                <span className="text-gray-500">•••</span>
                            </div>
                        </div>
                    </div>

                    {/* Impact Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        <div className="bg-gray-900 p-6 rounded-xl border border-purple-500/20">
                            <h3 className="text-gray-400 text-sm">Total Shares</h3>
                            <p className="text-2xl font-bold text-white mt-1">0</p>
                        </div>
                        <div className="bg-gray-900 p-6 rounded-xl border border-purple-500/20">
                            <h3 className="text-gray-400 text-sm">People Helped</h3>
                            <p className="text-2xl font-bold text-white mt-1">0</p>
                        </div>
                        <div className="bg-gray-900 p-6 rounded-xl border border-purple-500/20">
                            <h3 className="text-gray-400 text-sm">Community Rating</h3>
                            <p className="text-2xl font-bold text-white mt-1">New Member</p>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
