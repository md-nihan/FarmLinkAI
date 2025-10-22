const axios = require('axios');

async function testApproval() {
    try {
        console.log('Testing farmer approval process...');
        
        // First, login as admin
        console.log('1. Logging in as admin...');
        const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
            username: 'nihan9t9',
            password: '1234'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Admin login successful!');
        
        // Get pending farmers
        console.log('2. Fetching pending farmers...');
        const farmersResponse = await axios.get('http://localhost:3001/api/farmers?status=pending', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Found', farmersResponse.data.count, 'pending farmers');
        
        if (farmersResponse.data.count === 0) {
            console.log('❌ No pending farmers found to approve');
            return;
        }
        
        const farmerToApprove = farmersResponse.data.farmers[0];
        console.log('3. Approving farmer:', farmerToApprove.name);
        
        // Approve the farmer
        const approveResponse = await axios.post(
            `http://localhost:3001/api/farmers/approve/${farmerToApprove._id}`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        
        console.log('✅ Approval response:', approveResponse.data.message);
        console.log('🎉 Farmer approval process completed successfully!');
        
    } catch (error) {
        console.error('❌ Error in approval process:', error.response ? error.response.data : error.message);
    }
}

testApproval();