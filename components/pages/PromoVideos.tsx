import React, { useState, useEffect, useRef } from 'react';
import { useDataContext } from '../../hooks/useDataContext';
import { useNavigationContext } from '../../hooks/useNavigationContext';
import { Vendor, Page } from '../../types';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';

const PromoVideos: React.FC = () => {
    const { vendors } = useDataContext();
    const { navigateTo } = useNavigationContext();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const playerRefs = useRef<(Player | null)[]>([]);

    // Get all vendors with promotional videos (Gold members)
    const videosVendors = vendors.filter(v => v.promotionalVideoUrl && v.promotionalVideoUrl.trim() !== '');

    useEffect(() => {
        // Initialize Video.js players
        videoRefs.current.forEach((videoElement, index) => {
            if (videoElement && !playerRefs.current[index]) {
                const player = videojs(videoElement, {
                    controls: false,
                    autoplay: index === currentIndex,
                    loop: true,
                    muted: false,
                    fluid: false,
                    fill: true,
                    preload: 'auto',
                    aspectRatio: '9:16',
                    responsive: true,
                });

                playerRefs.current[index] = player;
            }
        });

        return () => {
            playerRefs.current.forEach(player => {
                if (player) {
                    player.dispose();
                }
            });
            playerRefs.current = [];
        };
    }, [videosVendors.length]);

    // Play/pause based on current index
    useEffect(() => {
        playerRefs.current.forEach((player, index) => {
            if (player) {
                if (index === currentIndex) {
                    player.play().catch(() => {});
                    player.muted(false);
                } else {
                    player.pause();
                }
            }
        });
    }, [currentIndex]);

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientY);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientY);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        
        const distance = touchStart - touchEnd;
        const isSwipeUp = distance > 50;
        const isSwipeDown = distance < -50;

        if (isSwipeUp && currentIndex < videosVendors.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else if (isSwipeDown && currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }

        setTouchStart(0);
        setTouchEnd(0);
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (e.deltaY > 0 && currentIndex < videosVendors.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else if (e.deltaY < 0 && currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const toggleMute = (index: number) => {
        const player = playerRefs.current[index];
        if (player) {
            player.muted(!player.muted());
        }
    };

    if (videosVendors.length === 0) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center text-white">
                <div className="text-center">
                    <p className="text-2xl mb-4">No promotional videos available</p>
                    <button
                        onClick={() => navigateTo(Page.HOME)}
                        className="px-6 py-3 bg-orange-500 rounded-full font-bold"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div 
            className="fixed inset-0 bg-black overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
        >
            {/* Video Container - Snap Scroll */}
            <div 
                className="h-full w-full transition-transform duration-500 ease-out"
                style={{ 
                    transform: `translateY(-${currentIndex * 100}vh)`,
                }}
            >
                {videosVendors.map((vendor, index) => (
                    <div 
                        key={vendor.id}
                        className="relative h-screen w-screen flex items-center justify-center"
                    >
                        {/* Video Player */}
                        <video
                            ref={el => videoRefs.current[index] = el}
                            className="video-js vjs-big-play-centered"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        >
                            <source src={vendor.promotionalVideoUrl} type="video/mp4" />
                        </video>

                        {/* Overlay Info - Bottom */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                            <div className="flex items-end justify-between">
                                {/* Restaurant Info */}
                                <div className="flex-1">
                                    <h2 className="text-white text-2xl font-bold mb-2">
                                        {vendor.name}
                                    </h2>
                                    <p className="text-white/90 text-sm mb-1">
                                        📍 {vendor.address} • {vendor.street}
                                    </p>
                                    <p className="text-white/80 text-sm mb-3">
                                        {vendor.cuisine} • ⭐ {vendor.rating}
                                    </p>
                                    {vendor.bio && (
                                        <p className="text-white/90 text-sm line-clamp-2">
                                            {vendor.bio}
                                        </p>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col items-center gap-4 ml-4">
                                    {/* Like */}
                                    <button className="flex flex-col items-center">
                                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-1">
                                            <span className="text-2xl">❤️</span>
                                        </div>
                                        <span className="text-white text-xs">{vendor.likes || 0}</span>
                                    </button>

                                    {/* Visit Profile */}
                                    <button 
                                        onClick={() => {
                                            // Navigate to home page
                                            navigateTo(Page.HOME);
                                        }}
                                        className="flex flex-col items-center"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-1">
                                            <span className="text-2xl">🏠</span>
                                        </div>
                                        <span className="text-white text-xs">Home</span>
                                    </button>

                                    {/* Mute/Unmute */}
                                    <button 
                                        onClick={() => toggleMute(index)}
                                        className="flex flex-col items-center"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                            <span className="text-2xl">
                                                {playerRefs.current[index]?.muted() ? '🔇' : '🔊'}
                                            </span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Close Button */}
                        {index === currentIndex && (
                            <button
                                onClick={() => navigateTo(Page.HOME)}
                                className="absolute top-6 left-6 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white text-2xl z-50"
                            >
                                ×
                            </button>
                        )}

                        {/* Swipe Hint removed - users will naturally discover swipe */}
                    </div>
                ))}
            </div>

            {/* Video Counter */}
            <div className="absolute top-6 right-6 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
                {currentIndex + 1} / {videosVendors.length}
            </div>
        </div>
    );
};

export default PromoVideos;
