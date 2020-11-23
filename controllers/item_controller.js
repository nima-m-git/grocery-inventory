const async = require('async');
const Item = require('../models/item');
const Category = require('../models/category');

const { body, validationResult } = require('express-validator');
const { upload } = require('../upload');

const fs = require('fs');
const path = require('path');


function deleteImageIfExists(itemID) {
    async.parallel({
        oldItem: function(callback) {
            Item.findById(itemID).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }

        if (results.oldItem.filename) {
            fs.unlink(
                path.resolve(__dirname, '../public/images/' + results.oldItem.filename),
                function(err) {
                    if (err) throw new Error(err);
                }
            );
        }
    }) 
}

// Display all Items
exports.item_list = function (req, res, next) {
    Item.find()
        .sort([['name', 'ascending']])
        .populate('image')
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
            .populate('image')
            .exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (!results.item) {
            res.redirect('/inventory/items');
        } else {
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
    // image upload
    upload.single('image'),

    // validate fields
    body('name', 'Name must be specified').trim().isLength({ min: 1 }).escape(),
    body('description').trim().escape(),
    body('price', 'Price must be a number').trim().isLength({ min: 1 }).escape().isNumeric(),
    body('stock', 'Stock must be a number').trim().isLength({ min: 1 }).escape().isNumeric(),
    body('category').notEmpty().withMessage('category must be selected'),

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

        const item = (req.file) ?
            new Item({
                ...req.body,
                ...req.file,
            })
            : new Item({
                ...req.body,
            })

        if (!errors.isEmpty()) {
            // there are errors, rerender
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
    deleteImageIfExists(req.params.id);
    
    Item.findByIdAndRemove(req.params.id, function(err) {
        if (err) { return next(err); }
        res.redirect('/inventory/items');
    });
}


// Update Item
exports.item_update_get = function(req, res, next) {
    async.parallel({
        item: function(callback) {
            Item.findById(req.params.id).populate('category image').exec(callback);
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
    // image upload
    upload.single('image'),

    // sanitize and validate fields
    body('name', 'Name must be specified').trim().isLength({ min: 1 }).escape(),
    body('price', 'Price must be specified').trim().isLength({ min: 1 }).escape().isNumeric(),
    body('stock', 'Stock must be specified').trim().isLength({ min: 1 }).escape().isNumeric(),
    body('category').notEmpty().withMessage('category must be selected'),

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

        const item = (req.file) ?
            new Item({
                ...req.body,
                ...req.file,
                _id: req.params.id
            })
            : new Item({
                ...req.body,
                _id: req.params.id,
            })

        if (!errors.isEmpty()) {
            // there are errors, rerender
            async.parallel({
                categories: function(callback) {
                    Category.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }
                res.render('item_form', { title: 'Update Item', ...results, item, ...errors });
            })
        } else {
            // remove old image if selected, or new image
            if (req.body['remove-image'] || req.file) {
                deleteImageIfExists(req.params.id);
            }

            Item.findByIdAndUpdate(req.params.id, item, {}, function(err, theitem) {
                if (err) { return next(err); }
                res.redirect(theitem.url);
            });
        }
    }
]
