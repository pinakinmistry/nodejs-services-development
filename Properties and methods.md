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

## Express

### Folder structure

- express-server
  |- routes
     |- index.js
     |- hello.js
  |- bin
     |- www
  |- app.js

```cmd
npm init -y
npm install express@4 http-errors@2
```

```js
// package.json

"scripts": {
  "test": "echo \"Error: no test specified\" && exit 1",
  "start": "node ./bin/www"
},
```

```js
// app.js

'use strict'
const express = require('express')
const app = express()

module.exports = app
```

```js
// bin/www

#!/usr/bin/env node
'use strict'

const app = require('../app')
const http = require('http')
const PORT = process.env.PORT || 3000
const server = http.createServer(app)

server.listen(PORT)
```

```cmd
npm start

http://localhost:3000
Output: Cannot GET /
```

### Error handling

```js
// app.js

'use strict'
const express = require('express')
const createError = require('http-errors')

const app = express()

// Second last middleware
app.use((req, res, next) => {
  if (req.method !== 'GET') {
    next(createError(405))
    return
  }
  next(createError(404))
})

// Last middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.send(err.message)
})

module.exports = app
```

```js
res.sendFile('<file-name-with-extension>') // static content
res.render('<view-file-name-without-extension>', { variables }) // dynamic content

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
