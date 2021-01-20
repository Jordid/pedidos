const usuarioController = require('../controllers').usuarioController;
const middleware = require('../authenticated/authenticated').auth;

module.exports = (app) => {
    //Definiciones de routes
    app.get('/api/usuario/findAll', middleware, usuarioController.findAll);
    app.get('/api/usuario/login', usuarioController.login);
}