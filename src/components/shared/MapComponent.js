// src/components/shared/MapComponent.js
'use client';
import { useState, useEffect } from 'react';
import { GoogleMap, useLoadScript, MarkerF } from '@react-google-maps/api';

const libraries = ['places'];

const mapContainerStyle = {
    width: '100%',
    height: '300px',
    borderRadius: '12px'
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

export default function MapComponent({ onLocationSelect }) {
    const [marker, setMarker] = useState(null);
    const [center, setCenter] = useState({ lat: 43.6532, lng: -79.3832 }); // Default to Toronto

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        libraries
    });

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
                    onLocationSelect(userLocation);
                },
                () => console.log("Location permission denied")
            );
        }
    }, [onLocationSelect]);

    const handleMapClick = (e) => {
        const clickedLoc = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
        };
        setMarker(clickedLoc);
        onLocationSelect(clickedLoc);
    };

    if (loadError) return <div className="text-white">Failed to load map</div>;
    if (!isLoaded) return <div className="text-white">Loading map...</div>;

    return (
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={13}
            center={center}
            onClick={handleMapClick}
            options={mapOptions}
        >
            {marker && (
                <MarkerF
                    position={marker}
                    animation={google.maps.Animation.DROP}
                />
            )}
        </GoogleMap>
    );
}
