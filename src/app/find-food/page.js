'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLoadScript } from '@react-google-maps/api';
import { 
  Search, MapPin, Filter, Clock, AlertCircle, ChevronDown, 
  UserCheck, MousePointer, Loader, Zap, XCircle, Coffee
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MapComponent from '@/components/shared/MapComponent';
import ListingCard from '@/components/ListingCard';

// Food type icons with enhanced metadata
const FOOD_TYPES = [
  { id: 'prepared_meal', name: 'Prepared Meal', icon: '🍱', color: '#E17C7C', description: 'Home-cooked or ready-to-eat complete meals' },
  { id: 'groceries', name: 'Groceries', icon: '🛒', color: '#7C90E1', description: 'Unopened packaged foods and ingredients' },
  { id: 'produce', name: 'Fresh Produce', icon: '🥗', color: '#7CE17C', description: 'Fruits, vegetables, and other fresh items' },
  { id: 'bakery', name: 'Bakery', icon: '🍞', color: '#E1C77C', description: 'Bread, pastries, and baked goods' },
  { id: 'canned', name: 'Canned/Dry Goods', icon: '🥫', color: '#C77CE1', description: 'Shelf-stable products with long expiry' },
  { id: 'leftovers', name: 'Restaurant Leftovers', icon: '🍽️', color: '#7CE1D8', description: 'Surplus food from restaurants or events' },
];

// Dietary icons with enhanced metadata
const DIETARY_ICONS = {
  'vegetarian': { icon: '🥦', name: 'Vegetarian', color: '#7CE17C' },
  'vegan': { icon: '🌱', name: 'Vegan', color: '#7CE17C' },
  'halal': { icon: '☪️', name: 'Halal', color: '#7C7CE1' },
  'kosher': { icon: '✡️', name: 'Kosher', color: '#E17C7C' },
  'gluten_free': { icon: '🌾', name: 'Gluten-Free', color: '#E1C77C' },
};

// Storage type icons with enhanced metadata
const STORAGE_ICONS = {
  'refrigerated': { icon: '❄️', name: 'Refrigerated', color: '#7C90E1' },
  'frozen': { icon: '🧊', name: 'Frozen', color: '#7CE1D8' },
  'room_temperature': { icon: '🏠', name: 'Room Temp', color: '#E1C77C' },
};

// Search radius options
const RADIUS_OPTIONS = [
  { value: 1000, label: '1 km' },
  { value: 2000, label: '2 km' },
  { value: 3000, label: '3 km' },
  { value: 5000, label: '5 km' },
  { value: 10000, label: '10 km' },
];

export default function FindFood() {
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [searchRadius, setSearchRadius] = useState(5000);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFoodType, setSelectedFoodType] = useState(null);
  const [selectedDiet, setSelectedDiet] = useState(null);
  const [sortBy, setSortBy] = useState('distance');
  const [mapExpanded, setMapExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Load Google Maps
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });

  // Progress bar animation during loading
  useEffect(() => {
    if (loading && loadingProgress < 90) {
      const timer = setTimeout(() => {
        setLoadingProgress(prev => prev + 10);
      }, 300);
      return () => clearTimeout(timer);
    }
    if (!loading) {
      setLoadingProgress(100);
      const timer = setTimeout(() => {
        setLoadingProgress(0);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, loadingProgress]);

  // Fetch nearby listings with progress tracking
  const fetchNearbyListings = useCallback(async (lat, lng, radius) => {
    if (!lat || !lng) return;
    
    try {
      setLoading(true);
      setLoadingProgress(10);
      setError(null);
      
      const queryString = `lat=${lat}&lng=${lng}&radius=${radius}`;
      setLoadingProgress(30);
      
      const response = await fetch(`/api/listings/near?${queryString}`);
      setLoadingProgress(70);
      
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }
      
      const data = await response.json();
      setLoadingProgress(90);
      
      // Add slight delay to show completion animation
      setTimeout(() => {
        setListings(data.listings || []);
        setFilteredListings(data.listings || []);
        setInitialLoading(false);
        setLoading(false);
      }, 300);
      
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError('Failed to load listings. Please try again.');
      setListings([]);
      setFilteredListings([]);
      setLoading(false);
    }
  }, []);

  // Handle location selection
  const handleLocationSelect = useCallback((location) => {
    if (!location) return;
    setSelectedLocation(location);
    fetchNearbyListings(location.lat, location.lng, searchRadius);
  }, [searchRadius, fetchNearbyListings]);

  // Handle address selection
  const handleAddressSelect = useCallback((address) => {
    setSelectedAddress(address);
  }, []);

  // Get user location on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setInitialLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        handleLocationSelect(location);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError('Unable to get your location. Please enable location services and try again.');
        setInitialLoading(false);
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, [handleLocationSelect]);

  // Handle search query typing
  const handleSearchQueryChange = (e) => {
    setIsTyping(true);
    setSearchQuery(e.target.value);
    clearTimeout(window.searchTimeout);
    
    window.searchTimeout = setTimeout(() => {
      setIsTyping(false);
    }, 500);
  };

  // Apply filters when any filter changes
  useEffect(() => {
    if (listings.length === 0) return;
    
    let filtered = [...listings];
    
    // Apply food type filter
    if (selectedFoodType) {
      filtered = filtered.filter(listing => 
        listing.foodType === selectedFoodType
      );
    }
    
    // Apply dietary filter
    if (selectedDiet) {
      filtered = filtered.filter(listing => 
        listing.foodSafety?.dietaryInfo?.includes(selectedDiet)
      );
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(listing => 
        listing.title.toLowerCase().includes(query) || 
        listing.description.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    if (sortBy === 'distance') {
      filtered.sort((a, b) => a.distance - b.distance);
    } else if (sortBy === 'freshness') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    setFilteredListings(filtered);
  }, [listings, selectedFoodType, selectedDiet, searchQuery, sortBy]);

  // Handle radius change
  const handleRadiusChange = (radius) => {
    setSearchRadius(radius);
    if (selectedLocation) {
      fetchNearbyListings(selectedLocation.lat, selectedLocation.lng, radius);
    }
  };

  // Handle filter reset
  const handleResetFilters = () => {
    setSelectedFoodType(null);
    setSelectedDiet(null);
    setSearchRadius(5000);
    setSearchQuery('');
    setSortBy('distance');
    setFilteredListings(listings);
    
    if (selectedLocation) {
      fetchNearbyListings(selectedLocation.lat, selectedLocation.lng, 5000);
    }
  };
  
  // Toggle map expansion
  const toggleMapExpanded = () => {
    setMapExpanded(!mapExpanded);
  };

  // Statistics calculations
  const stats = useMemo(() => {
    if (listings.length === 0) return null;
    
    return {
      total: listings.length,
      filtered: filteredListings.length,
      closest: listings.length > 0 ? 
        Math.round(Math.min(...listings.map(l => l.distance)) / 100) / 10 : 
        null,
      types: [...new Set(listings.map(l => l.foodType || 'other'))]
    };
  }, [listings, filteredListings]);

  // Loading states
  if (!isLoaded) {
    return (
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-black pt-20"
      >
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="text-gray-400 text-lg">Loading map resources...</p>
          </div>
        </div>
      </motion.main>
    );
  }

  if (loadError) {
    return (
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-black pt-20"
      >
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 max-w-xl mx-auto">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Map Loading Error</h2>
            <p className="text-gray-400">
              We couldn&apos;t load the Google Maps API. Please check your internet connection or try again later.
            </p>
          </div>
        </div>
      </motion.main>
    );
  }

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-black pt-20"
    >
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400 mb-4">
            Find Food Near You
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Connect with generous donors in your community
          </p>
        </motion.div>

        {/* Map Section */}
        <motion.div 
          layout
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`relative mb-8 rounded-2xl overflow-hidden ${mapExpanded ? 'h-[600px]' : 'h-[300px]'}`}
        >
          <MapComponent
            onLocationSelect={handleLocationSelect}
            onAddressSelect={handleAddressSelect}
            radius={searchRadius}
            key={`map-${selectedLocation?.lat}-${selectedLocation?.lng}-${searchRadius}`}
            listings={listings}
            expanded={mapExpanded}
          />
          
          {/* Map controls */}
          <div className="absolute top-3 right-3 z-10 flex flex-col space-y-2">
            <button 
              onClick={toggleMapExpanded}
              className="p-2 bg-black/70 backdrop-blur-md hover:bg-black/90 text-white rounded-lg transition-all"
              aria-label={mapExpanded ? "Collapse map" : "Expand map"}
            >
              {mapExpanded ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5 transform rotate-180" />
              )}
            </button>
          </div>
          
          {/* Loading overlay */}
          <AnimatePresence>
            {(loading || initialLoading) && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl"
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <svg className="w-12 h-12 animate-spin text-gray-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-purple-500" />
                    </div>
                  </div>
                  <div className="text-white text-lg">Finding food near you...</div>
                  <div className="w-48 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                      style={{ width: `${loadingProgress}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Search and Filters Bar */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-900/70 backdrop-blur-md rounded-2xl p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Location Display */}
            <div className="flex items-center text-white p-2 bg-gray-800/50 rounded-lg flex-grow">
              <MapPin className="text-purple-400 mr-2 flex-shrink-0" />
              <span className="truncate">
                {selectedAddress || 'Select a location on the map'}
              </span>
            </div>
            
            {/* Search Input */}
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search listings..."
                value={searchQuery}
                onChange={handleSearchQueryChange}
                className="w-full p-2 pl-10 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {isTyping ? (
                  <div className="animate-pulse">
                    <Loader className="h-4 w-4 text-gray-400" />
                  </div>
                ) : (
                  <Search className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>
            
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all"
            >
              <Filter size={16} className="mr-2" />
              Filters
              <motion.div
                animate={{ rotate: showFilters ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown size={16} className="ml-2" />
              </motion.div>
            </button>
          </div>

          {/* Advanced Filters Section */}
          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-6 space-y-6">
                  {/* Food Type Filter */}
                  <div>
                    <label className="block text-gray-300 mb-3 text-sm font-medium">
                      Food Type
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                      {FOOD_TYPES.map(({ id, name, icon, color }) => (
                        <button
                          key={id}
                          onClick={() => setSelectedFoodType(selectedFoodType === id ? null : id)}
                          className={`relative p-3 rounded-xl transition-all ${
                            selectedFoodType === id 
                              ? 'bg-gray-800 ring-2 ring-purple-500' 
                              : 'bg-gray-800/50 hover:bg-gray-800'
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            <span className="text-2xl mb-2">{icon}</span>
                            <span className="text-sm text-gray-300">{name}</span>
                          </div>
                          {selectedFoodType === id && (
                            <div className="absolute -top-1 -right-1 bg-purple-500 rounded-full p-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dietary Restrictions */}
                  <div>
                    <label className="block text-gray-300 mb-3 text-sm font-medium">
                      Dietary Restrictions
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(DIETARY_ICONS).map(([id, { icon, name }]) => (
                        <button
                          key={id}
                          onClick={() => setSelectedDiet(selectedDiet === id ? null : id)}
                          className={`px-3 py-2 rounded-lg flex items-center transition-all ${
                            selectedDiet === id 
                              ? 'bg-gray-800 ring-2 ring-purple-500' 
                              : 'bg-gray-800/50 hover:bg-gray-800'
                          }`}
                        >
                          <span className="mr-2">{icon}</span>
                          <span className="text-sm text-gray-300">{name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Search Radius */}
                  <div>
                    <label className="block text-gray-300 mb-3 text-sm font-medium">
                      Search Radius
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {RADIUS_OPTIONS.map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => handleRadiusChange(value)}
                          className={`px-4 py-2 rounded-lg transition-all ${
                            searchRadius === value 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort Options */}
                  <div>
                    <label className="block text-gray-300 mb-3 text-sm font-medium">
                      Sort By
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSortBy('distance')}
                        className={`px-4 py-2 rounded-lg flex items-center transition-all ${
                          sortBy === 'distance' 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
                        }`}
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>Nearest</span>
                      </button>
                      <button
                        onClick={() => setSortBy('freshness')}
                        className={`px-4 py-2 rounded-lg flex items-center transition-all ${
                          sortBy === 'freshness' 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
                        }`}
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        <span>Newest</span>
                      </button>
                    </div>
                  </div>

                  {/* Reset Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleResetFilters}
                      className="flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Reset Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Stats Bar */}
        {stats && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gray-900/50 rounded-2xl p-4 mb-8 flex flex-wrap gap-3 justify-between items-center"
          >
            <div className="flex items-center">
              <div className="w-1 h-8 bg-purple-500 rounded-full mr-3"></div>
              <div>
                <div className="text-gray-400 text-xs">Available Listings</div>
                <div className="text-white font-medium">{stats.total} items</div>
              </div>
            </div>
            
            {stats.filtered !== stats.total && (
              <div className="flex items-center">
                <div className="w-1 h-8 bg-indigo-500 rounded-full mr-3"></div>
                <div>
                  <div className="text-gray-400 text-xs">Filtered Results</div>
                  <div className="text-white font-medium">{stats.filtered} items</div>
                </div>
              </div>
            )}
            
            {stats.closest !== null && (
              <div className="flex items-center">
                <div className="w-1 h-8 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <div className="text-gray-400 text-xs">Closest Item</div>
                  <div className="text-white font-medium">{stats.closest} km away</div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Listings Grid */}
        <div className="space-y-6">
          <AnimatePresence>
            {filteredListings.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredListings.map((listing, index) => (
                  <motion.div
                    key={listing._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * (index % 6) }}
                  >
                    <ListingCard 
                      listing={listing} 
                      foodTypes={FOOD_TYPES}
                      dietaryIcons={DIETARY_ICONS}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : !loading && !initialLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-16 bg-gray-900/30 backdrop-blur-sm rounded-2xl border border-gray-800"
              >
                <Coffee className="mx-auto h-16 w-16 text-gray-700 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Listings Found</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  {selectedFoodType || selectedDiet || searchQuery ? 
                    "Try adjusting your filters or search terms to see more results." :
                    "There are no food listings in this area right now. Try expanding your search radius or check back later."}
                </p>
                
                {(selectedFoodType || selectedDiet || searchQuery) && (
                  <button
                    onClick={handleResetFilters}
                    className="mt-6 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg inline-flex items-center transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset Filters
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start"
            >
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-red-400 font-medium">Error</h3>
                <p className="text-gray-400">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 mb-8 bg-gray-900/30 rounded-2xl p-6 border border-gray-800/50"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Zap className="w-5 h-5 text-yellow-500 mr-2" />
            Tips for Finding Food
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6 text-gray-400">
            <div className="flex">
              <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h4 className="text-white text-sm font-medium mb-1">Check Often</h4>
                <p className="text-sm">New food listings appear throughout the day. Check back regularly for fresh options.</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <MousePointer className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-white text-sm font-medium mb-1">Act Quickly</h4>
                <p className="text-sm">Food items are often claimed quickly. If you see something you need, don&apos;t hesitate.</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <UserCheck className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h4 className="text-white text-sm font-medium mb-1">Verify Providers</h4>
                <p className="text-sm">Check donor profiles and ratings before arranging a pickup for added safety.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.main>
  );
}