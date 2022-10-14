var express = require('express');
var router = express.Router();

const itemController = require("../controllers/itemController");
const categoryController = require("../controllers/categoryController");

const multer = require('multer');
const upload = multer({dest: '../public/uploads'});



//Get Inventory Home Page
router.get('/', itemController.index);

// Item Routes



//Get request for creating item 
router.get('/item/create', itemController.itemCreateGet);

//Post for creating item
router.post("/item/create", upload.single('image'), itemController.itemCreatePost);

//Get request for deleting item 
router.get('/item/:id/delete', itemController.itemDeleteGet);

//Post for deleting item
router.post("/item/:id/delete", itemController.itemDeletePost);

//Get request for updating item 
router.get('/item/:id/update', itemController.itemUpdateGet);

//Post for updating item
router.post("/item/:id/update", upload.none(), itemController.itemUpdatePost);

//Get for displaying item detail
router.get("/item/:id", itemController.itemDetail);

//Get for displaying item list
router.get("/items", itemController.itemList);

// CategoryRoutes
//Get request for creating category 
router.get('/category/create', categoryController.categoryCreateGet);

//Post for creating category
router.post("/category/create", categoryController.categoryCreatePost);

//Get request for deleting category 
router.get('/category/:id/delete', categoryController.categoryDeleteGet);

//Post for deleting category
router.post("/category/:id/delete", categoryController.categoryDeletePost);

//Get request for updating category 
router.get('/category/:id/update', categoryController.categoryUpdateGet);

//Post for updating category
router.post("/category/:id/update", categoryController.categoryUpdatePost);

//Get for displaying category detail
router.get("/category/:id", categoryController.categoryDetail);

//Get for displaying category list
router.get("/categories", categoryController.categoryList);

module.exports = router;