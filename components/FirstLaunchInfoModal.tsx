import React from 'react';

interface FirstLaunchInfoModalProps {
  onClose: () => void;
}

const FirstLaunchInfoModal: React.FC<FirstLaunchInfoModalProps> = ({ onClose }) => {
  return (
    <>
      <style>{`
        @keyframes slideInUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slideInUp {
          animation: slideInUp 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
      <div
        className="fixed inset-0 bg-black bg-opacity-60 flex items-end justify-center z-50 p-4"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
      >
        <div
          className="bg-white rounded-t-2xl shadow-xl w-full max-w-2xl mx-auto p-6 sm:p-8 text-center animate-slideInUp"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary-color)] mb-4">¡Bienvenido a Notapp!</h2>
          <p className="text-[var(--text-secondary-color)] mb-6 max-w-lg mx-auto">
            Para comenzar, ve a <span className="font-bold text-[var(--text-primary-color)]">Ajustes</span> para configurar la información de tu negocio, como el número de WhatsApp de la cocina y el nombre del restaurante.
          </p>
          <button
            onClick={onClose}
            className="w-full max-w-xs mx-auto py-3 font-bold text-white bg-[var(--brand-color)] rounded-lg hover:bg-[var(--brand-color-dark)] transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </>
  );
};

export default FirstLaunchInfoModal;