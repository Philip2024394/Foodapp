import React, { useState, useMemo } from 'react';
import { RestaurantAnalytics, FoodReview } from '../../types';
import { formatIndonesianCurrency } from '../../utils/formatters';
import { StarIcon, ChartBarIcon, ClockIcon } from '../common/Icon';

interface RestaurantAnalyticsDashboardProps {
    vendorId: string;
    vendorName: string;
    analytics: RestaurantAnalytics;
}

const RestaurantAnalyticsDashboard: React.FC<RestaurantAnalyticsDashboardProps> = ({
    vendorId,
    vendorName,
    analytics
}) => {
    const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'all'>(analytics.period);

    const getEmojiForRating = (rating: number) => {
        if (rating >= 4.5) return '🤩';
        if (rating >= 4.0) return '😊';
        if (rating >= 3.0) return '😐';
        return '😞';
    };

    const completionRate = useMemo(() => {
        if (analytics.totalOrders === 0) return 0;
        return ((analytics.completedOrders / analytics.totalOrders) * 100).toFixed(1);
    }, [analytics]);

    const peakHour = useMemo(() => {
        if (analytics.peakHours.length === 0) return null;
        return analytics.peakHours.reduce((max, hour) => 
            hour.orderCount > max.orderCount ? hour : max
        , analytics.peakHours[0]);
    }, [analytics.peakHours]);

    const formatHour = (hour: number) => {
        if (hour === 0) return '12 AM';
        if (hour < 12) return `${hour} AM`;
        if (hour === 12) return '12 PM';
        return `${hour - 12} PM`;
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white p-6 shadow-lg">
                <h1 className="text-3xl font-bold mb-1">{vendorName}</h1>
                <p className="text-white/90 text-lg">Performance Analytics</p>
            </div>

            {/* Period Selector */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="flex overflow-x-auto">
                    {(['today', 'week', 'month', 'all'] as const).map((period) => (
                        <button
                            key={period}
                            onClick={() => setSelectedPeriod(period)}
                            className={`flex-1 min-w-[80px] py-3 px-4 font-semibold text-sm transition-colors ${
                                selectedPeriod === period
                                    ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            {period === 'today' ? 'Today' :
                             period === 'week' ? 'This Week' :
                             period === 'month' ? 'This Month' :
                             'All Time'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="p-4 space-y-4">
                {/* Revenue & Orders */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-6 shadow-lg">
                        <p className="text-green-100 text-sm font-semibold mb-2">Total Revenue</p>
                        <p className="text-3xl font-bold">{formatIndonesianCurrency(analytics.totalRevenue)}</p>
                        <p className="text-green-100 text-xs mt-2">{analytics.completedOrders} completed orders</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 shadow-lg">
                        <p className="text-blue-100 text-sm font-semibold mb-2">Total Orders</p>
                        <p className="text-3xl font-bold">{analytics.totalOrders}</p>
                        <p className="text-blue-100 text-xs mt-2">{completionRate}% completion rate</p>
                    </div>
                </div>

                {/* Average Order Value & Rating */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                        <p className="text-gray-600 text-sm font-semibold mb-2">Avg Order Value</p>
                        <p className="text-2xl font-bold text-gray-900">{formatIndonesianCurrency(analytics.averageOrderValue)}</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                        <p className="text-gray-600 text-sm font-semibold mb-2">Average Rating</p>
                        <div className="flex items-center gap-2">
                            <p className="text-2xl font-bold text-gray-900">{analytics.averageRating.toFixed(1)}</p>
                            <StarIcon className="w-6 h-6 text-yellow-400" />
                            <span className="text-2xl">{getEmojiForRating(analytics.averageRating)}</span>
                        </div>
                        <p className="text-gray-500 text-xs mt-1">{analytics.totalReviews} reviews</p>
                    </div>
                </div>

                {/* Popular Items */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <ChartBarIcon className="w-6 h-6 text-orange-500" />
                        Popular Items
                    </h3>
                    {analytics.popularItems.length > 0 ? (
                        <div className="space-y-3">
                            {analytics.popularItems.slice(0, 5).map((item, index) => (
                                <div key={item.itemId} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                            index === 0 ? 'bg-yellow-400 text-yellow-900' :
                                            index === 1 ? 'bg-gray-300 text-gray-700' :
                                            index === 2 ? 'bg-orange-300 text-orange-900' :
                                            'bg-gray-100 text-gray-600'
                                        }`}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{item.itemName}</p>
                                            <p className="text-xs text-gray-500">{item.orderCount} orders</p>
                                        </div>
                                    </div>
                                    <p className="font-bold text-gray-700">{formatIndonesianCurrency(item.revenue)}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center py-6 text-gray-500">No data yet</p>
                    )}
                </div>

                {/* Peak Hours */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <ClockIcon className="w-6 h-6 text-orange-500" />
                        Peak Hours
                    </h3>
                    {peakHour ? (
                        <>
                            <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl p-4 mb-4">
                                <p className="text-white/90 text-sm mb-1">Busiest Hour</p>
                                <p className="text-3xl font-bold">{formatHour(peakHour.hour)}</p>
                                <p className="text-white/90 text-sm mt-1">{peakHour.orderCount} orders</p>
                            </div>
                            
                            <div className="space-y-2">
                                {analytics.peakHours
                                    .sort((a, b) => b.orderCount - a.orderCount)
                                    .slice(0, 6)
                                    .map((hourData) => {
                                        const maxOrders = Math.max(...analytics.peakHours.map(h => h.orderCount));
                                        const width = (hourData.orderCount / maxOrders) * 100;
                                        return (
                                            <div key={hourData.hour} className="flex items-center gap-3">
                                                <p className="text-sm font-semibold text-gray-700 w-16">{formatHour(hourData.hour)}</p>
                                                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                                                    <div 
                                                        className="bg-gradient-to-r from-orange-400 to-orange-500 h-full rounded-full flex items-center justify-end pr-2"
                                                        style={{ width: `${width}%` }}
                                                    >
                                                        {width > 20 && (
                                                            <span className="text-white text-xs font-bold">{hourData.orderCount}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                {width <= 20 && (
                                                    <span className="text-sm font-semibold text-gray-700 w-8">{hourData.orderCount}</span>
                                                )}
                                            </div>
                                        );
                                    })}
                            </div>
                        </>
                    ) : (
                        <p className="text-center py-6 text-gray-500">No data yet</p>
                    )}
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200 text-center">
                        <p className="text-2xl font-bold text-orange-600">{analytics.customerRetention}%</p>
                        <p className="text-xs text-gray-600 mt-1">Customer Retention</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200 text-center">
                        <p className="text-2xl font-bold text-blue-600">{analytics.averagePreparationTime}m</p>
                        <p className="text-xs text-gray-600 mt-1">Avg Prep Time</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200 text-center">
                        <p className="text-2xl font-bold text-red-600">{analytics.cancelledOrders}</p>
                        <p className="text-xs text-gray-600 mt-1">Cancelled</p>
                    </div>
                </div>

                {/* Recent Reviews */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Reviews</h3>
                    {analytics.recentReviews.length > 0 ? (
                        <div className="space-y-4">
                            {analytics.recentReviews.slice(0, 5).map((review) => (
                                <div key={review.id} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="font-semibold text-gray-900">{review.customerName}</p>
                                            <p className="text-xs text-gray-500">{new Date(review.timestamp).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-2xl">
                                                {review.emoji === 'sad' ? '😞' :
                                                 review.emoji === 'neutral' ? '😐' :
                                                 review.emoji === 'happy' ? '😊' :
                                                 '🤩'}
                                            </span>
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => (
                                                    <StarIcon 
                                                        key={i} 
                                                        className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    {review.comment && (
                                        <p className="text-sm text-gray-700">{review.comment}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center py-6 text-gray-500">No reviews yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RestaurantAnalyticsDashboard;
