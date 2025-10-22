const axios = require('axios');

async function testAdminLogin() {
    try {
        console.log('Testing admin login...');
        
        const response = await axios.post('http://localhost:3001/api/auth/login', {
            username: 'nihan9t9',
            password: '1234'
        });
        
        console.log('Admin login response:', response.data);
    } catch (error) {
        console.error('Admin login error:', error.response ? error.response.data : error.message);
    }
}

testAdminLogin();