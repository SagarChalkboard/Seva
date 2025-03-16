'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const ListingCard = ({ listing, foodTypes, dietaryIcons }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const foodType = foodTypes?.find(t => t.id === listing.foodType);

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Photo Section */}
      <div className="relative w-full h-48">
        {listing.photoUrl ? (
          <Image
            src={listing.photoUrl}
            alt={listing.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
            <div className="text-4xl opacity-30">
              {foodType?.icon || '🍽️'}
            </div>
          </div>
        )}
        {/* Food Type Badge */}
        {foodType && (
          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full text-sm text-white flex items-center gap-2">
            <span>{foodType.icon}</span>
            <span>{foodType.name}</span>
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold text-white mb-2">
          {listing.title}
        </h3>
        <p className="text-gray-300 mb-4 line-clamp-2">
          {listing.description}
        </p>
        <div className="space-y-2 text-sm text-gray-400">
          <p>
            <span className="font-medium">Quantity:</span> {listing.quantity}
          </p>
          <p>
            <span className="font-medium">Expiry:</span> {formatDate(listing.expiryDate)}
          </p>
          {listing.foodSafety?.dietaryInfo?.length > 0 && (
            <p className="flex items-center gap-2">
              <span className="font-medium">Dietary:</span>
              <span className="flex gap-1">
                {listing.foodSafety.dietaryInfo.map(diet => (
                  <span key={diet} title={dietaryIcons[diet]?.name}>
                    {dietaryIcons[diet]?.icon}
                  </span>
                ))}
              </span>
            </p>
          )}
        </div>
        <Link 
          href={`/listing/${listing._id}`}
          className="mt-4 inline-block w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded text-center transition duration-200"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ListingCard; 