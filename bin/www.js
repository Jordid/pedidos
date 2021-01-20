const http = require('http');
const app = require('../app');

const port = process.env.PORT || 8010;

app.set('port', port);

const server = http.createServer(app);
server.listen(port);
console.log("Server apiRestPedidos escuchando en el puerto: ", port);