const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  filename: {
    type: String,
    required: true,
  },
  content_type: {
    type: String,
    required: true,
  },
});

// Virtual for image's URL
ImageSchema.virtual('url').get(function() {
  return '/images/' + this.filename;
});


module.exports = mongoose.model('Image', ImageSchema);