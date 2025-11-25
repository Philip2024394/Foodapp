import React from 'react';
import { ShareIcon, MoreVerticalIcon, DownloadIcon } from './Icon';

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InstallPwaModal: React.FC<InstallPwaModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const backgroundImageUrl = 'https://ik.imagekit.io/7grri5v7d/get%20the%20full%20app%20experince.png?updatedAt=1760181640150';

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-[60] transition-opacity animate-fade-in-scale"
      onClick={onClose}
    >
      <div
        className="bg-cover bg-center border border-white/10 rounded-2xl shadow-2xl m-4 max-w-md w-full relative transform transition-all text-white overflow-hidden"
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative p-6">
            <div className="text-center">
                <DownloadIcon className="h-12 w-12 text-orange-500 mx-auto" />
                <h2 className="text-2xl font-bold mt-4">Get the Full App Experience!</h2>
                <p className="text-stone-300 mt-2">
                    Install IndoStreet to your home screen for faster access and a fullscreen interface.
                </p>
            </div>

            <div className="mt-6 space-y-6">
                {/* iOS/Safari Instructions */}
                <div className="bg-white/5 backdrop-blur-md p-4 rounded-lg border border-white/10">
                    <h3 className="font-bold text-lg mb-2">On iPhone / iPad</h3>
                    <div className="flex items-center space-x-4 text-sm">
                        <ShareIcon className="h-10 w-10 flex-shrink-0 text-stone-300" />
                        <ol className="list-decimal list-inside space-y-1 text-stone-300">
                            <li>Tap the <strong>Share</strong> icon in your browser's toolbar.</li>
                            <li>Scroll down and tap <strong>'Add to Home Screen'</strong>.</li>
                        </ol>
                    </div>
                </div>

                {/* Android/Chrome Instructions */}
                <div className="bg-white/5 backdrop-blur-md p-4 rounded-lg border border-white/10">
                    <h3 className="font-bold text-lg mb-2">On Android / Chrome</h3>
                    <div className="flex items-center space-x-4 text-sm">
                        <MoreVerticalIcon className="h-10 w-10 flex-shrink-0 text-stone-300" />
                        <ol className="list-decimal list-inside space-y-1 text-stone-300">
                            <li>Tap the <strong>three-dots menu</strong> icon in your browser.</li>
                            <li>Tap <strong>'Install app'</strong> or <strong>'Add to Home Screen'</strong>.</li>
                        </ol>
                    </div>
                </div>
            </div>

            <button
                onClick={onClose}
                className="mt-6 w-full px-4 py-3 bg-orange-600 font-semibold rounded-lg hover:bg-orange-700 transition-colors shadow-lg"
            >
                Continue in Browser
            </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPwaModal;