

import React, { useState } from 'react';
import { UserDetails } from '../types';

interface WelcomeScreenProps {
  logo: string;
  onSave: (name: string, phone: string) => void;
  initialDetails?: UserDetails;
  onBack?: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ logo, onSave, initialDetails, onBack }) => {
  const [name, setName] = useState(initialDetails?.name || '');
  const [phone, setPhone] = useState(initialDetails?.phone || '');
  
  const isEditing = !!initialDetails?.name;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && phone.trim()) {
      onSave(name.trim(), phone.trim());
    }
  };

  return (
    <div className="flex flex-col h-full bg-white p-6 animate-fadeIn">
      {isEditing && onBack && (
        <header className="absolute top-0 left-0 p-4">
             <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
        </header>
      )}
      <div className="flex flex-col items-center justify-center flex-grow">
          <img src={logo} alt="Logo" className="w-auto h-32 mx-auto mb-8" />
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">{isEditing ? 'Actualizar mis Datos' : '¡Bienvenido!'}</h1>
            <p className="mt-2 text-gray-600">
                {isEditing ? 'Aquí puedes editar tu nombre y teléfono guardados.' : 'Para agilizar tus pedidos, por favor déjanos tus datos.'}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Tu Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--brand-color)] focus:border-[var(--brand-color)] outline-none transition-all"
                placeholder="Ej: Ana Rivas"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Tu Teléfono</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--brand-color)] focus:border-[var(--brand-color)] outline-none transition-all"
                placeholder="Ej: 0412 1234567"
                required
              />
            </div>
            <button
              type="submit"
              disabled={!name.trim() || !phone.trim()}
              className="w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all bg-[var(--brand-color)] text-white hover:bg-[var(--brand-color-dark)] transform active:scale-95 shadow-[var(--brand-shadow-color)] disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
            >
              {isEditing ? 'Guardar Cambios' : 'Comenzar a Pedir'}
            </button>
          </form>
      </div>
    </div>
  );
};

export default WelcomeScreen;