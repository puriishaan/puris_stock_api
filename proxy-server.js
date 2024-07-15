const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();

const sslOptions = {
  key: fs.readFileSync(path.resolve(__dirname, 'localhost-key.pem')),
  cert: fs.readFileSync(path.resolve(__dirname, 'localhost.pem'))
};

app.use(
  '/',
  createProxyMiddleware({
    target: 'http://localhost:3000', // Your Nitro server URL
    changeOrigin: true,
    secure: false
  })
);

https.createServer(sslOptions, app).listen(3443, () => {
  console.log('HTTPS Proxy server running at https://localhost:3443/');
});
