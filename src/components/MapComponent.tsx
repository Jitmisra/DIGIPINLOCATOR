import React, { useEffect, useRef, useState } from 'react';
import { Get_LatLng_By_Digipin } from '@/utils/digipin';

interface MapComponentProps {
  latitude: number;
  longitude: number;
  digipin?: string;
  onLocationSelect?: (lat: number, lng: number) => void;
  interactive?: boolean;
}

interface PlacePrediction {
  description: string;
  place_id: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
  geometry?: {
    location: {
      lat: number;
      lng: number;
    }
  };
}

const MapComponent: React.FC<MapComponentProps> = ({
  latitude,
  longitude,
  digipin = '',
  onLocationSelect,
  interactive = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  
  // Search state
  const [searchInput, setSearchInput] = useState('');
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);
  
  // Location detection and toast notifications state
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [showLocationError, setShowLocationError] = useState(false);
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [copiedItem, setCopiedItem] = useState('');
  
  // For DIGIPIN decoder
  const [digipinInput, setDigipinInput] = useState('');
  const [decodingError, setDecodingError] = useState('');
  
  // Fetch place suggestions using Ola Maps Autocomplete API
  const fetchPlaceSuggestions = async (input: string) => {
    if (!input.trim() || input.length < 3) {
      setPredictions([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY || 'zFFH4Oksmh7xcmQ5MBcawBO1DLERksSMmkqiZICy';
      const response = await fetch(
        `https://api.olamaps.io/places/v1/autocomplete?input=${encodeURIComponent(input)}&api_key=${apiKey}`
      );
      
      const data = await response.json();
      
      if (data.status === 'ok' && data.predictions && data.predictions.length > 0) {
        setPredictions(data.predictions);
        setShowPredictions(true);
      } else {
        setPredictions([]);
      }
    } catch (error) {
      console.error('Error fetching place suggestions:', error);
      setPredictions([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Fetch place details when a prediction is selected
  const handlePlaceSelect = async (prediction: PlacePrediction) => {
    // First, hide predictions dropdown and clear predictions array
    setShowPredictions(false);
    setPredictions([]);
    
    try {
      // If the prediction already has location data, use it directly
      if (prediction.geometry?.location) {
        const { lat, lng } = prediction.geometry.location;
        updateMapLocation(lat, lng);
        setSearchInput(prediction.description || '');
        return;
      }
      
      // Otherwise fetch place details to get coordinates
      const apiKey = process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY || 'zFFH4Oksmh7xcmQ5MBcawBO1DLERksSMmkqiZICy';
      const response = await fetch(
        `https://api.olamaps.io/places/v1/details?place_id=${encodeURIComponent(prediction.place_id)}&api_key=${apiKey}`
      );
      
      const data = await response.json();
      
      if (data.status === 'ok' && data.result?.geometry?.location) {
        const { lat, lng } = data.result.geometry.location;
        updateMapLocation(lat, lng);
        setSearchInput(prediction.description || prediction.structured_formatting?.main_text || '');
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
    }
  };
  
  // Add this validation function at the top level of the component
  const isValidCoordinates = (lat: number, lng: number): boolean => {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  };

  // Update the updateMapLocation function to validate coordinates
  const updateMapLocation = (lat: number, lng: number) => {
    if (!isValidCoordinates(lat, lng)) {
      setLocationError(`Invalid coordinates: Latitude must be between -90 and 90, Longitude must be between -180 and 180. Got (${lat}, ${lng})`);
      setShowLocationError(true);
      setTimeout(() => setShowLocationError(false), 5000);
      return;
    }
    
    if (mapRef.current && markerRef.current) {
      markerRef.current.setLngLat([lng, lat]);
      
      mapRef.current.flyTo({
        center: [lng, lat],
        essential: true,
        zoom: 16
      });
      
      if (onLocationSelect) {
        onLocationSelect(lat, lng);
      }
    }
  };
  
  // Detect current location
  const detectMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setShowLocationError(true);
      setTimeout(() => setShowLocationError(false), 3000);
      return;
    }
    
    setIsLocating(true);
    setLocationError('');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        updateMapLocation(lat, lng);
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        let errorMsg = 'Failed to get your location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMsg = 'Location request timed out';
            break;
        }
        
        setLocationError(errorMsg);
        setShowLocationError(true);
        setTimeout(() => setShowLocationError(false), 3000);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };
  
  // Open in Google Maps
  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  // Copy coordinates or DIGIPIN to clipboard
  const copyToClipboard = (text: string, type: string) => {
    // If copying DIGIPIN, ensure it's formatted
    if (type === 'DIGIPIN') {
      navigator.clipboard.writeText(formatDigipin(text));
    } else {
      navigator.clipboard.writeText(text);
    }
    setCopiedItem(type);
    setShowCopiedToast(true);
    setTimeout(() => setShowCopiedToast(false), 2000);
  };

  // Function to decode DIGIPIN
  const handleDecodeDigipin = () => {
    // Clear previous errors
    setDecodingError('');
    
    if (!digipinInput.trim()) {
      setDecodingError('Please enter a DIGIPIN code');
      return;
    }
    
    // Clean the input: remove all non-alphanumeric characters (spaces, hyphens, etc.)
    const cleanCode = digipinInput.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
    // Validate input format
    const validSymbols = ['2', '3', '4', '5', '6', '7', '8', '9', 'C', 'F', 'J', 'K', 'L', 'M', 'P', 'T'];
    const isValid = cleanCode.length === 10 && Array.from(cleanCode).every(char => validSymbols.includes(char));
    
    if (!isValid) {
      setDecodingError('Invalid DIGIPIN format');
      return;
    }
    
    // Use the utility function to decode DIGIPIN with cleaned input
    const coords = Get_LatLng_By_Digipin(cleanCode);
    
    if (coords && !coords.includes('Invalid')) {
      // Parse coordinates
      const [lat, lng] = coords.split(',').map(coord => parseFloat(coord.trim()));
      
      // Update map location
      updateMapLocation(lat, lng);
      
      // Clear input after successful decode
      setDigipinInput('');
    } else {
      setDecodingError(coords || 'Failed to decode DIGIPIN');
    }
  };

  // Handle search input changes with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPlaceSuggestions(searchInput);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    
    // Validate initial coordinates
    const initialLat = isValidCoordinates(latitude, longitude) ? latitude : 20.5937;
    const initialLng = isValidCoordinates(latitude, longitude) ? longitude : 78.9629;
    
    if (!isValidCoordinates(latitude, longitude)) {
      // Show error if initial coordinates are invalid
      setTimeout(() => {
        setLocationError(`Invalid coordinates provided: (${latitude}, ${longitude}). Using default coordinates for India.`);
        setShowLocationError(true);
        setTimeout(() => setShowLocationError(false), 5000);
      }, 1000);
    }
    
    // Dynamic import for Next.js
    import('olamaps-web-sdk').then((module) => {
      const { OlaMaps } = module;
      
      // Initialize OlaMaps with API key
      const apiKey = process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY || 'zFFH4Oksmh7xcmQ5MBcawBO1DLERksSMmkqiZICy';
      const olaMaps = new OlaMaps({ apiKey });
      
      // Create map instance with safe coordinates
      const map = olaMaps.init({
        style: "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json",
        container: mapContainerRef.current,
        center: [initialLng, initialLat], // Use safe coordinates
        zoom: 15,
        attributionControl: false
      });
      
      // Store map reference
      mapRef.current = map;
      map.on('load', () => {
        // Create custom marker element
        const markerElement = document.createElement('div');
        markerElement.className = 'ola-marker';
        markerElement.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="35" height="45" viewBox="0 0 384 512">
            <path fill="#F97316" d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"/>
          </svg>
        `;
        
        // Make sure to remove any existing marker before adding a new one
        if (markerRef.current) {
          markerRef.current.remove();
        }
        
        // Add marker to map
        const marker = olaMaps.addMarker({
          element: markerElement,
          draggable: interactive,
        })
        .setLngLat([longitude, latitude])
        .addTo(map);
        
        // Store marker reference
        markerRef.current = marker;
        
        // Add popup to marker with coordinate information
        const popup = olaMaps.addPopup({
          offset: [0, -15]
        }).setHTML(`
          <div class="p-2">
            <p class="text-sm font-bold">Location</p>
            <p class="text-xs">${latitude.toFixed(6)}, ${longitude.toFixed(6)}</p>
          </div>
        `);
        
        marker.setPopup(popup);
        
        // Add click handler for map if interactive
        if (interactive && onLocationSelect) {
          map.on('click', (e) => {
            const { lng, lat } = e.lngLat;
            marker.setLngLat([lng, lat]);
            onLocationSelect(lat, lng);
            
            // Update popup content
            popup.setHTML(`
              <div class="p-2">
                <p class="text-sm font-bold">Location</p>
                <p class="text-xs">${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
              </div>
            `);
          });
          
          // Add drag handler for marker
          marker.on('dragend', () => {
            const lngLat = marker.getLngLat();
            onLocationSelect(lngLat.lat, lngLat.lng);
            
            // Update popup content
            popup.setHTML(`
              <div class="p-2">
                <p class="text-sm font-bold">Location</p>
                <p class="text-xs">${lngLat.lat.toFixed(6)}, ${lngLat.lng.toFixed(6)}</p>
              </div>
            `);
          });
        }
        
        setIsMapLoaded(true);
      });
      
      // suppress non-critical style errors
      map.on('error', (evt: any) => {
        const msg = evt.error?.message || evt.message || '';
        const known = [
          '3d_model',
          'vectordata',
          'Expected value to be of type number, but found null instead',
        ];
        if (known.some(k => msg.includes(k))) return;
        console.error('Ola Maps error:', evt);
      });
      
      // suppress missing sprite image warnings
      map.on('styleimagemissing', (evt: any) => {
        // console.warn('Missing map image, ignored:', evt.id);
      });
    }).catch(error => {
      console.error('Failed to load Ola Maps SDK:', error);
    });
    
    return () => {
      // Clean up
      if (markerRef.current) {
        try {
          markerRef.current.remove();
        } catch (error) {
          console.error('Error removing marker:', error);
        }
        markerRef.current = null;
      }
      
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (error) {
          console.error('Error removing map:', error);
        }
        mapRef.current = null;
      }
    };
  }, []);
  
  // Update marker position when coordinates change - no need to create a new marker
  useEffect(() => {
    if (isMapLoaded && markerRef.current && mapRef.current) {
      // Validate coordinates first
      if (!isValidCoordinates(latitude, longitude)) {
        setLocationError(`Invalid coordinates: Latitude must be between -90 and 90, Longitude must be between -180 and 180. Got (${latitude}, ${longitude})`);
        setShowLocationError(true);
        setTimeout(() => setShowLocationError(false), 5000);
        return;
      }
      
      // Only update if coordinates are valid
      markerRef.current.setLngLat([longitude, latitude]);
      
      // Update map center
      mapRef.current.flyTo({
        center: [longitude, latitude],
        essential: true,
        duration: 1000
      });
      
      // Update popup content if it exists
      if (markerRef.current.getPopup) {
        const popup = markerRef.current.getPopup();
        if (popup) {
          popup.setHTML(`
            <div class="p-2">
              <p class="text-sm font-bold">Location</p>
              <p class="text-xs">${latitude.toFixed(6)}, ${longitude.toFixed(6)}</p>
            </div>
          `);
        }
      }
    }
  }, [latitude, longitude, isMapLoaded]);

  // At the end of the component, add a CSS rule to hide any attribution that might still appear
  useEffect(() => {
    // Add a style tag to hide map attribution if it still appears
    const style = document.createElement('style');
    style.textContent = `
      .ola-ctrl-attrib, 
      .olam-attribution,
      .maplibregl-ctrl-attrib,
      .mapboxgl-ctrl-attrib {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      // Clean up the style tag when component unmounts
      document.head.removeChild(style);
    };
  }, []);

  // Make the formatDigipin function more robust to handle already formatted input
  const formatDigipin = (digipinString: string): string => {
    if (!digipinString) return digipinString;
    
    // Clean the string of any existing formatting
    const cleanDigipin = digipinString.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
    // Check if we have exactly 10 characters
    if (cleanDigipin.length !== 10) return digipinString;
    
    // Format as XXX-YYY-ZZZZ
    return `${cleanDigipin.substring(0, 3)}-${cleanDigipin.substring(3, 6)}-${cleanDigipin.substring(6, 10)}`;
  };

  return (
    <div className="relative w-full h-full">
      {/* Search box at top */}
      <div className="absolute top-4 left-0 right-0 z-10 mx-auto px-4 max-w-md">
        <div className="relative">
          <div className="flex items-center relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search for a location..."
              className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {isSearching && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
            
            {!isSearching && searchInput && (
              <button 
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => {
                  setSearchInput('');
                  setPredictions([]);
                  setShowPredictions(false);
                }}
              >
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Predictions dropdown */}
          {showPredictions && predictions.length > 0 && (
            <div className="absolute mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto z-50">
              {predictions.map((prediction, index) => (
                <div 
                  key={prediction.place_id || index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handlePlaceSelect(prediction)}
                >
                  <div className="font-medium">
                    {prediction.structured_formatting?.main_text || prediction.description?.split(',')[0]}
                  </div>
                  <div className="text-sm text-gray-500">
                    {prediction.structured_formatting?.secondary_text || 
                     prediction.description?.split(',').slice(1).join(',')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Modern control panel in bottom right - made more compact for mobile */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col space-y-1.5 max-w-xs sm:max-w-xs w-auto">
        {/* DIGIPIN Decoder - hidden on mobile, visible on md screens and up */}
        <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 w-72">
          <div className="bg-orange-500 py-2 px-4 flex justify-between items-center">
            <h3 className="text-white text-sm font-medium">Decode DIGIPIN</h3>
          </div>
          <div className="p-3 space-y-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">DIGIPIN Code</label>
              <div className="flex">
                <input 
                  type="text" 
                  value={digipinInput}
                  onChange={(e) => setDigipinInput(e.target.value)}
                  className="flex-grow px-2 py-1 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono"
                  placeholder="e.g., 3PT-M77-3334"
                />
                <button 
                  onClick={handleDecodeDigipin}
                  className="px-3 py-1 bg-orange-500 text-white text-sm rounded-r-md hover:bg-orange-600 transition-colors"
                >
                  Go
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Format: XXX-YYY-ZZZZ</p>
            </div>
            
            {decodingError && (
              <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 text-xs">
                {decodingError}
              </div>
            )}
          </div>
        </div>
        
        {/* Location info card - made more compact for mobile */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 w-auto sm:w-72">
          <div className="bg-orange-500 py-1.5 px-3">
            <h3 className="text-white text-xs sm:text-sm font-medium">Location Details</h3>
          </div>
          
          <div className="p-2 space-y-1.5">
            {/* Latitude row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Latitude</span>
              </div>
              <div className="flex items-center">
                <span className="font-mono text-xs text-orange-500 font-medium">{latitude.toFixed(6)}</span>
                <button 
                  onClick={() => copyToClipboard(latitude.toString(), 'Latitude')}
                  className="ml-1 text-gray-400 hover:text-orange-500"
                  title="Copy latitude"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Longitude row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Longitude</span>
              </div>
              <div className="flex items-center">
                <span className="font-mono text-xs text-orange-500 font-medium">{longitude.toFixed(6)}</span>
                <button 
                  onClick={() => copyToClipboard(longitude.toString(), 'Longitude')}
                  className="ml-1 text-gray-400 hover:text-orange-500"
                  title="Copy longitude"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* DIGIPIN row (when available) */}
            {digipin && (
              <div className="flex items-center justify-between pt-1 mt-1 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-1.5">
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">DIGIPIN</span>
                </div>
                <div className="flex items-center">
                  <span className="font-mono text-xs text-orange-500 font-bold">{formatDigipin(digipin)}</span>
                  <button 
                    onClick={() => copyToClipboard(formatDigipin(digipin), 'DIGIPIN')}
                    className="ml-1 text-gray-400 hover:text-orange-500"
                    title="Copy DIGIPIN"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Action buttons - made more compact for mobile */}
        <div className="flex space-x-1.5">
          <button 
            onClick={detectMyLocation}
            disabled={isLocating}
            className="flex-1 py-1.5 px-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-xs sm:text-sm font-medium flex items-center justify-center"
            title="Detect my location"
          >
            {isLocating ? (
              <svg className="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
            <span>My Location</span>
          </button>
          
          <button 
            onClick={openInGoogleMaps}
            className="flex-1 py-1.5 px-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xs sm:text-sm font-medium flex items-center justify-center"
            title="Open in Google Maps"
          >
            <svg className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span>Google Maps</span>
          </button>
        </div>
      </div>
      
      {/* Toast notifications - adjusted position for smaller panel */}
      {showCopiedToast && (
        <div className="absolute bottom-20 right-4 z-20 bg-green-500 text-white px-3 py-1.5 rounded-lg shadow-lg text-xs flex items-center animate-fade-in-out">
          <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {copiedItem} copied to clipboard!
        </div>
      )}

      {showLocationError && (
        <div className="absolute bottom-20 right-4 z-20 bg-red-500 text-white px-3 py-1.5 rounded-lg shadow-lg text-xs flex items-center animate-fade-in-out">
          <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {locationError}
        </div>
      )}
      
      {/* Map container */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full"
        style={{ minHeight: '500px' }}
      />
    </div>
  );
};

export default MapComponent;
