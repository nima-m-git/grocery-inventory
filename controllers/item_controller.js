var async = require('async');
var Category = require('../models/category');
var Item = require('../models/item');

const { body, validationResult } = require('express-validator');


// Display all Items
exports.item_list = function (req, res, next) {

    Item.find({}, 'name')
        .exec(function (err, item_names) {
            if (err) { return next(err); }
            res.render('item_list', { item_names, });
        });
}

// Display Item Details
exports.item_details = function(req, res, next) {
    async.parallel({
        item: function(callback) {
            item.findById(req.params.id).exec(callback)
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
exports.item_create_get = function (req, res, next) {
    res.render('item_form', { title: 'New Item' });
}

exports.item_create_post = [
    body('name').trim().isLength({ min: 1 }).escape().withMessage('Name must be specified')
        .isAlphanumeric().withMessage('Name has non alphanumeric characters.'),
    body('description').trim().escape().isAlphanumeric().withMessage('Name has non alphanumeric characters.'),
    body('price', 'Price must be specified').trim().isLength({ min: 1 }).escape().isNumeric(),
    body('stock', 'Stock must be specified').trim().isLength({ min: 1 }).escape().isNumeric(),
    body('category', 'Category must be specified').trim().isLength({ min: 1 }).escape(),

    // process request after sanitization
    (req, res, next) => {

        const errors = validationResult(req);

        const item = new item({
            ...req.body
        });

        if (!errors.isEmpty()) {
            res.render('item_form', { title: 'New item', errors, ...req.body, });
            return ;
        } else {
            item.save(function(err) {
                if (err) { return next(err); }
                // render item detail page
                res.redirect('/inventory/item/:id');
            })
        }
    }
]

// Delete Item
exports.item_delete_get = function (req, res, next) {
    async.parallel({
        item: function(callback) {
            item.findById(req.params.id).exec(callback)
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
            item.findById(req.params.id).exec(callback)
        },
    },
    function(err, results) {
        if (err) { return next(err); }
        item.findByIdAndRemove(req.params.id, function(err) {
            if (err) { return next(err); }
            res.redirect('/inventory/items');
        });
    })
}

// Update Item
exports.item_update_get = function(req, res, next) {
    async.parallel({
        item: function(callback) {
            item.findById(req.params.id).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (!results.item) {
            res.redirect('/inventory/items');
        } else {
            res.render('item_form', { title: 'Update Item', ...results, })
        }
    })
}

exports.item_update_post = [
    body('name').trim().isLength({ min: 1 }).escape().withMessage('Name must be specified')
        .isAlphanumeric().withMessage('Name has non alphanumeric characters.'),
    body('description').trim().escape().isAlphanumeric().withMessage('Name has non alphanumeric characters.'),
    body('price', 'Price must be specified').trim().isLength({ min: 1 }).escape().isNumeric(),
    body('stock', 'Stock must be specified').trim().isLength({ min: 1 }).escape().isNumeric(),
    body('category', 'Category must be specified').trim().isLength({ min: 1 }).escape(),

    // process request after sanitization
    (req, res, next) => {

        const errors = validationResult(req);

        const item = new item({
            ...req.body,
            _id: req.params.id
        });

        if (!errors.isEmpty()) {
            res.render('item_form', { title: 'Update Item', errors, ...req.body, });
            return ;
        } else {
            item.findByIdAndUpdate(req.params.id, item, {}, function(err, theitem) {
                if (err) { return next(err); }
                res.redirect(theitem.url);
            });
        }
    }
]
