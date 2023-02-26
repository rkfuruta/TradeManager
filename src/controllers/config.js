const Config = require("../models/config.js");

async function get(req, res) {
    const tokenData = req.token_data;
    const userId = tokenData.user_id;
    const params = req.query;
    if (!params.hasOwnProperty("code")) {
        return res.status(400).json({ success: false, message: "Param 'code' is required"});
    }
    const config = await Config.findOne({ where: { user_id: userId, code: params.code } });
    return res.status(200).json({ success: true, data: {config}});
}

async function set(req, res) {
    const tokenData = req.token_data;
    const userId = tokenData.user_id;
    if (!req.body.hasOwnProperty("code") || !req.body.hasOwnProperty("value")) {
        return res.status(400).json({ success: false, message: "Param 'code' e 'value' are required"});
    }
    const hasConfig = await Config.findOne({ where: { user_id: userId, code: req.body.code } });
    if (!hasConfig) {
        await Config.create({ user_id: userId, code: req.body.code, value: req.body.value });
    } else {
        await Config.update({ value: req.body.value }, { where: { user_id: userId, code: req.body.code } })
    }
    let config = await Config.findOne({ where: { user_id: userId, code: req.body.code } });
    return res.status(200).json({ success: true, data: {config}});
}

async function all(req, res) {
    const tokenData = req.token_data;
    const userId = tokenData.user_id;
    let configs = await Config.findAll({ where: { user_id: userId } });
    return res.status(200).json({ success: true, data: {configs}});
}

async function remove(req, res) {
    const tokenData = req.token_data;
    const userId = tokenData.user_id;
    if (!req.body.hasOwnProperty("code")) {
        return res.status(400).json({ success: false, message: "Param 'code' is required"});
    }
    let result = await Config.destroy({ where: { user_id: userId, code: req.body.code } });
    return res.status(200).json({ success: !!(result) });
}

module.exports = {
    get,
    set,
    all,
    remove
};