import React from 'react';
import Modal from './Modal';
import { BikeIcon, CarIcon } from './Icon';
import { VehicleType } from '../../types';

interface VisitConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  destinationName: string;
  vehicleType: VehicleType | null;
}

const VisitConfirmationModal: React.FC<VisitConfirmationModalProps> = ({ isOpen, onClose, onConfirm, destinationName, vehicleType }) => {
  if (!isOpen || !vehicleType) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4 text-center">
        <div className="w-16 h-16 mx-auto bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center border-2 border-orange-500/50">
          {vehicleType === VehicleType.BIKE ? <BikeIcon className="h-8 w-8" /> : <CarIcon className="h-8 w-8" />}
        </div>
        <h2 className="text-2xl font-bold text-white mt-4">Ready to Go?</h2>
        <p className="text-stone-300 mt-2">
          The IndoStreet Team is ready to take you to{' '}
          <span className="font-bold text-orange-400">{destinationName}</span>.
        </p>
        <p className="text-sm text-stone-400 mt-4">
          Press 'Let's Go' to proceed to the booking screen. You'll then confirm your pickup location and book your ride.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-white/10 font-semibold rounded-lg hover:bg-white/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="w-full px-4 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors"
          >
            Let's Go!
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default VisitConfirmationModal;