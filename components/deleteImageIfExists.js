const Item = require("../models/item");
const fs = require("fs");
const path = require("path");

module.exports.deleteImageIfExists = async function(id) {
    const oldItem = await Item.findById(id);
  
    if (oldItem.filename) {
      fs.unlink(
        path.resolve(__dirname, "../public/images/" + oldItem.filename),
        function (err) {
          if (err) throw new Error(err);
        }
      );
    }
};

