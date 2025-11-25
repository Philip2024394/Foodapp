
import React from 'react';

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    name: string;
    image: string;
    rating?: number;
  } | null;
}

const StarIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ isOpen, onClose, item }) => {
  if (!isOpen || !item) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 transition-opacity animate-fade-in-scale"
      onClick={onClose}
    >
      <div
        className="relative w-[90vw] h-[90vw] max-w-[500px] max-h-[500px]"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-2xl shadow-2xl" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg hover:bg-red-700 transform hover:scale-110 transition-all z-10 ring-2 ring-black/75"
          aria-label="Close image preview"
        >
          &times;
        </button>

        {/* Rating Overlay (Top Right) */}
        {item.rating && (
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1.5 flex items-center space-x-1.5">
                <StarIcon className="text-amber-400 h-4 w-4" />
                <span className="font-bold text-white text-sm drop-shadow-md">{item.rating}</span>
            </div>
        )}

        {/* Info Overlay (Bottom) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl">
            <h3 className="text-2xl font-bold text-white drop-shadow-md">{item.name}</h3>
        </div>
      </div>
    </div>
  );
};

export default ImagePreviewModal;
