const axios = require("axios");

const endpoint = "https://csgoempire.com/api/v2/";

async function getInventory(apiKey) {
    return axios.get(`${endpoint}trading/user/inventory`, { headers: {"Authorization" : `Bearer ${apiKey}`} });
}

async function getTransaction(page, apiKey) {
    return axios.get(`${endpoint}user/transactions?page=${page}`, { headers: {"Authorization" : `Bearer ${apiKey}`} });
}

async function getWithdrawals(apiKey) {
    return axios.get(`${endpoint}trading/user/withdrawals/history`, { headers: {"Authorization" : `Bearer ${apiKey}`} });
}

async function getDeposits(apiKey) {
    return axios.get(`${endpoint}trading/user/deposits/history`, { headers: {"Authorization" : `Bearer ${apiKey}`} });
}

async function depositItem(itemId, price, apiKey) {
    return axios.post(`${endpoint}trading/deposit`, {items: [{id: itemId, coin_value: price}]},  { headers: {"Authorization" : `Bearer ${apiKey}`} });
}

module.exports = {
    getInventory,
    getTransaction,
    getWithdrawals,
    getDeposits,
    depositItem
}