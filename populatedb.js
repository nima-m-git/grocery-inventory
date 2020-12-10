#! /usr/bin/env node

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require("async");
var Item = require("./models/item");
var Category = require("./models/category");

var mongoose = require("mongoose");
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

var items = [];
var categories = [];

var itemsToAdd = [
  ["Apples", "One a day keeps the doctor away", "0.49", 500, "produce"],
  ["Pears", "Round and juicy", "0.59", 300, "produce"],
  ["Bananas", "Monkey see, monkey eat", "0.29", 200, "produce"],
  ["Spinach", "Popeyes favourite", "2.99", 100, "produce"],
  ["Milk", "Good for bones", "4.99", 100, "dairy"],
  ["Cheese", "Mmmmm...", "7.99", 150, "dairy"],
  ["Yogurt", "Versatile, creamy, and healthy", "3.49", 50, "dairy"],
  ["Steak", "So tender..", "15.99", 50, "meat"],
  ["Chicken", "Bwak", "7.99", 100, "meat"],
  ["Bread", "Soft and fluffy", "2.99", 200, "grains"],
  ["Rice", null, "1.49", 1000, "grains"],
  ["Fish", "Straight out the ocean", "8.99", 120, "meat"],
];

function categoryCreate(name, description, cb) {
  var categorydetail = {
    name,
  };

  if (description) {
    categorydetail.description = description;
  }

  var category = new Category(categorydetail);
  category.save(function (err) {
    if (err) {
      console.log("err: ", err);
      cb(err, null);
      return;
    }
    console.log("New category: " + category);
    categories.push(category);
    cb(null, category);
  });
}

function itemCreate(name, description, price, stock, category, cb) {
  var itemdetail = {
    name,
    price,
    stock,
    category,
  };

  if (description) {
    itemdetail.description = description;
  }

  var item = new Item(itemdetail);
  item.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Item: " + item);
    items.push(item);
    cb(null, item);
  });
}

function createCategories(cb) {
  async.series(
    [
      function (callback) {
        categoryCreate(
          "dairy",
          "made from other mammals mammary glands?",
          callback
        );
      },
      function (callback) {
        categoryCreate("meat", "hunt or be hunted", callback);
      },
      function (callback) {
        categoryCreate("produce", "fresh from the ground", callback);
      },
      function (callback) {
        categoryCreate("grains", null, callback);
      },
    ],
    // optional callback
    cb
  );
}

function createItems(cb) {
  async.parallel(
    itemsToAdd.map(
      (item) =>
        function (callback) {
          var [name, description, price, stock, category] = [...item];
          var categoryIndex = categories.indexOf(
            categories.find((cat) => cat.name == category)
          );
          itemCreate(
            name,
            description,
            price,
            stock,
            categories[categoryIndex],
            callback
          );
        }
    ),
    // optional callback
    cb
  );
}

async.series(
  [createCategories, createItems],

  // Optional callback
  function (err, results) {
    if (err) {
      console.log("FINAL ERR: " + err);
    }
    // All done, disconnect from database
    mongoose.connection.close();
  }
);
