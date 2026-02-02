
import React, { useState, useMemo } from 'react';
import { MenuItem, ModifierOption, ModifierGroup, CartItem, SelectedModifier, ModifierAssignment } from '../types';

interface ProductModifierModalProps {
    item: MenuItem;
    allModifierGroups: ModifierGroup[];
    onClose: () => void;
    onSubmit: (item: MenuItem, selectedModifiers: SelectedModifier[], quantity: number, instructions?: string) => void;
    initialCartItem?: CartItem | null;
    activeRate: number;
}

// Helper para obtener el grupo y la etiqueta
const getGroupAndLabel = (assignment: string | ModifierAssignment): { groupTitle: string, displayLabel: string } => {
    if (typeof assignment === 'string') {
        return { groupTitle: assignment, displayLabel: assignment };
    }
    return { groupTitle: assignment.group, displayLabel: assignment.label };
};

const ProductModifierModal: React.FC<ProductModifierModalProps> = ({ item, allModifierGroups, onClose, onSubmit, initialCartItem, activeRate }) => {
    const [quantity, setQuantity] = useState(initialCartItem?.quantity || 1);
    const [instructions, setInstructions] = useState(initialCartItem?.specialInstructions || '');

    const groupsToDisplay = useMemo(() => {
        if (!item.modifierGroupTitles) return [];

        return item.modifierGroupTitles.map(assignment => {
            const { groupTitle, displayLabel } = getGroupAndLabel(assignment);
            const groupData = allModifierGroups.find(g => g.title === groupTitle);
            return groupData ? { ...groupData, displayLabel } : null;
        }).filter(Boolean) as (ModifierGroup & { displayLabel: string })[];

    }, [item.modifierGroupTitles, allModifierGroups]);

    const [selectionsByGroup, setSelectionsByGroup] = useState<Record<string, ModifierOption[]>>(() => {
        const initialState: Record<string, ModifierOption[]> = {};
        groupsToDisplay.forEach(group => {
            // Usamos la etiqueta de visualización como clave
            initialState[group.displayLabel] = [];
        });

        if (initialCartItem) {
            initialCartItem.selectedModifiers.forEach(selectedMod => {
                if (initialState[selectedMod.groupTitle]) {
                    const groupDef = groupsToDisplay.find(g => g.displayLabel === selectedMod.groupTitle);
                    const originalOption = groupDef?.options.find(opt => opt.name === selectedMod.option.name);
                    if (originalOption) {
                        initialState[selectedMod.groupTitle].push(originalOption);
                    }
                }
            });
        }

        return initialState;
    });

    const handleAddOption = (group: ModifierGroup & { displayLabel: string }, option: ModifierOption) => {
        setSelectionsByGroup(prev => {
            const newSelections = { ...prev };
            const currentGroupSelections = prev[group.displayLabel] || [];
            if (currentGroupSelections.length < group.maxSelection) {
                newSelections[group.displayLabel] = [...currentGroupSelections, option];
            }
            return newSelections;
        });
    };

    const handleRemoveOption = (group: ModifierGroup & { displayLabel: string }, option: ModifierOption) => {
        setSelectionsByGroup(prev => {
            const newSelections = { ...prev };
            const currentGroupSelections = [...(prev[group.displayLabel] || [])];
            const lastIndex = currentGroupSelections.map(o => o.name).lastIndexOf(option.name);
            if (lastIndex !== -1) {
                const newGroupSelections = [...currentGroupSelections];
                newGroupSelections.splice(lastIndex, 1);
                newSelections[group.displayLabel] = newGroupSelections;
            }
            return newSelections;
        });
    };


    const handleSelectionChange = (group: ModifierGroup & { displayLabel: string }, option: ModifierOption) => {
        setSelectionsByGroup(prev => {
            const newSelections = { ...prev };
            let currentGroupSelections = [...(newSelections[group.displayLabel] || [])];
            const isSelected = currentGroupSelections.some(mod => mod.name === option.name);

            if (group.selectionType === 'single') {
                currentGroupSelections = isSelected ? [] : [option];
            } else { // multiple
                if (isSelected) {
                    currentGroupSelections = currentGroupSelections.filter(mod => mod.name !== option.name);
                } else {
                    if (currentGroupSelections.length < group.maxSelection) {
                        currentGroupSelections.push(option);
                    }
                }
            }
            newSelections[group.displayLabel] = currentGroupSelections;
            return newSelections;
        });
    };

    const validationStatus = useMemo(() => {
        let isValid = true;
        const errors: Record<string, string> = {};
        groupsToDisplay.forEach(group => {
            const selectionCount = selectionsByGroup[group.displayLabel]?.length || 0;
            if (selectionCount < group.minSelection) {
                isValid = false;
                errors[group.displayLabel] = `Selecciona al menos ${group.minSelection}`;
            }
        });
        return { isValid, errors };
    }, [selectionsByGroup, groupsToDisplay]);

    const calculateTotal = () => {
        let modifiersTotal = 0;

        Object.entries(selectionsByGroup).forEach(([displayLabel, selectedOptions]: [string, ModifierOption[]]) => {
            const groupDef = groupsToDisplay.find(g => g.displayLabel === displayLabel);
            if (!groupDef) return;

            const isProteinOrSpecial = groupDef.title.toLowerCase().includes('proteína') ||
                groupDef.displayLabel.toLowerCase().includes('proteína') ||
                (groupDef.freeSelectionCount !== undefined && groupDef.freeSelectionCount > 0);

            if (isProteinOrSpecial) {
                // Algorithm: First selections up to freeSelectionCount (default 1) are $0, others at their cost (or extraPrice)
                const freeLimit = groupDef.freeSelectionCount || 1;
                const extraCost = groupDef.extraPrice;

                selectedOptions.forEach((opt, index) => {
                    if (index >= freeLimit) {
                        modifiersTotal += (extraCost !== undefined && extraCost > 0) ? extraCost : opt.price;
                    }
                });
            } else {
                modifiersTotal += selectedOptions.reduce((sum, opt) => sum + opt.price, 0);
            }
        });

        return (item.price + modifiersTotal) * quantity;
    };

    const handleSubmit = () => {
        if (!validationStatus.isValid) return;

        const finalModifiers: SelectedModifier[] = [];

        Object.entries(selectionsByGroup).forEach(([displayLabel, selectedOptions]: [string, ModifierOption[]]) => {
            const groupDef = groupsToDisplay.find(g => g.displayLabel === displayLabel);
            const isProteinOrSpecial = groupDef && (
                groupDef.title.toLowerCase().includes('proteína') ||
                groupDef.displayLabel.toLowerCase().includes('proteína') ||
                (groupDef.freeSelectionCount !== undefined && groupDef.freeSelectionCount > 0)
            );

            if (isProteinOrSpecial) {
                const freeLimit = groupDef?.freeSelectionCount || 1;
                const extraCost = groupDef?.extraPrice;

                selectedOptions.forEach((opt, index) => {
                    const finalOption = index < freeLimit ? { ...opt, price: 0 } : (extraCost !== undefined && extraCost > 0 ? { ...opt, price: extraCost } : opt);
                    finalModifiers.push({ groupTitle: displayLabel, option: finalOption });
                });
            } else {
                selectedOptions.forEach(opt => {
                    finalModifiers.push({ groupTitle: displayLabel, option: opt });
                });
            }
        });

        onSubmit(item, finalModifiers, quantity, instructions);
    };

    const incrementQty = () => setQuantity(q => q + 1);
    const decrementQty = () => setQuantity(q => (q > 1 ? q - 1 : 1));

    return (
        <div
            className="fixed inset-0 bg-black/90 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-fadeIn backdrop-blur-xl"
            onClick={onClose}
        >
            <div
                className="bg-card rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[100vh] flex flex-col transform transition-transform border-x border-t border-white/10 bro-paper-card overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex-grow overflow-y-auto px-4 pb-4">
                    {/* Title and Description - More compact */}
                    <div className="mb-6 pt-6 relative border-l-4 border-brand pl-4">
                        <h2 className="text-2xl font-black text-white leading-tight uppercase italic tracking-tighter">{item.name}</h2>
                        {item.description && (
                            <p className="text-gray-500 text-[10px] font-black uppercase mt-1 tracking-widest leading-relaxed opacity-70">
                                {item.description}
                            </p>
                        )}
                    </div>

                    {/* Header Image or Title */}
                    {item.image && (
                        <div className="relative shrink-0 mb-6">
                            <div className="h-48 w-full overflow-hidden rounded-xl">
                                <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent"></div>
                            </div>
                        </div>
                    )}
                    <button onClick={onClose} className="absolute top-6 right-6 bg-black/50 backdrop-blur-xl rounded-full p-2.5 text-white hover:bg-black shadow-2xl z-20 border border-white/20 transition-all active:scale-90">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>

                    <div className="space-y-8">
                        {groupsToDisplay.map(group => {
                            const allowDuplicates = group.title.toLowerCase().includes('proteína') || group.title.toLowerCase().includes('extra');
                            return (
                                <div key={group.displayLabel}>
                                    <div className="flex justify-between items-center mb-5">
                                        <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">{group.displayLabel}</h3>
                                        {validationStatus.errors[group.displayLabel] ? (
                                            <span className="text-[9px] font-black text-red-500 bg-red-500/10 px-3 py-1 rounded-full uppercase tracking-widest border border-red-500/20">Necesario</span>
                                        ) : (
                                            <span className="text-[9px] font-black text-brand bg-brand/10 px-3 py-1 rounded-full uppercase tracking-widest border border-brand/20">Listo</span>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        {group.options.map(option => {
                                            const count = selectionsByGroup[group.displayLabel]?.filter(mod => mod.name === option.name).length || 0;
                                            const isChecked = count > 0;

                                            let displayPrice = option.price;
                                            let isExtraCharge = false;
                                            let isIncluded = false;

                                            const isProteinOrSpecial = group.title.toLowerCase().includes('proteína') ||
                                                group.displayLabel.toLowerCase().includes('proteína') ||
                                                (group.freeSelectionCount !== undefined && group.freeSelectionCount > 0);

                                            if (isProteinOrSpecial) {
                                                const currentOptions = selectionsByGroup[group.displayLabel] || [];
                                                const freeLimit = group.freeSelectionCount || 1;
                                                const extraCost = group.extraPrice;

                                                // Si ya está seleccionado, determinamos si esta instancia específica era gratis
                                                if (isChecked) {
                                                    const firstIndex = currentOptions.findIndex(o => o.name === option.name);
                                                    if (firstIndex !== -1 && firstIndex < freeLimit) {
                                                        isIncluded = true;
                                                        displayPrice = 0;
                                                    } else {
                                                        isExtraCharge = true;
                                                        displayPrice = (extraCost !== undefined && extraCost > 0) ? extraCost : option.price;
                                                    }
                                                } else {
                                                    // Si no está seleccionado, ¿sería gratis si lo agregamos?
                                                    if (currentOptions.length < freeLimit) {
                                                        isIncluded = true;
                                                        displayPrice = 0;
                                                    } else {
                                                        isExtraCharge = true;
                                                        displayPrice = (extraCost !== undefined && extraCost > 0) ? extraCost : option.price;
                                                    }
                                                }
                                            } else {
                                                isExtraCharge = option.price > 0;
                                            }

                                            if (allowDuplicates) {
                                                return (
                                                    <div
                                                        key={option.name}
                                                        className={`flex items-center justify-between p-4 rounded-2xl transition-all border-2 ${isChecked ? 'bg-brand border-brand shadow-xl' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                                                    >
                                                        <div className="flex flex-col">
                                                            <span className={`font-black uppercase text-sm ${isChecked ? 'text-black' : 'text-gray-400'}`}>{option.name}</span>
                                                            <div className="flex gap-2 items-center mt-1">
                                                                {isExtraCharge && displayPrice > 0 && (
                                                                    <span className="text-[10px] font-black text-red-400 bg-red-400/10 px-2 py-0.5 rounded border border-red-400/20">
                                                                        +${displayPrice.toFixed(2)}
                                                                    </span>
                                                                )}
                                                                {isIncluded && (
                                                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${isChecked ? 'text-black bg-black/10 border-black/10' : 'text-green-400 bg-green-400/10 border-green-400/20'}`}>
                                                                        INCLUIDO
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            {count > 0 && (
                                                                <button type="button" onClick={() => handleRemoveOption(group, option)} className="w-10 h-10 flex items-center justify-center bg-black/20 rounded-xl border border-black/10 text-black font-black active:scale-90 transition-all text-xl">-</button>
                                                            )}
                                                            {count > 0 && (
                                                                <span className="font-black text-black w-6 text-center text-lg">{count}</span>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleAddOption(group, option)}
                                                                className={`w-10 h-10 flex items-center justify-center rounded-xl border font-black active:scale-90 transition-all text-xl ${count > 0 ? 'bg-black text-white border-black/20' : 'bg-white/10 text-white border-white/10'}`}
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            }


                                            return (
                                                <label
                                                    key={option.name}
                                                    className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border-2 ${isChecked ? 'bg-brand border-brand shadow-xl' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                                                >
                                                    <div className="flex flex-col">
                                                        <span className={`font-black uppercase text-sm ${isChecked ? 'text-black' : 'text-gray-400'}`}>{option.name}</span>
                                                        <div className="flex gap-2 items-center mt-1">
                                                            {isExtraCharge && displayPrice > 0 && (
                                                                <span className="text-[10px] font-black text-red-400 bg-red-400/10 px-2 py-0.5 rounded border border-red-400/20">
                                                                    +${displayPrice.toFixed(2)}
                                                                </span>
                                                            )}
                                                            {isIncluded && (
                                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${isChecked ? 'text-black bg-black/10 border-black/10' : 'text-green-400 bg-green-400/10 border-green-400/20'}`}>
                                                                    INCLUIDO
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-right">
                                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isChecked ? 'border-black bg-black scale-110 shadow-lg' : 'border-white/20'}`}>
                                                            {isChecked && <div className="w-2.5 h-2.5 bg-brand rounded-full"></div>}
                                                        </div>
                                                        <input
                                                            type={group.selectionType === 'single' ? 'radio' : 'checkbox'}
                                                            name={group.displayLabel}
                                                            checked={isChecked}
                                                            onChange={() => handleSelectionChange(group, option)}
                                                            className="hidden"
                                                        />
                                                    </div>
                                                </label>
                                            )
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                        {/* Notas Especiales Integradas en el scroll */}
                        <div className="pt-4 border-t border-white/5">
                            <label className="block text-[8px] font-black text-gray-600 uppercase tracking-widest mb-2 ml-1 opacity-50">Notas / Instrucciones</label>
                            <div className="relative">
                                <textarea
                                    value={instructions}
                                    onChange={(e) => setInstructions(e.target.value)}
                                    placeholder="Ej: Sin cebolla, carne bien cocida..."
                                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:border-brand/40 outline-none text-[11px] text-white font-medium placeholder:text-gray-800 resize-none h-16 transition-all"
                                />
                                <div className="absolute bottom-3 right-3 opacity-20">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Compacto (Estilo App Bancaria) */}
                <div className="flex-shrink-0 bg-black/80 backdrop-blur-3xl px-4 py-4 border-t border-white/10 z-30">
                    <div className="max-w-xl mx-auto flex items-center gap-3">
                        {/* Selector de Cantidad Pill */}
                        <div className="flex items-center bg-white/10 rounded-full h-12 px-1 border border-white/5 shrink-0 shadow-inner">
                            <button onClick={decrementQty} className="w-10 h-10 flex items-center justify-center text-white active:scale-90 transition-all text-xl font-black">－</button>
                            <span className="w-6 text-center font-black text-sm text-white">{quantity}</span>
                            <button onClick={incrementQty} className="w-10 h-10 flex items-center justify-center text-white active:scale-90 transition-all text-xl font-black">＋</button>
                        </div>

                        {/* Botón de Acción Principal */}
                        <button
                            onClick={handleSubmit}
                            disabled={!validationStatus.isValid}
                            className="flex-grow h-12 bg-brand text-black rounded-full font-black uppercase tracking-widest shadow-xl active:scale-95 disabled:opacity-30 disabled:grayscale transition-all flex justify-between items-center px-6"
                        >
                            <span className="text-[10px]">{initialCartItem ? 'ACTUALIZAR' : 'AÑADIR'}</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-[10px] opacity-70 italic">$</span>
                                <span className="text-lg font-black tracking-tighter italic">
                                    {calculateTotal().toFixed(2)}
                                </span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductModifierModal;
