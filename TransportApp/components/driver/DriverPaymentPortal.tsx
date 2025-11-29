import React, { useState } from 'react';
import { Driver, BankDetails, getMembershipFee, getDaysUntilExpiry, PAYMENT_CLEARANCE_HOURS, MembershipStatus } from '../../types';

interface DriverPaymentPortalProps {
  driver: Driver;
  bankDetails: BankDetails;
  onUploadProof: (file: File) => void;
  onClose: () => void;
}

export const DriverPaymentPortal: React.FC<DriverPaymentPortalProps> = ({ 
  driver, 
  bankDetails,
  onUploadProof,
  onClose 
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const nextMonthNumber = driver.currentMonth + 1;
  const amountDue = getMembershipFee(nextMonthNumber);
  const daysRemaining = getDaysUntilExpiry(driver.currentPeriodEnd);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('❌ Please upload an image file (JPG, PNG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('❌ File too large! Maximum size is 5MB');
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('❌ Please select a payment proof screenshot first');
      return;
    }

    setIsUploading(true);
    
    try {
      await onUploadProof(selectedFile);
      alert('✅ Payment proof uploaded successfully!\n\n⏳ Verification takes up to 48 hours.\n\nYou will be notified once your payment is confirmed.');
      onClose();
    } catch (error) {
      alert('❌ Upload failed. Please try again.');
      setIsUploading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`✅ ${label} copied to clipboard!`);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-700 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">💰 Monthly Payment</h2>
              <p className="text-white/90">Month {nextMonthNumber} Membership Fee</p>
            </div>
            <button
              onClick={onClose}
              className="text-white text-3xl hover:bg-white/20 rounded-lg px-3 py-1 transition"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Amount Due Section */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-center shadow-lg">
            <p className="text-white/80 text-sm mb-2">💵 Amount to Pay</p>
            <p className="text-5xl font-bold text-white mb-2">Rp {amountDue.toLocaleString()}</p>
            <p className="text-white/90 text-lg">
              Month {nextMonthNumber} {nextMonthNumber === 1 ? '(First Month)' : nextMonthNumber === 2 ? '(Second Month)' : nextMonthNumber === 3 ? '(Third Month)' : ''}
            </p>
            {daysRemaining <= 7 && daysRemaining > 0 && (
              <p className="text-yellow-300 font-bold mt-2">
                ⏰ Due in {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
              </p>
            )}
            {daysRemaining <= 0 && (
              <p className="text-red-300 font-bold mt-2 animate-pulse">
                🚨 OVERDUE - Pay immediately!
              </p>
            )}
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <h3 className="text-white font-bold mb-3">📊 Membership Pricing</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>Month 1 (First):</span>
                <span className={nextMonthNumber === 1 ? 'text-green-400 font-bold' : ''}>Rp 100,000</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Month 2 (Second):</span>
                <span className={nextMonthNumber === 2 ? 'text-green-400 font-bold' : ''}>Rp 135,000</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Month 3 (Third):</span>
                <span className={nextMonthNumber === 3 ? 'text-green-400 font-bold' : ''}>Rp 170,000</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Month 4+ (All others):</span>
                <span className={nextMonthNumber >= 4 ? 'text-green-400 font-bold' : ''}>Rp 200,000</span>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-5 border-2 border-blue-500">
            <h3 className="text-blue-400 font-bold text-lg mb-4">🏦 Bank Transfer Details</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Bank Name</p>
                <div className="flex items-center justify-between">
                  <p className="text-white font-bold text-lg">{bankDetails.bankName}</p>
                  <button
                    onClick={() => copyToClipboard(bankDetails.bankName, 'Bank name')}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition"
                  >
                    📋 Copy
                  </button>
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Account Holder Name</p>
                <div className="flex items-center justify-between">
                  <p className="text-white font-bold text-lg">{bankDetails.accountHolderName}</p>
                  <button
                    onClick={() => copyToClipboard(bankDetails.accountHolderName, 'Account name')}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition"
                  >
                    📋 Copy
                  </button>
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Account Number</p>
                <div className="flex items-center justify-between">
                  <p className="text-white font-bold text-2xl font-mono tracking-wider">{bankDetails.accountNumber}</p>
                  <button
                    onClick={() => copyToClipboard(bankDetails.accountNumber, 'Account number')}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition"
                  >
                    📋 Copy
                  </button>
                </div>
              </div>

              {bankDetails.displayMessage && (
                <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-3">
                  <p className="text-yellow-400 text-sm">
                    ℹ️ {bankDetails.displayMessage}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Upload Proof Section */}
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-5 border-2 border-purple-500">
            <h3 className="text-purple-400 font-bold text-lg mb-4">📸 Upload Payment Proof</h3>
            
            <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
              <p className="text-gray-300 text-sm mb-2">📖 Instructions:</p>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>1️⃣ Make bank transfer to account above</li>
                <li>2️⃣ Take screenshot of successful payment</li>
                <li>3️⃣ Upload screenshot below</li>
                <li>4️⃣ Wait for admin verification (up to 48 hours)</li>
              </ul>
            </div>

            {!previewUrl ? (
              <label className="block border-2 border-dashed border-purple-500 rounded-xl p-8 text-center cursor-pointer hover:bg-purple-500/10 transition">
                <div className="text-6xl mb-3">📱</div>
                <p className="text-white font-bold mb-2">Click to Upload Screenshot</p>
                <p className="text-gray-400 text-sm">JPG, PNG (Max 5MB)</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border-2 border-purple-500">
                  <img 
                    src={previewUrl} 
                    alt="Payment proof preview" 
                    className="w-full max-h-96 object-contain bg-gray-900"
                  />
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl('');
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition"
                  >
                    ×
                  </button>
                </div>
                <p className="text-gray-400 text-sm text-center">
                  {selectedFile?.name} ({(selectedFile!.size / 1024).toFixed(0)} KB)
                </p>
              </div>
            )}
          </div>

          {/* Important Notices */}
          <div className="space-y-3">
            <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
              <p className="text-blue-400 font-bold mb-2">⏳ Verification Time</p>
              <p className="text-gray-300 text-sm">
                Payment verification takes up to {PAYMENT_CLEARANCE_HOURS} hours. Your account will remain active during verification.
              </p>
            </div>

            <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
              <p className="text-red-400 font-bold mb-2">⚠️ Late Payment Warning</p>
              <p className="text-gray-300 text-sm">
                Accounts will be automatically deactivated for late payments. You cannot accept bookings while deactivated.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-bold hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className={`flex-1 py-3 rounded-lg font-bold transition ${
                !selectedFile || isUploading
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg'
              }`}
            >
              {isUploading ? '⏳ Uploading...' : '✅ Upload Proof'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
