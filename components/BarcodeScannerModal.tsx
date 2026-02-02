import React, { useEffect, useRef, useState } from 'react';

interface BarcodeScannerModalProps {
  onClose: () => void;
  onScanSuccess: (barcodeValue: string) => void;
}

const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({ onClose, onScanSuccess }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationFrameId: number | null = null;

    const startScan = async () => {
      if (!('BarcodeDetector' in window)) {
        setError('El lector de código de barras no es compatible con este navegador.');
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // @ts-ignore - BarcodeDetector might not be in default TS lib
        const barcodeDetector = new window.BarcodeDetector({
          formats: ['ean_13', 'code_128', 'qr_code', 'upc_a', 'upc_e']
        });

        const detectBarcode = async () => {
          if (videoRef.current && videoRef.current.readyState === 4) {
            try {
              const barcodes = await barcodeDetector.detect(videoRef.current);
              if (barcodes.length > 0) {
                onScanSuccess(barcodes[0].rawValue);
                // No need to call onClose here, onScanSuccess will handle it
              } else {
                animationFrameId = requestAnimationFrame(detectBarcode);
              }
            } catch (err) {
              console.error('Error detecting barcode:', err);
              setError('Ocurrió un error al escanear.');
            }
          } else {
            animationFrameId = requestAnimationFrame(detectBarcode);
          }
        };

        detectBarcode();

      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('No se pudo acceder a la cámara. Verifique los permisos.');
      }
    };

    startScan();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onScanSuccess]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50 p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div className="relative w-full max-w-lg aspect-square bg-black rounded-2xl overflow-hidden shadow-xl" onClick={e => e.stopPropagation()}>
        <video ref={videoRef} className="w-full h-full object-cover" playsInline />
        
        {/* Viewfinder Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[80%] h-[40%] border-4 border-white/50 rounded-2xl shadow-lg"></div>
        </div>

        {/* Red laser line animation */}
         <div className="absolute top-1/2 left-[10%] w-[80%] h-0.5 bg-red-500 shadow-[0_0_10px_red] animate-scan"></div>
      </div>
      
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg text-center max-w-lg">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      <p className="text-white mt-4 font-semibold text-center max-w-lg">
        Apunta la cámara al código de barras
      </p>

      <button
        onClick={onClose}
        className="mt-6 w-full max-w-xs py-3 font-bold text-[var(--brand-color)] bg-white rounded-lg hover:bg-gray-200 transition-colors"
      >
        Cancelar
      </button>

      <style>{`
        @keyframes scan {
            0% { transform: translateY(-80px); }
            50% { transform: translateY(80px); }
            100% { transform: translateY(-80px); }
        }
        .animate-scan {
            animation: scan 2.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default BarcodeScannerModal;
