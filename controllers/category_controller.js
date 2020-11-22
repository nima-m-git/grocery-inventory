var async = require('async');
var Category = require('../models/category');
var Item = require('../models/item');

const { body, validationResult } = require('express-validator');

// Inventory Index
exports.index = function (req, res, next) {

    async.parallel({
        category_count: function(callback) {
            Category.countDocuments({}, callback)
        },
        item_count: function(callback) {
            Item.countDocuments({}, callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('index', { err, ...results, } )
    });
};

// Display all categories
exports.category_list = function (req, res, next) {

    Category.find()
        .sort([['name', 'ascending']])
        .exec(function (err, category_list) {
            if (err) { return next(err); }
            res.render('category_list', { category_list, });
        });
}

// Display Category Details
exports.category_details = function(req, res, next) {
    async.parallel({
        category: function(callback) {
            Category.findById(req.params.id).exec(callback)
        },
        category_items: function(callback) {
            Item.find({'category': req.params.id}, 'name').exec(callback); 
        }
    }, function(err, results) {
        if (err) { return next(err); }
        if (!results.category) {
            res.redirect('/inventory/categories');
        } else {
            res.render('category_details', { ...results, })
        }
    })
}


// Create Category
exports.category_create_get = function (req, res, next) {
    res.render('category_form', { title: 'New Category' });
}

exports.category_create_post = [
    body('name', 'Name must be specified').trim().isLength({ min: 1 }).escape(),
    body('description').trim().escape(),
    
    // process request after sanitization
    (req, res, next) => {

        const errors = validationResult(req);

        const category = new Category({
            ...req.body
        });

        if (!errors.isEmpty()) {
            res.render('category_form', { title: 'New Category', errors, ...req.body, });
            return ;
        } else {
            category.save(function(err) {
                if (err) { return next(err); }
                // render category detail page
                res.redirect(category.url);
            })
        }
    }
]

// Delete Category
exports.category_delete_get = function (req, res, next) {
    async.parallel({
        category: function(callback) {
            Category.findById(req.params.id).exec(callback)
        },
        categorys_items: function(callback) {
            Item.find({ 'category': req.params.id }, 'name').exec(callback)
        },
    },
    function(err, results) {
        if (err) { return next(err); }
        if (!results.category) {
            res.redirect('/inventory/categories');
        }
        res.render('category_delete', { ...results, })
    })
}

exports.category_delete_post = function (req, res, next) {
    async.parallel({
        category: function(callback) {
            Category.findById(req.params.id).exec(callback)
        },
        categorys_items: function(callback) {
            Item.find({ 'category': req.params.id }).exec(callback)
        },
    },
    function(err, results) {
        if (err) { return next(err); }
        if (results.categorys_items.length) {
            var err = new Error('Categorys items must be removed first: ');
            res.render('category_delete', { err, ...results })
        } else {
            Category.findByIdAndRemove(req.params.id, function(err) {
                if (err) { return next(err); }
                res.redirect('/inventory/categories');
            });
        }
    })
}

// Update Category
exports.category_update_get = function(req, res, next) {
    async.parallel({
        category: function(callback) {
            Category.findById(req.params.id).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (!results.category) {
            res.redirect('/inventory/categories');
        } else {
            res.render('category_form', { title: 'Update Category', ...results, })
        }
    })
}

exports.category_update_post = [
    body('name', 'Name must be specified').trim().isLength({ min: 1 }).escape(),
    body('description').trim().escape(),
    // process request after sanitization
    (req, res, next) => {

        const errors = validationResult(req);

        const category = new Category({
            ...req.body,
            _id: req.params.id
        });

        if (!errors.isEmpty()) {
            res.render('category_form', { title: 'Update Category', errors, ...req.body, });
            return ;
        } else {
            Category.findByIdAndUpdate(req.params.id, category, {}, function(err, thecategory) {
                if (err) { return next(err); }
                res.redirect(thecategory.url);
            });
        }
    }
]
