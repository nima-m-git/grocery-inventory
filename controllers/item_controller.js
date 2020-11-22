var async = require('async');
var Item = require('../models/item');
var Category = require('../models/category');

const { body, validationResult } = require('express-validator');
const category = require('../models/category');
const item = require('../models/item');


// Display all Items
exports.item_list = function (req, res, next) {

    Item.find()
        .sort([['name', 'ascending']])
        .exec(function (err, item_list) {
            if (err) { return next(err); }
            res.render('item_list', { item_list, });
        });
}

// Display Item Details
exports.item_details = function(req, res, next) {
    async.parallel({
        item: function(callback) {
            Item.findById(req.params.id)
            .populate('category')
            .exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (!results.item) {
            res.redirect('/inventory/items');
        } else {
            console.log(results.item.category)
            res.render('item_details', { ...results, })
        }
    })
}


// Create Item
exports.item_create_get = function(req, res, next) {
    async.parallel({
        categories: function(callback) {
            Category.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('item_form', { title: 'New Item', ...results, });
    });
}


exports.item_create_post = [
    body('name').trim().isLength({ min: 1 }).escape().withMessage('Name must be specified'),
    body('description').trim().escape(),
    body('price', 'Price must be specified').trim().isLength({ min: 1 }).escape().isNumeric(),
    body('stock', 'Stock must be specified').trim().isLength({ min: 1 }).escape().isNumeric(),
    body('category').notEmpty().withMessage('category must be selected'),

    // convert category to array
    (req, res, next) => {
        if (!(req.body.category instanceof Array)) {
            req.body.category = new Array(req.body.category);
            console.log(req.body.category)
        }

        next();
    },

    // process request after sanitization
    (req, res, next) => {

        const errors = validationResult(req);

        const item = new Item({
            ...req.body,
        });

        if (!errors.isEmpty()) {
            async.parallel({
                categories: function(callback) {
                    Category.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                results.categories.forEach(category => {
                    item.category.forEach(cat => {
                        if (category._id.toString() === cat._id.toString()) {
                            category.checked = 'true';
                        }
                    })
                })

                res.render('item_form', { title: 'New item', ...errors, item, ...results});
            })
        } else {
            item.save(function(err) {
                if (err) { return next(err); }
                // render item detail page
                res.redirect(item.url);
            })
        }
    }
]

// Delete Item
exports.item_delete_get = function (req, res, next) {
    async.parallel({
        item: function(callback) {
            Item.findById(req.params.id).exec(callback)
        },
    },
    function(err, results) {
        if (err) { return next(err); }
        if (!results.item) {
            res.redirect('/inventory/items');
        }
        res.render('item_delete', { ...results, })
    })
}


exports.item_delete_post = function (req, res, next) {
    async.parallel({
        item: function(callback) {
            Item.findById(req.params.id).exec(callback)
        },
    },
    function(err, results) {
        if (err) { return next(err); }
        Item.findByIdAndRemove(req.params.id, function(err) {
            if (err) { return next(err); }
            res.redirect('/inventory/items');
        });
    })
}

// Update Item
exports.item_update_get = function(req, res, next) {
    async.parallel({
        item: function(callback) {
            Item.findById(req.params.id).populate('category').exec(callback);
        },
        categories: function(callback){
            Category.find(callback);
        }
    }, function(err, results) {
        if (err) { return next(err); }
        if (!results.item) {
            var err = new Error('No item found')
            err.status = 404;
            return next(err);
        } else {
            results.categories.forEach(category => {
                results.item.category.forEach(cat => {
                    if (category._id.toString() === cat._id.toString()) {
                        category.checked = 'true';
                    }
                })
            })
            res.render('item_form', { title: 'Update Item', ...results, })
        }
    })
}


exports.item_update_post = [
    // sanitize and validate fields
    body('name', 'Name must be specified').trim().isLength({ min: 1 }).escape(),
    body('price', 'Price must be specified').trim().isLength({ min: 1 }).escape().isNumeric(),
    body('stock', 'Stock must be specified').trim().isLength({ min: 1 }).escape().isNumeric(),
    body('category').notEmpty().withMessage('category must be selected'),

    // convert category to array
    (req, res, next) => {
        console.log(req.body.category)
        if (!(req.body.category instanceof Array)) {
            req.body.category = new Array(req.body.category);
        }
        next();
    },

    // process request after sanitization
    (req, res, next) => {
        const errors = validationResult(req);

        const item = new Item({
            ...req.body,
            _id: req.params.id
        });

        if (!errors.isEmpty()) {
            console.log(errors)
            async.parallel({
                categories: function(callback) {
                    Category.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }
                console.log(errors)
                res.render('item_form', { title: 'Update Item', ...results, item, ...errors });
            })
        } else {
            Item.findByIdAndUpdate(req.params.id, item, {}, function(err, theitem) {
                if (err) { return next(err); }
                res.redirect(theitem.url);
            });
        }
    }
]
