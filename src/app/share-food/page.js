// src/app/share-food/page.js
'use client';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLoadScript, GoogleMap, MarkerF } from '@react-google-maps/api';
import { useSocket } from '@/context/SocketContext';
import { Package, Clock, MapPin, AlertCircle } from 'lucide-react';

const libraries = ['places'];
const mapContainerStyle = {
    width: '100%',
    height: '300px',
    borderRadius: '12px'
};

// Dark theme for the map
const mapStyles = [
  {
    elementType: "geometry",
    stylers: [{ color: "#242f3e" }]
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#242f3e" }]
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#746855" }]
  }
];

export default function ShareFood() {
    const router = useRouter();
    const { socket, isConnected, createListing } = useSocket();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [marker, setMarker] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        quantity: '',
        location: '',
        coordinates: null,
        availableUntil: '',
        notes: ''
    });

    // Load Google Maps
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        libraries
    });

    // Set default center to Toronto (or user's location)
    const [center, setCenter] = useState({ lat: 43.6532, lng: -79.3832 });

    // Get user's location on component mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setCenter(userLocation);
                    setMarker(userLocation);
                    
                    // Only try to get address if Google Maps is loaded
                    if (isLoaded && window.google) {
                        // Get address from coordinates
                        const geocoder = new window.google.maps.Geocoder();
                        geocoder.geocode({ location: userLocation }, (results, status) => {
                            if (status === 'OK') {
                                setFormData(prev => ({
                                    ...prev,
                                    location: results[0].formatted_address,
                                    coordinates: userLocation
                                }));
                            }
                        });
                    }
                },
                () => {
                    console.log("Unable to get location");
                    setError("Unable to get your location. Please select it manually on the map.");
                }
            );
        }
    }, [isLoaded]);

    const handleMapClick = useCallback((e) => {
        const clickedLoc = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
        };
        setMarker(clickedLoc);
        
        // Convert coordinates to address
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: clickedLoc }, (results, status) => {
            if (status === 'OK') {
                setFormData(prev => ({
                    ...prev,
                    location: results[0].formatted_address,
                    coordinates: clickedLoc
                }));
            }
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            // Validate form data
            if (!formData.title || !formData.description || !formData.quantity || 
                !formData.location || !formData.coordinates || !formData.availableUntil) {
                throw new Error('Please fill in all required fields');
            }
            
            const listingData = {
                title: formData.title,
                description: formData.description,
                quantity: formData.quantity,
                location: {
                    type: 'Point',
                    coordinates: [formData.coordinates.lng, formData.coordinates.lat],
                    address: formData.location
                },
                availableUntil: new Date(formData.availableUntil),
                notes: formData.notes || '',
                status: 'available'
            };
            
            if (isConnected && socket) {
                // Use real-time socket to create listing
                createListing(listingData);
                
                // Listen for confirmation (one-time event listener)
                const handleListingCreated = (data) => {
                    setSuccess(true);
                    setLoading(false);
                    
                    // Show success message for 2 seconds then redirect
                    setTimeout(() => {
                        router.push('/dashboard');
                    }, 2000);
                };
                
                const handleError = (error) => {
                    setError(error.message || 'Failed to create listing');
                    setLoading(false);
                };
                
                socket.once('listing-created', handleListingCreated);
                socket.once('error', handleError);
                
                // Clean up event listeners after 5 seconds (in case of no response)
                setTimeout(() => {
                    socket.off('listing-created', handleListingCreated);
                    socket.off('error', handleError);
                }, 5000);
            } else {
                // Fallback to regular API if socket is not connected
                const res = await fetch('/api/listings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(listingData)
                });
                
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Failed to create listing');
                }
                
                setSuccess(true);
                
                // Show success message for 2 seconds then redirect
                setTimeout(() => {
                    router.push('/dashboard');
                }, 2000);
            }
        } catch (error) {
            console.error('Error creating listing:', error);
            setError(error.message || 'An unexpected error occurred');
        } finally {
            if (!socket || !isConnected) {
                setLoading(false);
            }
        }
    };

    if (loadError) return (
        <main className="min-h-screen bg-black pt-20">
            <div className="max-w-7xl mx-auto px-4 py-12 text-center">
                <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-6 max-w-md mx-auto">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl text-white font-semibold mb-2">Error Loading Maps</h2>
                    <p className="text-gray-300">Unable to load Google Maps. Please check your internet connection and try again.</p>
                </div>
            </div>
        </main>
    );
    
    if (!isLoaded) return (
        <main className="min-h-screen bg-black pt-20">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="animate-pulse max-w-2xl mx-auto">
                    <div className="h-8 bg-gray-800 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-800 rounded w-1/2 mb-12"></div>
                    <div className="h-64 bg-gray-800 rounded-xl mb-6"></div>
                    <div className="space-y-4">
                        <div className="h-4 bg-gray-800 rounded w-1/4"></div>
                        <div className="h-10 bg-gray-800 rounded"></div>
                        <div className="h-4 bg-gray-800 rounded w-1/4"></div>
                        <div className="h-10 bg-gray-800 rounded"></div>
                        <div className="h-10 bg-gray-800 rounded"></div>
                    </div>
                </div>
            </div>
        </main>
    );
    
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
                    
                    {/* Connection status indicator */}
                    <div className="flex items-center justify-center mt-4">
                        <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                        <span className="text-sm text-gray-400">
                            {isConnected 
                                ? 'Real-time updates enabled' 
                                : 'Limited connectivity - Your listing will still be created'
                            }
                        </span>
                    </div>
                </div>

                <div className="max-w-2xl mx-auto">
                    {success ? (
                        <div className="bg-green-900/30 border border-green-500/30 rounded-2xl p-8 text-center">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Package className="w-8 h-8 text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Food Listed Successfully!</h2>
                            <p className="text-gray-300 mb-6">Your generous donation has been listed. You're helping to make a difference!</p>
                            <p className="text-gray-400 text-sm">Redirecting to dashboard...</p>
                        </div>
                    ) : (
                        <div className="bg-gray-900 rounded-2xl p-8 border border-purple-500/20">
                            {error && (
                                <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 mb-6">
                                    <p className="text-red-400 flex items-center">
                                        <AlertCircle className="w-5 h-5 mr-2" />
                                        {error}
                                    </p>
                                </div>
                            )}
                            
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

                                {/* Location Map */}
                                <div>
                                    <label className="block text-gray-300 mb-2 text-sm flex items-center">
                                        <MapPin className="w-4 h-4 mr-2 text-purple-400" />
                                        Pickup Location (Click on map to set location)
                                    </label>
                                    <GoogleMap
                                        mapContainerStyle={mapContainerStyle}
                                        zoom={13}
                                        center={center}
                                        onClick={handleMapClick}
                                        options={{
                                            styles: mapStyles,
                                            disableDefaultUI: false,
                                            zoomControl: true,
                                        }}
                                    >
                                        {marker && (
                                            <MarkerF
                                                position={marker}
                                                animation={window.google.maps.Animation.DROP}
                                            />
                                        )}
                                    </GoogleMap>
                                    <input 
                                        type="text"
                                        required
                                        value={formData.location}
                                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                                        className="w-full mt-2 px-4 py-3 bg-gray-800 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Enter pickup address"
                                    />
                                </div>

                                {/* Available Until */}
                                <div>
                                    <label className="block text-gray-300 mb-2 text-sm flex items-center">
                                        <Clock className="w-4 h-4 mr-2 text-purple-400" />
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
                                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-lg font-semibold transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating Listing...
                                        </>
                                    ) : 'Share Now'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
                
                {/* Food Safety Tips */}
                <div className="max-w-2xl mx-auto mt-12 bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/10">
                    <h3 className="text-lg font-medium text-white mb-4">Food Sharing Safety Tips</h3>
                    <ul className="space-y-2 text-gray-300">
                        <li className="flex items-start">
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-purple-500/20 text-purple-400 mr-3 mt-0.5">1</span>
                            <span>Ensure food has been properly stored and handled</span>
                        </li>
                        <li className="flex items-start">
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-purple-500/20 text-purple-400 mr-3 mt-0.5">2</span>
                            <span>Include information about ingredients and potential allergens</span>
                        </li>
                        <li className="flex items-start">
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-purple-500/20 text-purple-400 mr-3 mt-0.5">3</span>
                            <span>Package food securely to maintain freshness</span>
                        </li>
                        <li className="flex items-start">
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-purple-500/20 text-purple-400 mr-3 mt-0.5">4</span>
                            <span>Choose a safe, accessible pickup location</span>
                        </li>
                    </ul>
                </div>
            </div>
        </main>
    );
}