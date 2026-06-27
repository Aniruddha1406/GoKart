import axios from 'axios';

async function testAuth() {
    const timestamp = Date.now();
    const email = `test${timestamp}@example.com`;
    const password = 'password123';
    const role = 'customer';
    
    try {
        console.log('Registering...');
        const regRes = await axios.post('http://localhost:3000/api/auth/register', {
            username: 'Test User',
            email,
            password,
            role
        });
        console.log('Register Success:', regRes.data);
        
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            email,
            password,
            role
        });
        console.log('Login Success:', loginRes.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

testAuth();
