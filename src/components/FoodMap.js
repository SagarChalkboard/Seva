'use client';
import { useState } from 'react';
import { GoogleMap, useLoadScript, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';

const libraries = ['places'];

const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '1rem'
};

const mapOptions = {
    styles: [
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
    ],
    disableDefaultUI: false,
    zoomControl: true,
};

export default function FoodMap({ listings = [] }) {
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [center, setCenter] = useState({ lat: 43.6532, lng: -79.3832 });

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        libraries
    });

    if (loadError) return <div className="text-white">Error loading maps</div>;
    if (!isLoaded) return <div className="text-white">Loading maps...</div>;

    return (
        <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Active Food Listings</h2>
                <div className="flex items-center text-gray-400">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="text-sm">{listings.length} Active Listings</span>
                </div>
            </div>

            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={11}
                center={center}
                options={mapOptions}
            >
                {listings.map((listing) => {
                    if (!listing.location?.coordinates) return null;

                    return (
                        <MarkerF
                            key={listing._id}
                            position={{
                                lat: listing.location.coordinates[1],
                                lng: listing.location.coordinates[0]
                            }}
                            onClick={() => setSelectedMarker(listing)}
                        />
                    );
                })}

                {selectedMarker && (
                    <InfoWindowF
                        position={{
                            lat: selectedMarker.location.coordinates[1],
                            lng: selectedMarker.location.coordinates[0]
                        }}
                        onCloseClick={() => setSelectedMarker(null)}
                    >
                        <div className="p-2 min-w-[200px]">
                            <h3 className="font-bold text-gray-900">{selectedMarker.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{selectedMarker.description}</p>
                            <p className="text-sm text-gray-600">Quantity: {selectedMarker.quantity}</p>
                            <p className="text-xs text-gray-500 mt-2">
                                Available until: {new Date(selectedMarker.availableUntil).toLocaleString()}
                            </p>
                        </div>
                    </InfoWindowF>
                )}
            </GoogleMap>
        </div>
    );
}