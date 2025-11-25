import React, { useMemo } from 'react';
import { Page, Review } from '../../types';
import { StarIcon } from '../common/Icon';
import { useNavigationContext } from '../../hooks/useNavigationContext';
import { useDataContext } from '../../hooks/useDataContext';

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => (
    <div className="py-4 border-b border-stone-700 last:border-b-0 bg-white/5 p-4 rounded-lg">
        <div className="flex items-center space-x-3">
            <img src={review.userImage} alt={review.userName} className="w-12 h-12 rounded-full object-cover" />
            <div>
                <p className="font-semibold text-stone-200 text-lg">{review.userName}</p>
                <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon key={i} className={`h-5 w-5 ${i < review.rating ? 'text-amber-400' : 'text-stone-600'}`} />
                    ))}
                </div>
            </div>
        </div>
        <p className="text-stone-300 mt-3">{review.comment}</p>
        <p className="text-xs text-stone-500 mt-3 text-right">{new Date(review.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
);


const ReviewsPage: React.FC = () => {
    const { currentVehicleForReviews, navigateTo } = useNavigationContext();
    const { reviews } = useDataContext();

    const { vehicleReviews, totalReviewsCount, averageRating } = useMemo(() => {
        if (!currentVehicleForReviews) {
            return { vehicleReviews: [], totalReviewsCount: 0, averageRating: 'No rating' };
        }

        const allReviewsForVehicle = reviews
            .filter(review => review.vehicleId === currentVehicleForReviews.id)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        const totalCount = allReviewsForVehicle.length;
        const avgRating = totalCount > 0
            ? (allReviewsForVehicle.reduce((acc, review) => acc + review.rating, 0) / totalCount).toFixed(1)
            : 'No rating';

        return {
            vehicleReviews: allReviewsForVehicle.slice(0, 5),
            totalReviewsCount: totalCount,
            averageRating: avgRating,
        };
    }, [currentVehicleForReviews, reviews]);


    if (!currentVehicleForReviews) {
        return (
            <div className="text-center py-16">
                <h2 className="text-2xl font-bold text-stone-100">Item Not Found</h2>
                <p className="mt-2 text-stone-400">
                    Please go back and select an item to see its reviews.
                </p>
                <button
                    onClick={() => navigateTo(Page.HOME)}
                    className="mt-6 px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg shadow-md hover:bg-orange-700 transition-colors"
                >
                    Back to Home
                </button>
            </div>
        );
    }
    
    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-16">
            <div className="flex items-center space-x-4">
                 <button 
                    onClick={() => navigateTo(Page.VENDOR)}
                    className="p-2 bg-white/10 rounded-full text-stone-300 hover:bg-white/20"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-stone-100">{currentVehicleForReviews.name}</h1>
                    <p className="text-lg text-stone-400">Reviews ({totalReviewsCount}) - Avg: <span className="font-bold text-amber-400 flex items-center gap-1">{averageRating} <StarIcon className="h-5 w-5" /></span></p>
                </div>
            </div>

            {vehicleReviews.length > 0 ? (
                <>
                    <p className="text-stone-400">Showing the last {vehicleReviews.length} reviews.</p>
                    <div className="space-y-4">
                        {vehicleReviews.map(review => (
                            <ReviewCard key={review.id} review={review} />
                        ))}
                    </div>
                </>
            ) : (
                <div className="bg-white/5 backdrop-blur-lg border-2 border-dashed border-white/10 rounded-2xl p-8 text-center">
                    <StarIcon className="h-16 w-16 text-stone-500 mx-auto mb-4" />
                    <h3 className="font-bold text-stone-300 text-xl">No Reviews Yet</h3>
                    <p className="text-stone-400 mt-2 max-w-md mx-auto">
                        Be the first to review this vehicle after your rental!
                    </p>
                </div>
            )}
        </div>
    );
};

export default ReviewsPage;