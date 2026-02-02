
import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onEnter: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onEnter }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const logoUrl = '/menu_images/bro.png';

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-full bg-black flex flex-col items-center justify-center overflow-hidden font-sans">
      {/* Fondo con degradado radial premium */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1a1a1a] via-black to-black opacity-100"></div>

      {/* Elementos decorativos gold */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-brand/5 rounded-full blur-[120px]"></div>

      {/* Contenedor del Logo */}
      <div className={`relative z-10 flex flex-col items-center transition-all duration-1000 transform ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
        <div className="w-64 h-64 sm:w-72 sm:h-72 bg-card rounded-[3rem] shadow-[0_25px_60px_rgba(0,0,0,0.8)] p-6 flex items-center justify-center mb-10 animate-pulse-slow border border-white/5">
          <img
            src={logoUrl}
            alt="BRO Logo"
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </div>

        <h1 className="text-white text-5xl font-black uppercase tracking-tighter mb-2 text-center italic bro-gradient-text drop-shadow-2xl">
          BRO
        </h1>
        <p className="text-gray-500 text-[10px] font-black tracking-[0.6em] uppercase opacity-80 pl-2">EXPERIENCIA PREMIUM</p>
        <div className="h-1 w-24 bg-brand rounded-full mt-6 mb-24 shadow-[0_0_20px_var(--brand-shadow-color)]"></div>
      </div>

      {/* Botón de Entrada */}
      <div className={`absolute bottom-20 w-full max-w-xs px-8 z-10 transition-all duration-700 delay-500 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <button
          onClick={onEnter}
          className="w-full py-5 font-black text-xl text-black bg-brand rounded-[2rem] hover:bg-brand-dark transition-all transform active:scale-95 shadow-2xl uppercase tracking-[0.2em] border-b-4 border-black/20"
        >
          Entrar
        </button>
        <p className="text-gray-600 text-[10px] text-center mt-8 font-black uppercase tracking-[0.4em]">
          BRO • Menú Digital
        </p>
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
