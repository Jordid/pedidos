
const sequelize = require('../models/index').sequelize;
const { QueryTypes } = require('sequelize');

function getAllCategoriasPlatoPlanificacion(req, res){    
    var query = "SELECT catpla.idcategoriaplato, catpla.nombre";
    query = query + " FROM planificaciones pla ";
    query = query + " JOIN detalleplanificaciones dtp ON pla.idplanificacion = dtp.idplanificacion ";
    query = query + " JOIN platos plt ON dtp.idplato = plt.idplato ";
    query = query + " JOIN detallesplatoscategorias dpcat ON dtp.idplato = dpcat.idplato ";
    query = query + " JOIN categoriasplatos catpla ON dpcat.idcategoriaplato = catpla.idcategoriaplato ";
    query = query + " where dtp.stock > 0 ";
    query = query + " group by (catpla.idcategoriaplato, catpla.nombre) ";    
   
    sequelize.query(query, {
        type: QueryTypes.SELECT
    }).then(categoriasPlatos => {
        res.status(200).send(JSON.stringify({data: categoriasPlatos}));
    }).catch(error => {
        console.log("Error al realizar obtener categorias platos.", error);
        res.status(500).send({ error });
    });
}


/**
 * Se exporta las funciones de este archivo.
 */
module.exports={
    getAllCategoriasPlatoPlanificacion
}