import React from 'react';
import { RestaurantEvent } from '../../types';

interface LiveStreamViewerProps {
    event: RestaurantEvent;
    vendorName: string;
    onClose: () => void;
}

const LiveStreamViewer: React.FC<LiveStreamViewerProps> = ({ event, vendorName, onClose }) => {
    const startTime = new Date(event.startTime);
    const endTime = new Date(event.endTime);
    const now = new Date();
    
    // Calculate time remaining
    const timeRemaining = endTime.getTime() - now.getTime();
    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

    return (
        <div 
            className="fixed inset-0 z-50 bg-black flex flex-col" 
            style={{ 
                height: '100dvh',
                width: '100vw'
            }}
        >
            {/* Header Bar */}
            <div className="bg-gradient-to-r from-green-600 to-green-500 p-4 flex items-center justify-between shadow-lg flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                            <div className="absolute inset-0 bg-white rounded-full animate-ping"></div>
                        </div>
                        <span className="text-white font-bold text-lg">LIVE EVENT</span>
                    </div>
                    <span className="text-white text-sm">🎉 {event.type}</span>
                </div>
                <button
                    onClick={onClose}
                    className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all"
                    aria-label="Close event view"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Full Screen Event Image */}
            <div className="flex-1 relative bg-black overflow-hidden" style={{ minHeight: 0, flex: '1 1 auto' }}>
                <img 
                    src={event.image} 
                    alt={event.name}
                    className="w-full h-full object-cover"
                    style={{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        minHeight: '100%',
                    }}
                />
                {/* Gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                
                {/* Event Details Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="bg-black/60 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                Happening Now
                            </div>
                            {timeRemaining > 0 && (
                                <div className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold">
                                    ⏱️ {hoursRemaining}h {minutesRemaining}m left
                                </div>
                            )}
                        </div>
                        <h2 className="text-3xl font-bold mb-2">{event.name}</h2>
                        <p className="text-lg font-semibold text-green-400 mb-3">@ {vendorName}</p>
                        <p className="text-stone-300 text-base leading-relaxed mb-3">{event.description}</p>
                        <div className="flex items-center gap-4 text-sm text-stone-400">
                            <div>
                                <span className="font-bold text-white">Start:</span> {startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div>
                                <span className="font-bold text-white">End:</span> {endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="bg-stone-900 p-4 border-t border-stone-700 flex items-center justify-between flex-shrink-0">
                <div>
                    <p className="text-white font-bold">{event.type} at {vendorName}! 🎉</p>
                    <p className="text-stone-400 text-sm">Visit us now and enjoy the experience</p>
                </div>
                <button
                    onClick={onClose}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg"
                >
                    View Menu
                </button>
            </div>
        </div>
    );
};

export default LiveStreamViewer;
