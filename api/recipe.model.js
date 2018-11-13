const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RecipeSchema = new Schema({
  title: String,
  created: {
      type: Date,
      default: Date.now()
  },
  ingredients: Array,
  preparation: Array,
  description: String,
  image: String
});

module.exports = mongoose.model('Recipe', RecipeSchema);