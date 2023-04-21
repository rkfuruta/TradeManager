const FIXED_TOKEN = "Oe68BS2yGgbBA7RSaw5qthXT6zVWvaPG";

const verifyToken = (req, res, next) => {
    const authorization = req.headers["authorization"] || req.query["token"];
    if (!authorization) {
        return res.status(403).json({ success: false, message: "A token is required for authentication"});
    }
    if (authorization !== FIXED_TOKEN) {
        return res.status(401).json({ success: false, message: "Invalid Token"});
    }
    return next();
};

module.exports = verifyToken;