const jwt = require("jsonwebtoken");

function generate(user_id) {
    return jwt.sign(
        { user_id: user_id },
        process.env.TOKEN_KEY,
        { expiresIn: "30d" }
    );
}

module.exports = {
    generate
}