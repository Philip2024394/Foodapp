import { FoodOrder, OrderStatus } from '../types';

// Mock orders for restaurants
export const MOCK_ORDERS: FoodOrder[] = [
  {
    id: 'order_001',
    vendorId: 'v1',
    vendorName: 'Warung Bu Ani',
    customerName: 'Budi Santoso',
    customerPhone: '08123456789',
    customerWhatsApp: '628123456789',
    deliveryAddress: 'Jl. Legian No. 45, Kuta, Bali',
    items: [
      {
        item: {
          id: 'item_v1_1',
          name: 'Nasi Goreng Special',
          price: 25000,
          image: 'https://picsum.photos/seed/nasigoreng/200/200',
          description: 'Fried rice with chicken and vegetables',
          longDescription: 'Delicious fried rice with chicken, vegetables, and special spices',
          vendorId: 'v1',
          category: 'Main Course',
          subcategory: 'Rice',
          chiliLevel: 2,
          cookingTime: 15,
          hasGarlic: true,
          isAvailable: true
        },
        quantity: 2
      },
      {
        item: {
          id: 'item_v1_5',
          name: 'Es Teh Manis',
          price: 5000,
          image: 'https://picsum.photos/seed/esteh/200/200',
          description: 'Sweet iced tea',
          longDescription: 'Refreshing sweet iced tea',
          vendorId: 'v1',
          category: 'Drink',
          subcategory: 'Drinks',
          chiliLevel: 0,
          cookingTime: 2,
          hasGarlic: false,
          isAvailable: true
        },
        quantity: 2
      }
    ],
    subtotal: 60000,
    deliveryFee: 12000,
    total: 72000,
    paymentMethod: 'Cash on Delivery' as any,
    status: OrderStatus.PENDING,
    statusHistory: [
      {
        status: OrderStatus.PENDING,
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        note: 'Order received'
      }
    ],
    orderTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    notes: 'Please make it extra spicy!'
  },
  {
    id: 'order_002',
    vendorId: 'v1',
    vendorName: 'Warung Bu Ani',
    customerName: 'Siti Rahmawati',
    customerPhone: '08234567890',
    customerWhatsApp: '628234567890',
    deliveryAddress: 'Jl. Sunset Road No. 12, Seminyak, Bali',
    items: [
      {
        item: {
          id: 'item_v1_2',
          name: 'Mie Goreng',
          price: 22000,
          image: 'https://picsum.photos/seed/miegoreng/200/200',
          description: 'Stir-fried noodles',
          longDescription: 'Delicious stir-fried noodles with vegetables',
          vendorId: 'v1',
          category: 'Main Course',
          subcategory: 'Noodle',
          chiliLevel: 3,
          cookingTime: 12,
          hasGarlic: true,
          isAvailable: true
        },
        quantity: 1
      }
    ],
    subtotal: 22000,
    deliveryFee: 12000,
    total: 34000,
    paymentMethod: 'Bank Transfer' as any,
    status: OrderStatus.PREPARING,
    statusHistory: [
      {
        status: OrderStatus.PENDING,
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        note: 'Order received'
      },
      {
        status: OrderStatus.ACCEPTED,
        timestamp: new Date(Date.now() - 13 * 60 * 1000).toISOString(),
        note: 'Order accepted by restaurant'
      },
      {
        status: OrderStatus.PREPARING,
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        note: 'Cooking started'
      }
    ],
    orderTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    estimatedPrepTime: 15
  },
  {
    id: 'order_003',
    vendorId: 'v1',
    vendorName: 'Warung Bu Ani',
    customerName: 'Ahmad Yusuf',
    customerPhone: '08345678901',
    customerWhatsApp: '628345678901',
    deliveryAddress: 'Jl. Pantai Kuta No. 88, Kuta, Bali',
    items: [
      {
        item: {
          id: 'item_v1_3',
          name: 'Bakso Sapi',
          price: 28000,
          image: 'https://picsum.photos/seed/bakso/200/200',
          description: 'Beef meatball soup',
          longDescription: 'Traditional beef meatball soup with noodles',
          vendorId: 'v1',
          category: 'Soup',
          subcategory: 'Soup',
          chiliLevel: 1,
          cookingTime: 10,
          hasGarlic: true,
          isAvailable: true
        },
        quantity: 3
      }
    ],
    subtotal: 84000,
    deliveryFee: 12000,
    total: 96000,
    paymentMethod: 'Cash on Delivery' as any,
    status: OrderStatus.READY,
    statusHistory: [
      {
        status: OrderStatus.PENDING,
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        note: 'Order received'
      },
      {
        status: OrderStatus.ACCEPTED,
        timestamp: new Date(Date.now() - 23 * 60 * 1000).toISOString(),
        note: 'Order accepted'
      },
      {
        status: OrderStatus.PREPARING,
        timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        note: 'Cooking started'
      },
      {
        status: OrderStatus.READY,
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        note: 'Food is ready for pickup'
      }
    ],
    orderTime: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    estimatedPrepTime: 15
  },
  {
    id: 'order_004',
    vendorId: 'v1',
    vendorName: 'Warung Bu Ani',
    customerName: 'Dewi Lestari',
    customerPhone: '08456789012',
    customerWhatsApp: '628456789012',
    deliveryAddress: 'Jl. Raya Kuta No. 101, Kuta, Bali',
    items: [
      {
        item: {
          id: 'item_v1_1',
          name: 'Nasi Goreng Special',
          price: 25000,
          image: 'https://picsum.photos/seed/nasigoreng/200/200',
          description: 'Fried rice with chicken and vegetables',
          longDescription: 'Delicious fried rice with chicken, vegetables, and special spices',
          vendorId: 'v1',
          category: 'Main Course',
          subcategory: 'Rice',
          chiliLevel: 2,
          cookingTime: 15,
          hasGarlic: true,
          isAvailable: true
        },
        quantity: 1
      },
      {
        item: {
          id: 'item_v1_4',
          name: 'Sate Ayam',
          price: 30000,
          image: 'https://picsum.photos/seed/sateayam/200/200',
          description: 'Chicken satay with peanut sauce',
          longDescription: 'Grilled chicken skewers with peanut sauce',
          vendorId: 'v1',
          category: 'Main Course',
          subcategory: 'Meat',
          chiliLevel: 2,
          cookingTime: 20,
          hasGarlic: true,
          isAvailable: true
        },
        quantity: 1
      }
    ],
    subtotal: 55000,
    deliveryFee: 12000,
    total: 67000,
    paymentMethod: 'Cash on Delivery' as any,
    status: OrderStatus.ON_THE_WAY,
    statusHistory: [
      {
        status: OrderStatus.PENDING,
        timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
        note: 'Order received'
      },
      {
        status: OrderStatus.ACCEPTED,
        timestamp: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
        note: 'Order accepted'
      },
      {
        status: OrderStatus.PREPARING,
        timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
        note: 'Cooking started'
      },
      {
        status: OrderStatus.READY,
        timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        note: 'Food ready'
      },
      {
        status: OrderStatus.PICKED_UP,
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        note: 'Driver picked up'
      },
      {
        status: OrderStatus.ON_THE_WAY,
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        note: 'On the way to customer'
      }
    ],
    orderTime: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    driverInfo: {
      driverId: 'driver_001',
      driverName: 'Pak Ketut',
      driverPhone: '08111222333',
      driverWhatsApp: '08111222333',
      vehicleType: 'Bike'
    },
    estimatedDeliveryTime: new Date(Date.now() + 5 * 60 * 1000).toISOString()
  }
];
