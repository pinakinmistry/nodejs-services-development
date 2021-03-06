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

### Create routes

```js
// routes/index.js

const { Router } = require('express')
const router = Router()

const root = `<html>
...
</html>
`

router.get('/', (req, res) => {
  res.send(root)
})

module.exports = router
```

```js
// routes/hello.js

const { Router } = require('express')
const router = Router()

const hello = `<html>
...
</html>`

router.get('/', (req, res) => {
  res.send(hello)
})

module.exports = router
```

```js
// app.js

const indexRoutes = require('./routes')
const helloRoutes = require('./routes/hello')

const app = express()

app.use('/', indexRoutes)
app.use('/hello', helloRoutes)
```

```js
res.sendFile('<file-name-with-extension>') // static content
res.render('<view-file-name-without-extension>', { variables }) // dynamic content
```

## Fastify

```cmd
node -e "fs.mkdirSync('fastify-web-server')"
cd fastify-web-server
npm init fastify
npm install
```

```js
// app.js

const path = require('path')
const AutoLoad = require('fastify-autoload')

module.exports = async function (fastify, opts) {
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts)
  })

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({}, opts)
  })
}
```

### Routes

```js
// routes/root.js

const root = `<html>
...
</html>
`

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    reply.type('text/html')
    return root
  })
}
```

### Error handling

```js
// app.js

const path = require('path')
const AutoLoad = require('fastify-autoload')

module.exports = async function (fastify, opts) {

  // fastify.register(...)

  fastify.setNotFoundHandler((request, reply) => {
    if (request.method !== 'GET') {
      reply.status(405)
      return 'Method Not Allowed\n'
    }
    return 'Not Found\n'
  })

}
```

### Static content

```cmd
npm install --save-dev fastify-static
```

```js
// app.js

const path = require('path')
const AutoLoad = require('fastify-autoload')

const dev = process.env.NODE_ENV !== 'production'

const fastifyStatic = dev && require('fastify-static')

module.exports = async function (fastify, opts) {
  if (dev) {
    fastify.register(fastifyStatic, {
      root: path.join(__dirname, 'public')
    })
  }
  // ...
}
```

```html
<!-- public/index.html -->
<html>
...
</html>
```

```html
<!-- public/hello.html -->
<html>
...
</html>
```

### Route with static content

```js
// routes/hello/index.js

module.exports = async (fastify, opts) => {
  fastify.get('/', async (request, reply) => {
    return reply.sendFile('hello.html')
  })
}
```

### Using templates

```cmd
npm install point-of-view handlebars
```

```js
// app.js

const path = require('path')
const AutoLoad = require('fastify-autoload')

const pointOfView = require('point-of-view')
const handlebars = require('handlebars')

module.exports = async function (fastify, opts) {

  fastify.register(pointOfView, {
    engine: { handlebars },
    root: path.join(__dirname, 'views'),
    layout: 'layout.hbs'
  })
  // ...
}
```

```html
<!-- view/layout.html -->
<html>
  ...
  <body>
    {{{ body }}}
  </body>
</html>
```

```html
<!-- views/index.hbs -->
<a href='/hello'>Hello</a><br>
<a href='/hello?greeting=Ahoy'>Ahoy</a>
```

```html
<!-- views/hello.hbs -->
<h1>{{ greeting }} World</h1>
```

```js
// routes/root.js

module.exports = async (fastify, opts) => {
  fastify.get('/', async (request, reply) => {
    return reply.view('index.hbs')
  })
}
```

```js
// routes/hello/index.js

module.exports = async (fastify, opts) => {
  fastify.get('/', async (request, reply) => {
    const { greeting = 'Hello '} = request.query
    return reply.view(`hello.hbs`, { greeting })
  })
}
```

### Static content with Express

```cmd
npm install -g express-generator@4

express --hbs express-web-server

cd express-web-server
npm install
```

```js
// app.js

if (process.env.NODE_ENV !== 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
}
```

```html
<!-- views/layout.hbs -->

<html>
  ...
  <body>
    {{{ body }}}
  </body>
</html>

<!-- views/index.hbs -->

<a href='/hello'>Hello</a><br>
<a href='/hello?greeting=Ahoy'>Ahoy</a>

<!-- views/hello.hbs -->

<h1>{{ greeting }} World</h1>
```

```js
// routes/index.js

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});
module.exports = router;
```

```js
// routes/hello.js

var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  var greeting = 'greeting' in req.query ?
    req.query.greeting :
    'Hello';
  res.render('hello', { greeting: greeting });
});

module.exports = router;
```

```js
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

### Streaming with Fastify

```js
// routes/articles/index.js

const hnLatestStream = require('hn-latest-stream')

module.exports = async (fastify, opts) => {
  fastify.get('/', async (request, reply) => {
    const { amount = 10, type = 'html' } = request.query

    if (type === 'html') reply.type('text/html')
    if (type === 'json') reply.type('application/json')
    return hnLatestStream(amount, type)
    // or
    // reply.send(hnLatestStream(amount, type))
  })
}
```

### Streaming with Express

```js
// routes/articles.js

var express = require('express');
var router = express.Router();
var hnLatestStream = require('hn-latest-stream')
var finished = require('stream').finished

router.get('/', function(req, res, next) {
  const { amount = 10, type = 'html' } = req.query

  if (type === 'html') res.type('text/html')
  if (type === 'json') res.type('application/json')

  const stream = hnLatestStream(amount, type)

  stream.pipe(res, {end: false})

  finished(stream, (err) => {
    if (err) {
      next(err)
      return
    }
    res.end()
  })

});

module.exports = router;
```
