import React, { useMemo, useState } from 'react';
import { Booking, BookingType, VehicleType, Page } from '../../types';
import { BriefcaseIcon, StarIcon, EyeIcon } from '../common/Icon';
import { useDataContext } from '../../hooks/useDataContext';
import { useNavigationContext } from '../../hooks/useNavigationContext';
import { useCartContext } from '../../hooks/useCartContext';
import BookingHistoryCard from '../profile/BookingHistoryCard';
import { useAuthContext } from '../../hooks/useAuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import { validateIndonesianPhoneNumber, formatPhoneNumberDisplay } from '../../utils/whatsapp';
import { getUserShareProofs } from '../../utils/shareProofUtils';

const AuthForm: React.FC = () => {
    const { signIn, signUp } = useAuthContext();
    const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (mode === 'signIn') {
                await signIn({ email, password });
            } else {
                const { data } = await signUp({ email, password });
                if (data.user && data.user.identities && data.user.identities.length === 0) {
                     setMessage("User already exists. Please try logging in.");
                } else {
                     setMessage("Success! Please check your email for a confirmation link to log in.");
                }
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
            <div className="w-full max-w-md p-4 md:p-8 space-y-6 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl">
                <div className="text-center">
                    <h1 className="text-2xl md:text-3xl font-bold text-white">
                        {mode === 'signIn' ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-stone-400 mt-2">
                        {mode === 'signIn' ? 'Sign in to access your profile.' : 'Join the IndoStreet community.'}
                    </p>
                </div>

                <div className="flex bg-black/20 p-1 rounded-full">
                    <button onClick={() => setMode('signIn')} className={`w-1/2 p-2 rounded-full font-semibold transition-colors ${mode === 'signIn' ? 'bg-orange-600 text-white' : 'text-stone-300'}`}>Sign In</button>
                    <button onClick={() => setMode('signUp')} className={`w-1/2 p-2 rounded-full font-semibold transition-colors ${mode === 'signUp' ? 'bg-orange-600 text-white' : 'text-stone-300'}`}>Sign Up</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full p-3 bg-black/20 rounded-md border border-white/10 focus:ring-orange-500 focus:border-orange-500" />
                    <div className="relative">
                        <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="w-full p-3 bg-black/20 rounded-md border border-white/10 focus:ring-orange-500 focus:border-orange-500" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-stone-400">
                            <EyeIcon className="h-5 w-5"/>
                        </button>
                    </div>

                    {error && <p className="text-red-400 text-center">{error}</p>}
                    {message && <p className="text-green-400 text-center">{message}</p>}

                    <button type="submit" disabled={loading} className="w-full p-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors disabled:bg-stone-600">
                        {loading ? <LoadingSpinner /> : (mode === 'signIn' ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>
            </div>
        </div>
    );
};


const Profile: React.FC = () => {
    const { user, signOut, whatsappNumber, confirmLocation } = useAuthContext();
    const { savedBookingIds, saveBooking, unsaveBooking, bookingHistory } = useDataContext();
    const { navigateTo } = useNavigationContext();
    const { guestRewardStatus } = useCartContext();
    const [isEditingWhatsApp, setIsEditingWhatsApp] = useState(false);
    const [whatsAppInput, setWhatsAppInput] = useState('');
    const [whatsAppError, setWhatsAppError] = useState('');
    
    // Get user's share proofs
    const shareProofs = useMemo(() => 
        getUserShareProofs(user?.id || 'current_user_id'), // TODO: Use actual user ID
    [user?.id]);

    const sortedBookings = useMemo(() => {
        return [...bookingHistory].sort((a, b) => {
            const aIsSaved = savedBookingIds.includes(a.id);
            const bIsSaved = savedBookingIds.includes(b.id);
            if (aIsSaved && !bIsSaved) return -1;
            if (!aIsSaved && bIsSaved) return 1;
            // For non-saved items, you might want to sort by date, but for now, we keep original order
            return 0;
        });
    }, [bookingHistory, savedBookingIds]);
    
    const handleSaveWhatsApp = () => {
        setWhatsAppError('');
        
        if (!whatsAppInput.trim()) {
            setWhatsAppError('Please enter your WhatsApp number');
            return;
        }
        
        if (!validateIndonesianPhoneNumber(whatsAppInput)) {
            setWhatsAppError('Please enter a valid Indonesian phone number (e.g., 08123456789)');
            return;
        }
        
        // Save to context (this will be used for orders and notifications)
        confirmLocation(whatsappNumber || 'Indonesia', whatsAppInput);
        setIsEditingWhatsApp(false);
        setWhatsAppInput('');
    };
    
    const handleEditWhatsApp = () => {
        setIsEditingWhatsApp(true);
        setWhatsAppInput(whatsappNumber || '');
        setWhatsAppError('');
    };

    if (!user) {
        return <AuthForm />;
    }

    return (
        <div
            className="relative -m-4 md:-m-8"
            style={{
                backgroundImage: `
                    radial-gradient(circle at 50% 30%, rgba(0, 0, 0, 0.75) 15%, rgba(0, 0, 0, 0.95) 55%, #000000 75%),
                    url(https://picsum.photos/seed/userprofile/1280/800)
                `,
                backgroundSize: 'cover',
                backgroundPosition: 'center 20%',
                backgroundAttachment: 'fixed',
                minHeight: 'calc(100vh - 68px)',
            }}
        >
            <div className="max-w-7xl mx-auto p-4 md:p-8">
                <div className="space-y-8 pb-16 animate-fade-in-scale">
                    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl p-4 md:p-8 flex flex-col md:flex-row items-center gap-4 md:gap-8">
                        <img src={'https://picsum.photos/seed/userprofile_avatar/200/200'} alt={user.email} className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-orange-500/50" />
                        <div className="text-center md:text-left flex-grow">
                            <h1 className="text-2xl md:text-3xl font-bold text-stone-100 truncate">{user.email}</h1>
                            <p className="text-stone-400">Welcome to your dashboard</p>
                            
                            {/* WhatsApp Number Section */}
                            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                    </svg>
                                    <span className="text-sm font-semibold text-green-400">WhatsApp Number</span>
                                </div>
                                
                                {!isEditingWhatsApp ? (
                                    <div className="flex items-center justify-between">
                                        <span className="text-white font-mono">
                                            {whatsappNumber ? formatPhoneNumberDisplay(whatsappNumber) : 'Not set'}
                                        </span>
                                        <button 
                                            onClick={handleEditWhatsApp}
                                            className="text-sm text-orange-400 hover:text-orange-300 font-semibold"
                                        >
                                            {whatsappNumber ? 'Edit' : 'Add'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <input
                                            type="tel"
                                            value={whatsAppInput}
                                            onChange={(e) => setWhatsAppInput(e.target.value)}
                                            placeholder="08123456789"
                                            className="w-full p-2 bg-black/30 rounded border border-green-500/30 text-white placeholder-stone-500 focus:border-green-500 outline-none"
                                        />
                                        {whatsAppError && (
                                            <p className="text-xs text-red-400">{whatsAppError}</p>
                                        )}
                                        <p className="text-xs text-stone-400">Used for order notifications & communication</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleSaveWhatsApp}
                                                className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsEditingWhatsApp(false);
                                                    setWhatsAppError('');
                                                }}
                                                className="px-3 py-1 bg-stone-600 text-white text-sm rounded hover:bg-stone-500"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                                
                                {!whatsappNumber && !isEditingWhatsApp && (
                                    <p className="text-xs text-stone-400 mt-2">Add your WhatsApp to receive order updates & chat with restaurants</p>
                                )}
                            </div>
                        </div>
                        <button onClick={signOut} className="flex-shrink-0 mt-4 md:mt-0 px-6 py-2 bg-red-600/80 text-white font-semibold rounded-full hover:bg-red-700/80 transition-colors">
                            Sign Out
                        </button>
                    </div>

                    {guestRewardStatus === 'active' && (
                        <div className="discount-glow bg-orange-500/10 backdrop-blur-lg border border-orange-500/30 rounded-xl shadow-md p-3 md:p-4 text-center animate-fade-in-scale">
                            <h3 className="text-base md:text-lg font-semibold text-orange-400">🎉 Guest Reward Active!</h3>
                            <p className="text-stone-300 mt-1">You have 5% OFF all rides, food, and parcel deliveries.</p>
                        </div>
                    )}

                    <div 
                        onClick={() => navigateTo(Page.DRIVER_SIGNUP)}
                        className="cursor-pointer group bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl shadow-xl p-4 md:p-6 flex items-center justify-between transition-transform transform hover:scale-105"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-white/20 rounded-full">
                                <BriefcaseIcon className="h-8 w-8 text-white"/>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Become a Partner</h2>
                                <p className="text-white/80">Earn money as a driver or vendor.</p>
                            </div>
                        </div>
                        <span className="text-2xl text-white group-hover:translate-x-2 transition-transform">&rarr;</span>
                    </div>

                    <div className="mt-10">
                        <h2 className="text-xl md:text-2xl font-bold text-stone-100 mb-4">My Favorites</h2>
                        <div 
                            onClick={() => navigateTo(Page.FAVORITE_DRIVERS)}
                            className="cursor-pointer group bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl p-4 md:p-6 flex items-center justify-between transition-all transform hover:scale-105 hover:border-orange-500/50"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-black/20 rounded-full">
                                    <StarIcon className="h-8 w-8 text-amber-400"/>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-stone-100">My Favorite Drivers</h3>
                                    <p className="text-stone-400">View saved drivers & get 5% off.</p>
                                </div>
                            </div>
                            <span className="text-2xl text-orange-400 group-hover:translate-x-2 transition-transform">&rarr;</span>
                        </div>
                    </div>

                    <div className="mt-10">
                        <h2 className="text-xl md:text-2xl font-bold text-stone-100 mb-4">My Share Rewards</h2>
                        <p className="text-xs md:text-sm text-stone-400 -mt-3 mb-4">Earn 10% dine-in discount codes by sharing restaurants on social media</p>
                        {shareProofs.length > 0 ? (
                            <div className="space-y-3">
                                {shareProofs.map(proof => (
                                    <div key={proof.id} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                    proof.platform === 'WhatsApp' ? 'bg-green-500' :
                                                    proof.platform === 'Facebook' ? 'bg-blue-600' :
                                                    proof.platform === 'Twitter' ? 'bg-black' :
                                                    proof.platform === 'Instagram' ? 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500' :
                                                    proof.platform === 'Telegram' ? 'bg-sky-500' :
                                                    proof.platform === 'LinkedIn' ? 'bg-blue-700' :
                                                    'bg-gray-500'
                                                }`}>
                                                    <span className="text-white font-bold text-sm">{proof.platform[0]}</span>
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-semibold">{proof.vendorName}</h3>
                                                    <p className="text-xs text-stone-400">{new Date(proof.timestamp).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                proof.redeemed ? 'bg-gray-500/20 text-gray-400' :
                                                proof.verified ? 'bg-green-500/20 text-green-400' :
                                                'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                                {proof.redeemed ? 'Redeemed' : proof.verified ? 'Verified' : 'Pending'}
                                            </span>
                                        </div>
                                        
                                        <div className="bg-black/30 rounded-lg p-3 border border-orange-500/30">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-stone-400 mb-1">Promo Code</p>
                                                    <p className="text-lg font-bold text-orange-400 tracking-wider">{proof.promoCode}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-white">10%</p>
                                                    <p className="text-xs text-stone-400">OFF</p>
                                                </div>
                                            </div>
                                            {!proof.redeemed && proof.verified && (
                                                <p className="text-xs text-green-400 mt-2">✓ Ready to use at {proof.vendorName}</p>
                                            )}
                                            {!proof.verified && (
                                                <p className="text-xs text-yellow-400 mt-2">⏳ Waiting for restaurant verification</p>
                                            )}
                                            {proof.redeemed && (
                                                <p className="text-xs text-gray-400 mt-2">Used on {new Date(proof.redemptionDate!).toLocaleDateString()}</p>
                                            )}
                                        </div>
                                        
                                        <a 
                                            href={proof.postLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-xs text-orange-400 hover:text-orange-300 mt-2 inline-block"
                                        >
                                            View post on {proof.platform} →
                                        </a>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                                <div className="text-5xl mb-3">🎁</div>
                                <p className="text-stone-300 font-semibold mb-2">No share rewards yet</p>
                                <p className="text-stone-400 text-sm">Share restaurants on social media to earn 10% discount codes!</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-10">
                        <h2 className="text-xl md:text-2xl font-bold text-stone-100 mb-4">Recent Bookings</h2>
                        <p className="text-xs md:text-sm text-stone-400 -mt-3 mb-4">Click to rebook. Hold for 3 seconds to save or unsave for quick access.</p>
                         {sortedBookings.length > 0 ? (
                            <div className="space-y-4">
                                {sortedBookings.map(booking => (
                                    <BookingHistoryCard
                                        key={booking.id}
                                        booking={booking}
                                        isSaved={savedBookingIds.includes(booking.id)}
                                        onSaveToggle={saveBooking}
                                        onUnsaveToggle={unsaveBooking}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-white/5 backdrop-blur-sm rounded-lg">
                                <p className="text-stone-400">No past bookings found.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Profile;