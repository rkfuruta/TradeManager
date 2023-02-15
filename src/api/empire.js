const axios = require("axios");

const endpoint = "https://csgoempire.com/api/v2/";

async function getInventory(apiKey) {
    return axios.get(`${endpoint}trading/user/inventory`, { headers: {"Authorization" : `Bearer ${apiKey}`} });
}

module.exports = {
    getInventory
}