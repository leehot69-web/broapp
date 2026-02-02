
import React from 'react';
import { CartItem, CustomerDetails } from '../types';

interface SuccessScreenProps {
  cart: CartItem[];
  customerDetails: CustomerDetails;
  onStartNewOrder: () => void;
  onReprint: () => void;
  isPrinterConnected: boolean;
  activeRate: number;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({
  cart,
  customerDetails,
  onStartNewOrder,
  onReprint,
  isPrinterConnected,
  activeRate
}) => {
  const total = cart.reduce((acc, item) => {
    const pizzaModPrice = item.pizzaConfig ? item.pizzaConfig.ingredients.reduce((acc, sel) => acc + (sel.ingredient.prices[item.pizzaConfig!.size] / (sel.half === 'full' ? 1 : 2)), 0) : 0;
    const traditionalModsPrice = item.selectedModifiers.reduce((s, m) => s + m.option.price, 0);
    return acc + ((item.price + pizzaModPrice + traditionalModsPrice) * item.quantity);
  }, 0);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-black p-6 text-center theme-bro">
      <div className="w-24 h-24 bg-brand/10 border border-brand/20 rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(255,215,0,0.2)]">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-3xl font-black text-white mb-4 uppercase italic tracking-tighter bro-gradient-text">¡Venta Registrada!</h2>
      <p className="text-gray-500 mb-10 text-sm max-w-sm tracking-tight leading-relaxed font-medium">La transacción se ha procesado correctamente en el sistema de BRO. El ticket ha sido generado.</p>

      {/* Order Summary */}
      <div className="w-full max-w-sm bg-card p-6 rounded-3xl border border-white/10 shadow-2xl mb-10 text-left bro-paper-card">
        <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] mb-4">Resumen de Venta</h3>
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-black text-white/50 uppercase tracking-tight">Referencia:</span>
          <span className="text-lg font-black text-white tracking-tight uppercase italic">{customerDetails.name}</span>
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-white/5">
          <span className="text-base font-black text-white/50 uppercase tracking-tight">Total:</span>
          <div className="text-right">
            <span className="text-3xl font-black text-brand tracking-tighter bro-gradient-text">${total.toFixed(2)}</span>
            <p className="text-sm font-bold text-gray-500 uppercase">Bs. {(total * activeRate).toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <button
          onClick={onStartNewOrder}
          className="w-full py-5 bg-brand text-black rounded-2xl font-black uppercase shadow-xl tracking-[0.2em] transform active:scale-95 transition-all border-b-4 border-black/20"
        >
          Nuevo Pedido
        </button>
        <button
          onClick={onReprint}
          disabled={!isPrinterConnected}
          className="w-full py-4 bg-white/5 text-white/50 rounded-2xl font-black uppercase tracking-widest transform active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-white/5"
          title={!isPrinterConnected ? "Conecta una impresora para re-imprimir" : "Re-imprimir recibo"}
        >
          Re-imprimir Recibo
        </button>
      </div>
    </div>
  );
};

export default SuccessScreen;
