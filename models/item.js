var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ItemSchema = new Schema({
    name: { type: String, required: true, maxlength: 100 },
    description: { type: String, maxlength: 300 },
    price: { type: Number, required: true },
    stock: { type: Number, required: true }, 
});

// Virtual for author's URL
ItemSchema
.virtual('url')
.get(function () {
  return '/item/' + this._id;
});

module.exports = mongoose.model('Item', ItemSchema)