const ofertaPedidosController = require('../controllers').ofertaPedidosController;

module.exports = (app) => {
    app.get('/api/ofertaPedido/findAll', ofertaPedidosController.findAll);
    app.post('/api/ofertaPedido', ofertaPedidosController.create);
    app.post('/api/ofertaPedido/findOfertasPedidosByPagina', ofertaPedidosController.findOfertasPedidosByPagina);
    
}