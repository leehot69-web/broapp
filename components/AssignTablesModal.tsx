import React, { useState } from 'react';

interface AssignTablesModalProps {
  totalTables: number;
  assignedTables: number[];
  onSave: (assignedTables: number[]) => void;
  onClose: () => void;
  activeTableNumbers: number[];
}

const AssignTablesModal: React.FC<AssignTablesModalProps> = ({ totalTables, assignedTables, onSave, onClose, activeTableNumbers }) => {
  const [selectedTables, setSelectedTables] = useState<number[]>(assignedTables);

  const toggleTable = (tableNumber: number) => {
    setSelectedTables(prev =>
      prev.includes(tableNumber)
        ? prev.filter(n => n !== tableNumber)
        : [...prev, tableNumber]
    );
  };

  const handleSave = () => {
    onSave(selectedTables);
    onClose();
  };

  const handleSelectAll = () => {
    // First, find any tables that are active AND assigned to the current waiter. These cannot be changed.
    const lockedForThisWaiter = assignedTables.filter(num => activeTableNumbers.includes(num));
    
    // Next, find all tables that are not active at all and can be freely selected.
    const allSelectableTables = Array.from({ length: totalTables }, (_, i) => i + 1)
                                     .filter(num => !activeTableNumbers.includes(num));

    // The new selection is the combination of all free tables plus the waiter's own locked tables.
    // A Set is used to prevent any duplicates.
    setSelectedTables(Array.from(new Set([...allSelectableTables, ...lockedForThisWaiter])));
  }
  
  const handleClearAll = () => {
     // When clearing, we must still keep any tables that are active and assigned to this waiter.
    const lockedForThisWaiter = assignedTables.filter(num => activeTableNumbers.includes(num));
    setSelectedTables(lockedForThisWaiter);
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6 w-full max-w-md max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Asignar Mis Mesas</h2>
        <p className="text-gray-500 mb-4 text-sm">Selecciona las mesas que atenderás. Las mesas en uso (con candado) no se pueden modificar.</p>
        
        <div className="flex gap-2 sm:gap-4 mb-4">
            <button onClick={handleSelectAll} className="flex-1 px-4 py-2 text-sm font-medium text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">
                Todas
            </button>
            <button onClick={handleClearAll} className="flex-1 px-4 py-2 text-sm font-medium text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">
                Limpiar
            </button>
        </div>
        
        <div className="flex-grow overflow-y-auto pr-2">
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3">
            {Array.from({ length: totalTables }, (_, i) => i + 1).map(tableNumber => {
                const isSelected = selectedTables.includes(tableNumber);
                // A table is considered active (locked) if it's in the active list.
                const isActive = activeTableNumbers.includes(tableNumber);
                // A table can only be modified if it's not active OR if it is active but NOT assigned to the current waiter.
                // However, the most protective rule is simply: if it's active, it's locked.
                const isDisabled = isActive;

                return (
                <button
                    key={tableNumber}
                    onClick={() => toggleTable(tableNumber)}
                    disabled={isDisabled}
                    title={isDisabled ? "Esta mesa está en uso y no puede ser modificada." : `Asignar/Quitar Mesa ${tableNumber}`}
                    className={`relative flex items-center justify-center aspect-square rounded-lg text-xl sm:text-2xl font-bold transition-all border
                    ${
                      isDisabled
                        ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'
                        : isSelected
                          ? 'bg-[var(--brand-color)] border-red-500 text-white scale-105 shadow-lg'
                          : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-100'
                    }`}
                >
                    {tableNumber}
                    {isDisabled && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute bottom-1 right-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    )}
                </button>
                );
            })}
            </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full sm:w-auto flex-1 py-3 font-bold text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="w-full sm:w-auto flex-1 py-3 font-bold text-white bg-[var(--brand-color)] rounded-lg hover:bg-[var(--brand-color-dark)] transition-colors"
          >
            Guardar ({selectedTables.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignTablesModal;