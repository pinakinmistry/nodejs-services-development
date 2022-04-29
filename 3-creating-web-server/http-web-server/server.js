'use strict'

const http = require('http');
const port = process.env.PORT || 3000;
const url = require('url');
const { STATUS_CODES } = http;

const root = `<html>
  <head>
    <style>
      body { background: #333; margin: 1.25rem; }
      h1 { color: #eee; }
    </style>
  </head>
  <body>
    <a href="/hello">Hello</a1>
  </body>
</html>`;

const hello = `<html>
  <head>
    <style>
      body { background: #333; margin: 1.25rem; }
      h1 { color: #eee; }
    </style>
  </head>
  <body>
    <h1>Hello World</h1>
  </body>
</html>`;

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html');

  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.end(STATUS_CODES[res.statusCode]);
  }

  const { pathname } = url.parse(req.url);

  if (pathname === '/') {
    res.end(root);
  } else if (pathname === '/hello') {
    res.end(hello);
  } else {
    res.statusCode = 404;
    res.end(STATUS_CODES[res.statusCode]);
  }

});

server.listen(port);