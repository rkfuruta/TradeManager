const express = require("express");
const routes = express.Router();
const user = require("./src/controllers/user.js");
const auth = require("./src/middleware/auth.js");

routes.get("/v1/users", auth, user.findAll);
routes.post("/v1/users",  user.create);
routes.post("/v1/users/login",  user.login);

module.exports = routes;