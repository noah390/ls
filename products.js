// Real Nigerian products for Lohoba Luxury
let sampleProducts = [
    {
        "id": "1",
        "name": "Ankara Print Shirt",
        "brand": "Lohoba Luxury",
        "price": "25000",
        "preview": "img/img1.png",
        "isAccessory": false
    },
    {
        "id": "2", 
        "name": "Agbada Traditional Wear",
        "brand": "Lohoba Luxury",
        "price": "85000",
        "preview": "img/img2.png",
        "isAccessory": false
    },
    {
        "id": "3",
        "name": "Gele Head Wrap",
        "brand": "Lohoba Luxury", 
        "price": "15000",
        "preview": "img/img3.png",
        "isAccessory": true
    },
    {
        "id": "4",
        "name": "Beaded Handbag",
        "brand": "Lohoba Luxury",
        "price": "35000", 
        "preview": "img/img4.png",
        "isAccessory": true
    },
    {
        "id": "5",
        "name": "Aso Ebi Lace Dress",
        "brand": "Lohoba Luxury",
        "price": "65000",
        "preview": "img/img1.png",
        "isAccessory": false
    },
    {
        "id": "6",
        "name": "Coral Beads Necklace",
        "brand": "Lohoba Luxury",
        "price": "120000",
        "preview": "img/img2.png", 
        "isAccessory": true
    }
];

// Make products available globally and initialize from localStorage if available
if (typeof window !== 'undefined') {
    const savedProducts = localStorage.getItem('adminProducts');
    if (savedProducts) {
        try {
            window.sampleProducts = JSON.parse(savedProducts);
        } catch (e) {
            window.sampleProducts = sampleProducts;
        }
    } else {
        window.sampleProducts = sampleProducts;
    }
}