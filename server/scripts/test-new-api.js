
const http = require('http');

console.log('Testing /api/hierarchy...');
http.get('http://localhost:5000/api/hierarchy', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ /api/hierarchy Response Code:', res.statusCode);
      try {
        const json = JSON.parse(data);
        console.log('Sample Portfolio:', json[0]?.name);
        console.log('Sample Building:', json[0]?.buildings[0]);
      } catch (e) {
        console.log('Response not JSON:', data.substring(0, 100));
      }
    } else {
        console.log('❌ Failed /api/hierarchy:', res.statusCode, data);
    }
  });
}).on('error', (err) => {
  console.log('❌ Error connecting to server:', err.message);
});
