# IV - Server Side with ExpressJS

## Midterm Assignment

1. Using the API developed in class in session 4a, create a backend that connects to your database on mLab.
2. Using the front end developed in class in session 4b, extend the interface to support creating a new database entry via a form, and a detail view of a recipe with a proper route so that the user can use the back button to return to the recipe listing on the home page.

## Reading

A good video on the [Fetch API](https://youtu.be/Oive66jrwBs)

## Building a Rest API

Take a peek at the [documentation](https://developer.github.com/v3/) for an API. Test this url in a browser: `https://api.github.com/users/12`.

Building a URL route scheme to map requests to app actions.

1. Run `$ npm init -y`
1. Setup Tooling and npm Installs `npm install --save express mongoose body-parser nodemon`
1. Create an npm script for nodemon (`npm run start`)

```js
"scripts": {
    "start": "nodemon app.js"
},
```

<!-- ### Mongo Demo

If desired, MongoDb can be installed on your computer for local and offline use. 

Start `mongod` in another Terminal tab (if it's not running already).

If you need help setting the permissions on the db folder [see this post](http://stackoverflow.com/questions/28987347/setting-read-write-permissions-on-mongodb-folder).

```sh
$ mongod
// should return waiting for connections on port 27017
```

Test it in another terminal tab:

```sh
$ which mongod
// the location of mongo
$ mongo
> show dbs
> exit
```

You can insert data using the mongo CLI:

```sh
$ mongo
> show dbs
> use rest-api
> show collections
> db.createCollection('recipes')
> db.recipes.insert( { "name": "Toast", "image": "toast.jpg", "description": "Tasty!" } )
> db.recipes.find()
```

Here is a [quick reference](https://docs.mongodb.com/manual/reference/mongo-shell/) to mongo shell commands. -->

### app.js

Create `app.js` for express at the top level of the folder:

```js
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// this line always appears before any routes
app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.send('Ahoy there');
});

app.listen(3001);
console.log('Server running at http://localhost:3001/');
```

`app.get('/')` is the primary route for the front end. The URL is the root of the site, the callback handler is an anonymous function, and the response is plain text for now.

[Body Parser](https://www.npmjs.com/package/body-parser) parses and places incoming requests in a `req.body` property so our handlers can use them.

Run the app using `npm start`. Remember to keep an eye on the nodemon process during this exercise to see if it is hanging.

### DEMO API Routes

Here is a fairly standard ExpressJS application using the Mongoose driver:

```js
// requires
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// variables
const app = express();
const Schema = mongoose.Schema;
const mongoUri = 'mongodb://devereld:dd2345@ds015730.mlab.com:15730/recipes-dd';

// schema
const RecipeSchema = new Schema({
  name: String,
  ingredients: Array
});

const Recipe = mongoose.model('Recipe', RecipeSchema);

// middleware
app.use(bodyParser.json());

// routes
app.get('/', function(req, res) {
  res.send('Ahoy there');
});

app.get('/api/recipes', function(req, res){
  Recipe.find({}, function(err, results) {
    return res.send(results);
  });
});

// initialization
mongoose.connect(mongoUri, { useNewUrlParser: true });

app.listen(3001);
console.log('Server running at http://localhost:3001/');
```

## Using CommonJS

We are going to use CommonJS components to organize our code.

### Controllers

Create a new folder `api` and a file inside called `recipe.controllers.js`. We'll export each handler and create the functions in this file one by one.

The are just empty functions for the moment.

```js
exports.findAll = function() {};
exports.findById = function() {};
exports.add = function() {};
exports.update = function() {};
exports.delete = function() {};
```

Note the use of `exports`. This makes the functions available for import elsewhere in a our application.

Update `app.js` to require our controllers (the .js file extension can be omitted):

```js
const recipes = require('./api/recipe.controllers');
```

Now we can call the functions in `recipe.controllers`.

Add the following to `app.js`:

```js
app.get('/api/recipes', recipes.findAll);
app.get('/api/recipes/:id', recipes.findById);
app.post('/api/recipes', recipes.add);
app.put('/api/recipes/:id', recipes.update);
app.delete('/api/recipes/:id', recipes.delete);
```

Each route consists of three parts:

* A specific HTTP Action (`get, put, post, delete`)
* A specific URL path (`/api/recipes/:id` etc.)
* A handler method (`findAll`)

The most common elements of a [REST application](http://www.restapitutorial.com/lessons/httpmethods.html) are accounted for here.

We've modeled our URL routes off of REST API conventions, and named our handling methods clearly - prefixing them with `api/` in order to differentiate them from any routes we create to serve the front end.

Note the `recipes.function` notation. We'll create a recipes controller file and placed all our request event handling methods inside the it.

<!-- ### Check if its working

Update findAll's definition in `recipe.controllers.js` to send a json snippet:

```js
exports.findAll = function(req, res) {
  res.send([
    {
      name: 'recipe1309',
      title: 'Lasagna',
      date: '2013-09-01',
      description:
        'Lasagna noodles piled high and layered full of three kinds of cheese to go along with the perfect blend of meaty and zesty, tomato pasta sauce all loaded with herbs.',
      image: 'lasagna.png'
    }
  ]);
};
```

3: Navigate to the specified route in `app.get('/api/recipes', recipes.findAll);`:

`localhost:3001/api/recipes`

You should see the json in the bowser. -->

### Define Data Models (Mongoose)

Rather than using the MongoClient as we did previously ( e.g. `const mongo = require('mongoDB').MongoClient;`), we will use [Mongoose](http://mongoosejs.com) to model application data and connect to our database. Here's the [quickstart guide](http://mongoosejs.com/docs/).

Mongoose is built upon the MongoDB driver we used previously so everything we are doing here would work with the original driver. However, Mongoose allows us to model our data - declare that the data be of a certain type, validate the data, and build queries.

Add a new file `recipe.model.js` to `api` for our Recipe Model.

Require Mongoose in this file, and create a new Schema object:

```js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RecipeSchema = new Schema({
  name: String,
  title: String,
  date: String,
  description: String,
  image: String
});

module.exports = mongoose.model('Recipe', RecipeSchema);
```

We require mongoose and create an instance of a mongoose Schema.

The schema makes sure we're getting and setting well-formed data to and from the Mongo collection. Our schema has five String properties which define a Recipe object.

The last line exports the RecipeShema together with Mongoose's built in Mongo interfacing methods. We'll refer to this Recipe object in other files.

### Using Mongoose Methods and Schema

1: Update `app.js` with these lines (in their appropriate locations):

```js
const mongoose = require('mongoose');

const mongoUri = 'mongodb://devereld:dd2345@ds015730.mlab.com:15730/recipes-dd';

mongoose.connect(mongoUri);
```

To use a different database, simply drop a different connection string into the `mongoUri` variable.

If we want to wrap our Express app startup inside the MongoDB connection it would look like:

```js
mongoose.connect(mongoUri, { useNewUrlParser: true }, () => {
  app.listen(3001);
  console.log('Server running at http://localhost:3001/');
});
```

2: Add a reference to our model `const recipeModels = require('./api/recipe.model');`:

```js
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const recipes = require('./api/recipe.controllers');
const recipeModels = require('./api/recipe.model');

const app = express();
const mongoUri = 'mongodb://devereld:dd2345@ds015730.mlab.com:15730/recipes-dd';

app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.send('Ahoy there');
});

app.get('/api/recipes', recipes.findAll);
app.get('/api/recipes/:id', recipes.findById);
app.post('/api/recipes', recipes.add);
app.put('/api/recipes/:id', recipes.update);
app.delete('/api/recipes/:id', recipes.delete);

mongoose.connect(mongoUri, { useNewUrlParser: true }, () => {
  app.listen(3001);
  console.log('Server running at http://localhost:3001/');
});
```

3: Update `api/recipe.controllers.js` to require Mongoose, so we can create an instance of our Recipe model to work with.

Add to the top of that file:

```js
const mongoose = require('mongoose');
const Recipe = mongoose.model('Recipe');
```

Error! Order is important. Change the require order in `app.js` to require the model _before_ the controllers.

```js
const recipeModels = require('./api/recipe.model');
const recipes = require('./api/recipe.controllers');
```

4: Update the `findAll()` function in `recipe.controllers` to query Mongo with the `find()` method.

```js
const mongoose = require('mongoose');
const Recipe = mongoose.model('Recipe');

exports.findAll = function(req, res) {
  Recipe.find({}, function(err, results) {
    return res.send(results);
  });
};
exports.findById = function() {};
exports.add = function() {};
exports.update = function() {};
exports.delete = function() {};
```

`Model.find()` is a [Mongoose query](https://mongoosejs.com/docs/queries.html) that takes an object and an optional callback function. Passing `find({})` with an empty object means we are not filtering and so to return all of it.

Once Mongoose looks up the data and returns a result set, we use `res.send()` to return the raw results.

Check that the server is still running and then visit the API endpoint for all recipes [localhost:3001/api/recipes](localhost:3001/api/recipes). You'll get JSON data back from the database - possibly an empty array `[]`.

### Importing Data

1: Add a new api route - `app.get('/api/import', recipes.import);` - to our list in `app.js`:

```js
app.get('/api/recipes', recipes.findAll);
app.get('/api/recipes/:id', recipes.findById);
app.post('/api/recipes', recipes.add);
app.put('/api/recipes/:id', recipes.update);
app.delete('/api/recipes/:id', recipes.delete);
app.get('/api/import', recipes.import);
```

2: define the import method in our controllers file - `recipe.controllers.js`:

```js
exports.import = function(req, res) {
  Recipe.create(
    {
      name: 'recipe1309',
      title: 'Lasagna',
      date: '2013-09-01',
      description:
        'Lasagna noodles piled high and layered full of three kinds of cheese to go along with the perfect blend of meaty and zesty, tomato pasta sauce all loaded with herbs.',
      image: 'lasagna.png'
    },
    {
      name: 'recipe1404',
      title: 'Pho-Chicken Noodle Soup',
      date: '2014-04-15',
      description:
        'Pho (pronounced "fuh") is the most popular food in Vietnam, often eaten for breakfast, lunch and dinner. It is made from a special broth that simmers for several hours infused with exotic spices and served over rice noodles with fresh herbs.',
      image: 'pho.png'
    },

    {
      name: 'recipe1210',
      title: 'Guacamole',
      date: '2016-10-01',
      description:
        'Guacamole is definitely a staple of Mexican cuisine. Even though Guacamole is pretty simple, it can be tough to get the perfect flavor - with this authentic Mexican guacamole recipe, though, you will be an expert in no time.',
      image: 'guacamole.png'
    },

    {
      name: 'recipe1810',
      title: 'Hamburger',
      date: '2012-10-20',
      description:
        'A Hamburger (often called a burger) is a type of sandwich in the form of  rounded bread sliced in half with its center filled with a patty which is usually ground beef, then topped with vegetables such as lettuce, tomatoes and onions.',
      image: 'hamburger.png'
    },
    function(err) {
      if (err) return console.log(err);
      return res.sendStatus(202);
    }
  );
};
```

`Recipe` refers to the mongoose Recipe model. `Model.create()` is a mongoose method

In Mongoose, there is Model.create and Collection.insert - the latter isn't strictly part of Mongoose, but of the underlying MongoDB driver.

This import method adds four items from the JSON to a recipes collection. The Recipe model is referenced here to call its create method. `Model.create()` takes one or more documents in JSON form, and a callback to run on completion. If an error occurs, Terminal will return the error and the request will timeout in the browser. On success, the 202 "Accepted" HTTP status code is returned to the browser.

Visit this new endpoint to import data:

[localhost:3001/api/import/](localhost:3001/api/import/)

Now visit the `http://localhost:3001/api/recipes` endpoint to view the new recipes data. You'll see an array of JSON objects, each in the defined schema, with an additional generated unique private `_id`.

### Facilitate Testing 

Review some of the [documentation](http://mongoosejs.com/docs/queries.html) for Mongoose and create a script to delete all recipes with [deleteMany](http://mongoosejs.com/docs/queries.html)

Add `app.get('/api/killall', recipes.killall);` to `app.js`:

```js
app.get('/api/recipes', recipes.findAll);
app.get('/api/recipes/:id', recipes.findById);
app.post('/api/recipes', recipes.add);
app.put('/api/recipes/:id', recipes.update);
app.delete('/api/recipes/:id', recipes.delete);
app.get('/api/import', recipes.import);
app.get('/api/killall', recipes.killall);
```

Add the corresponding function to the controllers file:

```js
exports.killall = function(req, res) {
  Recipe.deleteMany({ title: 'Lasagna' }, (err) => {
    if (err) return console.log(err);
    return res.sendStatus(202);
  })
};
```

In this example we are deleting only those recipes where the title is Lasagna. Change the filter `{ title: 'Lasagna' }` to `{}` to remove them all.

### Introducing Postman

Since modeling endpoints is a common task and few enjoy using curl (more on curl in a moment), most people use a utility such as [Postman](https://www.getpostman.com/).

Download and install it [here](https://www.getpostman.com/). You need not create an account to use it.

Test a GET in postman with `http://localhost:3001/api/recipes/`.


### Test the Model

Try removing date from `recipe.model` and importing again. The date property will be missing from the imported items.

Add it back, this time using a default created value of type Date:

```js
const RecipeSchema = new Schema({
  name: String,
  title: String,
  created: { 
    type: Date,
    default: Date.now
  },
  description: String,
  image: String
});
```

Test Mongoose by adding new properties to our recipes.

Edit the `import` function to include ingredients and preparation arrays:

```js
{
  "name": "recipe1309",
  "title": "Lasagna",
  "description": "Lasagna noodles piled high and layered full of three kinds of cheese to go along with the perfect blend of meaty and zesty, tomato pasta sauce all loaded with herbs.",
  "image": "lasagna.png",
  "ingredients": [
    "salt", "honey", "sugar", "rice", "walnuts", "lime juice"
  ],
  "preparation": [
    {"step": "Boil water"}, {"step": "Fry the eggs"}, {"step": "Serve hot"}
  ]
},
{
  "name": "recipe1404",
  "title": "Pho-Chicken Noodle Soup",
  "description": "Pho (pronounced \"fuh\") is the most popular food in Vietnam, often eaten for breakfast, lunch and dinner. It is made from a special broth that simmers for several hours infused with exotic spices and served over rice noodles with fresh herbs.",
  "image": "pho.png",
  "ingredients": [
    "salt", "honey", "sugar", "rice", "walnuts", "lime juice"
  ],
  "preparation": [
    {"step": "Boil water"}, {"step": "Fry the eggs"}, {"step": "Serve hot"}
  ]
},

{
  "name": "recipe1210",
  "title": "Guacamole",
  "description": "Guacamole is definitely a staple of Mexican cuisine. Even though Guacamole is pretty simple, it can be tough to get the perfect flavor - with this authentic Mexican guacamole recipe, though, you will be an expert in no time.",
  "image": "guacamole.png",
  "ingredients": [
    "salt", "honey", "sugar", "rice", "walnuts", "lime juice"
  ],
  "preparation": [
    {"step": "Boil water"}, {"step": "Fry the eggs"}, {"step": "Serve hot"}
  ]
},

{
  "name": "recipe1810",
  "title": "Hamburger",
  "description": "A Hamburger (often called a burger) is a type of sandwich in the form of  rounded bread sliced in half with its center filled with a patty which is usually ground beef, then topped with vegetables such as lettuce, tomatoes and onions.",
  "image": "hamburger.png",
  "ingredients": [
    "salt", "honey", "sugar", "rice", "walnuts", "lime juice"
  ],
  "preparation": [
    {"step": "Boil water"}, {"step": "Fry the eggs"}, {"step": "Serve hot"}
  ]
}
```

If you delete with `killall` and reload the sample data, it will not inlcude the arrays.

Add new properties to our Recipe schema.

```js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RecipeSchema = new Schema({
  name: String,
  title: String,
  created: { 
    type: Date,
    default: Date.now
  },
  description: String,
  image: String,
  ingredients: Array,
  preparation: Array
});

module.exports = mongoose.model('Recipe', RecipeSchema);
```

Kill and reimport the data. The data may be in a different order than in the schema. (There is no order in objects, so the order shouldn't matter but if it did then you'd want an array.)

### Find By id

Recall our route for getting an entry by id: `app.get('/recipes/:id', recipes.findById)`.

Add the handler method to `recipe.controllers.js`:

```js
exports.findById = function(req, res) {
  const id = req.params.id;
  Recipe.findOne({ _id: id }, (err, result) => {
    return res.send(result);
  });
};
```

This route's path uses a parameter pattern for id `/recipes/:id` which we can refer to in `req` to look up and return just one document.

At your findAll endpoint `http://localhost:3001/api/recipes`, copy one of the ids, paste it in at the end of the current url in the browser and refresh. You'll get a single JSON object for that one recipe's document.

e.g. `http://localhost:3001/api/recipes/< id goes here >`

### Add a Recipe

We used `create()` for our import function inn order to add multiple documents to our Recipes Mongo collection. Our POST handler uses the same method to add a single Recipe to the collection. Once added, the response is the full new Recipe's JSON object.

Edit `recipe-controllers.js`:

```js
exports.add = function(req, res) {
  Recipe.create(req.body, function(err, recipe) {
    if (err) return console.log(err);
    return res.send(recipe);
  });
};
```

In a new tab - use cURL to POST to the add endpoint with the full Recipe JSON as the request body (making sure to check the URL port and path).

```bash
curl -i -X POST -H 'Content-Type: application/json' -d '{"title": "Toast", "image": "toast.png", "description":"Tasty!"}' http://localhost:3001/api/recipes
```

### Create a new Recipe in Postman

1. Set Postman to POST, set the URL in Postman to `http://localhost:3001/api/recipes/`
1. Choose `raw` in `Body` and set the text type to `JSON(application/json)`
1. Set Body to `{"title": "Toast", "image": "toast.jpg", "description":"Postman? Tasty!"}`
1. Hit `Send`

Refresh `http://localhost:3001/recipes` or use Postman's history to see the new entry at the end.

Save your query in Postman to a new collection.

### Delete

Our next REST endpoint, delete, reuses what we've done above. Add this to `recipe.controllers.js`.

```js
exports.delete = function(req, res) {
  let id = req.params.id;
  Recipe.remove({ _id: id }, (result) => {
    return res.send(result);
  });
};
```

Check it out with curl (replacing the id at the end of the URL with a known id from you `api/recipes` endpoint):

```sh
curl -i -X DELETE http://localhost:3001/api/recipes/5addfa2fbc204c12425d85d4
```

Or by a Delete action in Postman.

1. Set the action to Delete
2. Append an id from the recipes endpoint to the /api/recipes endpoint
3. Hit Send (e.g.: `http://localhost:3001/api/recipes/58c39048b3ddce0348706837`)

While we are here let's add these lines to `app.js` together with the other `app.use` middleware:

```js
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  next()
})
```

Comment them out, we'll need them later.

## Notes

https://code.tutsplus.com/articles/an-introduction-to-mongoose-for-mongodb-and-nodejs--cms-29527