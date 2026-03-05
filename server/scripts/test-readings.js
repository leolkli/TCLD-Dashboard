
const http = require('http');

const testCode = '6Bz2i2-1053-1053_ns=1;s=BACnetIP1.Channel_1.2850829.APEdtB-1301-2PJ-KWHimp-1787122'; // From inspect output

console.log('Testing /api/readings...');
const url = `http://localhost:5000/api/readings?code=${encodeURIComponent(testCode)}`;

http.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ /api/readings Response Code:', res.statusCode);
      try {
        const json = JSON.parse(data);
        console.log('Count:', json.count);
        if (json.data && json.data.length > 0) {
            console.log('Sample Reading:', json.data[0]);
        } else {
            console.log('No readings returned (Fact table might be empty for this tag)');
        }
      } catch (e) {
        console.log('Response not JSON:', data.substring(0, 100));
      }
    } else {
        console.log('❌ Failed /api/readings:', res.statusCode, data);
    }
  });
}).on('error', (err) => {
  console.log('❌ Error connecting to server:', err.message);
});
