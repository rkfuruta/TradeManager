const express = require("express");
const routes = express.Router();
const User = require("./src/controllers/user.js");
const Inventory = require("./src/controllers/inventory.js");
const Item = require("./src/controllers/item.js");
const Dashboard = require("./src/controllers/dashboard.js");
const Config = require("./src/controllers/config.js");
const auth = require("./src/middleware/auth.js");

// USERS ENDPOINT
// routes.post("/v1/users",  User.create);
routes.post("/v1/users/login",  User.login);
routes.post("/v1/users/empire/key", auth, User.empireKey);

// INVENTORY ENDPOINT
routes.get("/v1/inventory",  auth, Inventory.get);

// ITEM ENDPOINT
routes.post("/v1/item/:id/status",  auth, Item.status);

//DASHBOARD ENDPOINT
routes.get("/v1/dashboard/transactions",  auth, Dashboard.transactions);
routes.get("/v1/dashboard/transactions/dates",  auth, Dashboard.transactionDates);

//CONFIG ENDPOINT
routes.get("/v1/config",  auth, Config.get);
routes.get("/v1/config/list",  auth, Config.all);
routes.post("/v1/config",  auth, Config.set);
routes.delete("/v1/config",  auth, Config.remove);

module.exports = routes;