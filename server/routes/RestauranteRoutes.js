const restauranteController = require('../controllers').restauranteController;

module.exports = (app) => {
    app.get('/api/restaurante/getRestaurantesPlanificacionByPagina/:numeropagina/:tamaniopagina', restauranteController.getRestaurantesPlanificacionByPagina);
    app.get('/api/restaurante/getRestaurantesCategoriasPlanificacionByPagina/:numeropagina/:tamaniopagina', restauranteController.getRestaurantesCategoriasPlanificacionByPagina);    
    app.post('/api/restaurante', restauranteController.create);
}