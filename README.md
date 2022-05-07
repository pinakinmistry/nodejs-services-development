# NodeJS Services Development

## David Mark Clements

Node Cookbook: Actionable Solutions for the Full Spectrum of Node.js 8 Development

## Objective

Understand foundational essentials for creating web servers.
Explain how HTTP works at a Node core API level.
Understand and leverage ecosystem frameworks for rapid composability.
Cover essential RESTful practices and gain practical working knowledge of implementing RESTful services.
Develop the skill of server and service composition.

## 2. Setup

It's strongly recommended that if Node is installed via an Operating System Package Manager or directly via the website, that it be completely uninstalled. OS specific package managers tend to lag behind the faster Node.js release cycle. Additionally the placement of binary and config files and folders isn't standardized across OS package managers and can cause compatibility issues.
Also, installing global modules with Node's module installer (npm) tends to require the use of sudo (a command which grants root privileges) on non-Windows systems. This is not an ideal setup for a developer machine and granting root privileges to the install process of third-party libraries is not a good security practice.

The recommended way to install Node.js on macOS and Linux is by using a Node version manager, in particular nvm.

The way to install nvm is via the install script at https://github.com/nvm-sh/nvm/blob/v0.39.1/install.sh. If curl is installed (it usually is) a single command can be used to install and setup nvm:

curl -o- ht‌tps://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash

If using zsh (e.g. on newer macOS releases) the bash part of the command can be replaced with zsh.

Alternatively the file can be downloaded and saved, and then easily executed like so:

cat install.sh | bash

export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm

nvm install 16

node -v

While nvm is recommended for macOS and Linux, and there is an unaffiliated nvm-windows version manager the recommended version manager for Windows is nvs. The nvs version manager is actually cross-platform so can be used on macOS and Linux but nvm is a lot more popular.

nvs add 16

nvs use 16

## 3. Creating web server

### With Node Core

```cmd
node -e "fs.mkdirSync('http-web-server')"
cd http-web-server
```

