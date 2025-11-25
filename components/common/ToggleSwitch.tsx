import React, { FC } from 'react';

interface ToggleSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    id?: string;
}

const ToggleSwitch: FC<ToggleSwitchProps> = ({ checked, onChange, id }) => (
    <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
        <input 
            type="checkbox" 
            id={id}
            checked={checked} 
            onChange={(e) => onChange(e.target.checked)} 
            className="sr-only peer" 
        />
        <div className="w-11 h-6 bg-white/10 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-500/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-white/20 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
    </label>
);

export default ToggleSwitch;