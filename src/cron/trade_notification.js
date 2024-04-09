const empire = require("../api/empire.js");
const User = require("../models/user.js");
const Telegram = require("../service/telegram.js");
const _ = require("underscore");

async function checkTrades() {
    const user = await User.findOne({ where: { email: "rcontas@gmail.com" }});
    const trades = await empire.getActiveTrades(user.empire_api_key);
    if (!trades.data.success) {
        console.log("Failed to call empire trades API");
        if (trades.data.message) {
            console.log(trades.data.message);
        }
        return;
    }
    _.each(trades.data.data.deposits, (trade) => {
        switch (trade.status) {
            case 3:
                Telegram.sendTrade(user, trade);
                break;
        }
    });
}

checkTrades();