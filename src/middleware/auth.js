const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const authorization = req.headers["authorization"];
    let token = [];
    if (authorization) {
        token = authorization.match(/^Bearer ((?:\.?(?:[A-Za-z0-9-_]+)){3})$/);
    }
    if (!authorization || !token || token[1] === undefined) {
        return res.status(403).json({ success: false, message: "A token is required for authentication"});
    }
    try {
        req.token_data = jwt.verify(token[1], process.env.TOKEN_KEY);
    } catch (err) {
        return res.status(401).json({ success: false, message: "Invalid Token"});
    }
    return next();
};

module.exports = verifyToken;