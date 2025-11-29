import React, { useMemo } from 'react';
import { FoodOrder, PaymentMethod, PaymentStatus } from '../../types';

interface PaymentAnalyticsDashboardProps {
  orders: FoodOrder[]; // All orders for the restaurant
  timeRange?: 'today' | 'week' | 'month' | 'all'; // Filter by time range
}

interface PaymentStats {
  totalOrders: number;
  totalRevenue: number;
  cashOrders: number;
  cashRevenue: number;
  transferOrders: number;
  transferRevenue: number;
  verifiedPayments: number;
  rejectedPayments: number;
  pendingPayments: number;
  avgVerificationTimeMinutes: number;
  successRate: number; // Percentage of verified payments
  autoApprovedCount: number;
}

/**
 * PaymentAnalyticsDashboard Component
 * 
 * Version 2 analytics dashboard for restaurant/admin to view payment metrics.
 * Features:
 * - Payment method distribution (COD vs Transfer)
 * - Success rate tracking
 * - Average verification time
 * - Revenue breakdown
 * - Rejection reasons analysis
 * - Auto-approve statistics
 */
export const PaymentAnalyticsDashboard: React.FC<PaymentAnalyticsDashboardProps> = ({
  orders,
  timeRange = 'all'
}) => {
  // Filter orders by time range
  const filteredOrders = useMemo(() => {
    if (timeRange === 'all') return orders;

    const now = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    return orders.filter(order => new Date(order.orderTime) >= startDate);
  }, [orders, timeRange]);

  // Calculate statistics
  const stats: PaymentStats = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);

    const cashOrders = filteredOrders.filter(o => o.paymentMethod === PaymentMethod.CASH_ON_DELIVERY);
    const cashRevenue = cashOrders.reduce((sum, order) => sum + order.total, 0);

    const transferOrders = filteredOrders.filter(o => o.paymentMethod === PaymentMethod.BANK_TRANSFER);
    const transferRevenue = transferOrders.reduce((sum, order) => sum + order.total, 0);

    const verifiedPayments = filteredOrders.filter(o => o.paymentStatus === PaymentStatus.VERIFIED).length;
    const rejectedPayments = filteredOrders.filter(o => o.paymentStatus === PaymentStatus.REJECTED).length;
    const pendingPayments = filteredOrders.filter(o => o.paymentStatus === PaymentStatus.PROOF_UPLOADED).length;

    const autoApprovedCount = filteredOrders.filter(o => o.paymentAutoApproved).length;

    // Calculate average verification time
    const verifiedWithTimes = filteredOrders.filter(o => 
      o.paymentStatus === PaymentStatus.VERIFIED && 
      o.paymentProofUploadedAt && 
      o.paymentVerifiedAt
    );

    const totalVerificationTime = verifiedWithTimes.reduce((sum, order) => {
      const uploaded = new Date(order.paymentProofUploadedAt!).getTime();
      const verified = new Date(order.paymentVerifiedAt!).getTime();
      return sum + (verified - uploaded);
    }, 0);

    const avgVerificationTimeMinutes = verifiedWithTimes.length > 0
      ? Math.round(totalVerificationTime / verifiedWithTimes.length / 60000)
      : 0;

    // Success rate (verified / (verified + rejected))
    const totalProcessed = verifiedPayments + rejectedPayments;
    const successRate = totalProcessed > 0
      ? Math.round((verifiedPayments / totalProcessed) * 100)
      : 0;

    return {
      totalOrders,
      totalRevenue,
      cashOrders: cashOrders.length,
      cashRevenue,
      transferOrders: transferOrders.length,
      transferRevenue,
      verifiedPayments,
      rejectedPayments,
      pendingPayments,
      avgVerificationTimeMinutes,
      successRate,
      autoApprovedCount
    };
  }, [filteredOrders]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const calculatePercentage = (value: number, total: number): number => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  const getTimeRangeLabel = (): string => {
    switch (timeRange) {
      case 'today': return 'Today';
      case 'week': return 'Last 7 Days';
      case 'month': return 'Last 30 Days';
      case 'all': return 'All Time';
      default: return timeRange;
    }
  };

  return (
    <div className="payment-analytics">
      {/* Header */}
      <div className="header">
        <div className="header-content">
          <h2 className="title">
            <span className="title-icon">📊</span>
            Payment Analytics
          </h2>
          <div className="time-range-badge">{getTimeRangeLabel()}</div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="overview-grid">
        {/* Total Revenue */}
        <div className="stat-card primary">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <div className="card-label">Total Revenue</div>
            <div className="card-value">{formatCurrency(stats.totalRevenue)}</div>
            <div className="card-subtitle">{stats.totalOrders} orders</div>
          </div>
        </div>

        {/* Success Rate */}
        <div className="stat-card success">
          <div className="card-icon">✓</div>
          <div className="card-content">
            <div className="card-label">Success Rate</div>
            <div className="card-value">{stats.successRate}%</div>
            <div className="card-subtitle">
              {stats.verifiedPayments} verified / {stats.verifiedPayments + stats.rejectedPayments} processed
            </div>
          </div>
        </div>

        {/* Avg Verification Time */}
        <div className="stat-card info">
          <div className="card-icon">⏱️</div>
          <div className="card-content">
            <div className="card-label">Avg Verification</div>
            <div className="card-value">{stats.avgVerificationTimeMinutes}m</div>
            <div className="card-subtitle">Average response time</div>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="stat-card warning">
          <div className="card-icon">⏳</div>
          <div className="card-content">
            <div className="card-label">Pending</div>
            <div className="card-value">{stats.pendingPayments}</div>
            <div className="card-subtitle">Awaiting verification</div>
          </div>
        </div>
      </div>

      {/* Payment Method Breakdown */}
      <div className="section">
        <h3 className="section-title">
          <span className="section-icon">💳</span>
          Payment Method Distribution
        </h3>

        <div className="payment-methods-grid">
          {/* Cash on Delivery */}
          <div className="method-card">
            <div className="method-header">
              <span className="method-icon">💵</span>
              <span className="method-name">Cash on Delivery</span>
            </div>
            <div className="method-stats">
              <div className="method-count">{stats.cashOrders} orders</div>
              <div className="method-revenue">{formatCurrency(stats.cashRevenue)}</div>
              <div className="method-percentage">
                {calculatePercentage(stats.cashOrders, stats.totalOrders)}% of total orders
              </div>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill cash"
                style={{ width: `${calculatePercentage(stats.cashOrders, stats.totalOrders)}%` }}
              />
            </div>
          </div>

          {/* Bank Transfer */}
          <div className="method-card">
            <div className="method-header">
              <span className="method-icon">🏦</span>
              <span className="method-name">Bank Transfer</span>
            </div>
            <div className="method-stats">
              <div className="method-count">{stats.transferOrders} orders</div>
              <div className="method-revenue">{formatCurrency(stats.transferRevenue)}</div>
              <div className="method-percentage">
                {calculatePercentage(stats.transferOrders, stats.totalOrders)}% of total orders
              </div>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill transfer"
                style={{ width: `${calculatePercentage(stats.transferOrders, stats.totalOrders)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Status Breakdown */}
      <div className="section">
        <h3 className="section-title">
          <span className="section-icon">📈</span>
          Payment Status Overview
        </h3>

        <div className="status-grid">
          <div className="status-item verified">
            <div className="status-icon">✓</div>
            <div className="status-content">
              <div className="status-count">{stats.verifiedPayments}</div>
              <div className="status-label">Verified</div>
            </div>
          </div>

          <div className="status-item pending">
            <div className="status-icon">⏳</div>
            <div className="status-content">
              <div className="status-count">{stats.pendingPayments}</div>
              <div className="status-label">Pending</div>
            </div>
          </div>

          <div className="status-item rejected">
            <div className="status-icon">✕</div>
            <div className="status-content">
              <div className="status-count">{stats.rejectedPayments}</div>
              <div className="status-label">Rejected</div>
            </div>
          </div>

          <div className="status-item auto">
            <div className="status-icon">🤖</div>
            <div className="status-content">
              <div className="status-count">{stats.autoApprovedCount}</div>
              <div className="status-label">Auto-Approved</div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="insights">
        <h3 className="section-title">
          <span className="section-icon">💡</span>
          Insights
        </h3>

        <div className="insights-list">
          {stats.successRate >= 95 && (
            <div className="insight success">
              <span className="insight-icon">🎉</span>
              Excellent! Your payment success rate is {stats.successRate}%.
            </div>
          )}

          {stats.avgVerificationTimeMinutes < 10 && stats.verifiedPayments > 0 && (
            <div className="insight success">
              <span className="insight-icon">⚡</span>
              Great response time! Average verification in {stats.avgVerificationTimeMinutes} minutes.
            </div>
          )}

          {stats.pendingPayments > 5 && (
            <div className="insight warning">
              <span className="insight-icon">⚠️</span>
              You have {stats.pendingPayments} pending payments. Please review them soon.
            </div>
          )}

          {stats.autoApprovedCount > 0 && (
            <div className="insight info">
              <span className="insight-icon">ℹ️</span>
              {stats.autoApprovedCount} payment(s) were auto-approved after timeout.
            </div>
          )}

          {calculatePercentage(stats.transferOrders, stats.totalOrders) > 70 && (
            <div className="insight info">
              <span className="insight-icon">💳</span>
              {calculatePercentage(stats.transferOrders, stats.totalOrders)}% of customers prefer bank transfer.
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .payment-analytics {
          width: 100%;
          padding: 20px;
          background: #f9fafb;
          border-radius: 16px;
        }

        /* Header */
        .header {
          margin-bottom: 24px;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 24px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0;
        }

        .title-icon {
          font-size: 28px;
        }

        .time-range-badge {
          background: #3b82f6;
          color: white;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
        }

        /* Overview Grid */
        .overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          gap: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        }

        .stat-card.primary {
          border-left: 4px solid #10b981;
        }

        .stat-card.success {
          border-left: 4px solid #3b82f6;
        }

        .stat-card.info {
          border-left: 4px solid #f59e0b;
        }

        .stat-card.warning {
          border-left: 4px solid #ef4444;
        }

        .card-icon {
          font-size: 36px;
        }

        .card-content {
          flex: 1;
        }

        .card-label {
          font-size: 13px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }

        .card-value {
          font-size: 28px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 4px;
        }

        .card-subtitle {
          font-size: 12px;
          color: #9ca3af;
        }

        /* Section */
        .section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 18px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 20px 0;
        }

        .section-icon {
          font-size: 22px;
        }

        /* Payment Methods */
        .payment-methods-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .method-card {
          background: #f9fafb;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
        }

        .method-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }

        .method-icon {
          font-size: 24px;
        }

        .method-name {
          font-size: 16px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .method-stats {
          margin-bottom: 12px;
        }

        .method-count {
          font-size: 20px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 4px;
        }

        .method-revenue {
          font-size: 24px;
          font-weight: 700;
          color: #10b981;
          font-family: 'Courier New', monospace;
          margin-bottom: 6px;
        }

        .method-percentage {
          font-size: 13px;
          color: #6b7280;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          margin-top: 12px;
        }

        .progress-fill {
          height: 100%;
          transition: width 0.5s ease;
        }

        .progress-fill.cash {
          background: linear-gradient(90deg, #10b981 0%, #059669 100%);
        }

        .progress-fill.transfer {
          background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
        }

        /* Status Grid */
        .status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 16px;
        }

        .status-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          border-radius: 12px;
          text-align: center;
        }

        .status-item.verified {
          background: #d1fae5;
        }

        .status-item.pending {
          background: #fef3c7;
        }

        .status-item.rejected {
          background: #fee2e2;
        }

        .status-item.auto {
          background: #dbeafe;
        }

        .status-icon {
          font-size: 36px;
          margin-bottom: 12px;
        }

        .status-count {
          font-size: 28px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 4px;
        }

        .status-label {
          font-size: 13px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Insights */
        .insights {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .insights-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .insight {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 8px;
          font-size: 14px;
          line-height: 1.5;
        }

        .insight.success {
          background: #d1fae5;
          color: #065f46;
          border-left: 4px solid #10b981;
        }

        .insight.warning {
          background: #fef3c7;
          color: #92400e;
          border-left: 4px solid #f59e0b;
        }

        .insight.info {
          background: #dbeafe;
          color: #1e40af;
          border-left: 4px solid #3b82f6;
        }

        .insight-icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .payment-analytics {
            padding: 16px;
          }

          .overview-grid {
            grid-template-columns: 1fr;
          }

          .title {
            font-size: 20px;
          }

          .card-value {
            font-size: 24px;
          }

          .payment-methods-grid,
          .status-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
