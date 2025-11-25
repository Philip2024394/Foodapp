import React, { useMemo, useState } from 'react';
import { Booking, BookingType, VehicleType, Page } from '../../types';
import { BriefcaseIcon, StarIcon, EyeIcon } from '../common/Icon';
import { useDataContext } from '../../hooks/useDataContext';
import { useNavigationContext } from '../../hooks/useNavigationContext';
import { useCartContext } from '../../hooks/useCartContext';
import BookingHistoryCard from '../profile/BookingHistoryCard';
import { useBookingContext } from '../../hooks/useBookingContext';
import { useAuthContext } from '../../hooks/useAuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

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
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="w-full max-w-md p-8 space-y-6 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-white">
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
    const { user, signOut } = useAuthContext();
    const { savedBookingIds, saveBooking, unsaveBooking, bookingHistory } = useDataContext();
    const { navigateTo } = useNavigationContext();
    const { guestRewardStatus } = useCartContext();
    const { rebookFromHistory } = useBookingContext();

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
                    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl p-8 flex flex-col md:flex-row items-center gap-8">
                        <img src={'https://picsum.photos/seed/userprofile_avatar/200/200'} alt={user.email} className="w-32 h-32 rounded-full object-cover border-4 border-orange-500/50" />
                        <div className="text-center md:text-left flex-grow">
                            <h1 className="text-3xl font-bold text-stone-100 truncate">{user.email}</h1>
                            <p className="text-stone-400">Welcome to your dashboard</p>
                            <button className="mt-4 px-4 py-2 text-sm bg-black/20 rounded-full hover:bg-black/40 transition-colors">Edit Profile</button>
                        </div>
                        <button onClick={signOut} className="flex-shrink-0 mt-4 md:mt-0 px-6 py-2 bg-red-600/80 text-white font-semibold rounded-full hover:bg-red-700/80 transition-colors">
                            Sign Out
                        </button>
                    </div>

                    {guestRewardStatus === 'active' && (
                        <div className="discount-glow bg-orange-500/10 backdrop-blur-lg border border-orange-500/30 rounded-xl shadow-md p-4 text-center animate-fade-in-scale">
                            <h3 className="text-lg font-semibold text-orange-400">🎉 Guest Reward Active!</h3>
                            <p className="text-stone-300 mt-1">You have 5% OFF all rides, food, and parcel deliveries.</p>
                        </div>
                    )}

                    <div 
                        onClick={() => navigateTo(Page.DRIVER_SIGNUP)}
                        className="cursor-pointer group bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl shadow-xl p-6 flex items-center justify-between transition-transform transform hover:scale-105"
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
                        <h2 className="text-2xl font-bold text-stone-100 mb-4">My Favorites</h2>
                        <div 
                            onClick={() => navigateTo(Page.FAVORITE_DRIVERS)}
                            className="cursor-pointer group bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl p-6 flex items-center justify-between transition-all transform hover:scale-105 hover:border-orange-500/50"
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
                        <h2 className="text-2xl font-bold text-stone-100 mb-4">Recent Bookings</h2>
                        <p className="text-sm text-stone-400 -mt-3 mb-4">Click to rebook. Hold for 3 seconds to save or unsave for quick access.</p>
                         {sortedBookings.length > 0 ? (
                            <div className="space-y-4">
                                {sortedBookings.map(booking => (
                                    <BookingHistoryCard
                                        key={booking.id}
                                        booking={booking}
                                        isSaved={savedBookingIds.includes(booking.id)}
                                        onSaveToggle={saveBooking}
                                        onUnsaveToggle={unsaveBooking}
                                        onRebook={rebookFromHistory}
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