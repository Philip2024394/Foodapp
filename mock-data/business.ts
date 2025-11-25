

import { Vendor, BusinessCategory } from '../types';

export const VENDORS_DATA: Vendor[] = [
    // Food Vendors
    { 
        id: 'v1', name: 'Warung Bu Ani', type: 'food', address: 'Kuta', street: 'Jl. Legian', rating: 4.8, distance: 1.2, 
        headerImage: 'https://picsum.photos/seed/v1_header/800/200', image: 'https://picsum.photos/seed/v1/200/200', 
        bankDetails: { bankName: 'BCA', accountNumber: '111222333', accountHolder: 'Ani Lestari' }, 
        bio: "Authentic Javanese home cooking since 2005.", cuisine: "Javanese", likes: 23400, isLive: true, 
        discounts: [
            { id: 'd1', dayOfWeek: new Date().getDay(), percentage: 15, startTime: '00:00', endTime: '23:59' }
        ],
        vouchers: [
            { id: 'vch1', title: 'Nasi Goreng Deal', discountAmount: 5000, description: 'Get Rp 5.000 off our signature Nasi Goreng Special.', validCategory: 'Food' },
            { id: 'vch2', title: 'Free Iced Tea', discountAmount: 5000, description: 'Save on drinks with any meal purchase.', validCategory: 'Drink' },
            { id: 'vch3', title: 'Bakso Discount', discountAmount: 3000, description: 'Discount on any Bakso soup order.', validCategory: 'Food' }
        ]
    },
    { 
        id: 'v2', name: 'Sate Ayam Pak Budi', type: 'food', address: 'Seminyak', street: 'Jl. Kayu Aya', rating: 4.9, distance: 2.5, headerImage: 'https://picsum.photos/seed/v2_header/800/200', image: 'https://picsum.photos/seed/v2/200/200', bio: "The best charcoal-grilled satay in Seminyak!", cuisine: "Satay / Grilled", likes: 58100, isLive: true, 
        discounts: [
            { id: 'd2', dayOfWeek: 1, percentage: 10, startTime: '16:00', endTime: '18:00' } // Monday 4-6 PM
        ],
        vouchers: [
            { id: 'vch4', title: 'Family Feast', discountAmount: 15000, description: 'Rp 15.000 off any order over Rp 100.000.', validCategory: 'Food' },
            { id: 'vch5', title: 'Satay Lovers', discountAmount: 5000, description: 'Discount on Chicken Satay portions.', validCategory: 'Food' }
        ]
    },
    { id: 'v4', name: 'Gado-Gado Ibu Tini', type: 'food', address: 'Kuta', street: 'Jl. Legian', rating: 4.6, distance: 1.5, headerImage: 'https://picsum.photos/seed/v4_header/800/200', image: 'https://picsum.photos/seed/v4/200/200', bankDetails: { bankName: 'BRI', accountNumber: '999888777', accountHolder: 'Tini Rahayu' }, bio: "Fresh vegetables and the original peanut sauce recipe.", cuisine: "Vegetarian / Salad", likes: 8900, isLive: false },

    // Shop Vendors
    { id: 'v3', name: 'Toko Kelontong Jaya', type: 'shop', address: 'Denpasar', street: 'Jl. Gajah Mada', rating: 4.5, distance: 3.1, headerImage: 'https://picsum.photos/seed/v3_header/800/200', image: 'https://picsum.photos/seed/v3/200/200', bankDetails: { bankName: 'Mandiri', accountNumber: '444555666', accountHolder: 'Jaya Perkasa' } },
    
    // Massage Vendors (Jakarta)
    {
        id: 'm_jkt_1', name: 'Jakarta Mobile Spa', type: 'massage', subType: 'home_service', address: 'Jakarta Selatan', street: 'Home Service', rating: 4.9, distance: 2.5,
        headerImage: 'https://picsum.photos/seed/mjkt1_header/800/200', image: 'https://picsum.photos/seed/mjkt1_therapist/200/200', whatsapp: '6281987654321',
        bio: 'Professional home service massage for busy Jakartans. We bring the spa experience to you.',
        status: 'online', massageTypes: ['Swedish Massage', 'Aromatherapy', 'Reflexology'],
        prices: [ { duration: 60, price: 250000 }, { duration: 90, price: 350000 } ]
    },
    {
        id: 'm_jkt_2', name: 'Zen Garden Reflexology', type: 'massage', subType: 'place', address: 'Jakarta Pusat', street: 'Jl. Sudirman', rating: 4.8, distance: 5.1,
        headerImage: 'https://picsum.photos/seed/mjkt2_header/800/200', image: 'https://picsum.photos/seed/mjkt2_spa/200/200', whatsapp: '6281987654322',
        bio: 'A sanctuary of calm in the city center. Specializing in foot reflexology and full body treatments.',
        status: 'online', massageTypes: ['Foot Reflexology', 'Hot Stone', 'Traditional'],
        prices: [ { duration: 60, price: 200000 }, { duration: 90, price: 280000 } ],
        otherServices: ['Sauna', 'Steam Room'],
        openingHours: '11:00 AM - 10:00 PM',
    },
    {
        id: 'm_jkt_3', name: 'Body & Soul Spa', type: 'massage', subType: 'place', address: 'Jakarta Utara', street: 'Jl. Kelapa Gading', rating: 4.7, distance: 12.8,
        headerImage: 'https://picsum.photos/seed/mjkt3_header/800/200', image: 'https://picsum.photos/seed/mjkt3_spa/200/200', whatsapp: '6281987654323',
        bio: 'Complete wellness services from head to toe. Enjoy our modern facilities and expert therapists.',
        status: 'busy', massageTypes: ['Deep Tissue', 'Thai Massage', 'Balinese'],
        prices: [ { duration: 90, price: 400000 }, { duration: 120, price: 500000 } ],
        otherServices: ['Jacuzzi', 'Salon', 'Nail Art'],
        openingHours: '10:00 AM - 9:00 PM',
    }
];


