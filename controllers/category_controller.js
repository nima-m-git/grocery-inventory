const async = require("async");
const Category = require("../models/category");
const Item = require("../models/item");

const { body, validationResult } = require("express-validator");
const password = process.env.ADMINPASSWORD || "password";

// Inventory Index
exports.index = async (req, res, next) => {
  try {
    const category_count = await Category.countDocuments({});
    const item_count = await Item.countDocuments({});
    res.render("index", { category_count, item_count });
  }
  catch (err) {
    return next(err);
  };
};

// Display all categories
exports.category_list = (req, res, next) => {
  Category.find()
    .sort([["name", "ascending"]])
    .exec()
    .then(category_list => res.render("category_list", { category_list }))
    .catch(err => next(err));
};

// Display Category Details
exports.category_details = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id).exec();
    const category_items = await Item.find({ category: req.params.id }, "name").exec();
    
    if (!category) {
      res.redirect("/inventory/categories");
    } else {
      res.render("category_details", { category, category_items });
    }
  }
  catch (err) {
    return next(err);
  }
};

// Create Category
exports.category_create_get = (req, res, next) => {
  res.render("category_form", { title: "New Category" });
};

exports.category_create_post = [
  body("name", "Name must be specified").trim().isLength({ min: 1 }).escape(),
  body("description").trim().escape(),

  // process request after sanitization
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("category_form", { title: "New Category", errors, ...req.body, });
    } else {
      const category = new Category({
        ...req.body,
      })
      .save()
        // render category detail page
        .then(category => res.redirect(category.url))
        .catch(err => next(err));
    }
  },
];

// Delete Category
exports.category_delete_get = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id).exec();
    const categorys_items = await Item.find({ category: req.params.id }, "name").exec();

    if (!category) {
      res.redirect("/inventory/categories");
    }
    res.render("category_delete", { category, categorys_items });
  }
  catch (err) {
    return next(err);
  }
};

exports.category_delete_post = async (req, res, next) => {
  try {
    category = await Category.findById(req.params.id).exec();
    categorys_items = await Item.find({ category: req.params.id }).exec();

    if (categorys_items.length) {
      var err = new Error("Categorys items must be removed first: ");
      res.render("category_delete", { err, category, categorys_items });
    } else {
      Category.findByIdAndRemove(req.params.id)
        .then(() => res.redirect("/inventory/categories"))
        .catch(err => next(err));
    }
  }
  catch (err) {
    return next(err);
  }
};

// Update Category
exports.category_update_get = (req, res, next) => {
  Category.findById(req.params.id).exec()
    .then(category => {
      if (!category) {
        res.redirect("/inventory/categories");
      } else {
        res.render("category_form", { title: "Update Category", category, requirePass: true, });
      }
    })
    .catch(err => next(err));
};

exports.category_update_post = [
  body("name", "Name must be specified").trim().isLength({ min: 1 }).escape(),
  body("description").trim().escape(),

  // process request after sanitization
  (req, res, next) => {
    const errors = validationResult(req);

    const category = new Category({
      ...req.body,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.render("category_form", { title: "Update Category", ...errors, category, });
    } else {
      Category.findByIdAndUpdate(req.params.id, category, {})
        .then(thecategory => res.redirect(thecategory.url))
        .catch(err => next(err));
    }
  },
];
