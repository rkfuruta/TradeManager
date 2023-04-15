const Log = require("../models/log");
const { Op } = require("sequelize");
const moment = require("moment");

const now = moment().subtract(5, "days");
Log.destroy( { where : { createdAt : { [Op.lte]: now } } } );