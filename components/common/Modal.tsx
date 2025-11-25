import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  backdropClassName?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, backdropClassName }) => {
  if (!isOpen) return null;

  const defaultBackdrop = "fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 transition-opacity";

  return (
    <div
      className={backdropClassName || defaultBackdrop}
      onClick={onClose}
    >
      <div
        className="bg-stone-900 border border-white/10 rounded-lg shadow-xl p-4 m-4 max-w-lg w-full relative transform transition-all max-h-[90vh] overflow-y-auto animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-stone-400 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;