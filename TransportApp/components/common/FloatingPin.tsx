import React from 'react';

interface FloatingPinProps {
  style?: {
    top?: string;
    left?: string;
    animationDuration?: string;
    animationDelay?: string;
    width?: string;
    height?: string;
  };
}

export const FloatingPin: React.FC<FloatingPinProps> = ({ style = {} }) => {
  return (
    <div
      className="absolute opacity-30 animate-float"
      style={{
        top: style.top || '50%',
        left: style.left || '50%',
        animationDuration: style.animationDuration || '5s',
        animationDelay: style.animationDelay || '0s',
        width: style.width || '30px',
        height: style.height || '30px',
      }}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="text-orange-500">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    </div>
  );
};
