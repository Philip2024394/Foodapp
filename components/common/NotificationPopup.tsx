import React from 'react';
import { useNavigationContext } from '../../hooks/useNavigationContext';

const NotificationPopup: React.FC = () => {
    const { notification, hideNotification } = useNavigationContext();

    if (!notification) {
        return null;
    }

    return (
        <div 
            className="fixed top-5 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50 animate-fade-in-scale"
            onClick={hideNotification}
        >
            <div className="bg-stone-800/80 backdrop-blur-lg border border-stone-700 rounded-xl shadow-2xl p-4 flex items-center space-x-4 cursor-pointer">
                <img src={notification.avatar} alt={notification.sender} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-center">
                        <p className="font-bold text-stone-100">{notification.sender}</p>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                hideNotification();
                            }} 
                            className="text-stone-500 hover:text-white"
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-stone-300 text-sm truncate">{notification.message}</p>
                </div>
            </div>
        </div>
    );
};

export default NotificationPopup;