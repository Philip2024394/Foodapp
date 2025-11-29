import React, { useState } from 'react';
import { BankDetails, PaymentProof, PaymentStatus } from '../../types';

interface AdminPaymentManagementProps {
  bankDetails: BankDetails;
  onUpdateBankDetails: (details: BankDetails) => void;
  pendingPayments: PaymentProof[];
  onVerifyPayment: (paymentId: string, approved: boolean, reason?: string) => void;
}

export const AdminPaymentManagement: React.FC<AdminPaymentManagementProps> = ({
  bankDetails,
  onUpdateBankDetails,
  pendingPayments,
  onVerifyPayment
}) => {
  const [activeTab, setActiveTab] = useState<'bank' | 'pending' | 'history'>('bank');
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [selectedProof, setSelectedProof] = useState<PaymentProof | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Bank details form state
  const [bankForm, setBankForm] = useState({
    bankName: bankDetails.bankName,
    accountHolderName: bankDetails.accountHolderName,
    accountNumber: bankDetails.accountNumber,
    displayMessage: bankDetails.displayMessage || ''
  });

  const handleSaveBankDetails = () => {
    if (!bankForm.bankName || !bankForm.accountHolderName || !bankForm.accountNumber) {
      alert('❌ Please fill in all required fields');
      return;
    }

    onUpdateBankDetails(bankForm);
    setIsEditingBank(false);
    alert('✅ Bank details updated successfully!');
  };

  const handleApprovePayment = (payment: PaymentProof) => {
    if (confirm(`✅ Approve payment from ${payment.driverName}?\n\nAmount: Rp ${payment.amount.toLocaleString()}\nMonth: ${payment.monthNumber}`)) {
      onVerifyPayment(payment.id, true);
      setSelectedProof(null);
    }
  };

  const handleRejectPayment = (payment: PaymentProof) => {
    if (!rejectionReason.trim()) {
      alert('❌ Please provide a rejection reason');
      return;
    }

    if (confirm(`❌ Reject payment from ${payment.driverName}?\n\nReason: ${rejectionReason}`)) {
      onVerifyPayment(payment.id, false, rejectionReason);
      setSelectedProof(null);
      setRejectionReason('');
    }
  };

  const pendingCount = pendingPayments.filter(p => p.status === PaymentStatus.PROOF_UPLOADED).length;

  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 mb-6 shadow-xl">
          <h1 className="text-3xl font-bold text-white mb-2">💰 Payment Management</h1>
          <p className="text-white/90">Manage bank details and verify driver payments</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab('bank')}
            className={`flex-1 py-3 rounded-lg font-bold transition ${
              activeTab === 'bank'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            🏦 Bank Details
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-3 rounded-lg font-bold transition relative ${
              activeTab === 'pending'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            ⏳ Pending ({pendingCount})
            {pendingCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 rounded-lg font-bold transition ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            📜 History
          </button>
        </div>

        {/* Bank Details Tab */}
        {activeTab === 'bank' && (
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">🏦 Bank Account Details</h2>
              {!isEditingBank && (
                <button
                  onClick={() => setIsEditingBank(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-600 transition"
                >
                  ✏️ Edit
                </button>
              )}
            </div>

            {!isEditingBank ? (
              <div className="space-y-4">
                <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-2">Bank Name</p>
                  <p className="text-white font-bold text-lg">{bankDetails.bankName}</p>
                </div>

                <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-2">Account Holder Name</p>
                  <p className="text-white font-bold text-lg">{bankDetails.accountHolderName}</p>
                </div>

                <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-2">Account Number</p>
                  <p className="text-white font-bold text-2xl font-mono">{bankDetails.accountNumber}</p>
                </div>

                {bankDetails.displayMessage && (
                  <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500">
                    <p className="text-gray-400 text-sm mb-2">Display Message for Drivers</p>
                    <p className="text-blue-400">{bankDetails.displayMessage}</p>
                  </div>
                )}

                <div className="bg-yellow-500/10 border border-yellow-500 rounded-xl p-4">
                  <p className="text-yellow-400 text-sm">
                    ℹ️ These details will be shown to all drivers when they make monthly payments.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-gray-300 text-sm font-semibold mb-2 block">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    value={bankForm.bankName}
                    onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                    placeholder="e.g., Bank Mandiri"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-gray-300 text-sm font-semibold mb-2 block">
                    Account Holder Name *
                  </label>
                  <input
                    type="text"
                    value={bankForm.accountHolderName}
                    onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                    placeholder="e.g., PT IndaStreet Indonesia"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-gray-300 text-sm font-semibold mb-2 block">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    value={bankForm.accountNumber}
                    onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                    placeholder="e.g., 1234567890"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white font-mono text-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-gray-300 text-sm font-semibold mb-2 block">
                    Display Message (Optional)
                  </label>
                  <textarea
                    value={bankForm.displayMessage}
                    onChange={(e) => setBankForm({ ...bankForm, displayMessage: e.target.value })}
                    placeholder="e.g., Please include your driver ID in transfer notes"
                    rows={3}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setIsEditingBank(false);
                      setBankForm({
                        bankName: bankDetails.bankName,
                        accountHolderName: bankDetails.accountHolderName,
                        accountNumber: bankDetails.accountNumber,
                        displayMessage: bankDetails.displayMessage || ''
                      });
                    }}
                    className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-bold hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveBankDetails}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-bold hover:shadow-lg transition"
                  >
                    💾 Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pending Payments Tab */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            {pendingPayments.filter(p => p.status === PaymentStatus.PROOF_UPLOADED).length === 0 ? (
              <div className="bg-gray-800 rounded-2xl p-12 text-center border border-gray-700">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-bold text-white mb-2">All Caught Up!</h3>
                <p className="text-gray-400">No pending payment proofs to verify</p>
              </div>
            ) : (
              pendingPayments
                .filter(p => p.status === PaymentStatus.PROOF_UPLOADED)
                .map((payment) => (
                  <div key={payment.id} className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Left: Payment Details */}
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">{payment.driverName}</h3>
                          <p className="text-gray-400 text-sm">Driver ID: {payment.driverId}</p>
                        </div>

                        <div className="bg-green-500/20 border border-green-500 rounded-xl p-4">
                          <p className="text-gray-400 text-sm mb-1">Amount Paid</p>
                          <p className="text-3xl font-bold text-green-400">Rp {payment.amount.toLocaleString()}</p>
                          <p className="text-gray-300 text-sm mt-1">Month {payment.monthNumber} Payment</p>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Uploaded:</span>
                            <span className="text-white">{new Date(payment.uploadedAt).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Payment Date:</span>
                            <span className="text-white">{new Date(payment.paymentDate).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApprovePayment(payment)}
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-bold hover:shadow-lg transition"
                          >
                            ✅ Approve
                          </button>
                          <button
                            onClick={() => setSelectedProof(payment)}
                            className="flex-1 bg-red-500 text-white py-3 rounded-lg font-bold hover:bg-red-600 transition"
                          >
                            ❌ Reject
                          </button>
                        </div>
                      </div>

                      {/* Right: Payment Proof Image */}
                      <div>
                        <p className="text-gray-400 text-sm mb-2">Payment Proof Screenshot</p>
                        <div className="rounded-xl overflow-hidden border-2 border-gray-700">
                          <img
                            src={payment.proofImageUrl}
                            alt="Payment proof"
                            className="w-full h-full object-contain bg-gray-900"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">📜 Payment History</h2>
            
            <div className="space-y-3">
              {pendingPayments
                .filter(p => p.status !== PaymentStatus.PROOF_UPLOADED && p.status !== PaymentStatus.PENDING)
                .map((payment) => (
                  <div key={payment.id} className={`rounded-xl p-4 border-2 ${
                    payment.status === PaymentStatus.VERIFIED
                      ? 'bg-green-500/10 border-green-500'
                      : 'bg-red-500/10 border-red-500'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-bold">{payment.driverName}</p>
                        <p className="text-gray-400 text-sm">
                          Month {payment.monthNumber} - Rp {payment.amount.toLocaleString()}
                        </p>
                        {payment.status === PaymentStatus.REJECTED && payment.rejectionReason && (
                          <p className="text-red-400 text-sm mt-1">Reason: {payment.rejectionReason}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          payment.status === PaymentStatus.VERIFIED
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                        }`}>
                          {payment.status === PaymentStatus.VERIFIED ? '✅ Verified' : '❌ Rejected'}
                        </span>
                        <p className="text-gray-400 text-xs mt-1">
                          {payment.verifiedAt && new Date(payment.verifiedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {selectedProof && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6 border border-red-500">
            <h3 className="text-2xl font-bold text-white mb-4">❌ Reject Payment</h3>
            <p className="text-gray-300 mb-4">
              Rejecting payment from <span className="font-bold text-white">{selectedProof.driverName}</span>
            </p>
            
            <label className="text-gray-300 text-sm font-semibold mb-2 block">
              Rejection Reason *
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Invalid payment proof, wrong amount, unclear screenshot"
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedProof(null);
                  setRejectionReason('');
                }}
                className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-bold hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRejectPayment(selectedProof)}
                className="flex-1 bg-red-500 text-white py-3 rounded-lg font-bold hover:bg-red-600 transition"
              >
                ❌ Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
