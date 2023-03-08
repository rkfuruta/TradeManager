const Log = require("../models/log");

async function all(req, res) {
    const params = req.query;
    let page = 1;
    let limit = 100;
    if (params.hasOwnProperty("page")) {
        page = parseInt(params.page);
    }
    if (params.hasOwnProperty("limit")) {
        limit = parseInt(params.limit);
    }
    const { count, rows } = await Log.findAndCountAll({
        offset: --page*limit,
        limit: limit
    });
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