```js
// server.js

'use strict'
const http = require('http')
const PORT = process.env.PORT || 3000

const hello = `<html>
  <head>
    <style>
     body { background: #333; margin: 1.25rem }
     h1 { color: #EEE; font-family: sans-serif }
    </style>
  </head>
  <body>
    <h1>Hello World</h1>
  </body>
</html>`

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html')
  res.end(hello)
})

server.listen(PORT)
```

```cmd
node server.js
```

The res object inherits from http.ServerResponse which in turn inherits from http.OutgoingMessage (a Node core internal constructor) which then inherits from stream.Stream. For all practical purposes the res object is a writable stream, which is why calling end writes our content and also closes the connection.

```js
// server.js

'use strict'
const url = require('url')
const http = require('http')
const PORT = process.env.PORT || 3000
const { STATUS_CODES } = http

const hello = `<html>
  <head>
    <style>
     body { background: #333; margin: 1.25rem }
     h1 { color: #EEE; font-family: sans-serif }
   </style>
  </head>
  <body>
    <h1>Hello World</h1>
  </body>
</html>`

const root = `<html>
<head>
  <style>
   body { background: #333; margin: 1.25rem }
   a { color: yellow; font-size: 2rem; font-family: sans-serif }
  </style>
</head>
<body>
  <a href='/hello'>Hello</a>
</body>
</html>
`

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

server.listen(PORT)
```

```cmd
node server.js
```

STATUS_CODES object contains key-values of status codes to HTTP status messages, from the http module.

The Node core url module has a parse method which turns a URL string into an object containing various segments of the URL, such as host, protocol and pathname.

The req.url property has a slightly misleading name. It does not hold the entire URL of an incoming request, only the relative path after the host portion. For instance a request to ht‌tp://localhost:3000/hello will result in a req.url of /hello. The reason we pass req.url to url.parse is to separate any potential query string from the URL. Now, let's consider a request to ht‌tp://localhost:3000/hello?foo=1. It would result in a req.url value of /hello?foo=1. Passing such a string to url.parse will result in an object with a pathname property of /hello.

default res.statusCode is 200 (OK).

```cmd
node -e "ht‌tp.request('ht‌tp://localhost:3000', {method: 'POST'}, (res) => res.pipe(process.stdout)).end()"
```

This procedural approach can become very rigid and unwieldy if we were to attempt to extend functionality over time. In the next sections we'll learn how to use the Express and Fastify frameworks to achieve the same results in a more flexible, declarative manner.

### With Express

Express is one of the most widely used Node.js frameworks. More so when it comes to generating and delivering HTML dynamically, as opposed to delivering RESTful JSON content as a service.

Even after the release of the next major version (Express 5, last alpha was two years ago, ETA unknown), understanding version 4 is essential from a pragmatic perspective since so many legacy code bases have been built using Express 3 and 4, which are fairly similar to each other.

```cmd
node -e "fs.mkdirSync('express-web-server')"
cd express-web-server
node -e "fs.mkdirSync('routes')"
node -e "fs.mkdirSync('bin')"
node -e "fs.openSync('app.js', 'w')"
cd routes
node -e "fs.openSync('index.js', 'w')"
node -e "fs.openSync('hello.js', 'w')"
cd ../bin
node -e "fs.openSync('www', 'w')"
cd ..

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

#### Define route

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

Configuring an Express servers' behavior is almost always performed with app.use (where app is the Express instance). The app.use method takes a function which is very similar to the function that is passed to http.createServer. The function will be called for every incoming request, and it will be passed a request object and a response object.

The difference between the function passed to app.use and the function passed to http.createServer is that it can also have a third parameter called next. This is an error-first callback function that is called when the function passed to app.use has completed any tasks and is ready to handover to the subsequent function registered via app.use. So this means that instead of passing one big function to http.createServer, multiple functions can be registered via app.use. They will be called in order of registration, each one handing over to the following one when it's done processing. If the next function is not called, then the request handling ends there and none of the ensuing registered functions are called for that request. This approach is known as the middleware pattern. The building blocks for configuring an Express server are middleware functions.

The first middleware function we registered should always be the second-to-last middleware. Essentially, if this middleware has been reached then we can assume that no routes were matched. Therefore we generate a 404 error using the http-errors module (part of the Express ecosystem). The http-errors module will generate an appropriate message for any HTTP status code passed to it. We then pass this error object as the first argument to the next callback function, which let’s Express know that an error has occurred. We may also pass a 405 (Method Not Allowed) error instead, if we find that the req.method property does not have the value of GET. This matches the functionality in our HTTP server implementation from the first section. Currently, we have no routes registered, so a 404 error is the default for any HTTP GET requests.

The very last piece of middleware in our modified app file should always be the final piece of middleware. This registered middleware specifies four parameters instead of the usual three. This makes Express recognize the middleware as the final error handling middleware and passes the error object that we pass to next in the prior middleware as the first argument of this special error-handling middleware function. From there we can grab the HTTP status code from the error object and use it to set the response status code. Notice that we use a `res.status()` function instead of the res.statusCode property. Similarly, we can use `res.send()` instead of `res.end()` to write and end the response. This is another method added by Express that will detect the Content-Type from the input, and potentially perform additional operations. For instance, if an object was passed to res.send that object would be serialized to JSON and the response Content-Type would automatically be set to application/json.

Even though the req and res objects are generated by the http module and have all of the same functionality, Express decorates the req and res objects with additional functionality. We could not have used `res.status()` or `res.send()` in the previous section because these functions did not exist. Some, including this author, view Express' decorator approach on core APIs as a mistake. By conflating Node core APIs with Express APIs on the same objects the principles of least surprise and separation of concerns are violated, while also causing performance issues. However, so much legacy code has been written with Express it's important to understand its APIs.

#### Create routes

```js
// routes/index.js

'use strict'
const { Router } = require('express')
const router = Router()

const root = `<html>
<head>
  <style>
   body { background: #333; margin: 1.25rem }
   a { color: yellow; font-size: 2rem; font-family: sans-serif }
  </style>
</head>
<body>
  <a href='/hello'>Hello</a>
</body>
</html>
`

router.get('/', (req, res) => {
  res.send(root)
})

module.exports = router
```

```js
// routes/hello.js

'use strict'
const { Router } = require('express')
const router = Router()

const hello = `<html>
  <head>
    <style>
     body { background: #333; margin: 1.25rem }
     h1 { color: #EEE; font-family: sans-serif }
    </style>
  </head>
  <body>
    <h1>Hello World</h1>
  </body>
</html>`

router.get('/', (req, res) => {
  res.send(hello)
})

module.exports = router
```

Note that we define the route path as / in this case as well, instead of /hello. This is because we'll be mounting this router at the /hello route path in app.js instead. This pattern allows for easy renaming of routes at the top level.

```js
// app.js

'use strict'
const express = require('express')
const createError = require('http-errors')
const indexRoutes = require('./routes')
const helloRoutes = require('./routes/hello')

const app = express()

app.use('/', indexRoutes)
app.use('/hello', helloRoutes)

app.use((req, res, next) => {
  if (req.method !== 'GET') {
    next(createError(405))
    return
  }
  next(createError(404))
})

app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.send(err.message)
})

module.exports = app
```

## Fastify

Fastify is a new framework in Node ecosystem. It is specifically geared towards creating RESTful JSON services but can also be used for serving HTML.

Instead of middleware, Fastify supports a plugin-based pattern which provides full code isolation and encapsulation.

It supports newer language features (such as async/await), has a focus on modern developer experience and is the most performant framework in the Node.js ecosystem. It also provides full Express integration via the `fastify-express` plugin. This means that the vast Express ecosystem can be used with Fastify (often at higher requests per second than using the same middleware with Express!), and entire Express projects can be encapsulated in a Fastify plugin and used as part of a Fastify project.

```cmd
node -e "fs.mkdirSync('fastify-web-server')"
cd fastify-web-server
npm init fastify
npm install
```

```cmd
// --integrate flag can be executed in a directory with a package.json file to generate a project and also // update the preexisting package.json file:
npm init fastify -- --integrate
```

The npm init fastify command which generates a Fastify project uses fastify-cli to start the application, which automatically allows the PORT environment variable to specify the port.

```js
// app.js

'use strict'

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

A Fastify plugin is a function that accepts a server instance and options as parameters. It may accept a third parameter, a next callback or it may return a promise (which is what an async function does). So the app.js file is actually exporting a Fastify plugin.

The server instance that is passed as the first argument to this function is named fastify. Additional plugins are registered with the registered method. In this case, a single plugin is registered twice. The fastify-autoload plugin automatically loads folders of plugins, so all app.js is doing is setting up a convenient way for us to define and work with plugins and routes. In both cases where fastify.register is called, the fastify-autoload plugin (AutoLoad) is passed as the first parameter and an object is passed as the second parameter. This second parameter is the options for the AutoLoad plugin. The dir option in each case points the fastify-autoload plugin to a plugins folder and a routes folder. The options option in each case specifies options that would be passed to all plugins that are autoloaded. It's essentially shallow merging the options passed to the app.js plugin function with an empty object.

```js
// package.json

{
  "name": "bah",
  "version": "1.0.0",
  "description": "This project was bootstrapped with Fastify-CLI.",
  "main": "app.js",
  "directories": {
    "test": "test"
  },
  "scripts": {
    "test": "tap \"test/**/*.test.js\"",
    "start": "fastify start -l info app.js",
    "dev": "fastify start -w -l info -P app.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "fastify": "^3.0.0",
    "fastify-autoload": "^3.10.0",
    "fastify-cli": "^2.15.0",
    "fastify-plugin": "^3.0.0",
    "fastify-sensible": "^3.1.2"
  },
  "devDependencies": {
    "tap": "^15.1.6"
  }
}
```

```cmd
npm run dev
```

In Fastify, everything is a plugin. The distinction between plugins and routes is mostly convention-setting to help us reason about a server or service's functionality. The files in the routes folder are actually plugins (exported functions that return promises or use a next callback). The files in the plugins folder are also plugins, but they are more commonly de-encapsulated plugins, meaning that the functionality that they provide can be accessed by sibling plugins. Think of the plugins folder like a lib folder, but where a strict and enforceable common interface is used for every exported piece of functionality. The entry point is a plugin. Routes are plugins. Plugins (local libraries) are plugins.

A key difference between Express middleware and Fastify plugins is that Express middleware is executed for every request (if reachable) but Fastify plugins are called only at initialization time. Fastify plugins are always asynchronous (either with a callback or a returned promise) to allow for asynchronous initialization of every plugin.

```js
// routes/root.js

'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    return { root: true }
  })
}
```

The fastify.get method can accept a normal synchronous function or an async function. Whatever is returned from the function or async function is automatically processed and sent as the content of the HTTP response.

Alternatively the reply.send method can be used (e.g. reply.send({root: true})), which is similar to the res.send method of Express. This can be useful when working with nested callback APIs.

```js
// routes/root.js

'use strict'

const root = `<html>
<head>
  <style>
   body { background: #333; margin: 1.25rem }
   a { color: yellow; font-size: 2rem; font-family: sans-serif }
  </style>
</head>
<body>
  <a href='/hello'>Hello</a>
</body>
</html>
`

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    reply.type('text/html')
    return root
  })
}
```

```js
// routes/example/index.js

'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    return 'this is an example'
  })
}
```

When a route is defined in a subfolder, by default, the fastify-autoload plugin will register that route prefixed with the name of the subfolder. So the example route is at routes/examples/index.js and registers a route at /. This causes fastify-autoload to register the server route at /example. If the route passed to fastify.get in routes/example/index.js had been /foo then fastify-autoload would have registered that route at /example/foo.

```cmd
cd routes
node -e "fs.renameSync('example', 'hello')"
```

```js
// routes/hello/index.js

'use strict'

const hello = `<html>
  <head>
    <style>
     body { background: #333; margin: 1.25rem }
     h1 { color: #EEE; font-family: sans-serif }
    </style>
  </head>
  <body>
    <h1>Hello World</h1>
  </body>
</html>`

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    reply.type('text/html')
    return hello
  })
}
```

```js
// app.js

'use strict'

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

  fastify.setNotFoundHandler((request, reply) => {
    if (request.method !== 'GET') {
      reply.status(405)
      return 'Method Not Allowed\n'
    }
    return 'Not Found\n'
  })

}
```

## 4. Serving web content

Static assets (content that does not change very often) should not be served by Node. Static content should be delivered via a CDN and/or a caching reverse proxy that specializes in static content such as NGINX or Varnish

Node.js could serve static content for applications with very small user bases that have a very low growth potential

Where Node.js shines however, is dynamic content. Using Node.js as a mediator for gathering data from multiple sources and rendering some output is perfect for such an evented language and non-blocking I/O platform

## Objectives

Learn how to serve static content with Fastify and Express.
Understand the benefits of streaming and how to use it with Fastify and Express.
Generate dynamic content with template engines in Fastify and Express.

## Serving static content with Fastify

```cmd
npm install --save-dev fastify-static
```

```js
// app.js

'use strict'

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

```cmd
node -e "fs.mkdirSync('public')"
cd public
node -e "fs.openSync('index.html', 'w')"
node -e "fs.openSync('hello.html', 'w')"
cd ..
cd routes
node -e "fs.unlinkSync('root.js')"
node -e "fs.rmdirSync('hello', {recursive: true})"
cd ..
```

```html
<!-- public/index.html -->
<html>
<head>
  <style>
   body { background: #333; margin: 1.25rem }
   a { color: yellow; font-size: 2rem; font-family: sans-serif }
  </style>
</head>
<body>
  <a hr‌ef='/hello.html'>Hello</a>
</body>
</html>
```

```html
<!-- public/hello.html -->
<html>
  <head>
    <style>
     body { background: #333; margin: 1.25rem }
     h1 { color: #EEE; font-family: sans-serif }
    </style>
  </head>
  <body>
    <h1>Hello World</h1>
  </body>
</html>
```

```cmd
npm run dev
```

The fastify-static module also decorates the reply object with sendFile method. We can use this to create a route that manually responds with the contents of hello.html if we wanted to alias /hello.html to /hello.

```cmd
cd routes
node -e "fs.mkdirSync('hello')"
cd hello
node -e "fs.openSync('index.js', 'w')"
cd ..
cd ..
```

```js
// routes/hello/index.js

'use strict'

module.exports = async (fastify, opts) => {
  fastify.get('/', async (request, reply) => {
    return reply.sendFile('hello.html')
  })
}
```

## Using templates with Fastify and HandlebarJS

While the primary and original focus of Fastify was for building data services, view rendering capability is available with a little bit of set up.

In the terminal, with fastify-web-server as the current working directory let's run the following command in order to install a template engine and Fastify's view rendering plugin:

```cmd
npm install point-of-view handlebars
```

Handlebars is one of the template engines that point-of-view supports.

```js
// app.js

'use strict'

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

We've removed fastify-static which we introduced in the prior section, and with it the dev constant which we won't need for this case because our server will now be performing on-the-fly dynamic rendering.

```cmd
node -e "fs.mkdirSync('views')"
cd views
node -e "fs.openSync('index.hbs', 'w')"
node -e "fs.openSync('hello.hbs', 'w')"
node -e "fs.openSync('layout.hbs', 'w')"
cd ..
node -e "fs.rmdirSync('public', {recursive: true})"
```

```html
<!-- view/layout.html -->
<html>
  <head>
    <style>
     body { background: #333; margin: 1.25rem }
     h1 { color: #EEE; font-family: sans-serif }
     a { color: yellow; font-size: 2rem; font-family: sans-serif }
    </style>
  </head>
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

```cmd
cd routes
node -e "fs.openSync('root.js', 'w')"
```

```js
// routes/root.js

'use strict'

module.exports = async (fastify, opts) => {
  fastify.get('/', async (request, reply) => {
    return reply.view('index.hbs')
  })
}
```

```js
// routes/hello/index.js

'use strict'

module.exports = async (fastify, opts) => {
  fastify.get('/', async (request, reply) => {
    const { greeting = 'Hello '} = request.query
    return reply.view(`hello.hbs`, { greeting })
  })
}
```

Using three braces to denote an interpolation point is Handlebars syntax that instructs the template engine to conduct raw interpolation.

In other words, if the body template local contains HTML syntax the content will not be escaped whereas using two braces would cause HTML syntax to be escaped (for instance < would be escaped to &‌lt;). This should never be used when interpolating (uncleaned) user input into templates but when building a layout we need to inject raw HTML.

The body local is created automatically by point-of-view when rendering a view because we specified the layout option.

The point-of-view plugin that we registered in app.js decorated the reply instance with a view method. When we registered point-of-view, we set the root option to the views folder. Therefore, when we pass 'index.hbs' to reply.view it knows to look for index.hbs in the view folder. Similarly, the layout option that we set to 'layout.hbs' indicates to point-of-view that the layout template can be found in views/layout.hbs. So when we use reply.view here point-of-view first renders both the views/index.hbs file and then interpolates the rendered output into views/layout.hbs and sends the final rendered output of both files combined as the response. The return value of the reply.view method must be returned from the async function passed as the route handler so that Fastify knows when the route handler has finished processing the request.

The reply.view method can take a second parameter, an object which sets the values of the template locals. Recall that views/hello.hbs contains a greeting template local, we pass an object with a property called greeting and a value defaulting to 'Hello' or else the value of a URL query string key named greeting. For instance, a request to /hello?greeting=Ahoy would result in the greeting constant being set to 'Ahoy' for that request.

## Serving static content and using templates with Express

The original focus of the Fastify framework was on building RESTful JSON services, whereas Express is more geared towards template rendering (and static serving static content). Therefore Express has these pieces built into its core whereas in Fastify template rendering is an add-on.

We'll use the express-generator command-line utility to generate a new project with view rendering and static asset serving preconfigured.

```cmd
npm install -g express-generator@4

express --hbs express-web-server

cd express-web-server
npm install
```

The express command-line executable that's installed by the express-generator module when globally installed generates a bin/www file that similarly allows the port to be specified via a PORT environment variable

The express-generator generated the following files and folders:

app.js
package.json
routes/index.js
routes/users.js
public/images
public/javascripts
public/stylesheets/style.css
views/error.hbs
views/index.hbs
views/layout.hbs

```js
// app.js

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/users', userRouter);
```

express instance has a method named static which returns Express middleware that will serve requests that match up with any files in the public folder. This will serve files both in development and production environments which is recommended against. To reinforce this point, let's alter the the last line in our snippet from app.js to the following:

```js
// app.js

if (process.env.NODE_ENV !== 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
}
```

Now static hosting will only occur in development and production static hosting is left as a deployment infrastructure problem.

In Express the app.set method can be used to store state as key-values. In this specific case the 'views' key and the 'view engine' key are both special-cased key names that instruct Express to load views from a particular path and use a particular view engine respectively.

```cmd
cd views
node -e "fs.openSync('hello.hbs', 'w')"
cd ..

cd routes
node -e "fs.renameSync('users.js', 'hello.js')"
cd ..
```

```html
<!-- views/layout.hbs -->

<html>
  <head>
    <style>
     body { background: #333; margin: 1.25rem }
     h1 { color: #EEE; font-family: sans-serif }
     a { color: yellow; font-size: 2rem; font-family: sans-serif }
    </style>
  </head>
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

Express has `res.render()` built-in to its core and it works in essentially the same way as reply.render added by the point-of-view plugin when registered in a Fastify server - although at the time of writing Express v4 renders at about half the speed of Fastify's point-of-view in production.

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

```cmd
npm start
```

## http vs Express vs Fastify properties and methods

```js
// http
res.statusCode = 200
res.end('<string>')

// Express
res.status(200)
res.send('<string>')
app.use((req, res, next) => {
  next(createError(404|405))
  return
})
app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.send(err.message)
})
res.sendFile('<file-name-with-extension>') // static content
res.render('<view-file-name-without-extension>', { variables }) // dynamic content

// Fastify
reply.status(200)
reply.type('text/html')
return '<string>'
fastify.setNotFoundHandler((req, reply) => {
  reply.status(405)
  return '...'
})
return reply.sendFile('file-name-with-extension') // static content
return reply.view('<view-file-name-with-extension>', { variables }) // dynamic content

```

## Streaming with Fastify

```cmd
npm install hn-latest-stream
cd routes
node -e "fs.mkdirSync('articles')"
cd articles
node -e "fs.openSync('index.js', 'w')"
cd ..
cd ..
```

```js
// routes/articles/index.js

'use strict'

const hnLatestStream = require('hn-latest-stream')

module.exports = async (fastify, opts) => {
  fastify.get('/', async (request, reply) => {
    const { amount = 10, type = 'html' } = request.query

    if (type === 'html') reply.type('text/html')
    if (type === 'json') reply.type('application/json')
    return hnLatestStream(amount, type)
  })
}
```

Returning the stream (the result of calling hnLatestStream) from the route handler instructs Fastify to safely pipe the stream to the response. The `reply.send()` method can also be passed a stream and Fastify behaves in the same way - by piping the stream as the HTTP response.

```cmd
npm run dev
```

This will load different articles each time and there should be ten articles in total. The hn-latest-stream module uses the Hacker News API to fetch the content. It has to first lookup the latest story IDs and then for each ID it has to make a separate HTTP request to fetch the article and then push either JSON or HTML content to the stream that it returns. As such, it should be easy to observe the content being parsed and rendered by the browser incrementally in that there's a visible delay between each article rendering in the browser. This shows the power of streams in action for long running tasks. The server hasn't retrieved all the data yet, but we can still fill the above-the-fold (the part of the page that's first seen when a page loads) with the latest articles while more articles continue to load on the server, and then sent to the client to be displayed beneath the fold.

Let's try out the query string parameters as well. In the browser let's try navigating to the URL: http://localhost:3000/articles?type=json&amount=250. This will load the JSON data for the latest 250 Hacker News stories. We should again be able to observe short delays between each JSON object being received by the browser.

Due to Fastify handling the stream for us, any errors in the stream will be handled and propagated. If we disconnect from the Internet and then attempt to access results in server error.

## Streaming with Express

```cmd
cd express-web-server

npm install hn-latest-stream

cd routes
node -e "fs.openSync('articles.js', 'w')"

```

```js
// app.js

var indexRouter = require('./routes/index');
var helloRouter = require('./routes/hello');
var articlesRouter = require('./routes/articles');

app.use('/', indexRouter);
app.use('/hello', helloRouter);
app.use('/articles', articlesRouter);

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

The stream.pipe(res, {end: false}) line tells the stream (our Hacker News stream) to write all data it receives to the res object (which is also a stream). The second parameter, an object with a property named end set to false prevents pipe from performing its default behavior of endings the destination stream (res) when the source stream (stream) has ended. This is important because without this, if there is an error in the source stream then res will be ended before our server can send an appropriate error response.

```cmd
npm start
```

## Restful JSON services

REST stands for REpresentational State Transfer, and it's an architectural style that seeks to make the most of the features of HTTP/1.1. Data is communicated via HTTP response bodies, metadata is communicated through HTTP headers, and operation outcomes are communicated with HTTP status codes. The State Transfer part of REST is about shuffling state from clients to server-backends. A REST service should be stateless, an intermediate layer between a browser and a database and it should boil down to performing one or more CRUD operations (Create, Read, Update, Delete).

## Using Fastify

```cmd
node -e "fs.mkdirSync('my-service')"
cd my-service

npm init fastify
npm install
npm install fastify-sensible
```

```js
// model.js

'use strict'

module.exports = {
  bicycle: bicycleModel()
}

function bicycleModel () {
  const db = {
    1: { brand: 'Veloretti', color: 'green' },
    2: { brand: 'Batavus', color: 'yellow' }
  }

  return {
    read
  }

  function read (id, cb) {
    if (!(db.hasOwnProperty(id))) {
      const err = Error('not found')
      setImmediate(() => cb(err))
      return
    }
    setImmediate(() => cb(null, db[id]))
  }
}
```

Not only is the code in model.js contrived, the error handling is subpar. Ideally there would be a code property on the errors and a map of error constants to check against. However the point here is to emulate more real-world scenarios where integrating with libraries can be messy and less than ideal. Note that the read function uses setImmediate this is to simulate asynchronous operations. I/O operations should always be asynchronous when dealing with requests.

### 1. Using callback

```js
'use strict'

const { bicycle } = require('../../model')

module.exports = async (fastify, opts) => {
  fastify.get('/:id', (request, reply) => {
    const { id } = request.params
    bicycle.read(id, (err, result) => {
      if (err) {
        if (err.message === 'not found') reply.notFound()
        else reply.send(err)
      } else reply.send(result)
    })
  })
}
```

Function passed as the route handler to fastify.get is not an async function. This is because an async function would return a promise that would resolve immediately and the route would fail as it tries to process a response value of undefined. Or if we did return something from it, that would be the response and the call to reply.send would be too late and result in an error regarding writing to a response that has ended.

### 2. Using async/await

If we wanted to use a callback API inside an async route handler the following approach could instead be taken. Let's modify routes/bicycle/index.js to the following:

```js
'use strict'

const { bicycle } = require('../../model')

module.exports = async (fastify, opts) => {
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params
    bicycle.read(id, (err, result) => {
      if (err) {
        if (err.message === 'not found') reply.notFound()
        else reply.send(err)
      } else reply.send(result)
    })
    await reply
  })
}
```

This can be a useful approach when mixing callback-based API's and promise-based API's in a route handler.

### 3. Using `util.promisify()`

The other approach to using callback-based APIs in an async function is to promisify the API.

```js
'use strict'
const { promisify } = require('util')
const { bicycle } = require('../../model')
const read = promisify(bicycle.read)

module.exports = async (fastify, opts) => {
  const { notFound } = fastify.httpErrors

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params
    try {
      return await read(id)
    } catch (err) {
      if (err.message === 'not found') throw notFound()
      throw err
    }
  })
}
```

Note that to generate a 404 Not Found HTTP Status we throw fastify.httpErrors.notFound instead of using reply.notFound. We also throw the caught err instead of passing err to reply.send. This is extremely useful as any unexpected throw in an async route handler will result in 500 status.

```cmd
node -e "http.get('http://localhost:3000/bicycle/1', ({headers}) => console.log(headers))"

node -e "http.get('http://localhost:3000/bicycle/1', ({statusCode}) => \
console.log(statusCode))"

node -e "http.request('http://localhost:3000/bicycle/1', { method: 'post'}, ({statusCode}) \
=> console.log(statusCode)).end()"
```

For Fastify the default behavior in this scenario is to respond with a 404 as well, so this will output: 404. Other acceptable response status codes would be 405 Method not Allowed and 400 Bad Request. The reason that a 405 is not the default for this scenario is that a 404 gives less information than a 405, so for public facing services this is a more secure approach.

### Testing 500 error handling

Let's check whether the server responds with a 500 status code for an unknown error. We'll have to modify the models.js file for this one. Let's temporarily alter the read function in models.js to look as follows:

function read (id, cb) {
  setImmediate(() => cb(Error()))
}

To make sure this change is applied, restart the server (Ctrl+C and then npm run dev or npm start), then in another terminal run the following command:

node -e "http.get('http://localhost:3000/bicycle/1', ({statusCode}) => console.log(statusCode))"

The route now has an error that doesn't relate to an ID not existing, so the output of this command should now be: 500. In the async function route example, any error that doesn't have the message 'not found' is re-thrown inside the catch block. This propagates the error so that it's handled by Fastify, which auto-generates a 500 Server Error status code. In the callback-based examples of the route handler, any error that doesn't have the message 'not found' is passed to reply.send which recognizes that it's been passed an error object and from there generates a 500 Server Error status code.

## RESTful JSON services with Express

```cmd
express my-express-service

cd my-express-service
npm install

node -e "fs.openSync('model.js', 'w')"
cd routes
node -e "fs.openSync('bicycle.js', 'w')"
cd ..
```

```js
// model.js
'use strict'

module.exports = {
  bicycle: bicycleModel()
}

function bicycleModel () {
  const db = {
    1: { brand: 'Veloretti', color: 'green' },
    2: { brand: 'Batavus', color: 'yellow' }
  }

  return {
    read
  }

  function read (id, cb) {
    if (!(db.hasOwnProperty(id))) {
      const err = Error('not found')
      setImmediate(() => cb(err))
      return
    }
    setImmediate(() => cb(null, db[id]))
  }
}

// routes/bicycle.js

var express = require('express');
var router = express.Router();
var model = require('../model');

router.get('/:id', function(req, res, next) {
  model.bicycle.read(req.params.id, (err, result) => {
    if (err) {
      if (err.message === 'not found') next();
      else next(err);
    } else {
      res.send(result);
    }
  });

});

module.exports = router;

// app.js

var bicycleRouter = require('./routes/bicycle');
app.use('/bicycle', bicycleRouter);

app.use(function(req, res, next) {
  next(createError(404));
});
// or
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send({
    type: 'error',
    status: err.status,
    message: err.message,
    stack: req.app.get('env') === 'development' ? err.stack : undefined
  });
});
```

```cmd
node -e "http.get('http://localhost:3000/bicycle/1', ({headers}) => console.log(headers))"
```

'content-type' property in the response headers is set to 'application/json; charset=utf-8' as Express framework has detected that the response is JSON because res.send was passed an object, and set the headers appropriately.

## Manipulating Data with RESTful Services

### With Fastify

```js
// routes/bicycle.js

'use strict'
const { promisify } = require('util')
const { bicycle } = require('../../model')
const { uid } = bicycle
const read = promisify(bicycle.read)
const create = promisify(bicycle.create)
const update = promisify(bicycle.update)

module.exports = async (fastify, opts) => {
  const { notFound } = fastify.httpErrors

  fastify.post('/', async (request, reply) => {
    const { data } = request.body
    const id = uid()
    await create(id, data)
    reply.code(201)
    return { id }
  })

  fastify.post('/:id/update', async (request, reply) => {
    const { id } = request.params
    const { data } = request.body
    try {
      await update(id, data)
      reply.code(204)
    } catch (err) {
      if (err.message === 'not found') throw notFound()
      throw err
    }
  })

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params
    try {
      return await read(id)
    } catch (err) {
      if (err.message === 'not found') throw notFound()
      throw err
    }
  })

  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params
    const { data } = request.body
    try {
      await create(id, data)
      reply.code(201)
      return {}
    } catch (err) {
      if (err.message === 'resource exists') {
        await update(id, data)
        reply.code(204)
      } else {
        throw err
      }
    }
  })

  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params
    try {
      await del(id)
      reply.code(204)
    } catch (err) {
      if (err.message === 'not found') throw notFound()
      throw err
    }
  })
}
```

The key difference is idempotency, which means that multiple identical operations should lead to the same result. POST is not idempotent but PUT is idempotent.

So multiple identical POST requests would, for instance, create multiple entries with identical data whereas multiple PUT requests should overwrite the same entry with the same data. This does not mean that PUT can't be used to create entries, or that POST can't be used to update, it's just that expected behavior is different.

A POST request can be used to create an entry without supplying an ID, whereas a PUT request could be used to create an entry where a specific ID is desired.

Using POST to update should be an explicitly separate route for updating versus creating whereas the ability update or create with PUT can exist on the same route.

Implementing POST, PUT and DELETE with Fastify (Cont.)
This route allows a new entry to be created by using the uid method exported from model.js to get a new ID and then passes that ID along with an expected `data` property in the request POST payload to the create method.

Note how there is no explicit error handling here, since the only known error would regarding the resource already existing and since the uid function provides a new ID that won't be an issue. Any error therefore would be an unknown error, if create throws for any reason this will cause the async function route handler to throw and then be handled as a 500 Server Error by Fastify.

A successful request will respond with a 201 Created status code and send back a JSON object containing an id property with a value of the ID for the new entry.

By default Fastify supports application/json POST requests. The fastify-multipart plugin can be used to support multipart/formdata requests and fastify-formbody can be used to support application/x-www-form-urlencoded POST requests.

```cmd
node -e "http.request('http://localhost:3000/bicycle', { method: 'post', headers: {'content-type': 'application/json'}}, (res) => res.setEncoding('utf8').once('data', console.log.bind(null, res.statusCode))).end(JSON.stringify({data: {brand: 'Gazelle', color: 'red'}}))"

