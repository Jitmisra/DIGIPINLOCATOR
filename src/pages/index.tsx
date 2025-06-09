import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Get_DIGIPIN, Get_LatLng_By_Digipin } from '@/utils/digipin';

// Import map component dynamically to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] rounded-3xl bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center">
      <p className="text-gray-500 dark:text-gray-400">Loading map...</p>
    </div>
  )
});

export default function Home() {
  const [activeTab, setActiveTab] = useState<'encode' | 'decode'>('encode');
  const router = useRouter();
  const [coordinates, setCoordinates] = useState({
    latitude: 20.5937,
    longitude: 78.9629
  });
  // For DIGIPIN encoding/decoding
  const [digipin, setDigipin] = useState('');
  const [decodedCoordinates, setDecodedCoordinates] = useState('');
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [encodingError, setEncodingError] = useState('');
  const [decodingError, setDecodingError] = useState('');

  useEffect(() => {
    // Process URL parameters
    const { digipin, lat, lon } = router.query;

    if (digipin && typeof digipin === 'string') {
      setActiveTab('decode');
      // You would typically pass this to your DecodeForm component
      // Implementation left for you to complete
    } else if (lat && lon) {
      setActiveTab('encode');
      // You would typically pass these to your EncodeForm component
      // Implementation left for you to complete
    }
  }, [router.query]);

  const handleLocationSelect = (lat: number, lng: number) => {
    setCoordinates({ latitude: lat, longitude: lng });
    
    // Automatically generate DIGIPIN when location is selected on map
    // Check if coordinates are within India bounding box
    if (
      lat >= 2.5 && lat <= 38.5 && 
      lng >= 63.5 && lng <= 99.5
    ) {
      const generatedDigipin = Get_DIGIPIN(lat, lng);
      if (generatedDigipin) {
        setDigipin(generatedDigipin);
        setEncodingError(''); // Clear any previous errors
      } else {
        setEncodingError('Failed to generate DIGIPIN. Please check coordinates.');
      }
    } else {
      setEncodingError('Coordinates outside India bounding box (2.5°-38.5°N, 63.5°-99.5°E)');
    }
  };

  // Add function to get current location using browser's Geolocation API
  const [geoLocationError, setGeoLocationError] = useState<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  
  const getCurrentLocation = () => {
    setIsLocating(true);
    setGeoLocationError('');
    
    if (!navigator.geolocation) {
      setGeoLocationError('Geolocation is not supported by your browser');
      setIsLocating(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ latitude, longitude });
        setIsLocating(false);
        
        // Auto-generate DIGIPIN after getting coordinates
        if (
          latitude >= 2.5 && latitude <= 38.5 && 
          longitude >= 63.5 && longitude <= 99.5
        ) {
          const generatedDigipin = Get_DIGIPIN(latitude, longitude);
          if (generatedDigipin) {
            setDigipin(generatedDigipin);
          } else {
            setEncodingError('Failed to generate DIGIPIN. Please check coordinates.');
          }
        } else {
          setEncodingError('Detected location is outside India bounding box (2.5°-38.5°N, 63.5°-99.5°E)');
        }
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoLocationError('Location permission denied. Please allow location access.');
            break;
          case error.POSITION_UNAVAILABLE:
            setGeoLocationError('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            setGeoLocationError('The request to get user location timed out.');
            break;
          default:
            setGeoLocationError('An unknown error occurred while retrieving location.');
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Function to auto-detect DIGIPIN from URL or geolocation
  const autoDetectDigipin = (inputDigipin: string) => {
    // Check if input is a valid DIGIPIN
    const cleanCode = inputDigipin.replace(/\s/g, '');
    const validSymbols = ['2', '3', '4', '5', '6', '7', '8', '9', 'C', 'F', 'J', 'K', 'L', 'M', 'P', 'T'];
    const isValidDigipin = cleanCode.length === 10 && [...cleanCode].every(char => validSymbols.includes(char));
    
    if (isValidDigipin) {
      // It's a DIGIPIN, decode it
      setActiveTab('decode');
      setDigipin(inputDigipin);
      handleDecodeDigipin(inputDigipin);
      return true;
    }
    
    // Check if it's coordinates
    const coordsRegex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
    const match = inputDigipin.match(coordsRegex);
    
    if (match) {
      // It's coordinates, encode them
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[3]);
      
      setActiveTab('encode');
      setCoordinates({ latitude: lat, longitude: lng });
      handleGenerateDigipin();
      return true;
    }
    
    return false;
  };

  // Update the formatDigipin function to ensure it always handles input properly
  const formatDigipin = (digipinString: string): string => {
    if (!digipinString) return '';
    
    // Clean the string of any existing formatting
    const cleanDigipin = digipinString.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
    // Check if we have exactly 10 characters
    if (cleanDigipin.length !== 10) return digipinString;
    
    // Format as XXX-YYY-ZZZZ
    return `${cleanDigipin.substring(0, 3)}-${cleanDigipin.substring(3, 6)}-${cleanDigipin.substring(6, 10)}`;
  };

  const handleGenerateDigipin = () => {
    // Clear previous errors
    setEncodingError('');
    
    // Check if coordinates are within India bounding box
    if (
      coordinates.latitude < 2.5 || 
      coordinates.latitude > 38.5 || 
      coordinates.longitude < 63.5 || 
      coordinates.longitude > 99.5
    ) {
      setEncodingError('Coordinates outside India bounding box (2.5°-38.5°N, 63.5°-99.5°E)');
      return;
    }
    
    const generatedDigipin = Get_DIGIPIN(coordinates.latitude, coordinates.longitude);
    
    if (generatedDigipin) {
      // Store the raw DIGIPIN (for passing to map component, etc.)
      setDigipin(generatedDigipin);
    } else {
      setEncodingError('Failed to generate DIGIPIN. Please check coordinates.');
    }
  };

  const handleDecodeDigipin = (inputDigipin: string) => {
    // Clear previous errors
    setDecodingError('');
    
    if (!inputDigipin.trim()) {
      setDecodingError('Please enter a DIGIPIN code');
      return;
    }
    
    // Clean the input: remove all non-alphanumeric characters (spaces, hyphens, etc.)
    const cleanCode = inputDigipin.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
    // Validate input format
    const validSymbols = ['2', '3', '4', '5', '6', '7', '8', '9', 'C', 'F', 'J', 'K', 'L', 'M', 'P', 'T'];
    const isValid = cleanCode.length === 10 && [...cleanCode].every(char => validSymbols.includes(char));
    
    if (!isValid) {
      setDecodingError('Invalid DIGIPIN code. Use only characters: 2-9, C, F, J, K, L, M, P, T');
      return;
    }
    
    // Use the utility function to decode DIGIPIN with cleaned input
    const coords = Get_LatLng_By_Digipin(cleanCode);
    
    if (coords && !coords.includes('Invalid')) {
      setDecodedCoordinates(coords);
      // Parse and update map coordinates
      const [lat, lon] = coords.split(',').map(coord => parseFloat(coord.trim()));
      setCoordinates({ latitude: lat, longitude: lon });
    } else {
      setDecodingError(coords || 'Failed to decode DIGIPIN.');
    }
  };
  
  // Add function to open coordinates in Google Maps
  const openInGoogleMaps = (coords: string) => {
    if (coords) {
      const url = `https://www.google.com/maps/search/?api=1&query=${coords}`;
      window.open(url, '_blank');
    }
  };

  const handleCopyDigipin = () => {
    if (digipin) {
      navigator.clipboard.writeText(formatDigipin(digipin));
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000);
    }
  };

  // Add scroll function to navigate to sections
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full min-h-screen bg-white dark:bg-gray-900">
      <Head>
        <title>DIGIPINLOCATOR</title>
        <meta name="description" content="Convert geographic coordinates to DIGIPIN codes - India's standardized geo-coded addressing system" />
      </Head>
      
      {/* Updated Modern Header/Navigation with DIGIPIN LOCATOR title */}
      <nav className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-full px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold text-orange-500">DIGI</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">PIN</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white ml-1">LOCATOR</span>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-orange-500 transition-colors font-medium"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('map-section')}
                className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-orange-500 transition-colors font-medium"
              >
                Interactive Map
              </button>
              <button 
                onClick={() => scrollToSection('how-it-works-section')}
                className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-orange-500 transition-colors font-medium"
              >
                How Digipin Works
              </button>
              <button 
                onClick={() => scrollToSection('applications-section')}
                className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-orange-500 transition-colors font-medium"
              >
                Digipin Applications
              </button>
            </div>
            
            {/* Mobile menu button - Consider implementing a mobile menu */}
            <div className="md:hidden">
              <button className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="max-w-full px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight mb-6">
                <span className="block text-orange-500 mb-2">DIGIPIN</span>
                <span className="block text-gray-900 dark:text-white">Digital Postal Index Number</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl">
                India's standardized geo-coded addressing system that converts any location into a simple 10-character code, providing precise identification for every 4m×4m area across the country.
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => setActiveTab('encode')}
                  className={`px-6 py-3 rounded-xl text-white font-medium transition-all ${activeTab === 'encode' ? 'bg-orange-500 shadow-lg shadow-orange-500/20' : 'bg-gray-500'}`}
                >
                  Generate DIGIPIN
                </button>
                <button 
                  onClick={() => setActiveTab('decode')}
                  className={`px-6 py-3 rounded-xl text-white font-medium transition-all ${activeTab === 'decode' ? 'bg-orange-500 shadow-lg shadow-orange-500/20' : 'bg-gray-500'}`}
                >
                  Decode DIGIPIN
                </button>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <div className="flex-1 text-center text-base font-medium text-gray-700 dark:text-gray-300">
                  {activeTab === 'encode' ? 'Generate DIGIPIN' : 'Decode DIGIPIN'}
                </div>
              </div>
              
              {/* Redesigned tab buttons - smaller and more compact */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button 
                  onClick={() => setActiveTab('encode')}
                  className={`py-2.5 rounded-lg flex flex-col items-center justify-center transition-all ${
                    activeTab === 'encode' 
                      ? 'bg-orange-500 text-white shadow-sm' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="font-medium text-sm">Generate</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('decode')}
                  className={`py-2.5 rounded-lg flex flex-col items-center justify-center transition-all ${
                    activeTab === 'decode' 
                      ? 'bg-orange-500 text-white shadow-sm' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                  <span className="font-medium text-sm">Decode</span>
                </button>
              </div>
              
              {activeTab === 'encode' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Latitude</label>
                      <input 
                        type="number" 
                        value={coordinates.latitude}
                        onChange={(e) => setCoordinates({...coordinates, latitude: parseFloat(e.target.value) || 0})}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="e.g., 28.6228"
                        step="0.000001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Longitude</label>
                      <input 
                        type="number" 
                        value={coordinates.longitude}
                        onChange={(e) => setCoordinates({...coordinates, longitude: parseFloat(e.target.value) || 0})}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="e.g., 77.2130"
                        step="0.000001"
                      />
                    </div>
                  </div>
                  
                  {/* Auto-detect location button - Reduced gap between icon and text */}
                  <button 
                    onClick={getCurrentLocation}
                    disabled={isLocating}
                    className="w-full py-3 bg-orange-50 border-2 border-orange-500 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors font-medium flex items-center justify-center shadow-sm"
                  >
                    {isLocating ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Detecting Location...</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-orange-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm sm:text-base">Auto-Detect My Location</span>
                      </>
                    )}
                  </button>
                  
                  {geoLocationError && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                      {geoLocationError}
                    </div>
                  )}
                  
                  {encodingError && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                      {encodingError}
                    </div>
                  )}
                  
                  <button 
                    onClick={handleGenerateDigipin}
                    className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                  >
                    Generate DIGIPIN
                  </button>
                  
                  {digipin && (
                    <div className="p-5 bg-orange-50 dark:bg-gray-700 rounded-lg border border-orange-100 dark:border-gray-600">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Your DIGIPIN:</p>
                          <p className="text-2xl font-mono font-bold text-orange-500 tracking-wider">{formatDigipin(digipin)}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Represents a 4m×4m area</p>
                        </div>
                        <button 
                          onClick={handleCopyDigipin}
                          className="p-2.5 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          title="Copy to clipboard"
                        >
                          {showCopiedMessage ? (
                            <span className="text-green-500 font-medium px-1">Copied!</span>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">DIGIPIN Code</label>
                    <input 
                      type="text" 
                      value={digipin}
                      onChange={(e) => setDigipin(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                      placeholder="e.g., 3PT-M77-3334"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Format: XXX-YYY-ZZZZ (using 2-9, C, F, J, K, L, M, P, T)</p>
                  </div>
                  
                  {decodingError && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                      {decodingError}
                    </div>
                  )}
                  
                  <button 
                    onClick={() => handleDecodeDigipin(digipin)}
                    className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                  >
                    Decode to Coordinates
                  </button>
                  
                  {decodedCoordinates && (
                    <div className="p-4 bg-orange-50 dark:bg-gray-700 rounded-lg border border-orange-100 dark:border-gray-600">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Coordinates:</p>
                          <p className="text-lg font-mono font-bold text-orange-500">{decodedCoordinates}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Center of the 4m×4m grid cell</p>
                        </div>
                        <div>
                          <button 
                            onClick={() => openInGoogleMaps(decodedCoordinates)}
                            className="flex items-center justify-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                          >
                            <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                            Open in Google Maps
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Map Section */}
      <section id="map-section" className="w-full bg-white dark:bg-gray-900 py-12">
        <div className="max-w-full px-4 sm:px-6 md:px-12 lg:px-20 xl:px-16 mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Interactive <span className="text-orange-500">Map</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Click anywhere on the map to select a location and generate its DIGIPIN
            </p>
          </div>
          
          <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-700 h-[600px]">
            <MapComponent 
              latitude={coordinates.latitude} 
              longitude={coordinates.longitude}
              digipin={digipin} // Pass the DIGIPIN to MapComponent
              onLocationSelect={handleLocationSelect}
              interactive={true}
            />
          </div>
        </div>
      </section>
      
      {/* DIGIPIN Explanation */}
      <section id="how-it-works-section" className="w-full bg-orange-50 dark:bg-gray-800 py-16">
        <div className="max-w-full px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              How <span className="text-orange-500">DIGIPIN</span> Works
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              DIGIPIN divides the entire geographical territory of India into uniform 4m×4m grid cells, each with a unique 10-character code.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white dark:bg-gray-700 rounded-3xl p-6 shadow-lg relative">
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-lg">1</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 mt-6">Bounding Box</h3>
              <p className="text-gray-600 dark:text-gray-300">
                India's territory is bounded within coordinates 2.5°-38.5°N latitude and 63.5°-99.5°E longitude.
              </p>
              <div className="mt-4">
                <img src="/bb.jpeg" alt="India Map Bounding Box" className="w-full rounded-xl" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-700 rounded-3xl p-6 shadow-lg relative">
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-lg">2</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 mt-6">Hierarchical Grids</h3>
              <p className="text-gray-600 dark:text-gray-300">
                The bounding box is divided into 16 regions, each further divided into 16 sub-regions, continuing for 10 levels.
              </p>
              <div className="mt-4 grid grid-cols-4 gap-1">
                {Array(16).fill(0).map((_, i) => (
                  <div key={i} className="aspect-square bg-orange-100 dark:bg-orange-900/30 rounded-md flex items-center justify-center text-orange-500 dark:text-orange-400 font-mono font-bold">
                    {['2','3','4','5','6','7','8','9','C','F','J','K','L','M','P','T'][i]}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-700 rounded-3xl p-6 shadow-lg relative">
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-lg">3</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 mt-6">Code Structure</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Each DIGIPIN is a 10-character code using 16 specific symbols: 2-9, C, F, J, K, L, M, P, and T, formatted as XXX-YYY-ZZZZ.
              </p>
              <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/50 rounded-xl border border-orange-100 dark:border-gray-600">
                {/* Update DIGIPIN example with clear hyphens */}
                <div className="font-mono text-center flex flex-wrap justify-center items-center">
                  <div className="flex space-x-0.5 xs:space-x-1">
                    <span className="inline-block px-1 py-0.5 sm:px-2 sm:py-1 text-xs sm:text-sm bg-orange-200 dark:bg-orange-900/50 rounded-md text-orange-700 dark:text-orange-300">3</span>
                    <span className="inline-block px-1 py-0.5 sm:px-2 sm:py-1 text-xs sm:text-sm bg-orange-200 dark:bg-orange-900/50 rounded-md text-orange-700 dark:text-orange-300">9</span>
                    <span className="inline-block px-1 py-0.5 sm:px-2 sm:py-1 text-xs sm:text-sm bg-orange-200 dark:bg-orange-900/50 rounded-md text-orange-700 dark:text-orange-300">J</span>
                  </div>
                  <span className="mx-1 sm:mx-2 text-gray-500 font-bold">-</span>
                  <div className="flex space-x-0.5 xs:space-x-1">
                    <span className="inline-block px-1 py-0.5 sm:px-2 sm:py-1 text-xs sm:text-sm bg-orange-200 dark:bg-orange-900/50 rounded-md text-orange-700 dark:text-orange-300">4</span>
                    <span className="inline-block px-1 py-0.5 sm:px-2 sm:py-1 text-xs sm:text-sm bg-orange-200 dark:bg-orange-900/50 rounded-md text-orange-700 dark:text-orange-300">9</span>
                    <span className="inline-block px-1 py-0.5 sm:px-2 sm:py-1 text-xs sm:text-sm bg-orange-200 dark:bg-orange-900/50 rounded-md text-orange-700 dark:text-orange-300">L</span>
                  </div>
                  <span className="mx-1 sm:mx-2 text-gray-500 font-bold">-</span>
                  <div className="flex space-x-0.5 xs:space-x-1">
                    <span className="inline-block px-1 py-0.5 sm:px-2 sm:py-1 text-xs sm:text-sm bg-orange-200 dark:bg-orange-900/50 rounded-md text-orange-700 dark:text-orange-300 mt-2">L</span>
                    <span className="inline-block px-1 py-0.5 sm:px-2 sm:py-1 text-xs sm:text-sm bg-orange-200 dark:bg-orange-900/50 rounded-md text-orange-700 dark:text-orange-300 mt-2">8</span>
                    <span className="inline-block px-1 py-0.5 sm:px-2 sm:py-1 text-xs sm:text-sm bg-orange-200 dark:bg-orange-900/50 rounded-md text-orange-700 dark:text-orange-300 mt-2">T</span>
                    <span className="inline-block px-1 py-0.5 sm:px-2 sm:py-1 text-xs sm:text-sm bg-orange-200 dark:bg-orange-900/50 rounded-md text-orange-700 dark:text-orange-300 mt-2">4</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-700 rounded-3xl p-6 shadow-lg relative">
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-lg">4</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 mt-6">Precision Levels</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Each character adds precision. A complete 10-character DIGIPIN identifies a 3.8m×3.8m grid cell.
              </p>
              <div className="mt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">1 character:</span>
                    <span className="font-medium text-orange-500">~1000 km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">6 characters:</span>
                    <span className="font-medium text-orange-500">~1 km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">8 characters:</span>
                    <span className="font-medium text-orange-500">~60 m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">10 characters:</span>
                    <span className="font-medium text-orange-500">~3.8 m</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Use Cases Section */}
      <section id="applications-section" className="w-full bg-white dark:bg-gray-900 py-16">
        <div className="max-w-full px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              DIGIPIN <span className="text-orange-500">Applications</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              A standardized geo-coded addressing system enhances India's geospatial ecosystem and supports various services.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
                title: "Address Management",
                description: "Simplify address management and enhance citizen convenience with a standardized system."
              },
              {
                icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
                title: "Emergency Services",
                description: "Enable faster and more accurate emergency response with precise location identification."
              },
              {
                icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
                title: "Banking & KYC",
                description: "Enhance accuracy and efficiency in KYC processes by integrating DIGIPIN as an address attribute."
              },
              {
                icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
                title: "E-commerce Delivery",
                description: "Improve last-mile delivery with precise location codes that work even in areas without formal addresses."
              },
              {
                icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
                title: "Geospatial Ecosystem",
                description: "Contribute to India's geospatial knowledge stack in alignment with the National Geospatial Policy 2022."
              },
              {
                icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
                title: "Public Services",
                description: "Enable seamless delivery of public services with standardized location references."
              }
            ].map((useCase, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 group hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4 group-hover:bg-orange-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-500 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={useCase.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{useCase.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Remove CTA Section completely */}
      
      {/* Updated clean, minimal, professional footer */}
      <footer className="w-full bg-white dark:bg-gray-900 py-10 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-full px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex items-center mb-4">
              <span className="text-xl font-bold text-orange-500">DIGI</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">PIN</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white ml-1">LOCATOR</span>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
              Designed and developed by Agnik Misra
            </p>
            
            <div className="flex items-center space-x-4 mt-1">
              <a 
                href="https://www.linkedin.com/in/agnikmisra/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-500 hover:text-orange-500 transition-colors flex items-center"
                aria-label="LinkedIn Profile"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span className="ml-1.5 text-sm">LinkedIn</span>
              </a>
              <a 
                href="mailto:agnikmisra@gmail.com" 
                className="text-gray-500 hover:text-orange-500 transition-colors flex items-center"
                aria-label="Email"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="ml-1.5 text-sm">agnikmisra@gmail.com</span>
              </a>
            </div>
            
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-5">
              © {new Date().getFullYear()} - All rights reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
