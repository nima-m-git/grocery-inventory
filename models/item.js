var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ItemSchema = new Schema({
    name: { type: String, required: true, maxlength: 100 },
    description: { type: String, maxlength: 300 },
    price: { type: Number, required: true },
    stock: { type: Number, required: true }, 
    category: [{ type: Schema.Types.ObjectId, ref:'Category', required: true }],
    image: { type: Schema.Types.ObjectId, ref: 'Image' },
});

// Virtual for item's URL
ItemSchema
.virtual('url')
.get(function () {
  return '/inventory/item/' + this._id;
});

// Virtual for item's price
ItemSchema
.virtual('formattedPrice')
.get(function () {
  return '$' + this.price;
});


module.exports = mongoose.model('Item', ItemSchema)