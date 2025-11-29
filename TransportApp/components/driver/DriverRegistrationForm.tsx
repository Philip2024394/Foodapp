import React, { useState } from 'react';
import { VehicleType } from '../../types';

interface DriverRegistrationFormProps {
  selectedVehicle: VehicleType;
  onSubmit: (data: DriverRegistrationData) => void;
  onBack: () => void;
}

export interface DriverRegistrationData {
  // Personal Information
  fullName: string;
  dateOfBirth: string; // From KTP to calculate age
  age: number; // Calculated, must be 18-65
  address: string;
  whatsAppNumber: string;
  phoneVerified: boolean; // OTP verification status
  profilePhoto: File | null; // Driver selfie
  
  // Emergency Contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  
  // Documents
  ktpNumber: string;
  ktpImage: File | null;
  npwpNumber?: string; // Optional tax ID
  
  // Bank Details (must match KTP)
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  
  // Driver License (SIM)
  licenseNumber: string;
  licenseType: string; // SIM A, B1, B2, C
  licenseExpiry: string;
  licenseImage: File | null;
  
  // Vehicle Registration (STNK)
  vehiclePlateNumber: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleColor: string;
  stnkImage: File | null;
  
  // Vehicle Condition Checklist
  vehicleHasValidInsurance: boolean;
  vehicleInGoodCondition: boolean;
  vehicleHasWorkingLights: boolean;
  vehicleHasSafetyEquipment: boolean;
  
  // Consent & Terms Agreement
  agreedToBackgroundCheck: boolean;
  agreedToTerms: boolean;
  agreedToLiability: boolean;
}

