const axios = require('axios');

async function testRegistration() {
    try {
        console.log('Testing farmer registration...');
        
        // Let's try the registration endpoint directly
        const postResponse = await axios.post('http://localhost:3001/api/farmers/register', {
            name: 'Test Farmer',
            phone: '+919876543210',
            village: 'Test Village',
            district: 'Test District',
            crops: 'Tomato, Onion'
        });
        
        console.log('POST /api/farmers/register response:', postResponse.data);
    } catch (error) {
        console.error('Error:', error.response ? {
            status: error.response.status,
            data: error.response.data
        } : error.message);
    }
}

testRegistration();