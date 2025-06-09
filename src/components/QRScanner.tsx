import React, { useState } from 'react';
import { QrScanner } from '@yudiel/react-qr-scanner';

interface QRScannerProps {
  onScan: (result: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleScan = (result: string) => {
    setIsScanning(false);
    onScan(result);
  };

  const handleError = (error: Error) => {
    setErrorMessage(error.message);
    console.error('QR Scanner error:', error);
  };

  return (
    <div className="flex flex-col items-center">
      {!isScanning ? (
        <button
          onClick={() => {
            setIsScanning(true);
            setErrorMessage(null);
          }}
          className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 shadow-md"
        >
          Scan QR Code
        </button>
      ) : (
        <div className="w-full max-w-md">
          <div className="relative">
            <QrScanner
              onDecode={handleScan}
              onError={handleError}
              containerStyle={{ 
                borderRadius: '0.75rem',
                overflow: 'hidden',
              }}
            />
            <button
              onClick={() => setIsScanning(false)}
              className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors duration-200 z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Position the QR code within the frame to scan.
          </div>
        </div>
      )}
      
      {errorMessage && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          Error: {errorMessage}
        </div>
      )}
    </div>
  );
};

export default QRScanner;
