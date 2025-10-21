// Lohoba Luxury - Sync Manager
// Ensures admin panel and website stay in perfect sync

class SyncManager {
    constructor() {
        this.isAdmin = false;
        this.syncInterval = null;
        this.init();
    }

    init() {
        this.setupStorageListeners();
        this.setupPeriodicSync();
        this.checkAdminStatus();
    }

    // Listen for storage changes across tabs
    setupStorageListeners() {
        window.addEventListener('storage', (e) => {
            switch (e.key) {
                case 'adminProducts':
                    this.syncProducts(e.newValue);
                    break;
                case 'lohobaOrders':
                    this.syncOrders(e.newValue);
                    break;
                case 'adminMode':
                    this.syncAdminMode(e.newValue);
                    break;
            }
        });
    }

    // Periodic sync every 3 seconds
    setupPeriodicSync() {
        this.syncInterval = setInterval(() => {
            this.performSync();
        }, 3000);
    }

    // Check if current page is admin
    checkAdminStatus() {
        this.isAdmin = window.location.pathname.includes('admin.html');
    }

    // Sync products between admin and website
    syncProducts(newValue) {
        try {
            const products = JSON.parse(newValue || '[]');
            
            if (this.isAdmin) {
                // Update admin panel display
                if (window.loadAdminProducts) {
                    window.loadAdminProducts();
                }
                if (window.updateAnalytics) {
                    window.updateAnalytics();
                }
            } else {
                // Update website display
                if (window.sampleProducts && window.loadProducts) {
                    window.sampleProducts = products;
                    window.loadProducts(products);
                }
            }
            
            this.showSyncNotification('Products synced successfully!');
        } catch (e) {
            console.error('Product sync failed:', e);
        }
    }

    // Sync orders
    syncOrders(newValue) {
        try {
            if (this.isAdmin && window.loadOrders) {
                window.loadOrders();
            }
            if (this.isAdmin && window.updateAnalytics) {
                window.updateAnalytics();
            }
        } catch (e) {
            console.error('Order sync failed:', e);
        }
    }

    // Sync admin mode
    syncAdminMode(newValue) {
        try {
            const isAdminMode = newValue === 'true';
            if (window.toggleAdminMode && !this.isAdmin) {
                window.toggleAdminMode(isAdminMode);
            }
        } catch (e) {
            console.error('Admin mode sync failed:', e);
        }
    }

    // Perform comprehensive sync
    performSync() {
        try {
            // Sync products
            const adminProducts = localStorage.getItem('adminProducts');
            if (adminProducts && window.sampleProducts) {
                const products = JSON.parse(adminProducts);
                if (JSON.stringify(products) !== JSON.stringify(window.sampleProducts)) {
                    this.syncProducts(adminProducts);
                }
            }

            // Sync cart badge
            if (window.updateCartBadge && !this.isAdmin) {
                window.updateCartBadge();
            }

            // Sync admin panel data
            if (this.isAdmin) {
                if (window.updateAnalytics) {
                    window.updateAnalytics();
                }
            }
        } catch (e) {
            // Silent sync - don't spam console
        }
    }

    // Show sync notification
    showSyncNotification(message) {
        // Only show if not admin panel to avoid spam
        if (!this.isAdmin && window.showNotification) {
            window.showNotification(message);
        }
    }

    // Manual sync trigger
    forcSync() {
        this.performSync();
        this.showSyncNotification('Manual sync completed!');
    }

    // Enable admin mode across all tabs
    enableAdminMode() {
        localStorage.setItem('adminMode', 'true');
        window.isAdminLoggedIn = true;
        this.syncAdminMode('true');
    }

    // Disable admin mode across all tabs
    disableAdminMode() {
        localStorage.setItem('adminMode', 'false');
        window.isAdminLoggedIn = false;
        this.syncAdminMode('false');
    }

    // Cleanup
    destroy() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        window.removeEventListener('storage', this.setupStorageListeners);
    }
}

// Initialize sync manager
const syncManager = new SyncManager();

// Make available globally
window.syncManager = syncManager;

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    syncManager.destroy();
});

// Enhanced global functions for better sync
window.refreshWebsiteProducts = function() {
    const adminProducts = localStorage.getItem('adminProducts');
    if (adminProducts) {
        syncManager.syncProducts(adminProducts);
    }
};

window.syncAllData = function() {
    syncManager.forcSync();
};

// Auto-sync on visibility change (when switching tabs)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        setTimeout(() => {
            syncManager.performSync();
        }, 500);
    }
});

console.log('Lohoba Luxury Sync Manager initialized');