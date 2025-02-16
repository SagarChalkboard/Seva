// src/app/dashboard/page.js
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, ResponsiveContainer } from 'recharts';
import { MapPin, Users, Package, Clock, TrendingUp, Award } from 'lucide-react';

const impactData = [
    { month: 'Jan', donations: 65, people: 120 },
    { month: 'Feb', donations: 78, people: 150 },
    { month: 'Mar', donations: 92, people: 170 },
    { month: 'Apr', donations: 85, people: 160 },
    { month: 'May', donations: 105, people: 190 },
    { month: 'Jun', donations: 152, people: 280 },
];

const initialStats = {
    totalDonations: 0,
    peopleHelped: 0,
    activeListings: 0,
    impactScore: 0,
    totalWeight: "0",
    communityRank: "#0"
};

export default function Dashboard() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [listings, setListings] = useState([]);
    const [stats, setStats] = useState(initialStats);

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const res = await fetch('/api/listings/user');
                if (res.ok) {
                    const data = await res.json();
                    setListings(data.listings);
                }
            } catch (error) {
                console.error('Error fetching listings:', error);
            }
        };

        setMounted(true);
        fetchListings();
        setStats({
            totalDonations: 152,
            peopleHelped: 478,
            activeListings: 3,
            impactScore: 892,
            totalWeight: "1,235",
            communityRank: "#12"
        });
    }, []);

    if (!mounted) {
        return (
            <main className="min-h-screen bg-black pt-20">
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="animate-pulse">
                        <div className="h-8 w-48 bg-gray-800 rounded mb-4"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-48 bg-gray-800 rounded-xl"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black pt-20">
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
                            Welcome Back, Hero
                        </h1>
                        <p className="text-gray-400 mt-2">
                            Your impact is making waves in the community
                        </p>
                    </div>
                    <Link 
                        href="/share-food"
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl transition-all transform hover:scale-105"
                    >
                        Share Food
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-6 border border-purple-500/20">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mr-4">
                                <Package className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Total Donations</p>
                                <h3 className="text-3xl font-bold text-white">{stats.totalDonations}</h3>
                            </div>
                        </div>
                        <div className="h-20">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={impactData}>
                                    <Area type="monotone" dataKey="donations" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-6 border border-purple-500/20">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mr-4">
                                <Users className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">People Helped</p>
                                <h3 className="text-3xl font-bold text-white">{stats.peopleHelped}</h3>
                            </div>
                        </div>
                        <div className="h-20">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={impactData}>
                                    <Area type="monotone" dataKey="people" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-6 border border-purple-500/20">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mr-4">
                                <Award className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Impact Score</p>
                                <h3 className="text-3xl font-bold text-white">{stats.impactScore}</h3>
                            </div>
                        </div>
                        <p className="text-green-400 text-sm flex items-center">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            +24.8% this month
                        </p>
                    </div>
                </div>

                {/* Impact Chart */}
                <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-6 border border-purple-500/20 mb-12">
                    <h2 className="text-xl font-bold text-white mb-6">Impact Overview</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={impactData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="month" stroke="#9CA3AF" />
                                <YAxis stroke="#9CA3AF" />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#1F2937', 
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        color: '#F3F4F6'
                                    }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="donations" 
                                    stroke="#8B5CF6" 
                                    strokeWidth={2}
                                    dot={{ r: 4, fill: '#8B5CF6' }}
                                    activeDot={{ r: 8 }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="people" 
                                    stroke="#6366F1" 
                                    strokeWidth={2}
                                    dot={{ r: 4, fill: '#6366F1' }}
                                    activeDot={{ r: 8 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Active Listings */}
                <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-6 border border-purple-500/20 mb-12">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white">Active Listings</h2>
                        <Link 
                            href="/share-food"
                            className="text-purple-400 hover:text-purple-300 text-sm"
                        >
                            Create New
                        </Link>
                    </div>
                    
                    {listings.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-400 mb-4">No active listings</p>
                            <Link 
                                href="/share-food"
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
                            >
                                Share Food
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {listings.map((listing) => (
                                <div key={listing._id} className="bg-gray-800/50 rounded-xl p-4 border border-purple-500/10">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-white font-medium">{listing.title}</h3>
                                            <p className="text-gray-400 text-sm">Quantity: {listing.quantity}</p>
                                            <p className="text-gray-400 text-sm">
                                                Available until: {new Date(listing.availableUntil).toLocaleString()}
                                            </p>
                                        </div>
                                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">
                                            Active
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Community Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-6 border border-purple-500/20">
                        <h2 className="text-xl font-bold text-white mb-6">Community Impact</h2>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mr-4">
                                        <Award className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-white">Community Rank</p>
                                        <p className="text-gray-400 text-sm">Top contributors</p>
                                    </div>
                                </div>
                                <span className="text-2xl font-bold text-white">{stats.communityRank}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center mr-4">
                                        <Package className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div>
                                        <p className="text-white">Total Weight</p>
                                        <p className="text-gray-400 text-sm">Food shared (kg)</p>
                                    </div>
                                </div>
                                <span className="text-2xl font-bold text-white">{stats.totalWeight}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
