import { ShareProof, SocialPlatform } from '../types';

/**
 * Generate a unique promo code for share proof
 * Format: SHARE10-XXXXX (5 random alphanumeric characters)
 */
export const generateSharePromoCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'SHARE10-';
    
    for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return code;
};

/**
 * Create a share proof record
 */
export const createShareProof = (
    userId: string,
    vendorId: string,
    vendorName: string,
    platform: SocialPlatform,
    screenshotUrl: string,
    postLink: string
): ShareProof => {
    return {
        id: `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        vendorId,
        vendorName,
        platform,
        screenshotUrl,
        postLink,
        timestamp: new Date().toISOString(),
        verified: false, // Restaurant needs to verify
        promoCode: generateSharePromoCode(),
        redeemed: false
    };
};

/**
 * Send WhatsApp notification to restaurant about new share
 */
export const notifyRestaurantOfShare = (
    restaurantWhatsApp: string,
    customerName: string,
    vendorName: string,
    platform: SocialPlatform,
    postLink: string,
    promoCode: string
): void => {
    const message = `🎉 *New Social Media Share!*\n\n` +
        `Customer: ${customerName}\n` +
        `Platform: ${platform}\n` +
        `Your Restaurant: ${vendorName}\n\n` +
        `Post Link: ${postLink}\n\n` +
        `Generated Promo Code: *${promoCode}*\n` +
        `Discount: 10% Dine-In\n\n` +
        `Please verify the share is genuine. Customer will use this code when dining in.`;
    
    const whatsappUrl = `https://wa.me/${restaurantWhatsApp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp in new window
    window.open(whatsappUrl, '_blank');
};

/**
 * Upload screenshot to storage (placeholder - integrate with your storage solution)
 * In production, this would upload to Firebase Storage, Supabase Storage, or S3
 */
export const uploadScreenshot = async (file: File, shareProofId: string): Promise<string> => {
    // Placeholder: In production, implement actual upload logic
    // For now, return a data URL
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
    });
};

/**
 * Save share proof to database (placeholder)
 */
export const saveShareProof = async (shareProof: ShareProof): Promise<void> => {
    // Placeholder: In production, save to Supabase or Firebase
    console.log('Saving share proof:', shareProof);
    
    // Store in localStorage for demo
    const existingProofs = JSON.parse(localStorage.getItem('shareProofs') || '[]');
    existingProofs.push(shareProof);
    localStorage.setItem('shareProofs', JSON.stringify(existingProofs));
};

/**
 * Get all share proofs for a user
 */
export const getUserShareProofs = (userId: string): ShareProof[] => {
    const allProofs = JSON.parse(localStorage.getItem('shareProofs') || '[]');
    return allProofs.filter((proof: ShareProof) => proof.userId === userId);
};

/**
 * Get all share proofs for a vendor
 */
export const getVendorShareProofs = (vendorId: string): ShareProof[] => {
    const allProofs = JSON.parse(localStorage.getItem('shareProofs') || '[]');
    return allProofs.filter((proof: ShareProof) => proof.vendorId === vendorId);
};

/**
 * Verify a share proof (restaurant action)
 */
export const verifyShareProof = (shareProofId: string): void => {
    const allProofs: ShareProof[] = JSON.parse(localStorage.getItem('shareProofs') || '[]');
    const updatedProofs = allProofs.map(proof => 
        proof.id === shareProofId 
            ? { ...proof, verified: true }
            : proof
    );
    localStorage.setItem('shareProofs', JSON.stringify(updatedProofs));
};

/**
 * Redeem a share promo code
 */
export const redeemSharePromoCode = (promoCode: string): boolean => {
    const allProofs: ShareProof[] = JSON.parse(localStorage.getItem('shareProofs') || '[]');
    const proof = allProofs.find(p => p.promoCode === promoCode && !p.redeemed && p.verified);
    
    if (!proof) {
        return false; // Code not found, already redeemed, or not verified
    }
    
    // Mark as redeemed
    const updatedProofs = allProofs.map(p => 
        p.promoCode === promoCode 
            ? { ...p, redeemed: true, redemptionDate: new Date().toISOString() }
            : p
    );
    localStorage.setItem('shareProofs', JSON.stringify(updatedProofs));
    
    return true;
};
