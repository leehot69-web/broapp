
import React from 'react';
import { MenuItem } from '../types';

interface DrinkSuggestionModalProps {
  drinks: MenuItem[];
  onAddDrink: (item: MenuItem) => void;
  onClose: () => void;
  onContinue: () => void;
}

const DrinkSuggestionModal: React.FC<DrinkSuggestionModalProps> = ({ drinks, onAddDrink, onClose, onContinue }) => {
  const [addedDrinks, setAddedDrinks] = React.useState<string[]>([]);

  const handleAdd = (item: MenuItem) => {
    onAddDrink(item);
    setAddedDrinks(prev => [...prev, item.name]);
    // Optional feedback
    if (navigator.vibrate) navigator.vibrate(50);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[80] p-4 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[var(--brand-color)] p-6 text-white text-center relative">
             <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
             </button>
             <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 backdrop-blur-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
             </div>
             <h2 className="text-2xl font-bold leading-none">¿Deseas algo de tomar?</h2>
             <p className="text-white/90 text-sm mt-2">¡Completa tu pedido con una bebida refrescante!</p>
        </div>

        {/* Drink Grid */}
        <div className="flex-grow overflow-y-auto p-4 bg-gray-50">
            <div className="grid grid-cols-2 gap-3">
                {drinks.map(drink => {
                    const count = addedDrinks.filter(n => n === drink.name).length;
                    return (
                        <button 
                            key={drink.name}
                            onClick={() => handleAdd(drink)}
                            className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-left flex flex-col relative group active:scale-95"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-gray-800 text-sm leading-tight">{drink.name}</span>
                                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">Bs.{drink.price}</span>
                            </div>
                             {drink.description && <p className="text-xs text-gray-400 mb-2">{drink.description}</p>}
                            
                            <div className="mt-auto flex justify-center">
                                <span className="text-[var(--brand-color)] font-bold text-sm bg-red-50 px-4 py-1 rounded-full group-hover:bg-[var(--brand-color)] group-hover:text-white transition-colors">
                                    + Agregar
                                </span>
                            </div>

                            {count > 0 && (
                                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md animate-bounce">
                                    {count}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-white">
            {addedDrinks.length > 0 ? (
                 <button 
                    onClick={onContinue}
                    className="w-full py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                    <span>Continuar al Pago</span>
                    <span className="bg-white/20 px-2 py-0.5 rounded text-sm">{addedDrinks.length} agregadas</span>
                </button>
            ) : (
                <button 
                    onClick={onContinue}
                    className="w-full py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors"
                >
                    No gracias, continuar sin bebida
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default DrinkSuggestionModal;
