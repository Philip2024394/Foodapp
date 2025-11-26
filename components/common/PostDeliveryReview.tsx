import React, { useState } from 'react';
import { ReviewEmoji, FoodOrder } from '../../types';
import { CloseIcon, StarIcon } from '../common/Icon';

interface PostDeliveryReviewProps {
    order: FoodOrder;
    customerName: string;
    customerWhatsApp: string;
    onSubmit: (emoji: ReviewEmoji, rating: number, comment: string, images?: File[]) => void;
    onSkip: () => void;
}

const PostDeliveryReview: React.FC<PostDeliveryReviewProps> = ({
    order,
    customerName,
    customerWhatsApp,
    onSubmit,
    onSkip
}) => {
    const [selectedEmoji, setSelectedEmoji] = useState<ReviewEmoji | null>(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    const emojiOptions = [
        { type: ReviewEmoji.SAD, emoji: '😞', label: 'Disappointed', color: 'from-red-400 to-red-500' },
        { type: ReviewEmoji.NEUTRAL, emoji: '😐', label: 'Okay', color: 'from-yellow-400 to-yellow-500' },
        { type: ReviewEmoji.HAPPY, emoji: '😊', label: 'Good', color: 'from-green-400 to-green-500' },
        { type: ReviewEmoji.EXCITED, emoji: '🤩', label: 'Amazing!', color: 'from-orange-400 to-pink-500' }
    ];

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (images.length + files.length > 3) {
            alert('Maximum 3 photos allowed');
            return;
        }

        setImages([...images, ...files]);

        // Create previews
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file as Blob);
        });
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
        setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        if (!selectedEmoji || rating === 0) {
            alert('Please select your mood and rating');
            return;
        }

        onSubmit(selectedEmoji, rating, comment, images.length > 0 ? images : undefined);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-6 rounded-t-3xl">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold">How was your order?</h2>
                        <button onClick={onSkip} className="text-white/80 hover:text-white">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <p className="text-white/90 text-sm">Your feedback helps {order.vendorName} improve!</p>
                </div>

                {/* Content */}
                <div className="px-6 py-6 space-y-6">
                    {/* Customer Info */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                {customerName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">{customerName}</p>
                                <p className="text-sm text-gray-600">{customerWhatsApp}</p>
                            </div>
                        </div>
                    </div>

                    {/* Emoji Selection */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3">How do you feel?</h3>
                        <div className="grid grid-cols-4 gap-3">
                            {emojiOptions.map((option) => (
                                <button
                                    key={option.type}
                                    onClick={() => setSelectedEmoji(option.type)}
                                    className={`p-4 rounded-xl border-2 transition-all ${
                                        selectedEmoji === option.type
                                            ? `border-transparent bg-gradient-to-br ${option.color} shadow-lg scale-110`
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                                >
                                    <div className="text-4xl mb-2">{option.emoji}</div>
                                    <p className={`text-xs font-semibold ${
                                        selectedEmoji === option.type ? 'text-white' : 'text-gray-600'
                                    }`}>
                                        {option.label}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Star Rating */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Rate your experience</h3>
                        <div className="flex gap-2 justify-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className="transition-transform hover:scale-110"
                                >
                                    <StarIcon className={`w-12 h-12 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                                </button>
                            ))}
                        </div>
                        <p className="text-center text-sm text-gray-500 mt-2">
                            {rating === 0 ? 'Tap to rate' :
                             rating === 1 ? 'Poor' :
                             rating === 2 ? 'Fair' :
                             rating === 3 ? 'Good' :
                             rating === 4 ? 'Very Good' :
                             'Excellent!'}
                        </p>
                    </div>

                    {/* Comment */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Tell us more (optional)</h3>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="What did you love? What could be better?"
                            maxLength={500}
                            rows={4}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1 text-right">{comment.length}/500</p>
                    </div>

                    {/* Photo Upload */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Add photos (optional)</h3>
                        
                        {imagePreviews.length > 0 && (
                            <div className="grid grid-cols-3 gap-3 mb-3">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative">
                                        <img 
                                            src={preview} 
                                            alt={`Preview ${index + 1}`} 
                                            className="w-full h-24 object-cover rounded-lg"
                                        />
                                        <button
                                            onClick={() => removeImage(index)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                        >
                                            <CloseIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {images.length < 3 && (
                            <label className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-center cursor-pointer hover:border-orange-500 transition-colors">
                                <div className="text-4xl mb-2">📸</div>
                                <p className="text-sm text-gray-600">
                                    {images.length === 0 ? 'Upload photos' : `Add ${3 - images.length} more`}
                                </p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>

                    {/* Order Items Reference */}
                    <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                        <h4 className="font-semibold text-gray-900 mb-2">Your Order</h4>
                        <div className="space-y-1">
                            {order.items.map((cartItem, index) => (
                                <p key={index} className="text-sm text-gray-700">
                                    {cartItem.quantity}x {cartItem.item.name}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-3xl flex gap-3">
                    <button
                        onClick={onSkip}
                        className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
                    >
                        Skip
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedEmoji || rating === 0}
                        className="flex-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        Submit Review
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostDeliveryReview;
