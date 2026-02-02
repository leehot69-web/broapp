import React, { useState } from 'react';
import { Table } from '../types';

interface MoveTableModalProps {
  sourceTable: Table;
  // Fix: The `allTables` prop should be an array of `Table` objects.
  allTables: Table[];
  totalTables: number;
  onClose: () => void;
  onMoveTable: (sourceTable: Table, destinationTableNumber: number) => void;
  onCombineTables: (sourceTable: Table, destinationTableNumber: number) => void;
}

const MoveTableModal: React.FC<MoveTableModalProps> = ({
  sourceTable,
  allTables,
  totalTables,
  onClose,
  onMoveTable,
  onCombineTables,
}) => {
  const [selectedDestination, setSelectedDestination] = useState<number | null>(null);

  const getTableStatus = (tableNumber: number) => {
    const table = allTables.find(t => t.number === tableNumber);
    return table ? table.status : 'disponible';
  };

  const destinationStatus = selectedDestination ? getTableStatus(selectedDestination) : null;
  const destinationTable = selectedDestination ? allTables.find(t => t.number === selectedDestination) : null;
  const canCombine = destinationTable && (destinationTable.status === 'borrador' || destinationTable.status === 'no pagada');

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6 w-full max-w-md max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-[var(--brand-color)] mb-2">Mover / Combinar Mesa {sourceTable.number}</h2>
        <p className="text-gray-500 mb-4 text-sm">Selecciona una mesa de destino.</p>

        <div className="flex-grow overflow-y-auto pr-2">
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3">
            {Array.from({ length: totalTables }, (_, i) => i + 1).map(tableNumber => {
              if (tableNumber === sourceTable.number) return null; // Can't select self

              const status = getTableStatus(tableNumber);
              const isSelected = selectedDestination === tableNumber;

              let buttonClass = 'bg-white border-gray-300 text-gray-800 hover:bg-gray-100';
              if (status === 'borrador' || status === 'no pagada') {
                  buttonClass = 'bg-red-100 border-red-300 text-red-800 hover:bg-red-200';
              }
               if (isSelected) {
                buttonClass = 'bg-[var(--brand-color)] border-[var(--brand-color-dark)] text-white scale-105 shadow-lg';
              }
              
              return (
                <button
                  key={tableNumber}
                  onClick={() => setSelectedDestination(tableNumber)}
                  className={`relative flex items-center justify-center aspect-square rounded-lg text-xl sm:text-2xl font-bold transition-all border ${buttonClass}`}
                >
                  {tableNumber}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => onMoveTable(sourceTable, selectedDestination!)}
            disabled={!selectedDestination || destinationStatus !== 'disponible'}
            title={destinationStatus && destinationStatus !== 'disponible' ? 'Solo se puede mover a una mesa disponible.' : ''}
            className="w-full py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Mover a Mesa {selectedDestination || ''}
          </button>
          <button
            onClick={() => onCombineTables(sourceTable, selectedDestination!)}
            disabled={!selectedDestination || !canCombine}
            title={!canCombine ? 'Solo se puede combinar con una mesa que ya está en servicio.' : ''}
            className="w-full py-3 font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Combinar con Mesa {selectedDestination || ''}
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 font-bold text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveTableModal;