var njwt = require('njwt');
const tokenSecret = require('../config/config.json').token_secret;

exports.createToken = (usuario) => {
    var params = {
        id: usuario.idusuario,
        usernom: usuario.username,
        usertype: usuario.catvaltipousuario
    }
    var jwt = njwt.create(params, tokenSecret);
    var t = new Date();
    t.setHours(t.getHours() + 4);
    jwt.setExpiration(t);
    return jwt.compact();
}