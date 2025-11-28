import React, { useState } from 'react';
import VideoPlayer from './VideoPlayer';

interface RestaurantPromoVideoProps {
    videoUrl: string;
    restaurantName: string;
    posterImage?: string;
    onClose?: () => void;
}

const RestaurantPromoVideo: React.FC<RestaurantPromoVideoProps> = ({
    videoUrl,
    restaurantName,
    posterImage,
    onClose
}) => {
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);

    return (
        <div className="relative w-full h-full bg-black">
            {/* Full-screen TikTok-style video container */}
            <div className="absolute inset-0 flex items-center justify-center">
                <VideoPlayer
                    src={videoUrl}
                    poster={posterImage}
                    autoplay={true}
                    loop={true}
                    muted={isMuted}
                    controls={false}
                    className="w-full h-full"
                />
            </div>

            {/* Custom overlay controls */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Top gradient overlay */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
                
                {/* Bottom gradient overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/80 to-transparent" />

                {/* Restaurant name at bottom */}
                <div className="absolute bottom-6 left-6 right-6 pointer-events-auto">
                    <h2 className="text-white text-2xl font-bold mb-2">{restaurantName}</h2>
                    <div className="flex items-center gap-2 text-white/80 text-sm">
                        <span className="px-3 py-1 bg-orange-500 rounded-full font-semibold">
                            ⭐ Gold Member
                        </span>
                        <span>Promotional Video</span>
                    </div>
                </div>

                {/* Sound toggle button */}
                <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="absolute bottom-32 right-6 p-4 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70 transition-all pointer-events-auto"
                >
                    {isMuted ? (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                    )}
                </button>

                {/* Close button */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-3 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70 transition-all pointer-events-auto"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
};

export default RestaurantPromoVideo;