export const DriverRegistrationForm: React.FC<DriverRegistrationFormProps> = ({
  selectedVehicle,
  onSubmit,
  onBack
}) => {
  const [formData, setFormData] = useState<DriverRegistrationData>({
    fullName: '',
    dateOfBirth: '',
    age: 0,
    address: '',
    whatsAppNumber: '',
    phoneVerified: false,
    profilePhoto: null,
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    ktpNumber: '',
    ktpImage: null,
    npwpNumber: '',
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    licenseNumber: '',
    licenseType: '',
    licenseExpiry: '',
    licenseImage: null,
    vehiclePlateNumber: '',
    vehicleBrand: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleColor: '',
    stnkImage: null,
    vehicleHasValidInsurance: false,
    vehicleInGoodCondition: false,
    vehicleHasWorkingLights: false,
    vehicleHasSafetyEquipment: false,
    agreedToBackgroundCheck: false,
    agreedToTerms: false,
    agreedToLiability: false
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [showTerms, setShowTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');

  const requiredLicenseType = {
    [VehicleType.BIKE]: 'SIM C',
    [VehicleType.TUKTUK]: 'SIM A',
    [VehicleType.CAR]: 'SIM A',
    [VehicleType.BOX_LORRY]: 'SIM B1 or B2',
    [VehicleType.FLATBED_LORRY]: 'SIM B1 or B2'
  };

  const handleFileChange = (field: 'ktpImage' | 'licenseImage' | 'stnkImage' | 'profilePhoto', file: File | null) => {
    if (file && file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, [field]: 'File size must be less than 5MB' });
      return;
    }
    setFormData({ ...formData, [field]: file });
    setErrors({ ...errors, [field]: '' });
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Send OTP for phone verification
  const handleSendOtp = () => {
    if (!formData.whatsAppNumber.match(/^(\+62|62|0)[0-9]{9,12}$/)) {
      setErrors({ ...errors, whatsAppNumber: 'Valid phone number required' });
      return;
    }
    // Generate 6-digit OTP (in production, send via SMS API)
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpCode(generatedOtp);
    setOtpSent(true);
    // In production: Call SMS API to send OTP
    console.log(`OTP sent to ${formData.whatsAppNumber}: ${generatedOtp}`);
    alert(`OTP sent! (Demo: ${generatedOtp})`);
  };

  const handleVerifyOtp = () => {
    if (enteredOtp === otpCode) {
      setFormData({ ...formData, phoneVerified: true });
      setErrors({ ...errors, phoneVerified: '' });
      alert('✓ Phone number verified successfully!');
    } else {
      setErrors({ ...errors, phoneVerified: 'Invalid OTP code' });
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = 'Date of birth is required';
      } else {
        const age = calculateAge(formData.dateOfBirth);
        if (age < 18) newErrors.dateOfBirth = 'You must be at least 18 years old';
        if (age > 65) newErrors.dateOfBirth = 'Maximum age is 65 years';
      }
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.whatsAppNumber.match(/^(\+62|62|0)[0-9]{9,12}$/)) {
        newErrors.whatsAppNumber = 'Valid Indonesian phone number required';
      }
      if (!formData.phoneVerified) {
        newErrors.phoneVerified = 'Please verify your phone number with OTP';
      }
      if (!formData.profilePhoto) newErrors.profilePhoto = 'Profile photo is required';
      if (!formData.emergencyContactName.trim()) {
        newErrors.emergencyContactName = 'Emergency contact name is required';
      }
      if (!formData.emergencyContactPhone.match(/^(\+62|62|0)[0-9]{9,12}$/)) {
        newErrors.emergencyContactPhone = 'Valid emergency contact phone required';
      }
      if (!formData.emergencyContactRelation.trim()) {
        newErrors.emergencyContactRelation = 'Relationship to emergency contact required';
      }
    }

    if (step === 2) {
      if (!formData.ktpNumber.match(/^[0-9]{16}$/)) {
        newErrors.ktpNumber = 'KTP must be 16 digits';
      }
      if (!formData.ktpImage) newErrors.ktpImage = 'KTP photo is required';
    }

    if (step === 3) {
      if (!formData.bankName) newErrors.bankName = 'Bank name is required';
      if (!formData.accountNumber) newErrors.accountNumber = 'Account number is required';
      if (!formData.accountHolderName.trim()) {
        newErrors.accountHolderName = 'Account holder name is required';
      }
      if (formData.accountHolderName.toLowerCase() !== formData.fullName.toLowerCase()) {
        newErrors.accountHolderName = 'Account holder name must match your full name';
      }
    }

    if (step === 4) {
      if (!formData.licenseNumber) newErrors.licenseNumber = 'License number is required';
      if (!formData.licenseType) newErrors.licenseType = 'License type is required';
      if (!formData.licenseExpiry) newErrors.licenseExpiry = 'License expiry date is required';
      if (!formData.licenseImage) newErrors.licenseImage = 'License photo is required';
      
      const expiryDate = new Date(formData.licenseExpiry);
      if (expiryDate < new Date()) {
        newErrors.licenseExpiry = 'License has expired';
      }
    }

    if (step === 5) {
      if (!formData.vehiclePlateNumber) newErrors.vehiclePlateNumber = 'Plate number is required';
      if (!formData.vehicleBrand) newErrors.vehicleBrand = 'Vehicle brand is required';
      if (!formData.vehicleModel) newErrors.vehicleModel = 'Vehicle model is required';
      if (!formData.vehicleYear.match(/^[0-9]{4}$/)) {
        newErrors.vehicleYear = 'Valid year required (e.g., 2020)';
      }
      if (!formData.vehicleColor) newErrors.vehicleColor = 'Vehicle color is required';
      if (!formData.stnkImage) newErrors.stnkImage = 'STNK photo is required';
    }

    if (step === 6) {
      // Vehicle condition checklist validation
      if (!formData.vehicleHasValidInsurance) {
        newErrors.vehicleHasValidInsurance = 'Vehicle insurance is mandatory';
      }
      if (!formData.vehicleInGoodCondition) {
        newErrors.vehicleInGoodCondition = 'Vehicle must be in good condition';
      }
      if (!formData.vehicleHasWorkingLights) {
        newErrors.vehicleHasWorkingLights = 'Working lights are required for safety';
      }
      if (!formData.vehicleHasSafetyEquipment) {
        newErrors.vehicleHasSafetyEquipment = 'Safety equipment is mandatory';
      }
    }

    if (step === 7) {
      if (!formData.agreedToBackgroundCheck) {
        newErrors.agreedToBackgroundCheck = 'Background check consent is required';
      }
      if (!formData.agreedToTerms) {
        newErrors.agreedToTerms = 'You must accept the Terms of Service';
      }
      if (!formData.agreedToLiability) {
        newErrors.agreedToLiability = 'You must acknowledge liability agreement';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 7) {
        setCurrentStep(currentStep + 1);
      } else {
        onSubmit(formData);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3, 4, 5, 6, 7].map((step) => (
        <div
          key={step}
          className={`h-2 rounded-full transition-all ${
            step === currentStep
              ? 'w-12 bg-orange-500'
              : step < currentStep
              ? 'w-8 bg-green-500'
              : 'w-8 bg-gray-700'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6 overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Driver Registration</h1>
          <p className="text-gray-400">Registering as: <span className="text-orange-400 font-bold">{selectedVehicle}</span></p>
        </div>

        {renderStepIndicator()}

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 shadow-2xl">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">📝 Personal Information</h2>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Full Name (as on KTP) *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter your full legal name"
                />
                {errors.fullName && <p className="text-red-400 text-sm mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Date of Birth *</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => {
                    const dob = e.target.value;
                    const age = calculateAge(dob);
                    setFormData({ ...formData, dateOfBirth: dob, age });
                  }}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                {formData.age > 0 && (
                  <p className={`text-sm mt-1 ${formData.age >= 18 && formData.age <= 65 ? 'text-green-400' : 'text-red-400'}`}>
                    Age: {formData.age} years {formData.age >= 18 && formData.age <= 65 ? '✓' : '(Must be 18-65)'}
                  </p>
                )}
                {errors.dateOfBirth && <p className="text-red-400 text-sm mt-1">{errors.dateOfBirth}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Complete Address *</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Street address, RT/RW, Kelurahan, Kecamatan, City, Postal Code"
                />
                {errors.address && <p className="text-red-400 text-sm mt-1">{errors.address}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">WhatsApp Number *</label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={formData.whatsAppNumber}
                    onChange={(e) => setFormData({ ...formData, whatsAppNumber: e.target.value })}
                    disabled={formData.phoneVerified}
                    className="flex-1 p-4 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
                    placeholder="+62812345678 or 08123456789"
                  />
                  {!formData.phoneVerified && (
                    <button
                      onClick={handleSendOtp}
                      className="px-6 py-4 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition"
                    >
                      {otpSent ? 'Resend OTP' : 'Send OTP'}
                    </button>
                  )}
                  {formData.phoneVerified && (
                    <div className="px-6 py-4 bg-green-500/20 border border-green-500 rounded-xl text-green-400 font-semibold flex items-center gap-2">
                      ✓ Verified
                    </div>
                  )}
                </div>
                {errors.whatsAppNumber && <p className="text-red-400 text-sm mt-1">{errors.whatsAppNumber}</p>}
              </div>

              {otpSent && !formData.phoneVerified && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <label className="block text-sm font-semibold text-blue-400 mb-2">Enter OTP Code *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      className="flex-1 p-4 bg-gray-900 border border-gray-700 rounded-xl text-white font-mono text-xl text-center focus:ring-2 focus:ring-blue-500"
                      placeholder="000000"
                    />
                    <button
                      onClick={handleVerifyOtp}
                      className="px-6 py-4 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition"
                    >
                      Verify
                    </button>
                  </div>
                  {errors.phoneVerified && <p className="text-red-400 text-sm mt-1">{errors.phoneVerified}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Upload Profile Photo (Selfie) *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('profilePhoto', e.target.files?.[0] || null)}
                  className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-orange-500"
                />
                {formData.profilePhoto && (
                  <p className="text-green-400 text-sm mt-2">✓ {formData.profilePhoto.name}</p>
                )}
                {errors.profilePhoto && <p className="text-red-400 text-sm mt-1">{errors.profilePhoto}</p>}
                <p className="text-gray-500 text-xs mt-2">Clear selfie photo for your driver profile</p>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                <h3 className="text-orange-400 font-bold mb-3">👤 Emergency Contact</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Emergency Contact Name *</label>
                    <input
                      type="text"
                      value={formData.emergencyContactName}
                      onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                      className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-orange-500"
                      placeholder="Full name"
                    />
                    {errors.emergencyContactName && <p className="text-red-400 text-sm mt-1">{errors.emergencyContactName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Relationship *</label>
                    <select
                      value={formData.emergencyContactRelation}
                      onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                      className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select relationship</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Parent">Parent</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Child">Child</option>
                      <option value="Friend">Friend</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.emergencyContactRelation && <p className="text-red-400 text-sm mt-1">{errors.emergencyContactRelation}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Emergency Contact Phone *</label>
                    <input
                      type="tel"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                      className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-orange-500"
                      placeholder="+62812345678"
                    />
                    {errors.emergencyContactPhone && <p className="text-red-400 text-sm mt-1">{errors.emergencyContactPhone}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: KTP (ID Card) */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">🪪 KTP (Identity Card)</h2>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">KTP Number (NIK) *</label>
                <input
                  type="text"
                  value={formData.ktpNumber}
                  onChange={(e) => setFormData({ ...formData, ktpNumber: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                  className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl text-white font-mono text-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="16-digit NIK number"
                  maxLength={16}
                />
                {errors.ktpNumber && <p className="text-red-400 text-sm mt-1">{errors.ktpNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Upload KTP Photo *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('ktpImage', e.target.files?.[0] || null)}
                  className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-orange-500"
                />
                {formData.ktpImage && (
                  <p className="text-green-400 text-sm mt-2">✓ {formData.ktpImage.name}</p>
                )}
                {errors.ktpImage && <p className="text-red-400 text-sm mt-1">{errors.ktpImage}</p>}
                <p className="text-gray-500 text-xs mt-2">Clear photo, max 5MB. Ensure all details are readable.</p>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <p className="text-yellow-400 text-sm">
                  ⚠️ Your KTP will be verified. Bank account and all documents must match this KTP name.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">NPWP (Tax ID) - Optional</label>
                <input
                  type="text"
                  value={formData.npwpNumber || ''}
                  onChange={(e) => setFormData({ ...formData, npwpNumber: e.target.value.replace(/\D/g, '').slice(0, 15) })}
                  className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-orange-500"
                  placeholder="15-digit NPWP (optional)"
                  maxLength={15}
                />
                <p className="text-gray-500 text-xs mt-2">
                  Required if your monthly earnings exceed tax threshold. Can be added later.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Bank Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">🏦 Bank Account Details</h2>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Bank Name *</label>
                <select
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select Bank</option>
                  <option value="BCA">BCA</option>
                  <option value="Mandiri">Mandiri</option>
                  <option value="BNI">BNI</option>
                  <option value="BRI">BRI</option>
                  <option value="CIMB Niaga">CIMB Niaga</option>
                  <option value="Permata">Permata Bank</option>
                  <option value="Danamon">Danamon</option>
                  <option value="BTN">BTN</option>
                  <option value="Mega">Bank Mega</option>
                  <option value="Other">Other</option>
                </select>
                {errors.bankName && <p className="text-red-400 text-sm mt-1">{errors.bankName}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Account Number *</label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, '') })}
                  className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl text-white font-mono text-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Account number"
                />
                {errors.accountNumber && <p className="text-red-400 text-sm mt-1">{errors.accountNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Account Holder Name *</label>
                <input
                  type="text"
                  value={formData.accountHolderName}
                  onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                  className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-orange-500"
                  placeholder="Must match your KTP name exactly"
                />
                {errors.accountHolderName && <p className="text-red-400 text-sm mt-1">{errors.accountHolderName}</p>}
              </div>

              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <p className="text-red-400 text-sm font-semibold mb-2">⚠️ CRITICAL: Account Verification</p>
                <p className="text-gray-300 text-sm">
                  Account holder name MUST match your KTP exactly. Mismatched accounts will be rejected and may result in account suspension.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Driver License (SIM) */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">🪪 Driver License (SIM)</h2>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
                <p className="text-blue-400 text-sm">
                  📋 Required for {selectedVehicle}: <span className="font-bold">{requiredLicenseType[selectedVehicle]}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">License Type *</label>
                <select
                  value={formData.licenseType}
                  onChange={(e) => setFormData({ ...formData, licenseType: e.target.value })}
                  className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select License Type</option>
                  <option value="SIM A">SIM A (Car, Tuktuk)</option>
                  <option value="SIM B1">SIM B1 (Truck up to 3,500 kg)</option>
                  <option value="SIM B2">SIM B2 (Heavy vehicles, trailer)</option>
                  <option value="SIM C">SIM C (Motorcycle)</option>
                </select>
                {errors.licenseType && <p className="text-red-400 text-sm mt-1">{errors.licenseType}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">License Number *</label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value.toUpperCase() })}
                  className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-orange-500"
                  placeholder="License number"
                />
                {errors.licenseNumber && <p className="text-red-400 text-sm mt-1">{errors.licenseNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Expiry Date *</label>
                <input
                  type="date"
                  value={formData.licenseExpiry}
                  onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
                  className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-orange-500"
                />
                {errors.licenseExpiry && <p className="text-red-400 text-sm mt-1">{errors.licenseExpiry}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Upload License Photo *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('licenseImage', e.target.files?.[0] || null)}
                  className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-orange-500"
                />
                {formData.licenseImage && (
                  <p className="text-green-400 text-sm mt-2">✓ {formData.licenseImage.name}</p>
                )}
                {errors.licenseImage && <p className="text-red-400 text-sm mt-1">{errors.licenseImage}</p>}
              </div>
            </div>
          )}

          {/* Step 5: Vehicle Registration (STNK) */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">🚗 Vehicle Registration (STNK)</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Plate Number *</label>
                  <input
                    type="text"
                    value={formData.vehiclePlateNumber}
                    onChange={(e) => setFormData({ ...formData, vehiclePlateNumber: e.target.value.toUpperCase() })}
                    className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-orange-500"
                    placeholder="B 1234 ABC"
                  />
                  {errors.vehiclePlateNumber && <p className="text-red-400 text-sm mt-1">{errors.vehiclePlateNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Vehicle Brand *</label>
                  <input
                    type="text"
                    value={formData.vehicleBrand}
                    onChange={(e) => setFormData({ ...formData, vehicleBrand: e.target.value })}
                    className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., Honda, Toyota, Yamaha"
                  />
                  {errors.vehicleBrand && <p className="text-red-400 text-sm mt-1">{errors.vehicleBrand}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Model *</label>
                  <input
                    type="text"
                    value={formData.vehicleModel}
                    onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                    className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., Vario, Avanza"
                  />
                  {errors.vehicleModel && <p className="text-red-400 text-sm mt-1">{errors.vehicleModel}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Year *</label>
                  <input
                    type="text"
                    value={formData.vehicleYear}
                    onChange={(e) => setFormData({ ...formData, vehicleYear: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-orange-500"
                    placeholder="2020"
                    maxLength={4}
                  />
                  {errors.vehicleYear && <p className="text-red-400 text-sm mt-1">{errors.vehicleYear}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Color *</label>
                  <input
                    type="text"
                    value={formData.vehicleColor}
                    onChange={(e) => setFormData({ ...formData, vehicleColor: e.target.value })}
                    className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., Black"
                  />
                  {errors.vehicleColor && <p className="text-red-400 text-sm mt-1">{errors.vehicleColor}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Upload STNK Photo *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('stnkImage', e.target.files?.[0] || null)}
                  className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-orange-500"
                />
                {formData.stnkImage && (
                  <p className="text-green-400 text-sm mt-2">✓ {formData.stnkImage.name}</p>
                )}
                {errors.stnkImage && <p className="text-red-400 text-sm mt-1">{errors.stnkImage}</p>}
                <p className="text-gray-500 text-xs mt-2">Clear photo of your vehicle registration document</p>
              </div>
            </div>
          )}

          {/* Step 6: Vehicle Condition Checklist */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">🔧 Vehicle Safety Inspection</h2>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
                <p className="text-blue-400 text-sm">
                  ℹ️ Ensure your vehicle meets all safety requirements. These are mandatory for driver and passenger safety.
                </p>
              </div>

              <div className="space-y-4">
                <label className="flex items-start gap-4 p-4 bg-gray-900 border border-gray-700 rounded-xl cursor-pointer hover:border-orange-500 transition group">
                  <input
                    type="checkbox"
                    checked={formData.vehicleHasValidInsurance}
                    onChange={(e) => setFormData({ ...formData, vehicleHasValidInsurance: e.target.checked })}
                    className="mt-1 w-6 h-6 rounded border-gray-600 bg-gray-800 text-orange-500 focus:ring-2 focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <p className="text-white font-semibold group-hover:text-orange-400">Valid Vehicle Insurance *</p>
                    <p className="text-gray-400 text-sm mt-1">
                      My vehicle has valid insurance coverage (MANDATORY)
                    </p>
                  </div>
                  {formData.vehicleHasValidInsurance && <span className="text-2xl">✓</span>}
                </label>
                {errors.vehicleHasValidInsurance && <p className="text-red-400 text-sm ml-4">{errors.vehicleHasValidInsurance}</p>}

                <label className="flex items-start gap-4 p-4 bg-gray-900 border border-gray-700 rounded-xl cursor-pointer hover:border-orange-500 transition group">
                  <input
                    type="checkbox"
                    checked={formData.vehicleInGoodCondition}
                    onChange={(e) => setFormData({ ...formData, vehicleInGoodCondition: e.target.checked })}
                    className="mt-1 w-6 h-6 rounded border-gray-600 bg-gray-800 text-orange-500 focus:ring-2 focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <p className="text-white font-semibold group-hover:text-orange-400">Good Mechanical Condition *</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Brakes, tires, engine, and all mechanical parts are in good working condition
                    </p>
                  </div>
                  {formData.vehicleInGoodCondition && <span className="text-2xl">✓</span>}
                </label>
                {errors.vehicleInGoodCondition && <p className="text-red-400 text-sm ml-4">{errors.vehicleInGoodCondition}</p>}

                <label className="flex items-start gap-4 p-4 bg-gray-900 border border-gray-700 rounded-xl cursor-pointer hover:border-orange-500 transition group">
                  <input
                    type="checkbox"
                    checked={formData.vehicleHasWorkingLights}
                    onChange={(e) => setFormData({ ...formData, vehicleHasWorkingLights: e.target.checked })}
                    className="mt-1 w-6 h-6 rounded border-gray-600 bg-gray-800 text-orange-500 focus:ring-2 focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <p className="text-white font-semibold group-hover:text-orange-400">Working Lights & Signals *</p>
                    <p className="text-gray-400 text-sm mt-1">
                      All headlights, taillights, brake lights, and turn signals are functional
                    </p>
                  </div>
                  {formData.vehicleHasWorkingLights && <span className="text-2xl">✓</span>}
                </label>
                {errors.vehicleHasWorkingLights && <p className="text-red-400 text-sm ml-4">{errors.vehicleHasWorkingLights}</p>}

                <label className="flex items-start gap-4 p-4 bg-gray-900 border border-gray-700 rounded-xl cursor-pointer hover:border-orange-500 transition group">
                  <input
                    type="checkbox"
                    checked={formData.vehicleHasSafetyEquipment}
                    onChange={(e) => setFormData({ ...formData, vehicleHasSafetyEquipment: e.target.checked })}
                    className="mt-1 w-6 h-6 rounded border-gray-600 bg-gray-800 text-orange-500 focus:ring-2 focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <p className="text-white font-semibold group-hover:text-orange-400">Safety Equipment *</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Helmet (for bikes), seatbelts (for cars), first aid kit, fire extinguisher (for lorries)
                    </p>
                  </div>
                  {formData.vehicleHasSafetyEquipment && <span className="text-2xl">✓</span>}
                </label>
                {errors.vehicleHasSafetyEquipment && <p className="text-red-400 text-sm ml-4">{errors.vehicleHasSafetyEquipment}</p>}
              </div>

              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mt-6">
                <p className="text-red-400 font-semibold mb-2">⚠️ Safety Declaration</p>
                <p className="text-gray-300 text-sm">
                  By checking these boxes, you confirm that your vehicle meets all safety requirements. IndaStreet may conduct random vehicle inspections. False declarations may result in immediate account suspension.
                </p>
              </div>
            </div>
          )}

          {/* Step 7: Terms of Service & Liability */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">📜 Terms of Service & Liability</h2>

              <div className="bg-gray-900 border border-orange-500 rounded-xl p-6 max-h-96 overflow-y-auto">
                <h3 className="text-orange-400 font-bold text-lg mb-4">IndaStreet Driver Agreement</h3>
                
                <div className="text-gray-300 text-sm space-y-4">
                  <section>
                    <h4 className="text-white font-bold mb-2">1. INDEPENDENT CONTRACTOR STATUS</h4>
                    <p>You acknowledge and agree that you are registering as an INDEPENDENT CONTRACTOR and NOT an employee of IndaStreet. You are solely responsible for your own business operations, taxes, insurance, and compliance with all applicable laws.</p>
                  </section>

                  <section>
                    <h4 className="text-white font-bold mb-2">2. DIRECTORY SERVICE ONLY</h4>
                    <p>IndaStreet provides a directory platform that connects independent drivers with customers. IndaStreet does NOT provide transportation or delivery services. You are hiring space in our digital directory for customer traffic and visibility.</p>
                  </section>

                  <section>
                    <h4 className="text-white font-bold mb-2">3. COMPLETE DRIVER LIABILITY</h4>
                    <p className="font-bold text-yellow-400">You accept 100% LIABILITY and RESPONSIBILITY for:</p>
                    <ul className="list-disc ml-6 mt-2 space-y-1">
                      <li>All accidents, injuries, or damages during service</li>
                      <li>Vehicle insurance, maintenance, and safety compliance</li>
                      <li>All government taxes, licenses, and permits</li>
                      <li>Compliance with Indonesian traffic laws and regulations</li>
                      <li>Proper licensing (SIM) and vehicle registration (STNK)</li>
                      <li>Customer disputes and service quality</li>
                      <li>Financial obligations and debt collection</li>
                      <li>Employee or helper management (if applicable)</li>
                    </ul>
                  </section>

                  <section>
                    <h4 className="text-white font-bold mb-2">4. INDASTREET NON-INVOLVEMENT</h4>
                    <p className="font-bold text-red-400">IndaStreet will NOT get involved in:</p>
                    <ul className="list-disc ml-6 mt-2 space-y-1">
                      <li>Legal disputes between drivers and customers</li>
                      <li>Accident liability or insurance claims</li>
                      <li>Payment disputes or debt recovery</li>
                      <li>Government investigations or penalties</li>
                      <li>Tax audits or financial obligations</li>
                      <li>License or registration violations</li>
                    </ul>
                    <p className="mt-2">EXCEPT where required by law to comply with legal obligations, court orders, or government authorities.</p>
                  </section>

                  <section>
                    <h4 className="text-white font-bold mb-2">5. INSURANCE REQUIREMENTS</h4>
                    <p>You MUST maintain valid vehicle insurance at all times. IndaStreet does not provide insurance coverage for drivers, vehicles, passengers, or cargo.</p>
                  </section>

                  <section>
                    <h4 className="text-white font-bold mb-2">6. TAX OBLIGATIONS</h4>
                    <p>You are solely responsible for all tax filings, payments, and compliance with Indonesian tax law (NPWP registration, income tax, VAT if applicable). IndaStreet will not withhold or pay taxes on your behalf.</p>
                  </section>

                  <section>
                    <h4 className="text-white font-bold mb-2">7. PLATFORM FEES</h4>
                    <p>IndaStreet charges a platform service fee for directory listing and customer connection. This fee is clearly disclosed and automatically deducted from transactions processed through the platform.</p>
                  </section>

                  <section>
                    <h4 className="text-white font-bold mb-2">8. ACCOUNT SUSPENSION/TERMINATION</h4>
                    <p>IndaStreet reserves the right to suspend or terminate your account for violations of these terms, fraudulent activity, or consistent poor service ratings.</p>
                  </section>

                  <section>
                    <h4 className="text-white font-bold mb-2">9. INDEMNIFICATION</h4>
                    <p className="font-bold text-orange-400">You agree to INDEMNIFY and HOLD HARMLESS IndaStreet from any claims, damages, losses, or expenses arising from your use of the platform or provision of services.</p>
                  </section>

                  <section>
                    <h4 className="text-white font-bold mb-2">10. GOVERNING LAW</h4>
                    <p>This agreement is governed by the laws of the Republic of Indonesia. Any disputes shall be resolved in Indonesian courts.</p>
                  </section>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.agreedToBackgroundCheck}
                    onChange={(e) => setFormData({ ...formData, agreedToBackgroundCheck: e.target.checked })}
                    className="mt-1 w-5 h-5 rounded border-gray-600 bg-gray-900 text-orange-500 focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="text-gray-300 text-sm group-hover:text-white">
                    I consent to a <span className="text-blue-400 font-bold">CRIMINAL BACKGROUND CHECK</span> and verification of my documents. I understand that false information will result in immediate account termination.
                  </span>
                </label>
                {errors.agreedToBackgroundCheck && <p className="text-red-400 text-sm ml-8">{errors.agreedToBackgroundCheck}</p>}

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.agreedToTerms}
                    onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                    className="mt-1 w-5 h-5 rounded border-gray-600 bg-gray-900 text-orange-500 focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="text-gray-300 text-sm group-hover:text-white">
                    I have read, understood, and agree to the <span className="text-orange-400 font-bold">Terms of Service</span> above.
                  </span>
                </label>
                {errors.agreedToTerms && <p className="text-red-400 text-sm ml-8">{errors.agreedToTerms}</p>}

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.agreedToLiability}
                    onChange={(e) => setFormData({ ...formData, agreedToLiability: e.target.checked })}
                    className="mt-1 w-5 h-5 rounded border-gray-600 bg-gray-900 text-orange-500 focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="text-gray-300 text-sm group-hover:text-white">
                    I acknowledge that I am an <span className="text-yellow-400 font-bold">INDEPENDENT CONTRACTOR</span> and accept <span className="text-red-400 font-bold">100% LIABILITY</span> for all my business activities, taxes, insurance, and legal compliance. IndaStreet is NOT responsible for any incidents, accidents, or legal issues arising from my services.
                  </span>
                </label>
                {errors.agreedToLiability && <p className="text-red-400 text-sm ml-8">{errors.agreedToLiability}</p>}
              </div>

              <button
                onClick={() => setShowTerms(true)}
                className="w-full py-3 bg-blue-500/20 border border-blue-500 rounded-xl text-blue-400 font-semibold hover:bg-blue-500/30 transition"
              >
                📄 View Full Terms of Service in New Window
              </button>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={handlePrevious}
              className="flex-1 py-4 bg-gray-700 text-white font-bold rounded-xl hover:bg-gray-600 transition"
            >
              ← {currentStep === 1 ? 'Back to Vehicle Selection' : 'Previous'}
            </button>
            <button
              onClick={handleNext}
              className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl hover:shadow-lg transition"
            >
              {currentStep === 7 ? 'Submit Registration ✓' : 'Next →'}
            </button>
          </div>

          <p className="text-center text-gray-500 text-xs mt-4">
            Step {currentStep} of 7
          </p>
        </div>
      </div>
    </div>
  );
};
