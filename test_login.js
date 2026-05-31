const http = require('http');

const data = JSON.stringify({ email: 'admin@anyaa.com', password: 'admin' });

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  console.log('STATUS:', res.statusCode);
  res.setEncoding('utf8');
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => console.log('BODY:', body));
});

req.on('error', (e) => console.error('REQUEST ERROR:', e));
req.write(data);
req.end();
