import React from 'react';

interface QRModalProps {
  title: string;
  qrData: string;
  isImage?: boolean;
  onClose: () => void;
}

const QRModal: React.FC<QRModalProps> = ({ title, qrData, isImage = false, onClose }) => {
  if (!qrData) return null;

  const qrImageUrl = isImage ? qrData : `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-[var(--text-primary-color)] mb-6">{title}</h2>
        <div className="bg-white p-4 rounded-lg inline-block border border-[var(--border-color)]">
          <img src={qrImageUrl} alt={title} width="250" height="250" />
        </div>
        <button
          onClick={onClose}
          className="mt-8 w-full py-3 font-bold text-white bg-[var(--brand-color)] rounded-lg hover:bg-[var(--brand-color-dark)] transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default QRModal;