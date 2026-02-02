import React from 'react';

interface SecondWhatsAppModalProps {
  isOpen: boolean;
  recipient: string;
  onClose: () => void;
  onConfirm: () => void;
}

const SecondWhatsAppModal: React.FC<SecondWhatsAppModalProps> = ({ isOpen, recipient, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V8z" />
                </svg>
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-grow">
                <h3 className="text-lg leading-6 font-bold text-gray-900" id="modal-title">
                    Enviar Copia
                </h3>
                <div className="mt-2">
                    <p className="text-sm text-gray-500">
                        El primer mensaje fue enviado. ¿Desea enviar una copia a <span className="font-semibold">{recipient}</span>?
                    </p>
                </div>
            </div>
        </div>
        <div className="mt-5 sm:mt-4 flex flex-col sm:flex-row-reverse gap-3">
          <button
            onClick={onConfirm}
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
          >
            Enviar Copia
          </button>
          <button
            onClick={onClose}
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm"
          >
            No, gracias
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecondWhatsAppModal;
