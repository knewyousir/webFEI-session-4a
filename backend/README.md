# MEAN Session Seven

## Homework

1. prepare your midterm - use with files from session 6, add an api for recipes that displays a summary on the master view and recipes on the detail view.
1. install the [Angular generator](https://github.com/angular/angular-cli)

On a mac: `sudo npm install -g @angular/cli`

On a PC - run Powershell as Admin and `npm install -g @angular/cli`

## Building a Rest API

Building a URL route scheme to map requests to app actions.

1. Run `$ npm init -y` 
1. Setup Tooling and npm Installs `npm install --save express mongoose body-parser`
1. Create an npm script for nodemon (`npm run start`)

```js
"scripts": {
    "start": "nodemon app.js"
},
```

### Mongo Demo

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

#### Body Parser

[Body Parser](https://www.npmjs.com/package/body-parser) parses and places incoming requests in a `req.body` property so our handlers can use them.

#### app.js

Create `app.js` for express at the top level of the folder:

```js
const express = require('express');
const app = express();
const bodyParser = require('body-parser')

// make sure this line always appears before any routes
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send('Ahoy there');
});

app.listen(3001);
console.log('Server running at http://localhost:3001/');
```

`app.get` is our test route to make sure everything is running correctly.

The URL path is the root of the site, the handling method is an anonymous function, and the response is plain text.

Run the app using `npm run start`.

Make a change to res.send in app.js to check that the server restarts. (Keep an eye on the nodemon process during this exercise to see if it is hanging.)

## API Routes

An api route is a predefined URL path that our API responds to, e.g.:

```js
app.get('/api/recipes', findAll);

function findAll(req, res){
    res.send(
        [{
            "name": "recipe1309",
            "title": "Lasagna",
            "date": "2013-09-01",
            "description": "Lasagna noodles piled high and layered full of three kinds of cheese to go along with the perfect blend of meaty and zesty, tomato pasta sauce all loaded with herbs.",
            "image": "lasagne.png"
        }]
        )
};
```

For better organization (at the cost of a bit of complexity) we will create separate modules for our routes and their associated controllers in a new `src` directory.

Add routes.js to `/src/recipe.routes.js`.

```js
const recipes = require('./recipe.controllers');

const recipeRoutes = function(app) {
    app.get('/api/recipes', recipes.findAll);
    app.get('/api/recipes/:id', recipes.findById);
    app.post('/api/recipes', recipes.add);
    app.put('/api/recipes/:id', recipes.update);
    app.delete('/api/recipes/:id', recipes.delete);
}

module.exports = recipeRoutes;
```

Each route consists of three parts:

* A specific HTTP Action (get, post...)
* A specific URL path (/api/piates...)
* A handler method (findAll)

Note: `module.exports` - the object that's returned as the result of a require call we will use in `app.js`.

All the main elements of a [REST application](http://www.restapitutorial.com/lessons/httpmethods.html) - GET, POST, PUT, DELETE - http actions are accounted for here.

We've modeled our URL routes off of REST API conventions, and named our handling methods clearly - prefixing them with `api/` in order to differentiate them from routes we create within Angular.

Note the require statement. We'll create a recipes controller and placed all our request event handling methods inside the it.

### Controllers

Create a new file inside of `src` called `recipe.controllers.js`. We'll add each request handling method for recipes data to this file one by one.

The are just empty functions for the moment.

```js
exports.findAll = function () { };
exports.findById = function () { };
exports.add = function () { };
exports.update = function () { };
exports.delete = function () { };
```

### Check if its working

1: Update `app.js` to require our routes file (the .js file extension can be omitted): `const routes = require('./src/recipe.routes');`

NOTE: we are also creating the appRoutes variable to call the function in recipe.routes: `const recipeRoutes = function(app)`

```js
const express = require('express');
const app = express();
const bodyParser = require('body-parser')

// make sure this line always appears before any routes
app.use(bodyParser.json());

const routes = require('./src/recipe.routes');
const appRoutes = routes(app);


app.get('/', function (req, res) {
    res.send('Ahoy there');
});

app.listen(3001);
console.log('Server running at http://localhost:3001/');
```

2: Update findAll's definition in `recipe.controllers.js` to send a json snippet:

```js
exports.findAll = function (req, res) {
  res.send(
    [{
        "name": "recipe1309",
        "title": "Lasagna",
        "date": "2013-09-01",
        "description": "Lasagna noodles piled high and layered full of three kinds of cheese to go along with the perfect blend of meaty and zesty, tomato pasta sauce all loaded with herbs.",
        "image": "lasagna.png"
    }]
    )
};
```

3: Navigate to the specified route in `app.get('/api/recipes', recipes.findAll);`:

`localhost:3001/api/recipes`

You should see the json in the bowser.

### Define Data Models (Mongoose)

Rather than using the MongoClient ( e.g. `const mongo = require('mongoDB').MongoClient;`), we will use [Mongoose](http://mongoosejs.com) to model application data. Here's the [quickstart guide](http://mongoosejs.com/docs/).

Mongoose is built upon the MongoDB driver we used previously so everything we are doing here would work with the original driver. However, Mongoose allows us to model our data - declare that the data be of a certain type, validate the data, and build queries. This is something that is integral to TypeScript and so will be unnecessary in our future work with Angular 2+.

Add a new file `recipe.model.js` to `src` for our Recipe Model.

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

This schema makes sure we're getting and setting well-formed data to and from the Mongo collection. Our schema has five String properties which define a Recipe object.

The last line creates and exports the Recipe model object, with built in Mongo interfacing methods. We'll refer to this Recipe object in other files.

1: Update `app.js` with

```js
const mongoose = require('mongoose');
const mongoUri = 'mongodb://localhost/rest-api';
// or use an online db e.g.:
// const mongoUri = 'mongodb://devereld:dd2345@ds015730.mlab.com:15730/recipes-dd';
mongoose.connect(mongoUri);
```

Note: to use a different database, simply provide a different connection string to the mongoUri variable:

```js
const mongoUri = 'mongodb://devereld:dd2345@ds015730.mlab.com:15730/recipes-dd';
```

2: Add a reference to our model `const recipeModels = require('./src/recipe.model');`:

```js
const express = require('express');
const app = express();
const bodyParser = require('body-parser')

const mongoose = require('mongoose');
// const mongoUri = 'mongodb://localhost/rest-api';
// or use an online db e.g.:
const mongoUri = 'mongodb://devereld:dd2345@ds015730.mlab.com:15730/recipes-dd';

mongoose.connect(mongoUri);

// make sure this line always appears before any routes
app.use(bodyParser.json());

const recipeModels = require('./src/recipe.model');

const routes = require('./src/recipe.routes');
const appRoutes = routes(app);


app.get('/', function (req, res) {
    res.send('Ahoy there');
});

app.listen(3001);
console.log('Server running at http://localhost:3001/');
```

3: Update `src/recipe.controllers.js` to require Mongoose, so we can create an instance of our Recipe model to work with.

```js
const mongoose = require('mongoose');
const Recipe = mongoose.model('Recipe');
```

At the top of the script. e.g.:

```js
const mongoose = require('mongoose');
const Recipe = mongoose.model('Recipe');

exports.findAll = function(req, res){
    res.send(
    [{
        "name": "recipe1309",
        "title": "Lasagna",
        "date": "2013-09-01",
        "description": "Lasagna noodles piled high and layered full of three kinds of cheese to go along with the perfect blend of meaty and zesty, tomato pasta sauce all loaded with herbs.",
        "image": "lasagne.png"
    }]
    )
};
exports.findById = function () { };
exports.add = function () { };
exports.update = function () { };
exports.delete = function () { };
```

4: in `recipe.controllers`: update the `findAll()` function to query Mongo with the `find()` data model method.

```js
const mongoose = require('mongoose');
const Recipe = mongoose.model('Recipe');

exports.findAll = function (req, res) {
    Recipe.find({}, function (err, results) {
        return res.send(results);
    });
};
exports.findById = function () { };
exports.add = function () { };
exports.update = function () { };
exports.delete = function () { };
```

`find()` is a [mongoose method](https://docs.mongodb.com/manual/reference/method/js-collection/). Passing `find(){}` means we are not filtering data by any of its properties and so to return all of it.

Once Mongoose looks up the data it returns a result set. Use `res.send()` to return the raw results.

Check that the server is still running and then visit the API endpoint for all recipes `localhost:3001/api/recipes`. You'll get JSON data back from the database - an empty array `[]`.

### Importing Data

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

Here is a [quick reference](https://docs.mongodb.com/manual/reference/mongo-shell/) to mongo shell commands.

Rather than use the Mongo command-line to insert entries into our collection, let's import recipe data with our REST API. Add a new route endpoint to `recipe.routes.js`.

1: Add to `recipe.routes.js`:

```js
app.get('/api/import', recipes.import);
```

e.g.:

```js
const recipes = require('./recipe.controllers');

const recipeRoutes = function(app) {
    app.get('/api/recipes', recipes.findAll);
    app.get('/api/recipes/:id', recipes.findById);
    app.post('/api/recipes', recipes.add);
    app.put('/api/recipes/:id', recipes.update);
    app.delete('/api/recipes/:id', recipes.delete);

    app.get('/api/import', recipes.import);
}

module.exports = recipeRoutes;
```

2: define the import method in our controller `recipe.controllers.js`:

```js
exports.import = function (req, res) {
    // Recipe below refers to the mongoose schema. create() is a mongoose method
    Recipe.create(
    {
    "name": "recipe1309",
    "title": "Lasagna",
    "date": "2013-09-01",
    "description": "Lasagna noodles piled high and layered full of three kinds of cheese to go along with the perfect blend of meaty and zesty, tomato pasta sauce all loaded with herbs.",
    "image": "lasagne.png"
  },
  {
    "name": "recipe1404",
    "title": "Pho-Chicken Noodle Soup",
    "date": "2014-04-15",
    "description": "Pho (pronounced \"fuh\") is the most popular food in Vietnam, often eaten for breakfast, lunch and dinner. It is made from a special broth that simmers for several hours infused with exotic spices and served over rice noodles with fresh herbs.",
    "image": "pho.png"
  },

  {
    "name": "recipe1210",
    "title": "Guacamole",
    "date": "2016-10-01",
    "description": "Guacamole is definitely a staple of Mexican cuisine. Even though Guacamole is pretty simple, it can be tough to get the perfect flavor - with this authentic Mexican guacamole recipe, though, you will be an expert in no time.",
    "image": "guacamole.png"
  },

  {
    "name": "recipe1810",
    "title": "Hamburger",
    "date": "2012-10-20",
    "description": "A Hamburger (often called a burger) is a type of sandwich in the form of  rounded bread sliced in half with its center filled with a patty which is usually ground beef, then topped with vegetables such as lettuce, tomatoes and onions.",
    "image": "hamburger.png"
  }
        , function (err) {
            if (err) return console.log(err);
            return res.send(202);
        });
};
```

This import method adds four items from the JSON to a recipes collection. The Recipe model is referenced here to call its create method. create() takes one or more documents in JSON form, and a callback to run on completion. If an error occurs, Terminal will return the error and the request will timeout in the browser. On success, the 202 "Accepted" HTTP status code is returned to the browser.

Visit this new endpoint to import data.

`localhost:3001/api/import/`

Now visit the `http://localhost:3001/api/recipes` endpoint to view the new recipes data. You'll see an array of JSON objects, each in the defined schema, with an additional generated unique private `_id` and internal `__v` version key (added by Mongo to track changes or revisions).

#### Find By id

Recall our route for getting an entry by id: `app.get('/recipes/:id', recipes.findById)`.

Add the handler method to `recipe.controllers.js`:

```js
exports.findById = function (req, res) {
    const id = req.params.id;
    Recipe.findOne({ '_id': id }, function (err, result) {
        return res.send(result);
    });
};
```

This route's path uses a parameter pattern for id `/recipes/:id` which we can refer to in `req` to look up and return just one document.

At your findAll endpoint `http://localhost:3001/api/recipes`, copy one of the ids, paste it in at the end of the current url in the browser and refresh. You'll get a single JSON object for that one recipe's document.

e.g. `http://localhost:3001/api/recipes/5ada037e7e9b14543f33ebbf`

#### Add a Recipe

We used create() for our import function to add multiple documents to our Recipes Mongo collection. Our POST handler uses the same method to add a single Recipe to the collection. Once added, the response is the full new Recipe's JSON object.

`recipe-controllers.js`:

```js
exports.add = function (req, res) {
    Recipe.create(req.body, function (err, recipe) {
        if (err) return console.log(err);
        return res.send(recipe);
    });
}
```

In a new tab - use cURL to POST to the add endpoint with the full Recipe JSON as the request body (making sure to check the URL port and path).

```bash
curl -i -X POST -H 'Content-Type: application/json' -d '{"title": "Toast", "image": "toast.jpg", "description":"Tasty!"}' http://localhost:3001/api/recipes
```

### Introducing Postman

Since modelling endpoints is a common task and few enjoy using curl, most people use a utility such as [Postman](https://www.getpostman.com/).

Download and install it.

Test a GET in postman with `http://localhost:3001/api/recipes/`

#### Create a new Recipe in Postman

1. Set Postman to POST, set the URL in Postman to `http://localhost:3001/api/recipes/`
1. Choose `raw` in `Body` and set the text type to JSON(application/json)
1. Set Body to `{"title": "Toast", "image": "toast.jpg", "description":"Postman? Tasty!"}`
1. Hit `Send`

Refresh `http://localhost:3001/recipes` to see the new entry at the end.

Save your query in Postman to a new collection.

#### Delete

Our next REST endpoint, delete, reuses what we've done above. Add this to `recipe.controllers.js`.

```js
exports.delete = function (req, res) {
    let id = req.params.id;
    Recipe.remove({ '_id': id }, function (result) {
        return res.send(result);
    });
};
```

Check it out with curl (replacing the id at the end of the URL with a known id from you `api/recipes` endpoint):

```sh
curl -i -X DELETE http://localhost:3001/api/recipes/5addfa2fbc204c12425d85d4
```

Or by a Delete action in Postman.

1: Set the action to Delete

2: Append an id from the recipes endpoint to the /api/recipes endpoint

3: Hit Send (e.g.: `http://localhost:3001/api/recipes/58c39048b3ddce0348706837`)

## Building a Front End for Our API

Open and examine `static/index.html`. Note `<html ng-app="recipeApp">` and `<script src="/js/recipe.module.js"></script>`.

Note the `('/')` route in `app.js` to send the index file:

```js
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html')
})
```

And the static directory for our assets to app.js:

`app.use(express.static('static'))`

Since we are not bundling in this project we will add js files to the static folder.

Create `static/js/recipe.module.js` and add:

```js
const app = angular.module('recipeApp', []);
```

Let's run a test by using `$http` to pull in data from our API.

```js
const app = angular.module('recipeApp', []);

app.controller('RecipeAppController', function ($scope, $http) {
    $http.get('/api/recipes')
    .then( (res) => {
        $scope.recipes = res.data;
    });
});
```

Edit index.html:

```html
<body ng-controller="RecipeAppController">
    <h1>Recipe List</h1>
    <ul>
        <li ng-repeat="recipe in recipes"  class="fade">
            {{ recipe.title }}
            <span>✖︎</span>
        </li>
    </ul>
</body>
```

and test.

### Deleting a Recipe

Wire up the `deleteRecipe` function with `ng-click`:

```html
<ul>
    <li ng-repeat="recipe in recipes" class="fade">
        {{ recipe.title }} | {{ recipe._id }}
        <span ng-click="deleteRecipe(recipe._id)">✖︎</span>
    </li>
</ul>
```

Add a delete function to the controller in `recipe.module.js`:

```js
$scope.deleteRecipe = (recipeid) => $http.delete('/api/recipes/' + recipeid);
```

e.g.:

```js
const app = angular.module('recipeApp', []);

app.controller('RecipeAppController', ($scope, $http) => {
  $http.get('/api/recipes').then( (res) => {$scope.recipes = res.data});

  $scope.deleteRecipe = (recipeid) => $http.delete('/api/recipes/' + recipeid);

});
```

Clicking on an X will remove a recipe but you need to refresh to see the result. It has no effect on the view ($scope).

Pass the `$index` of the selected recipe to the function:

```html
<ul>
    <li ng-repeat="recipe in recipes" class="fade">
        {{ recipe.title }} / {{ recipe._id }}
        <span ng-click="deleteRecipe($index, recipe._id)">✖︎</span>
    </li>
</ul>
```

Add a promise and use the Array method [splice](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice) on the index to update the scope.

Catch the index in the function (`(index, recipeid)`) and call `then` on it to `splice` the array in scope:

```js
  $scope.deleteRecipe = (index, recipeid) => $http.delete(`/api/recipes/${recipeid}`)
  .then( () => $scope.recipes.splice(index, 1));
```

Changes to the db persist and are relected in the view.

### Animation

Set up the project preferences:

```js
{
  "liveSassCompile.settings.formats": [
    {
      "savePath": "/rest-api/static/css/",
      "format": "expanded"
    }
  ],
  "liveSassCompile.settings.excludeList": ["**/node_modules/**", ".vscode/**", "**/other/**"]
}
```

Inject `ng-animate` as a dependency in the module:

`const app = angular.module('recipeApp', ['ngAnimate']);`

Note the class `fade` on the `li`'s in the html.

Add this css to `_base.css`:

```css
ul li:nth-child(odd) {background: #bada55;}

.fade.ng-enter {
  animation: 2s appear;
}
.fade.ng-leave {
  animation: 0.5s disappear;
}

@keyframes appear {
  from {
    opacity: 0;
    transform: translateX(-200px);
  }
  to {
    opacity: 1;
  }
}
@keyframes disappear {
    0% {
        opacity: 1;
    }
    50% {
        font-size: 0.75rem;
    }
    75% {
        color: green;
    }
    100% {
        opacity: 0;
        transform: translateX(-100%);
    }
}
```

Delete all your recipes and navigate to `http://localhost:3001/api/import` to re-import them.

Refactor module

Create `js/recipe-list.template.html` from the current contents of the html, e.g.:

```html
  <h1>Recipe List</h1>
  <ul>
    <li ng-repeat="recipe in recipes">
        {{ recipe.title }} {{ recipe._id }}
        <span ng-click="deleteRecipe($index, recipe._id)">✖︎</span>
    </li>
  </ul>
```

Refactor the module to create a component:

```js
const app = angular.module('recipeApp', ['ngAnimate']);

app.component('recipeList', {
    templateUrl: '/js/recipe-list.template.html',
    controller: function RecipeAppController($http, $scope){
        $http.get('/api/recipes').
        then( (res) => {
            $scope.recipes = res.data;
        })

        $scope.deleteRecipe = function(index, recipeid) {
            $http.delete('/api/recipes/' + recipeid)
            .then( () => $scope.recipes.splice(index, 1))
        }
    }
})
```

Feed the component to the view:

```html
<body>
    <recipe-list></recipe-list>
</body>
```

#### Update a Recipe

`put` HTTP actions in a REST API correlate to an Update method.

The route for Update also uses an :id parameter.

In `recipe.controllers.js`:

```js
exports.update = function (req, res) {
    const id = req.params.id;
    const updates = req.body;

    Recipe.update({ '_id': id }, updates,
        function (err) {
            if (err) return console.log(err);
            return res.sendStatus(202);
        });
};
```

Notice the updates variable storing the `req.body`. `req.body` is useful when you want to pass in larger chunks of data like a single JSON object. Here we will pass in a JSON object (following the schema) of only the model's properties you want to change.

The model's update() takes three parameters:

* JSON object of matching properties to look up the doc with to update
* JSON object of just the properties to update
* callback function that returns any errors

### Test with Curl

We will need to construct this line using ids from the recipes listing and test it in a new Terminal tab. Edit the URL to reflect both the port and id of the target recipe:

```sh
curl -i -X PUT -H 'Content-Type: application/json' -d '{"title": "Big Mac"}' http://localhost:3001/api/recipes/5addfeb29fc8b0739881db35
```

This sends a JSON Content-Type PUT request to our update endpoint. That JSON object is the request body, and the long hash at the end of the URL is the id of the recipe we want to update.

Visit the same URL from the cURL request in the browser to see the changes.

PUT actions are cumbersome to test in the browser, so we'll use Postman to run through the process of editing a recipe above.

1: Set the action to put and the url to a single entry with an id.

2: Set the body to `raw` and the `text` header to application/json

3: put `{ "name": "Toast", "image": "toast.jpg", "description": "Tasty!" }`

4: Test to see changes

## Adding Forms to Interface With Our API

### Add Recipe

1: Add a form to the template:

```html
<h1>Recipe List</h1>
<ul>
    <li ng-repeat="recipe in recipes" class="fade">
        {{ recipe.title }} {{ recipe._id }}
        <span ng-click="deleteRecipe($index, recipe._id)">✖︎</span>
    </li>
</ul>

<form ng-submit="addRecipe(recipe)">
    <input type="text" ng-model="recipe.name" required placeholder="Name" />
    <input type="text" ng-model="recipe.title" required placeholder="Title" />
    <input type="text" ng-model="recipe.date" required placeholder="Date" />
    <textarea type="text" ng-model="recipe.description" required placeholder="Description"></textarea>
    <input type="text" ng-model="recipe.image" required placeholder="Image" />
    <button type="submit">Add Recipe</button>
</form>
```

2: Add to `recipe.module.js`:

```js
$scope.addRecipe = function (data) {
    $http.post('/api/recipes/', data)
        .then( () => {
            $scope.recipes.push(data);
        })
};
```

3: Test by adding a recipe

Note the lack of an id and the persistance of the form elements. Edit the push to use the data returned by the response:

```js
    $scope.addRecipe = function (data) {
      $http.post('/api/recipes/', data)
      .then( (res) => {
          console.log(res.data)
          $scope.recipes.push(res.data);
          $scope.recipe = {};
      })
  };
```

The complete component:

```js
const app = angular.module('recipeApp', ['ngAnimate']);

app.component('recipeList', {
  templateUrl: '/js/recipe-list.template.html',
  controller: function RecipeAppController($http, $scope){
    $http.get('/api/recipes').
    then( (res) => {
      $scope.recipes = res.data;
    })

    $scope.deleteRecipe = function(index, recipeid) {
      $http.delete('/api/recipes/' + recipeid)
      .then( () => $scope.recipes.splice(index, 1))
    }
    $scope.addRecipe = function (data) {
      $http.post('/api/recipes/', data)
      .then( (res) => {
          $scope.recipes.push(res.data);
          $scope.recipe = {};
      })
  };
  }
})
```

### Create a detail view

Inject ngRoute

```js
const app = angular.module('recipeApp', ['ngAnimate', 'ngRoute']);
```

Add Routing

```js
app.config(function config($locationProvider, $routeProvider) {
  $routeProvider.
    when('/', {
        template: '<recipe-list></recipe-list>'
    }).
    when('/recipes/:recipeId', {
        template: '<recipe-detail></recipe-detail>'
    }).
    otherwise('/');
    $locationProvider.html5Mode(true);
  });
```

Add in the head of index.html:

`<base href="/">`

Add ng-view to index.html:

```html
<body>
    <div ng-view></div>
</body>
```

### Recipe Detail Template

We will allow the user to edit a recipe in the detail view. We will show and hide the editor in the UI using Angular's [ng-show / hide](https://docs.angularjs.org/api/ng/directive/ngShow) function.

Create `js/recipe-detail.template.html`:

```html
<h1>Recipe Detail View</h1>
<div ng-hide="$ctrl.editorEnabled">
    <dl>
        <dt>Title</dt>
        <dd>{{ $ctrl.recipe.title }}</dd>
        <dt>Date</dt>
        <dd>{{ $ctrl.recipe.date }}</dd>
        <dt>Description</dt>
        <dd>{{ $ctrl.recipe.description }}</dd>
        <dt>Image</dt>
        <dd>{{ $ctrl.recipe.image }}</dd>
        <dt>ID</dt>
        <dd>{{ $ctrl.recipe._id }}</dd>
    </dl>
    <button ng-click="$ctrl.toggleEditor($ctrl.recipe)">Edit</button>
</div>
<div ng-show="$ctrl.editorEnabled">
    <form ng-submit="$ctrl.saveRecipe($ctrl.recipe, $ctrl.recipe._id)" name="updateRecipe">
        <label>Title</label>
        <input ng-model="$ctrl.recipe.title">
        <label>Date</label>
        <input ng-model="$ctrl.recipe.date">
        <label>Description</label>
        <input ng-model="$ctrl.recipe.description">
        <label>Image</label>
        <input ng-model="$ctrl.recipe.image">
        <label>ID</label>
        <input ng-model="$ctrl.recipe._id">
        <input type="submit" value="Save">
    </form>
</div>

<button type="submit" ng-click="$ctrl.back()">Back</button>
```

Add a link using the id `href="/recipes/{{ recipe._id }}"` to the existing `recipe-list.template`:

```html
<ul>
  <li ng-repeat="recipe in recipes" class="fade">
      <a href="/recipes/{{ recipe._id }}">{{ recipe.title }} / {{ recipe._id }}</a>
      <span ng-click="deleteRecipe($index, recipe._id)">✖︎</span>
  </li>
</ul>
```

2: Create a `recipeDetail` component.

Use $http.get and $routeParams to grab the info from our api route:

```js
app.component('recipeDetail', {
  templateUrl: '/js/recipe-detail.template.html',
  controller:  function RecipeDetailController($http, $routeParams) {
      $http.get('/api/recipes/' + $routeParams.recipeId)
      .then((response) => this.recipe = response.data);
  }
})
```

Test - you should now be able to view the detail template.

Due to routes in `app.js` refreshing a detail page will not work.

We can try the following in `app.js`

```js
app.get('*', (req, res) => {
    res.sendFile(__dirname + '/static/index.html');
});
```

#### Back button

Note the use of `$ctrl` and `this` here instead of $scope.

```js
this.back = () => window.history.back();
```

e.g.:

```js
app.component('recipeDetail', {
  templateUrl: '/js/recipe-detail.template.html',
  controller:  function RecipeDetailController($http, $routeParams) {
      $http.get('/api/recipes/' + $routeParams.recipeId)
      .then((response) => this.recipe = response.data);

      this.back = () => window.history.back();
  }
})
```

#### Edit Button

Toggling the editor interface:

```js
this.editorEnabled = false;
this.toggleEditor = () => this.editorEnabled = !this.editorEnabled;
```

e.g.:

```js
app.component('recipeDetail', {
  templateUrl: '/js/recipe-detail.template.html',
  controller:  function RecipeDetailController($http, $routeParams) {
      $http.get('/api/recipes/' + $routeParams.recipeId)
      .then((response) => this.recipe = response.data);

    this.back = () => window.history.back();

    this.editorEnabled = false;
    this.toggleEditor = () => this.editorEnabled = !this.editorEnabled;
  }
})
```

Test this by changing the value to true:

`this.editorEnabled = true;`

Add a button that only shows when the editor is on:

```html
<button type="cancel" ng-click="$ctrl.toggleEditor()">Cancel</button>
```

e.g.:

```html
<div ng-show="$ctrl.editorEnabled">
    <form ng-submit="$ctrl.saveRecipe($ctrl.recipe, $ctrl.recipe._id)" name="updateRecipe">
        <label>Title</label>
        <input ng-model="$ctrl.recipe.title">
        <label>Date</label>
        <input ng-model="$ctrl.recipe.date">
        <label>Description</label>
        <input ng-model="$ctrl.recipe.description">
        <label>Image</label>
        <input ng-model="$ctrl.recipe.image">
        <label>ID</label>
        <input ng-model="$ctrl.recipe._id">
        <input type="submit" value="Save">
    </form>
    <button type="cancel" ng-click="$ctrl.toggleEditor()">Cancel</button>
</div>
<button type="submit" ng-click="$ctrl.back()">Back</button>
```

Update the controller with a save recipe function:

```js
this.saveRecipe = (recipe, recipeid) => {
    $http.put('/api/recipes/' + recipeid, recipe)
    .then((res) => this.editorEnabled = false )
}
```

e.g.:

```js
app.component('recipeDetail', {
  templateUrl: '/js/recipe-detail.template.html',
  controller:  function RecipeDetailController($http, $routeParams) {
      $http.get('/api/recipes/' + $routeParams.recipeId)
      .then((response) => this.recipe = response.data);

    this.back = () => window.history.back();

    this.editorEnabled = false;
    this.toggleEditor = () => this.editorEnabled = !this.editorEnabled;

    this.saveRecipe = (recipe, recipeid) => {
      $http.put('/api/recipes/' + recipeid, recipe)
      .then((res) => this.editorEnabled = false )
  }}
})
```

And test.

### Notes

The final recipe.module:

```js
const app = angular.module('recipeApp', ['ngAnimate', 'ngRoute']);

app.config(function config($locationProvider, $routeProvider) {
  $routeProvider.
    when('/', {
        template: '<recipe-list></recipe-list>'
    }).
    when('/recipes/:recipeId', {
        template: '<recipe-detail></recipe-detail>'
    }).
    otherwise('/');
    $locationProvider.html5Mode(true);
  }
);

app.component('recipeDetail', {
  templateUrl: '/js/recipe-detail.template.html',
  controller:  function RecipeDetailController($http, $routeParams) {
      $http.get('/api/recipes/' + $routeParams.recipeId)
      .then((response) => this.recipe = response.data);

    this.back = () => window.history.back();

    this.editorEnabled = false;
    this.toggleEditor = () => this.editorEnabled = !this.editorEnabled;

    this.saveRecipe = (recipe, recipeid) => {
      $http.put('/api/recipes/' + recipeid, recipe)
      .then((res) => this.editorEnabled = false )
  }

  }
})

app.component('recipeList', {
  templateUrl: '/js/recipe-list.template.html',
  controller: function RecipeAppController($http, $scope){
    $http.get('/api/recipes').
    then( (res) => {
      $scope.recipes = res.data;
    })

    $scope.deleteRecipe = function(index, recipeid) {
      $http.delete('/api/recipes/' + recipeid)
      .then( () => $scope.recipes.splice(index, 1))
    }

    $scope.addRecipe = function (data) {
      $http.post('/api/recipes/', data)
      .then( (res) => {
          $scope.recipes.push(res.data);
          $scope.recipe = {};
      })
  };
  }
})
```

The final `recipe-detail.template`:

```html
<h1>Recipe Detail View</h1>
<div ng-hide="$ctrl.editorEnabled">
    <dl>
        <dt>Title</dt>
        <dd>{{ $ctrl.recipe.title }}</dd>
        <dt>Date</dt>
        <dd>{{ $ctrl.recipe.date}}</dd>
        <dt>Description</dt>
        <dd>{{ $ctrl.recipe.description }}</dd>
        <dt>Image</dt>
        <dd>{{ $ctrl.recipe.image }}</dd>
        <dt>ID</dt>
        <dd>{{ $ctrl.recipe._id }}</dd>
    </dl>
    <button ng-click="$ctrl.toggleEditor($ctrl.recipe)">Edit</button>
</div>
<div ng-show="$ctrl.editorEnabled">
    <form ng-submit="$ctrl.saveRecipe($ctrl.recipe, $ctrl.recipe._id)" name="updateRecipe">
        <label>Title</label>
        <input ng-model="$ctrl.recipe.title">
        <label>Date</label>
        <input ng-model="$ctrl.recipe.date">
        <label>Description</label>
        <input ng-model="$ctrl.recipe.description">
        <label>Image</label>
        <input ng-model="$ctrl.recipe.image">
        <label>ID</label>
        <input ng-model="$ctrl.recipe._id">
        <input type="submit" value="Save">
    </form>
    <button type="cancel" ng-click="$ctrl.toggleEditor()">Cancel</button>
</div>
<button type="submit" ng-click="$ctrl.back()">Back</button>
```

The final `recipe-list.template`:

```html
<h1>Recipe List</h1>

<ul>
  <li ng-repeat="recipe in recipes" class="fade">
      <a href="/recipes/{{ recipe._id }}">{{ recipe.title }} / {{ recipe._id }}</a>
      <span ng-click="deleteRecipe($index, recipe._id)">✖︎</span>
  </li>
</ul>

<form ng-submit="addRecipe(recipe)">
  <input type="text" ng-model="recipe.title" required placeholder="Title" />
  <input type="text" ng-model="recipe.date" required placeholder="Date" />
  <textarea type="text" ng-model="recipe.description" required placeholder="Description"></textarea>
  <input type="text" ng-model="recipe.image" required placeholder="Image" />
  <button type="submit">Add Recipe</button>
</form>
```