import React, { useState } from 'react';
import { StoreProfile } from '../types';

interface LoginScreenProps {
  onLogin: (name: string, storeId: string) => void;
  storeProfiles: StoreProfile[];
  onUpdateStoreProfiles: (updater: (profiles: StoreProfile[]) => StoreProfile[]) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, storeProfiles, onUpdateStoreProfiles }) => {
  const [step, setStep] = useState<'selectStore' | 'quickSetup' | 'enterName'>('selectStore');
  const [name, setName] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');

  const [kitchenWhatsapp, setKitchenWhatsapp] = useState('');
  const [adminWhatsapp, setAdminWhatsapp] = useState('');

  const selectedStore = storeProfiles.find(p => p.id === selectedStoreId);

  const handleStoreSelect = (storeId: string) => {
    const store = storeProfiles.find(p => p.id === storeId);
    setSelectedStoreId(storeId);
    if (store && !store.kitchenWhatsappNumber) {
      setKitchenWhatsapp(store.kitchenWhatsappNumber || '');
      setAdminWhatsapp(store.adminWhatsappNumber || '');
      setStep('quickSetup');
    } else {
      setStep('enterName');
    }
  };

  const handleGoBack = () => {
    setStep('selectStore');
    setSelectedStoreId('');
  };

  const handleSaveSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStoreId || !kitchenWhatsapp.trim()) return;

    onUpdateStoreProfiles(profiles =>
      profiles.map(p =>
        p.id === selectedStoreId
          ? { ...p, kitchenWhatsappNumber: kitchenWhatsapp.trim(), adminWhatsappNumber: adminWhatsapp.trim() }
          : p
      )
    );
    setStep('enterName');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && selectedStoreId) {
      onLogin(name.trim(), selectedStoreId);
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'quickSetup':
        if (!selectedStore) return null;
        return (
          <div className="relative p-10 space-y-8 bg-card rounded-[2.5rem] shadow-2xl border border-white/5 bro-paper-card">
            <button onClick={handleGoBack} className="absolute top-4 left-4 text-gray-400 hover:text-gray-700 p-2 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="text-center">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter border-b-2 border-brand inline-block mb-4">Configuración</h2>
              <p className="mt-2 text-sm text-gray-500 font-medium tracking-tight">Números de contacto para <span className="text-brand font-black">{selectedStore.name}</span></p>
            </div>
            <form className="space-y-4" onSubmit={handleSaveSetup}>
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">WhatsApp Cocina</label>
                <input type="text" value={kitchenWhatsapp} onChange={(e) => setKitchenWhatsapp(e.target.value)} className="w-full p-4 bg-black/40 border border-white/10 text-white rounded-2xl focus:ring-2 focus:ring-brand outline-none font-bold" placeholder="58412..." required />
              </div>
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">WhatsApp Admin</label>
                <input type="text" value={adminWhatsapp} onChange={(e) => setAdminWhatsapp(e.target.value)} className="w-full p-4 bg-black/40 border border-white/10 text-white rounded-2xl focus:ring-2 focus:ring-brand outline-none font-bold" placeholder="58412..." />
              </div>
              <button type="submit" disabled={!kitchenWhatsapp.trim()} className="w-full py-4 font-black transition-all text-black bg-brand rounded-2xl hover:bg-brand-dark disabled:opacity-30 uppercase tracking-[0.2em] shadow-xl mt-4">Continuar</button>
            </form>
          </div>
        );

      case 'enterName':
        if (!selectedStore) return null;
        return (
          <div className="relative p-10 space-y-8 bg-card rounded-[2.5rem] shadow-2xl border border-white/5 bro-paper-card">
            <button onClick={handleGoBack} className="absolute top-4 left-4 text-gray-400 hover:text-gray-700 p-2 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
            <div className="text-center">
              <img src={selectedStore.logo} alt="Business Logo" className="w-auto h-32 mx-auto mb-8 drop-shadow-2xl" />
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter border-b-2 border-brand inline-block mb-4">¡Bienvenido!</h2>
            </div>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest text-center">Identifícate con tu nombre</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-5 bg-black/40 border-2 border-white/5 text-center text-xl text-white rounded-2xl focus:ring-4 focus:ring-brand/20 focus:border-brand outline-none font-bold placeholder:text-gray-700"
                  placeholder="Tu nombre aquí..."
                  required
                  autoFocus
                />
              </div>
              <button type="submit" disabled={!name.trim()} className="w-full py-5 font-black text-black bg-brand rounded-2xl hover:bg-brand-dark disabled:opacity-30 uppercase tracking-[0.2em] shadow-xl border-b-4 border-black/20 transform active:scale-95 transition-all">
                Entrar al Sistema
              </button>
            </form>
          </div>
        );

      case 'selectStore':
      default:
        return (
          <div className="p-10 space-y-10 bg-card rounded-[2.5rem] shadow-2xl border border-white/5 text-center bro-paper-card">
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter border-b-2 border-brand inline-block">Seleccionar Tienda</h2>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 pt-4">
              {storeProfiles.map(profile => (
                <button key={profile.id} onClick={() => handleStoreSelect(profile.id)} className="group flex flex-col items-center p-6 border-2 border-white/5 rounded-3xl hover:border-brand/40 hover:bg-white/5 transition-all transform hover:-translate-y-2 bro-shadow">
                  <div className="bg-black/40 p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                    <img src={profile.logo} alt={profile.name} className="w-24 h-24 object-contain" />
                  </div>
                  <p className="text-sm font-black uppercase text-gray-500 group-hover:text-brand tracking-widest transition-colors">{profile.name}</p>
                </button>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-black theme-bro">
      <div className="w-full max-w-lg transition-all duration-300">
        {renderContent()}
      </div>
    </div>
  );
};

export default LoginScreen;