// src/app/share-food/page.js
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ShareFood() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        quantity: '',
        location: '',
        availableUntil: '',
        notes: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const res = await fetch('/api/listings/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Failed to create listing');

            router.push('/dashboard');
        } catch (error) {
            console.error('Error creating listing:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-black pt-20">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400 mb-4">
                        Share Food With Your Community
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Your excess can end someone's hunger today
                    </p>
                </div>

                <div className="max-w-2xl mx-auto">
                    <div className="bg-gray-900 rounded-2xl p-8 border border-purple-500/20">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Food Title */}
                            <div>
                                <label className="block text-gray-300 mb-2 text-sm">
                                    What food would you like to share?
                                </label>
                                <input 
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-800 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="e.g., Homemade Curry, Fresh Groceries"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-gray-300 mb-2 text-sm">
                                    Description
                                </label>
                                <textarea 
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-800 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Describe the food you're sharing"
                                    rows="3"
                                />
                            </div>

                            {/* Quantity */}
                            <div>
                                <label className="block text-gray-300 mb-2 text-sm">
                                    Quantity
                                </label>
                                <input 
                                    type="text"
                                    required
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-800 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="e.g., 3 servings, 2 bags"
                                />
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-gray-300 mb-2 text-sm">
                                    Pickup Location
                                </label>
                                <input 
                                    type="text"
                                    required
                                    value={formData.location}
                                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-800 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Enter pickup address"
                                />
                            </div>

                            {/* Available Until */}
                            <div>
                                <label className="block text-gray-300 mb-2 text-sm">
                                    Available Until
                                </label>
                                <input 
                                    type="datetime-local"
                                    required
                                    value={formData.availableUntil}
                                    onChange={(e) => setFormData({...formData, availableUntil: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-800 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            {/* Additional Notes */}
                            <div>
                                <label className="block text-gray-300 mb-2 text-sm">
                                    Additional Notes
                                </label>
                                <textarea 
                                    value={formData.notes}
                                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-800 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Any special instructions or details about the food"
                                    rows="3"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-lg font-semibold transition-all duration-200 disabled:opacity-50"
                            >
                                {loading ? 'Creating Listing...' : 'Share Now'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}