// output should be: 201 {"id":"3"}

node -e "http.request('http://localhost:3000/bicycle/3/update', { method: 'post', headers: {'content-type': 'application/json'}}, (res) => console.log(res.statusCode)).end(JSON.stringify({data: {brand: 'Ampler', color: 'blue'}}))"

// output 204
```

The only legitimate case for responding with no data is when the status code is 204 No Content but since 201 Created applies far more strongly in the case of entry creation we send an empty object in response.

```cmd
node -e "http.request('http://localhost:3000/bicycle/99', { method: 'put', headers: {'content-type': 'application/json'}}, (res) => console.log(res.statusCode)).end(JSON.stringify({data: {brand: 'VanMoof', color: 'black'}}))"

// output: 201

node -e "http.get('http://localhost:3000/bicycle/99', (res) => res.setEncoding('utf8').once('data', console.log))"

// output: {"brand":"VanMoof","color":"black"}.

node -e "http.request('http://localhost:3000/bicycle/99', { method: 'put', headers: {'content-type': 'application/json'}}, (res) => console.log(res.statusCode)).end(JSON.stringify({data: {brand: 'Bianchi', color: 'pink'}}))"

// output: 204

node -e "http.get('http://localhost:3000/bicycle/99', (res) => res.setEncoding('utf8').once('data', console.log))"

