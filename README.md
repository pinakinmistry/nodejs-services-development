# NodeJS Services Development

## Express

```cmd
npm install -g express-generator
```

Even though the req and res objects are generated by the http module and have all of the same functionality, Express decorates the req and res objects with additional functionality. By conflating Node core APIs with Express APIs on the same objects the principles of least surprise and separation of concerns are violated, while also causing performance issues.

The express command-line executable that's installed by the express-generator module when globally installed generates a bin/www file that similarly allows the port to be specified via a PORT environment variable.

## Fastify

```cmd
npm init fastify

// --integrate flag can be executed in a directory with a package.json file to generate a project and also // update the preexisting package.json file:
npm init fastify -- --integrate
```

The npm init fastify command which generates a Fastify project uses fastify-cli to start the application, which automatically allows the PORT environment variable to specify the port.

## Serving web content

Static assets (content that does not change very often) should not be served by Node. Static content should be delivered via a CDN and/or a caching reverse proxy that specializes in static content such as NGINX or Varnish

Node.js could serve static content for applications with very small user bases that have a very low growth potential

Where Node.js shines however, is dynamic content. Using Node.js as a mediator for gathering data from multiple sources and rendering some output is perfect for such an evented language and non-blocking I/O platform

## Using templates with Fastify and HandlebarJS

Using three braces to denote an interpolation point is Handlebars syntax that instructs the template engine to conduct raw interpolation.

In other words, if the body template local contains HTML syntax the content will not be escaped whereas using two braces would cause HTML syntax to be escaped (for instance < would be escaped to &‌lt;). This should never be used when interpolating (uncleaned) user input into templates but when building a layout we need to inject raw HTML.

The body local is created automatically by point-of-view when rendering a view because we specified the layout option.

The point-of-view plugin that we registered in app.js decorated the reply instance with a view method. When we registered point-of-view, we set the root option to the views folder. Therefore, when we pass 'index.hbs' to reply.view it knows to look for index.hbs in the view folder. Similarly, the layout option that we set to 'layout.hbs' indicates to point-of-view that the layout template can be found in views/layout.hbs. So when we use reply.view here point-of-view first renders both the views/index.hbs file and then interpolates the rendered output into views/layout.hbs and sends the final rendered output of both files combined as the response. The return value of the reply.view method must be returned from the async function passed as the route handler so that Fastify knows when the route handler has finished processing the request.

## Serving static content and using templates with Express

The original focus of the Fastify framework was on building RESTful JSON services, whereas Express is more geared towards template rendering (and static serving static content). Therefore Express has these pieces built into its core whereas in Fastify template rendering is an add-on.

```cmd
npm install -g express-generator@4

express --hbs express-web-server

cd express-web-server
npm install

cd views
node -e "fs.openSync('hello.hbs', 'w')"
cd ..

cd routes
node -e "fs.renameSync('users.js', 'hello.js')"
cd ..

```

```js
// app.js

if (process.env.NODE_ENV !== 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
}
```

express instance has a method named static which returns Express middleware that will serve requests that match up with any files in the public folder.

Now static hosting will only occur in development and production static hosting is left as a deployment infrastructure problem.

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

Express has res.render built-in to its core and it works in essentially the same way as reply.render added by the point-of-view plugin when registered in a Fastify server - although at the time of writing Express v4 renders at about half the speed of Fastify's point-of-view in production.

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
return hnLatestStream(amount, type)
```

Returning the stream (the result of calling hnLatestStream) from the route handler instructs Fastify to safely pipe the stream to the response. The reply.send method can also be passed a stream and Fastify behaves in the same way - by piping the stream as the HTTP response.

Due to Fastify handling the stream for us, any errors in the stream will be handled and propagated. If we disconnect from the Internet and then attempt to access results in server error

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

var indexRouter = require('./routes/index');
var helloRouter = require('./routes/hello');
var articlesRouter = require('./routes/articles');

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

The second parameter, an object with a property named end set to false prevents pipe from performing its default behavior of endings the destination stream (res) when the source stream (stream) has ended. This is important because without this, if there is an error in the source stream then res will be ended before our server can send an appropriate error response.

# Restful JSON services

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
