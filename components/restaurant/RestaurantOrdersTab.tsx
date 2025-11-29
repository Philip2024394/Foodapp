import React from 'react';
import { Vendor, Booking } from '../../types';
import RestaurantPOS from '../common/RestaurantPOS';

interface RestaurantOrdersTabProps {
    vendor: Vendor;
    orders: Booking[];
}

const RestaurantOrdersTab: React.FC<RestaurantOrdersTabProps> = ({ vendor, orders }) => {
    return (
        <div className="space-y-6">
            {/* Feature Explanation */}
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500/30 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">
                    <span className="text-3xl">📋</span>
                    Orders & POS System
                </h2>
                <p className="text-stone-300 text-lg mb-4">
                    Real-time order management system. Accept, prepare, and track customer orders from start to delivery.
                </p>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white/10 rounded-lg p-3">
                        <div className="font-bold text-green-400 mb-1">✓ Accept Orders</div>
                        <div className="text-stone-400">Confirm or reject incoming orders instantly</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                        <div className="font-bold text-yellow-400 mb-1">👨‍🍳 Track Progress</div>
                        <div className="text-stone-400">Update status: Preparing → Ready → Delivered</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                        <div className="font-bold text-blue-400 mb-1">📞 Contact</div>
                        <div className="text-stone-400">Message customers via WhatsApp directly</div>
                    </div>
                </div>
            </div>
            
            <RestaurantPOS 
                vendorId={vendor.id}
                orders={orders} 
                onAcceptOrder={() => {}} 
                onRejectOrder={() => {}} 
                onUpdateStatus={() => {}}
                onPrintReceipt={() => {}}
            />
        </div>
    );
};

export default RestaurantOrdersTab;
