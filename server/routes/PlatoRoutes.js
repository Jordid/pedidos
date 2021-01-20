const platoController = require('../controllers').platoController;

module.exports = (app) => {
    app.post('/api/plato', platoController.create);
    app.get('/api/plato/findAll', platoController.findAll);
    app.get('/api/plato/getPlatosPlanificacionByPagina/:idcategoria', platoController.getPlatosPlanificacionByPagina);
    app.get('/api/plato/findPlatoById/:idplato', platoController.findPlatoById);    
    app.post('/api/plato/searchPlatosPlanificacionByPagina', platoController.searchPlatosPlanificacionByPagina);
    
}