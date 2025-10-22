const axios = require('axios');

async function testPendingFarmers() {
    try {
        console.log('Testing admin login...');
        
        // First, login as admin
        const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
            username: 'nihan9t9',
            password: '1234'
        });
        
        const token = loginResponse.data.token;
        console.log('Admin login successful!');
        
        // Now get pending farmers
        console.log('Fetching pending farmers...');
        const farmersResponse = await axios.get('http://localhost:3001/api/farmers?status=pending', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Pending farmers response:', farmersResponse.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

testPendingFarmers();