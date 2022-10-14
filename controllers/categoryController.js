const Item = require("../models/Item");
const Category = require("../models/Category");
const async = require("async");
const { body, validationResult } = require("express-validator");


exports.categoryCreateGet = (req, res, next) => {
    res.render("categoryForm", {title: "Create Category"});
};

exports.categoryCreatePost = [
    body("title", "Category name required").trim().isLength({min: 1}).escape(),
    (req, res, next) => {
        // extract validation errors from request
        const errors = validationResult(req);

        const category = new Category({title: req.body.title});
        if (!errors.isEmpty()) {
            // there are errors, re-render form
            res.render("categoryForm", {title: "Create Category", category, errors: errors.array()});
            return;
        } else {
            // No errors, check if category already exists
            Category.findOne({title: req.body.title}).exec((err, foundCategory) => {
                if (err) {
                    return next(err);
                }
                //category exists, redirict to its page
                if (foundCategory) {
                    res.redirect(foundCategory.url);
                } else {
                    category.save(err => {
                        if (err) {
                            return next(err);
                        }
                        // category added, go to its page
                        res.redirect(category.url);
                    });
                }
            })
        }

    }
]


exports.categoryDeletePost = (req, res, next) => {
    async.parallel({
        items(callback) {
            Item.find({category: req.body.categoryId}).exec(callback)
        },
        category(callback) {
            Category.findById(req.body.categoryId).exec(callback)
        }
    },
    (err, results) => {
        if (err) {
            return next(err);
        }
        if (results.items.length < 0) {
            res.render('categoryDelete', {
                title: "Delete Category",
                category: results.category,
                items: results.items
            });
        return;
        }
        Category.findByIdAndRemove(req.body.categoryId, (err) => {
            if (err) {
                return next(err);
            }
            res.redirect('/inventory/categories');
        });
    });
};


exports.categoryDeleteGet = (req, res, next) => {
    async.parallel({
        items(callback) {
            Item.find({category: req.params.id}).exec(callback)
        },
        category(callback) {
            Category.findById(req.params.id).exec(callback)
        }
    },
    (err, results) => {
        if (err) {
            return next(err);
        }
        if (results.category == null) {
            const error = new Error('Category not found');
            error.status = 404;
            return next(error);
        }
        res.render('categoryDelete', {
            title: "Delete Category",
            category: results.category,
            items: results.items
        });
    });
    
};

exports.categoryUpdateGet = (req, res, next) => {
    Category.findById(req.params.id, (err, category) => {
        if (err) {
            return next(err);
        }
        if (category == null) {
            const error = new Error('Category not found');
            error.status = 404;
            return next(error);
        }
        res.render('categoryForm', {
            title: "Update Category", 
            category
        });
    })
};

exports.categoryUpdatePost = [
    body('title', "Title must not be empty").trim().isLength({min: 1}).escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        const category = new Category({
            title: req.body.title,
            _id: req.params.id
        })

        if (!errors.isEmpty()) {
            res.render("categoryForm", {
                title: "Update Category",
                category,
                errors: errors.array()
            })
            return;
        }
        Category.findByIdAndUpdate(req.params.id, category, {}, (err, newCategory) => {
            if (err) {
                return next(err);
            }
            res.redirect(newCategory.url);
        })
    }
]

exports.categoryDetail = (req, res, next) => {
    async.parallel({
        category(callback) {
            Category.findById(req.params.id).exec(callback);
        },
        categoriesItems(callback) {
            Item.find({category: req.params.id}).exec(callback)
        }
    },
    function(error, results) {
        if (error) {
            return next(error);
        }
        if (results.category == null) {
            const error = new Error('Category not found');
            error.status = 404;
            return next(error);
        }
        res.render("categoryDetail", {
            title: "Category detail",
            category: results.category,
            items: results.categoriesItems
        });
    });
};


exports.categoryList = (req, res, next) => {
    Category.find().sort({title: 1}).exec((error, categories) => {
        if (error) {
            return next(error);
        }
        res.render('categoryList', {title: 'Category List', categories})
    })
};

