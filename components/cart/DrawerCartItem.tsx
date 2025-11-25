import React from 'react';
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
  const { item, quantity } = cartItem;

  return (
    <div className="flex items-center space-x-3 py-2 border-b border-white/5 last:border-b-0">
      <img src={item.image} alt={item.name} className="flex-shrink-0 w-16 h-16 object-cover rounded-lg" loading="lazy" />
      <div className="flex-grow min-w-0">
        <h4 className="font-semibold text-stone-200 truncate">{item.name}</h4>
        <p className="font-bold text-orange-400">{formatIndonesianCurrency(item.price * quantity)}</p>
      </div>
      <div className="flex-shrink-0 flex items-center space-x-2">
        <QuantitySelector quantity={quantity} onQuantityChange={(newQuantity) => updateCartQuantity(item, newQuantity)} />
        <button 
          onClick={() => removeFromCart(item.id)} 
          className="p-2 text-red-500 hover:text-red-400 rounded-full hover:bg-white/10 transition-colors"
          aria-label={`Remove ${item.name}`}
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default DrawerCartItem;