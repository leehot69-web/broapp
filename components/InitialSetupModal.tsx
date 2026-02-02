import React, { useState } from 'react';

interface InitialSetupModalProps {
  onSave: (name: string, logo: string | null, whatsappNumber: string) => void;
}

const compressImage = (file: File, maxSize: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      if (!event.target?.result) {
        return reject(new Error("FileReader did not return a result."));
      }
      const img = new Image();
      img.src = event.target.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get canvas context'));
        }
        ctx.drawImage(img, 0, 0, width, height);
        
        // Use JPEG for better compression, with a quality setting of 70%.
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7); 
        resolve(dataUrl);
      };
      img.onerror = error => reject(error);
    };
    reader.onerror = error => reject(error);
  });
};

const InitialSetupModal: React.FC<InitialSetupModalProps> = ({ onSave }) => {
  const [businessName, setBusinessName] = useState('');
  const [businessLogo, setBusinessLogo] = useState<string | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState('');

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedLogo = await compressImage(file, 256); // Smaller size for logos
        setBusinessLogo(compressedLogo);
      } catch (error) {
        console.error("Error compressing logo:", error);
        alert("Hubo un error al procesar la imagen del logo. Por favor, intente con otra imagen.");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (businessName.trim() && whatsappNumber.trim()) {
      onSave(businessName.trim(), businessLogo, whatsappNumber.trim());
    }
  };

  const isFormValid = businessName.trim() !== '' && whatsappNumber.trim() !== '';

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-2xl border border-gray-200">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--brand-color)]">Configuración Inicial</h1>
          <p className="mt-2 text-gray-500">Personaliza la aplicación para tu negocio.</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="business-name" className="block text-sm font-medium text-gray-700">
              Nombre del Negocio
            </label>
            <input
              id="business-name"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-4 py-3 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-[var(--brand-color)] focus:border-[var(--brand-color)]"
              placeholder="Ej: Restaurante Sabor Oriental"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Logo del Negocio (Opcional)
            </label>
            <div className="mt-2 flex items-center gap-4">
              <label
                htmlFor="logo-upload"
                className="cursor-pointer w-full text-center px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                {businessLogo ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
              </label>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
               {businessLogo && (
                <img
                  src={businessLogo}
                  alt="Vista previa del logo"
                  className="w-16 h-16 rounded-lg object-cover bg-white p-1 border"
                />
              )}
            </div>
          </div>

          <div>
            <label htmlFor="whatsapp-number" className="block text-sm font-medium text-gray-700">
              WhatsApp de Cocina
            </label>
            <input
              id="whatsapp-number"
              type="text"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              className="w-full px-4 py-3 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-[var(--brand-color)] focus:border-[var(--brand-color)]"
              placeholder="Ej: 584121234567"
              required
            />
            <p className="mt-2 text-xs text-gray-500">
              Número para enviar pedidos. Incluir código de país, sin '+' ni espacios.
            </p>
          </div>
          
          <div className="text-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600">
              Comenzarás con <strong>5 mesas</strong> por defecto. Puedes agregar más y personalizar las asignaciones en <strong>Ajustes</strong>.
            </p>
          </div>

          <button
            type="submit"
            disabled={!isFormValid}
            className="w-full py-3 font-bold text-white bg-[var(--brand-color)] rounded-lg hover:bg-[var(--brand-color-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-[var(--brand-color)] transition duration-300 transform hover:scale-105 shadow-lg shadow-[var(--brand-shadow-color)] hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
          >
            Guardar y Empezar
          </button>
        </form>
      </div>
    </div>
  );
};

export default InitialSetupModal;