var express = require('express');
var router = express.Router();

// Require controller models
var category_controller = require('../controllers/category_controller');
var item_controller = require('../controllers/item_controller');


///     CATEGORY ROUTES     \\\

// Inventory home page
router.get('/', category_controller.index);

// All categories
router.get('/categories', category_controller.category_list);

// category create
router.get('/category/create', category_controller.category_create_get);

router.post('/category/create', category_controller.category_create_post);

// category update
router.get('/category/:id/update', category_controller.category_update_get);

router.post('/category/:id/update', category_controller.category_update_post);

// category delete
router.get('/category/:id/delete', category_controller.category_delete_get);

router.post('/category/:id/delete', category_controller.category_delete_post)

// category details
router.get('/category/:id', category_controller.category_details);


///     ITEM ROUTES     \\\

// All items
router.get('/items', item_controller.item_list);

// Item create
router.get('/item/create', item_controller.item_create_get);

router.post('/item/create', item_controller.item_create_post);

// Item update
router.get('/item/:id/update', item_controller.item_update_get);

router.post('/item/:id/update', item_controller.item_update_post);

// Item delete
router.get('/item/:id/delete', item_controller.item_delete_get);

router.post('/item/:id/delete', item_controller.item_delete_post)

// Item details
router.get('/item/:id', item_controller.item_details);



module.exports = router;