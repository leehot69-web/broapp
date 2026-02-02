
import React from 'react';
import { CartItem, Table, AppSettings, OrderItem, ModifierGroup, MenuCategory } from '../types';

interface CartScreenProps {
    // Delivery Mode Props
    cart?: CartItem[];
    onUpdateQuantity: (id: string, qty: number) => void;
    onRemoveItem: (id: string) => void;
    onClearCart?: () => void;
    onBackToMenu: () => void;
    onGoToCheckout?: () => void;
    onEditItem: (id: string) => void;
    menu?: MenuCategory[];
    allModifierGroups?: ModifierGroup[];
    activeRate: number;
    isEditing?: boolean;

    // POS Mode Props
    table?: Table | null;
    waiter?: string;
    settings?: AppSettings;
    onOpenConfirmPayModal?: (table: Table) => void;
    onFreeTable?: (table: Table) => void;
    onOpenConfirmSendModal?: (table: Table) => void;
    onOpenMoveTableModal?: (table: Table) => void;
    onOpenPendingPaymentsModal?: () => void;
    onPrintComanda?: (table: Table) => void;
    isPrinterConnected?: boolean;
}

const CartScreen: React.FC<CartScreenProps> = (props) => {
    const { activeRate, isEditing = false } = props;
    const isPosMode = props.table !== undefined;

    // --- MODO DELIVERY / POS SIMPLE ---
    const { cart, onUpdateQuantity, onRemoveItem, onBackToMenu, onGoToCheckout, onEditItem, onClearCart } = props;
    if (!cart) return null;

    const total = cart.reduce((acc, item) => {
        const pizzaModPrice = item.pizzaConfig ? item.pizzaConfig.ingredients.reduce((acc, sel) => acc + (sel.ingredient.prices[item.pizzaConfig!.size] / (sel.half === 'full' ? 1 : 2)), 0) : 0;
        const traditionalModsPrice = item.selectedModifiers.reduce((s, m) => s + m.option.price, 0);
        return acc + ((item.price + pizzaModPrice + traditionalModsPrice) * item.quantity);
    }, 0);

    if (cart.length === 0) {
        return (
            <div className="flex flex-col h-full bg-black overflow-hidden theme-bro">
                <header className="p-6 flex items-center border-b border-white/5 flex-shrink-0 bg-black/50 backdrop-blur-xl">
                    <button onClick={onBackToMenu} className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 text-gray-400 active:scale-90 border border-white/10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <h1 className="ml-6 text-2xl font-black text-white uppercase italic tracking-tighter bro-gradient-text">Tu Orden</h1>
                </header>
                <div className="flex-grow flex flex-col items-center justify-center p-8 text-center bg-black relative">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.05)_0%,transparent_70%)]"></div>
                    <div className="w-40 h-40 bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-8 border border-white/5 shadow-2xl animate-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    </div>
                    <h2 className="text-3xl font-black text-white mb-3 uppercase italic tracking-tighter">Carrito vacío</h2>
                    <p className="text-gray-500 mb-10 text-[10px] font-black uppercase tracking-[0.3em] opacity-70">¡Agrega algo delicioso para empezar!</p>
                    <button onClick={onBackToMenu} className="px-12 py-4 bg-brand text-black font-black uppercase tracking-widest rounded-2xl shadow-2xl active:scale-95 transition-all border-b-4 border-black/20">Ir al Menú</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-black overflow-hidden theme-bro">
            <header className="p-6 bg-black/50 backdrop-blur-xl shadow-2xl flex-shrink-0 z-20 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center">
                    <button onClick={onBackToMenu} className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 text-gray-400 active:scale-90 border border-white/10 mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-black text-white leading-none uppercase italic tracking-tighter bro-gradient-text pr-2">Tu Orden</h1>
                        {isEditing && <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest mt-1 opacity-80">Modificando Cuenta</span>}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {onClearCart && (
                        <button
                            type="button"
                            onClick={() => onClearCart()}
                            className={`h-12 flex items-center gap-2 px-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isEditing ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'} active:scale-90`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            {isEditing ? 'Abandonar' : 'Vaciar'}
                        </button>
                    )}
                </div>
            </header>

            <div className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-hide py-8">
                {cart.map(item => {
                    const pizzaModPrice = item.pizzaConfig ? item.pizzaConfig.ingredients.reduce((acc, sel) => acc + (sel.ingredient.prices[item.pizzaConfig!.size] / (sel.half === 'full' ? 1 : 2)), 0) : 0;
                    const traditionalModsPrice = item.selectedModifiers.reduce((s, m) => s + m.option.price, 0);
                    const unitPrice = item.price + pizzaModPrice + traditionalModsPrice;
                    const isOriginal = item.notes === 'original';

                    return (
                        <div key={item.id} className={`bg-card p-6 rounded-[2rem] shadow-2xl border ${isOriginal ? 'border-amber-500/20' : 'border-white/5'} flex flex-col bro-paper-card group relative overflow-hidden`}>
                            {isOriginal && (
                                <div className="absolute top-0 right-12 bg-amber-500 text-black text-[8px] font-black px-4 py-1 rounded-b-xl uppercase tracking-[0.2em] shadow-lg">Procesado</div>
                            )}

                            <div className="flex justify-between items-start mb-6">
                                <div className="max-w-[70%]">
                                    <h3
                                        className="font-black text-xl text-white leading-tight uppercase italic tracking-tighter group-hover:text-brand transition-colors cursor-pointer"
                                        onClick={() => !isOriginal && onEditItem(item.id)}
                                    >
                                        {item.name}
                                    </h3>

                                    {/* Pizza Details */}
                                    {item.pizzaConfig && (
                                        <div className="mt-3 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-black text-brand bg-brand/10 px-2 py-0.5 rounded-md uppercase tracking-widest border border-brand/20">
                                                    Tamaño {item.pizzaConfig.size}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {item.pizzaConfig.ingredients.map((sel, idx) => (
                                                    <span key={idx} className="text-[9px] font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/5 flex items-center gap-1">
                                                        <span className="text-brand opacity-60">
                                                            {sel.half === 'full' ? '●' : sel.half === 'left' ? '◐' : '◑'}
                                                        </span>
                                                        {sel.ingredient.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Traditional Modifiers */}
                                    {item.selectedModifiers.length > 0 && !item.pizzaConfig && (
                                        <p
                                            className="text-[10px] text-gray-400 mt-3 leading-relaxed cursor-pointer hover:text-white transition-colors"
                                            onClick={() => !isOriginal && onEditItem(item.id)}
                                        >
                                            <span className="text-brand opacity-50 font-black mr-1">+</span>
                                            {item.selectedModifiers.map(m => m.option.name).join(', ')}
                                        </p>
                                    )}

                                    {/* Traditional Modifiers for Pizza (Bordes, etc) */}
                                    {item.selectedModifiers.length > 0 && item.pizzaConfig && (
                                        <p className="text-[10px] text-gray-500 mt-2 italic">
                                            <span className="text-brand opacity-50 font-black mr-1">★</span>
                                            {item.selectedModifiers.map(m => m.option.name).join(', ')}
                                        </p>
                                    )}

                                    {item.specialInstructions && (
                                        <div className="mt-4 bg-brand/5 p-3 rounded-xl border border-brand/10">
                                            <p className="text-[10px] text-brand italic font-black uppercase tracking-widest leading-none mb-1 opacity-50">Nota Especial</p>
                                            <p className="text-[11px] text-white/80 font-medium italic">"{item.specialInstructions}"</p>
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-white leading-none text-2xl tracking-tighter">${(unitPrice * item.quantity).toFixed(2)}</p>
                                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">Bs. {((unitPrice * item.quantity) * activeRate).toFixed(2)}</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-auto pt-5 border-t border-white/5">
                                <div className="flex items-center gap-3">
                                    {!isOriginal && (
                                        <button onClick={() => onRemoveItem(item.id)} className="w-10 h-10 flex items-center justify-center bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 active:scale-90 transition-all">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    )}
                                    {!isOriginal && (
                                        <button onClick={() => onEditItem(item.id)} className="h-10 px-4 flex items-center gap-2 bg-white/5 text-gray-400 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest active:scale-90 transition-all hover:bg-white/10 hover:text-white">
                                            Editar
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 bg-black/40 rounded-2xl p-1.5 border border-white/5">
                                    {!isOriginal ? (
                                        <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl text-white font-black active:scale-90 transition-all border border-white/10 text-xl leading-none">−</button>
                                    ) : (
                                        <div className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl text-gray-700 border border-white/5">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                        </div>
                                    )}
                                    <span className="font-black text-white w-6 text-center text-lg">{item.quantity}</span>
                                    <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="w-10 h-10 flex items-center justify-center bg-brand rounded-xl text-black font-black active:scale-90 transition-all shadow-lg text-xl leading-none">+</button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="flex-shrink-0 bg-black/60 backdrop-blur-3xl p-8 shadow-[0_-20px_60px_rgba(0,0,0,0.8)] z-20 border-t border-white/10 rounded-t-[2.5rem]">
                <div className="flex justify-between items-center mb-8 px-2">
                    <span className="text-gray-500 font-black uppercase tracking-[0.3em] text-[10px]">Inversión Total</span>
                    <div className="text-right">
                        <span className="text-4xl font-black text-white leading-none tracking-tighter bro-gradient-text">${total.toFixed(2)}</span>
                        <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest mt-1">Bs. {(total * activeRate).toFixed(2)}</p>
                    </div>
                </div>

                {onGoToCheckout && (
                    <button
                        onClick={onGoToCheckout}
                        className={`w-full h-16 ${isEditing ? 'bg-green-600 shadow-green-900/20' : 'bg-brand shadow-brand/10'} text-black rounded-2xl font-black uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all flex justify-between px-10 items-center border-b-4 border-black/20 text-xs`}
                    >
                        <span>{isEditing ? 'Actualizar Orden' : 'Ir a Cobrar'}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                )}
            </div>
        </div>
    );
};

export default CartScreen;
