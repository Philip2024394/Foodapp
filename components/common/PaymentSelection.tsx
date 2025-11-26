import React, { useState } from 'react';
import { PaymentMethod, PaymentProvider, Vendor } from '../../types';
import { XMarkIcon, CheckCircleIcon, CashIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { formatIndonesianCurrency } from '../../utils/formatters';

interface PaymentSelectionProps {
    vendor: Vendor;
    subtotal: number;
    deliveryFee: number;
    total: number;
    onSelect: (method: PaymentMethod, provider?: PaymentProvider) => void;
    onClose: () => void;
}

const PaymentSelection: React.FC<PaymentSelectionProps> = ({ 
    vendor, 
    subtotal, 
    deliveryFee, 
    total, 
    onSelect, 
    onClose 
}) => {
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
    const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);

    const handleCashOnDelivery = () => {
        setSelectedMethod(PaymentMethod.CASH_ON_DELIVERY);
        onSelect(PaymentMethod.CASH_ON_DELIVERY);
    };

    const handleBankTransferSelect = () => {
        setSelectedMethod(PaymentMethod.BANK_TRANSFER);
    };

    const handleProviderSelect = (provider: PaymentProvider) => {
        setSelectedProvider(provider);
    };

    const handleConfirmTransfer = () => {
        if (selectedProvider) {
            onSelect(PaymentMethod.BANK_TRANSFER, selectedProvider);
        }
    };

    const getProviderIcon = (provider: PaymentProvider) => {
        const icons: Record<PaymentProvider, string> = {
            [PaymentProvider.BCA]: '💳',
            [PaymentProvider.MANDIRI]: '🏦',
            [PaymentProvider.BNI]: '🏛️',
            [PaymentProvider.BRI]: '🏪',
            [PaymentProvider.GOPAY]: '🟢',
            [PaymentProvider.OVO]: '🟣',
            [PaymentProvider.DANA]: '🔵'
        };
        return icons[provider] || '💰';
    };

    const restaurantAmount = total - deliveryFee;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
                    <h2 className="text-xl font-bold text-gray-900">Select Payment Method</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-6 space-y-6">
                    {/* Order Summary */}
                    <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                        <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-semibold">{formatIndonesianCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Delivery Fee</span>
                                <span className="font-semibold">{formatIndonesianCurrency(deliveryFee)}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-orange-300">
                                <span className="font-bold text-gray-900">Total</span>
                                <span className="font-bold text-orange-600">{formatIndonesianCurrency(total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    {!selectedMethod && (
                        <div className="space-y-3">
                            {/* Cash on Delivery */}
                            <button
                                onClick={handleCashOnDelivery}
                                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                        <span className="text-2xl">💵</span>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-lg">Cash on Delivery</p>
                                        <p className="text-sm text-green-100">Pay {formatIndonesianCurrency(total)} to driver</p>
                                    </div>
                                </div>
                                <span className="text-2xl group-hover:translate-x-2 transition-transform">→</span>
                            </button>

                            {/* Bank Transfer */}
                            <button
                                onClick={handleBankTransferSelect}
                                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                        <span className="text-2xl">🏦</span>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-lg">Bank Transfer</p>
                                        <p className="text-sm text-blue-100">Transfer to restaurant directly</p>
                                    </div>
                                </div>
                                <span className="text-2xl group-hover:translate-x-2 transition-transform">→</span>
                            </button>
                        </div>
                    )}

                    {/* Bank Transfer Provider Selection */}
                    {selectedMethod === PaymentMethod.BANK_TRANSFER && (
                        <div className="space-y-4 animate-fade-in-scale">
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                <p className="text-sm text-blue-900 mb-2">
                                    <strong>Note:</strong> You will pay <strong>{formatIndonesianCurrency(restaurantAmount)}</strong> to the restaurant (excluding delivery fee of {formatIndonesianCurrency(deliveryFee)}).
                                </p>
                                <p className="text-xs text-blue-700">
                                    Pay delivery fee separately to the driver in cash when your order arrives.
                                </p>
                            </div>

                            <h3 className="font-semibold text-gray-900">Select Payment Provider</h3>
                            
                            {vendor.acceptedPaymentProviders && vendor.acceptedPaymentProviders.length > 0 ? (
                                <div className="grid grid-cols-2 gap-3">
                                    {vendor.acceptedPaymentProviders.map((provider) => (
                                        <button
                                            key={provider}
                                            onClick={() => handleProviderSelect(provider)}
                                            className={`p-4 rounded-xl border-2 transition-all ${
                                                selectedProvider === provider
                                                    ? 'border-orange-500 bg-orange-50 shadow-lg scale-105'
                                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="text-3xl mb-2">{getProviderIcon(provider)}</div>
                                            <p className="font-semibold text-sm text-gray-900">{provider}</p>
                                            {selectedProvider === provider && (
                                                <CheckCircleIcon className="w-5 h-5 text-orange-500 mx-auto mt-2" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 bg-gray-50 rounded-xl">
                                    <p className="text-gray-500">No payment providers configured for this restaurant</p>
                                </div>
                            )}

                            {selectedProvider && vendor.bankDetails && (
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
                                    <h4 className="font-semibold text-gray-900">Transfer Details</h4>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <p className="text-gray-600">Bank Name</p>
                                            <p className="font-semibold text-gray-900">{vendor.bankDetails.bankName}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Account Number</p>
                                            <p className="font-semibold text-gray-900 text-lg tracking-wider">{vendor.bankDetails.accountNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Account Holder</p>
                                            <p className="font-semibold text-gray-900">{vendor.bankDetails.accountHolder}</p>
                                        </div>
                                        <div className="pt-2 border-t border-gray-300">
                                            <p className="text-gray-600">Transfer Amount</p>
                                            <p className="font-bold text-orange-600 text-xl">{formatIndonesianCurrency(restaurantAmount)}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setSelectedMethod(null);
                                        setSelectedProvider(null);
                                    }}
                                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleConfirmTransfer}
                                    disabled={!selectedProvider}
                                    className="flex-1 px-4 py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Confirm Payment Method
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentSelection;
