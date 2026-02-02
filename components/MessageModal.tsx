import React, { useState } from 'react';

interface MessageModalProps {
  tableNumber: number;
  waiter: string;
  whatsappNumber: string;
  onClose: () => void;
}

const MessageModal: React.FC<MessageModalProps> = ({ tableNumber, waiter, whatsappNumber, onClose }) => {
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    if (!message.trim() || !whatsappNumber.trim()) return;
    
    let fullMessage = `*--- MENSAJE A COCINA ---*\n\n`;
    fullMessage += `*Mesa:* ${tableNumber}\n`;
    fullMessage += `*Mesonero:* ${waiter}\n\n`;
    fullMessage += `*Mensaje:* ${message.trim()}`;

    const encodedMessage = encodeURIComponent(fullMessage);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-[var(--text-primary-color)] mb-2">Enviar Mensaje a Cocina</h2>
        <p className="text-[var(--text-secondary-color)] mb-6">Para Mesa {tableNumber}</p>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full h-32 px-4 py-3 text-[var(--text-primary-color)] bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-color)] focus:border-[var(--brand-color)]"
          placeholder="Escribe tu mensaje aquí..."
        />
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
           <button
            onClick={onClose}
            className="w-full py-3 font-bold text-[var(--text-primary-color)] bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
           >
            Cancelar
          </button>
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="w-full py-3 font-bold text-white bg-[var(--brand-color)] rounded-lg hover:bg-[var(--brand-color-dark)] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Enviar por WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;