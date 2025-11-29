import React from 'react';
import { Vendor } from '../../types';
import { INDONESIAN_BANKS } from './constants';
import { formatPhoneNumberDisplay } from '../../utils/whatsapp';

interface RestaurantBankTabProps {
    vendor: Vendor;
    bankFormData: {
        bankName: string;
        accountHolder: string;
        accountNumber: string;
    };
    whatsAppFormData: string;
    setBankFormData: React.Dispatch<React.SetStateAction<{
        bankName: string;
        accountHolder: string;
        accountNumber: string;
    }>>;
    setWhatsAppFormData: React.Dispatch<React.SetStateAction<string>>;
    handleSaveBankDetails: () => void;
}

const RestaurantBankTab: React.FC<RestaurantBankTabProps> = ({
    vendor,
    bankFormData,
    whatsAppFormData,
    setBankFormData,
    setWhatsAppFormData,
    handleSaveBankDetails
}) => {
    return (
        <div className="space-y-6">
            {/* Feature Explanation */}
            <div className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border-2 border-teal-500/30 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">
                    <span className="text-3xl">🏦</span>
                    Bank Details & Payment
                </h2>
                <p className="text-stone-300 text-lg mb-4">
                    Setup your bank account to receive payments. Customers can transfer money directly to your account for orders.
                </p>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white/10 rounded-lg p-3">
                        <div className="font-bold text-green-400 mb-1">🏦 Bank Transfer</div>
                        <div className="text-stone-400">Direct payments to your account</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                        <div className="font-bold text-blue-400 mb-1">💳 Multiple Methods</div>
                        <div className="text-stone-400">Support BCA, Mandiri, GoPay, etc.</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                        <div className="font-bold text-purple-400 mb-1">💰 Delivery Fee</div>
                        <div className="text-stone-400">Set your standard delivery charge</div>
                    </div>
                </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-4">🏦 Payment Setup</h2>
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-8">
                <div className="space-y-6">
                    <div>
                        <label className="block text-lg font-medium text-stone-300 mb-3">Select Bank <span className="text-red-500">*</span></label>
                        <select
                            value={bankFormData.bankName}
                            onChange={(e) => setBankFormData(prev => ({ ...prev, bankName: e.target.value }))}
                            className="w-full p-4 bg-white border border-stone-700 rounded-xl text-white text-lg"
                        >
                            <option value="">-- Choose Indonesian Bank --</option>
                            {INDONESIAN_BANKS.map(bank => (
                                <option key={bank} value={bank}>{bank}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-lg font-medium text-stone-300 mb-3">Account Holder Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            placeholder="e.g., Ani Lestari"
                            value={bankFormData.accountHolder}
                            onChange={(e) => setBankFormData(prev => ({ ...prev, accountHolder: e.target.value }))}
                            className="w-full p-4 bg-white border border-stone-700 rounded-xl text-white text-lg placeholder-stone-600"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-lg font-medium text-stone-300 mb-3">Account Number <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            placeholder="e.g., 1234567890"
                            value={bankFormData.accountNumber}
                            onChange={(e) => setBankFormData(prev => ({ ...prev, accountNumber: e.target.value.replace(/\D/g, '') }))}
                            className="w-full p-4 bg-white border border-stone-700 rounded-xl text-white text-lg font-mono placeholder-stone-600"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-lg font-medium text-stone-300 mb-3 flex items-center gap-2">
                            <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                            </svg>
                            WhatsApp Number
                        </label>
                        <input
                            type="tel"
                            placeholder="e.g., 08123456789"
                            value={whatsAppFormData}
                            onChange={(e) => setWhatsAppFormData(e.target.value.replace(/\D/g, ''))}
                            className="w-full p-4 bg-white border border-green-500/30 rounded-xl text-white text-lg font-mono placeholder-stone-600"
                        />
                        <p className="text-sm text-stone-400 mt-2">Customers will contact you via WhatsApp for orders</p>
                    </div>
                    
                    {vendor.bankDetails?.bankName && (
                        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                            <p className="text-green-400 font-semibold mb-2">✅ Current Bank Details:</p>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="text-stone-500">Bank</p>
                                    <p className="text-white font-bold">{vendor.bankDetails.bankName}</p>
                                </div>
                                <div>
                                    <p className="text-stone-500">Account Holder</p>
                                    <p className="text-white font-bold">{vendor.bankDetails.accountHolder}</p>
                                </div>
                                <div>
                                    <p className="text-stone-500">Account Number</p>
                                    <p className="text-white font-mono font-bold">{vendor.bankDetails.accountNumber}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <button
                        onClick={handleSaveBankDetails}
                        disabled={!bankFormData.bankName || !bankFormData.accountHolder || !bankFormData.accountNumber}
                        className="w-full p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-xl rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        💾 Save Bank Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RestaurantBankTab;
