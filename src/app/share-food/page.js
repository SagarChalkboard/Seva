// src/app/share-food/page.js
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MapComponent from '@/components/shared/MapComponent';

export default function ShareFood() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        quantity: '',
        location: '',
        coordinates: null,  // Added for map
        availableUntil: '',
        notes: ''
    });

    const handleLocationSelect = async (location) => {
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.lat},${location.lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
            );
            const data = await response.json();
            if (data.results[0]) {
                setFormData(prev => ({
                    ...prev,
                    location: data.results[0].formatted_address,
                    coordinates: location
                }));
            }
        } catch (error) {
            console.error('Error getting address:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // Modify the data to match our FoodListing model
            const submissionData = {
                ...formData,
                location: {
                    type: 'Point',
                    coordinates: [formData.coordinates.lng, formData.coordinates.lat],
                    address: formData.location
                }
            };

            const res = await fetch('/api/listings/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData)
            });

            if (!res.ok) throw new Error('Failed to create listing');

            router.push('/dashboard');
        } catch (error) {
            console.error('Error creating listing:', error);
        } finally {
            setLoading(false);
        }
    };

    // Your existing JSX, but add the MapComponent before the location input:
    return (
        <main className="min-h-screen bg-black pt-20">
            {/* Your existing header */}
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
                            {/* Title field */}
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

                            {/* Description field */}
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

                            {/* Quantity field */}
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

                            {/* Location with Map */}
                            <div>
                                <label className="block text-gray-300 mb-2 text-sm">
                                    Pickup Location (Click on map to set location)
                                </label>
                                <div className="mb-4">
                                    <MapComponent onLocationSelect={handleLocationSelect} />
                                </div>
                                <input 
                                    type="text"
                                    required
                                    value={formData.location}
                                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-800 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Enter pickup address"
                                />
                            </div>

                            {/* Available Until field */}
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

                            {/* Notes field */}
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