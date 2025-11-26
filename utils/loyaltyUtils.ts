import { UserLoyaltyPoints, LoyaltyRewardTier, EarnedReward, FoodOrder, Vendor } from '../types';

/**
 * Award loyalty points to a customer after completing an order
 */
export const awardLoyaltyPoints = (
  existingLoyalty: UserLoyaltyPoints | undefined,
  order: FoodOrder,
  vendor: Vendor
): UserLoyaltyPoints | null => {
  if (!vendor.loyaltyProgram?.isActive) return null;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  
  const pointsToAward = vendor.loyaltyProgram.pointsPerOrder;

  const updatedLoyalty: UserLoyaltyPoints = {
    vendorId: vendor.id,
    vendorName: vendor.name,
    totalPoints: (existingLoyalty?.totalPoints || 0) + pointsToAward,
    currentMonthPoints: existingLoyalty?.monthStartDate === monthStart
      ? (existingLoyalty?.currentMonthPoints || 0) + pointsToAward
      : pointsToAward, // Reset if new month
    currentMonthOrderCount: existingLoyalty?.monthStartDate === monthStart
      ? (existingLoyalty?.currentMonthOrderCount || 0) + 1
      : 1,
    lastOrderDate: order.orderTime,
    monthStartDate: monthStart,
    earnedRewards: existingLoyalty?.earnedRewards || []
  };

  // Check if user unlocked any new rewards
  const newRewards = checkForNewRewards(
    updatedLoyalty.currentMonthPoints,
    existingLoyalty?.currentMonthPoints || 0,
    vendor.loyaltyProgram.rewardTiers,
    vendor,
    updatedLoyalty.earnedRewards
  );

  updatedLoyalty.earnedRewards = [...updatedLoyalty.earnedRewards, ...newRewards];

  return updatedLoyalty;
};

/**
 * Check if customer has unlocked any new reward tiers
 */
const checkForNewRewards = (
  currentPoints: number,
  previousPoints: number,
  tiers: LoyaltyRewardTier[],
  vendor: Vendor,
  existingRewards: EarnedReward[]
): EarnedReward[] => {
  const newRewards: EarnedReward[] = [];
  const now = new Date();

  tiers.forEach(tier => {
    // Check if this tier was just unlocked
    if (currentPoints >= tier.pointsRequired && previousPoints < tier.pointsRequired) {
      // Check if reward was already earned this month
      const alreadyEarned = existingRewards.some(
        r => r.tierId === tier.id && !r.isRedeemed && new Date(r.expiryDate) > now
      );

      if (!alreadyEarned) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + (tier.validityDays || 30));

        const newReward: EarnedReward = {
          id: `reward_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          tierId: tier.id,
          vendorId: vendor.id,
          vendorName: vendor.name,
          rewardType: tier.rewardType,
          discountPercentage: tier.discountPercentage,
          freeItemId: tier.freeItemId,
          freeItemName: tier.freeItemName,
          description: tier.description,
          earnedDate: now.toISOString(),
          expiryDate: expiryDate.toISOString(),
          isRedeemed: false
        };

        newRewards.push(newReward);
      }
    }
  });

  return newRewards;
};

/**
 * Redeem a loyalty reward and apply it to an order
 */
export const redeemLoyaltyReward = (
  reward: EarnedReward,
  orderId: string
): EarnedReward => {
  return {
    ...reward,
    isRedeemed: true,
    redeemedDate: new Date().toISOString(),
    orderId
  };
};

/**
 * Calculate discount amount from a loyalty reward
 */
export const calculateLoyaltyDiscount = (
  reward: EarnedReward,
  orderSubtotal: number
): number => {
  if (reward.rewardType === 'discount' && reward.discountPercentage) {
    return Math.floor(orderSubtotal * (reward.discountPercentage / 100));
  }
  return 0;
};

/**
 * Get all active (non-redeemed, non-expired) rewards for a customer
 */
export const getActiveRewards = (
  loyaltyData: UserLoyaltyPoints[],
  vendorId?: string
): EarnedReward[] => {
  const now = new Date();
  let rewards: EarnedReward[] = [];

  loyaltyData.forEach(data => {
    if (vendorId && data.vendorId !== vendorId) return;
    
    const activeRewards = data.earnedRewards.filter(
      r => !r.isRedeemed && new Date(r.expiryDate) > now
    );
    rewards = [...rewards, ...activeRewards];
  });

  return rewards;
};

/**
 * Reset monthly points (should be called at start of each month)
 */
export const resetMonthlyPoints = (
  loyaltyData: UserLoyaltyPoints[]
): UserLoyaltyPoints[] => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  return loyaltyData.map(data => {
    // Check if we're in a new month
    if (data.monthStartDate !== monthStart) {
      return {
        ...data,
        currentMonthPoints: 0,
        currentMonthOrderCount: 0,
        monthStartDate: monthStart
      };
    }
    return data;
  });
};

/**
 * Get loyalty progress for a specific vendor
 */
export const getLoyaltyProgress = (
  loyaltyData: UserLoyaltyPoints | undefined,
  vendor: Vendor
): {
  currentPoints: number;
  nextReward: LoyaltyRewardTier | null;
  progress: number;
} => {
  if (!vendor.loyaltyProgram?.isActive || !loyaltyData) {
    return { currentPoints: 0, nextReward: null, progress: 0 };
  }

  const currentPoints = loyaltyData.currentMonthPoints;
  const sortedTiers = [...vendor.loyaltyProgram.rewardTiers].sort(
    (a, b) => a.pointsRequired - b.pointsRequired
  );

  const nextReward = sortedTiers.find(tier => tier.pointsRequired > currentPoints) || null;
  const progress = nextReward
    ? Math.min(100, (currentPoints / nextReward.pointsRequired) * 100)
    : 100;

  return { currentPoints, nextReward, progress };
};

/**
 * Check if a reward can be applied to an order
 */
export const canApplyReward = (
  reward: EarnedReward,
  orderId: string,
  vendorId: string
): { canApply: boolean; reason?: string } => {
  if (reward.isRedeemed) {
    return { canApply: false, reason: 'Reward already redeemed' };
  }

  if (new Date(reward.expiryDate) <= new Date()) {
    return { canApply: false, reason: 'Reward expired' };
  }

  if (reward.vendorId !== vendorId) {
    return { canApply: false, reason: 'Reward not valid for this restaurant' };
  }

  return { canApply: true };
};

/**
 * Save loyalty data to localStorage
 */
export const saveLoyaltyData = (userId: string, loyaltyData: UserLoyaltyPoints[]): void => {
  const key = `loyalty_${userId}`;
  localStorage.setItem(key, JSON.stringify(loyaltyData));
};

/**
 * Load loyalty data from localStorage
 */
export const loadLoyaltyData = (userId: string): UserLoyaltyPoints[] => {
  const key = `loyalty_${userId}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};
