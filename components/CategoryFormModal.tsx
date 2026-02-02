import React, { useState } from 'react';

interface CategoryFormModalProps {
  initialName?: string;
  existingCategories: string[];
  onSubmit: (name: string) => void;
  onClose: () => void;
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({ initialName = '', existingCategories, onSubmit, onClose }) => {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('El nombre no puede estar vacío.');
      return;
    }
    // Check for duplicates, ignoring the initial name if editing
    if (trimmedName.toLowerCase() !== initialName.toLowerCase() && existingCategories.some(cat => cat.toLowerCase() === trimmedName.toLowerCase())) {
      setError('Ya existe una categoría con este nombre.');
      return;
    }
    onSubmit(trimmedName);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-[var(--brand-color)] mb-6">{initialName ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="category-name" className="block text-sm font-medium text-gray-700">
              Nombre de la Categoría
            </label>
            <input
              id="category-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-3 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-[var(--brand-color)] focus:border-[var(--brand-color)]"
              required
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
              {initialName ? 'Guardar Cambios' : 'Crear Categoría'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryFormModal;