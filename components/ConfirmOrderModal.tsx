
import React from 'react';

interface ConfirmOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    isPrinterConnected: boolean;
    isEdit?: boolean;
    onConfirmPrintAndSend: () => void;
    onConfirmPrintOnly: () => void;
    onConfirmSendOnly: () => void;
    onConfirmSendUnpaid: () => void;
}

const ConfirmOrderModal: React.FC<ConfirmOrderModalProps> = ({
    isOpen,
    onClose,
    isPrinterConnected,
    isEdit = false,
    onConfirmPrintAndSend,
    onConfirmPrintOnly,
    onConfirmSendOnly,
    onConfirmSendUnpaid,
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-xl"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="bg-card rounded-[2.5rem] shadow-2xl p-8 sm:p-10 w-full max-w-md border border-white/10 overflow-hidden bro-paper-card"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-brand/10 border border-brand/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_var(--brand-shadow-color)]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter bro-gradient-text">
                        {isEdit ? 'Cerrar Cuenta' : 'Confirmar Pedido'}
                    </h2>
                    <p className="text-gray-500 text-[11px] font-black uppercase tracking-widest mt-2 leading-tight">
                        {isEdit
                            ? '¿Cómo deseas procesar este cobro?'
                            : 'Selecciona una acción para continuar'
                        }
                    </p>
                </div>

                <div className="space-y-3">
                    {/* OPCIÓN 1: COBRO TOTAL (LO QUE PIDIÓ EL USUARIO) */}
                    <button
                        onClick={onConfirmPrintAndSend}
                        className="w-full flex flex-col items-center justify-center py-6 px-4 font-black text-black bg-brand rounded-2xl hover:bg-brand-dark transition-all transform active:scale-95 shadow-xl border-b-4 border-black/20"
                    >
                        <div className="flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            <span className="text-lg uppercase tracking-widest">Cobrar e Imprimir</span>
                        </div>
                        <span className="text-[9px] opacity-70 mt-1 uppercase font-black tracking-widest">Registra en caja + Ticket Escaneable</span>
                    </button>

                    {/* OPCIÓN 2: COBRO RÁPIDO SIN IMPRESORA */}
                    <button
                        onClick={onConfirmSendOnly}
                        className="w-full py-5 font-black text-brand bg-white/5 border border-brand/20 rounded-2xl hover:bg-white/10 transition-all flex flex-col items-center justify-center"
                    >
                        <div className="flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            <span className="uppercase tracking-widest text-base">Solo Cobrar</span>
                        </div>
                        <span className="text-[9px] opacity-50 uppercase font-black mt-1 tracking-widest">Registrar en sistema sin imprimir</span>
                    </button>

                    <div className="h-px bg-white/5 my-6 flex items-center justify-center">
                        <span className="bg-card px-4 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Más Opciones</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={onConfirmSendUnpaid}
                            className="flex flex-col items-center justify-center py-4 bg-white/5 text-gray-400 rounded-2xl font-black text-[10px] uppercase border border-white/5 hover:bg-white/10 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-2 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {isEdit ? 'Mantener Pendiente' : 'Pendiente'}
                        </button>
                        <button
                            onClick={onConfirmPrintAndSend}
                            className="flex flex-col items-center justify-center py-4 bg-white/5 text-gray-400 rounded-2xl font-black text-[10px] uppercase border border-white/5 hover:bg-white/10 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-2 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            Solo Recibo
                        </button>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full mt-6 py-3 font-bold text-gray-400 uppercase tracking-widest text-[10px] hover:text-gray-600 transition-colors"
                >
                    Cancelar y Volver
                </button>
            </div>
        </div>
    );
};

export default ConfirmOrderModal;
