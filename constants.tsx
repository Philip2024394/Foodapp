import { MembershipTier, MembershipPackage } from './types';

export const MEMBERSHIP_PACKAGES: MembershipPackage[] = [
  {
    tier: MembershipTier.SILVER,
    name: 'Silver Package',
    price: 200000, // IDR 200,000
    duration: 30, // 30 days
    features: {
      promotionalContent: 'image',
      analytics: false,
      priorityListing: false,
    },
    description: 'Upload a promotional image to showcase your restaurant on the main feed',
  },
  {
    tier: MembershipTier.GOLD,
    name: 'Gold Package',
    price: 300000, // IDR 300,000
    duration: 30, // 30 days
    features: {
      promotionalContent: 'video',
      maxVideoDuration: 15, // 15 seconds max
      analytics: true,
      priorityListing: true,
    },
    description: 'Upload a 15-second promotional video to stand out on the main feed with priority listing',
  },
];

export const getActiveMembershipPackage = (tier?: MembershipTier): MembershipPackage | null => {
  if (!tier || tier === MembershipTier.NONE) return null;
  return MEMBERSHIP_PACKAGES.find(pkg => pkg.tier === tier) || null;
};

export const isMembershipActive = (expiryDate?: string): boolean => {
  if (!expiryDate) return false;
  return new Date(expiryDate) > new Date();
};
