const express = require("express");
const router = express.Router();

const category_controller = require("../controllers/category_controller");
const item_controller = require("../controllers/item_controller");

const isLoggedIn = require("../middleware/isLoggedIn");
const isAdmin = require("../middleware/isAdmin");

///     CATEGORY ROUTES     \\\

// Inventory home page
router.get("/", category_controller.index);

// All categories
router.get("/categories", category_controller.category_list);

// category create
router.get("/category/create", isLoggedIn, category_controller.category_create_get);

router.post("/category/create", isLoggedIn, category_controller.category_create_post);

// category update
router.get("/category/:id/update", isAdmin, category_controller.category_update_get);

router.post("/category/:id/update", isAdmin, category_controller.category_update_post);

// category delete
router.get("/category/:id/delete", isAdmin, category_controller.category_delete_get);

router.post("/category/:id/delete", isAdmin, category_controller.category_delete_post);

// category details
router.get("/category/:id", category_controller.category_details);


///     ITEM ROUTES     \\\

// All items
router.get("/items", item_controller.item_list);

// Item create
router.get("/item/create", isLoggedIn, item_controller.item_create_get);

router.post("/item/create", isLoggedIn, item_controller.item_create_post);

// Item update
router.get("/item/:id/update", isAdmin, item_controller.item_update_get);

router.post("/item/:id/update", isAdmin, item_controller.item_update_post);

// Item delete
router.get("/item/:id/delete", isAdmin, item_controller.item_delete_get);

router.post("/item/:id/delete", isAdmin, item_controller.item_delete_post);

// Item details
router.get("/item/:id", item_controller.item_details);

module.exports = router;
