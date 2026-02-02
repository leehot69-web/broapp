import React from 'react';
import { Table, OrderItem } from '../types';

interface ConfirmCancelModalProps {
  table: Table;
  itemToCancel?: OrderItem;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmCancelModal: React.FC<ConfirmCancelModalProps> = ({ table, itemToCancel, onClose, onConfirm }) => {
  if (!itemToCancel) return null;

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
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-grow">
                <h3 className="text-lg leading-6 font-bold text-gray-900" id="modal-title">
                    Cancelar Producto
                </h3>
                <div className="mt-2">
                    <p className="text-sm text-gray-500">
                        Se enviará una alerta a cocina para detener la preparación de:
                    </p>
                    <p className="font-semibold text-gray-700 mt-2">
                        {itemToCancel.quantity}x {itemToCancel.name}
                    </p>
                    <p className="text-sm text-gray-600 font-bold mt-4">
                        ¿Estás seguro? Esta acción no se puede deshacer.
                    </p>
                </div>
            </div>
        </div>
        <div className="mt-5 sm:mt-4 flex flex-col sm:flex-row-reverse gap-3">
          <button
            onClick={onConfirm}
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto sm:text-sm"
          >
            Sí, Cancelar
          </button>
          <button
            onClick={onClose}
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmCancelModal;
