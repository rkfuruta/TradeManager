const express = require("express");
const routes = express.Router();
const User = require("./src/controllers/user.js");
const Inventory = require("./src/controllers/inventory.js");
const Item = require("./src/controllers/item.js");
const auth = require("./src/middleware/auth.js");

// USERS ENDPOINT
// routes.get("/v1/users", auth, User.findAll);
routes.get("/v1/users", User.findAll);
routes.post("/v1/users",  User.create);
routes.post("/v1/users/login",  User.login);
routes.post("/v1/users/empire/key", auth, User.empireKey);

// INVENTORY ENDPOINT
routes.get("/v1/inventory",  auth, Inventory.get);

// ITEM ENDPOINT
routes.post("/v1/item/:id/status",  auth, Item.status);

module.exports = routes;