// New Bali-specific mock data for design purposes
export const BALI_VENDORS_DATA: Vendor[] = [
    { id: 'v5', name: 'Babi Guling Pak Malen', type: 'food', address: 'Ubud', street: 'Jl. Raya Ubud', rating: 4.9, distance: 10.2, headerImage: 'https://picsum.photos/seed/v5_header/800/200', image: 'https://picsum.photos/seed/v5/200/200', bankDetails: { bankName: 'BCA', accountNumber: '555111222', accountHolder: 'Pak Malen' }, bio: "Legendary Balinese suckling pig.", cuisine: "Balinese", likes: 125000, isLive: false },
    { id: 'v6', name: 'Nook Cafe', type: 'food', address: 'Seminyak', street: 'Jl. Umalas', rating: 4.7, distance: 3.5, headerImage: 'https://picsum.photos/seed/v6_header/800/200', image: 'https://picsum.photos/seed/v6/200/200', bio: "Escape to our lush paddy field view.", cuisine: "Western / Indonesian Fusion", likes: 98600, isLive: false },
    { id: 'v7', name: 'Uluwatu Surf Shack', type: 'shop', address: 'Uluwatu', street: 'Jl. Labuansait', rating: 4.8, distance: 22.1, headerImage: 'https://picsum.photos/seed/v7_header/800/200', image: 'https://picsum.photos/seed/v7/200/200' },
    
    // Consolidated Rental Vendor
    { 
      id: 'rental_hub_bali', 
      name: 'Bali Vehicle Hub', 
      type: 'rental', 
      address: 'Canggu', 
      street: 'Jl. Batu Bolong', 
      rating: 4.8, 
      distance: 5.0, 
      headerImage: 'https://picsum.photos/seed/rental_hub_header/800/200', 
      image: 'https://picsum.photos/seed/rental_hub/200/200',
      vehicleIds: ['v_bike_1', 'v_car_1', 'v_car_sale_1', 'v_bike_2', 'v_car_2'],
      description: "Your one-stop shop for vehicle rentals in Bali. We offer a wide range of well-maintained bikes and cars for daily or weekly rental, as well as quality second-hand vehicles for sale. Delivery to your hotel or villa available.",
      website: 'https://balivehiclehub.com',
      openingHours: '8:00 AM - 8:00 PM Daily',
      socialMedia: { 
        instagram: 'https://instagram.com/balivehiclehub'
      }
    },
    { 
      id: 'rental_hub_java', 
      name: 'Java Logistics & Rentals', 
      type: 'rental', 
      address: 'Bandung', 
      street: 'Jl. Asia Afrika', 
      rating: 4.6, 
      distance: 8.2, 
      headerImage: 'https://picsum.photos/seed/v_lorry_1_header/800/200', 
      image: 'https://picsum.photos/seed/lorry_rental/200/200',
      vehicleIds: ['v_lorry_1', 'v_bus_1'],
      description: "Professional logistics and heavy vehicle rental services in Bandung. We provide reliable box and flatbed lorries for your business or moving needs. Contact us for a custom quote.",
      openingHours: 'Mon-Sat, 8:00 AM - 5:00 PM',
      socialMedia: { 
        linkedin: 'https://linkedin.com/company/javalogistics'
      }
    },


    // Business Vendors
    { 
      id: 'b1', name: 'Canggu Leather Goods', type: 'business', address: 'Canggu', street: 'Jl. Pantai Berawa', rating: 4.9, distance: 4.8, 
      headerImage: 'https://picsum.photos/seed/b1_header/800/200', 
      image: 'https://picsum.photos/seed/b1/200/200', 
      whatsapp: '6281234567890', 
      bankDetails: { bankName: 'BNI', accountNumber: '123123123', accountHolder: 'Canggu Leather' },
      logo: 'https://picsum.photos/seed/b1_logo/100/100',
      tagline: 'Handcrafted leather goods, made in Bali.',
      description: 'We create timeless leather products with a focus on quality craftsmanship and sustainable materials. Each piece is hand-stitched in our Canggu workshop. We accept custom designs.',
      category: BusinessCategory.ARTISAN,
      website: 'https://example.com',
      openingHours: '10:00 AM - 6:00 PM Daily',
      socialMedia: { 
        instagram: 'https://instagram.com/cangguleather', 
        tiktok: 'https://tiktok.com/@cangguleather'
      },
      serviceArea: 'Accepts custom designs and worldwide shipping.',
      photos: [
        { url: 'https://picsum.photos/seed/b1_photo1/600/400', name: 'Our Workshop' },
        { url: 'https://picsum.photos/seed/b1_photo2/600/400', name: 'Wallets Collection' },
        { url: 'https://picsum.photos/seed/b1_photo3/600/400', name: 'Hand-stitching process' },
        { url: 'https://picsum.photos/seed/b1_photo4/600/400', name: 'Leather Bags' },
        { url: 'https://picsum.photos/seed/b1_photo5/600/400', name: 'Custom Belts' },
        { url: 'https://picsum.photos/seed/b1_photo6/600/400', name: 'Detailed View' }
      ],
      isOfficiallyRegistered: true,
      yearsInBusiness: 7,
      exportCountries: ['USA', 'Australia', 'Germany', 'Japan', 'Singapore'],
      languagesSpoken: ['Indonesian', 'English'],
      hasShowroom: true,
    },
    { 
      id: 'b2', name: 'Apotek Sehat Farma', type: 'business', address: 'Kuta', street: 'Jl. Legian', rating: 4.7, distance: 1.3, 
      headerImage: 'https://picsum.photos/seed/b2_header/800/200', 
      image: 'https://picsum.photos/seed/b2/200/200', 
      whatsapp: '6281234567891',
      logo: 'https://picsum.photos/seed/b2_logo/100/100',
      tagline: 'Your trusted neighborhood pharmacy.',
      description: 'Providing a complete range of prescription medications, over-the-counter drugs, vitamins, and health supplements. Our certified pharmacists are ready to assist you.',
      category: BusinessCategory.HEALTH,
      license: 'Licensed by Ministry of Health No. 123/ABC/2020',
      openingHours: '8:00 AM - 10:00 PM Daily',
    },
    { 
      id: 'b3', name: 'Surga Bali Bar', type: 'business', address: 'Seminyak', street: 'Jl. Kayu Aya', rating: 4.8, distance: 2.6, 
      headerImage: 'https://picsum.photos/seed/b3_header/800/200', 
      image: 'https://picsum.photos/seed/b3/200/200', 
      whatsapp: '6281234567892',
      logo: 'https://picsum.photos/seed/b3_logo/100/100',
      tagline: 'Sunset cocktails and good vibes.',
      description: 'The best spot in Seminyak to catch the sunset. We serve a wide range of classic and signature cocktails, beers, and light bites with live DJ sets every evening.',
      category: BusinessCategory.FNB,
      socialMedia: { 
        instagram: 'https://instagram.com/surgabar',
        facebook: 'https://facebook.com/surgabar'
      },
    },
    { 
      id: 'b4', name: 'Kiloan Kilat Laundry', type: 'business', address: 'Denpasar', street: 'Jl. Teuku Umar', rating: 4.8, distance: 3.5, 
      headerImage: 'https://picsum.photos/seed/b4_header/800/200', 
      image: 'https://picsum.photos/seed/b4/200/200', 
      whatsapp: '6281234567893',
      logo: 'https://picsum.photos/seed/b4_logo/100/100',
      tagline: 'Fast, clean, and affordable laundry service.',
      description: 'We offer per-kilogram wash & fold services, as well as ironing and express options. Free pickup and delivery for orders above 5kg.',
      category: BusinessCategory.SERVICES,
      serviceArea: 'Free pickup/delivery in Denpasar area.'
    },
    { 
      id: 'b5', name: 'Jahit Halus Tailor', type: 'business', address: 'Kuta', street: 'Jl. Legian', rating: 4.9, distance: 1.8, 
      headerImage: 'https://picsum.photos/seed/b5_header/800/200', 
      image: 'https://picsum.photos/seed/b5/200/200', 
      whatsapp: '6281234567894', 
      bankDetails: { bankName: 'BCA', accountNumber: '456456456', accountHolder: 'Halus Tailor' },
      logo: 'https://picsum.photos/seed/b5_logo/100/100',
      tagline: 'Custom clothing and alterations.',
      description: 'Expert tailoring services for men and women. We specialize in custom-made batik shirts, dresses, and provide high-quality alteration services.',
      category: BusinessCategory.SERVICES,
      socialMedia: {
        linkedin: 'https://linkedin.com/company/jahit-halus'
      }
    },
    { 
      id: 'b6', name: 'Cetak Cepat Printing', type: 'business', address: 'Seminyak', street: 'Jl. Petitenget', rating: 4.6, distance: 2.9, 
      headerImage: 'https://picsum.photos/seed/b6_header/800/200', 
      image: 'https://picsum.photos/seed/b6/200/200', 
      whatsapp: '6281234567895',
      logo: 'https://picsum.photos/seed/b6_logo/100/100',
      tagline: 'Digital and offset printing services.',
      description: 'Your one-stop shop for all printing needs, including business cards, flyers, banners, and photo printing. Fast turnaround and competitive pricing.',
      category: BusinessCategory.SERVICES
    },
    { 
      id: 'b7', name: 'The Yoga Barn', type: 'business', address: 'Ubud', street: 'Jl. Hanoman', rating: 4.9, distance: 10.8, 
      headerImage: 'https://picsum.photos/seed/b7_header/800/200', 
      image: 'https://picsum.photos/seed/b7/200/200', 
      whatsapp: '6281234567887',
      logo: 'https://picsum.photos/seed/b7_logo/100/100',
      tagline: 'A spiritual oasis in the heart of Ubud.',
      description: 'The Yoga Barn is a world-renowned yoga studio and retreat center, offering over 100 classes a week in various styles. We also host workshops, teacher trainings, and have an on-site cafe and holistic healing center.',
      category: BusinessCategory.WELLNESS,
      website: 'https://theyogabarn.com',
      openingHours: '7:00 AM - 9:00 PM Daily',
      socialMedia: { instagram: 'https://instagram.com/theyogabarn' },
      photos: [
        { url: 'https://picsum.photos/seed/b7_photo1/600/400', name: 'Main Studio' },
        { url: 'https://picsum.photos/seed/b7_photo2/600/400', name: 'Garden Kafe' },
        { url: 'https://picsum.photos/seed/b7_photo3/600/400', name: 'Community Gathering' }
      ]
    },
    { 
      id: 'b8', name: 'Celuk Silver Class', type: 'business', address: 'Celuk', street: 'Jl. Raya Celuk', rating: 4.8, distance: 15.3, 
      headerImage: 'https://picsum.photos/seed/b8_header/800/200', 
      image: 'https://picsum.photos/seed/b8/200/200', 
      whatsapp: '6281234567886', 
      bankDetails: { bankName: 'BNI', accountNumber: '987654321', accountHolder: 'Celuk Silver' },
      logo: 'https://picsum.photos/seed/b8_logo/100/100',
      tagline: 'Learn the art of Balinese silversmithing.',
      description: 'Join our hands-on silver making class in the famous village of Celuk. Our experienced local artisans will guide you to create your own unique piece of silver jewelry to take home.',
      category: BusinessCategory.ARTISAN,
      website: 'https://celuksilverclass.com',
      openingHours: '9:00 AM - 5:00 PM Daily',
      serviceArea: 'Private classes and group workshops available.',
    },
    // Massage Vendors
    { 
        id: 'm1', name: 'Wayan Traditional Massage', type: 'massage', subType: 'home_service', address: 'Ubud', street: 'Home Service', rating: 4.9, distance: 3.2, 
        headerImage: 'https://picsum.photos/seed/m1_header/800/200', image: 'https://picsum.photos/seed/m1_therapist/200/200', whatsapp: '6281234567885',
        bio: 'Experienced therapist specializing in traditional Balinese massage techniques. Bringing relaxation to your doorstep.',
        status: 'online', massageTypes: ['Balinese Massage', 'Deep Tissue', 'Reflexology'],
        prices: [ { duration: 60, price: 150000 }, { duration: 90, price: 200000 }, { duration: 120, price: 250000 } ]
    },
    { 
        id: 'm2', name: 'Ketut Healing Hands', type: 'massage', subType: 'home_service', address: 'Canggu', street: 'Home Service', rating: 4.8, distance: 1.5,
        headerImage: 'https://picsum.photos/seed/m2_header/800/200', image: 'https://picsum.photos/seed/m2_therapist/200/200', whatsapp: '6281234567884',
        bio: 'Certified physiotherapist offering sports massage and injury recovery treatments at your villa or hotel.',
        status: 'busy', massageTypes: ['Sports Massage', 'Swedish', 'Lomi Lomi'],
        prices: [ { duration: 60, price: 250000 }, { duration: 90, price: 350000 }, { duration: 120, price: 450000 } ]
    },
    { 
        id: 'm3', name: 'Ubud Wellness Spa', type: 'massage', subType: 'place', address: 'Ubud', street: 'Jl. Monkey Forest', rating: 4.8, distance: 5.1,
        headerImage: 'https://picsum.photos/seed/m3_header/800/200', image: 'https://picsum.photos/seed/m3_spa/200/200', whatsapp: '6281234567883',
        bio: 'A tranquil sanctuary in the heart of Ubud. Escape the hustle and bustle and indulge in our wide range of wellness treatments.',
        status: 'online', massageTypes: ['Aromatherapy', 'Hot Stone', 'Shiatsu', 'Thai Massage'],
        prices: [ { duration: 60, price: 250000 }, { duration: 90, price: 350000 }, { duration: 120, price: 450000 } ],
        otherServices: ['Sauna', 'Jacuzzi', 'Salon', 'Nail Art', 'Steam Room'],
        openingHours: '10:00 AM - 9:00 PM',
        photos: [
            { url: 'https://picsum.photos/seed/m3_photo1/600/400', name: 'Treatment Room' },
            { url: 'https://picsum.photos/seed/m3_photo2/600/400', name: 'Jacuzzi Area' },
            { url: 'https://picsum.photos/seed/m3_photo3/600/400', name: 'Reception' }
        ],
        discounts: [
            { id: 'd_m3', dayOfWeek: new Date().getDay(), percentage: 20, startTime: '00:00', endTime: '23:59' }
        ]
    },
    { 
        id: 'm4', name: 'Seminyak Beachside Spa', type: 'massage', subType: 'place', address: 'Seminyak', street: 'Jl. Petitenget', rating: 4.9, distance: 2.8,
        headerImage: 'https://picsum.photos/seed/m4_header/800/200', image: 'https://picsum.photos/seed/m4_spa/200/200', whatsapp: '6281234567882',
        bio: 'Enjoy a relaxing massage with the sound of the waves. We offer beachfront cabanas for a unique spa experience.',
        status: 'online', massageTypes: ['Balinese', 'Four Hand Massage', 'Foot Reflexology'],
        prices: [ { duration: 60, price: 300000 }, { duration: 90, price: 425000 }, { duration: 120, price: 550000 } ],
        otherServices: ['Manicure', 'Pedicure', 'Hair Spa', 'Jacuzzi'],
        openingHours: '9:00 AM - 8:00 PM',
        photos: [
            { url: 'https://picsum.photos/seed/m4_photo1/600/400', name: 'Beachfront Cabana' },
            { url: 'https://picsum.photos/seed/m4_photo2/600/400', name: 'Pedicure Station' },
            { url: 'https://picsum.photos/seed/m4_photo3/600/400', name: 'Lobby' }
        ]
    },
    { 
        id: 'm5', name: "Ayu's Serene Touch", type: 'massage', subType: 'home_service', address: 'Uluwatu', street: 'Home Service', rating: 4.9, distance: 1.8, 
        headerImage: 'https://picsum.photos/seed/m5_header/800/200', image: 'https://picsum.photos/seed/m5_therapist/200/200', whatsapp: '6281234567877',
        bio: 'Bringing tranquility to you. Specializing in aromatherapy and relaxing massage techniques to melt your stress away.',
        status: 'online', massageTypes: ['Aromatherapy', 'Swedish', 'Reflexology'],
        prices: [ { duration: 60, price: 200000 }, { duration: 90, price: 280000 } ]
    },
    { 
        id: 'm6', name: "Kuta Healing Center", type: 'massage', subType: 'place', address: 'Kuta', street: 'Jl. Poppies II', rating: 4.6, distance: 0.8,
        headerImage: 'https://picsum.photos/seed/m6_header/800/200', image: 'https://picsum.photos/seed/m6_spa/200/200', whatsapp: '6281234567876',
        bio: 'Affordable and professional massage services in the heart of Kuta. Walk-ins welcome!',
        status: 'online', massageTypes: ['Balinese Massage', 'Foot Massage', 'Back & Shoulder'],
        prices: [ { duration: 60, price: 90000 }, { duration: 90, price: 130000 } ],
        openingHours: '10:00 AM - 11:00 PM',
    },
    { 
        id: 'm7', name: "Denpasar Deep Tissue", type: 'massage', subType: 'home_service', address: 'Denpasar', street: 'Home Service', rating: 4.7, distance: 4.5,
        headerImage: 'https://picsum.photos/seed/m7_header/800/200', image: 'https://picsum.photos/seed/m7_therapist/200/200', whatsapp: '6281234567875',
        bio: 'Specialist in deep tissue and sports massage for muscle recovery and pain relief. Available for home service in the Denpasar area.',
        status: 'offline', massageTypes: ['Deep Tissue', 'Sports Massage', 'Trigger Point'],
        prices: [ { duration: 60, price: 220000 }, { duration: 90, price: 300000 } ]
    },
    // Hotels & Villas
    { 
      id: 'h1', name: 'Ubud Serenity Resort', type: 'hotel', address: 'Ubud', street: 'Jl. Bisma', rating: 4.9, distance: 11.5,
      headerImage: 'https://picsum.photos/seed/h1_header/800/200', image: 'https://picsum.photos/seed/h1_main/200/200', logo: 'https://picsum.photos/seed/h1_logo/100/100',
      whatsapp: '6281234567881',
      bio: 'A tranquil oasis with stunning jungle views.',
      description: 'Nestled in the heart of Ubud, our resort offers a perfect blend of luxury and nature. Enjoy our infinity pool overlooking the jungle, daily yoga classes, and an on-site spa offering traditional Balinese treatments. All rooms are equipped with modern amenities for your comfort.',
      checkInTime: '14:00', airportPickup: true,
      roomIds: ['r1', 'r2'],
      photos: [
        { url: 'https://picsum.photos/seed/h1_photo1/600/400', name: 'Infinity Pool' },
        { url: 'https://picsum.photos/seed/h1_photo2/600/400', name: 'Restaurant' },
        { url: 'https://picsum.photos/seed/h1_photo3/600/400', name: 'Spa Room' }
      ],
      hotelVillaAmenities: {
        guestRoom: { wifi: true, tv: true, miniBar: true, coffeeMaker: true, safe: true, airConditioning: true, hairDryer: true },
        services: { frontDesk24h: true, concierge: true, housekeeping: true, fitnessCenter: true, pool: true, restaurantBar: true, laundry: true, parking: true },
        wellness: { spa: true, yogaClasses: true },
        family: { babysitting: true },
        other: { roomService: true, shuttleService: true, currencyExchange: true }
      },
      loyaltyRewardEnabled: true,
    },
    { 
      id: 'h2', name: 'Seminyak Beachfront Resort', type: 'hotel', address: 'Seminyak', street: 'Jl. Pantai Seminyak', rating: 4.8, distance: 3.8,
      headerImage: 'https://picsum.photos/seed/h2_header/800/200', image: 'https://picsum.photos/seed/h2_main/200/200', logo: 'https://picsum.photos/seed/h2_logo/100/100',
      whatsapp: '6281234567879',
      bio: 'Luxury resort with direct beach access.',
      description: 'Experience unparalleled luxury at Seminyak Beachfront Resort. Our rooms offer stunning ocean views, and our facilities include a multi-level infinity pool, a world-class spa, and several dining options right on the beach.',
      checkInTime: '15:00', airportPickup: true,
      roomIds: ['r4', 'r5'],
      hotelVillaAmenities: {
        guestRoom: { wifi: true, tv: true, miniBar: true, safe: true, airConditioning: true },
        services: { frontDesk24h: true, concierge: true, housekeeping: true, pool: true, restaurantBar: true, laundry: true, parking: true, fitnessCenter: true },
        wellness: { spa: true },
        family: {},
        other: { roomService: true }
      },
      loyaltyRewardEnabled: true,
    },
    { 
      id: 'h3', name: 'Kuta Discovery Hotel', type: 'hotel', address: 'Kuta', street: 'Jl. Kartika Plaza', rating: 4.6, distance: 1.1,
      headerImage: 'https://picsum.photos/seed/h3_header/800/200', image: 'https://picsum.photos/seed/h3_main/200/200', logo: 'https://picsum.photos/seed/h3_logo/100/100',
      whatsapp: '6281234567878',
      bio: 'Family-friendly hotel next to a shopping mall.',
      description: 'Located in the heart of Kuta, our hotel is perfect for families and shoppers. Enjoy our large lagoon pool, kids club, and direct access to Discovery Shopping Mall. Just a short walk to Waterbom Bali and Kuta Beach.',
      checkInTime: '14:00', airportPickup: false,
      roomIds: ['r6', 'r7'],
      hotelVillaAmenities: {
        guestRoom: { wifi: true, tv: true, airConditioning: true },
        services: { frontDesk24h: true, housekeeping: true, pool: true, restaurantBar: true, parking: true },
        wellness: {},
        family: { kidsClub: true, babysitting: true },
        other: { roomService: true, giftShop: true }
      }
    },
    { 
      id: 'v10', name: 'Canggu Beachfront Villa', type: 'villa', address: 'Canggu', street: 'Jl. Pantai Batu Mejan', rating: 4.8, distance: 4.2,
      headerImage: 'https://picsum.photos/seed/v10_header/800/200', image: 'https://picsum.photos/seed/v10_main/200/200', logo: 'https://picsum.photos/seed/v10_logo/100/100',
      whatsapp: '6281234567880',
      bio: 'Your private luxury escape, steps from the ocean.',
      description: 'Experience the best of Canggu in our stunning 3-bedroom private villa. Featuring a large private pool, open-plan living area, fully equipped kitchen, and daily housekeeping services. Perfect for families or groups looking for an unforgettable Bali getaway.',
      checkInTime: '15:00', airportPickup: true,
      roomIds: ['r3'],
      photos: [
        { url: 'https://picsum.photos/seed/v10_photo1/600/400', name: 'Living Area' },
        { url: 'https://picsum.photos/seed/v10_photo2/600/400', name: 'Master Bedroom' },
        { url: 'https://picsum.photos/seed/v10_photo3/600/400', name: 'Pool at Night' }
      ],
      hotelVillaAmenities: {
        guestRoom: { wifi: true, tv: true, safe: true, airConditioning: true, kitchen: true },
        services: { housekeeping: true, pool: true, parking: true },
        wellness: {},
        family: { babysitting: true },
        other: { shuttleService: true, petFriendly: true }
      }
    },
    { 
        id: 'm8', 
        name: "Uluwatu Sunset Massage", 
        type: 'massage', 
        subType: 'home_service', 
        address: 'Uluwatu', 
        street: 'Home Service', 
        rating: 4.8, 
        distance: 2.1, 
        headerImage: 'https://picsum.photos/seed/m8_header/800/200', 
        image: 'https://picsum.photos/seed/m8_therapist/200/200', 
        whatsapp: '6281234567874',
        bio: "Relax and unwind with a professional massage while enjoying the beautiful Uluwatu sunset from your villa. Specializing in relaxing oil massages.",
        status: 'online', 
        massageTypes: ['Swedish Massage', 'Aromatherapy', 'Balinese Massage'],
        prices: [ { duration: 90, price: 300000 }, { duration: 120, price: 400000 } ]
    },
    { 
        id: 'm9', 
        name: "Canggu Chill Spa", 
        type: 'massage', 
        subType: 'place', 
        address: 'Canggu', 
        street: 'Jl. Batu Mejan', 
        rating: 4.7, 
        distance: 1.1,
        headerImage: 'https://picsum.photos/seed/m9_header/800/200', 
        image: 'https://picsum.photos/seed/m9_spa/200/200', 
        whatsapp: '6281234567873',
        bio: "A modern spa in the heart of Canggu offering a variety of treatments for surfers and yogis. Come and chill with us.",
        status: 'online', 
        massageTypes: ['Deep Tissue', 'Sports Massage', 'Hot Stone'],
        prices: [ { duration: 60, price: 280000 }, { duration: 90, price: 400000 } ],
        otherServices: ['Sauna', 'Ice Bath', 'Yoga Classes'],
        openingHours: '9:00 AM - 9:00 PM',
        photos: [
            { url: 'https://picsum.photos/seed/m9_photo1/600/400', name: 'Chill Area' },
            { url: 'https://picsum.photos/seed/m9_photo2/600/400', name: 'Ice Bath' },
            { url: 'https://picsum.photos/seed/m9_photo3/600/400', name: 'Treatment Room' }
        ]
    },
    { 
        id: 'm10', 
        name: "Seminyak Mobile Therapy", 
        type: 'massage', 
        subType: 'home_service', 
        address: 'Seminyak', 
        street: 'Home Service', 
        rating: 4.9, 
        distance: 0.5, 
        headerImage: 'https://picsum.photos/seed/m10_header/800/200', 
        image: 'https://picsum.photos/seed/m10_therapist/200/200', 
        whatsapp: '6281234567872',
        bio: "Luxury spa treatments in the comfort of your own hotel or villa. Over 10 years of experience in 5-star hotels. Certified and professional.",
        status: 'online', 
        massageTypes: ['Balinese Massage', 'Lomi Lomi', 'Hot Stone', 'Four Hand Massage'],
        prices: [ { duration: 90, price: 500000 }, { duration: 120, price: 650000 } ]
    },
];