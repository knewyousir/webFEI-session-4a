const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const recipeModels = require('./api/recipe.model');
const recipes = require('./api/recipe.controllers');

const app = express();
const mongoUri = 'mongodb://user_kys:1234asdf@ds157223.mlab.com:57223/recipes_kys';

// middleware
app.use(bodyParser.json());
app.use(express.static(__dirname + '/app/public'));

// routes
app.get('/', function(req, res) {
  res.sendFile( __dirname + '/app/index.html');
});

app.get('/api/recipes', recipes.findAll);
app.get('/api/recipes/:id', recipes.findById);
app.post('/api/recipes', recipes.add);
app.put('/api/recipes/:id', recipes.update);
app.delete('/api/recipes/:id', recipes.delete);
app.get('/api/import', recipes.import);
app.get('/api/killall', recipes.killall);

mongoose.connect(mongoUri, { useNewUrlParser: true }, () => {
    app.listen(3001);
    console.log('Server running at http://localhost:3001/');
  });