import React, { useState, useEffect, useRef } from 'react';
import { LocationPinIcon, CrosshairIcon } from './Icon';
import { FloatingPin } from './FloatingPin';
import { useAuthContext } from '../../hooks/useAuthContext';

const LocationModal: React.FC = () => {
  const { showLocationModal, confirmLocation, closeLocationModal } = useAuthContext();
  
  const [step, setStep] = useState<'location' | 'otp'>('location');
  const [locationInput, setLocationInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [error, setError] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);

  const autocompleteInputRef = useRef<HTMLInputElement>(null);
  const autocompleteInstance = useRef<any>(null);

  const pins = [
    { top: '10%', left: '15%', animationDuration: '5s', animationDelay: '0s', width: '40px', height: '40px' },
    { top: '20%', left: '80%', animationDuration: '7s', animationDelay: '1s', width: '25px', height: '25px' },
    { top: '50%', left: '5%', animationDuration: '8s', animationDelay: '2s', width: '30px', height: '30px' },
    { top: '70%', left: '90%', animationDuration: '6s', animationDelay: '0.5s', width: '50px', height: '50px' },
    { top: '85%', left: '50%', animationDuration: '9s', animationDelay: '3s', width: '20px', height: '20px' },
    { top: '40%', left: '45%', animationDuration: '5s', animationDelay: '1.5s', width: '35px', height: '35px' },
  ];

  useEffect(() => {
    // Reset to the first step whenever the modal is re-opened
    if (showLocationModal) {
      setStep('location');
      setError('');
      setOtpInput('');
    }
  }, [showLocationModal]);

  useEffect(() => {
    if (step === 'location' && autocompleteInputRef.current && (window as any).google) {
        autocompleteInstance.current = new (window as any).google.maps.places.Autocomplete(
            autocompleteInputRef.current,
            { types: ['geocode'], componentRestrictions: { country: 'id' } }
        );

        autocompleteInstance.current.addListener('place_changed', () => {
            const place = autocompleteInstance.current.getPlace();
            if (place && place.formatted_address) {
                setLocationInput(place.formatted_address);
            }
        });
    }
  }, [step]);


  if (!showLocationModal) {
    return null;
  }

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
        setIsGeocoding(true);
        setError('');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                
                try {
                    if (!(window as any).google || !(window as any).google.maps || !(window as any).google.maps.Geocoder) {
                        throw new Error('Google Maps script not loaded yet.');
                    }

                    const geocoder = new (window as any).google.maps.Geocoder();
                    const latlng = { lat: latitude, lng: longitude };

                    geocoder.geocode({ location: latlng }, (results: any, status: any) => {
                        setIsGeocoding(false);
                        if (status === 'OK') {
                            if (results[0]) {
                                setLocationInput(results[0].formatted_address);
                            } else {
                                setError('No results found for your location.');
                            }
                        } else {
                            setError('Geocoder failed due to: ' + status);
                        }
                    });
                } catch(e) {
                    const errorMessage = e instanceof Error ? e.message : 'Failed to fetch address.';
                    setError(errorMessage);
                    setIsGeocoding(false);
                }
            },
            (err) => {
                setError('Could not get location. Please enable location services or enter it manually.');
                setIsGeocoding(false);
            }
        );
    } else {
        setError('Geolocation is not supported by your browser.');
    }
  };

  const handleLocationStep = () => {
    if (!locationInput.trim()) {
      setError('Please enter a location.');
      return;
    }
    if (!phoneInput.trim() || phoneInput.length < 9) {
      setError('Please enter a valid WhatsApp number (at least 9 digits).');
      return;
    }
    setError('');
    // Simulate sending an OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(otp);
    console.log(`Mock OTP Sent: ${otp}`);
    setStep('otp');
  };

  const handleOtpStep = () => {
    if (otpInput === generatedOtp) {
      setError('');
      confirmLocation(locationInput, phoneInput);
    } else {
      setError('Incorrect verification code. Please try again.');
    }
  };

  const renderLocationStep = () => (
    <>
      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
            <LocationPinIcon className="h-8 w-8 text-red-500" />
            <h2 className="text-3xl font-bold text-white tracking-tight">Set Your Location</h2>
        </div>
        <p className="text-stone-300 mt-1">Find the best services near you.</p>
      </div>

      <div className="w-full h-48 rounded-lg overflow-hidden shadow-lg border border-white/10">
        <img src="https://storage.googleapis.com/aistudio-ux-team-data/Racer/map-placeholder.png" alt="Map placeholder" className="w-full h-full object-cover" />
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-stone-300 mb-1">
            Location
          </label>
          <div className="relative">
            <LocationPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
            <input
              id="location"
              ref={autocompleteInputRef}
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder="Enter your address or city"
              className="w-full pl-12 pr-4 py-3 bg-black/20 text-white border border-white/10 rounded-lg shadow-sm focus:outline-none focus:border-orange-500 transition-shadow"
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="whatsapp" className="block text-sm font-medium text-stone-300 mb-1">
            WhatsApp Number (Required)
          </label>
          <div className="flex items-center">
            <span className="inline-flex items-center px-3 py-3 border border-r-0 border-white/10 bg-black/20 text-stone-400 rounded-l-lg">
              +62
            </span>
            <input
              id="whatsapp"
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="812 3456 7890"
              className="w-full pl-4 pr-4 py-3 bg-black/20 text-white border border-white/10 rounded-r-lg shadow-sm focus:outline-none focus:border-orange-500 transition-shadow"
              required
            />
          </div>
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <div className="flex flex-col sm:flex-row gap-3">
            <button
                onClick={handleGetCurrentLocation}
                disabled={isGeocoding}
                className="w-full sm:w-auto flex-shrink-0 px-4 py-3 border border-orange-500/50 font-bold rounded-lg text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {isGeocoding ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                    <CrosshairIcon />
                )}
                <span>Use My Current Location</span>
            </button>
            <button
            onClick={handleLocationStep}
            className="w-full px-4 py-3 border border-transparent font-bold rounded-lg text-white bg-orange-500 hover:bg-orange-600 transition-all shadow-lg transform hover:scale-[1.02]"
            >
            Confirm & Verify
            </button>
        </div>
      </div>
    </>
  );

  const renderOtpStep = () => (
    <>
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white tracking-tight">Verify Your Number</h2>
        <p className="text-stone-300 mt-1">Enter the code sent to your WhatsApp.</p>
      </div>
      
      <div className="my-6 p-4 bg-black/20 rounded-lg text-center border border-dashed border-white/10">
        <p className="text-sm text-stone-400">For this demo, your code is:</p>
        <p className="text-4xl font-bold text-orange-400 tracking-widest my-2">{generatedOtp}</p>
      </div>

      <div className="space-y-4">
        <div>
            <label htmlFor="otp" className="block text-sm font-medium text-stone-300 mb-1">
                4-Digit Code
            </label>
             <input
              id="otp"
              type="tel"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
              placeholder="0000"
              maxLength={4}
              className="w-full p-4 bg-black/20 text-white border border-white/10 rounded-lg shadow-sm focus:outline-none focus:border-orange-500 text-center text-4xl font-mono tracking-[0.4em]"
              autoComplete="one-time-code"
              inputMode="numeric"
            />
        </div>
        
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        
        <button
          onClick={handleOtpStep}
          className="w-full px-4 py-3 border border-transparent font-bold rounded-lg text-white bg-green-600 hover:bg-green-700 transition-all shadow-lg transform hover:scale-[1.02]"
        >
          Verify & Start Exploring
        </button>

         <button
          onClick={() => setStep('location')}
          className="w-full text-sm text-stone-400 hover:text-white transition-colors py-2"
        >
          &larr; Go Back / Change Number
        </button>
      </div>
    </>
  );


  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 p-4 transition-opacity duration-300 ease-in-out">
      {/* Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="https://ik.imagekit.io/7grri5v7d/2go%20drivers%20i.png?updatedAt=1759395860075"
          alt="Indonesian street scene"
          className="w-full h-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/70"></div>
        {pins.map((pin, index) => <FloatingPin key={index} style={pin} />)}
      </div>

      <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl w-full max-w-md m-4 transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-fade-in-scale">
        
        <button
            onClick={closeLocationModal}
            className="absolute -top-3 -right-3 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg hover:bg-orange-700 transform hover:scale-110 transition-all z-10"
            aria-label="Close"
        >
            &times;
        </button>

        <div className="p-8 space-y-6">
          {step === 'location' ? renderLocationStep() : renderOtpStep()}
        </div>
      </div>
    </div>
  );
};

export default LocationModal;