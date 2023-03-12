const Log = require("../models/log");
const BotConfig = require("../models/bot_config");
const { Op } = require("sequelize");
const moment = require("moment");

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

async function configChanged(req, res) {
    const params = req.query;
    if (!params.hasOwnProperty("timestamp")) {
        return res.status(400).json({ success: false, message: "Param 'timestamp' is required"});
    }
    const config = await BotConfig.findOne({where: { entity_id: 1 }});
    const date = moment.unix(params.timestamp);
    const updatedAt = moment.utc(config.updatedAt);
    return res.status(200).json(
        {
            success: true ,
            updated: date.isBefore(updatedAt)
        }
    );
}

async function config(req, res) {
    const config = await BotConfig.findOne({where: { entity_id: 1 }});
    return res.status(200).json(
        {
            success: true ,
            config: JSON.parse(config.json),
            updatedAt: moment.utc(config.updatedAt).unix()
        }
    );
}

async function configUpdate(req, res) {
    try {
        const json = req.body.config;
        await BotConfig.update({json: json}, {where: { entity_id: 1 }});
        return res.status(200).json({ success: true });
    } catch (e) {}
    return res.status(400).json({ success: false });
}

module.exports = {
    all,
    config,
    configChanged,
    configUpdate
};