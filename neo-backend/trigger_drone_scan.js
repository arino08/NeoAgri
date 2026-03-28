const http = require('http');

const data = JSON.stringify({
  phone: "2222222222", 
  farm_id: "farm-hq",
  drone_id: "drone-01",
  captures: [
    {
      capture_id: require('crypto').randomUUID(),
      latitude: 23.0 + (Math.random() * 0.1),
      longitude: 72.0 + (Math.random() * 0.1),
      timestamp_utc: new Date().toISOString(),
      model_result: { disease: "Yellow_Rust", confidence: 0.94 },
      leaf_image_b64: "base64_dummy_image_data_here"
    }
  ]
});

const req = http.request({
  hostname: '127.0.0.1',
  port: 3000,
  path: '/session/create',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('✅ Drone Payload Successfully Pushed:', body));
});

req.on('error', (e) => console.error('❌ Error hitting backend:', e));
req.write(data);
req.end();
