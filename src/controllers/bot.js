const Log = require("../models/log");
const { Op } = require("sequelize");

async function all(req, res) {
    const params = req.query;
    let page = 1;
    let limit = 10;
    if (params.hasOwnProperty("page")) {
        page = parseInt(params.page);
    }
    if (params.hasOwnProperty("limit")) {
        limit = parseInt(params.limit);
    }
    let condition = {
        order: [["entity_id", "DESC"]],
        offset: --page*limit,
        limit: limit
    };
    if (params.hasOwnProperty("code")) {
        condition.where = { code: {[Op.in]: params.code.split(",") }}
    }
    const { count, rows } = await Log.findAndCountAll(condition);
    return res.status(200).json(
        {
            success: true ,
            items: rows,
            total: count
        }
    );
}

module.exports = {
    all
};