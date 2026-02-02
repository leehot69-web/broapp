
import React, { useState, useMemo } from 'react';
import { SaleRecord, OrderItem, StoreProfile, AppSettings, CartItem, View } from '../types';

interface ReportsScreenProps {
    reports: SaleRecord[];
    onGoToTables: () => void;
    onDeleteReports: (idsToDelete: string[]) => boolean;
    storeProfile?: StoreProfile;
    settings?: AppSettings;
    onStartNewDay?: () => void;
    currentWaiter: string;
    currentRole: 'admin' | 'waiter';
    onOpenSalesHistory: () => void;
    onReprintSaleRecord: (sale: SaleRecord) => void;
    isPrinterConnected: boolean;
    onEditPendingReport: (report: SaleRecord, targetView?: View) => void;
    onVoidReport: (reportId: string) => void;
}

const DayClosureModal: React.FC<{
    reports: SaleRecord[];
    settings: AppSettings;
    onClose: () => void;
    onStartNewDay: () => void;
    currentWaiter: string;
}> = ({ reports, settings, onClose, onStartNewDay, currentWaiter }) => {
    const exchangeRate = settings.activeExchangeRate === 'bcv' ? settings.exchangeRateBCV : settings.exchangeRateParallel;
    const today = new Date().toISOString().split('T')[0];
    const filteredReports = reports.filter(r => r.waiter === currentWaiter && (r.date === today || r.notes === 'PENDIENTE'));
    const totalPaid = filteredReports.reduce((acc, r) => (r.date === today && r.notes !== 'PENDIENTE' && r.notes !== 'ANULADO' && !r.isShiftClosed) ? acc + (r.type === 'refund' ? -r.total : r.total) : acc, 0);
    const totalPending = filteredReports.reduce((acc, r) => r.notes === 'PENDIENTE' ? acc + r.total : acc, 0);

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4 backdrop-blur-xl overflow-y-auto">
            <div className="bg-card rounded-[2rem] w-full max-w-md shadow-2xl p-8 my-auto border border-white/10 bro-paper-card">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black uppercase text-white italic tracking-tighter border-b-2 border-brand pr-4">Cierre de {currentWaiter}</h2>
                    <button onClick={onClose} className="p-2 bg-white/5 text-gray-400 rounded-full hover:bg-white/10"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
                <div className="space-y-4">
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black text-brand uppercase mb-1 tracking-widest">Cobrado (Caja)</p>
                        <div className="flex justify-between items-end">
                            <p className="text-3xl font-black text-white tracking-tighter bro-gradient-text">${totalPaid.toFixed(2)}</p>
                            <p className="text-sm font-bold text-gray-500 uppercase">Bs. {(totalPaid * exchangeRate).toFixed(2)}</p>
                        </div>
                    </div>
                    <div className="bg-amber-500/10 p-5 rounded-2xl border border-amber-500/20">
                        <p className="text-[10px] font-black text-amber-500 uppercase mb-1">Por Cobrar (Pendiente)</p>
                        <div className="flex justify-between items-end">
                            <p className="text-2xl font-black text-white">${totalPending.toFixed(2)}</p>
                            <p className="text-sm font-bold text-gray-500 uppercase">Bs. {(totalPending * exchangeRate).toFixed(2)}</p>
                        </div>
                    </div>
                </div>
                <div className="mt-8 space-y-3">
                    <button onClick={onStartNewDay} className="w-full h-16 bg-red-600 shadow-xl shadow-red-900/20 text-white font-black rounded-2xl uppercase tracking-widest border-b-4 border-black/20 active:scale-95 transition-all">Finalizar Jornada</button>
                    <button onClick={onClose} className="w-full h-12 bg-white/5 text-gray-400 font-black rounded-2xl uppercase tracking-widest text-[10px]">Cancelar</button>
                </div>
            </div>
        </div>
    );
};

