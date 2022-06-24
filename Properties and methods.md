# http vs Express vs Fastify properties and methods

## http core module

### Basic

```js
// server.js

const http = require('http')
const PORT = process.env.PORT || 3000

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html')
  res.statusCode = 200  // Optional
  res.end('<html or any string>')
})

server.listen(PORT)
```

### Routes and error handling

```js
// server.js

const url = require('url')
const http = require('http')
const PORT = process.env.PORT || 3000
const { STATUS_CODES } = http

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html')
  if (req.method !== 'GET') {
    res.statusCode = 405
    res.end(STATUS_CODES[res.statusCode] + '\r\n')
    return
  }
  const { pathname } = url.parse(req.url)
  if (pathname === '/') {
    res.end(root)
    return
  }
  if (pathname === '/hello') {
    res.end(hello)
    return
  }
  res.statusCode = 404
  res.end(STATUS_CODES[res.statusCode] + '\r\n')
})
```

// Fastify
reply.status(200)
// or
reply.code(200)

reply.type('text/html')
return '<string>'
fastify.setNotFoundHandler((req, reply) => {
  reply.status(405)
  return '...'
})
return reply.sendFile('file-name-with-extension') // static content
return reply.view('<view-file-name-with-extension>', { variables }) // dynamic content

```
