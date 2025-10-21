// Demo Data Setup Script for Lohoba Luxury Admin System

function setupDemoData() {
    // Create demo users
    const demoUsers = [
        {
            id: 'user1',
            full_name: 'John Doe',
            email: 'john.doe@example.com',
            created_at: new Date('2024-01-15').toISOString(),
            status: 'active'
        },
        {
            id: 'user2',
            full_name: 'Jane Smith',
            email: 'jane.smith@example.com',
            created_at: new Date('2024-02-10').toISOString(),
            status: 'active'
        },
        {
            id: 'user3',
            full_name: 'Mike Johnson',
            email: 'mike.johnson@example.com',
            created_at: new Date('2024-03-05').toISOString(),
            status: 'suspended'
        }
    ];

    // Create demo admin users
    const demoAdmins = [
        {
            id: 'admin1',
            username: 'admin',
            email: 'admin@lohoba.com',
            password: 'LHL2024',
            role: 'super-admin',
            created: new Date().toISOString()
        },
        {
            id: 'admin2',
            username: 'moderator1',
            email: 'mod@lohoba.com',
            password: 'mod123',
            role: 'moderator',
            created: new Date().toISOString()
        }
    ];

    // Create demo orders
    const demoOrders = [
        {
            id: 'order1',
            customerName: 'John Doe',
            customerEmail: 'john.doe@example.com',
            total: '25000',
            status: 'completed',
            date: new Date('2024-03-01').toISOString(),
            items: [
                { name: 'Premium Shirt', quantity: 1, price: '15000' },
                { name: 'Designer Pants', quantity: 1, price: '10000' }
            ]
        },
        {
            id: 'order2',
            customerName: 'Jane Smith',
            customerEmail: 'jane.smith@example.com',
            total: '18000',
            status: 'pending',
            date: new Date('2024-03-10').toISOString(),
            items: [
                { name: 'Luxury Handbag', quantity: 1, price: '18000' }
            ]
        }
    ];

    // Security settings
    const securitySettings = {
        requireStrongPassword: true,
        enableTwoFactor: false,
        sessionTimeout: 30,
        forceLogoutInactive: true,
        enableIPWhitelist: false,
        maxLoginAttempts: 5
    };

    // General settings
    const generalSettings = {
        siteName: 'Lohoba Luxury',
        siteDescription: 'Premium Fashion & Accessories',
        contactEmail: 'info@lohoba.com',
        currency: 'NGN',
        taxRate: 7.5,
        enableInventoryTracking: true,
        enableOrderEmails: true,
        enableNewsletters: true
    };

    // Store in localStorage
    localStorage.setItem('lohobaUsers', JSON.stringify(demoUsers));
    localStorage.setItem('adminUsers', JSON.stringify(demoAdmins));
    localStorage.setItem('lohobaOrders', JSON.stringify(demoOrders));
    localStorage.setItem('securitySettings', JSON.stringify(securitySettings));
    localStorage.setItem('generalSettings', JSON.stringify(generalSettings));

    console.log('Demo data setup complete!');
    alert('Demo data has been set up successfully!\n\nYou can now:\n- View demo users in the admin panel\n- See sample orders and analytics\n- Test all admin features\n\nDefault admin login:\nUsername: admin\nPassword: LHL2024');
}

// Auto-setup on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check if demo data already exists
    if (!localStorage.getItem('demoDataSetup')) {
        setupDemoData();
        localStorage.setItem('demoDataSetup', 'true');
    }
});

// Manual setup function
function resetDemoData() {
    if (confirm('This will reset all demo data. Are you sure?')) {
        localStorage.removeItem('demoDataSetup');
        setupDemoData();
    }
}