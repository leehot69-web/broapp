
import React, { useState, useMemo } from 'react';
import { MenuItem, PizzaSize, PizzaIngredient, PizzaHalf, PizzaIngredientSelection, PizzaConfiguration, CartItem, SelectedModifier, ModifierGroup } from '../types';

interface PizzaBuilderModalProps {
    item: MenuItem;
    onClose: () => void;
    onSubmit: (item: MenuItem, pizzaConfig: PizzaConfiguration, quantity: number, extraModifiers: SelectedModifier[]) => void;
    initialCartItem?: CartItem | null;
    activeRate: number;
    isSpecialPizza?: boolean;
    defaultIngredients?: string[];
    pizzaIngredients: PizzaIngredient[];
    pizzaBasePrices: Record<string, number>;
    allModifierGroups: ModifierGroup[];
}

const PizzaBuilderModal: React.FC<PizzaBuilderModalProps> = ({
    item,
    onClose,
    onSubmit,
    initialCartItem,
    activeRate,
    isSpecialPizza = false,
    defaultIngredients = [],
    pizzaIngredients,
    pizzaBasePrices,
    allModifierGroups
}) => {
    // Estados
    const [size, setSize] = useState<PizzaSize>(
        initialCartItem?.pizzaConfig?.size || (isSpecialPizza ? 'Familiar' : 'Mediana')
    );
    const [selectedHalf, setSelectedHalf] = useState<PizzaHalf>('full');
    const [ingredients, setIngredients] = useState<PizzaIngredientSelection[]>(() => {
        if (initialCartItem?.pizzaConfig?.ingredients) {
            return initialCartItem.pizzaConfig.ingredients;
        }
        // Para pizzas especiales, agregar ingredientes por defecto como "full"
        if (isSpecialPizza && defaultIngredients.length > 0) {
            return defaultIngredients.map(name => {
                const ing = pizzaIngredients.find(i => i.name === name);
                if (ing) {
                    return { ingredient: ing, half: 'full' as PizzaHalf };
                }
                return null;
            }).filter(Boolean) as PizzaIngredientSelection[];
        }
        return [];
    });

    const [extraModifiers, setExtraModifiers] = useState<SelectedModifier[]>(() => {
        if (initialCartItem) {
            // Filtrar los que no son de pizza (tamaño e ingredientes que agregamos manualmente en handleAddPizzaToCart)
            const pizzaSpecificGroups = ['Tamaño', '🍕 TODA LA PIZZA', '◐ MITAD IZQUIERDA', '◑ MITAD DERECHA', '✓ INGREDIENTES BASE'];
            return initialCartItem.selectedModifiers.filter(m => !pizzaSpecificGroups.includes(m.groupTitle));
        }
        return [];
    });

    const [quantity, setQuantity] = useState(initialCartItem?.quantity || 1);

    // Grupos de modificadores asignados a este producto
    const assignedModifierGroups = useMemo(() => {
        return (item.modifierGroupTitles || []).map(titleOrAssignment => {
            const groupTitle = typeof titleOrAssignment === 'string' ? titleOrAssignment : titleOrAssignment.group;
            const displayTitle = typeof titleOrAssignment === 'string' ? titleOrAssignment : titleOrAssignment.label;
            const group = allModifierGroups.find(g => g.title === groupTitle);
            return group ? { ...group, displayTitle } : null;
        }).filter(Boolean) as (ModifierGroup & { displayTitle: string })[];
    }, [item.modifierGroupTitles, allModifierGroups]);

    const handleToggleModifier = (group: ModifierGroup & { displayTitle: string }, option: { name: string, price: number }) => {
        if (group.selectionType === 'single') {
            setExtraModifiers(prev => [
                ...prev.filter(m => m.groupTitle !== group.displayTitle),
                { groupTitle: group.displayTitle, option }
            ]);
        } else {
            setExtraModifiers(prev => {
                const exists = prev.find(m => m.groupTitle === group.displayTitle && m.option.name === option.name);
                if (exists) {
                    return prev.filter(m => !(m.groupTitle === group.displayTitle && m.option.name === option.name));
                } else {
                    return [...prev, { groupTitle: group.displayTitle, option }];
                }
            });
        }
    };

    // Calcular precio total
    const totalPrice = useMemo(() => {
        let basePrice = isSpecialPizza ? item.price : pizzaBasePrices[size];

        // Sumar ingredientes
        let proteinCount = 0;
        ingredients.forEach(sel => {
            if (isSpecialPizza && defaultIngredients.includes(sel.ingredient.name)) {
                return;
            }

            let ingPrice = sel.ingredient.prices[size as PizzaSize];

            // Si es proteína (Categoría A) y es la primera adicional que agregamos, es gratis
            if (sel.ingredient.category === 'A' && !isSpecialPizza) {
                proteinCount++;
                if (proteinCount === 1) {
                    ingPrice = 0;
                }
            }

            if (sel.half === 'left' || sel.half === 'right') {
                basePrice += ingPrice / 2;
            } else {
                basePrice += ingPrice;
            }
        });

        // Sumar modificadores extra
        const modsPrice = extraModifiers.reduce((sum, mod) => sum + mod.option.price, 0);

        // Si es familiar en pizza especial, sumamos el costo extra si hay
        // En BRO, pusimos grupos de tamaño que tienen precio.

        return (basePrice + modsPrice) * quantity;
    }, [size, ingredients, quantity, isSpecialPizza, item.price, defaultIngredients, extraModifiers, pizzaBasePrices]);

    // Agrupar ingredientes por categoría
    const groupedIngredients = useMemo(() => {
        const grouped: Record<string, PizzaIngredient[]> = { A: [], B: [], C: [] };
        pizzaIngredients.forEach(ing => {
            if (!grouped[ing.category]) grouped[ing.category] = [];
            grouped[ing.category].push(ing);
        });
        return grouped;
    }, [pizzaIngredients]);

    // Verificar si un ingrediente está seleccionado
    const getIngredientSelection = (ingredientName: string): PizzaIngredientSelection | undefined => {
        return ingredients.find(sel => sel.ingredient.name === ingredientName);
    };

    // Agregar/modificar ingrediente
    const toggleIngredient = (ingredient: PizzaIngredient) => {
        const existing = getIngredientSelection(ingredient.name);

        if (existing) {
            // Si existe y el half es el mismo, quitar
            if (existing.half === selectedHalf) {
                setIngredients(prev => prev.filter(sel => sel.ingredient.name !== ingredient.name));
            } else {
                // Cambiar el half
                setIngredients(prev => prev.map(sel =>
                    sel.ingredient.name === ingredient.name
                        ? { ...sel, half: selectedHalf }
                        : sel
                ));
            }
        } else {
            // Agregar nuevo
            setIngredients(prev => [...prev, { ingredient, half: selectedHalf }]);
        }
    };

    // Obtener ingredientes por mitad
    const leftIngredients = ingredients.filter(sel => sel.half === 'left' || sel.half === 'full');
    const rightIngredients = ingredients.filter(sel => sel.half === 'right' || sel.half === 'full');

    // Manejar submit
    const handleSubmit = () => {
        const config: PizzaConfiguration = {
            size: isSpecialPizza ? 'Familiar' : size,
            basePrice: isSpecialPizza ? item.price : pizzaBasePrices[size],
            ingredients,
            isSpecialPizza,
            specialPizzaName: isSpecialPizza ? item.name : undefined
        };
        onSubmit(item, config, quantity, extraModifiers);
    };

    // Colores por categoría (BRO Style)
    const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
        A: { bg: 'bg-brand/10', text: 'text-brand', border: 'border-brand/30' },
        B: { bg: 'bg-white/5', text: 'text-gray-300', border: 'border-white/10' },
        C: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/90 backdrop-blur-xl animate-fadeIn p-0 sm:p-4">
            <div
                className="w-full max-w-2xl bg-card rounded-t-[2rem] sm:rounded-[2rem] max-h-[100vh] flex flex-col transform transition-transform border-x border-t border-white/10 bro-paper-card overflow-hidden"
            >
                {/* Header Compacto */}
                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-black/20">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-1 bg-brand rounded-full"></div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">
                                {isSpecialPizza ? item.name : 'Configurar Pizza'}
                            </h2>
                            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest leading-none">Personaliza tu orden</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white active:scale-90 border border-white/10"
                    >
                        ✕
                    </button>
                </div>

                {/* Contenido scrolleable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-10 scrollbar-hide">

                    {/* Selector de tamaño */}
                    {!isSpecialPizza && (
                        <div className="px-1">
                            <h3 className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-4">Tamaño de base</h3>
                            <div className="grid grid-cols-3 gap-3">
                                {(['Pequeña', 'Mediana', 'Familiar'] as PizzaSize[]).map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setSize(s)}
                                        className={`p-4 rounded-2xl border-2 transition-all ${size === s
                                            ? 'border-brand bg-brand text-black shadow-xl scale-105'
                                            : 'border-white/5 bg-white/5 text-gray-500 hover:border-white/20'
                                            }`}
                                    >
                                        <div className="text-xl font-black">${pizzaBasePrices[s]}</div>
                                        <div className={`text-[9px] font-black uppercase tracking-widest mt-1 ${size === s ? 'text-black/60' : 'opacity-70'}`}>{s}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* VISTA PREVIA DE LA PIZZA (Themed) */}
                    <div className="flex flex-col items-center">
                        <div className="relative w-64 h-64 mb-6">
                            {/* Círculo base de la pizza - Estilo Premium BRO */}
                            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#D2691E] to-[#8B4513] border-[6px] border-black/30 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden">
                                {/* Masa */}
                                <div className="absolute inset-0 rounded-full border-[10px] border-[#F4A460]/20"></div>

                                {/* Línea divisoria */}
                                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-black/20 transform -translate-x-1/2" />

                                {/* Mitad izquierda */}
                                <div
                                    className={`absolute top-0 bottom-0 left-0 w-1/2 flex items-center justify-center cursor-pointer transition-all ${selectedHalf === 'left' ? 'bg-brand/20 border-r border-brand/50' : 'hover:bg-white/5'
                                        }`}
                                    onClick={() => setSelectedHalf('left')}
                                >
                                    <div className="text-center px-2">
                                        {leftIngredients.length > 0 ? (
                                            <div className="flex flex-wrap justify-center gap-1">
                                                {leftIngredients.slice(0, 6).map(sel => (
                                                    <div key={sel.ingredient.name} className="w-2 h-2 rounded-full bg-white shadow-sm" title={sel.ingredient.name}></div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-white/10 font-black text-xs uppercase tracking-widest">IZQ</span>
                                        )}
                                    </div>
                                </div>

                                {/* Mitad derecha */}
                                <div
                                    className={`absolute top-0 bottom-0 right-0 w-1/2 flex items-center justify-center cursor-pointer transition-all ${selectedHalf === 'right' ? 'bg-brand/20 border-l border-brand/50' : 'hover:bg-white/5'
                                        }`}
                                    onClick={() => setSelectedHalf('right')}
                                >
                                    <div className="text-center px-2">
                                        {rightIngredients.length > 0 ? (
                                            <div className="flex flex-wrap justify-center gap-1">
                                                {rightIngredients.slice(0, 6).map(sel => (
                                                    <div key={sel.ingredient.name} className="w-2 h-2 rounded-full bg-white shadow-sm" title={sel.ingredient.name}></div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-white/10 font-black text-xs uppercase tracking-widest">DER</span>
                                        )}
                                    </div>
                                </div>

                                {/* Centro clickeable para toda la pizza */}
                                <div
                                    className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full cursor-pointer transition-all flex items-center justify-center z-10 border-4 ${selectedHalf === 'full'
                                        ? 'bg-brand text-black shadow-[0_0_20px_var(--brand-shadow-color)] border-white'
                                        : 'bg-black/60 text-white/50 hover:bg-black/80 border-white/10'
                                        }`}
                                    onClick={() => setSelectedHalf('full')}
                                >
                                    <span className="text-[9px] font-black uppercase tracking-widest">{selectedHalf === 'full' ? 'BRO' : 'TODO'}</span>
                                </div>
                            </div>
                        </div>

                        {/* SELECTOR DE MITAD (Themed Buttons) */}
                        <div className="flex bg-white/5 rounded-2xl p-1.5 border border-white/5">
                            <button
                                onClick={() => setSelectedHalf('left')}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedHalf === 'left'
                                    ? 'bg-brand text-black shadow-lg'
                                    : 'text-gray-500 hover:text-white'
                                    }`}
                            >
                                Mitad Izq
                            </button>
                            <button
                                onClick={() => setSelectedHalf('full')}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedHalf === 'full'
                                    ? 'bg-brand text-black shadow-lg'
                                    : 'text-gray-500 hover:text-white'
                                    }`}
                            >
                                Toda
                            </button>
                            <button
                                onClick={() => setSelectedHalf('right')}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedHalf === 'right'
                                    ? 'bg-brand text-black shadow-lg'
                                    : 'text-gray-500 hover:text-white'
                                    }`}
                            >
                                Mitad Der
                            </button>
                        </div>
                    </div>

                    {/* LISTA DE INGREDIENTES (Themed Cards) */}
                    <div className="space-y-10">
                        <div className="flex items-center gap-3">
                            <div className="h-1 w-8 bg-brand rounded-full"></div>
                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Ingredientes Adicionales</h3>
                        </div>

                        {(Object.entries(groupedIngredients) as [string, PizzaIngredient[]][]).filter(([_, ings]) => ings.length > 0).map(([category, ings]) => (
                            <div key={category} className="space-y-4">
                                <div className="flex items-center px-1">
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${categoryColors[category].text}`}>
                                        {category === 'A' ? 'Proteínas Premium' : category === 'B' ? 'Vegetales Frescos' : 'Extras Especiales'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {ings.map(ing => {
                                        const selection = getIngredientSelection(ing.name);
                                        const isDefault = isSpecialPizza && defaultIngredients.includes(ing.name);
                                        const isSelected = !!selection;

                                        let price = ing.prices[size as PizzaSize];
                                        const isProtein = ing.category === 'A';
                                        let isIncluded = isDefault;

                                        // Si es proteína y es la primera, mostrar como incluido
                                        if (isProtein && !isSpecialPizza) {
                                            const currentProteins = ingredients.filter(s => s.ingredient.category === 'A');
                                            const isFirstProtein = currentProteins.length > 0 && currentProteins[0].ingredient.name === ing.name;
                                            const hasNoProteinsYet = currentProteins.length === 0;

                                            if (isSelected && isFirstProtein) {
                                                isIncluded = true;
                                                price = 0;
                                            } else if (!isSelected && hasNoProteinsYet) {
                                                isIncluded = true;
                                                price = 0;
                                            }
                                        }

                                        return (
                                            <button
                                                key={ing.name}
                                                onClick={() => toggleIngredient(ing)}
                                                className={`p-3 rounded-xl border transition-all text-left relative overflow-hidden h-[74px] flex flex-col justify-center ${isSelected
                                                    ? `border-brand bg-brand shadow-lg`
                                                    : 'border-white/5 bg-white/[0.03] hover:border-white/20'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`text-[10px] font-black uppercase tracking-tight leading-tight line-clamp-2 ${isSelected ? 'text-black' : 'text-gray-400'}`}>
                                                        {ing.name}
                                                    </span>
                                                    {isSelected && (
                                                        <div className="flex flex-col items-end shrink-0 ml-2">
                                                            <span className="text-[7px] px-1.5 py-0.5 rounded-md bg-black text-brand font-black">
                                                                {selection.half === 'full' ? 'TODO' : selection.half === 'left' ? 'IZQ' : 'DER'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={`text-[9px] font-black tracking-widest ${isSelected ? 'text-black/60' : 'text-gray-500'}`}>
                                                    {isIncluded ? 'INCLUIDO' : `+$${price.toFixed(2)}`}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* MODIFICADORES ADICIONALES (Themed) */}
                    {assignedModifierGroups.length > 0 && (
                        <div className="space-y-8 pt-6 border-t border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="h-1 w-8 bg-brand rounded-full"></div>
                                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Más Opciones</h3>
                            </div>
                            {assignedModifierGroups.map(group => (
                                <div key={group.displayTitle} className="space-y-4">
                                    <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-1">{group.displayTitle}</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {group.options.map(opt => {
                                            const isSelected = !!extraModifiers.find(m => m.groupTitle === group.displayTitle && m.option.name === opt.name);
                                            return (
                                                <button
                                                    key={opt.name}
                                                    onClick={() => handleToggleModifier(group, opt)}
                                                    className={`p-4 rounded-2xl border-2 transition-all text-left ${isSelected
                                                        ? 'border-brand bg-brand text-black shadow-xl scale-[1.02]'
                                                        : 'border-white/5 bg-white/[0.03] text-gray-500 hover:border-white/20'
                                                        }`}
                                                >
                                                    <div className="font-black text-[11px] uppercase truncate">{opt.name}</div>
                                                    <div className={`text-[10px] font-bold mt-1 ${isSelected ? 'text-black/60' : 'text-gray-400'}`}>
                                                        {opt.price > 0 ? `+$${opt.price.toFixed(2)}` : 'GRATIS'}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </div>

                {/* Footer Compacto */}
                <div className="px-4 py-4 border-t border-white/10 bg-black/80 backdrop-blur-3xl z-30">
                    <div className="max-w-xl mx-auto flex items-center gap-3">
                        {/* Selector de Cantidad */}
                        <div className="flex items-center bg-white/10 rounded-full h-12 px-1 border border-white/5 shrink-0">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-white active:scale-90 text-xl font-black">－</button>
                            <span className="w-6 text-center font-black text-sm text-white">{quantity}</span>
                            <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center text-white active:scale-90 text-xl font-black">＋</button>
                        </div>

                        {/* Botón de Confirmar */}
                        <button
                            onClick={handleSubmit}
                            disabled={!isSpecialPizza && ingredients.length === 0}
                            className="flex-grow h-12 bg-brand text-black rounded-full font-black uppercase tracking-widest shadow-xl active:scale-95 disabled:opacity-30 disabled:grayscale transition-all flex justify-between items-center px-6"
                        >
                            <span className="text-[10px]">{initialCartItem ? 'ACTUALIZAR' : 'CONFIRMAR'}</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-[10px] opacity-70 italic">$</span>
                                <span className="text-lg font-black tracking-tighter italic">
                                    {(totalPrice).toFixed(2)}
                                </span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PizzaBuilderModal;
