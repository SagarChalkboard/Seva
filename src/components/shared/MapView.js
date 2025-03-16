'use client';
import React, { useState } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '500px'
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

const MapView = ({ listings, userLocation }) => {
  const [map, setMap] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const center = userLocation || { lat: 43.6532, lng: -79.3832 }; // Toronto default
  
  const handleMarkerClick = (listing) => {
    setSelectedListing(listing);
  };

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      zoom={11}
      center={center}
      onLoad={mapInstance => setMap(mapInstance)}
      options={{
        styles: darkMapStyles,
        disableDefaultUI: true,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
    >
      {/* Show user location marker */}
      {userLocation && (
        <Marker
          position={userLocation}
          icon={{
            url: '/user-location.png',
            scaledSize: new window.google.maps.Size(30, 30)
          }}
        />
      )}

      {/* Show listing markers */}
      {listings?.map(listing => {
        // Make sure coordinates exist and are in the correct format
        if (listing.location?.coordinates?.length === 2) {
          const position = {
            lng: listing.location.coordinates[0],
            lat: listing.location.coordinates[1]
          };
          
          console.log('Adding marker at:', position);
          
          return (
            <Marker
              key={listing._id}
              position={position}
              title={listing.title}
              onClick={() => handleMarkerClick(listing)}
            />
          );
        }
        return null;
      })}

      {selectedListing && (
        <InfoWindow
          position={{
            lng: selectedListing.location.coordinates[0],
            lat: selectedListing.location.coordinates[1]
          }}
          onCloseClick={() => setSelectedListing(null)}
        >
          <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg max-w-xs">
            <h3 className="font-semibold text-lg mb-2">{selectedListing.title}</h3>
            <p className="text-sm mb-2">{selectedListing.description}</p>
            <div className="text-xs text-gray-300">
              <p>Quantity: {selectedListing.quantity}</p>
              <p>Expiry: {new Date(selectedListing.expiryDate).toLocaleDateString()}</p>
              {selectedListing.dietaryInfo && (
                <p>Dietary Info: {selectedListing.dietaryInfo}</p>
              )}
            </div>
            <button 
              className="mt-2 w-full bg-purple-600 hover:bg-purple-700 text-white py-1 px-2 rounded text-sm"
              onClick={() => {
                // Add your navigation or action logic here
                window.location.href = `/listing/${selectedListing._id}`;
              }}
            >
              View Details
            </button>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default MapView; 