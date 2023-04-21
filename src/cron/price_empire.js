const axios = require("axios");
const fs = require('fs');
const dotenv = require("dotenv/config.js");
const moment = require("moment");

const fileLocation = __dirname + "/../../priceempire.json";

async function getPriceEmpire() {
    const result = await axios.get(`https://api.pricempire.com/v2/getAllItems?token=${process.env.PRICEMPIRE_API_KEY}&source=buff163_quick,csgoempire&liquidity=true`);
    if (result.hasOwnProperty("data")) {
        result.data["created_at"] = moment();
        fs.writeFile(fileLocation, JSON.stringify(result.data), function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });
    }

}

getPriceEmpire();