// output: {"brand":"Bianchi","color":"pink"}

node -e "http.get('http://localhost:3000/bicycle/1', (res) => res.setEncoding('utf8').once('data', console.log))"

// output {"brand":"Veloretti","color":"green"}

node -e "http.request('http://localhost:3000/bicycle/1', { method: 'delete', headers: {'content-type': 'application/json'}}, (res) => console.log(res.statusCode)).end()"

// output: 204

node -e "http.get('http://localhost:3000/bicycle/1', (res) => res.setEncoding('utf8').once('data', console.log))"

// output: {"statusCode":404,"error":"Not Found","message":"Not Found"}

node -e "http.request('http://localhost:3000/bicycle/1', { method: 'delete', headers: {'content-type': 'application/json'}}, (res) => console.log(res.statusCode)).end()"

// output: 404
```

### With Express

we generated an Express project with the express command line executable provided by the express-generator globally installed module. This created a folder called my-express-service. After installing project dependencies with npm install we also added a model.js file with a read method, added a routes/bicycle.js file and updated the app.js file mount our /bicycle route and convert the error handler from generating an HTML response to generating a JSON response

```js
// model.js

'use strict'

module.exports = {
  bicycle: bicycleModel()
}

function bicycleModel () {
  const db = {
    1: { brand: 'Veloretti', color: 'green' },
    2: { brand: 'Batavus', color: 'yellow' }
  }

  return {
    create, read, update, del, uid
  }

  function uid () {
    return Object.keys(db)
      .sort((a, b) => a - b)
      .map(Number)
      .filter((n) => !isNaN(n))
      .pop() + 1 + ''
  }

  function create (id, data, cb) {
    if (db.hasOwnProperty(id)) {
      const err = Error('resource exists')
      setImmediate(() => cb(err))
      return
    }
    db[id] = data
    setImmediate(() => cb(null, id))
  }

  function read (id, cb) {
    if (!(db.hasOwnProperty(id))) {
      const err = Error('not found')
      setImmediate(() => cb(err))
      return
    }
    setImmediate(() => cb(null, db[id]))
  }

  function update (id, data, cb) {
    if (!(db.hasOwnProperty(id))) {
      const err = Error('not found')
      setImmediate(() => cb(err))
      return
    }
    db[id] = data
    setImmediate(() => cb())
  }

  function del (id, cb) {
    if (!(db.hasOwnProperty(id))) {
      const err = Error('not found')
      setImmediate(() => cb(err))
      return
    }
    delete db[id]
    setImmediate(() => cb())
  }

}

// routes/bicycle.js

var express = require('express');
var router = express.Router();
var model = require('../model');

router.get('/:id', function(req, res, next) {
  model.bicycle.read(req.params.id, (err, result) => {
    if (err) {
      if (err.message === 'not found') next();
      else next(err);
    } else {
      res.send(result);
    }
  });
});

router.post('/', function(req, res, next) {
  var id = model.bicycle.uid();
  model.bicycle.create(id, req.body.data, (err) => {
    if (err) next(err);
    else res.status(201).send({ id });
  });
});

router.post('/:id/update', function(req, res, next) {
  model.bicycle.update(req.params.id, req.body.data, (err) => {
    if (err) {
      if (err.message === 'not found') next();
      else next(err);
    } else {
      res.status(204).send();
    }
  });
});

router.put('/:id', function(req, res, next) {
  model.bicycle.create(req.params.id, req.body.data, (err) => {
    if (err) {
      if (err.message === 'resource exists') {
        model.bicycle.update(req.params.id, req.body.data, (err) => {
          if (err) next(err);
          else res.status(204).send();
        });
      } else {
        next(err);
      }
    } else {
      res.status(201).send({});
    }
  });
});

router.delete('/:id', function(req, res, next) {
  model.bicycle.del(req.params.id, (err) => {
    if (err) {
      if (err.message === 'not found') next();
      else next(err);
    } else {
      res.status(204).send();
    }
  });
});

