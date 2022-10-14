#! /usr/bin/env node

console.log('This script populates some items. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Item = require("./models/Item")
var Category = require("./models/Category")
var fs = require("fs");
var products = require('./products.json')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var items = []
let categories = []

function itemCreate(title, description, category, img, price, cb) {
  async.parallel({
    cat(callback) {
      Category.findOne({title : { '$regex': `^${category}$`, $options: 'i'}}, callback);
    },
    image(callback) {
      fs.readFile(`images/${img}`, callback);
    }
  },
  (err, results) => {
    if (err){
      cb(err, null)
      return;
    }
    let itemDetail = {title, description, 
      category: results.cat, 
      img: {data: results.image, contentType: "image/jpg"}, 
      price}
    
    let item = new Item(itemDetail);
    item.save(function(err){
      if (err) {
        cb(err, null)
        return
      }
      console.log('New Item: ' + item.title);
      items.push(item)
    }) ;
  })
  
}
function categoryCreate(title, cb) {
  let category = new Category({title: title});
  category.save(function(err) {
    if (err) {
      cb(err, null);
      return
    }
    console.log('New category: ' + category);
    categories.push(category)
  })
}



function createItems(cb) {
  products.forEach(product => {
    itemCreate(product.title, product.description, product.type, product.filename, product.price, (err) => {if (err) {console.log(err)} return})
  })
}





async.series([
    createItems,
], 
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    // All done, disconnect from database
    mongoose.connection.close();
});




