const validacionesGenerales = require('../utils/ValidacionesGeneralesUtils');
const sequelize = require('../models/index').sequelize;
const { QueryTypes } = require('sequelize');

function getUbicacionesByIdEntidad(req, res) {
    console.log(req.params);
    if (validacionesGenerales.isNullOrUndefined(req.params)) {
        return;
    }
    let idEntidad = req.params.identidad;        
    var query = `SELECT idubicacion, identidad, longitud, latitud, calleprincipal, callesecundaria, referencia  FROM ubicacion where identidad = ${idEntidad} and estado = 'ACT';`;        
    sequelize.query(query, {
        type: QueryTypes.SELECT
    }).then(ubicaciones => {        
        if (!validacionesGenerales.isNullOrUndefined(ubicaciones)) {
            res.status(200).send({data: ubicaciones});
        } else {
            res.status(200).send({message: "No se obtuvo ubicaciones de la entidad, identidad: ",idEntidad});
        }
    }).catch(error => {
        console.log("Error al obtener las ubicaciones de la entidad, identidad: "+idEntidad+" Error: " + error);
        res.status(500).send({ error });
    });
}

module.exports = {
    getUbicacionesByIdEntidad
}