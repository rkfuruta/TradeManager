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
    let filters = {}
    if (params.hasOwnProperty("code")) {
        filters.code = {[Op.in]: params.code.split(",") };
    }
    if (params.hasOwnProperty("id")) {
        filters.entity_id = {[Op.gt]: params.id };
    }
    if (params.hasOwnProperty("debug")) {
        filters.is_debug = { [Op.eq]: (params.debug !== "false") };
    }
    if (Object.keys(filters).length) {
        condition.where = filters;
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