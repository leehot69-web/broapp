
import React, { useState } from 'react';
import { ModifierGroup, ModifierOption } from '../types';

interface ModifierGroupFormModalProps {
  initialData?: ModifierGroup | null;
  existingGroups: ModifierGroup[];
  onSubmit: (group: ModifierGroup) => void;
  onClose: () => void;
}

const ModifierGroupFormModal: React.FC<ModifierGroupFormModalProps> = ({ initialData, existingGroups, onSubmit, onClose }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [selectionType, setSelectionType] = useState<'single' | 'multiple'>(initialData?.selectionType || 'multiple');
  const [minSelection, setMinSelection] = useState(initialData?.minSelection || 0);
  const [maxSelection, setMaxSelection] = useState(initialData?.maxSelection || 1);
  const [options, setOptions] = useState<ModifierOption[]>(initialData?.options || [{ name: '', price: 0 }]);
  const [freeSelectionCount, setFreeSelectionCount] = useState<number>(initialData?.freeSelectionCount ?? 0);
  const [extraPrice, setExtraPrice] = useState<number>(initialData?.extraPrice ?? 0);
  const [error, setError] = useState('');

  const handleOptionChange = (index: number, field: 'name' | 'price', value: string | number) => {
    const newOptions = [...options];
    // Ensure price is always a number
    if (field === 'price') {
      newOptions[index][field] = Number(value) || 0;
    } else {
      newOptions[index][field] = String(value);
    }
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, { name: '', price: 0 }]);
  };

  const removeOption = (index: number) => {
    if (options.length > 1) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('El título no puede estar vacío.');
      return;
    }
    if (trimmedTitle.toLowerCase() !== initialData?.title.toLowerCase() && existingGroups.some(g => g.title.toLowerCase() === trimmedTitle.toLowerCase())) {
        setError('Ya existe un grupo con este título.');
        return;
    }

    const finalMin = selectionType === 'single' ? Math.min(minSelection, 1) : minSelection;
    const finalMax = selectionType === 'single' ? 1 : maxSelection;

    const finalGroup: ModifierGroup = {
      title: trimmedTitle,
      selectionType,
      minSelection: finalMin,
      maxSelection: finalMax,
      options: options.filter(opt => opt.name.trim() !== ''),
      freeSelectionCount: selectionType === 'multiple' && freeSelectionCount > 0 ? freeSelectionCount : undefined,
      extraPrice: selectionType === 'multiple' && extraPrice > 0 ? extraPrice : undefined,
    };
    onSubmit(finalGroup);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex-shrink-0">{initialData ? 'Editar Grupo' : 'Nuevo Grupo de Modificadores'}</h2>
        
        <form className="flex-grow overflow-y-auto pr-2 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="group-title" className="block text-sm font-medium text-gray-700">Título del Grupo</label>
            <input id="group-title" type="text" value={title} onChange={e => {setTitle(e.target.value); setError('');}} className="input-style mt-1" required />
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo de Selección</label>
              <select value={selectionType} onChange={e => setSelectionType(e.target.value as 'single' | 'multiple')} className="input-style mt-1">
                <option value="multiple">Múltiple</option>
                <option value="single">Única</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mínimo</label>
              <input type="number" value={minSelection} onChange={e => setMinSelection(Number(e.target.value))} className="input-style mt-1" min="0" disabled={selectionType === 'single'} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Máximo</label>
              <input type="number" value={maxSelection} onChange={e => setMaxSelection(Number(e.target.value))} className="input-style mt-1" min="1" disabled={selectionType === 'single'} />
            </div>
          </div>

          {selectionType === 'multiple' && (
            <div className="p-4 bg-gray-100 rounded-lg border border-gray-200">
              <h4 className="text-sm font-bold text-gray-600 mb-3">Configuración de Precio Adicional</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Selecciones Gratuitas</label>
                  <input 
                    type="number" 
                    value={freeSelectionCount} 
                    onChange={e => setFreeSelectionCount(Number(e.target.value))} 
                    className="input-style mt-1" 
                    min="0" 
                    placeholder="Ej: 1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Número de opciones sin costo.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Precio por Extra ($)</label>
                  <input 
                    type="number" 
                    value={extraPrice} 
                    onChange={e => setExtraPrice(Number(e.target.value))} 
                    className="input-style mt-1" 
                    min="0"
                    step="0.01"
                    placeholder="Ej: 3.00"
                  />
                   <p className="text-xs text-gray-500 mt-1">Costo por cada opción extra.</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-md font-medium text-gray-700 border-b border-gray-200 pb-2 mb-3">Opciones</h3>
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input type="text" placeholder="Nombre de la opción" value={option.name} onChange={e => handleOptionChange(index, 'name', e.target.value)} className="input-style flex-grow" />
                  <input type="number" placeholder="Precio" value={option.price} onChange={e => handleOptionChange(index, 'price', e.target.value)} className="input-style w-28" step="0.01" />
                  <button type="button" onClick={() => removeOption(index)} disabled={options.length <= 1} className="text-gray-400 hover:text-red-500 disabled:text-gray-300 disabled:cursor-not-allowed p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addOption} className="mt-4 w-full py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">+ Agregar Opción</button>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200 flex-shrink-0">
            <button type="button" onClick={onClose} className="w-full py-3 font-bold text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
            <button type="submit" className="w-full py-3 font-bold text-white bg-[var(--brand-color)] rounded-lg hover:bg-[var(--brand-color-dark)] transition-colors">
              {initialData ? 'Guardar Cambios' : 'Crear Grupo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModifierGroupFormModal;
