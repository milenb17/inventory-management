const Item = require("../models/Item");
const Category = require("../models/Category");
const async = require("async");
const { body, validationResult } = require("express-validator");
const fs = require("fs");
const path = require('path');



exports.index = (req, res, next) => {
  async.parallel({
    itemCount(callback) {
    Item.countDocuments({}, callback);
    },
    categoryCount(callback) {
      Category.countDocuments({}, callback);
      },
    },
    (error, results) => {
      res.render('index', {
        title: 'Inventory Management Home',
        error,
        data: results        
      });
    });
};

exports.itemCreateGet = (req, res, next) => {
  Category.find().sort({title: 1}).exec((err, categories) => {
    if (err) {
      return next(err);
    }
    res.render('itemForm', {title: 'Create Item', categories})
  });
}

exports.itemCreatePost = [
  body("title", "Item name required").trim().isLength({min: 1}).escape(),
  body("description", "Item description required").trim().isLength({min: 1}).escape(),
  body("category", "category required").trim().isLength({min: 1}).escape(),
  body("price", "Invalid price").notEmpty().isNumeric({min: 0}).toFloat(),
  body("quantity", "Invalid quantity").notEmpty().isInt({min: 0}).toInt(),
  (req, res, next) => {
    const errors = validationResult(req);

    const item = new Item({
      title: req.body.title,
      description: req.body.description, 
      category: req.body.category,
      img: {
        data: fs.readFileSync(path.join('../public/uploads/' +req.file.filename)),
        contentType: 'image/jpg'
      },
      price: req.body.price,
      quantity: req.body.quantity
    })
    if (!errors.isEmpty()) {
      Category.find().sort({title: 1}).exec((err, categories) => {
        if (err) {
          return next(err);
        }
        res.render('itemForm', {title: 'Create Item', categories, selectedCategory: item.category._id, errors: errors.array(), item})
      });
      return;
    }
    item.save((err) => {
      if (err) {
        return next(err);
      }
      res.redirect(item.url);
    })
}]

exports.itemDeleteGet = (req, res, next) => {
    Item.findById(req.params.id).populate("category").exec((err, item) => {
      if (err) {
        return next(err);
      }
      if (item == null) {
        const error = new Error("Item not found");
        error.status = 404;
        return next(err);
      }
      res.render("itemDelete", {
        title: "Delete Item",
        item
      });
    })
}

exports.itemDeletePost = (req, res, next) => {
  Item.findByIdAndRemove(req.body.itemId, (err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/inventory/items");
  })
}

exports.itemUpdateGet = (req, res, next) => {
  async.parallel({
    item(callback) {
      Item.findById(req.params.id).populate("category").exec(callback);
    },
    categories(callback) {
      Category.find().exec(callback)
    }
  },
  (err, results) => {
    if (err) {
      return next(err);
    }
    if (results.item == null) {
      const error = new Error("Item not found");
      error.status = 404;
      return next(err);
    }
    res.render('itemForm', {
      title: "Update Item",
      item: results.item,
      categories: results.categories, 
      selectedCategory: results.item.category._id
    });
  })
}


exports.itemUpdatePost = [
  body("title", "Item name required").trim().isLength({min: 1}).escape(),
  body("description", "Item description required").trim().isLength({min: 1}).escape(),
  body("category", "category required").trim().isLength({min: 1}).escape(),
  body("price", "Invalid price").notEmpty().isNumeric({min: 0}).toFloat(),
  body("quantity", "Invalid quantity").notEmpty().isInt({min: 0}).toInt(),
  (req, res, next) => {
    const errors = validationResult(req);

    const item = new Item({
      title: req.body.title,
      description: req.body.description, 
      category: req.body.category,
      price: req.body.price,
      quantity: req.body.quantity,
      _id: req.params.id
    });
    if (!errors.isEmpty()) {
      Category.find().sort({title: 1}).exec((err, categories) => {
        if (err) {
          return next(err);
        }
        res.render('itemForm', {title: 'Update Item', categories, selectedCategory: item.category._id, errors: errors.array(), item})
      });
      return;
    }
    Item.findByIdAndUpdate(req.params.id, item, {}, (err, newItem) => {
      if (err) {
        return next(err);
      }
      res.redirect(newItem.url);
    })
}]

exports.itemDetail = (req, res, next) => {
  Item.findOne({_id: req.params.id}).populate("category").exec((error, item) =>{
    if (error) {
      return next(error);
    }
    if (item == null) {
      const error = new Error("itemNotFound");
      error.status = 404;
      return next(error);
    }
    res.render("itemDetail", { title: item.title, item: item});    
  })
}


exports.itemList = (req, res, next) => {
  Item.find().populate("category").sort({category: 1, title: 1}).exec(function (err, items) {
    if (err) {
      return next(err);
    }
     //successful so render
    res.render('itemList', { title: 'Item List', items});
  })
}

