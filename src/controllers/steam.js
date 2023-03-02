const SteamAuth = require("node-steam-openid");
const dotenv = require("dotenv/config.js");
const User = require("../models/user.js");
const JWT = require("../jwt.js");

const steam = new SteamAuth({
    realm: process.env.BASE_API_URL,
    returnUrl: `${process.env.BASE_API_URL}v1/steam/login/auth`,
    apiKey: process.env.STEAM_API_KEY
});

async function login(req, res) {
    const redirectUrl = await steam.getRedirectUrl();
    return res.redirect(redirectUrl);
}

async function auth(req, res) {
    try {
        const user = await steam.authenticate(req);
        if (user.hasOwnProperty("steamid")) {
            let result = await User.findOne({ where : { steam_id: user.steamid }});
            if (result) {
                const token = JWT.generate(result.entity_id);
                return res.redirect(`${process.env.BASE_URL}?token=${token}`);
            }
        }
    } catch (error) {
        console.error(error);
    }
    return res.redirect(process.env.BASE_URL);
}

module.exports = {
    login,
    auth
}