const ReportsScreen: React.FC<ReportsScreenProps> = ({ reports, onGoToTables, onDeleteReports, storeProfile, settings, onStartNewDay, currentWaiter, currentRole, onOpenSalesHistory, onReprintSaleRecord, isPrinterConnected, onEditPendingReport, onVoidReport }) => {
    const [activeSale, setActiveSale] = useState<SaleRecord | null>(null);
    const [showClosureModal, setShowClosureModal] = useState(false);
    const exchangeRate = settings ? (settings.activeExchangeRate === 'bcv' ? settings.exchangeRateBCV : settings.exchangeRateParallel) : 1;
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const isToday = selectedDate === new Date().toISOString().split('T')[0];

    const filteredByWaiterAndDate = useMemo(() => {
        return reports.filter(r => {
            if (currentRole === 'admin') return r.date === selectedDate || r.notes === 'PENDIENTE';
            if (r.waiter !== currentWaiter) return false;
            if (r.notes === 'PENDIENTE') return true;
            return r.date === selectedDate;
        });
    }, [reports, currentWaiter, currentRole, selectedDate]);

    const totalPaid = filteredByWaiterAndDate.reduce((sum, r) => {
        if (isToday && r.isShiftClosed) return sum;
        return (r.notes !== 'PENDIENTE' && r.notes !== 'ANULADO') ? (r.type === 'refund' ? sum - r.total : sum + r.total) : sum;
    }, 0);

    const totalPending = filteredByWaiterAndDate.reduce((sum, r) => r.notes === 'PENDIENTE' ? sum + r.total : sum, 0);

    const getStatusColor = (notes?: string, isClosed?: boolean) => {
        if (notes === 'PENDIENTE') return 'bg-amber-400';
        if (notes === 'ANULADO') return 'bg-gray-400';
        if (isClosed) return 'bg-gray-300';
        return 'bg-green-500';
    };

    const getBadgeClass = (notes?: string, isClosed?: boolean) => {
        if (notes === 'PENDIENTE') return 'bg-amber-500/20 text-amber-500';
        if (notes === 'ANULADO') return 'bg-white/10 text-gray-500';
        if (isClosed) return 'bg-white/10 text-gray-400';
        return 'bg-green-500/20 text-green-500';
    };

    return (
        <>
            <div className="max-w-4xl mx-auto h-screen flex flex-col bg-black theme-bro">
                <header className="flex-shrink-0 flex items-center justify-between p-6 border-b border-white/5 bg-black/50 backdrop-blur-xl z-20">
                    <button onClick={onGoToTables} className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/5 text-gray-400 rounded-xl active:scale-90 transition-transform"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg></button>
                    <div className="text-center">
                        <h1 className="text-[10px] font-black uppercase text-gray-500 leading-none mb-1 tracking-widest">{currentRole === 'admin' ? 'Caja Central' : 'Mi Caja'}</h1>
                        <p className="text-sm font-black uppercase text-brand tracking-tighter italic bro-gradient-text">{currentWaiter}</p>
                    </div>
                    <div className="w-12 flex justify-end">
                        <div className={`w-3 h-3 rounded-full ${isPrinterConnected || settings?.useSystemPrint ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]'}`}></div>
                    </div>
                </header>

                <div className="bg-white/5 border-b border-white/5 p-6 flex items-center justify-between shadow-2xl relative z-10">
                    <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d.toISOString().split('T')[0]); }} className="w-14 h-14 flex items-center justify-center bg-white/5 border border-white/5 text-white rounded-[1.25rem] shadow-xl active:scale-90 transition-transform hover:bg-white/10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="flex flex-col items-center">
                        <span className={`text-[10px] font-black uppercase tracking-[0.3em] mb-1 ${isToday ? 'text-brand' : 'text-gray-500'}`}>{isToday ? 'Hoy' : 'Historial'}</span>
                        <span className="text-xl font-black text-white tracking-widest tabular-nums italic">{selectedDate}</span>
                    </div>
                    <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d.toISOString().split('T')[0]); }} disabled={isToday} className={`w-14 h-14 flex items-center justify-center bg-white/5 border border-white/5 text-white rounded-[1.25rem] shadow-xl active:scale-90 transition-transform hover:bg-white/10 ${isToday ? 'opacity-5' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-4 space-y-6 scrollbar-hide py-6">
                    <div className="grid grid-cols-2 gap-3 px-2">
                        <div className="bg-brand/10 border border-brand/20 p-4 rounded-[1.5rem] text-white shadow-xl bro-paper-card">
                            <p className="text-[9px] font-black uppercase text-brand mb-1 tracking-widest opacity-60">Cobrado</p>
                            <p className="text-3xl font-black bro-gradient-text tracking-tighter italic leading-none mb-1">${totalPaid.toFixed(2)}</p>
                            {isToday && totalPaid === 0 && filteredByWaiterAndDate.some(r => r.isShiftClosed && r.date === selectedDate) && (
                                <p className="text-[8px] font-black bg-green-500/20 text-green-500 inline-block px-2 py-0.5 rounded-full uppercase tracking-widest">Cerrado</p>
                            )}
                        </div>
                        <div className="bg-white/5 border border-white/5 p-4 rounded-[1.5rem] text-white shadow-xl bro-paper-card">
                            <p className="text-[9px] font-black uppercase text-gray-500 mb-1 tracking-widest opacity-60">Pendiente</p>
                            <p className="text-3xl font-black text-white tracking-tighter italic leading-none">${totalPending.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button onClick={onOpenSalesHistory} className="flex-1 h-16 bg-white/5 border border-white/5 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all hover:bg-white/10">Historial</button>
                        {isToday && <button onClick={() => setShowClosureModal(true)} className="flex-1 h-16 bg-red-600 shadow-xl shadow-red-900/20 text-white border-b-4 border-black/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] active:scale-95 transition-all">Cerrar Día</button>}
                    </div>

                    <div className="space-y-4">
                        {filteredByWaiterAndDate.length === 0 ? (
                            <div className="text-center py-20 opacity-20">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                <p className="font-black uppercase tracking-widest">No hay registros</p>
                            </div>
                        ) : (
                            filteredByWaiterAndDate.map(report => (
                                <div key={report.id} onClick={() => setActiveSale(report)} className={`bg-card p-4 rounded-[1.5rem] border ${report.isShiftClosed && isToday ? 'border-white/5 opacity-50' : 'border-white/5'} flex justify-between items-center active:scale-[0.98] transition-all cursor-pointer shadow-lg bro-paper-card group`}>
                                    <div className="flex gap-3 items-center">
                                        <div className={`w-1 h-10 rounded-full ${getStatusColor(report.notes, report.isShiftClosed && isToday)} shadow-[0_0_10px_currentColor]`}></div>
                                        <div>
                                            <p className={`font-black text-sm uppercase tracking-tight italic leading-none mb-1.5 ${report.notes === 'ANULADO' ? 'text-gray-700 line-through' : 'text-white'}`}>{report.customerName || (report.tableNumber > 0 ? `Mesa ${report.tableNumber}` : 'Pedido')}</p>
                                            <div className="flex gap-2 items-center flex-wrap">
                                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${getBadgeClass(report.notes, report.isShiftClosed && isToday)}`}>
                                                    {report.isShiftClosed && report.notes !== 'PENDIENTE' && isToday ? 'Cerrado' : report.notes}
                                                </span>
                                                <span className="text-[9px] font-black text-gray-600 bg-white/5 px-1.5 py-0.5 rounded-lg">{report.time || ''}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className={`font-black text-xl tracking-tighter italic leading-none ${report.notes === 'ANULADO' || (report.isShiftClosed && isToday) ? 'text-gray-700' : 'text-white'}`}>${report.total.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {activeSale && (
                <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[110] p-6 backdrop-blur-3xl" onClick={() => setActiveSale(null)}>
                    <div className="bg-card rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl border border-white/10 bro-paper-card relative overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-bl-[100%] pointer-events-none"></div>

                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter bro-gradient-text leading-none mb-1">Detalle Venta</h3>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{activeSale.waiter} • {activeSale.time}</p>
                            </div>
                            <span className={`text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${getBadgeClass(activeSale.notes)} shadow-lg`}>{activeSale.notes}</span>
                        </div>

                        <div className="space-y-4 mb-10 max-h-[40vh] overflow-y-auto scrollbar-hide pr-2">
                            {activeSale.order.map((item: any, idx: number) => (
                                <div key={idx} className="bg-white/5 p-4 rounded-3xl border border-white/5">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-[11px] font-black text-white uppercase italic leading-tight">{item.quantity}x {item.name}</p>
                                        <span className="text-xs font-black text-white/50">${((item.price + (item.selectedModifiers?.reduce((s: number, m: any) => s + (m.option?.price || 0), 0) || 0) + (item.pizzaConfig?.ingredients.reduce((s: number, sel: any) => s + (sel.ingredient.prices[item.pizzaConfig.size] / (sel.half === 'full' ? 1 : 2)), 0) || 0)) * item.quantity).toFixed(2)}</span>
                                    </div>

                                    {item.pizzaConfig && (
                                        <div className="mt-2 space-y-1">
                                            <p className="text-[8px] font-black text-brand uppercase tracking-widest opacity-60">Pizza {item.pizzaConfig.size}</p>
                                            <div className="flex flex-wrap gap-1">
                                                {item.pizzaConfig.ingredients.map((sel: any, sIdx: number) => (
                                                    <span key={sIdx} className="text-[8px] font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                                                        {sel.half === 'full' ? '●' : sel.half === 'left' ? '◐' : '◑'} {sel.ingredient.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {(item.selectedModifiers && item.selectedModifiers.length > 0) && (
                                        <p className="text-[9px] text-gray-500 mt-2 italic leading-relaxed">
                                            <span className="text-brand opacity-50 font-black mr-1">+</span>
                                            {item.selectedModifiers.map((m: any) => m.option?.name).join(', ')}
                                        </p>
                                    )}

                                    {item.specialInstructions && (
                                        <p className="text-[9px] text-brand/60 mt-2 italic font-medium bg-brand/5 p-2 rounded-xl">
                                            📝 {item.specialInstructions}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 space-y-4">
                            {activeSale.notes === 'PENDIENTE' && (
                                <div className="space-y-3">
                                    <button
                                        onClick={() => { onEditPendingReport(activeSale, 'checkout'); setActiveSale(null); }}
                                        className="w-full h-16 bg-green-600 shadow-xl shadow-green-900/20 text-white rounded-2xl font-black uppercase tracking-widest border-b-4 border-black/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                        Cobrar Cuenta
                                    </button>
                                    <button
                                        onClick={() => { onEditPendingReport(activeSale, 'menu'); setActiveSale(null); }}
                                        className="w-full h-16 bg-brand shadow-xl shadow-brand/20 text-black rounded-2xl font-black uppercase tracking-widest border-b-4 border-black/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                                        Añadir más
                                    </button>
                                    <button
                                        onClick={() => { onVoidReport(activeSale.id); }}
                                        className="w-full h-12 bg-red-500/10 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-red-500/20 active:scale-95 transition-all"
                                    >
                                        Anular Ticket (Admin)
                                    </button>
                                </div>
                            )}
                            <button onClick={() => onReprintSaleRecord(activeSale)} disabled={(!isPrinterConnected && !settings?.useSystemPrint) || activeSale.notes === 'ANULADO'} className="w-full h-14 bg-white shadow-xl text-black rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-20 disabled:scale-100 flex items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                Imprimir Copia
                            </button>
                            <button onClick={() => setActiveSale(null)} className="w-full h-12 bg-white/5 text-gray-500 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all">Cerrar</button>
                        </div>
                    </div>
                </div>
            )}

            {showClosureModal && settings && onStartNewDay && <DayClosureModal reports={reports} settings={settings} onClose={() => setShowClosureModal(false)} onStartNewDay={onStartNewDay} currentWaiter={currentWaiter} />}
        </>
    );
};

export default ReportsScreen;
