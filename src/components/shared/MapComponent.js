// src/components/shared/MapComponent.js
'use client';
import { useState, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker, Circle } from '@react-google-maps/api';

const libraries = ['places'];

const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '12px'
};

const darkMapStyles = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#242f3e" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#242f3e" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#746855" }]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#d59563" }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#d59563" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "color": "#263c3f" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#6b9a76" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#38414e" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#212a37" }]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9ca5b3" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#746855" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#1f2835" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#f3d19c" }]
  },
  {
    "featureType": "transit",
    "elementType": "geometry",
    "stylers": [{ "color": "#2f3948" }]
  },
  {
    "featureType": "transit.station",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#d59563" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#17263c" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#515c6d" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#17263c" }]
  }
];

export default function MapComponent({ onLocationSelect, onAddressSelect, radius = 50, initialLocation }) {
    const [position, setPosition] = useState(null);
    const [center, setCenter] = useState({ lat: 43.6532, lng: -79.3832 }); // Toronto default

    // Load Google Maps API
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        libraries
    });

    useEffect(() => {
        // Get user's geolocation when component mounts and Google Maps is loaded
        if (isLoaded && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    console.log('Got user location:', userLocation);
                    
                    setCenter(userLocation);
                    setPosition(userLocation);
                    
                    // Get address for user location
                    const geocoder = new window.google.maps.Geocoder();
                    geocoder.geocode({ location: userLocation }, (results, status) => {
                        if (status === 'OK' && results[0]) {
                            const address = results[0].formatted_address;
                            console.log('Got address:', address);
                            
                            if (onLocationSelect) {
                                onLocationSelect(userLocation);
                            }
                            
                            if (onAddressSelect) {
                                onAddressSelect(address);
                            }
                        }
                    });
                },
                (error) => {
                    console.error('Geolocation error:', error);
                },
                { enableHighAccuracy: true }
            );
        }
    }, [isLoaded, onLocationSelect, onAddressSelect]);

    // Handle map click events
    const handleMapClick = (event) => {
        if (!isLoaded) return;
        
        const clickedLat = event.latLng.lat();
        const clickedLng = event.latLng.lng();
        const clickedLocation = { lat: clickedLat, lng: clickedLng };
        
        setPosition(clickedLocation);
        
        if (isLoaded) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: clickedLocation }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    const address = results[0].formatted_address;
                    
                    if (onLocationSelect) {
                        onLocationSelect(clickedLocation);
                    }
                    
                    if (onAddressSelect) {
                        onAddressSelect(address);
                    }
                }
            });
        }
    };

    if (loadError) return <div className="text-white p-4">Error loading maps</div>;
    if (!isLoaded) return <div className="text-white p-4">Loading maps...</div>;

    return (
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={13}
            center={center}
            onClick={handleMapClick}
            options={{
                styles: darkMapStyles,
                disableDefaultUI: true,
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
            }}
        >
            {position && (
                <>
                    <Marker position={position} />
                    {radius && (
                        <Circle
                            center={position}
                            radius={radius}
                            options={{
                                fillColor: '#8B5CF6',
                                fillOpacity: 0.1,
                                strokeColor: '#8B5CF6',
                                strokeOpacity: 0.3,
                                strokeWeight: 2
                            }}
                        />
                    )}
                </>
            )}
        </GoogleMap>
    );
}
