# IndaStreet Transport App

Complete transport and delivery service platform built with React, TypeScript, and Appwrite.

## 🚀 Features

### Ride Services
- 🏍️ **Bike Rides** - Fast motorcycle taxi service
- 🚗 **Car Rides** - Comfortable car taxi service  
- 🛺 **Tuktuk Rides** - Traditional 3-wheel transport
- 🛵 **Bajaj Rides** - Motor rickshaw service

### Delivery Services
- 📦 **Parcel Delivery** - Send packages across the city
  - Bike delivery (up to 10kg)
  - Car delivery (up to 50kg)
  - Tuktuk delivery (up to 30kg)
  - Box Lorry (up to 1000kg)
  - Flatbed Lorry (up to 2000kg)

### Key Features
- ✅ Real-time booking system
- ✅ Live driver tracking
- ✅ Multiple payment methods (Cash, Bank Transfer)
- ✅ Booking history
- ✅ Driver ratings & reviews
- ✅ Fare estimation
- ✅ WhatsApp integration
- ✅ Responsive design

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Appwrite (Sydney Region)
- **Build Tool**: Vite
- **Maps**: Google Maps API

## 📁 Project Structure

```
TransportApp/
├── components/
│   ├── common/          # Reusable UI components
│   │   ├── Header.tsx
│   │   └── LoadingSpinner.tsx
│   ├── pages/           # Main application pages
│   │   ├── Home.tsx              # Service selection
│   │   ├── RideBooking.tsx       # Book rides
│   │   ├── ParcelBooking.tsx     # Book deliveries
│   │   ├── Tracking.tsx          # Live tracking
│   │   ├── History.tsx           # Booking history
│   │   └── Profile.tsx           # User profile
│   └── transport/       # Transport-specific components
├── context/             # React Context providers
│   ├── NavigationContext.tsx
│   └── BookingContext.tsx
├── hooks/              # Custom React hooks
│   ├── useNavigationContext.ts
│   └── useBookingContext.ts
├── lib/                # External integrations
│   └── appwrite.ts
├── App.tsx             # Main app component
├── index.tsx           # Entry point
└── types.ts            # TypeScript definitions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Navigate to TransportApp folder**
   ```bash
   cd TransportApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create `.env.local` file (already exists):
   ```env
   VITE_APPWRITE_ENDPOINT=https://syd.cloud.appwrite.io/v1
   VITE_APPWRITE_PROJECT_ID=68f1443a003b619f5e25
   VITE_APPWRITE_DATABASE_ID=692ad9370034856d716e
   VITE_APPWRITE_STORAGE_BUCKET_ID=692af3f00015cc5be040
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   App will open at `http://localhost:5174`

### Opening from Foodapp

The Transport App can be opened directly from the main Foodapp:
- **Car-Bike button** → Opens ride services
- **Parcel button** → Opens parcel delivery services (with URL param)

## 📱 Usage Flow

### Booking a Ride
1. Select vehicle type (Bike, Car, Tuktuk, or Bajaj)
2. Enter pickup and dropoff locations
3. Fill in your details
4. Choose payment method
5. Confirm booking
6. Track driver in real-time

### Sending a Parcel
1. Select delivery vehicle (Bike to Flatbed Lorry)
2. Enter sender and receiver details
3. Describe parcel (description, weight, size)
4. Choose payment method
5. Confirm booking
6. Track delivery progress

## 🎨 UI Design

- **Dark theme** with orange accents matching Foodapp
- **Gradient cards** for different vehicle types
- **Responsive layout** works on mobile and desktop
- **Smooth animations** for page transitions
- **Real-time updates** for booking status

## 🔗 Integration with Foodapp

The Transport App shares the same Appwrite backend as the main Foodapp:
- Same project ID and database
- Shared authentication (future)
- Consistent branding and design
- Cross-app navigation via URL parameters

## 📊 Booking Flow States

1. **SEARCHING** - Looking for available drivers
2. **DRIVER_ASSIGNED** - Driver accepted the booking
3. **DRIVER_ARRIVING** - Driver heading to pickup
4. **ARRIVED** - Driver at pickup location
5. **PICKED_UP** - Passenger/parcel picked up
6. **IN_TRANSIT** - On the way to destination
7. **DELIVERED** - Trip/delivery completed
8. **COMPLETED** - Booking finalized

## 🔮 Future Enhancements

- [ ] Real driver dispatch system
- [ ] Google Maps integration for live tracking
- [ ] Push notifications
- [ ] User authentication with Appwrite
- [ ] Payment gateway integration
- [ ] Driver rating system
- [ ] Saved addresses
- [ ] Ride scheduling
- [ ] Promo codes & discounts
- [ ] Multi-language support

## 🤝 Contributing

This is part of the IndaStreet platform ecosystem:
- **Foodapp** - Main food ordering application (port 5173)
- **TransportApp** - Transport & delivery services (port 5174)
- **DriverApp** - Driver dashboard (future)

## 📄 License

Part of the IndaStreet platform - All rights reserved.

## 🆘 Support

For issues or questions:
- Check booking history in Profile
- Contact support via Help & Support in app
- WhatsApp integration for driver communication

---

**Built with ❤️ for Indonesian street food and transport culture**
