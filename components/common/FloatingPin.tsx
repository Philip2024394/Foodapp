import React from 'react';
// Fix: Renamed LocationMarkerIcon to LocationPinIcon
import { LocationPinIcon } from './Icon';

export const FloatingPin: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div className="absolute text-orange-500/50" style={{ animation: 'float ease-in-out infinite', ...style }}>
    <LocationPinIcon className="w-full h-full" />
  </div>
);
