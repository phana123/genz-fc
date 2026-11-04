const http = require('http');
const fs = require('fs');

// First, get CSRF cookie
const getCsrf = () => new Promise((resolve, reject) => {
  const req = http.request({ hostname: '127.0.0.1', port: 8000, path: '/sanctum/csrf-cookie', method: 'GET', headers: { 'Origin': 'http://localhost:5173' } }, (res) => {
    let cookies = res.headers['set-cookie'] || [];
    resolve({ cookies, status: res.statusCode });
  });
  req.on('error', reject);
  req.end();
});

getCsrf().then(({ cookies }) => {
  const xsrfCookie = cookies.find(c => c.startsWith('XSRF-TOKEN='));
  const xsrfToken = decodeURIComponent(xsrfCookie.split(';')[0].split('=')[1]);
  const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');
  
  // Login
  const loginData = JSON.stringify({ email: 'admin@genzfc.com', password: 'genzFC@123' });
  const loginReq = http.request({ hostname: '127.0.0.1', port: 8000, path: '/api/login', method: 'POST', headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': xsrfToken, 'Origin': 'http://localhost:5173', 'Accept': 'application/json', 'Cookie': cookieHeader } }, (res) => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
      console.log('Login:', res.statusCode, body.substring(0, 80));
      const newCookies = res.headers['set-cookie'] || [];
      const allCookies = [...cookies, ...newCookies].map(c => c.split(';')[0]).join('; ');
      
      // Now test profile update with multipart
      const boundary = '----FormBoundary' + Math.random().toString(36).substring(2);
      const body2 = [
        `--${boundary}`,
        'Content-Disposition: form-data; name="name"',
        '',
        'Test Admin Updated',
        `--${boundary}`,
        'Content-Disposition: form-data; name="email"',
        '',
        'admin@genzfc.com',
        `--${boundary}`,
        'Content-Disposition: form-data; name="_method"',
        '',
        'PUT',
        `--${boundary}--`,
      ].join('\r\n');
      
      const profileReq = http.request({ hostname: '127.0.0.1', port: 8000, path: '/api/profile', method: 'POST', headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}`, 'X-XSRF-TOKEN': xsrfToken, 'Origin': 'http://localhost:5173', 'Accept': 'application/json', 'Cookie': allCookies, 'Content-Length': Buffer.byteLength(body2) } }, (res2) => {
        let body3 = '';
        res2.on('data', d => body3 += d);
        res2.on('end', () => {
          console.log('Profile update:', res2.statusCode, body3.substring(0, 200));
        });
      });
      profileReq.on('error', e => console.error('Profile error:', e.message));
      profileReq.write(body2);
      profileReq.end();
    });
  });
  loginReq.on('error', e => console.error('Login error:', e.message));
  loginReq.write(loginData);
  loginReq.end();
}).catch(e => console.error('CSRF error:', e.message));
