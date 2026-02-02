
import React, { useState } from 'react';
import { MenuItem, ModifierGroup, ModifierAssignment } from '../types';

interface MenuItemFormModalProps {
  initialData?: MenuItem;
  allModifierGroups: ModifierGroup[];
  onSubmit: (item: MenuItem) => void;
  onClose: () => void;
}

const MenuItemFormModal: React.FC<MenuItemFormModalProps> = ({ initialData, allModifierGroups, onSubmit, onClose }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [price, setPrice] = useState(initialData?.price || 0);
  const [description, setDescription] = useState(initialData?.description || '');
  // Initialize state by mapping modifierGroupTitles (which can be string | ModifierAssignment) to a simple string array of unique group titles.
  const [selectedGroupTitles, setSelectedGroupTitles] = useState<string[]>(() => {
    if (!initialData?.modifierGroupTitles) {
      return [];
    }
    const titles = initialData.modifierGroupTitles.map(g => (typeof g === 'string' ? g : g.group));
    return [...new Set(titles)];
  });

  const handleToggleGroup = (title: string) => {
    setSelectedGroupTitles(prev => 
      prev.includes(title) 
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price < 0) return;

    // Build a map of original assignments from the initial data, keyed by their group title.
    // This preserves the complex {group, label} structure for combos.
    const originalAssignmentsMap = new Map<string, (string | ModifierAssignment)[]>();
    if (initialData?.modifierGroupTitles) {
        for (const assignment of initialData.modifierGroupTitles) {
            const groupTitle = typeof assignment === 'string' ? assignment : assignment.group;
            if (!originalAssignmentsMap.has(groupTitle)) {
                originalAssignmentsMap.set(groupTitle, []);
            }
            originalAssignmentsMap.get(groupTitle)!.push(assignment);
        }
    }

    // Now, construct the new list based on what's currently checked in the UI (`selectedGroupTitles`).
    const finalModifierGroups = selectedGroupTitles.flatMap(title => {
        // If the checked group existed in the original item, use its original structure.
        // This correctly handles combos with multiple assignments for the same group title.
        if (originalAssignmentsMap.has(title)) {
            return originalAssignmentsMap.get(title)!;
        }
        // If it's a newly checked group, just add it as a simple string.
        return title;
    });

    onSubmit({
        name: name.trim(),
        price: Number(price),
        description: description.trim(),
        available: initialData?.available ?? true,
        modifierGroupTitles: finalModifierGroups,
    });
  };


  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8 w-full max-w-lg max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex-shrink-0">{initialData ? 'Editar Producto' : 'Agregar Nuevo Producto'}</h2>
        <form className="space-y-6 overflow-y-auto pr-2 flex-grow" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="item-name" className="block text-sm font-medium text-gray-700">
              Nombre del Producto
            </label>
            <input
              id="item-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 mt-1 text-black bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-color)] focus:border-[var(--brand-color)]"
              required
            />
          </div>
          <div>
            <label htmlFor="item-price" className="block text-sm font-medium text-gray-700">
              Precio
            </label>
            <input
              id="item-price"
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full px-4 py-3 mt-1 text-black bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-color)] focus:border-[var(--brand-color)]"
              required
              min="0"
              step="0.01"
            />
          </div>
           <div>
            <label htmlFor="item-description" className="block text-sm font-medium text-gray-700">
              Descripción (Opcional)
            </label>
            <textarea
              id="item-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 mt-1 text-black bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-color)] focus:border-[var(--brand-color)]"
              placeholder="Ej: (tostones, queso, ensalada...)"
              rows={3}
            />
          </div>
          
          {/* Modifier Group Assignment */}
          {allModifierGroups.length > 0 && (
            <div>
                <h3 className="text-md font-medium text-gray-700 border-b border-gray-200 pb-2 mb-3">Asignar Grupos de Modificadores</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {allModifierGroups.map(group => (
                        <label key={group.title} className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                            <input 
                                type="checkbox"
                                checked={selectedGroupTitles.includes(group.title)}
                                onChange={() => handleToggleGroup(group.title)}
                                className="h-5 w-5 rounded text-[var(--brand-color)] border-gray-300 focus:ring-[var(--brand-color)]"
                            />
                            <span className="ml-3 text-sm font-medium text-gray-800">{group.title}</span>
                        </label>
                    ))}
                </div>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200 flex-shrink-0">
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
              {initialData ? 'Guardar Cambios' : 'Agregar Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuItemFormModal;