module.exports = router;
```

Each of the routes implement exactly the same logic as the routes in our Fastify service but we use callback-style instead of async/await. The reason for this is two-fold. Firstly, it reflects the code styles used in legacy services - and there are many legacy Express services in the wild. Secondly, using async/await with Express is recommended against. Express was built before async/await syntax was part of the JavaScript language and as a result it does not always behave as expected.

For instance, the following will cause a memory leaks:

```js
//: WARNING NEVER DO THIS IN EXPRESS
router.get('/foo', async function(req, res, next) {
  throw Error('what happens?');
  res.send('hi'); // <- this is never reached
});
```

This is because Express does not handle the promise rejection that results from throwing in an async function, and therefore the request does not finish (for a while) and continues to hold state. This would be a source of performance, debugging and maintenance issues. Worse, the same scenario can occur without explicitly throwing:

```js
//: WARNING NEVER DO THIS IN EXPRESS
router.get('/foo', async function(req, res, next) {
  res.dend('hi');
});
```

In this case a typo has been made, res.send is intended but it's written as res.dend. Since that method doesn't exist, this will cause an error to be thrown (because undefined is not a function) and will lead to the same scenario. There are ways around this, for instance monkey-patching the framework, or using try/catch blocks in every single route handler and then passing caught errors to the next callback. However both of these approaches can (and likely will) lead to footgun scenarios, technical debt and different forms of bugs - because they rely on hacks and/or depend on understood and enforced conventions across many people.

In short, use callback-based API's with Express

```cmd
node -e "http.request('http://localhost:3000/bicycle', { method: 'post', headers: {'content-type': 'application/json'}}, (res) => res.setEncoding('utf8').once('data', console.log.bind(null, res.statusCode))).end(JSON.stringify({data: {brand: 'Gazelle', color: 'red'}}))"

// output 201 {"id":"3"}. The means there were no errors in creating a new entry.

node -e "http.get('http://localhost:3000/bicycle/3', (res) => res.setEncoding('utf8').once('data', console.log))"

// output: {"brand":"Gazelle","color":"red"}.

node -e "http.request('http://localhost:3000/bicycle/3/update', { method: 'post', headers: {'content-type': 'application/json'}}, (res) => console.log(res.statusCode)).end(JSON.stringify({data: {brand: 'Ampler', color: 'blue'}}))"

node -e "http.get('http://localhost:3000/bicycle/3', (res) => res.setEncoding('utf8').once('data', console.log))"

// output: {"brand":"Ampler","color":"blue"}.

node -e "http.request('http://localhost:3000/bicycle/99', { method: 'put', headers: {'content-type': 'application/json'}}, (res) => console.log(res.statusCode)).end(JSON.stringify({data: {brand: 'VanMoof', color: 'black'}}))"

// output: 201

node -e "http.get('http://localhost:3000/bicycle/99', (res) => res.setEncoding('utf8').once('data', console.log))"

// output: {"brand":"VanMoof","color":"black"}.

We can now hit the same route with different data to update it:

node -e "http.request('http://localhost:3000/bicycle/99', { method: 'put', headers: {'content-type': 'application/json'}}, (res) => console.log(res.statusCode)).end(JSON.stringify({data: {brand: 'Bianchi', color: 'pink'}}))"

// output: 204. We can verify the update occurred with the following:

node -e "http.get('http://localhost:3000/bicycle/99', (res) => res.setEncoding('utf8').once('data', console.log))"

// output: {"brand":"Bianchi","color":"pink"}.

Finally, we'll check our DELETE route. Let's run the following command:

node -e "http.request('http://localhost:3000/bicycle/99', { method: 'delete', headers: {'content-type': 'application/json'}}, (res) => console.log(res.statusCode)).end()"

// output 204 which means that we just added with PUT was successfully deleted. We can check with a GET request:

node -e "http.get('http://localhost:3000/bicycle/99', (res) => res.setEncoding('utf8').once('data', console.log))"

// output a JSON object with a type property containing 'error', status property containing 404, and a stack property as per our changes to app.js in the previous chapter.

```

## Services Aggregation and Consumption

A common case for Node.js services, and RESTful services in general, is to provide a mediation role sometimes known as the "front of the backend". These are services which sit between client requests, especially from a browser-client, and backend API's which may be SOAP, RPC, database or also other REST-based APIs.

How one service discovers another service is a large subject from custom IP addresses to service meshes with DNS discovery and domain names, to solutions that incorporate Distributed Hash Tables; there are many ways for one service to discover another.

Supporting deployment infrastructure to inject values into the process at deployment-time allows for a certain degree of flexibility and reconfiguration possibilities.

```js
// bicycle-service.js

'use strict'
const http = require('http')
const url = require('url')
const colors = ['Yellow', 'Red', 'Orange', 'Green', 'Blue', 'Indigo']
const MISSING = 2

const server = http.createServer((req, res) => {
  const { pathname } = url.parse(req.url)
  let id = pathname.match(/^\/(\d+)$/)
  if (!id) {
    res.statusCode = 400
    return void res.end()
  }

  id = Number(id[1])

  if (id === MISSING) {
    res.statusCode = 404
    return void res.end()
  }

  res.setHeader('Content-Type', 'application/json')

  res.end(JSON.stringify({
    id: id,
    color: colors[id % colors.length]
  }))
})

server.listen(process.env.PORT || 0, () => {
  const { port } = server.address()
  console.log('Bicycle service listening on localhost on port: ' + port)
})
```

```js
// brand-service.js

'use strict'
const http = require('http')
const url = require('url')
const brands = ['Gazelle', 'Batavus', 'Azor', 'Cortina', 'Giant','Sparta']
const MISSING = 3

const server = http.createServer((req, res) => {
  const { pathname } = url.parse(req.url)
  let id = pathname.match(/^\/(\d+)$/)

  if (!id) {
    res.statusCode = 400
    return void res.end()
  }

  id = Number(id[1])

  if (id === MISSING) {
    res.statusCode = 404
    return void res.end()
  }

  res.setHeader('Content-Type', 'application/json')

  res.end(JSON.stringify({
    id: id,
    name: brands[id % brands.length]
  }))
})

server.listen(process.env.PORT || 0, () => {
  const { port } = server.address()
  console.log('Brand service listening on localhost on port: ' + port)
})
```

```cmd
PORT=4000 node bicycle-service.js
PORT=5000 node brand-service.js
```

## Consuming Data

Using async/await route handlers with Node.js core modules for making requests can become ergonomically challenging. We'll use the got module because it's well-scoped, well-engineered and has API's that are compatible with async/await functions that we'll be using as route handlers.

```cmd
npm init fastify
npm install
npm install got
```

```js
// routes/root.js

'use strict'
const got = require('got')

const {
  BICYCLE_SERVICE_PORT = 4000, BRAND_SERVICE_PORT = 5000
} = process.env

const bicycleSrv = `http://localhost:${BICYCLE_SERVICE_PORT}`
const brandSrv = `http://localhost:${BRAND_SERVICE_PORT}`

module.exports = async function (fastify, opts) {
  fastify.get('/:id', async function (request, reply) {
    const { id } = request.params
    const [ bicycle, brand ] = await Promise.all([
      got(`${bicycleSrv}/${id}`).json(),
      got(`${brandSrv}/${id}`).json()
    ])
    return {
      id: bicycle.id,
      color: bicycle.color,
      brand: brand.name,
    }
  })
}
```

## Managing Status Codes

What do we do if one of the services responds with a 404 status code?
What if one of the services isn't available?
What if either service responds with a status code that isn't 200?
What about other 4XX or 5XX error codes?

HTTPError is generated by the got library because one of the upstream services has responded with a 404 status code. But our server is currently translating that to 500 status code.

We'll handle this scenario by forwarding the 404. In other words, if either upstream service has a 404 error, we'll send a 404 from our service.

Let's install and register fastify-sensible in consumer-service folder:

```cmd
npm install fastify-sensible
```

```js
// app.js

'use strict'

