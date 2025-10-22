// Test script for farmer registration flow
const axios = require('axios');

// Test farmer registration
async function testFarmerRegistration() {
    try {
        console.log('Testing farmer registration flow...\n');
        
        // 1. Register a new farmer
        console.log('1. Registering a new farmer...');
        const registerResponse = await axios.post('http://localhost:3001/api/farmers/register', {
            name: 'Test Farmer',
            phone: '+919876543210',
            village: 'Test Village',
            district: 'Test District',
            crops: 'Tomato, Onion'
        });
        
        console.log('Registration response:', registerResponse.data);
        
        if (registerResponse.data.success) {
            console.log('✅ Farmer registration successful!\n');
            
            // 2. Login as admin
            console.log('2. Logging in as admin...');
            const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
                username: 'admin',
                password: 'admin123'
            });
            
            console.log('Login response:', loginResponse.data);
            
            if (loginResponse.data.success) {
                const token = loginResponse.data.token;
                console.log('✅ Admin login successful!\n');
                
                // 3. Get pending farmers
                console.log('3. Fetching pending farmers...');
                const pendingResponse = await axios.get('http://localhost:3001/api/farmers?status=pending', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                console.log('Pending farmers:', pendingResponse.data);
                
                if (pendingResponse.data.success && pendingResponse.data.farmers.length > 0) {
                    const farmerId = pendingResponse.data.farmers[0]._id;
                    console.log('✅ Found pending farmer!\n');
                    
                    // 4. Approve the farmer
                    console.log('4. Approving farmer...');
                    const approveResponse = await axios.post(
                        `http://localhost:3001/api/farmers/approve/${farmerId}`,
                        {},
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        }
                    );
                    
                    console.log('Approval response:', approveResponse.data);
                    
                    if (approveResponse.data.success) {
                        console.log('✅ Farmer approved successfully!\n');
                        console.log('🎉 All tests passed! Farmer registration flow is working correctly.');
                    } else {
                        console.log('❌ Farmer approval failed');
                    }
                } else {
                    console.log('❌ No pending farmers found');
                }
            } else {
                console.log('❌ Admin login failed');
            }
        } else {
            console.log('❌ Farmer registration failed');
        }
    } catch (error) {
        console.error('Test failed with error:', error.response ? error.response.data : error.message);
    }
}

// Run the test
testFarmerRegistration();