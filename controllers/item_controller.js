const async = require("async");
const Item = require("../models/item");
const Category = require("../models/category");

const { body, validationResult } = require("express-validator");
const { upload } = require("../upload");

const deleteImage = require('../components/deleteImageIfExists');

// Display all Items
exports.item_list = (req, res, next) => {
  Item.find()
    .sort([["name", "ascending"]])
    .populate("image")
    .exec((err, item_list) => {
      if (err) { next(err); }
      res.render("item_list", { item_list });
    });
};

// Display Item Details
exports.item_details = (req, res, next) => {
  Item.findById(req.params.id)
    .populate("category")
    .populate("image")
    .exec()
    .then(item => {
      if (!item) {
        res.redirect("/inventory/items");
      } else {
        res.render("item_details", { item });
      }
    })
    .catch(err => next(err));
};


// Create Item
exports.item_create_get = (req, res, next) => {
  Category.find()
    .then(categories => {
      res.render("item_form", { title: "New Item", categories });
    })
    .catch(err => next(err));
};

exports.item_create_post = [
  // image upload
  upload.single("image"),

  // validate fields
  body("name", "Name must be specified").trim().isLength({ min: 1 }).escape(),
  body("description").trim().escape(),
  body("price", "Price must be a number")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .isNumeric(),
  body("stock", "Stock must be a number")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .isNumeric(),
  body("category").notEmpty().withMessage("category must be selected"),

  // convert category to array
  (req, res, next) => {
    if (!(req.body.category instanceof Array)) {
      req.body.category = new Array(req.body.category);
    }
    next();
  },

  // process request after sanitization
  (req, res, next) => {
    const errors = validationResult(req);

    const item = req.file
    ? new Item({
      ...req.body,
      ...req.file,
    })
    : new Item({
      ...req.body,
    });

    if (!errors.isEmpty()) {
      // there are errors, rerender
      Category.find()
        .then(categories => {
          // apply checkbox status
          categories.forEach((category) => {
            item.category.forEach((cat) => {
              if (category._id.toString() === cat._id.toString()) {
                category.checked = "true";
              }
            });
          });
          // rerender form with prior inputs
          res.render("item_form", {
            title: "New item",
            item,
            categories,
            ...errors,
          });
        })
        .catch(err => next(err));

    } else {
      item.save()
        // redirect item detail page
        .then(() => res.redirect(item.url))
        .catch(err => next(err));
    }
  },
];

// Delete Item
exports.item_delete_get = (req, res, next) => {
  Item.findById(req.params.id)
    .exec()
    .then(item => {
      if (!item) {
        res.redirect("/inventory/items");
      }
      res.render("item_delete", { item });
    })
    .catch(err => next(err));
};

exports.item_delete_post = async (req, res, next) => {
  await deleteImage.deleteImageIfExists(req.params.id);

  Item.findByIdAndRemove(req.params.id)
    .then(() => res.redirect("/inventory/items"))
    .catch(err => next(err));
};

// Update Item
exports.item_update_get = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).populate("category image").exec();
    const categories = await Category.find().exec();

    if (!item) {
      var err = new Error("No item found");
      err.status = 404;
      return next(err);
    } else {
      categories.forEach((category) => {
        item.category.forEach((cat) => {
          if (category._id.toString() === cat._id.toString()) {
            category.checked = "true";
          }
        });
      });
      res.render("item_form", {
        title: "Update Item",
        item,
        categories,
        requirePass: true,
      });
    }
  }
  catch (err) {
    next(err);
  }
};

exports.item_update_post = [
  // image upload
  upload.single("image"),

  // sanitize and validate fields
  body("name", "Name must be specified").trim().isLength({ min: 1 }).escape(),
  body("price", "Price must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .isNumeric(),
  body("stock", "Stock must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .isNumeric(),
  body("category").notEmpty().withMessage("category must be selected"),

  // convert category to array
  (req, res, next) => {
    if (!(req.body.category instanceof Array)) {
      req.body.category = new Array(req.body.category);
    }
    next();
  },

  // process request after sanitization
  async (req, res, next) => {
    const errors = validationResult(req);

    const item = new Item({
      ...req.body,
      ...req.file,
      filename: req.file ? req.file.filename : null,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // there are errors, rerender
      Category.find().exec()
        .then(categories => {
          categories.forEach((category) => {
            item.category.forEach((cat) => {
              if (category._id.toString() === cat._id.toString()) {
                category.checked = "true";
              }
            });
          });

          res.render("item_form", {
            title: "Update Item",
            categories,
            item,
            ...errors,
          });
        })
        .catch(err => next(err));

    } else {
      // remove old image if selected, or new image
      if (req.body["remove-image"] || req.file) {
        await deleteImage.deleteImageIfExists(req.params.id);
      }

      Item.findByIdAndUpdate(req.params.id, item, {})
        .then(theitem => res.redirect(theitem.url))
        .catch(err => next(err));
    }
  },
];
