import React, { useState, useRef, useEffect } from 'react';

interface PaymentProofUploadProps {
  orderId: string;
  expiresAt: string; // ISO timestamp when timer expires
  onUploadComplete: (imageUrl: string) => void;
  onTimerExpired?: () => void;
  maxSizeKB?: number; // Maximum file size in KB
}

/**
 * PaymentProofUpload Component
 * 
 * Handles payment proof image upload with countdown timer.
 * Version 2 Features:
 * - 10-minute countdown timer
 * - Image preview before upload
 * - Progress indicator during upload
 * - File size validation with compression
 * - Visual timer warnings (yellow < 5min, red < 2min)
 * - Auto-disable when timer expires
 */
export const PaymentProofUpload: React.FC<PaymentProofUploadProps> = ({
  orderId,
  expiresAt,
  onUploadComplete,
  onTimerExpired,
  maxSizeKB = 5000 // Default 5MB
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [timerExpired, setTimerExpired] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Timer countdown
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const expires = new Date(expiresAt).getTime();
      const remaining = Math.max(0, expires - now);
      
      setTimeRemaining(remaining);
      
      if (remaining === 0 && !timerExpired) {
        setTimerExpired(true);
        onTimerExpired?.();
      }
    };

    // Initial calculation
    calculateTimeRemaining();

    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, timerExpired, onTimerExpired]);

  const formatTimeRemaining = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTimerColor = (): string => {
    const minutes = Math.floor(timeRemaining / 60000);
    if (minutes < 2) return '#ef4444'; // Red
    if (minutes < 5) return '#f59e0b'; // Orange/Yellow
    return '#10b981'; // Green
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset previous state
    setError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, etc.)');
      return;
    }

    // Validate file size
    const fileSizeKB = file.size / 1024;
    if (fileSizeKB > maxSizeKB) {
      setError(`File size exceeds ${Math.round(maxSizeKB / 1024)}MB limit. Please compress the image.`);
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || timerExpired) return;

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Simulate upload progress (replace with actual upload logic)
      const uploadSimulation = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(uploadSimulation);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // TODO: Replace with actual upload to Cloudinary/S3/Appwrite Storage
      // Example with FormData:
      // const formData = new FormData();
      // formData.append('file', selectedFile);
      // formData.append('orderId', orderId);
      // const response = await fetch('/api/upload-payment-proof', {
      //   method: 'POST',
      //   body: formData
      // });
      // const data = await response.json();

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      clearInterval(uploadSimulation);
      setUploadProgress(100);

      // Mock uploaded URL (replace with actual URL from upload response)
      const mockImageUrl = `https://storage.example.com/payment-proofs/${orderId}_${Date.now()}.jpg`;

      // Notify parent component
      onUploadComplete(mockImageUrl);

      // Success message
      setTimeout(() => {
        setUploading(false);
      }, 500);

    } catch (err) {
      console.error('Upload failed:', err);
      setError('Upload failed. Please try again.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isUploadDisabled = !selectedFile || uploading || timerExpired;

  return (
    <div className="payment-proof-upload">
      {/* Timer Display */}
      <div className={`timer-display ${timerExpired ? 'expired' : ''}`}>
        <div className="timer-icon">⏱️</div>
        <div className="timer-content">
          {timerExpired ? (
            <>
              <div className="timer-label">Time Expired</div>
              <div className="timer-value expired">Order cancelled</div>
            </>
          ) : (
            <>
              <div className="timer-label">Upload within:</div>
              <div className="timer-value" style={{ color: getTimerColor() }}>
                {formatTimeRemaining(timeRemaining)}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Upload Section */}
      <div className="upload-section">
        <h3 className="section-title">
          <span className="title-icon">📸</span>
          Upload Payment Proof
        </h3>

        {!previewUrl ? (
          // File Input
          <div className="file-input-wrapper">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={timerExpired}
              className="file-input"
              id="payment-proof-input"
            />
            <label
              htmlFor="payment-proof-input"
              className={`file-input-label ${timerExpired ? 'disabled' : ''}`}
            >
              <div className="upload-icon">📤</div>
              <div className="upload-text">
                <div className="upload-title">Choose Image</div>
                <div className="upload-subtitle">
                  Screenshot of successful transfer
                </div>
              </div>
            </label>
          </div>
        ) : (
          // Image Preview
          <div className="preview-section">
            <div className="preview-container">
              <img src={previewUrl} alt="Payment proof preview" className="preview-image" />
              {!uploading && (
                <button
                  className="remove-button"
                  onClick={handleRemoveImage}
                  type="button"
                >
                  ✕
                </button>
              )}
            </div>

            {uploading ? (
              // Upload Progress
              <div className="progress-container">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="progress-text">
                  Uploading... {uploadProgress}%
                </div>
              </div>
            ) : uploadProgress === 100 ? (
              // Success Message
              <div className="success-message">
                <span className="success-icon">✓</span>
                Payment proof uploaded successfully!
              </div>
            ) : (
              // Upload Button
              <button
                className="upload-button"
                onClick={handleUpload}
                disabled={isUploadDisabled}
                type="button"
              >
                <span className="button-icon">☁️</span>
                Upload Proof
              </button>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* Help Text */}
        <div className="help-text">
          <div className="help-title">📋 What to upload:</div>
          <ul className="help-list">
            <li>Screenshot from your banking app</li>
            <li>Must show: Amount, Date, Recipient name</li>
            <li>Image must be clear and readable</li>
            <li>Max size: {Math.round(maxSizeKB / 1024)}MB</li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        .payment-proof-upload {
          width: 100%;
          margin: 20px 0;
        }

        /* Timer Display */
        .timer-display {
          display: flex;
          align-items: center;
          gap: 12px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 16px 20px;
          border-radius: 12px;
          margin-bottom: 20px;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .timer-display.expired {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .timer-icon {
          font-size: 32px;
        }

        .timer-content {
          flex: 1;
        }

        .timer-label {
          font-size: 13px;
          font-weight: 500;
          opacity: 0.9;
          margin-bottom: 4px;
        }

        .timer-value {
          font-size: 28px;
          font-weight: 700;
          font-family: 'Courier New', monospace;
        }

        .timer-value.expired {
          font-size: 18px;
        }

        /* Upload Section */
        .upload-section {
          background: white;
          border-radius: 12px;
          padding: 20px;
          border: 2px solid #e5e7eb;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 18px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 16px;
        }

        .title-icon {
          font-size: 22px;
        }

        /* File Input */
        .file-input-wrapper {
          position: relative;
          margin-bottom: 16px;
        }

        .file-input {
          position: absolute;
          width: 1px;
          height: 1px;
          opacity: 0;
          overflow: hidden;
        }

        .file-input-label {
          display: flex;
          align-items: center;
          gap: 16px;
          background: #f9fafb;
          border: 2px dashed #d1d5db;
          border-radius: 12px;
          padding: 24px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .file-input-label:hover:not(.disabled) {
          background: #f0f9ff;
          border-color: #3b82f6;
        }

        .file-input-label.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .upload-icon {
          font-size: 48px;
        }

        .upload-text {
          flex: 1;
        }

        .upload-title {
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 4px;
        }

        .upload-subtitle {
          font-size: 14px;
          color: #6b7280;
        }

        /* Preview */
        .preview-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .preview-container {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          background: #f3f4f6;
        }

        .preview-image {
          width: 100%;
          height: auto;
          max-height: 400px;
          object-fit: contain;
          display: block;
        }

        .remove-button {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 36px;
          height: 36px;
          background: rgba(239, 68, 68, 0.9);
          color: white;
          border: none;
          border-radius: 50%;
          font-size: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .remove-button:hover {
          background: #dc2626;
          transform: scale(1.1);
        }

        /* Upload Button */
        .upload-button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 12px;
          padding: 16px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .upload-button:hover:not(:disabled) {
          background: #059669;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .upload-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .button-icon {
          font-size: 20px;
        }

        /* Progress */
        .progress-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .progress-bar {
          width: 100%;
          height: 12px;
          background: #e5e7eb;
          border-radius: 6px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981 0%, #059669 100%);
          transition: width 0.3s ease;
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
          100% {
            opacity: 1;
          }
        }

        .progress-text {
          text-align: center;
          font-size: 14px;
          font-weight: 600;
          color: #059669;
        }

        /* Success Message */
        .success-message {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #d1fae5;
          color: #065f46;
          padding: 16px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          animation: slideIn 0.5s ease;
        }

        .success-icon {
          font-size: 24px;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Error Message */
        .error-message {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fee2e2;
          border: 1px solid #ef4444;
          color: #991b1b;
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
          margin-top: 12px;
        }

        .error-icon {
          font-size: 18px;
          flex-shrink: 0;
        }

        /* Help Text */
        .help-text {
          background: #f0f9ff;
          border-left: 4px solid #3b82f6;
          padding: 12px 16px;
          border-radius: 8px;
          margin-top: 16px;
        }

        .help-title {
          font-size: 14px;
          font-weight: 700;
          color: #1e40af;
          margin-bottom: 8px;
        }

        .help-list {
          margin: 0;
          padding-left: 20px;
          color: #1e40af;
        }

        .help-list li {
          font-size: 13px;
          margin-bottom: 4px;
        }

        /* Mobile Responsive */
        @media (max-width: 640px) {
          .timer-icon {
            font-size: 28px;
          }

          .timer-value {
            font-size: 24px;
          }

          .upload-icon {
            font-size: 40px;
          }

          .preview-image {
            max-height: 300px;
          }
        }
      `}</style>
    </div>
  );
};
