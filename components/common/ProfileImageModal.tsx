import React from 'react';
import { useNavigationContext } from '../../hooks/useNavigationContext';
import { CloseIcon } from './Icon';

const ProfileImageModal: React.FC = () => {
  const { isProfileImageModalOpen, profileImageModalUrl, closeProfileImageModal } = useNavigationContext();

  if (!isProfileImageModalOpen || !profileImageModalUrl) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 flex justify-center items-center z-[100] transition-opacity animate-fade-in-scale"
      onClick={closeProfileImageModal}
    >
      <div
        className="relative w-[90vw] h-[90vw] max-w-[500px] max-h-[500px]"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={profileImageModalUrl}
          alt="Profile image preview"
          className="w-full h-full object-cover rounded-full shadow-2xl border-4 border-orange-500/50"
        />
      </div>
      <button
        onClick={closeProfileImageModal}
        className="fixed top-5 right-5 w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg hover:bg-orange-700 transform hover:scale-110 transition-all z-[101]"
        aria-label="Close image preview"
      >
        <CloseIcon className="h-6 w-6" />
      </button>
    </div>
  );
};

export default ProfileImageModal;
