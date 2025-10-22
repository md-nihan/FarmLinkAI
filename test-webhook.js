// Test WhatsApp webhook
const http = require('http');
const querystring = require('querystring');

// Simulate a WhatsApp webhook POST request
const postData = querystring.stringify({
  'From': 'whatsapp:+919845325913',
  'Body': 'Test Product 5 kg',
  'NumMedia': '0'
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/whatsapp',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  res.on('data', (chunk) => {
    console.log(`Body: ${chunk}`);
  });
  
  res.on('end', () => {
    console.log('Request completed');
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();