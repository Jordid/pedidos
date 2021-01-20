var njwt = require('njwt');
const secret = require('../config/config.json').token_secret;

function auth(req, res, next) {
    if (!req.headers.authorization) {
        return res.status(403).send({ "menssage": "La petición no tiene la cabecera de autentificación." });
    }
    var token = req.headers.authorization.replace(/["'"]+/g, '');
    console.info("Token", token);
    var payload = njwt.verify(token, secret, (err, verifiedJwt) => {
        if (err) {
            console.info("Error", err);
            return res.status(401).send({ message: "Acceso no autorizado" });
        } else {
            next();
        }
    });
}

module.exports = {
    auth
}