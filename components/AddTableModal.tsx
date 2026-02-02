import React, { useState } from 'react';

interface AddTableModalProps {
  onClose: () => void;
  onSave: (newNumber: number) => void;
  existingTableNumbers: number[];
}

const AddTableModal: React.FC<AddTableModalProps> = ({ onClose, onSave, existingTableNumbers }) => {
  const [tableNumber, setTableNumber] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(tableNumber, 10);
    
    if (isNaN(num) || num <= 0) {
      setError('Por favor, ingrese un número de mesa válido.');
      return;
    }
    
    // Use a Set for efficient lookup
    const existingSet = new Set(existingTableNumbers);
    if (existingSet.has(num)) {
      setError(`La mesa número ${num} ya existe.`);
      return;
    }

    onSave(num);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-[var(--brand-color)] mb-6">Agregar Nueva Mesa</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="table-number" className="block text-sm font-medium text-gray-700">
              Número de la Mesa
            </label>
            <input
              id="table-number"
              type="number"
              value={tableNumber}
              onChange={(e) => {
                setTableNumber(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-3 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-color)] focus:border-[var(--brand-color)]"
              placeholder="Ej: 25"
              autoFocus
              required
              min="1"
            />
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 font-bold text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full py-3 font-bold text-white bg-[var(--brand-color)] rounded-lg hover:bg-[var(--brand-color-dark)] transition-colors"
            >
              Guardar Mesa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTableModal;
