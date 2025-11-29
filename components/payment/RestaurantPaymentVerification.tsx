import React, { useState, useEffect } from 'react';
import { FoodOrder, PaymentStatus } from '../../types';

interface RestaurantPaymentVerificationProps {
  order: FoodOrder;
  onVerify: (orderId: string, note?: string) => void;
  onReject: (orderId: string, reason: string) => void;
  autoApproveTimeoutMinutes?: number; // Auto-approve after X minutes (Version 2)
}

/**
 * RestaurantPaymentVerification Component
 * 
 * Restaurant dashboard interface for verifying or rejecting payment proofs.
 * Version 2 Features:
 * - Auto-approve after timeout (configurable, default 30 minutes)
 * - Zoomable payment proof image
 * - Quick rejection reasons
 * - Custom rejection note
 * - Countdown timer for auto-approve
 * - Payment details display
 */
export const RestaurantPaymentVerification: React.FC<RestaurantPaymentVerificationProps> = ({
  order,
  onVerify,
  onReject,
  autoApproveTimeoutMinutes = 30
}) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [imageZoomed, setImageZoomed] = useState(false);
  const [autoApproveCountdown, setAutoApproveCountdown] = useState<number>(0);
  const [processing, setProcessing] = useState(false);

  // Quick rejection reasons
  const rejectionReasons = [
    'Amount doesn\'t match order total',
    'Transfer not received in bank account',
    'Image is unclear or unreadable',
    'Wrong bank account number',
    'Payment proof appears edited/fake',
    'Transfer date doesn\'t match order time',
    'Other (specify below)'
  ];

  // Auto-approve countdown timer (Version 2)
  useEffect(() => {
    if (!order.paymentProofUploadedAt || order.paymentStatus !== PaymentStatus.PROOF_UPLOADED) {
      return;
    }

    const calculateCountdown = () => {
      const uploadedAt = new Date(order.paymentProofUploadedAt!).getTime();
      const autoApproveAt = uploadedAt + (autoApproveTimeoutMinutes * 60 * 1000);
      const now = new Date().getTime();
      const remaining = Math.max(0, autoApproveAt - now);
      
      setAutoApproveCountdown(remaining);

      // Auto-approve when timer reaches 0
      if (remaining === 0 && order.paymentStatus === PaymentStatus.PROOF_UPLOADED) {
        handleAutoApprove();
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);

    return () => clearInterval(interval);
  }, [order.paymentProofUploadedAt, order.paymentStatus, autoApproveTimeoutMinutes]);

  const handleAutoApprove = () => {
    console.log(`Auto-approving order ${order.id} after ${autoApproveTimeoutMinutes} minutes`);
    onVerify(order.id, 'Auto-approved after timeout');
  };

  const formatCountdown = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDateTime = (isoString: string): string => {
    return new Date(isoString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleVerify = async () => {
    setProcessing(true);
    try {
      await onVerify(order.id);
      // Success feedback handled by parent
    } catch (err) {
      console.error('Verification failed:', err);
      alert('Failed to verify payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    const reason = selectedReason === 'Other (specify below)' 
      ? customReason 
      : selectedReason;

    if (!reason.trim()) {
      alert('Please select or enter a rejection reason');
      return;
    }

    setProcessing(true);
    try {
      await onReject(order.id, reason);
      setShowRejectModal(false);
      setSelectedReason('');
      setCustomReason('');
    } catch (err) {
      console.error('Rejection failed:', err);
      alert('Failed to reject payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const isPending = order.paymentStatus === PaymentStatus.PROOF_UPLOADED;

  return (
    <div className="payment-verification">
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <h3 className="order-id">Order #{order.id.slice(0, 8)}</h3>
          <div className="order-time">{formatDateTime(order.orderTime)}</div>
        </div>
        <div className={`status-badge ${order.paymentStatus.toLowerCase()}`}>
          {order.paymentStatus.replace('_', ' ')}
        </div>
      </div>

      {/* Auto-Approve Countdown (Version 2) */}
      {isPending && autoApproveCountdown > 0 && (
        <div className="auto-approve-notice">
          <div className="notice-icon">⏰</div>
          <div className="notice-content">
            <div className="notice-title">Auto-Approve in:</div>
            <div className="notice-countdown">{formatCountdown(autoApproveCountdown)}</div>
          </div>
          <div className="notice-info">
            If you don't respond, the payment will be automatically approved.
          </div>
        </div>
      )}

      {/* Customer & Order Details */}
      <div className="details-section">
        <div className="detail-row">
          <span className="detail-label">👤 Customer:</span>
          <span className="detail-value">{order.customerName}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">📞 Phone:</span>
          <span className="detail-value">{order.customerPhone}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">💰 Total Amount:</span>
          <span className="detail-value amount">{formatCurrency(order.total)}</span>
        </div>
        {order.paymentProofUploadedAt && (
          <div className="detail-row">
            <span className="detail-label">📅 Proof Uploaded:</span>
            <span className="detail-value">{formatDateTime(order.paymentProofUploadedAt)}</span>
          </div>
        )}
      </div>

      {/* Payment Proof Image */}
      {order.paymentProofUrl && (
        <div className="proof-section">
          <h4 className="section-title">
            <span className="title-icon">📸</span>
            Payment Proof
          </h4>
          
          <div 
            className={`proof-image-container ${imageZoomed ? 'zoomed' : ''}`}
            onClick={() => setImageZoomed(!imageZoomed)}
          >
            <img 
              src={order.paymentProofUrl} 
              alt="Payment proof" 
              className="proof-image"
            />
            <div className="zoom-hint">
              {imageZoomed ? 'Click to zoom out' : 'Click to zoom in'}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {isPending && (
        <div className="actions">
          <button
            className="verify-button"
            onClick={handleVerify}
            disabled={processing}
            type="button"
          >
            <span className="button-icon">✓</span>
            {processing ? 'Verifying...' : 'Verify Payment'}
          </button>
          
          <button
            className="reject-button"
            onClick={() => setShowRejectModal(true)}
            disabled={processing}
            type="button"
          >
            <span className="button-icon">✕</span>
            Reject Payment
          </button>
        </div>
      )}

      {/* Verification Status (if already processed) */}
      {order.paymentStatus === PaymentStatus.VERIFIED && (
        <div className="status-message success">
          <span className="message-icon">✓</span>
          <div className="message-content">
            <div className="message-title">Payment Verified</div>
            {order.paymentVerifiedAt && (
              <div className="message-subtitle">
                Verified on {formatDateTime(order.paymentVerifiedAt)}
                {order.paymentAutoApproved && ' (Auto-approved)'}
              </div>
            )}
          </div>
        </div>
      )}

      {order.paymentStatus === PaymentStatus.REJECTED && (
        <div className="status-message error">
          <span className="message-icon">✕</span>
          <div className="message-content">
            <div className="message-title">Payment Rejected</div>
            {order.paymentRejectionReason && (
              <div className="message-subtitle">
                Reason: {order.paymentRejectionReason}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Reject Payment</h3>
              <button 
                className="modal-close"
                onClick={() => setShowRejectModal(false)}
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-description">
                Please select a reason for rejecting this payment proof:
              </p>

              <div className="reasons-list">
                {rejectionReasons.map((reason) => (
                  <label key={reason} className="reason-option">
                    <input
                      type="radio"
                      name="rejection-reason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                    />
                    <span className="reason-text">{reason}</span>
                  </label>
                ))}
              </div>

              {selectedReason === 'Other (specify below)' && (
                <textarea
                  className="custom-reason-input"
                  placeholder="Enter reason for rejection..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  rows={3}
                />
              )}
            </div>

            <div className="modal-footer">
              <button
                className="modal-button cancel"
                onClick={() => setShowRejectModal(false)}
                disabled={processing}
                type="button"
              >
                Cancel
              </button>
              <button
                className="modal-button confirm"
                onClick={handleReject}
                disabled={processing || (!selectedReason && !customReason.trim())}
                type="button"
              >
                {processing ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .payment-verification {
          width: 100%;
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        /* Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 2px solid #f3f4f6;
        }

        .order-id {
          font-size: 20px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 4px 0;
        }

        .order-time {
          font-size: 14px;
          color: #6b7280;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-badge.proof_uploaded {
          background: #fef3c7;
          color: #92400e;
        }

        .status-badge.verified {
          background: #d1fae5;
          color: #065f46;
        }

        .status-badge.rejected {
          background: #fee2e2;
          color: #991b1b;
        }

        /* Auto-Approve Notice */
        .auto-approve-notice {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 2px solid #f59e0b;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .notice-icon {
          font-size: 32px;
        }

        .notice-content {
          flex: 1;
        }

        .notice-title {
          font-size: 13px;
          font-weight: 600;
          color: #92400e;
          margin-bottom: 4px;
        }

        .notice-countdown {
          font-size: 24px;
          font-weight: 700;
          color: #d97706;
          font-family: 'Courier New', monospace;
        }

        .notice-info {
          font-size: 12px;
          color: #92400e;
          margin-top: 8px;
          width: 100%;
        }

        /* Details Section */
        .details-section {
          background: #f9fafb;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 20px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-label {
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
        }

        .detail-value {
          font-size: 14px;
          color: #1a1a1a;
          font-weight: 600;
        }

        .detail-value.amount {
          font-size: 18px;
          color: #059669;
          font-family: 'Courier New', monospace;
        }

        /* Proof Section */
        .proof-section {
          margin-bottom: 20px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 12px;
        }

        .title-icon {
          font-size: 20px;
        }

        .proof-image-container {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .proof-image-container:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .proof-image-container.zoomed {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1000;
          max-width: 90vw;
          max-height: 90vh;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        }

        .proof-image {
          width: 100%;
          height: auto;
          display: block;
        }

        .proof-image-container.zoomed .proof-image {
          max-height: 90vh;
          object-fit: contain;
        }

        .zoom-hint {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }

        /* Actions */
        .actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }

        .verify-button,
        .reject-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .verify-button {
          background: #10b981;
          color: white;
        }

        .verify-button:hover:not(:disabled) {
          background: #059669;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .reject-button {
          background: #ef4444;
          color: white;
        }

        .reject-button:hover:not(:disabled) {
          background: #dc2626;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .verify-button:disabled,
        .reject-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .button-icon {
          font-size: 20px;
        }

        /* Status Messages */
        .status-message {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 20px;
        }

        .status-message.success {
          background: #d1fae5;
          border: 2px solid #10b981;
        }

        .status-message.error {
          background: #fee2e2;
          border: 2px solid #ef4444;
        }

        .message-icon {
          font-size: 32px;
        }

        .message-title {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .status-message.success .message-title {
          color: #065f46;
        }

        .status-message.error .message-title {
          color: #991b1b;
        }

        .message-subtitle {
          font-size: 13px;
          color: #6b7280;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 2px solid #f3f4f6;
        }

        .modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          color: #6b7280;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .modal-close:hover {
          background: #f3f4f6;
          color: #1a1a1a;
        }

        .modal-body {
          padding: 24px;
        }

        .modal-description {
          font-size: 14px;
          color: #6b7280;
          margin: 0 0 16px 0;
        }

        .reasons-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .reason-option {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: #f9fafb;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .reason-option:hover {
          background: #f0f9ff;
          border-color: #3b82f6;
        }

        .reason-option input[type="radio"] {
          cursor: pointer;
        }

        .reason-text {
          font-size: 14px;
          color: #1a1a1a;
        }

        .custom-reason-input {
          width: 100%;
          padding: 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          margin-top: 12px;
          resize: vertical;
        }

        .custom-reason-input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .modal-footer {
          display: flex;
          gap: 12px;
          padding: 20px 24px;
          border-top: 2px solid #f3f4f6;
        }

        .modal-button {
          flex: 1;
          padding: 12px;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .modal-button.cancel {
          background: #f3f4f6;
          color: #6b7280;
        }

        .modal-button.cancel:hover:not(:disabled) {
          background: #e5e7eb;
        }

        .modal-button.confirm {
          background: #ef4444;
          color: white;
        }

        .modal-button.confirm:hover:not(:disabled) {
          background: #dc2626;
        }

        .modal-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Mobile Responsive */
        @media (max-width: 640px) {
          .payment-verification {
            padding: 16px;
          }

          .actions {
            grid-template-columns: 1fr;
          }

          .auto-approve-notice {
            flex-direction: column;
            text-align: center;
          }

          .modal-content {
            width: 95%;
          }
        }
      `}</style>
    </div>
  );
};
