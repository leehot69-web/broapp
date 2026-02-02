
import React from 'react';
import { SpecialOffer } from '../types';

interface PromoModalProps {
  offer: SpecialOffer;
  onClose: () => void;
  onAddToCart: () => void;
}

const PromoModal: React.FC<PromoModalProps> = ({ offer, onClose, onAddToCart }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[70] p-6 animate-fadeIn backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Contenedor Principal del Sticker con Animación Pop */}
      <div 
        className="relative w-72 h-72 sm:w-80 sm:h-80 animate-popIn"
        onClick={e => e.stopPropagation()}
      >
         {/* Close Button - Floating Outside */}
         <button 
          onClick={onClose} 
          className="absolute -top-12 right-0 text-white hover:text-gray-200 z-20 p-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Formas Geométricas Decorativas (Triángulos explosión) */}
        <div className="absolute top-0 right-0 transform -translate-y-4 translate-x-8 rotate-12">
             <div className="w-0 h-0 border-l-[10px] border-l-transparent border-b-[20px] border-b-[#FF005C] border-r-[10px] border-r-transparent"></div>
        </div>
        <div className="absolute bottom-10 left-0 transform translate-x-[-20px] rotate-[-45deg]">
             <div className="w-0 h-0 border-l-[15px] border-l-transparent border-b-[30px] border-b-[#FFD600] border-r-[15px] border-r-transparent"></div>
        </div>
        <div className="absolute top-20 right-[-20px] transform rotate-[45deg]">
             <div className="w-0 h-0 border-l-[10px] border-l-transparent border-b-[20px] border-b-[#FF005C] border-r-[10px] border-r-transparent"></div>
        </div>

        {/* Cuerpo Principal Amarillo (Insignia) */}
        <div className="absolute inset-0 bg-[#FFEB3B] rounded-[3rem] transform rotate-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-white flex flex-col items-center justify-center overflow-hidden">
            
            {/* Texto Superior: COMBO */}
            <h2 className="text-5xl sm:text-6xl font-black text-[#D50000] tracking-tighter transform -rotate-3 mt-4 drop-shadow-sm">
                {offer.title}
            </h2>

            {/* Cinta Roja: OFFER */}
            <div className="relative w-[120%] bg-[#D50000] py-2 sm:py-3 transform -rotate-3 shadow-lg my-2 flex justify-center items-center">
                 {/* Triángulos de la cinta (efecto doblado) */}
                 <div className="absolute left-0 top-0 h-full w-4 bg-[#8b0000] transform -skew-x-12 -translate-x-2 z-[-1]"></div>
                 <div className="absolute right-0 top-0 h-full w-4 bg-[#8b0000] transform skew-x-12 translate-x-2 z-[-1]"></div>
                 
                 <h2 className="text-5xl sm:text-6xl font-black text-white tracking-widest uppercase drop-shadow-md">
                    {offer.subtitle}
                 </h2>
            </div>

            {/* Nombre del Producto y Precio */}
            <div className="transform -rotate-3 text-center mt-2 px-4">
                <p className="text-gray-800 font-bold text-lg leading-tight mb-1">{offer.targetItemName}</p>
                <div className="bg-white text-black font-black text-2xl px-4 py-1 rounded-full shadow-sm inline-block border-2 border-black transform rotate-2">
                    {offer.displayPrice}
                </div>
            </div>

        </div>

        {/* Botón Flotante Inferior */}
        <div className="absolute -bottom-6 left-0 right-0 flex justify-center z-10">
            <button 
                onClick={onAddToCart}
                className="bg-[#D50000] text-white font-black text-xl px-8 py-3 rounded-full shadow-xl border-4 border-white hover:scale-105 active:scale-95 transition-transform"
            >
                LO QUIERO
            </button>
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.5) rotate(-10deg); }
          60% { opacity: 1; transform: scale(1.1) rotate(5deg); }
          80% { transform: scale(0.95) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        .animate-popIn {
          animation: popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default PromoModal;
