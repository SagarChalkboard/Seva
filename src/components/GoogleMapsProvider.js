'use client';
import { useLoadScript } from '@react-google-maps/api';

const libraries = ['places'];

export default function GoogleMapsProvider({ children }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  if (loadError) {
    return <div className="text-red-500">Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div className="text-gray-500">Loading maps...</div>;
  }

  return children;
} 