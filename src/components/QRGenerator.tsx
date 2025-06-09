import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRGeneratorProps {
  value: string;
  size?: number;
}

const QRGenerator: React.FC<QRGeneratorProps> = ({ value, size = 200 }) => {
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQRCode = (format: 'svg' | 'png') => {
    if (!qrRef.current) return;

    if (format === 'svg') {
      const svgElement = qrRef.current.querySelector('svg');
      if (!svgElement) return;

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `digipin-qr-${value}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const svgElement = qrRef.current.querySelector('svg');
      if (!svgElement) return;

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const img = new Image();
      
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        const pngUrl = canvas.toDataURL('image/png');
        
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `digipin-qr-${value}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  const shareQRCode = async () => {
    if (!qrRef.current || !navigator.share) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const svgElement = qrRef.current.querySelector('svg');
      if (!svgElement) return;

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const img = new Image();
      
      img.onload = async () => {
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          
          try {
            const file = new File([blob], `digipin-qr-${value}.png`, { type: 'image/png' });
            
            await navigator.share({
              title: 'DIGIPIN QR Code',
              text: `DIGIPIN: ${value}`,
              files: [file]
            });
          } catch (error) {
            console.error('Error sharing QR code:', error);
          }
        }, 'image/png');
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    } catch (error) {
      console.error('Error sharing QR code:', error);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div ref={qrRef} className="bg-white p-4 rounded-xl shadow-md">
        {value ? (
          <QRCodeSVG 
            value={value} 
            size={size} 
            level="H" 
            includeMargin={true}
            bgColor="#FFFFFF"
            fgColor="#000000"
          />
        ) : (
          <div className="w-[200px] h-[200px] flex items-center justify-center bg-gray-100 rounded-lg">
            <span className="text-gray-400">Enter a DIGIPIN</span>
          </div>
        )}
      </div>
      
      {value && (
        <div className="mt-4 flex space-x-3">
          <button
            onClick={() => downloadQRCode('png')}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
          >
            Download PNG
          </button>
          <button
            onClick={() => downloadQRCode('svg')}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
          >
            Download SVG
          </button>
          {navigator.share && (
            <button
              onClick={shareQRCode}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
            >
              Share
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default QRGenerator;
