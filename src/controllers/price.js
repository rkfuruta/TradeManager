const fs = require("fs");

const fileLocation = __dirname + "/../../priceempire.json";

async function get(req, res) {
    const file = fs.readFileSync(fileLocation);
    if (file) {
        res.status(200).json(JSON.parse(file));
    } else {
        res.status(401).json({ success: false, message: "Invalid Credentials"});
    }
}

module.exports = {
    get
};