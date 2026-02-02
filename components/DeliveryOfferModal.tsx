
import React from 'react';

interface DeliveryOfferModalProps {
  onClose: () => void; // To go back to menu
  onContinueToCheckout: () => void; // To proceed anyway
}

const DeliveryOfferModal: React.FC<DeliveryOfferModalProps> = ({ onClose, onContinueToCheckout }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[80] p-4 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl animate-pulse">💡</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800">¡Aprovecha nuestra oferta!</h2>
          <p className="mt-2 text-gray-600">
            Delivery a todo Maracaibo por solo <span className="font-bold text-[var(--brand-color)]">$1</span> con una compra mínima de <span className="font-bold">$15</span>.
          </p>
          <p className="text-xs text-gray-500 mt-1">(Válido de Lunes a Jueves)</p>
        </div>
        <div className="p-4 bg-gray-50 grid grid-cols-2 gap-3">
          <button 
            onClick={onClose} 
            className="py-3 text-gray-700 font-bold bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Seguir Comprando
          </button>
          <button 
            onClick={onContinueToCheckout} 
            className="py-3 font-bold text-white bg-[var(--brand-color)] rounded-xl hover:bg-[var(--brand-color-dark)] transition-colors"
          >
            Pagar Ahora
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryOfferModal;