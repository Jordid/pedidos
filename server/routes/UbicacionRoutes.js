
const ubicacionController = require('../controllers').ubicacionController;

module.exports = (app) => {
    app.get('/api/ubicacion/getUbicacionesByIdEntidad/:identidad', ubicacionController.getUbicacionesByIdEntidad);
}