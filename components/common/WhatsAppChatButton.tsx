import React from 'react';
import { WhatsAppIcon } from './Icon';
import { useAuthContext } from '../../hooks/useAuthContext';

interface WhatsAppChatButtonProps {
  phoneNumber: string | undefined;
  defaultMessage: string;
}

const WhatsAppChatButton: React.FC<WhatsAppChatButtonProps> = ({ phoneNumber, defaultMessage }) => {
  const { whatsappNumber: userWhatsApp } = useAuthContext();

  // The button will only appear if both the user and the provider have a WhatsApp number
  if (!userWhatsApp || !phoneNumber) {
    return null;
  }

  const handleContact = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card clicks or other parent events
    const encodedMessage = encodeURIComponent(defaultMessage);
    const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleContact}
      className="bg-green-500 text-white rounded-full p-2 shadow-lg hover:bg-green-600 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-800 focus:ring-green-500"
      aria-label="Chat via WhatsApp"
    >
      <WhatsAppIcon className="h-5 w-5" />
    </button>
  );
};

export default WhatsAppChatButton;
