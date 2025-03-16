'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLoadScript } from '@react-google-maps/api';
import { PlusCircle, Camera, MapPin, Calendar, AlertCircle, ChevronRight, ChevronLeft, Clock, Info, CheckCircle, X } from 'lucide-react';
import MapComponent from '@/components/shared/MapComponent';

// Array of food types with icons and descriptions
const FOOD_TYPES = [
  { id: 'prepared_meal', name: 'Prepared Meal', icon: '🍱', description: 'Home-cooked or ready-to-eat complete meals' },
  { id: 'groceries', name: 'Groceries', icon: '🛒', description: 'Unopened packaged foods and ingredients' },
  { id: 'produce', name: 'Fresh Produce', icon: '🥗', description: 'Fruits, vegetables, and other fresh items' },
  { id: 'bakery', name: 'Bakery', icon: '🍞', description: 'Bread, pastries, and baked goods' },
  { id: 'canned', name: 'Canned/Dry Goods', icon: '🥫', description: 'Shelf-stable products with long expiry' },
  { id: 'leftovers', name: 'Restaurant Leftovers', icon: '🍽️', description: 'Surplus food from restaurants or events' },
];

// Common allergens for tracking
const ALLERGENS = [
  { id: 'dairy', name: 'Dairy', icon: '🥛' },
  { id: 'nuts', name: 'Nuts', icon: '🥜' },
  { id: 'gluten', name: 'Gluten', icon: '🌾' },
  { id: 'soy', name: 'Soy', icon: '🫘' },
  { id: 'shellfish', name: 'Shellfish', icon: '🦐' },
  { id: 'eggs', name: 'Eggs', icon: '🥚' },
  { id: 'fish', name: 'Fish', icon: '🐟' },
  { id: 'none', name: 'No Allergens', icon: '✓' },
];

// Dietary types
const DIETARY_TYPES = [
  { id: 'vegetarian', name: 'Vegetarian', icon: '🥦' },
  { id: 'vegan', name: 'Vegan', icon: '🌱' },
  { id: 'halal', name: 'Halal', icon: '☪️' },
  { id: 'kosher', name: 'Kosher', icon: '✡️' },
  { id: 'gluten_free', name: 'Gluten-Free', icon: '🌾' },
];

// Storage types
const STORAGE_TYPES = [
  { id: 'refrigerated', name: 'Refrigerated', icon: '❄️', description: 'Kept in refrigerator (0-4°C)' },
  { id: 'frozen', name: 'Frozen', icon: '🧊', description: 'Kept frozen (below -18°C)' },
  { id: 'room_temperature', name: 'Room Temperature', icon: '🏠', description: 'Safely stored at ambient temperature' },
];

export default function ShareFood() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [previewPhoto, setPreviewPhoto] = useState(null);
    const [showSafetyInfo, setShowSafetyInfo] = useState(false);
    
    // Form data with all fields
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        quantity: '',
        foodType: '',
        photoUrl: '',
        location: {
            type: 'Point',
            coordinates: null,
            address: ''
        },
        radius: 50, // Privacy radius in meters
        availableUntil: '',
        notes: '',
        pickupInstructions: '',
        
        // Food safety
        storageType: 'room_temperature',
        preparedOn: '',
        bestByDate: '',
        allergens: [],
        dietaryInfo: [],
        safetyChecklist: {
            properlyStored: false,
            handlingProcedures: false,
            noSpoilage: false,
        }
    });

    const [errors, setErrors] = useState({});

    // Load Google Maps
    const { isLoaded: isMapLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        libraries: ['places']
    });

    useEffect(() => {
        console.log('Starting geolocation process...');
        
        if (!navigator.geolocation) {
            console.error('Geolocation is not supported by this browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log('Geolocation success:', {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });

                const { latitude, longitude } = position.coords;
                setFormData(prev => {
                    console.log('Updating form data with location:', {
                        old: prev.location,
                        new: [longitude, latitude]
                    });
                    return {
                        ...prev,
                        location: {
                            ...prev.location,
                            coordinates: [longitude, latitude]
                        }
                    };
                });
            },
            (error) => {
                console.error('Geolocation error:', error.message);
            },
            { 
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }, []); // Empty dependency array for running once on mount

    // Handle location selection from map
    const handleLocationSelect = (location) => {
        console.log('Location selected:', location);
        setFormData(prev => ({
            ...prev,
            location: {
                ...prev.location,
                coordinates: [location.lng, location.lat],
                address: location.address
            }
        }));
    };

    // Handle address selection from map search
    const handleAddressSelect = useCallback((address) => {
        console.log('Selected address:', address);
        setFormData(prev => ({
            ...prev,
            location: {
                ...prev.location,
                address: address
            }
        }));
    }, []);

    // Handle form field changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (type === 'checkbox' && name.startsWith('safetyChecklist.')) {
            const checklistItem = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                safetyChecklist: {
                    ...prev.safetyChecklist,
                    [checklistItem]: checked
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
        
        // Clear error for this field if it exists
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = {...prev};
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // Handle photo upload
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewPhoto(reader.result);
                setFormData(prev => ({
                    ...prev,
                    photoUrl: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Toggle allergen selection
    const toggleAllergen = (allergenId) => {
        setFormData(prev => {
            const currentAllergens = [...prev.allergens];
            if (allergenId === 'none') {
                // If 'none' is selected, clear all other allergens
                return {...prev, allergens: ['none']};
            } else {
                // Remove 'none' if it exists and toggle the current allergen
                const withoutNone = currentAllergens.filter(id => id !== 'none');
                const index = withoutNone.indexOf(allergenId);
                
                if (index === -1) {
                    withoutNone.push(allergenId);
                } else {
                    withoutNone.splice(index, 1);
                }
                
                return {...prev, allergens: withoutNone};
            }
        });
    };

    // Toggle dietary info selection
    const toggleDietaryInfo = (dietId) => {
        setFormData(prev => {
            const currentDiet = [...prev.dietaryInfo];
            const index = currentDiet.indexOf(dietId);
            
            if (index === -1) {
                currentDiet.push(dietId);
            } else {
                currentDiet.splice(index, 1);
            }
            
            return {...prev, dietaryInfo: currentDiet};
        });
    };

    // Update privacy radius
    const handleRadiusChange = (e) => {
        const radius = parseInt(e.target.value);
        setFormData(prev => ({
            ...prev,
            radius: radius
        }));
    };

    // Validate form data before submission
    const validateForm = () => {
        const newErrors = {};
        
        // Step 1 validation
        if (currentStep === 1) {
            if (!formData.title.trim()) newErrors.title = "Title is required";
            if (!formData.description.trim()) newErrors.description = "Description is required";
            if (!formData.quantity.trim()) newErrors.quantity = "Quantity is required";
            if (!formData.foodType) newErrors.foodType = "Please select a food type";
        }
        
        // Step 2 validation
        else if (currentStep === 2) {
            if (!formData.location.address) newErrors.location = "Location is required";
            if (!formData.location.coordinates) newErrors.location = "Please mark a location on the map";
            if (!formData.availableUntil) newErrors.availableUntil = "Available until time is required";
        }
        
        // Step 3 validation (safety)
        else if (currentStep === 3) {
            if (!formData.safetyChecklist.properlyStored) {
                newErrors.safetyChecklist = "Please confirm food safety";
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle next step
    const handleNextStep = () => {
        if (validateForm()) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo(0, 0);
        }
    };

    // Handle previous step
    const handlePrevStep = () => {
        setCurrentStep(prev => prev - 1);
        window.scrollTo(0, 0);
    };

    // Submit the form
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        
        try {
            // Format the data to match our API expectations
            const submissionData = {
                ...formData,
                location: {
                    type: 'Point',
                    coordinates: [formData.location.coordinates[0], formData.location.coordinates[1]],
                    address: formData.location.address
                },
                foodSafety: {
                    storageType: formData.storageType,
                    preparedOn: formData.preparedOn || null,
                    bestByDate: formData.bestByDate || null,
                    allergens: formData.allergens,
                    dietaryInfo: formData.dietaryInfo
                }
            };

            // Try to use socket for real-time update if available
            if (window.socket && window.socket.connected) {
                window.socket.emit('new-listing', submissionData);
            }

            // Always use REST API as fallback
            const res = await fetch('/api/listings/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData)
            });

            if (!res.ok) throw new Error('Failed to create listing');

            // Show success message
            setSuccess(true);
            
            // Redirect to dashboard after success
            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);
        } catch (error) {
            console.error('Error creating listing:', error);
            setErrors({ submit: error.message || 'Failed to create listing' });
        } finally {
            setLoading(false);
        }
    };

    // Success overlay
    if (success) {
        return (
            <main className="min-h-screen bg-black pt-20">
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="flex flex-col items-center justify-center text-center py-16">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-8">
                            <CheckCircle className="w-12 h-12 text-green-500" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-400 mb-4">
                            Food Shared Successfully!
                        </h1>
                        <p className="text-gray-400 text-lg max-w-md mx-auto mb-8">
                            Thank you for sharing your food. Someone in need will be thankful for your generosity.
                        </p>
                        <div className="animate-pulse text-gray-500">
                            Redirecting to dashboard...
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black pt-20">
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400 mb-4">
                        Share Food With Your Community
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Your generosity can make a huge difference in someone's life
                    </p>
                </div>

                {/* Progress steps */}
                <div className="max-w-3xl mx-auto mb-10">
                    <div className="flex items-center justify-between">
                        <div className={`flex flex-col items-center ${currentStep >= 1 ? 'text-purple-500' : 'text-gray-600'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${currentStep >= 1 ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-500'}`}>
                                1
                            </div>
                            <span className="text-sm">Food Details</span>
                        </div>
                        <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? 'bg-purple-500' : 'bg-gray-800'}`}></div>
                        <div className={`flex flex-col items-center ${currentStep >= 2 ? 'text-purple-500' : 'text-gray-600'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${currentStep >= 2 ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-500'}`}>
                                2
                            </div>
                            <span className="text-sm">Location & Time</span>
                        </div>
                        <div className={`flex-1 h-1 mx-2 ${currentStep >= 3 ? 'bg-purple-500' : 'bg-gray-800'}`}></div>
                        <div className={`flex flex-col items-center ${currentStep >= 3 ? 'text-purple-500' : 'text-gray-600'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${currentStep >= 3 ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-500'}`}>
                                3
                            </div>
                            <span className="text-sm">Safety & Review</span>
                        </div>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto">
                    <div className="bg-gray-900 rounded-2xl p-8 border border-purple-500/20 shadow-xl">
                        <form onSubmit={handleSubmit}>
                            {/* Step 1: Food Details */}
                            {currentStep === 1 && (
                                <div className="space-y-8">
                                    <h2 className="text-2xl font-semibold text-white mb-6">Tell us about your food</h2>
                                    
                                    {/* Title field */}
                                    <div>
                                        <label className="block text-gray-300 mb-2 text-sm">
                                            What food are you sharing? <span className="text-red-500">*</span>
                                        </label>
                                        <input 
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 bg-gray-800 border ${errors.title ? 'border-red-500' : 'border-purple-500/30'} rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                            placeholder="e.g., Homemade Lasagna, Fresh Vegetables"
                                        />
                                        {errors.title && <p className="mt-2 text-sm text-red-500">{errors.title}</p>}
                                    </div>

                                    {/* Description field */}
                                    <div>
                                        <label className="block text-gray-300 mb-2 text-sm">
                                            Description <span className="text-red-500">*</span>
                                        </label>
                                        <textarea 
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 bg-gray-800 border ${errors.description ? 'border-red-500' : 'border-purple-500/30'} rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                            placeholder="Describe the food you're sharing (freshness, ingredients, etc.)"
                                            rows="3"
                                        />
                                        {errors.description && <p className="mt-2 text-sm text-red-500">{errors.description}</p>}
                                    </div>

                                    {/* Quantity field */}
                                    <div>
                                        <label className="block text-gray-300 mb-2 text-sm">
                                            Quantity <span className="text-red-500">*</span>
                                        </label>
                                        <input 
                                            type="text"
                                            name="quantity"
                                            value={formData.quantity}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 bg-gray-800 border ${errors.quantity ? 'border-red-500' : 'border-purple-500/30'} rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                            placeholder="e.g., 3 servings, 2 bags, 5 pounds"
                                        />
                                        {errors.quantity && <p className="mt-2 text-sm text-red-500">{errors.quantity}</p>}
                                    </div>

                                    {/* Food Type */}
                                    <div>
                                        <label className="block text-gray-300 mb-2 text-sm">
                                            Food Type <span className="text-red-500">*</span>
                                        </label>
                                        <div className={`grid grid-cols-2 md:grid-cols-3 gap-3 ${errors.foodType ? 'border border-red-500 p-2 rounded-xl' : ''}`}>
                                            {FOOD_TYPES.map(type => (
                                                <button
                                                    type="button"
                                                    key={type.id}
                                                    onClick={() => setFormData({...formData, foodType: type.id})}
                                                    className={`p-4 rounded-xl flex flex-col items-center justify-center text-center border hover:bg-gray-800 transition ${formData.foodType === type.id ? 'border-purple-500 bg-purple-900/20' : 'border-gray-700'}`}
                                                >
                                                    <span className="text-3xl mb-2">{type.icon}</span>
                                                    <span className="text-white font-medium">{type.name}</span>
                                                    <span className="text-gray-400 text-xs mt-1">{type.description}</span>
                                                </button>
                                            ))}
                                        </div>
                                        {errors.foodType && <p className="mt-2 text-sm text-red-500">{errors.foodType}</p>}
                                    </div>

                                    {/* Photo Upload */}
                                    <div>
                                        <label className="block text-gray-300 mb-2 text-sm">
                                            Add Photo (Optional)
                                        </label>
                                        <div className="flex items-center space-x-4">
                                            {previewPhoto ? (
                                                <div className="relative">
                                                    <img 
                                                        src={previewPhoto} 
                                                        alt="Food preview" 
                                                        className="w-24 h-24 object-cover rounded-lg"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => { setPreviewPhoto(null); setFormData({...formData, photoUrl: ''}) }}
                                                        className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="w-24 h-24 flex flex-col items-center justify-center bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-purple-500 rounded-lg cursor-pointer transition-all">
                                                    <Camera className="text-gray-400 mb-2" />
                                                    <span className="text-xs text-gray-400">Add Photo</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handlePhotoChange}
                                                        className="hidden"
                                                    />
                                                </label>
                                            )}
                                            <p className="text-sm text-gray-400">
                                                Adding a photo helps people identify your food and builds trust.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Navigation buttons */}
                                    <div className="pt-6 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={handleNextStep}
                                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-medium flex items-center"
                                        >
                                            Continue to Location
                                            <ChevronRight className="ml-2 w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Location & Time */}
                            {currentStep === 2 && (
                                <div className="space-y-8">
                                    <h2 className="text-2xl font-semibold text-white mb-6">Pickup Details</h2>
                                    
                                    {/* Map for location selection */}
                                    <div>
                                        <label className="block text-gray-300 mb-2 text-sm">
                                            Pickup Location <span className="text-red-500">*</span>
                                        </label>
                                        <p className="text-gray-400 text-sm mb-4">
                                            Click on the map to set the exact pickup location
                                        </p>
                                        
                                        {isMapLoaded ? (
                                            <div className="space-y-4">
                                                <MapComponent 
                                                    onLocationSelect={handleLocationSelect} 
                                                    onAddressSelect={handleAddressSelect} 
                                                    radius={formData.radius}
                                                    initialLocation={formData.location?.coordinates ? {
                                                        lat: formData.location.coordinates[1],
                                                        lng: formData.location.coordinates[0]
                                                    } : null}
                                                />
                                                
                                                {formData.location.coordinates && (
                                                    <div>
                                                        <label className="block text-gray-300 mb-2 text-sm">
                                                            Privacy Zone (how precise is your location)
                                                        </label>
                                                        <input
                                                            type="range"
                                                            min="10"
                                                            max="200"
                                                            step="10"
                                                            value={formData.radius}
                                                            onChange={handleRadiusChange}
                                                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                                        />
                                                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                                                            <span>Precise</span>
                                                            <span>General Area</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="bg-gray-800 rounded-xl p-6 text-center">
                                                <p className="text-gray-400">Loading map...</p>
                                            </div>
                                        )}
                                        
                                        {errors.location && <p className="mt-2 text-sm text-red-500">{errors.location}</p>}
                                    </div>

                                    {/* Address input */}
                                    <div>
                                        <label className="block text-gray-300 mb-2 text-sm">
                                            Address <span className="text-red-500">*</span>
                                        </label>
                                        <input 
                                            type="text"
                                            name="location.address"
                                            value={formData.location.address}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 bg-gray-800 border ${errors.location ? 'border-red-500' : 'border-purple-500/30'} rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                            placeholder="Address will appear here when you select a location on the map"
                                            readOnly
                                        />
                                        {errors.location && <p className="mt-2 text-sm text-red-500">{errors.location}</p>}
                                    </div>

                                    {/* Pickup Instructions */}
                                    <div>
                                        <label className="block text-gray-300 mb-2 text-sm">
                                            Pickup Instructions (Optional)
                                        </label>
                                        <textarea 
                                            name="pickupInstructions"
                                            value={formData.pickupInstructions}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-gray-800 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="e.g., 'Knock on the door', 'Text me when you arrive', etc."
                                            rows="2"
                                        />
                                    </div>

                                    {/* Available Until */}
                                    <div>
                                        <label className="block text-gray-300 mb-2 text-sm">
                                            Available Until <span className="text-red-500">*</span>
                                        </label>
                                        <input 
                                            type="datetime-local"
                                            name="availableUntil"
                                            value={formData.availableUntil}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 bg-gray-800 border ${errors.availableUntil ? 'border-red-500' : 'border-purple-500/30'} rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                        />
                                        {errors.availableUntil && <p className="mt-2 text-sm text-red-500">{errors.availableUntil}</p>}
                                    </div>

                                    {/* Navigation buttons */}
                                    <div className="pt-6 flex justify-between">
                                        <button
                                            type="button"
                                            onClick={handlePrevStep}
                                            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium flex items-center"
                                        >
                                            <ChevronLeft className="mr-2 w-5 h-5" />
                                            Back
                                        </button>
                                        
                                        <button
                                            type="button"
                                            onClick={handleNextStep}
                                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-medium flex items-center"
                                        >
                                            Continue to Safety
                                            <ChevronRight className="ml-2 w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Safety & Review */}
                            {currentStep === 3 && (
                                <div className="space-y-8">
                                    <h2 className="text-2xl font-semibold text-white mb-6">Food Safety</h2>
                                    
                                    {/* Safety Guidelines */}
                                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
                                        <div className="flex items-start">
                                            <Info className="text-blue-400 mt-1 mr-3 flex-shrink-0" />
                                            <div>
                                                <h3 className="text-blue-400 font-medium">Food Safety Guidelines</h3>
                                                <p className="text-gray-300 text-sm mt-1">
                                                    Ensuring food safety is critical. Please only share food that is fresh, properly stored, and handled with care.
                                                </p>
                                                <button 
                                                    type="button"
                                                    onClick={() => setShowSafetyInfo(!showSafetyInfo)}
                                                    className="text-blue-400 text-sm font-medium mt-2"
                                                >
                                                    {showSafetyInfo ? 'Hide details' : 'Learn more'}
                                                </button>
                                                
                                                {showSafetyInfo && (
                                                    <div className="mt-3 text-sm text-gray-300 space-y-2">
                                                        <p>• Share food that is fresh and hasn't been left out at room temperature for extended periods</p>
                                                        <p>• Properly refrigerate perishable food until pickup</p>
                                                        <p>• Avoid sharing foods that spoil easily if you're unsure about their safety</p>
                                                        <p>• Be transparent about ingredients to help those with allergies</p>
                                                        <p>• Use clean containers and utensils when handling food</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Storage Type */}
                                    <div>
                                        <label className="block text-gray-300 mb-2 text-sm">
                                            How has this food been stored? <span className="text-red-500">*</span>
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            {STORAGE_TYPES.map(type => (
                                                <button
                                                    type="button"
                                                    key={type.id}
                                                    onClick={() => setFormData({...formData, storageType: type.id})}
                                                    className={`p-4 rounded-xl flex flex-col items-center justify-center text-center border hover:bg-gray-800 transition ${formData.storageType === type.id ? 'border-purple-500 bg-purple-900/20' : 'border-gray-700'}`}
                                                >
                                                    <span className="text-2xl mb-2">{type.icon}</span>
                                                    <span className="text-white font-medium">{type.name}</span>
                                                    <span className="text-gray-400 text-xs mt-1">{type.description}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Date Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-gray-300 mb-2 text-sm">
                                                Date Prepared (if applicable)
                                            </label>
                                            <input 
                                                type="date"
                                                name="preparedOn"
                                                value={formData.preparedOn}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-gray-800 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-gray-300 mb-2 text-sm">
                                                Best By Date
                                            </label>
                                            <input 
                                                type="date"
                                                name="bestByDate"
                                                value={formData.bestByDate}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-gray-800 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Allergens */}
                                    <div>
                                        <label className="block text-gray-300 mb-2 text-sm">
                                            Contains Allergens (select all that apply)
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {ALLERGENS.map(allergen => (
                                                <button
                                                    type="button"
                                                    key={allergen.id}
                                                    onClick={() => toggleAllergen(allergen.id)}
                                                    className={`py-2 px-4 rounded-full flex items-center ${formData.allergens.includes(allergen.id) ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-gray-800 text-gray-300 border border-gray-700'}`}
                                                >
                                                    <span className="mr-2">{allergen.icon}</span>
                                                    {allergen.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Dietary Info */}
                                    <div>
                                        <label className="block text-gray-300 mb-2 text-sm">
                                            Dietary Information (select all that apply)
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {DIETARY_TYPES.map(diet => (
                                                <button
                                                    type="button"
                                                    key={diet.id}
                                                    onClick={() => toggleDietaryInfo(diet.id)}
                                                    className={`py-2 px-4 rounded-full flex items-center ${formData.dietaryInfo.includes(diet.id) ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-gray-800 text-gray-300 border border-gray-700'}`}
                                                >
                                                    <span className="mr-2">{diet.icon}</span>
                                                    {diet.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Safety Confirmation */}
                                    <div className={`bg-gray-800 rounded-xl p-6 ${errors.safetyChecklist ? 'border border-red-500' : ''}`}>
                                        <h3 className="text-white font-medium mb-4">Safety Confirmation</h3>
                                        
                                        <div className="space-y-3">
                                            <label className="flex items-start">
                                                <input
                                                    type="checkbox"
                                                    name="safetyChecklist.properlyStored"
                                                    checked={formData.safetyChecklist.properlyStored}
                                                    onChange={handleChange}
                                                    className="mt-1 mr-3"
                                                />
                                                <span className="text-gray-300 text-sm">
                                                    I confirm this food has been properly stored and handled according to food safety guidelines.
                                                </span>
                                            </label>
                                            
                                            <label className="flex items-start">
                                                <input
                                                    type="checkbox"
                                                    name="safetyChecklist.handlingProcedures"
                                                    checked={formData.safetyChecklist.handlingProcedures}
                                                    onChange={handleChange}
                                                    className="mt-1 mr-3"
                                                />
                                                <span className="text-gray-300 text-sm">
                                                    I've provided accurate information about ingredients and allergens.
                                                </span>
                                            </label>
                                            
                                            <label className="flex items-start">
                                                <input
                                                    type="checkbox"
                                                    name="safetyChecklist.noSpoilage"
                                                    checked={formData.safetyChecklist.noSpoilage}
                                                    onChange={handleChange}
                                                    className="mt-1 mr-3"
                                                />
                                                <span className="text-gray-300 text-sm">
                                                    This food shows no signs of spoilage and is safe for consumption.
                                                </span>
                                            </label>
                                        </div>
                                        
                                        {errors.safetyChecklist && (
                                            <p className="mt-2 text-sm text-red-500">{errors.safetyChecklist}</p>
                                        )}
                                    </div>

                                    {/* Review Summary */}
                                    <div className="bg-gray-800 rounded-xl p-6">
                                        <h3 className="text-white font-medium mb-4">Review Your Listing</h3>
                                        
                                        <div className="space-y-4">
                                            <div className="flex">
                                                <span className="text-gray-400 w-1/3">Food:</span>
                                                <span className="text-white">{formData.title}</span>
                                            </div>
                                            
                                            <div className="flex">
                                                <span className="text-gray-400 w-1/3">Quantity:</span>
                                                <span className="text-white">{formData.quantity}</span>
                                            </div>
                                            
                                            <div className="flex">
                                                <span className="text-gray-400 w-1/3">Type:</span>
                                                <span className="text-white">
                                                    {FOOD_TYPES.find(t => t.id === formData.foodType)?.name || ''}
                                                </span>
                                            </div>
                                            
                                            <div className="flex">
                                                <span className="text-gray-400 w-1/3">Location:</span>
                                                <span className="text-white">{formData.location.address}</span>
                                            </div>
                                            
                                            <div className="flex">
                                                <span className="text-gray-400 w-1/3">Available Until:</span>
                                                <span className="text-white">
                                                    {formData.availableUntil ? new Date(formData.availableUntil).toLocaleString() : ''}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Error message */}
                                    {errors.submit && (
                                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
                                            {errors.submit}
                                        </div>
                                    )}

                                    {/* Navigation buttons */}
                                    <div className="pt-6 flex justify-between">
                                        <button
                                            type="button"
                                            onClick={handlePrevStep}
                                            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium flex items-center"
                                        >
                                            <ChevronLeft className="mr-2 w-5 h-5" />
                                            Back
                                        </button>
                                        
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-medium flex items-center disabled:opacity-50"
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="animate-spin mr-2">⏳</span>
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    Share Food Now
                                                    <PlusCircle className="ml-2 w-5 h-5" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}