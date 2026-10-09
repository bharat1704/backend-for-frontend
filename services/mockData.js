// Mock database for core downstream microservices

const users = [
  {
    id: "usr_101",
    firstName: "Bharat",
    lastName: "Sharma",
    email: "bharat@example.com",
    role: "premium_member",
    // Sensitive / internal fields that frontend should NEVER receive
    hashedPassword: "$2b$12$e8O...super_secret_hash_value",
    internalAuditId: "AUD-SEC-998811",
    membershipExpiresAt: "2027-12-31T23:59:59Z",
    preferences: {
      theme: "dark",
      currency: "USD",
      notifications: { email: true, sms: false, push: true }
    },
    billingAddress: {
      street: "123 Tech Park Ave",
      city: "Bengaluru",
      state: "Karnataka",
      country: "India",
      zip: "560001"
    }
  }
];

const orders = [
  {
    orderId: "ord_901",
    userId: "usr_101",
    createdAt: "2026-10-09T10:15:00Z",
    status: "OUT_FOR_DELIVERY",
    warehouseId: "WH-BLR-04",
    courierPartner: "BlueDart Express",
    trackingNumber: "BD99281729",
    taxCalculations: {
      gstPercentage: 18.0,
      gstAmount: 22.88,
      internalLedgerCode: "TAX-GST-IN-18",
      fiscalYear: "2026-27"
    },
    subtotal: 127.11,
    totalAmount: 149.99,
    currency: "USD",
    items: [
      {
        sku: "SKU-HEADPHONE-ANC",
        title: "Wireless Active Noise-Canceling Headphones",
        quantity: 1,
        unitPrice: 127.11,
        warrantyMonths: 24,
        supplierWarehouse: "WH-BLR-04"
      }
    ]
  },
  {
    orderId: "ord_882",
    userId: "usr_101",
    createdAt: "2026-09-28T14:20:00Z",
    status: "DELIVERED",
    warehouseId: "WH-DEL-02",
    courierPartner: "Delhivery",
    trackingNumber: "DLH7712399",
    taxCalculations: {
      gstPercentage: 18.0,
      gstAmount: 6.02,
      internalLedgerCode: "TAX-GST-IN-18",
      fiscalYear: "2026-27"
    },
    subtotal: 33.48,
    totalAmount: 39.50,
    currency: "USD",
    items: [
      {
        sku: "SKU-USB-HUB-7",
        title: "7-in-1 Aluminum USB-C Hub Adapter",
        quantity: 1,
        unitPrice: 33.48,
        warrantyMonths: 12,
        supplierWarehouse: "WH-DEL-02"
      }
    ]
  }
];

const products = [
  {
    productId: "prod_301",
    name: "Ergonomic Mechanical Keyboard (Hot-swappable)",
    category: "Peripherals",
    price: 119.00,
    currency: "USD",
    stockQuantity: 42,
    // Internal ML metadata
    mlModelScore: 0.984,
    internalSupplierId: "SUPPLIER-SHENZHEN-09",
    marginPercentage: 45.2,
    rating: 4.8,
    reviewCount: 1420,
    thumbnail: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300",
    images: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1000",
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=1000"
    ],
    specs: {
      switchType: "Cherry MX Brown tactile",
      connectivity: "Bluetooth 5.2 & Type-C Cable",
      batteryLife: "80 hours backlighting off",
      weightGrams: 850
    }
  },
  {
    productId: "prod_302",
    name: "Ultra-Wide Curved Gaming Monitor 34\"",
    category: "Displays",
    price: 499.00,
    currency: "USD",
    stockQuantity: 15,
    mlModelScore: 0.941,
    internalSupplierId: "SUPPLIER-SEOUL-02",
    marginPercentage: 38.0,
    rating: 4.9,
    reviewCount: 880,
    thumbnail: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300",
    images: [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1000"
    ],
    specs: {
      resolution: "3440 x 1440 WQHD",
      refreshRate: "165Hz",
      panel: "OLED Fast Response",
      weightGrams: 7200
    }
  },
  {
    productId: "prod_303",
    name: "Studio Noise-Canceling Microphone",
    category: "Audio",
    price: 89.00,
    currency: "USD",
    stockQuantity: 120,
    mlModelScore: 0.872,
    internalSupplierId: "SUPPLIER-BLR-01",
    marginPercentage: 52.4,
    rating: 4.6,
    reviewCount: 310,
    thumbnail: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300",
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1000"
    ],
    specs: {
      pattern: "Cardioid / Omnidirectional",
      interface: "USB-C Plug & Play",
      frequencyResponse: "20Hz - 20kHz",
      weightGrams: 420
    }
  }
];

module.exports = {
  users,
  orders,
  products
};
