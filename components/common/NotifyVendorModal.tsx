import React from 'react';
import Modal from './Modal';
import { ChatIcon } from './Icon';

interface NotifyVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify: () => void;
  vendorName: string;
}

const NotifyVendorModal: React.FC<NotifyVendorModalProps> = ({ isOpen, onClose, onNotify, vendorName }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4 text-center">
        <div className="w-16 h-16 mx-auto bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center border-2 border-blue-500/50">
            <ChatIcon className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mt-4">Notify Place of Arrival?</h2>
        <p className="text-stone-300 mt-2">
          Your driver is on the way to pick you up. Would you like to let{' '}
          <span className="font-bold text-orange-400">{vendorName}</span> know your ETA?
        </p>
        <p className="text-sm text-stone-400 mt-4">
          This can help them prepare for your session.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-white/10 font-semibold rounded-lg hover:bg-white/20 transition-colors"
          >
            No, Thanks
          </button>
          <button
            onClick={onNotify}
            className="w-full px-4 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Notify Place
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default NotifyVendorModal;