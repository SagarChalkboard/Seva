'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FindFood() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [error, setError] = useState(null);

  // On page load, get user location + fetch nearby listings
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        // (Optional) Check if user is authenticated
        const authRes = await fetch('/api/auth/check');
        if (!authRes.ok) {
          router.push('/login');
          return;
        }

        // Use browser geolocation
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            // Call our new /api/listings/near endpoint
            const res = await fetch(`/api/listings/near?lat=${lat}&lng=${lng}`);
            if (!res.ok) {
              setError('Failed to fetch nearby listings');
              setLoading(false);
              return;
            }

            const data = await res.json();
            if (data.error) {
              setError(data.error);
            } else {
              setListings(data.listings || []);
            }
            setLoading(false);
          },
          (err) => {
            console.error('Geolocation error:', err);
            setError('Unable to get your location. Please allow location access.');
            setLoading(false);
          }
        );
      } catch (err) {
        console.error(err);
        setError('An unexpected error occurred');
        setLoading(false);
      }
    };

    getUserLocation();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black pt-20">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center text-white">
          <p>Loading listings near you...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-black pt-20">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center text-red-400">
          <p>{error}</p>
        </div>
      </main>
    );
  }

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

        {/* Listings */}
        {listings.length === 0 ? (
          <div className="text-center text-gray-400">
            <p>No nearby listings found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map(listing => (
              <div
                key={listing._id}
                className="bg-gray-900 rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {listing.title}
                    </h3>
                    {/* Distance is in meters by default. Convert to km */}
                    <p className="text-gray-400">
                      {(listing.distance / 1000).toFixed(2)} km away
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                    Available
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <p className="text-gray-300">{listing.description}</p>
                  <p className="text-gray-400">{listing.quantity}</p>
                  <p className="text-gray-400">
                    Pickup until: {new Date(listing.availableUntil).toLocaleString()}
                  </p>
                </div>

                <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg transition-all">
                  Reserve Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
