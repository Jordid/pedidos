const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(express.static('server/public'));

const fileUpload = require('express-fileupload')
app.use(fileUpload())


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Headers.
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers',
        'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET', 'POST', 'OPTIONS', 'PUT', 'DELETE');
    next();
});

// Rutas
require('./server/routes/PlatoRoutes')(app);
require('./server/routes/RestauranteRoutes')(app);
require('./server/routes/OfertaPedidosRoutes')(app);
require('./server/routes/UsuarioRoutes')(app);
require('./server/routes/CategoriaPlatoRoutes')(app);
require('./server/routes/UbicacionRoutes')(app);

app.get('*', (req, res) => {
    res.status(200).send({ message: 'Bienvenido al server apiRestPedidos...' });
});

module.exports = app;

// cont = 3;