const path = require('path')
const AutoLoad = require('fastify-autoload')
const sensible = require('fastify-sensible')
module.exports = async function (fastify, opts) {

  fastify.register(sensible)

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

```js
// routes/root.js

'use strict'
const got = require('got')

const {
  BICYCLE_SERVICE_PORT = 4000, BRAND_SERVICE_PORT = 5000
} = process.env

const bicycleSrv = `http://localhost:${BICYCLE_SERVICE_PORT}`
const brandSrv = `http://localhost:${BRAND_SERVICE_PORT}`

module.exports = async function (fastify, opts) {
  const { httpErrors } = fastify
  fastify.get('/:id', async function (request, reply) {
    const { id } = request.params
    try {
      const [ bicycle, brand ] = await Promise.all([
        got(`${bicycleSrv}/${id}`).json(),
        got(`${brandSrv}/${id}`).json()
      ])
      return {
        id: bicycle.id,
        color: bicycle.color,
        brand: brand.name,
      }
    } catch (err) {
      if (!err.response) throw err
      if (err.response.statusCode === 404) {
        throw httpErrors.notFound()
      }
      if (err.response.statusCode === 400) {
        throw httpErrors.badRequest()
      }
      throw err
    }
  })
}
```

We wrap the await of the request promises returned by the got invocations in a try/catch block. If the promise returned from either got invocation rejects, this will generate an error in the async function. The promises representing requests to upstream services will reject if the upstream service responds with a non-200 status code.

When got generates an error based on an upstream services response it adds a response property to the error object. If the err.response object is not there, then no response occurred but there was still an error. So we check that err.response is not falsy, and if it is, we throw the error immediately which will cause Fastify to generate a 500 response.

The err.response object has a statusCode which can be checked to see what status code of the upstream response was. If err.response.statusCode is 404 then we throw the result of the httpErrors.notFound function supplied by the fastify-sensible plugin.

Any other errors are just re-thrown, so if an upstream service replies with a status code that isn't 200-299 or 404 this results in a 500 error.

Let's run the following command again:

```cmd
node -e "http.get('http://localhost:3000/2', (res) => console.log(res.statusCode))"
```

This time it should output 404.

Let's try the following command to perform a GET on our service with an invalid ID:

```cmd
node -e "http.get('http://localhost:3000/foo', (res) => console.log(res.statusCode))"
```

This will output: 500.

Both 400 and 404 status codes are forwarded to the response. All status codes in the 3xx, 4XX and 5XX ranges from the upstream services result in 500 status codes from our consumer service.

## Proxying HTTP Requests

An HTTP Proxy is a server that forwards HTTP requests to backend services and then forwards responses to clients.

As the system scales, at a certain point, the need for proxying tends to become inevitable.

Generally, proxying should be done with a specialized configurable piece of infrastructure, such as NGINX, Kong or proprietary cloud gateway services.

However, sometimes there are complex requirements for a proxy that may be better met with a Node.js proxying service. Other times the requirements may be so simple (like proxying a single route) that it just makes sense to use what's already available instead of investing in something else.

In other cases, a Node.js proxying service can be a stop-gap on the way to a more comprehensive infrastructural proxying solution.

## Single Route, Multiple Origin Proxy

There may be some circumstances where we need to send data from another service via our service. In these cases, we could actually use an HTTP request library like got as explored in the prior chapter. However, using a proxying library is a viable alternative that provides a more configuration-based approach vs the procedural approach of using a request library.

```cmd
node -e "fs.mkdirSync('my-route-proxy')"
cd my-route-proxy
npm init fastify
npm install fastify-reply-from fastify-sensible
```

```js
// app.js
'use strict'

const path = require('path')
const AutoLoad = require('fastify-autoload')
const replyFrom = require('fastify-reply-from')
const sensible = require('fastify-sensible')

module.exports = async function (fastify, opts) {

  fastify.register(sensible)
  fastify.register(replyFrom)

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

```js
// routes/root.js
'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    const { url } = request.query
    try {
      new URL(url)
    } catch (err) {
      throw fastify.httpErrors.badRequest()
    }
    return reply.from(url)
  })
}
```

`reply.from` method is supplied by the fastify-reply-from plugin and returns a promise that resolves once the response from the upstream URL has been sent as a response to the client. We return it so that the route handler knows when the request has finished being handled by reply.from.

### Tiniest server

```cmd
node -e "http.createServer((_, res) => (res.setHeader('Content-Type', 'text/plain'), res.end('hello world'))).listen(5000)"
```

Now if we navigate to htt‌p://localhost:3000/?url=http://localhost:5000 in a browser we should see hello world displayed. Most sites will trigger a redirect if they detect that a proxy server is being used (and the url query string parameter tends to give it away). For instance, if we navigate to http://localhost:3000/?url=http://google.com the browser will receive a 301 Moved response which will cause the browser to redirect to http://google.com directly. Therefore this approach is better suited when using URLs that are only accessible internally and this exposed route is a proxy to accessing them.

The fastify-reply-from plugin can also be configured so that it can only proxy to a specific upstream server using the base option. In this case reply.from would be passed a path instead of a full URL and then make a request to the base URL concatenated with the path passed to reply.from. This can be useful for mapping different endpoints to a specific upstream service.

More advanced proxying scenarios involve rewriting some aspect of the response from the upstream service while it's replying to the client. To finish off this section let's make our proxy server uppercase all content that arrives from the upstream service before sending it on to the client.

```js
// routes/root.js

'use strict'
const { Readable } = require('stream')
async function * upper (res) {
  for await (const chunk of res) {
    yield chunk.toString().toUpperCase()
  }
}
module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    const { url } = request.query
    try {
      new URL(url)
    } catch (err) {
      throw fastify.httpErrors.badRequest()
    }
    return reply.from(url, {
      onResponse (request, reply, res) {
        reply.send(Readable.from(upper(res)))
      }
    })
  })
}
```

The second argument passed to reply.from is the options object. It contains an onResponse function. If the onResponse function is provided in the options object, the fastify-reply-from plugin will call it and will not end the response, it becomes up to us to manually end the response (with reply.send) in this case. The onResponse function is passed the request and reply objects for the route handler and a third argument: res, which represents the response from the upstream service. This is the same core http.IncomingMessage object that's passed to the callback of an http.request call.

The `upper` function is an async generator function. The res object is an async iterable, which means it can be used with for await of syntax. This allows us to grab each chunk from the upstream services response, convert it to a string and then uppercase it. We yield the result from the upper function. The upper function in turn returns an async iterable object which can be passed to the Node core streams.Readable.from method which will convert the async iterable into a stream. The result is passed into reply.send which will take the data from the stream and send it to the response.

We could have instead buffered all content into memory, uppercased it, and then sent the entire contents to reply.send instead but this would not be ideal in a proxying situation: we don't necessarily know how much content we may be fetching. Instead our approach incrementally processes each chunk of data from the upstream service, sending it immediately to the client.

## Single Origin, Multiple Routes

Instead of using a querystring parameter we can map every path (and indeed every HTTP method) made to our proxy service straight to the upstream service.

```cmd
node -e "fs.mkdirSync('my-proxy')"
cd my-proxy
npm init fastify
npm install fastify-http-proxy
```

```js
// app.js

'use strict'
const proxy = require('fastify-http-proxy')
module.exports = async function (fastify, opts) {
  fastify.register(proxy, {
    upstream: 'htt‌ps://news.ycombinator.com/'
  })
}
```

`npm run dev` and open `http://localhost:3000`

If we click any of the links along the top, for instance the new link, this will navigate to http://localhost:3000/newest which will then display the current Hacker News page of the newest articles.

The fastify-http-proxy uses the fastify-reply-from plugin under the hood with a handler that takes all the requests, figures out the path and then passes them to reply.from.

Generally speaking the upstream option would be set to some internal service that is not accessible publicly and typically it's more likely that it would be a data service of some kind (for instance, providing JSON responses).

Imagine a nascent authentication approach which isn't yet supported in larger projects. We can use the preHandler option supported by fastify-http-proxy to implement custom authentication logic.

```js
// app.js

'use strict'

const proxy = require('fastify-http-proxy')
const sensible = require('fastify-sensible')
module.exports = async function (fastify, opts) {
  fastify.register(sensible)
  fastify.register(proxy, {
    upstream: 'https://news.ycombinator.com/',
    async preHandler(request, reply) {
      if (request.query.token !== 'abc') {
        throw fastify.httpErrors.unauthorized()
      }
    }
  })

}
```

Opening `http://localhost:3000/` with result in

{"statusCode":401,"error":"Unauthorized","message":"Unauthorized"}

Opening `http://localhost:3000/?token=abc` will work again.

## Web Security - Handling User Input

The implications of a malicious user who is able to exploit insecure code can be significant. Therefore it is of paramount importance to always ensure that any external inputs to a service are sanitized in ways that prevent potential attackers from gaining any control of backend systems or from borrowing the authority of a site to exploit other users.

### Parameter Pollution Attack

The parameter pollution exploits a bug that's often created by developers when handling query string parameters. Even when we know about the potential for the bug, it can still be easy to forget. The main aim of such an attack is to cause a service to either crash to slow down by generating an exception in the service. In cases where a crash occurs, it will be because of an unhandled exception. In cases where a slow down occurs it can be caused by generating an exception that's generically handled and the error handling overhead (for instance, stack generation for a new error object on every request) and then sending many requests to the server. Both of these are forms of Denial of Service attacks, we cover mitigating such attacks in next section.

A query-string is the first occurrence of the part of a URL starting with a question mark. For instance, given a URL: ht‌tp://example.com/?name=bob the query string is ?name=bob. All mainstream Node.js frameworks (and the node core querystring module) parse ?name=bob into an object with a property of name and a value of 'bob', like so: {name: 'bob'}. However query-strings allow for an array-like concept. The following is a legitimate query string: ?name=bob&name=dave. In all popular Node frameworks (and Node core querystring) the parsed query-string will result in an object with a name key with a value of ['bob', 'dave'], like so: {name: ['bob', 'dave']}.

```cmd
node -p "querystring.parse('name=bob')"
output: [Object: null prototype] { name: 'bob' }

node -p "querystring.parse('name=bob&name=dave')"
output: [Object: null prototype] { name: [ 'bob', 'dave' ] }
```

```js
router.get('/', (req, res, next) => {
  someAsynchronousOperation(() => {
    if (!req.query.name) {
      var err = new Error('Bad Request')
      err.status = 400
      next(err)
      return
    }
    var parts = req.query.name.split(' ');
    var last = parts.pop();
    var first = parts.shift();
    res.send({first: first, last: last});
  })
});
```

Following query-string will cause the entire service to crash: ?name=David Mark Clements&name=kaboom. This is because req.query will be an object with a name property containing an array, like so: {name: ['David Mark Clements', 'kaboom']}. So in this case, req.query.name.split will not exist, arrays do not have a split function. This will cause an Uncaught TypeError which will not be handled. Express has no way of catching unhandled exceptions that occur in asynchronous operations. This is why async/await syntax with Fastify is recommended, because even when errors occur in a Fastify route handler it will propagate as a promise rejection into Fastify core and result in a 500 Server Error instead of crashing the service.

The only way to avoid a parameter pollution attack is to ensure that any code written for query-string parameters can run without error against both strings and arrays.

```js
function convert (name) {
  var parts = name.split(' ');
  var last = parts.pop();
  var first = parts.shift();
  return {first: first, last: last};
}
router.get('/', (req, res, next) => {
  someAsynchronousOperation(() => {
    if (!req.query.name) {
      var err = new Error('Bad Request')
      err.status = 400
      next(err)
      return
    }
    if (Array.isArray(req.query.name)) {
      res.send(req.query.name.map(convert));
    } else {
      res.send(convert(req.query.name));
    }
  });
});
```

### Route Validation with Fastify

CRUD with fastify

```js
// app.js

'use strict'

const path = require('path')
const AutoLoad = require('fastify-autoload')
const sensible = require('fastify-sensible')
module.exports = async function (fastify, opts) {

  fastify.register(sensible)

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

```js
// routes/bicycle/index.js

'use strict'
const { promisify } = require('util')
const { bicycle } = require('../../model')
const { uid } = bicycle
const read = promisify(bicycle.read)
const create = promisify(bicycle.create)
const update = promisify(bicycle.update)
const del = promisify(bicycle.del)

module.exports = async (fastify, opts) => {
  const { notFound } = fastify.httpErrors

  fastify.post('/', async (request, reply) => {
    const { data } = request.body
    const id = uid()
    await create(id, data)
    reply.code(201)
    return { id }
  })

  fastify.post('/:id/update', async (request, reply) => {
    const { id } = request.params
    const { data } = request.body
    try {
      await update(id, data)
      reply.code(204)
    } catch (err) {
      if (err.message === 'not found') throw notFound()
      throw err
    }
  })

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params
    try {
      return await read(id)
    } catch (err) {
      if (err.message === 'not found') throw notFound()
      throw err
    }
  })

  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params
    const { data } = request.body
    try {
      await create(id, data)
      reply.code(201)
      return { }
    } catch (err) {
      if (err.message === 'resource exists') {
        await update(id, data)
        reply.code(204)
      } else {
        throw err
      }
    }
  })

  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params
    try {
      await del(id)
      reply.code(204)
    } catch (err) {
      if (err.message === 'not found') throw notFound()
      throw err
    }
  })

}
```

The recommended approach to route validation in Fastify is using the schema option which can be passed when declaring routes. Fastify supports the JSONSchema format for declaring the rules for incoming (and also outgoing) data. Not only is support of this common format useful as a standardized validation convention, it's also used by Fastify to compile route specific serializers which speed up parsing time, improving a services request-per-seconds performance. Often the goals of performance and security compete, in that performance can suffer due to security and vice versa, yet using JSONSchema with Fastify yields gains for both.

Let's make a schema for the POST body that enforces that shape by modifying the POST route to the following:

```js
fastify.post('/', {
  schema: {
    body: {
      type: 'object',
      required: ['data'],
      additionalProperties: false,
      properties: {
        data: {
          type: 'object',
          required: ['brand', 'color'],
          additionalProperties: false,
          properties: {
            brand: {type: 'string'},
            color: {type: 'string'}
          }
        }
      }
    }
  }
}, async (request, reply) => {
  const { data } = request.body
  const id = uid()
  await create(id, data)
  reply.code(201)
  return { id }
})
```

See htt‌ps://www.fastify.io/docs/latest/Routes/#options for a full list of options.

The schema option supports body, query, params, headers and response as schemas that can be declared for these areas of input (or output in the case of response)

We declare the schema.body.type as 'object' which will usually be the case, even if the service accepts alternative mime-types like multipart. This is because the schema is applied (conceptually) to the body after it has been parsed into a JavaScript object.

We want to ensure that the data property exists on the incoming payload, so the schema.body.required array contains 'data'. Just specifying a required key is not enough, the property still needs to be described.

By default the JSONSchema standard takes a lenient approach and allows additional properties beyond properties that are declared. We only want a data property on the POST body, so we opt-out of this default by setting the additionalProperties schema configuration option to false. Fastify is set up to strip additional properties.

It will still allow the request, but remove extra properties if additionalProperties is false. This can be altered, along with other behaviours, see htt‌ps://www.fastify.io/docs/latest/Validation-and-Serialization/#validator-compiler for information on configuring all possible validation behaviors.

The schema.body.properties has a data key, this declares that a data key is expected in the request body. The schema.body.properties.data key holds an object with a type key set to 'object', specifying that the POST body's data key should hold an object. We also want the color and brand keys in the POST data to be required, so we specify those in the schema.body.properties.data.required array. We also want to strip any extra properties, so we set schema.body.properties.data.additionalProperties to false.

```cmd
npm run dev

