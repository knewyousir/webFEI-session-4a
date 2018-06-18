const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RecipeSchema = new Schema({
    name: String,
    title: String,
    description: String,
    image: String,
    ingredients: [],
    preparation: []
});

module.exports = mongoose.model('Recipe', RecipeSchema);