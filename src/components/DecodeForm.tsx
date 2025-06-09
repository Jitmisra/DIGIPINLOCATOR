import React, { useState } from 'react';
import axios from 'axios';
import MapComponent from './MapComponent';
import QRScanner from './QRScanner';

const DecodeForm: React.FC = () => {
  const [digipin, setDigipin] = useState<string>('');
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState<boolean>(false);

  const validateDigipin = (): boolean => {
    if (!digipin.trim()) {
      setError('DIGIPIN is required');
      return false;
    }

    // Assuming DIGIPIN is a 10-character alphanumeric code
    if (!/^[A-Za-z0-9]{10}$/.test(digipin.trim())) {
      setError('Invalid DIGIPIN format. It should be a 10-character alphanumeric code.');
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateDigipin()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/decode', {
        digipin: digipin.trim()
      });
      
      setCoordinates({
        latitude: response.data.latitude,
        longitude: response.data.longitude
      });
    } catch (err) {
      console.error('Error decoding DIGIPIN:', err);
      setError('Failed to decode DIGIPIN. Please check if it is correct and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRScan = (result: string) => {
    setDigipin(result);
    setShowScanner(false);
    
    // Automatically submit the form after scan
    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    }, 500);
  };

  const handleClear = () => {
    setDigipin('');
    setCoordinates(null);
    setError(null);
  };

  const openInMaps = () => {
    if (!coordinates) return;
    
    const { latitude, longitude } = coordinates;
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Form Section */}
          <div className="md:w-1/2 p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Enter DIGIPIN
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="digipin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  DIGIPIN Code
                </label>
                <input
                  type="text"
                  id="digipin"
                  value={digipin}
                  onChange={(e) => setDigipin(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter 10-character DIGIPIN"
                  maxLength={10}
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
                >
                  Scan QR
                </button>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 disabled:bg-gray-400"
                >
                  {isLoading ? 'Decoding...' : 'Decode DIGIPIN'}
                </button>
                
                {digipin && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                  >
                    Clear
                  </button>
                )}
              </div>
            </form>
            
            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            {showScanner && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Scan DIGIPIN QR Code
                </h4>
                <QRScanner onScan={handleQRScan} />
              </div>
            )}
            
            {coordinates && (
              <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-xl">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Decoded Coordinates:
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Latitude:</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {coordinates.latitude.toFixed(6)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Longitude:</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {coordinates.longitude.toFixed(6)}
                    </span>
                  </div>
                  
                  <button
                    onClick={openInMaps}
                    className="w-full mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    Open in Google Maps
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Map Section */}
          <div className="md:w-1/2 p-6 md:border-l border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Location on Map
            </h3>
            <MapComponent 
              latitude={coordinates?.latitude || 20.5937}
              longitude={coordinates?.longitude || 78.9629}
              interactive={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DecodeForm;
