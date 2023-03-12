const Log = require("../models/log");
const BotConfig = require("../models/bot_config");
const { Op } = require("sequelize");
const moment = require("moment");
const fs = require('fs');
const dotenv = require("dotenv/config.js");
const { exec } = require("child_process");

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

async function config(req, res) {
    if (!fs.existsSync(process.env.PATH_TO_BOT_CONFIG_FILE)) {
        return res.status(400).json({ success: false, message: `File ${process.env.PATH_TO_BOT_CONFIG_FILE} not found`});
    }
    let config = fs.readFileSync(process.env.PATH_TO_BOT_CONFIG_FILE);
    return res.status(200).json(
        {
            success: true ,
            config: JSON.parse(config)
        }
    );
}

async function configUpdate(req, res) {
    try {
        if (!fs.existsSync(process.env.PATH_TO_BOT_CONFIG_FILE)) {
            return res.status(400).json({ success: false, message: `File ${process.env.PATH_TO_BOT_CONFIG_FILE} not found`});
        }
        const json = req.body.config;
        await fs.writeFile(process.env.PATH_TO_BOT_CONFIG_FILE, JSON.stringify(json), 'utf8', (err) => {
            if (err) {
                console.log(err);
            }
        });
        if (process.env.PM2_EXEC_COMMAND) {
            exec(process.env.PM2_EXEC_COMMAND, (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    return;
                }
                console.log(`stdout: ${stdout}`);
            });
        }
        return res.status(200).json({ success: true });
    } catch (e) {
        return res.status(400).json({ success: false, message: e.message });
    }
    return res.status(400).json({ success: false });
}

module.exports = {
    all,
    config,
    configUpdate
};