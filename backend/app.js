const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const mongoose = require('mongoose');

// make sure this line always appears before any routes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
	next()
})

const recipeModels = require('./src/recipe.model');
// const routes = require('./src/recipe.routes');
const recipes = require('./src/recipe.controllers');
// const appRoutes = routes(app);

app.get('/', function (req, res) {
    res.send('API is up');
});

app.get('/api/recipes', recipes.findAll);
app.get('/api/recipes/:id', recipes.findById);
app.post('/api/recipes', recipes.add);
app.put('/api/recipes/:id', recipes.update);
app.delete('/api/recipes/:id', recipes.delete);
app.get('/api/import', recipes.import);


const mongoUri = 'mongodb://devereld:dd2345@ds015730.mlab.com:15730/recipes-dd';
mongoose.connect(mongoUri);

app.listen(3002);
console.log('Server running at http://localhost:3002/');