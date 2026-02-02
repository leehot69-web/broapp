
import React, { useState, useRef } from 'react';
import { MenuCategory, MenuItem, Table, CartItem, SelectedModifier, CustomerDetails } from '../types';

interface MenuScreenProps {
    menu: MenuCategory[];
    onAddItem: (item: MenuItem, selectedModifiers: SelectedModifier[], quantity: number) => void;
    onUpdateQuantity: (id: string, qty: number) => void;
    onRemoveItem: (id: string) => void;
    cart: CartItem[];
    onOpenModifierModal: (item: MenuItem) => void;
    onGoToCart: () => void;
    onClearCart?: () => void;
    cartItemCount?: number;
    businessName?: string;
    businessLogo?: string;
    triggerShake?: boolean;
    onInstallApp?: () => void;
    showInstallButton?: boolean;
    table?: Table | null;
    waiter?: string;
    onDeselectTable?: () => void;
    onOpenBarcodeScanner?: () => void;
    activeRate: number;
    isEditing?: boolean;
    customerDetails?: CustomerDetails;
}

const MenuScreen: React.FC<MenuScreenProps> = ({
    menu, cart, cartItemCount = 0, onAddItem, onUpdateQuantity, onRemoveItem,
    onOpenModifierModal, onGoToCart, onClearCart,
    businessName, businessLogo, triggerShake, table, waiter, onDeselectTable, onOpenBarcodeScanner,
    onInstallApp, showInstallButton, activeRate, isEditing = false, customerDetails
}) => {
    const [activeCategory, setActiveCategory] = useState<string | null>(menu[0]?.title || null);
    const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const scrollToCategory = (title: string) => {
        setActiveCategory(title);
        const element = categoryRefs.current[title];
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const isPosMode = table !== undefined && table !== null;

    return (
        <div className="flex flex-col h-full bg-[var(--page-bg-color)] relative overflow-hidden">
            {isPosMode ? (
                <div className="flex-shrink-0 p-4 bg-white border-b border-gray-100 flex justify-between items-center z-30">
                    <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-black text-gray-800 leading-none mb-1">
                                {table.orderType === 'para llevar' ? `Pedido #${table.number}` : `Mesa ${table.number}`}
                            </h2>
                            {isEditing && <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Editando</span>}
                        </div>

                        <div className="flex gap-2 items-center">
                            {isEditing && onClearCart && (
                                <button
                                    type="button"
                                    onClick={() => onClearCart()}
                                    onTouchEnd={(e) => { e.preventDefault(); onClearCart(); }}
                                    className="bg-amber-50 text-amber-600 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-200 active:scale-90 transition-all relative z-50 shadow-sm"
                                >
                                    Abandonar
                                </button>
                            )}
                            {onDeselectTable && (
                                <button onClick={onDeselectTable} className="px-4 py-2 bg-gray-100 text-gray-600 text-xs font-black uppercase tracking-widest rounded-lg active:bg-gray-200">
                                    Cerrar
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="shrink-0 z-30 relative px-4 py-2">
                    <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
                        {/* BOTÓN NUEVO PEDIDO / ABANDONAR - Ahora más discreto */}
                        {(cartItemCount > 0 || isEditing || (customerDetails?.name && customerDetails.name.trim() !== '')) && onClearCart && (
                            <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClearCart(); }}
                                onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); onClearCart(); }}
                                className={`flex-grow sm:flex-initial h-10 px-6 rounded-xl text-[9px] font-black uppercase tracking-widest border active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm ${isEditing ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                {isEditing ? 'Abandonar edición' : 'Limpiar Todo'}
                            </button>
                        )}

                        {showInstallButton && onInstallApp && (
                            <button onClick={onInstallApp} className="flex-grow sm:flex-initial h-10 bg-brand text-black px-6 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Instalar App
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Categorías en Carrusel Horizontal */}
            <div className="shrink-0 bg-black/40 backdrop-blur-md shadow-lg z-20 border-b border-white/5">
                <div className="max-w-7xl mx-auto flex flex-nowrap py-3 px-4 gap-2 overflow-x-auto scrollbar-hide">
                    {menu.map(cat => (
                        <button
                            key={cat.title}
                            onClick={() => scrollToCategory(cat.title)}
                            className={`flex-shrink-0 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat.title
                                ? 'bg-brand text-black shadow-[0_4px_15px_var(--brand-shadow-color)] scale-105'
                                : 'bg-white/5 text-white/40 border border-white/5'
                                }`}
                        >
                            {cat.title}
                        </button>
                    ))}
                </div>
            </div>

            {/* Listado de Productos */}
            <div className={`flex-grow overflow-y-auto scroll-smooth scrollbar-hide ${!isPosMode ? 'pb-24' : 'pb-4'}`}>
                <div className="max-w-full mx-auto px-2 py-5 lg:p-8">
                    {menu.map(category => (
                        <div key={category.title} ref={el => { categoryRefs.current[category.title] = el; }} className="mb-12">
                            <h2 className="text-[11px] font-black text-brand uppercase tracking-[0.3em] mb-6 px-1 border-l-4 border-brand pl-3">{category.title}</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                                {category.items.filter(i => i.available).map((item) => {
                                    const hasModifiers = (item.modifierGroupTitles && item.modifierGroupTitles.length > 0) || item.isPizza || item.isSpecialPizza;
                                    const cartItemForSimpleProduct = !hasModifiers ? cart.find(ci => ci.name === item.name && ci.selectedModifiers.length === 0 && ci.notes !== 'original') : null;
                                    const quantityInCart = cartItemForSimpleProduct ? cartItemForSimpleProduct.quantity : 0;

                                    return (
                                        <div key={item.name} className="bg-card rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col p-4 border-t-4 border-brand min-h-[180px] justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_45_var(--brand-shadow-color)] group">
                                            <div className="flex-grow flex flex-col overflow-hidden mb-4">
                                                <h3 className="text-[11px] md:text-xs font-black text-white leading-[1.2] uppercase line-clamp-2 mb-1 group-hover:text-brand transition-colors">{item.name}</h3>
                                                {item.description && (
                                                    <p className="text-[9px] text-gray-400 font-medium leading-tight line-clamp-2 italic opacity-80">
                                                        {item.description}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="mt-auto shrink-0">
                                                <div className="mb-3">
                                                    <p className="text-base font-black text-white leading-none">
                                                        {item.isPizza ? 'Desde ' : ''}${item.price.toFixed(2)}
                                                    </p>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase mt-0.5">Bs. {(item.price * activeRate).toFixed(2)}</p>
                                                </div>

                                                <button
                                                    onClick={() => (hasModifiers ? onOpenModifierModal(item) : onAddItem(item, [], 1))}
                                                    className="w-full bg-brand text-black py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all"
                                                >
                                                    {item.isPizza || item.isSpecialPizza ? 'Armar' : (hasModifiers ? 'Pedir' : 'Agregar')}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {!isPosMode && cartItemCount > 0 && (
                <div className="absolute bottom-6 left-0 right-0 flex justify-center px-6 z-40">
                    <button
                        onClick={onGoToCart}
                        className={`w-full max-w-lg h-16 ${isEditing ? 'bg-green-600 border-green-700' : 'bg-brand border-brand-dark'} rounded-2xl flex items-center justify-between px-7 shadow-2xl shadow-black/60 transform transition-all active:scale-95 border-b-4 ${triggerShake ? 'shake-animation' : ''}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                <span className={`absolute -top-1.5 -right-2 ${isEditing ? 'bg-green-800' : 'bg-[#001A4B]'} text-white font-black w-6 h-6 rounded-full flex items-center justify-center text-[10px] shadow-lg border-2 border-white`}>{cartItemCount}</span>
                            </div>
                            <span className="text-white font-black uppercase tracking-widest text-xs">
                                {isEditing ? 'Ir a Cobrar Cuenta' : 'Ver Mi Carrito'}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
};

export default MenuScreen;
