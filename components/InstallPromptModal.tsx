
import React from 'react';

interface InstallPromptModalProps {
  onClose: () => void;
  onInstall: () => void;
  platform: 'ios' | 'android' | 'other';
}

const InstallPromptModal: React.FC<InstallPromptModalProps> = ({ onClose, onInstall, platform }) => {
  return (
    <div className="fixed inset-0 bg-black/90 flex items-end sm:items-center justify-center z-[200] p-0 sm:p-4 backdrop-blur-xl animate-fadeIn" onClick={onClose}>
      <div className="bg-card rounded-t-[3rem] sm:rounded-[2.5rem] w-full max-w-md p-8 sm:p-10 shadow-2xl animate-slideInUp overflow-hidden relative border-t border-white/10 bro-paper-card" onClick={e => e.stopPropagation()}>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-brand shadow-[0_0_15px_var(--brand-shadow-color)]"></div>
        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8 sm:hidden"></div>

        <div className="text-center">
          <div className="relative inline-block mb-8">
            <div className="w-28 h-28 bg-black/40 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl border border-white/5 p-4 transform -rotate-3 group hover:rotate-0 transition-transform">
              <img src="/menu_images/bro.png" alt="App Logo" className="w-full h-full object-contain drop-shadow-2xl" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-brand text-black p-1.5 rounded-full shadow-lg border-4 border-card">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4 bro-gradient-text">Instala la App</h2>
          <p className="text-gray-500 text-sm font-medium mb-10 px-4 leading-relaxed tracking-tight">
            Accede al menú de <span className="text-brand font-black italic">BRO</span> de forma instantánea y segura desde tu pantalla de inicio.
          </p>

          {platform === 'ios' ? (
            <div className="space-y-4 text-left mb-10 px-2">
              <div className="flex items-center gap-5 p-5 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
                <div className="w-12 h-12 bg-black/40 rounded-xl shadow-lg flex items-center justify-center shrink-0 border border-white/5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">1. Toca <span className="text-white font-black">COMPARTIR</span> abajo en Safari.</p>
              </div>
              <div className="flex items-center gap-5 p-5 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
                <div className="w-12 h-12 bg-black/40 rounded-xl shadow-lg flex items-center justify-center shrink-0 border border-white/5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">2. Selecciona <span className="text-white font-black italic">AÑADIR A INICIO</span>.</p>
              </div>
            </div>
          ) : (
            <div className="mb-8 px-2">
              <button
                onClick={onInstall}
                className="w-full py-5 bg-brand text-black font-black rounded-2xl shadow-xl uppercase tracking-[0.2em] text-lg transform active:scale-95 transition-all flex items-center justify-center gap-3 border-b-4 border-black/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Instalar Ahora
              </button>
            </div>
          )}

          <button onClick={onClose} className="text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-gray-600 transition-colors py-2">
            Quizás más tarde
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPromptModal;
