// src/app/find-food/page.js
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FindFood() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [listings, setListings] = useState([]);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/check');
                if (!res.ok) {
                    router.push('/login');
                } else {
                    setLoading(false);
                    // TODO: Fetch actual listings
                    setListings([
                        {
                            id: 1,
                            title: "Fresh Cooked Meals",
                            description: "Homemade curry and rice",
                            quantity: "3 servings",
                            location: "Downtown",
                            distance: "2.5 km",
                            postedAt: "30 minutes ago",
                            availableUntil: "8 PM today"
                        }
                    ]);
                }
            } catch (error) {
                router.push('/login');
            }
        };

        checkAuth();
    }, [router]);

    return (
        <main className="min-h-screen bg-black pt-20">
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400 mb-4">
                        Find Food Near You
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Connect with generous donors in your community
                    </p>
                </div>

                {/* Search Section */}
                <div className="max-w-3xl mx-auto mb-16">
                    <div className="relative">
                        <input 
                            type="text"
                            placeholder="Enter your location"
                            className="w-full px-6 py-4 bg-gray-900 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button className="absolute right-2 top-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all">
                            Search
                        </button>
                    </div>
                </div>

                {/* Listings Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.map(listing => (
                        <div key={listing.id} className="bg-gray-900 rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-white">{listing.title}</h3>
                                    <p className="text-gray-400">{listing.distance} away</p>
                                </div>
                                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                                    Available Now
                                </span>
                            </div>
                            
                            <div className="space-y-3 mb-6">
                                <p className="text-gray-300">{listing.description}</p>
                                <p className="text-gray-400">{listing.quantity}</p>
                                <p className="text-gray-400">Pickup: {listing.availableUntil}</p>
                                <div className="text-sm text-gray-500">{listing.postedAt}</div>
                            </div>

                            <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg transition-all">
                                Reserve Now
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}