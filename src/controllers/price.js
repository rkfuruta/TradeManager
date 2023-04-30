const fs = require("fs");
const moment = require("moment");

const fileLocation = __dirname + "/../../priceempire.json";

async function get(req, res) {
    try {
        const file = fs.readFileSync(fileLocation);
        if (file) {
            const json = JSON.parse(file);
            if (json.hasOwnProperty("created_at")) {
                const created_at = moment(json.created_at);
                const valid = moment().subtract(2, 'hours');
                if (created_at.isBefore(valid)) {
                    res.status(503).json({ success: false, message: `Last price update occurred more than 2 hours ago. Last update ${created_at.format('YYYY-MM-DD HH:mm:ss')}` });
                } else {
                    res.status(200).json(json);
                }
            } else {
                res.status(500).json({ success: false });
            }
        } else {
            res.status(401).json({ success: false, message: "Invalid Credentials"});
        }
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
}

module.exports = {
    get
};