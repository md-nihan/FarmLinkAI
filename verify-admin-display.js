const axios = require('axios');

async function verifyAdminDisplay() {
    try {
        console.log('Verifying admin panel display logic...');
        
        // Login as admin
        const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
            username: 'nihan9t9',
            password: '1234'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Admin login successful!');
        
        // Get all farmers (should show only approved farmers now)
        console.log('Fetching all farmers (should be only approved)...');
        const allFarmersResponse = await axios.get('http://localhost:3001/api/farmers', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('All farmers count:', allFarmersResponse.data.count);
        console.log('All farmers:', allFarmersResponse.data.farmers.map(f => ({
            name: f.name,
            approvalStatus: f.approvalStatus,
            isActive: f.isActive
        })));
        
        // Get pending farmers (should show only pending farmers)
        console.log('\nFetching pending farmers...');
        const pendingFarmersResponse = await axios.get('http://localhost:3001/api/farmers?status=pending', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Pending farmers count:', pendingFarmersResponse.data.count);
        console.log('Pending farmers:', pendingFarmersResponse.data.farmers.map(f => ({
            name: f.name,
            approvalStatus: f.approvalStatus,
            isActive: f.isActive
        })));
        
        // Get approved farmers (should show only approved farmers)
        console.log('\nFetching approved farmers...');
        const approvedFarmersResponse = await axios.get('http://localhost:3001/api/farmers?status=approved', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Approved farmers count:', approvedFarmersResponse.data.count);
        console.log('Approved farmers:', approvedFarmersResponse.data.farmers.map(f => ({
            name: f.name,
            approvalStatus: f.approvalStatus,
            isActive: f.isActive
        })));
        
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

verifyAdminDisplay();