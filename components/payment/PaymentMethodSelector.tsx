import React from 'react';
import { PaymentMethod } from '../../types';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  disabled?: boolean;
}

/**
 * PaymentMethodSelector Component
 * 
 * Allows customers to choose between Cash on Delivery and Bank Transfer payment methods.
 * Features:
 * - Visual toggle with icons and descriptions
 * - Clear distinction between methods
 * - Disabled state support
 * - Mobile-responsive design
 */
export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodChange,
  disabled = false
}) => {
  const methods = [
    {
      value: PaymentMethod.CASH_ON_DELIVERY,
      label: 'Cash on Delivery',
      icon: '💵',
      description: 'Pay cash when your order arrives',
      badge: 'INSTANT'
    },
    {
      value: PaymentMethod.BANK_TRANSFER,
      label: 'Bank Transfer',
      icon: '🏦',
      description: 'Transfer to restaurant bank account',
      badge: 'DIRECT'
    }
  ];

  return (
    <div className="payment-method-selector">
      <h3 className="selector-title">
        <span className="title-icon">💳</span>
        Choose Payment Method
      </h3>
      
      <div className="methods-grid">
        {methods.map((method) => {
          const isSelected = selectedMethod === method.value;
          
          return (
            <button
              key={method.value}
              className={`method-card ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
              onClick={() => !disabled && onMethodChange(method.value)}
              disabled={disabled}
              type="button"
            >
              {/* Badge */}
              <div className="method-badge">{method.badge}</div>
              
              {/* Icon */}
              <div className="method-icon">{method.icon}</div>
              
              {/* Label */}
              <div className="method-label">{method.label}</div>
              
              {/* Description */}
              <div className="method-description">{method.description}</div>
              
              {/* Selection Indicator */}
              {isSelected && (
                <div className="selection-indicator">
                  <span className="checkmark">✓</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <style jsx>{`
        .payment-method-selector {
          width: 100%;
          margin: 20px 0;
        }

        .selector-title {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .title-icon {
          font-size: 22px;
        }

        .methods-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        }

        .method-card {
          position: relative;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
          min-height: 180px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .method-card:hover:not(.disabled) {
          border-color: #10b981;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
          transform: translateY(-2px);
        }

        .method-card.selected {
          border-color: #10b981;
          background: #f0fdf4;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }

        .method-card.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .method-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: #f59e0b;
          color: white;
          font-size: 10px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 4px;
          letter-spacing: 0.5px;
        }

        .method-card.selected .method-badge {
          background: #10b981;
        }

        .method-icon {
          font-size: 48px;
          margin-bottom: 8px;
        }

        .method-label {
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 4px;
        }

        .method-description {
          font-size: 13px;
          color: #6b7280;
          line-height: 1.4;
        }

        .selection-indicator {
          position: absolute;
          top: 12px;
          left: 12px;
          width: 28px;
          height: 28px;
          background: #10b981;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: scaleIn 0.3s ease;
        }

        .checkmark {
          color: white;
          font-size: 16px;
          font-weight: 700;
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }

        /* Mobile Responsive */
        @media (max-width: 640px) {
          .methods-grid {
            grid-template-columns: 1fr;
          }

          .method-card {
            min-height: 160px;
            padding: 20px;
          }

          .method-icon {
            font-size: 42px;
          }

          .selector-title {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
};
