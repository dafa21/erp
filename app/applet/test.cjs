const fetch = require('node-fetch'); // or use native fetch
async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/settings/backup', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 1'
      }
    });
    console.log(res.status);
    console.log(await res.text());
  } catch (e) {
    console.error(e);
  }
}
test();
