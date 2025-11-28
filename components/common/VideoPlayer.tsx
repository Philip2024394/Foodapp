import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';

interface VideoPlayerProps {
    src: string;
    poster?: string;
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
    controls?: boolean;
    className?: string;
    onEnded?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
    src,
    poster,
    autoplay = true,
    loop = true,
    muted = true,
    controls = true,
    className = '',
    onEnded
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const playerRef = useRef<Player | null>(null);

    useEffect(() => {
        // Make sure Video.js player is only initialized once
        if (!playerRef.current && videoRef.current) {
            const videoElement = videoRef.current;

            const player = playerRef.current = videojs(videoElement, {
                autoplay,
                loop,
                muted,
                controls,
                preload: 'auto',
                fluid: true,
                responsive: true,
                aspectRatio: '9:16', // TikTok-style vertical video
                playbackRates: [0.5, 1, 1.5, 2],
                controlBar: {
                    volumePanel: {
                        inline: false
                    }
                }
            }, () => {
                // Player is ready
                console.log('Video.js player is ready');
            });

            // Add event listeners
            if (onEnded) {
                player.on('ended', onEnded);
            }

            // Error handling
            player.on('error', () => {
                console.error('Video playback error');
            });
        }
    }, [autoplay, loop, muted, controls, onEnded]);

    // Dispose the Video.js player when the component unmounts
    useEffect(() => {
        const player = playerRef.current;

        return () => {
            if (player && !player.isDisposed()) {
                player.dispose();
                playerRef.current = null;
            }
        };
    }, []);

    // Update source when it changes
    useEffect(() => {
        const player = playerRef.current;

        if (player && src) {
            player.src({ src, type: 'video/mp4' });
        }
    }, [src]);

    return (
        <div data-vjs-player className={className}>
            <video
                ref={videoRef}
                className="video-js vjs-big-play-centered vjs-theme-fantasy"
                poster={poster}
                playsInline
            />
        </div>
    );
};

export default VideoPlayer;
