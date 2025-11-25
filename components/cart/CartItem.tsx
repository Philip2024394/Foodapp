import React from 'react';
import { CartItem } from '../../types';
import { TrashIcon } from '../common/Icon';
import QuantitySelector from '../common/QuantitySelector';
import { useCartContext } from '../../hooks/useCartContext';

interface CartItemProps {
  cartItem: CartItem;
}

const CartItemComponent: React.FC<CartItemProps> = ({ cartItem }) => {
  const { updateCartQuantity, removeFromCart } = useCartContext();
  const { item, quantity } = cartItem;
  const isFoodItem = 'category' in item;

  return (
    <div className="flex items-start space-x-4 py-4 border-b border-stone-700/50 last:border-b-0">
      {/* Image */}
      <img 
        src={item.image} 
        alt={item.name} 
        className={`flex-shrink-0 w-24 h-24 object-cover ${isFoodItem ? 'rounded-full' : 'rounded-lg'}`} 
        loading="lazy" 
      />
      
      {/* Details and Actions */}
      <div className="flex-grow flex flex-col min-w-0 h-24">
        {/* Top part: Info */}
        <div className="flex-grow">
          <h3 className="font-semibold text-stone-100 text-lg truncate">{item.name}</h3>
          <p className="text-sm text-stone-400 mt-1 line-clamp-2">{item.description}</p>
          <p className="font-bold text-stone-100 text-lg mt-1">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.price * quantity)}
          </p>
        </div>
        
        {/* Bottom part: Actions */}
        <div className="flex justify-between items-center mt-auto">
          <QuantitySelector 
            quantity={quantity}
            onQuantityChange={(newQuantity) => updateCartQuantity(item, newQuantity)}
          />
          <button 
            onClick={() => removeFromCart(item.id)} 
            className="text-red-500 hover:text-red-700 p-1"
            aria-label={`Remove ${item.name}`}
          >
            <TrashIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItemComponent;