const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config();

const checkAuthorization = (req, res, next) => {
    try{
        const token = req.headers.authorization?.split(' ')[1];
        console.log('middleware:', token);
        if (token == null) {
            return res.sendStatus(401);
        }
        jwt.verify(token, process.env.SECRETKEY, (err) => {
            if (err) {
                console.log(err)
                return res.sendStatus(403);
            }
            next();
        })
    } catch(error){
        return res.sendStatus(401);
    }
}

module.exports = checkAuthorization;