// Simulate what the frontend does
const API_BASE_URL = 'http://localhost:3001';

async function testFrontendAPI() {
    try {
        console.log('Testing frontend API calls...');
        
        // Simulate login and get token
        console.log('1. Logging in as admin...');
        const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'nihan9t9',
                password: '1234'
            })
        });
        
        const loginData = await loginResponse.json();
        if (!loginData.success) {
            console.error('Login failed:', loginData.message);
            return;
        }
        
        const token = loginData.token;
        console.log('✅ Admin login successful!');
        
        // Simulate getting pending farmers (like the frontend does)
        console.log('2. Fetching pending farmers...');
        const pendingResponse = await fetch(`${API_BASE_URL}/api/farmers?status=pending`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const pendingData = await pendingResponse.json();
        console.log('✅ Pending farmers response:', pendingData);
        
        if (pendingData.success && pendingData.farmers && pendingData.farmers.length > 0) {
            const farmer = pendingData.farmers[0];
            console.log('3. Found farmer to approve:', farmer.name);
            
            // Simulate approving a farmer (like the frontend does)
            console.log('4. Approving farmer...');
            const approveResponse = await fetch(`${API_BASE_URL}/api/farmers/approve/${farmer._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const approveData = await approveResponse.json();
            console.log('✅ Approval response:', approveData);
        } else {
            console.log('ℹ️ No pending farmers to approve');
        }
        
    } catch (error) {
        console.error('❌ Error in frontend API test:', error.message);
    }
}

testFrontendAPI();