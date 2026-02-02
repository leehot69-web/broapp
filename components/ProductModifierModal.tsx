
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

            if (groupDef.freeSelectionCount !== undefined && groupDef.extraPrice !== undefined) {
                const freeLimit = groupDef.freeSelectionCount;
                const extraCost = groupDef.extraPrice;

                const totalSelectedCount = selectedOptions.length;
                const extras = Math.max(0, totalSelectedCount - freeLimit);

                const baseOptionsCost = selectedOptions.reduce((sum, opt) => sum + opt.price, 0);
                modifiersTotal += baseOptionsCost + (extras * extraCost);
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

            if (groupDef && groupDef.freeSelectionCount !== undefined && groupDef.extraPrice !== undefined) {
                const freeLimit = groupDef.freeSelectionCount;
                const extraCost = groupDef.extraPrice;

                selectedOptions.forEach((opt, index) => {
                    const finalOption = index < freeLimit ? opt : { ...opt, price: extraCost };
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
                className="bg-card rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl w-full max-w-md max-h-[95vh] flex flex-col transform transition-transform border border-white/10 bro-paper-card overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Image or Title */}
                <div className="relative shrink-0">
                    {item.image && (
                        <div className="h-56 w-full overflow-hidden">
                            <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent"></div>
                        </div>
                    )}
                    <button onClick={onClose} className="absolute top-6 right-6 bg-black/50 backdrop-blur-xl rounded-full p-2.5 text-white hover:bg-black shadow-2xl z-20 border border-white/20 transition-all active:scale-90">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto px-6 pb-6">
                    {/* Title and Description */}
                    <div className="mb-8 pt-8 relative">
                        <h2 className="text-3xl font-black text-white leading-tight pr-10 uppercase italic bro-gradient-text tracking-tighter mb-2">{item.name}</h2>
                        <div className="h-1 w-12 bg-brand rounded-full mb-4"></div>
                        {item.description && (
                            <p className="text-gray-400 text-sm leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5 italic">
                                {item.description}
                            </p>
                        )}
                    </div>

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

                                            if (group.extraPrice !== undefined && group.freeSelectionCount !== undefined) {
                                                const currentCount = selectionsByGroup[group.displayLabel]?.length || 0;
                                                const freeLimit = group.freeSelectionCount;
                                                const extraPrice = group.extraPrice;

                                                if (isChecked) {
                                                    const indices = selectionsByGroup[group.displayLabel].map((m, i) => m.name === option.name ? i : -1).filter(i => i !== -1);
                                                    if (indices.some(idx => idx >= freeLimit)) {
                                                        displayPrice = extraPrice;
                                                        isExtraCharge = true;
                                                    } else {
                                                        isIncluded = true;
                                                    }
                                                } else {
                                                    if (currentCount >= freeLimit) {
                                                        displayPrice = extraPrice;
                                                        isExtraCharge = true;
                                                    } else {
                                                        isIncluded = true;
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
                    </div>
                </div>

                {/* Notas / Instrucciones Especiales */}
                <div className="px-6 pb-6 pt-2">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Notas Especiales / Alergias</label>
                    <textarea
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="Ej: Sin pepinillos, carne término medio, etc..."
                        className="w-full p-5 bg-black/40 border border-white/10 rounded-2xl focus:ring-2 focus:ring-brand focus:border-transparent outline-none resize-none text-sm text-white font-medium placeholder:text-gray-700"
                        rows={2}
                    />
                </div>

                {/* Footer with Quantity and Add Button */}
                <div className="flex-shrink-0 p-8 pt-4 border-t border-white/5 bg-black/40 backdrop-blur-2xl">
                    <div className="flex items-center justify-between gap-6">

                        {/* Quantity Selector */}
                        <div className="flex items-center bg-white/5 rounded-2xl p-1 shrink-0 border border-white/10">
                            <button onClick={decrementQty} className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-xl shadow-sm text-white font-black hover:bg-white/20 active:scale-90 transition-all text-2xl leading-none">-</button>
                            <span className="w-10 text-center font-black text-xl text-white">{quantity}</span>
                            <button onClick={incrementQty} className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-xl shadow-sm text-white font-black hover:bg-white/20 active:scale-90 transition-all text-2xl leading-none">+</button>
                        </div>

                        {/* Add Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={!validationStatus.isValid}
                            className="flex-grow h-14 bg-brand text-black rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-brand/20 hover:shadow-brand/40 transition-all active:scale-95 disabled:bg-gray-800 disabled:text-gray-600 disabled:shadow-none disabled:transform-none flex justify-center items-center gap-4 px-6 border-b-4 border-black/20"
                        >
                            <div className="flex flex-col items-start leading-tight">
                                <span className="text-xs opacity-70 font-bold -mb-1">AÑADIR</span>
                                <span className="font-black text-xl tracking-tighter">
                                    ${calculateTotal().toFixed(2)}
                                </span>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductModifierModal;
