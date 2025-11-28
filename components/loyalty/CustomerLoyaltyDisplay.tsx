import React, { useMemo } from 'react';
import { UserLoyaltyPoints, EarnedReward, Vendor } from '../../types';
import { GiftIcon, StarIcon, ClockIcon, CheckCircleIcon } from '../common/Icon';
import { formatIndonesianCurrency } from '../../utils/formatters';

interface CustomerLoyaltyDisplayProps {
  loyaltyData: UserLoyaltyPoints[];
  vendors: Vendor[];
  onRedeemReward: (reward: EarnedReward) => void;
}

const CustomerLoyaltyDisplay: React.FC<CustomerLoyaltyDisplayProps> = ({
  loyaltyData,
  vendors,
  onRedeemReward
}) => {
  const totalActiveRewards = useMemo(() => {
    return loyaltyData.reduce((sum, data) => {
      return sum + data.earnedRewards.filter(r => !r.isRedeemed && new Date(r.expiryDate) > new Date()).length;
    }, 0);
  }, [loyaltyData]);

  const getVendor = (vendorId: string) => vendors.find(v => v.id === vendorId);

  const getDaysUntilExpiry = (expiryDate: string) => {
    const days = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const isExpiringSoon = (expiryDate: string) => {
    return getDaysUntilExpiry(expiryDate) <= 7;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <GiftIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">My Loyalty Rewards</h2>
              <p className="text-white/80 text-sm">Earn points, get rewards!</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{totalActiveRewards}</div>
            <div className="text-white/80 text-xs">Available Rewards</div>
          </div>
        </div>
      </div>

      {loyaltyData.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <GiftIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Loyalty Programs Yet</h3>
          <p className="text-gray-500 text-sm">
            Order from restaurants with loyalty programs to start earning rewards!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {loyaltyData.map((data) => {
            const vendor = getVendor(data.vendorId);
            const loyaltyProgram = vendor?.loyaltyProgram;
            if (!loyaltyProgram?.isActive) return null;

            const activeRewards = data.earnedRewards.filter(r => !r.isRedeemed && new Date(r.expiryDate) > new Date());
            const redeemedRewards = data.earnedRewards.filter(r => r.isRedeemed);
            const expiredRewards = data.earnedRewards.filter(r => !r.isRedeemed && new Date(r.expiryDate) <= new Date());

            // Next reward progress
            const sortedTiers = [...(loyaltyProgram.rewardTiers || [])].sort((a, b) => a.pointsRequired - b.pointsRequired);
            const nextTier = sortedTiers.find(tier => tier.pointsRequired > data.currentMonthPoints);
            const progressPercentage = nextTier 
              ? Math.min(100, (data.currentMonthPoints / nextTier.pointsRequired) * 100)
              : 100;

            return (
              <div key={data.vendorId} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
                {/* Restaurant Header */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 border-b border-purple-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {vendor?.image && (
                        <img
                          src={vendor.image}
                          alt={data.vendorName}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <h3 className="font-bold text-gray-900">{data.vendorName}</h3>
                        <p className="text-xs text-gray-500">
                          {data.currentMonthOrderCount} order{data.currentMonthOrderCount !== 1 ? 's' : ''} this month
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">{data.currentMonthPoints}</div>
                      <div className="text-xs text-gray-500">points</div>
                    </div>
                  </div>
                </div>

                {/* Progress to Next Reward */}
                {nextTier && (
                  <div className="p-4 bg-purple-50/50 border-b border-purple-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">
                        Next Reward: {nextTier.description}
                      </span>
                      <span className="text-sm text-purple-600 font-bold">
                        {data.currentMonthPoints}/{nextTier.pointsRequired}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {nextTier.pointsRequired - data.currentMonthPoints} more point{(nextTier.pointsRequired - data.currentMonthPoints) !== 1 ? 's' : ''} to unlock
                    </p>
                  </div>
                )}

                {/* Active Rewards */}
                {activeRewards.length > 0 && (
                  <div className="p-4">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <GiftIcon className="h-4 w-4 text-purple-600" />
                      Available Rewards ({activeRewards.length})
                    </h4>
                    <div className="space-y-2">
                      {activeRewards.map((reward) => (
                        <div
                          key={reward.id}
                          className={`border-2 rounded-xl p-4 transition ${
                            isExpiringSoon(reward.expiryDate)
                              ? 'border-orange-300 bg-orange-50'
                              : 'border-purple-200 bg-purple-50/50'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {reward.rewardType === 'discount' ? (
                                  <div className="px-2 py-1 bg-orange-500 text-white rounded-md text-xs font-bold">
                                    {reward.discountPercentage}% OFF
                                  </div>
                                ) : (
                                  <div className="px-2 py-1 bg-green-500 text-white rounded-md text-xs font-bold">
                                    FREE ITEM
                                  </div>
                                )}
                                {isExpiringSoon(reward.expiryDate) && (
                                  <div className="px-2 py-1 bg-red-500 text-white rounded-md text-xs font-bold animate-pulse">
                                    EXPIRING SOON
                                  </div>
                                )}
                              </div>
                              <p className="text-sm font-semibold text-gray-900">{reward.description}</p>
                              {reward.freeItemName && (
                                <p className="text-xs text-gray-600 mt-1">Item: {reward.freeItemName}</p>
                              )}
                            </div>
                            <button
                              onClick={() => onRedeemReward(reward)}
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition shadow-md"
                            >
                              Redeem
                            </button>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-600 mt-2">
                            <div className="flex items-center gap-1">
                              <ClockIcon className="h-3 w-3" />
                              <span>
                                Expires in {getDaysUntilExpiry(reward.expiryDate)} day{getDaysUntilExpiry(reward.expiryDate) !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <StarIcon className="h-3 w-3" />
                              <span>Earned {new Date(reward.earnedDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Redeemed Rewards */}
                {redeemedRewards.length > 0 && (
                  <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                      Redeemed ({redeemedRewards.length})
                    </h4>
                    <div className="space-y-2">
                      {redeemedRewards.slice(0, 3).map((reward) => (
                        <div
                          key={reward.id}
                          className="border border-gray-200 rounded-lg p-3 bg-white opacity-60"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-gray-700">{reward.description}</p>
                              <p className="text-xs text-gray-500">
                                Redeemed {reward.redeemedDate ? new Date(reward.redeemedDate).toLocaleDateString() : ''}
                              </p>
                            </div>
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expired Rewards */}
                {expiredRewards.length > 0 && (
                  <div className="p-4 bg-red-50 border-t border-red-100">
                    <p className="text-xs text-red-600">
                      {expiredRewards.length} reward{expiredRewards.length !== 1 ? 's' : ''} expired
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* How It Works */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <StarIcon className="h-5 w-5 text-blue-600" />
          How Loyalty Points Work
        </h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
              1
            </div>
            <p>
              <strong>Earn Points:</strong> Complete orders at participating restaurants to earn points. Each restaurant sets their own points per order.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
              2
            </div>
            <p>
              <strong>Unlock Rewards:</strong> Accumulate points each month to unlock discount codes or free items.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
              3
            </div>
            <p>
              <strong>Redeem:</strong> Use your rewards on your next order before they expire!
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
              4
            </div>
            <p>
              <strong>Monthly Reset:</strong> Points reset at the start of each month, so keep ordering to maintain your rewards!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerLoyaltyDisplay;
