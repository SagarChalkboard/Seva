'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, MarkerF, CircleF, StandaloneSearchBox } from '@react-google-maps/api';
import { Search } from 'lucide-react';

const mapContainerStyle = {
    width: '100%',
    height: '350px',
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
        },
        {
            featureType: "administrative.locality",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }]
        },
        {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }]
        },
        {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{ color: "#263c3f" }]
        },
        {
            featureType: "poi.park",
            elementType: "labels.text.fill",
            stylers: [{ color: "#6b9a76" }]
        },
        {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#38414e" }]
        },
        {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#212a37" }]
        },
        {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9ca5b3" }]
        },
        {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#746855" }]
        },
        {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [{ color: "#1f2835" }]
        },
        {
            featureType: "transit",
            elementType: "geometry",
            stylers: [{ color: "#2f3948" }]
        },
        {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#17263c" }]
        },
        {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{ color: "#515c6d" }]
        },
        {
            featureType: "water",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#17263c" }]
        }
    ],
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false
};

export default function MapComponent({ onLocationSelect, onAddressSelect, radius = 50 }) {
    const [center, setCenter] = useState({ lat: 43.6532, lng: -79.3832 }); // Default to Toronto
    const [marker, setMarker] = useState(null);
    const [searchBox, setSearchBox] = useState(null);
    const [isGeolocating, setIsGeolocating] = useState(false);
    const [geoError, setGeoError] = useState(null);
    
    const searchInputRef = useRef(null);

    // Get user's geolocation on component mount
    useEffect(() => {
        getUserLocation();
    }, []);

    // Function to get user's current location
    const getUserLocation = () => {
        setIsGeolocating(true);
        setGeoError(null);
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setCenter(location);
                    setMarker(location);
                    onLocationSelect(location);
                    getAddressFromCoordinates(location);
                    setIsGeolocating(false);
                },
                (error) => {
                    console.log('Geolocation error:', error);
                    setGeoError('Could not access your location. Please allow location access or select manually.');
                    setIsGeolocating(false);
                },
                { enableHighAccuracy: true }
            );
        } else {
            setGeoError('Geolocation is not supported by your browser');
            setIsGeolocating(false);
        }
    };

    // Handle map click to set marker
    const handleMapClick = useCallback((e) => {
        const clickedLocation = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
        };
        setMarker(clickedLocation);
        onLocationSelect(clickedLocation);
        getAddressFromCoordinates(clickedLocation);
    }, [onLocationSelect]);

    // Get address from coordinates using Geocoding API
    const getAddressFromCoordinates = async (location) => {
        try {
            const { lat, lng } = location;
            // Use Google Maps Geocoding API to get address
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    onAddressSelect(results[0].formatted_address);
                } else {
                    console.error('Geocoder failed:', status);
                }
            });
        } catch (error) {
            console.error('Error getting address:', error);
        }
    };

    // Handle search box loaded
    const onSearchBoxLoad = (box) => {
        setSearchBox(box);
    };

    // Handle place changed in search box
    const onPlacesChanged = () => {
        if (searchBox) {
            const places = searchBox.getPlaces();
            if (places && places.length > 0) {
                const place = places[0];
                if (place.geometry && place.geometry.location) {
                    const location = {
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng()
                    };
                    setCenter(location);
                    setMarker(location);
                    onLocationSelect(location);
                    onAddressSelect(place.formatted_address);
                }
            }
        }
    };

    return (
        <div className="space-y-4">
            {/* Search Box */}
            <div className="relative">
                <StandaloneSearchBox
                    onLoad={onSearchBoxLoad}
                    onPlacesChanged={onPlacesChanged}
                >
                    <div className="relative">
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search for a location..."
                            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <Search className="absolute left-3 top-3 text-gray-400" />
                    </div>
                </StandaloneSearchBox>
                
                <button
                    type="button"
                    onClick={getUserLocation}
                    className={`absolute right-3 top-3 text-sm ${isGeolocating ? 'text-gray-500' : 'text-purple-400 hover:text-purple-300'}`}
                    disabled={isGeolocating}
                >
                    {isGeolocating ? 'Locating...' : 'Use my location'}
                </button>
            </div>
            
            {geoError && (
                <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {geoError}
                </div>
            )}
            
            {/* Map */}
            <div className="rounded-xl overflow-hidden shadow-lg border border-purple-500/20">
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={center}
                    zoom={13}
                    onClick={handleMapClick}
                    options={mapOptions}
                >
                    {marker && (
                        <>
                            <MarkerF
                                position={marker}
                                animation={window.google.maps.Animation.DROP}
                                icon={{
                                    path: window.google.maps.SymbolPath.CIRCLE,
                                    scale: 8,
                                    fillColor: "#8B5CF6",
                                    fillOpacity: 1,
                                    strokeColor: "#ffffff",
                                    strokeWeight: 2,
                                }}
                            />
                            
                            <CircleF
                                center={marker}
                                radius={radius}
                                options={{
                                    fillColor: "#8B5CF6",
                                    fillOpacity: 0.2,
                                    strokeColor: "#8B5CF6",
                                    strokeOpacity: 0.8,
                                    strokeWeight: 2,
                                }}
                            />
                        </>
                    )}
                </GoogleMap>
            </div>
            
            {marker && (
                <p className="text-sm text-purple-400 text-center">
                    Pickup zone set. The recipient will see the general area, not your exact location.
                </p>
            )}
        </div>
    );
}