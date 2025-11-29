import React, { useState } from 'react';

interface BankDetailsDisplayProps {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  amount: number; // Total amount to transfer in IDR
  orderNumber?: string; // Optional order reference
}

/**
 * BankDetailsDisplay Component
 * 
 * Displays restaurant bank account details for customer bank transfer.
 * Version 2 Features:
 * - Copy-to-clipboard buttons for each field
 * - Visual confirmation when copied
 * - Formatted amount display with IDR currency
 * - Clear instructions for customer
 * - Warning about exact amount requirement
 */
export const BankDetailsDisplay: React.FC<BankDetailsDisplayProps> = ({
  bankName,
  accountNumber,
  accountHolder,
  amount,
  orderNumber
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      
      // Reset after 2 seconds
      setTimeout(() => {
        setCopiedField(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy. Please copy manually.');
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const bankDetails = [
    {
      label: 'Bank Name',
      value: bankName,
      fieldName: 'bankName',
      icon: '🏦'
    },
    {
      label: 'Account Number',
      value: accountNumber,
      fieldName: 'accountNumber',
      icon: '🔢'
    },
    {
      label: 'Account Holder',
      value: accountHolder,
      fieldName: 'accountHolder',
      icon: '👤'
    },
    {
      label: 'Transfer Amount',
      value: formatCurrency(amount),
      rawValue: amount.toString(),
      fieldName: 'amount',
      icon: '💰',
      highlight: true
    }
  ];

  return (
    <div className="bank-details-display">
      {/* Header */}
      <div className="header">
        <div className="header-icon">🏦</div>
        <div className="header-text">
          <h3 className="header-title">Transfer to Restaurant</h3>
          <p className="header-subtitle">Complete payment within 10 minutes</p>
        </div>
      </div>

      {/* Bank Details Cards */}
      <div className="details-container">
        {bankDetails.map((detail) => (
          <div
            key={detail.fieldName}
            className={`detail-card ${detail.highlight ? 'highlight' : ''}`}
          >
            <div className="detail-header">
              <span className="detail-icon">{detail.icon}</span>
              <span className="detail-label">{detail.label}</span>
            </div>
            
            <div className="detail-content">
              <div className="detail-value">{detail.value}</div>
              
              <button
                className={`copy-button ${copiedField === detail.fieldName ? 'copied' : ''}`}
                onClick={() => copyToClipboard(detail.rawValue || detail.value, detail.fieldName)}
                type="button"
              >
                {copiedField === detail.fieldName ? (
                  <>
                    <span className="copy-icon">✓</span>
                    <span className="copy-text">Copied!</span>
                  </>
                ) : (
                  <>
                    <span className="copy-icon">📋</span>
                    <span className="copy-text">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Order Reference (if provided) */}
      {orderNumber && (
        <div className="order-reference">
          <span className="reference-label">Order Reference:</span>
          <span className="reference-value">{orderNumber}</span>
          <button
            className="copy-button-small"
            onClick={() => copyToClipboard(orderNumber, 'orderNumber')}
            type="button"
          >
            {copiedField === 'orderNumber' ? '✓' : '📋'}
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="instructions">
        <div className="instruction-title">📝 Transfer Instructions:</div>
        <ol className="instruction-list">
          <li>Open your mobile banking or internet banking app</li>
          <li>Use the <strong>Copy</strong> buttons to copy each detail</li>
          <li>Transfer <strong>EXACTLY {formatCurrency(amount)}</strong></li>
          <li>Take a screenshot of the successful transfer</li>
          <li>Upload the screenshot below to confirm payment</li>
        </ol>
      </div>

      {/* Warning */}
      <div className="warning-box">
        <span className="warning-icon">⚠️</span>
        <div className="warning-text">
          <strong>Important:</strong> Transfer the exact amount. Different amounts may delay order confirmation.
        </div>
      </div>

      <style jsx>{`
        .bank-details-display {
          width: 100%;
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        /* Header */
        .header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #f3f4f6;
        }

        .header-icon {
          font-size: 32px;
        }

        .header-title {
          font-size: 20px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0;
        }

        .header-subtitle {
          font-size: 14px;
          color: #ef4444;
          margin: 4px 0 0 0;
          font-weight: 500;
        }

        /* Details Container */
        .details-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        .detail-card {
          background: #f9fafb;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px;
          transition: all 0.3s ease;
        }

        .detail-card.highlight {
          background: #fef3c7;
          border-color: #f59e0b;
        }

        .detail-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .detail-icon {
          font-size: 20px;
        }

        .detail-label {
          font-size: 13px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .detail-value {
          font-size: 18px;
          font-weight: 700;
          color: #1a1a1a;
          font-family: 'Courier New', monospace;
          word-break: break-all;
        }

        .detail-card.highlight .detail-value {
          font-size: 24px;
          color: #d97706;
        }

        /* Copy Button */
        .copy-button {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
          min-width: 85px;
          justify-content: center;
        }

        .copy-button:hover {
          background: #059669;
          transform: translateY(-1px);
        }

        .copy-button.copied {
          background: #6366f1;
        }

        .copy-icon {
          font-size: 16px;
        }

        /* Order Reference */
        .order-reference {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #eff6ff;
          border: 1px solid #3b82f6;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 20px;
          font-size: 14px;
        }

        .reference-label {
          font-weight: 600;
          color: #1e40af;
        }

        .reference-value {
          font-family: 'Courier New', monospace;
          font-weight: 700;
          color: #1e3a8a;
        }

        .copy-button-small {
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 14px;
          cursor: pointer;
          margin-left: auto;
        }

        .copy-button-small:hover {
          background: #2563eb;
        }

        /* Instructions */
        .instructions {
          background: #f0f9ff;
          border-left: 4px solid #0ea5e9;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
        }

        .instruction-title {
          font-size: 15px;
          font-weight: 700;
          color: #0c4a6e;
          margin-bottom: 12px;
        }

        .instruction-list {
          margin: 0;
          padding-left: 20px;
          color: #0369a1;
        }

        .instruction-list li {
          margin-bottom: 8px;
          line-height: 1.5;
          font-size: 14px;
        }

        .instruction-list strong {
          color: #0c4a6e;
        }

        /* Warning */
        .warning-box {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: #fef2f2;
          border: 2px solid #ef4444;
          border-radius: 8px;
          padding: 12px;
        }

        .warning-icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        .warning-text {
          font-size: 13px;
          color: #991b1b;
          line-height: 1.5;
        }

        .warning-text strong {
          font-weight: 700;
        }

        /* Mobile Responsive */
        @media (max-width: 640px) {
          .bank-details-display {
            padding: 16px;
          }

          .header-title {
            font-size: 18px;
          }

          .detail-value {
            font-size: 16px;
          }

          .detail-card.highlight .detail-value {
            font-size: 20px;
          }

          .copy-button {
            padding: 6px 12px;
            font-size: 12px;
            min-width: 75px;
          }

          .instruction-list li {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
};