node -e "http.request('http://localhost:3000/bicycle', { method: 'post', headers: {'content-type': 'application/json'}}, (res) => res.setEncoding('utf8').once('data', console.log.bind(null, res.statusCode))).end(JSON.stringify({data: {brand: 'Gazelle', color: 'red'}}))"

// output: 201 {"id": "3"}.

// The following command tries to make a POST request with this invalid payload:

node -e "http.request('http://localhost:3000/bicycle', { method: 'post', headers: {'content-type': 'application/json'}}, (res) => res.setEncoding('utf8').once('data', console.log.bind(null, res.statusCode))).end(JSON.stringify({data: {brand: 'Gazelle', colors: 'red'}}))"

// output: 400 {"statusCode":400,"error":"Bad Request","message":"body.data should have required property 'color'"}. Fastify has generated a message letting us know why the data is not valid.

// If we include extra properties in the payload, they will be stripped:

node -e "http.request('http://localhost:3000/bicycle', { method: 'post', headers: {'content-type': 'application/json'}}, (res) => res.setEncoding('utf8').once('data', console.log.bind(null, res.statusCode))).end(JSON.stringify({data: {brand: 'Gazelle', color: 'red', extra: 'will be stripped'}}))"

// output: 201 {"id":"4"}

node -e "http.get('http://localhost:3000/bicycle/4', (res) => res.setEncoding('utf8').once('data', console.log))"

// output: {"brand":"Gazelle","color":"red"}, the extra key has not been stored because by the time we access request.body in the route handler the request.body.data.extra key doesn't even exist.
```

### Applying schema to all other methods

The body schema that we declared for the first POST route also applies to the second POST route, and to the PUT route in routes/bicycle/index.js so we can reuse the schema we've written. Fastify supports shared schemas that can be used with the JSONSchema $ref key, see htt‌ps://www.fastify.io/docs/latest/Validation-and-Serialization/#adding-a-shared-schema.

These routes also have another input that we haven't considered yet: the id route parameter. We can apply validation to route parameters with the schema.params option. The methods in models.js expect the ID to be an integer.

```js
// routes/bicyle/index.js

'use strict'
const { promisify } = require('util')
const { bicycle } = require('../../model')
const { uid } = bicycle
const read = promisify(bicycle.read)
const create = promisify(bicycle.create)
const update = promisify(bicycle.update)
const del = promisify(bicycle.del)

module.exports = async (fastify, opts) => {
  const { notFound } = fastify.httpErrors

  const bodySchema = {
    type: 'object',
    required: ['data'],
    additionalProperties: false,
    properties: {
      data: {
        type: 'object',
        required: ['brand', 'color'],
        additionalProperties: false,
        properties: {
          brand: {type: 'string'},
          color: {type: 'string'}
        }
      }
    }
  }

  const paramsSchema = {
    id: {
      type: 'integer'
    }
  }

  fastify.post('/', {
    schema: {
      body: bodySchema
    }
  }, async (request, reply) => {
    const { data } = request.body
    const id = uid()
    await create(id, data)
    reply.code(201)
    return { id }
  })

  fastify.post('/:id/update', {
    schema: {
      body: bodySchema,
      params: paramsSchema
    }
  }, async (request, reply) => {
    const { id } = request.params
    const { data } = request.body
    try {
      await update(id, data)
      reply.code(204)
    } catch (err) {
      if (err.message === 'not found') throw notFound()
      throw err
    }
  })

  fastify.get('/:id', {
    schema: {
      params: paramsSchema
    }
  }, async (request, reply) => {
    const { id } = request.params
    try {
      return await read(id)
    } catch (err) {
      if (err.message === 'not found') throw notFound()
      throw err
    }
  })

  fastify.put('/:id', {
    schema: {
      body: bodySchema,
      params: paramsSchema

    }
  }, async (request, reply) => {
    const { id } = request.params
    const { data } = request.body
    try {
      await create(id, data)
      reply.code(201)
      return { }
    } catch (err) {
      if (err.message === 'resource exists') {
        await update(id, data)
        reply.code(204)
      } else {
        throw err
      }
    }
  })

  fastify.delete('/:id', {
    schema: {
      params: paramsSchema
    }
  }, async (request, reply) => {
    const { id } = request.params
    try {
      await del(id)
      reply.code(204)
    } catch (err) {
      if (err.message === 'not found') throw notFound()
      throw err
    }
  })
}
```

Finally there's one more thing we can validate: the response. At first this can seem like an odd thing to do. However, in many enterprise architectures databases can be shared, in that multiple services may read and write to the same data storage. This means when retrieving data from a remote source, we cannot entirely trust that data even if it is internal. What if another service hasn't validated input? We don't want to send malicious state to the user.

In the first POST route the returned ID has the same rules as the id route parameter: it should be an integer. We can reuse the schema just for the ID by breaking it out of the paramsSchema:

```js
const idSchema = { type: 'integer' }
const paramsSchema = { id: idSchema }

fastify.post('/', {
  schema: {
    body: bodySchema,
    response: {
      201: {
        id: idSchema
      }
    }
  }
}, async (request, reply) => {
  const { data } = request.body
  const id = uid()
  await create(id, data)
  reply.code(201)
  return { id }
})
```

If we wanted to apply a schema to all response codes from 200 to 299 we could set a key called 2xx on the schema.response object.

The read method responds with objects that contain a color and brand key, that's all we can store to it in fact. So we can reuse the bodySchema.properties.data object to validate the GET response. Let's break up the bodySchema object like so:

```js
const dataSchema = {
  type: 'object',
  required: ['brand', 'color'],
  additionalProperties: false,
  properties: {
    brand: {type: 'string'},
    color: {type: 'string'}
  }
}

const bodySchema = {
  type: 'object',
  required: ['data'],
  additionalProperties: false,
  properties: {
    data: dataSchema
  }
}

fastify.get('/:id', {
  schema: {
    params: paramsSchema,
    response: {
      200: dataSchema
    }
  }
}, async (request, reply) => {
  const { id } = request.params
  try {
    return await read(id)
  } catch (err) {
    if (err.message === 'not found') throw notFound()
    throw err
  }
})
```

While invalidation of input-related schemas (such as schema.body) will result in a 400 Bad Request, the invalidation of a response schema will result in a 500 Server Error result. We can try this out by temporarily modifying the GET route to respond with invalid data:

```js
fastify.get('/:id', {
  schema: {
    params: paramsSchema,
    response: {
      200: dataSchema
    }
  }
}, async (request, reply) => {
  const { id } = request.params
  try {
    return {ka: 'boom'}
  } catch (err) {
    if (err.message === 'not found') throw notFound()
    throw err
  }
})
```

As a matter of preference, there is also a Fluent-API library that can generate the JSONSchema objects for us. For instance, the dataSchema could be declared with fluent-schema as S.object().prop('brand', S.string().required()).prop('color', S.string().required()).additionalProperties(false) where S is the fluent-schema instance. See htt‌ps://github.com/fastify/fluent-schema for more information.

## Route validation with Express

Express does not offer any validation primitives or abstractions as a core part of the framework. There are no particular validation practices recommended in the frameworks' documentation.

While validation libraries do exist - for an example see htt‌ps://express-validator.github.io/docs/ - there is no standard approach. It is even possible to use JSONSchema with Express via various middleware offerings but this is rarely seen in practice; possibly because the implementations available cause significant performance overhead.

As a result the most common approach to validation in Express is to develop custom logic for the service as needed. This isn't exactly recommended, but when dealing with legacy services it's useful to understand this aspect of real-world legacy Express development.

We'll be looking at hand-rolled validation rules for the Express service.

```js
// routes/bicycle.js

