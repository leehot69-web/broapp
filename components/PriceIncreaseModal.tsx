import React, { useState } from 'react';
import { StoreProfile } from '../types';

interface PriceIncreaseModalProps {
  storeProfile: StoreProfile;
  onClose: () => void;
  onConfirm: (percentage: number, category: string) => void;
}

const PriceIncreaseModal: React.FC<PriceIncreaseModalProps> = ({ storeProfile, onClose, onConfirm }) => {
  const [percentage, setPercentage] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (percentage === 0) return;
    onConfirm(percentage, selectedCategory);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Aumento de Precios (%)</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="percentage" className="block text-sm font-medium text-gray-700">Porcentaje de Aumento</label>
            <input
              id="percentage"
              type="number"
              value={percentage}
              onChange={e => setPercentage(parseFloat(e.target.value) || 0)}
              className="input-style mt-1"
              placeholder="Ej: 15"
              step="0.1"
              required
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Aplicar a</label>
            <select
              id="category"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="input-style mt-1"
            >
              <option value="all">Todo el Menú</option>
              {storeProfile.menu.map(cat => (
                <option key={cat.title} value={cat.title}>{cat.title}</option>
              ))}
            </select>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="w-full py-3 font-bold text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300">Cancelar</button>
            <button type="submit" className="w-full py-3 font-bold text-white bg-[var(--brand-color)] rounded-lg hover:bg-[var(--brand-color-dark)] disabled:bg-gray-400" disabled={percentage === 0}>
              Aplicar Aumento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PriceIncreaseModal;
