import React, { useState } from 'react';
import { CartItem } from '../../types';
import QuantitySelector from '../common/QuantitySelector';
import { useCartContext } from '../../hooks/useCartContext';
import { formatIndonesianCurrency } from '../../utils/formatters';
import { TrashIcon } from '../common/Icon';

interface DrawerCartItemProps {
  cartItem: CartItem;
}

const DrawerCartItem: React.FC<DrawerCartItemProps> = ({ cartItem }) => {
  const { updateCartQuantity, removeFromCart } = useCartContext();
  const { item, quantity, specialInstructions } = cartItem;
  const [isEditingInstructions, setIsEditingInstructions] = useState(false);
  const [instructions, setInstructions] = useState(specialInstructions || '');

  const handleSaveInstructions = () => {
    updateCartQuantity(item, quantity, instructions);
    setIsEditingInstructions(false);
  };

  return (
    <div className="py-3 border-b border-white/5 last:border-b-0">
      <div className="flex items-center space-x-3">
        <img src={item.image} alt={item.name} className="flex-shrink-0 w-16 h-16 object-cover rounded-lg" loading="lazy" />
        <div className="flex-grow min-w-0">
          <h4 className="font-semibold text-stone-200 truncate">{item.name}</h4>
          <p className="font-bold text-orange-400">{formatIndonesianCurrency(item.price * quantity)}</p>
          {specialInstructions && !isEditingInstructions && (
            <p className="text-xs text-stone-400 mt-1 italic line-clamp-2">
              📝 {specialInstructions}
            </p>
          )}
        </div>
        <div className="flex-shrink-0 flex items-center space-x-2">
          <QuantitySelector quantity={quantity} onQuantityChange={(newQuantity) => updateCartQuantity(item, newQuantity, specialInstructions)} />
          <button 
            onClick={() => removeFromCart(item.id)} 
            className="p-2 text-red-500 hover:text-red-400 rounded-full hover:bg-white/10 transition-colors"
            aria-label={`Remove ${item.name}`}
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Edit Instructions Button */}
      {!isEditingInstructions && (
        <button
          onClick={() => setIsEditingInstructions(true)}
          className="mt-2 text-xs text-orange-400 hover:text-orange-300 underline"
        >
          {specialInstructions ? 'Edit instructions' : 'Add special instructions'}
        </button>
      )}

      {/* Instructions Editor */}
      {isEditingInstructions && (
        <div className="mt-3 space-y-2">
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value.slice(0, 500))}
            placeholder="e.g., Extra spicy, no onions..."
            className="w-full h-20 bg-stone-800 border border-stone-700 rounded-lg p-2 text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            maxLength={500}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500">{instructions.length} / 500</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setInstructions(specialInstructions || '');
                  setIsEditingInstructions(false);
                }}
                className="px-3 py-1 bg-stone-700 hover:bg-stone-600 text-white text-xs rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveInstructions}
                className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrawerCartItem;