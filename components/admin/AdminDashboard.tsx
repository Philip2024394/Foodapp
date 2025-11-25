import React, { useState } from 'react';
import RideManagement from './TaxiManagement';
import VendorManagement from './VendorManagement';
import DestinationManagement from './DestinationManagement';
import VehicleAdmin from './VehicleAdmin';
import { VehicleType } from '../../types';

type AdminTab = 
    | 'car-rides' | 'bike-rides' | 'box-lorry-parcels' | 'flatbed-lorry-parcels'
    | 'cars' | 'bikes' | 'lorries' | 'jeeps' | 'buses' | 'vendors' | 'destinations'
    | 'settings';

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<AdminTab>('car-rides');

    const renderContent = () => {
        switch (activeTab) {
            case 'car-rides':
                return <RideManagement fleetTypes={[VehicleType.CAR]} title="Car Ride Fleet" />;
            case 'bike-rides':
                return <RideManagement fleetTypes={[VehicleType.BIKE]} title="Bike Ride Fleet" />;
            case 'box-lorry-parcels':
                return <RideManagement fleetTypes={[VehicleType.LORRY_BOX]} title="Box Lorry Parcel Fleet" />;
            case 'flatbed-lorry-parcels':
                return <RideManagement fleetTypes={[VehicleType.LORRY_FLATBED]} title="Flatbed Lorry Parcel Fleet" />;
            case 'cars':
                return <VehicleAdmin fleetTypes={[VehicleType.CAR]} title="Car Fleet (Rent/Sale)" />;
            case 'bikes':
                return <VehicleAdmin fleetTypes={[VehicleType.BIKE]} title="Bike Fleet (Rent/Sale)" />;
            case 'lorries':
                return <VehicleAdmin fleetTypes={[VehicleType.LORRY, VehicleType.LORRY_BOX, VehicleType.LORRY_FLATBED]} title="Lorry Fleet (Rent/Sale)" />;
            case 'jeeps':
                 return <VehicleAdmin fleetTypes={[VehicleType.JEEP]} title="Jeep Tour Fleet" />;
            case 'buses':
                 return <VehicleAdmin fleetTypes={[VehicleType.BUS]} title="Bus Fleet (Rent/Sale)" />;
            case 'vendors':
                return <VendorManagement />;
            case 'destinations':
                return <DestinationManagement />;
            case 'settings':
                // In a real application, a component for managing settings like API keys would go here.
                // Per development guidelines, API keys are handled via environment variables, so this is a placeholder.
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-stone-100">Integrations & Settings</h2>
                        <p className="text-stone-400 mt-2">API Keys (e.g., Google Maps, GenAI) are managed via secure environment variables and are not configurable through this UI.</p>
                    </div>
                );
            default:
                return null;
        }
    };

    const TabButton: React.FC<{ tab: AdminTab; label: string }> = ({ tab, label }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold rounded-t-lg transition-colors border-b-2 ${
                activeTab === tab 
                ? 'text-orange-400 border-orange-400' 
                : 'text-stone-400 border-transparent hover:text-stone-100'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-8 pb-16 animate-fade-in-scale">
            <div className="text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-stone-100">Admin Control Panel</h1>
                <p className="text-lg text-stone-400 mt-2">Manage all services and vendors from one place.</p>
            </div>

            <div className="bg-stone-800/60 backdrop-blur-lg border border-stone-700 rounded-2xl shadow-xl">
                <div className="border-b border-stone-700 px-4 overflow-x-auto">
                    <nav className="-mb-px flex space-x-2 whitespace-nowrap">
                        <TabButton tab="car-rides" label="Car Rides" />
                        <TabButton tab="bike-rides" label="Bike Rides" />
                        <TabButton tab="box-lorry-parcels" label="Box Lorries" />
                        <TabButton tab="flatbed-lorry-parcels" label="Flatbed Lorries" />
                        
                        <div className="border-l border-stone-600 mx-2"></div>

                        <TabButton tab="cars" label="Cars (Rent/Sale)" />
                        <TabButton tab="bikes" label="Bikes (Rent/Sale)" />
                        <TabButton tab="lorries" label="Lorries (Rent/Sale)" />
                        <TabButton tab="jeeps" label="Jeep Tours" />
                        <TabButton tab="buses" label="Buses (Rent/Sale)" />
                        
                        <div className="border-l border-stone-600 mx-2"></div>
                        
                        <TabButton tab="vendors" label="Vendors" />
                        <TabButton tab="destinations" label="Destinations" />

                        <div className="border-l border-stone-600 mx-2"></div>

                        <TabButton tab="settings" label="Settings" />
                    </nav>
                </div>
                <div className="p-6">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;