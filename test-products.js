// Test script to check product data and image URLs
const API_BASE_URL = 'http://localhost:3001';

async function testProductsAPI() {
    try {
        console.log('Testing products API...');
        
        // Fetch all products
        console.log('1. Fetching all products...');
        const productsResponse = await fetch(`${API_BASE_URL}/api/products`);
        
        const productsData = await productsResponse.json();
        console.log('✅ Products response:', JSON.stringify(productsData, null, 2));
        
        if (productsData.success && productsData.products && productsData.products.length > 0) {
            console.log('2. Found products:');
            productsData.products.forEach((product, index) => {
                console.log(`   Product ${index + 1}: ${product.product_name}`);
                console.log(`   Image URL: ${product.image_url}`);
                console.log(`   Quality Grade: ${product.quality_grade}`);
                console.log('---');
            });
        } else {
            console.log('ℹ️ No products found');
        }
        
    } catch (error) {
        console.error('❌ Error in products API test:', error.message);
    }
}

testProductsAPI();