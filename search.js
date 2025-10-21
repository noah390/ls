// Search functionality
function initializeSearch() {
    const searchInput = document.getElementById('input');
    const searchIcon = document.querySelector('.search');
    
    if (!searchInput) return;
    
    function performSearch() {
        const query = searchInput.value.toLowerCase().trim();
        
        if (query === '') {
            showAllProducts();
            return;
        }
        
        // Hide all products first
        const allProducts = document.querySelectorAll('#box');
        allProducts.forEach(product => {
            const name = product.querySelector('h3')?.textContent.toLowerCase() || '';
            const brand = product.querySelector('h4')?.textContent.toLowerCase() || '';
            
            if (name.includes(query) || brand.includes(query)) {
                product.style.display = 'block';
            } else {
                product.style.display = 'none';
            }
        });
        
        // Show search results message
        updateSearchResults(query);
    }
    
    function showAllProducts() {
        const allProducts = document.querySelectorAll('#box');
        allProducts.forEach(product => {
            product.style.display = 'block';
        });
        
        // Remove search results message
        const existingMessage = document.querySelector('.search-results-message');
        if (existingMessage) {
            existingMessage.remove();
        }
    }
    
    function updateSearchResults(query) {
        const existingMessage = document.querySelector('.search-results-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const visibleProducts = document.querySelectorAll('#box[style*="block"], #box:not([style*="none"])');
        const actualVisible = Array.from(visibleProducts).filter(p => p.style.display !== 'none');
        
        const message = document.createElement('div');
        message.className = 'search-results-message';
        message.style.cssText = `
            text-align: center;
            padding: 20px;
            margin: 20px 0;
            background: #f8f9fa;
            border-radius: 8px;
            color: #666;
        `;
        
        if (actualVisible.length === 0) {
            message.innerHTML = `<h3>No products found for "${query}"</h3><p>Try searching with different keywords.</p>`;
        } else {
            message.innerHTML = `<h3>Found ${actualVisible.length} product(s) for "${query}"</h3>`;
        }
        
        const mainContainer = document.getElementById('mainContainer');
        if (mainContainer) {
            mainContainer.insertBefore(message, mainContainer.firstChild);
        }
    }
    
    // Event listeners
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    searchInput.addEventListener('input', function() {
        // Real-time search with debounce
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(performSearch, 300);
    });
    
    if (searchIcon) {
        searchIcon.addEventListener('click', performSearch);
    }
}

// Initialize search when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initializeSearch, 500); // Wait for products to load
    });
} else {
    setTimeout(initializeSearch, 500);
}