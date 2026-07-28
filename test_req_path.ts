import express from 'express';
const app = express();
app.use('/api', (req, res, next) => {
  console.log("req.path inside middleware:", req.path);
  res.send('ok');
});
app.get('/api/test', (req, res) => res.send('test'));

const server = app.listen(3001, async () => {
    const fetch = (await import('node-fetch')).default;
    await fetch('http://localhost:3001/api/test');
    server.close();
});
