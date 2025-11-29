import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4 flex items-center space-x-4">
        <div className="p-3 bg-black/20 rounded-full text-orange-400">{icon}</div>
        <div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-stone-400">{title}</p>
        </div>
    </div>
);
