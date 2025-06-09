import React, { useState } from 'react';
import axios from 'axios';
import MapComponent from './MapComponent';
import QRGenerator from './QRGenerator';

const EncodeForm: React.FC = () => {
  const [latitude, setLatitude] = useState<number | ''>('');
  const [longitude, setLongitude] = useState<number | ''>('');
  const [digipin, setDigipin] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showQR, setShowQR] = useState<boolean>(false);

  const handleLocationSelect = (lat: number, lng: number) => {
    setLatitude(parseFloat(lat.toFixed(6)));
    setLongitude(parseFloat(lng.toFixed(6)));
  };

  const validateCoordinates = (): boolean => {
    if (latitude === '' || longitude === '') {
      setError('Both latitude and longitude are required');
      return false;
    }

    if (typeof latitude === 'number' && (latitude < -90 || latitude > 90)) {
      setError('Latitude must be between -90 and 90');
      return false;
    }

    if (typeof longitude === 'number' && (longitude < -180 || longitude > 180)) {
      setError('Longitude must be between -180 and 180');
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCoordinates()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/encode', {
        latitude,
        longitude
      });
      
      setDigipin(response.data.digipin);
      setShowQR(true);
    } catch (err) {
      console.error('Error encoding coordinates:', err);
      setError('Failed to encode coordinates. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(parseFloat(position.coords.latitude.toFixed(6)));
          setLongitude(parseFloat(position.coords.longitude.toFixed(6)));
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Failed to get your location. Please check your permissions.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(digipin)
      .then(() => {
        alert('DIGIPIN copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy:', err);
      });
  };

  const shareDigipin = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My DIGIPIN',
        text: `Here's my location DIGIPIN: ${digipin}`,
        url: `${window.location.origin}?digipin=${digipin}`
      })
      .catch(err => {
        console.error('Share failed:', err);
      });
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Map Section */}
          <div className="md:w-1/2 p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Select Location on Map
            </h3>
            <MapComponent 
              latitude={typeof latitude === 'number' ? latitude : 20.5937}
              longitude={typeof longitude === 'number' ? longitude : 78.9629}
              onLocationSelect={handleLocationSelect}
            />
          </div>
          
          {/* Form Section */}
          <div className="md:w-1/2 p-6 md:border-l border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Enter Coordinates
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Latitude
                </label>
                <input
                  type="number"
                  id="latitude"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value ? parseFloat(e.target.value) : '')}
                  step="0.000001"
                  min="-90"
                  max="90"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g. 28.6139"
                />
              </div>
              
              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Longitude
                </label>
                <input
                  type="number"
                  id="longitude"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value ? parseFloat(e.target.value) : '')}
                  step="0.000001"
                  min="-180"
                  max="180"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g. 77.2090"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleShareLocation}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
                >
                  Use My Location
                </button>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 disabled:bg-gray-400"
                >
                  {isLoading ? 'Encoding...' : 'Generate DIGIPIN'}
                </button>
              </div>
            </form>
            
            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            {digipin && (
              <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-xl">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Your DIGIPIN:
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary-600 dark:text-primary-400 tracking-wider">
                    {digipin}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={copyToClipboard}
                      className="p-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors"
                      title="Copy to clipboard"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                        <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={shareDigipin}
                      className="p-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors"
                      title="Share"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {showQR && (
                  <div className="mt-4 flex justify-center">
                    <QRGenerator value={digipin} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EncodeForm;
