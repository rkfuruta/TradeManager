const user = require("../models/user.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function findAll(req, res) {
    const users = await user.findAll();
    res.json(users);
}

function create(req, res) {
    const body = req.body;
    bcrypt.hash(body.password, 10, function(err, hash) {
        user.create({
            name: body.name,
            email: body.email,
            password: hash,
        }).then((result) => res.json(result));
    });
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!(email && password)) {
            res.status(400).json({ success: false, message: "All input is required"});
        }

        const model = await user.findOne({ where: { email:email } });

        if (model && (await bcrypt.compare(password, model.password))) {
            // Create token
            const token = jwt.sign(
                { user_id: model.id, email },
                process.env.TOKEN_KEY,
                {
                    expiresIn: "2h",
                }
            );

            model.token = token;
            model.save();

            res.status(200).json({
                id: model.id,
                name: model.name,
                email: model.email,
                token: model.token,
                created_at: model.created_at,
            });
        }
        res.status(401).json({ success: false, message: "Invalid Credentials"});
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    findAll,
    create,
    login
};