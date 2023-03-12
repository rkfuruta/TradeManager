const express = require("express");
const routes = express.Router();
const User = require("./src/controllers/user.js");
const Inventory = require("./src/controllers/inventory.js");
const Item = require("./src/controllers/item.js");
const Dashboard = require("./src/controllers/dashboard.js");
const Config = require("./src/controllers/config.js");
const Steam = require("./src/controllers/steam.js");
const Bot = require("./src/controllers/bot.js");
const auth = require("./src/middleware/auth.js");

// USERS ENDPOINT
// routes.post("/v1/users",  User.create);
routes.post("/v1/users/login",  User.login);
routes.post("/v1/users/empire/key", auth, User.empireKey);
routes.get("/v1/users", auth, User.get);

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

//STEAM LOGIN
routes.get("/v1/steam/login", Steam.login);
routes.get("/v1/steam/login/auth", Steam.auth);

//BOT ENDPOINT
routes.get("/v1/bot/log",  auth, Bot.all);
routes.get("/v1/bot/config/changed", Bot.configChanged);
routes.get("/v1/bot/config", Bot.config);
routes.post("/v1/bot/config",  auth, Bot.configUpdate);


module.exports = routes;