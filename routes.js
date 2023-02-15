const express = require("express");
const routes = express.Router();
const User = require("./src/controllers/user.js");
const Inventory = require("./src/controllers/inventory.js");
const auth = require("./src/middleware/auth.js");

// USERS ENDPOINT
// routes.get("/v1/users", auth, User.findAll);
routes.get("/v1/users", User.findAll);
routes.post("/v1/users",  User.create);
routes.post("/v1/users/login",  User.login);
routes.post("/v1/users/empire/key", auth, User.empireKey);

// INVENTORY ENDPOINT
routes.get("/v1/inventory",  auth, Inventory.get);

module.exports = routes;