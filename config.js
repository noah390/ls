// Lohoba Luxury - Business Configuration
const BUSINESS_CONFIG = {
    storeName: "Lohoba Luxury",
    tagline: "Premium Fashion & Accessories",
    currency: "USD",
    currencySymbol: "$",
    
    // Business Contact Information
    contact: {
        phone: "+1 (555) 123-4567",
        whatsapp: "09050120553",
        email: "info@lohobaluxury.com",
        address: {
            street: "123 Fashion District",
            city: "New York",
            state: "NY",
            zip: "10001",
            country: "United States"
        }
    },
    
    // Business Hours
    hours: {
        monday: "9:00 AM - 8:00 PM",
        tuesday: "9:00 AM - 8:00 PM", 
        wednesday: "9:00 AM - 8:00 PM",
        thursday: "9:00 AM - 8:00 PM",
        friday: "9:00 AM - 9:00 PM",
        saturday: "10:00 AM - 9:00 PM",
        sunday: "11:00 AM - 6:00 PM"
    },
    
    // Shipping & Returns
    shipping: {
        freeShippingThreshold: 100,
        standardShipping: 9.99,
        expressShipping: 19.99,
        returnPeriod: 30 // days
    },
    
    // Social Media
    social: {
        instagram: "@lohobaluxury",
        facebook: "LohobaLuxury",
        twitter: "@lohobaluxury"
    }
};

// Make config available globally
if (typeof window !== 'undefined') {
    window.BUSINESS_CONFIG = BUSINESS_CONFIG;
}