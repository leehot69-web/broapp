
import React from 'react';
import { CartItem, CustomerDetails } from '../types';

interface CheckoutScreenProps {
    cart: CartItem[];
    customerDetails: CustomerDetails;
    paymentMethods: string[];
    onUpdateDetails: (details: CustomerDetails | ((prev: CustomerDetails) => CustomerDetails)) => void;
    onBack: () => void;
    onSubmitOrder: () => void;
    onEditUserDetails: () => void;
    onClearCart?: () => void;
    activeRate: number;
    isEditing?: boolean;
}

const CheckoutScreen: React.FC<CheckoutScreenProps> = ({
    cart, customerDetails, paymentMethods, onUpdateDetails, onBack, onSubmitOrder, onEditUserDetails, onClearCart, activeRate, isEditing = false
}) => {

    const cartTotal = cart.reduce((acc, item) => {
        const pizzaModPrice = item.pizzaConfig ? item.pizzaConfig.ingredients.reduce((acc, sel) => acc + (sel.ingredient.prices[item.pizzaConfig!.size] / (sel.half === 'full' ? 1 : 2)), 0) : 0;
        const traditionalModsPrice = item.selectedModifiers.reduce((s, m) => s + m.option.price, 0);
        return acc + ((item.price + pizzaModPrice + traditionalModsPrice) * item.quantity);
    }, 0);

    const total = cartTotal;

    const handleChange = (field: keyof CustomerDetails, value: any) => {
        onUpdateDetails(prev => ({ ...prev, [field]: value }));
    };

    const isFormComplete = customerDetails.name.trim() !== '';

    return (
        <div className="flex flex-col h-full bg-black overflow-hidden theme-bro">
            <header className="p-6 bg-black/50 backdrop-blur-xl shadow-2xl flex-shrink-0 z-20 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center">
                    <button onClick={onBack} className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 text-gray-400 active:scale-90 border border-white/10 mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-black text-white leading-none uppercase italic tracking-tighter bro-gradient-text pr-2">{isEditing ? 'Cobrar Cuenta' : 'Finalizar Pedido'}</h1>
                        {isEditing && <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest mt-1 opacity-80">Cerrando cuenta pendiente</span>}
                    </div>
                </div>

                {isEditing && onClearCart && (
                    <button
                        onClick={onClearCart}
                        className="bg-amber-500/10 text-amber-500 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-amber-500/20 active:scale-90 transition-all shadow-lg"
                    >
                        Abandonar
                    </button>
                )}
            </header>

            <div className="flex-grow overflow-y-auto p-6 space-y-8 py-8 scrollbar-hide">
                <div className="bg-card p-8 rounded-[2rem] shadow-2xl border border-white/5 space-y-6 bro-paper-card relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-bl-[100%] pointer-events-none"></div>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand border border-brand/20 shadow-inner">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </div>
                        <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Identificación</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2 ml-1">Referencia o Mesa <span className="text-brand">*</span></label>
                            <input
                                type="text"
                                value={customerDetails.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="w-full p-5 bg-black/40 border border-white/10 text-white rounded-[22px] focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all font-black text-lg placeholder:text-gray-800"
                                placeholder="Ej: Mesa 5 o Nombre"
                                readOnly={isEditing}
                            />
                            {isEditing && <p className="text-[10px] text-amber-500 mt-2 italic font-medium">La referencia no se puede cambiar al cobrar.</p>}
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2 ml-1">Nota del Pedido (Opcional)</label>
                            <textarea
                                value={customerDetails.instructions || ''}
                                onChange={(e) => handleChange('instructions', e.target.value)}
                                className="w-full p-5 bg-black/40 border border-white/10 text-white rounded-[22px] focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all font-medium text-sm placeholder:text-gray-800 resize-none h-24"
                                placeholder="Ej: Sin pepinillos, cuenta dividida..."
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-card p-8 rounded-[2rem] shadow-2xl border border-white/5 space-y-6 bro-paper-card relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-bl-[100%] pointer-events-none"></div>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20 shadow-inner">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                        </div>
                        <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Método de Pago</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {paymentMethods.map(method => (
                            <button
                                key={method}
                                onClick={() => handleChange('paymentMethod', method)}
                                className={`p-5 rounded-[22px] border text-[10px] font-black uppercase tracking-widest transition-all ${customerDetails.paymentMethod === method
                                    ? 'bg-brand text-black border-brand shadow-xl shadow-brand/20 scale-[1.02]'
                                    : 'bg-black/40 text-gray-400 border-white/10 hover:bg-white/5 active:scale-95'
                                    }`}
                            >
                                {method}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-black/60 backdrop-blur-3xl p-8 shadow-[0_-20px_60px_rgba(0,0,0,0.8)] z-20 flex-shrink-0 border-t border-white/10 rounded-t-[2.5rem]">
                <div className="flex justify-between items-center mb-8 px-2">
                    <span className="text-gray-500 font-black uppercase tracking-[0.3em] text-[10px]">A Cobrar</span>
                    <div className="text-right">
                        <span className="font-black text-4xl text-white leading-none tracking-tighter bro-gradient-text italic">${total.toFixed(2)}</span>
                        <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest mt-1">Bs. {(total * activeRate).toFixed(2)}</p>
                    </div>
                </div>

                <button
                    onClick={onSubmitOrder}
                    disabled={!isFormComplete}
                    className={`w-full h-16 rounded-[22px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl flex items-center justify-center gap-3 transition-all border-b-4 ${isFormComplete
                        ? 'bg-brand text-black border-black/20 shadow-brand/10 active:scale-95'
                        : 'bg-white/5 text-gray-700 border-white/5 cursor-not-allowed opacity-50'
                        }`}
                >
                    <span>{isEditing ? 'PROCESAR COBRO' : 'Confirmar Pedido'}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
            </div>
        </div>
    );
};

export default CheckoutScreen;
