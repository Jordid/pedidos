const categoriaPlatoController = require('../controllers').categoriaPlatoController;

module.exports = (app) => {
    app.get('/api/categoriaPlato/getAllCategoriasPlatoPlanificacion', categoriaPlatoController.getAllCategoriasPlatoPlanificacion);        
}