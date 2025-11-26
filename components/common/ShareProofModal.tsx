import React, { useState } from 'react';
import { SocialPlatform, Vendor } from '../../types';
import { XMarkIcon, PhotoIcon, LinkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import FileUploadInput from './FileUploadInput';

interface ShareProofModalProps {
    isOpen: boolean;
    onClose: () => void;
    vendor: Vendor;
    platform: SocialPlatform;
    onSubmit: (screenshot: File, postLink: string) => void;
}

const ShareProofModal: React.FC<ShareProofModalProps> = ({ isOpen, onClose, vendor, platform, onSubmit }) => {
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [screenshotPreview, setScreenshotPreview] = useState<string>('');
    const [postLink, setPostLink] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    if (!isOpen) return null;

    const handleScreenshotChange = (file: File) => {
        setScreenshot(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setScreenshotPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async () => {
        if (!screenshot || !postLink.trim()) {
            alert('Please upload a screenshot and provide the post link');
            return;
        }

        setIsSubmitting(true);
        
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        onSubmit(screenshot, postLink);
        
        setShowSuccess(true);
        
        // Auto close after showing success
        setTimeout(() => {
            setShowSuccess(false);
            setScreenshot(null);
            setScreenshotPreview('');
            setPostLink('');
            setIsSubmitting(false);
            onClose();
        }, 2500);
    };

    const getPlatformColor = () => {
        switch (platform) {
            case SocialPlatform.WHATSAPP: return 'from-green-500 to-green-600';
            case SocialPlatform.FACEBOOK: return 'from-blue-600 to-blue-700';
            case SocialPlatform.TWITTER: return 'from-black to-gray-800';
            case SocialPlatform.INSTAGRAM: return 'from-purple-600 via-pink-600 to-orange-500';
            case SocialPlatform.TELEGRAM: return 'from-sky-400 to-blue-500';
            case SocialPlatform.LINKEDIN: return 'from-blue-600 to-blue-800';
            default: return 'from-gray-600 to-gray-700';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            {showSuccess ? (
                <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center animate-fade-in-scale">
                    <div className="mb-4 flex justify-center">
                        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircleIcon className="w-12 h-12 text-green-600" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
                    <p className="text-gray-600 mb-4">
                        Your share proof has been submitted. You'll receive your <span className="font-bold text-orange-600">10% dine-in discount code</span> shortly!
                    </p>
                    <p className="text-sm text-gray-500">
                        The restaurant has been notified via WhatsApp
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getPlatformColor()} flex items-center justify-center`}>
                                <span className="text-white text-xs font-bold">{platform[0]}</span>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Submit Share Proof</h2>
                                <p className="text-xs text-gray-500">{platform} • {vendor.name}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-6 space-y-6">
                        {/* Reward Banner */}
                        <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl p-4 text-white">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <span className="text-2xl font-bold">10%</span>
                                </div>
                                <div>
                                    <p className="font-bold text-lg">Earn 10% Dine-In Discount!</p>
                                    <p className="text-sm text-white/90">Just upload proof of your share</p>
                                </div>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="bg-blue-50 rounded-xl p-4">
                            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">!</span>
                                How it works
                            </h3>
                            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                                <li>Take a screenshot of your {platform} post</li>
                                <li>Upload the screenshot below</li>
                                <li>Paste the link to your post</li>
                                <li>Get your unique 10% discount code!</li>
                            </ol>
                        </div>

                        {/* Screenshot Upload */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <PhotoIcon className="w-5 h-5 text-orange-500" />
                                Screenshot of Post *
                            </label>
                            
                            {screenshotPreview ? (
                                <div className="relative">
                                    <img 
                                        src={screenshotPreview} 
                                        alt="Screenshot preview" 
                                        className="w-full rounded-xl border-2 border-gray-200"
                                    />
                                    <button
                                        onClick={() => {
                                            setScreenshot(null);
                                            setScreenshotPreview('');
                                        }}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <FileUploadInput
                                    label=""
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleScreenshotChange(file);
                                    }}
                                />
                            )}
                        </div>

                        {/* Post Link */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <LinkIcon className="w-5 h-5 text-orange-500" />
                                Link to Post *
                            </label>
                            <input
                                type="url"
                                value={postLink}
                                onChange={(e) => setPostLink(e.target.value)}
                                placeholder={`https://${platform.toLowerCase()}.com/...`}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Paste the URL of your {platform} post
                            </p>
                        </div>

                        {/* Terms */}
                        <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-600">
                                By submitting, you confirm that this is a genuine share of {vendor.name}. 
                                The restaurant will verify your submission and you'll receive your discount code via notification.
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-3xl">
                        <button
                            onClick={handleSubmit}
                            disabled={!screenshot || !postLink.trim() || isSubmitting}
                            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-4 rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                'Submit & Get 10% Discount'
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShareProofModal;