var express = require('express');
var router = express.Router();
var model = require('../model');

function hasOwnProperty (o, p) {
  return Object.prototype.hasOwnProperty.call(o, p);
}

function validateData (o) {
  var valid = o !== null && typeof o === 'object';
  valid = valid && hasOwnProperty(o, 'brand');
  valid = valid && hasOwnProperty(o, 'color');
  valid = valid && typeof o.brand === 'string';
  valid = valid && typeof o.color === 'string';
  return valid && {
    brand: o.brand,
    color: o.color
  };
}

function validateBody (o) {
  var valid = o !== null && typeof o === 'object';
  valid = valid && hasOwnProperty(o, 'data');
  valid = valid && o.data !== null && typeof o.data === 'object';
  var data = valid && validateData(o.data);
  return valid && data && {
    data: data
  };
}

function isIdValid (n) {
  n = Number(n)
  var MAX_SAFE = Math.pow(2, 53) - 1
  return isFinite(n) && Math.floor(n) === n && Math.abs(n) <= MAX_SAFE
}

function isParamsValid (o) {
  var valid = o !== null && typeof o === 'object';
  valid = valid && hasOwnProperty(o, 'id');
  valid = valid && isIdValid(o.id);
  return valid;
}

function badRequest () {
  const err = new Error('Bad Request');
  err.status = 400;
  return err;
}

router.get('/:id', function (req, res, next) {
  if (isParamsValid(req.params)) {
    model.bicycle.read(req.params.id, (err, result) => {
      if (err) {
        if (err.message === 'not found') next();
        else next(err);
      } else {
        var sanitizedResult = validateData(result);
        if (sanitizedResult) {
          res.send(sanitizedResult);
        } else {
          next(new Error('Server Error'));
        }
      }
    });
  } else {
    next(badRequest());
  }
});

router.post('/', function (req, res, next) {
  var id = model.bicycle.uid();
  var body = validateBody(req.body);
  if (body) {
    model.bicycle.create(id, body.data, (err) => {
      if (err) {
        next(err);
      } else {
        if (isIdValid(id)) res.status(201).send({ id });
        else next(new Error('Server Error'));
      }
    });
  } else {
    next(badRequest());
  }
});

router.post('/:id/update', function (req, res, next) {
  if (isParamsValid(req.params)) {
    var body = validateBody(req.body);
    if (body) {
      model.bicycle.update(req.params.id, body.data, (err) => {
        if (err) {
          if (err.message === 'not found') next();
          else next(err);
        } else {
          res.status(204).send();
        }
      });
    } else {
      next(badRequest());
    }
  } else {
    next(badRequest());
  }
});

router.put('/:id', function (req, res, next) {
  if (isParamsValid(req.params)) {
    var body = validateBody(body);
    if (body) {
      model.bicycle.create(req.params.id, body.data, (err) => {
        if (err) {
          if (err.message === 'resource exists') {
            model.bicycle.update(req.params.id, body.data, (err) => {
              if (err) next(err);
              else res.status(204).send();
            });
          } else {
            next(err);
          }
        } else {
          res.status(201).send({});
        }
      });
    } else {
      next(badRequest());
    }
  } else {
    next(badRequest());
  }
});

router.delete('/:id', function (req, res, next) {
  if (isParamsValid(req.params)) {
    model.bicycle.del(req.params.id, (err) => {
      if (err) {
        if (err.message === 'not found') next();
        else next(err);
      } else {
        res.status(204).send();
      }
    });
  } else {
    next(badRequest());
  }
});

module.exports = router;
```

It is possible to call o.hasOwnProperty('foo') where o is an object and foo is an expected property on the object. However since the method name can be overwritten, it's safer to apply the Object.prototypeo.hasOwnProperty function. We could use p in o to check if an object has a property but this will also check for prototype properties, for example 'toString' in {} evaluates to true even though it's an empty object.

The isIdValid function checks that the input is an integer, thus enforcing that IDs are always integers. In modern JavaScript it could be written as const isIdValid = (n) => Number.isSafeInteger(Number(n)) but this code is written in a legacy style more appropriate to the majority of Express services in production.

We also pass the result object provided to the callback passed to model.bicycle.read to check that the result matches our data validation constraints and strip any extra properties from it.

```cmd
npm start

node -e "http.request('http://localhost:3000/bicycle', { method: 'post', headers: {'content-type': 'application/json'}}, (res) => res.setEncoding('utf8').once('data', console.log.bind(null, res.statusCode))).end(JSON.stringify({data: {brand: 'Gazelle', color: 'red'}}))"

// output: 201 {"id": "3"}

node -e "http.request('http://localhost:3000/bicycle', { method: 'post', headers: {'content-type': 'application/json'}}, (res) => res.setEncoding('utf8').once('data', console.log.bind(null, res.statusCode))).end(JSON.stringify({data: {brand: 'Gazelle', colors: 'red'}}))"

// output: 400 {"type":"error","status":400,"message":"Bad Request","stack": "..."}

node -e "http.request('http://localhost:3000/bicycle', { method: 'post', headers: {'content-type': 'application/json'}}, (res) => res.setEncoding('utf8').once('data', console.log.bind(null, res.statusCode))).end(JSON.stringify({data: {brand: 'Gazelle', color: 'red', extra: 'will be stripped'}}))"

// output: 201 {"id":"4"}

node -e "http.get('http://localhost:3000/bicycle/4', (res) => res.setEncoding('utf8').once('data', console.log))"

// output:{"brand":"Gazelle","color":"red"}
```

supertest library is an excellent tool for testing Express services, see htt‌ps://github.com/visionmedia/supertest for more information.

## Web Security - Mitigating Attacks

Attacks can take various forms and have different goals.

Sometimes it can be about stealing information, either from the server or from other users. Other times it can just be about causing disruption. The most prevalent example of disruption-focussed attacks is via a Denial of Service (DOS) attack.

In the case of a Distributed Denial of Service (DDOS) attack this would mean automating a large amount of machines to each make a large amount of requests to a single service. Other Denial of Service (DOS) attacks may involve much fewer machines that make requests to an endpoint that has been identified as vulnerable to a payload (for instance one that decompresses to a much larger size). This topic in itself is extensive, and should mostly be handled by the infrastructure around a deployed Node.js service.

### Objective

Understand how to block an attackers IP in Express.
Understand how to block an attackers IP in Fastify.
Create plugins and use hooks in Fastify.

## Block an Attackers' IP Address with Express

Express is essentially a middleware pattern on top of Node's core http (and https) modules. The http (and https) modules use the net module for TCP functionality. Each req and res object that are provided to the request listener function (which is passed to http.createServer) have a socket property which is the underlying TCP socket for the request and response. So req.socket.remoteAddress will contain the IP address of the client making a request to an Express service.

Express passes the req and res objects to each piece of registered middleware in the order that they are registered, in order to block an attacking IP, all we need to do is register a middleware function before other middleware and check req.socket.remoteAddress.

```js
app.use(function (req, res, next) {
  if (req.socket.remoteAddress === '127.0.0.1') {
    const err = new Error('Forbidden');
    err.status = 403;
    next(err);
    return;
  }
  next();
});
```

Remember that a typical Express application has the following error handler middleware at the end of all registered middleware:

```js
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
```

When dealing with an adversarial opponent, it's sometimes better to misinform than to give valid feedback. For example, using a 404 Not Found status could be better than a 403 Forbidden status since a 404 is misleading.

## Block an Attackers' IP Address with Fastify

Conversely to Express, Fastify uses a plugin-based approach and provides an abstraction on top of the native req and res objects (request and reply) instead of adding directly to them as in Express. To get the IP address of a requesting client we use request.ip.

Fastify also provides a Hooks API, which allows us to intervene at various points of the request/response life-cycle. The first hook in the life-cycle is the onRequest hook.

In a typical Fastify application (as in one created with npm init fastify), custom service configuration should be performed through plugins. To configure the server to block an IP, we could create a file named deny.js placed into the plugins folder. This will be automatically loaded (since the app.js file uses fastify-autoload to load all plugins in the plugins folder).

```js
// plugins/deny.js

'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts) {
  fastify.addHook('onRequest', async function (request) {
    if (request.ip === '127.0.0.1') {
      const err = new Error('Forbidden')
      err.status = 403
      throw err
    }
  })
})
```

The fastify-plugin module de-encapsulates a plugin, making it apply to the entire service because plugins are registered by fastify-autoload at the top level. So we pass our plugin function to fp (fastify-plugin) as we want the onRequest hook to apply to the service as a whole.

A Fastify plugin is a function that either returns a promise or calls a callback and accepts the service instance (which we call fastify) and options (opts). We use an async function so a promise is returned automatically. We call the addHook method on the service instance (fastify.addHook), the first argument is a string identifying the hook we'd like to register (onRequest) and the second argument is an async function which is called and passed the request object for every incoming request. It's also passed the reply object but we don't need that for our purposes. We check whether request.ip matches our target IP and then throw an error with a status code of 403 if it does. Fastify automatically sets the status code to the status property of a thrown error if it exists.

Alternatively, if we have fastify-sensible installed, we could implement the plugins/deny.js plugin as follows:

```js
'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts) {
  fastify.addHook('onRequest', async function (request) {
    if (request.ip === '127.0.0.1') {
      throw fastify.httpErrors.forbidden()
    }
  })
})
```
