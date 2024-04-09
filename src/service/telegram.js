const axios = require("axios");
const endpoint =  `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${process.env.TELEGRAM_CHAT_ID}&text=`;

async function sendTrade(user, trade) {
    notify(`${user.name}, ${trade.item.market_name} sold for ${trade.item.market_value} coins`);
}


async function notify(message) {
    return axios.get(endpoint + encodeURIComponent(message));
}

module.exports = {
    sendTrade
}