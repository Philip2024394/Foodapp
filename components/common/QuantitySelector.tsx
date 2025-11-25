import React from 'react';
import { PlusIcon, MinusIcon } from './Icon';

interface QuantitySelectorProps {
    quantity: number;
    onQuantityChange: (newQuantity: number) => void;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({ quantity, onQuantityChange }) => {
    return (
        <div className="flex items-center space-x-3">
            <button 
                onClick={() => onQuantityChange(quantity - 1)} 
                className="p-1.5 rounded-full bg-orange-600 text-white hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={quantity <= 0}
            >
                <MinusIcon className="h-4 w-4" />
            </button>
            <span className="font-bold w-6 text-center text-lg">{quantity}</span>
            <button 
                onClick={() => onQuantityChange(quantity + 1)} 
                className="p-1.5 rounded-full bg-orange-600 text-white hover:bg-orange-700 transition-colors"
            >
                <PlusIcon className="h-4 w-4" />
            </button>
        </div>
    );
};

export default QuantitySelector;