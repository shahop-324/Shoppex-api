const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.ObjectId,
    ref: "Store",
  },
  level: {
    type: String,
    enum: ["One", "Two", "Three"],
  },
  parent: {
    type: Map,
    of: String,
  },
  menuType: {
    type: Map,
  },
  itemName: {
    type: String,
  },
  product: {
    type: Map,
  },
  category: {
    type: Map,
  },
  subCategory: {
    type: Map,
  },
  page: {
    type: Map,
  },
  createdAt: { // unselect
    type: Date,
    default: Date.now(),
  },
  updatedAt: { // unselect
    type: Date,
  },
});

const Menu = new mongoose.model("Menu", menuSchema);
module.exports = Menu;
