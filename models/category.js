var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CategorySchema = new Schema({
    name: { type: String, required: true, maxlength: 100 },
    description: { type: String, maxlength: 300 },
    items: { type: Schema.Types.ObjectId, ref: 'Items', }
});

// Virtual for author's URL
CategorySchema
.virtual('url')
.get(function () {
  return '/category/' + this._id;
});

module.exports = mongoose.model('Category', CategorySchema)