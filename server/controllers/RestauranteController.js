const restauranteModel = require('../models').restaurante;
const validacionesGenerales = require('../utils/ValidacionesGeneralesUtils');
const constantesGenerales = require('../constantes/ConstantesGenerales');
const filesUtils = require('../utils/FilesUtils');
const { QueryTypes } = require('sequelize');
const arraysUtils = require('../utils/ArraysUtils');
const sequelize = require('../models/index').sequelize;



/* Crea un nuevo restaurante. */
function create(req, res) {
    if (validacionesGenerales.isNullOrUndefined(req) || validacionesGenerales.isNullOrUndefined(req.body)) {
        res.status(500).send("Si se ha enviado la data");
        return;
    }
    let restaurante = req.body;
    if (validacionesGenerales.isNullOrUndefined(restaurante)) {
        res.status(500).send("No se ha enviado la informacion del restaurante");
        return;
    }
    if (validacionesGenerales.isNullOrUndefined(req.files) || validacionesGenerales.isNullOrUndefined(req.files.file)) {
        res.status(500).send("No se ha la foto del restaurante");
        return;
    }
    let fileFotoRestaurante = req.files.file
    let ubicacion = constantesGenerales.RUTA_GUARDAR_IMAGENES_RESTAURANTES;
    let fileName = ubicacion + fileFotoRestaurante.name;

    /* Mueve el archivo a la direccion especificada. */
    filesUtils.saveFileInServerPath(fileFotoRestaurante, fileName);
    /* Setea la direccion de la foto en el restaurante. */
    restaurante.url = fileName;
    restaurante.usuarioregistro = constantesGenerales.USUARIO_REGISTRO_DEFECTO;

    /* Se llama a la funcion create para persistir el restaurante. */
    restauranteModel.create(restaurante)
        .then(restaurante => {
            console.log("Restaurante: " + restaurante.nombre + " creado exitosamente");
            res.status(200).send({ restaurante });
        })
        .catch(err => {
            /* Si se produce un error al registrar el restaurante se elimina la foto creada. */
            console.log("Error al registrar el restaurante: ", err);
            filesUtils.deleteFileIfExists(fileName);
            res.status(500).send({ err });
        });
}


function getRestaurantesCategoriasPlanificacionByPagina(req, res) {    
    if (validacionesGenerales.isNullOrUndefined(req.params)) {
        return;
    }

    let numeroPagina = req.params.numeropagina;
    let tamanioPagina = req.params.tamaniopagina;
    
    numeroPagina = numeroPagina - 1;
    let offset = numeroPagina * tamanioPagina;

    /* Primero se hace un count de los resultados. */
    let date = new Date();
    let fechaActual = date.toISOString();   
    fechaActual = "'"+fechaActual+"'";
    
    var query = "SELECT count(distinct(res.idrestaurante)) as totalcount ";
    query = query + " FROM restaurantes res";
    query = query + " JOIN detallesrestaurantescategorias drc on drc.idrestaurante = res.idrestaurante";
    query = query + " JOIN categoriasrestaurantes catres on drc.idcategoriasrestaurantes = catres.idcategoriasrestaurantes";
    query = query + " JOIN planificaciones pla ON res.idrestaurante = pla.idrestaurante";
    query = query + " JOIN detalleplanificaciones dtp ON pla.idplanificacion = dtp.idplanificacion";
    query = query + " WHERE dtp.stock > 0;";
    
    sequelize.query(query, {
        type: QueryTypes.SELECT
    }).then(rows => {        
        if (!validacionesGenerales.isNullOrUndefined(rows) && !validacionesGenerales.isNullOrUndefined(rows[0].totalcount) && rows[0].totalcount > 0) {
            let totalcount = rows[0].totalcount;

            var queryGetData = "SELECT";
            queryGetData = queryGetData + " res.idrestaurante, res.nombre AS nombrerestaurante, res.url, res.calleprincipal, res.callesecundaria,";
            queryGetData = queryGetData + " catres.idcategoriasrestaurantes, catres.nombre as nombrecategoriarestaurante ";
            queryGetData = queryGetData + " FROM restaurantes res ";
            queryGetData = queryGetData + " JOIN detallesrestaurantescategorias drc on drc.idrestaurante = res.idrestaurante ";
            queryGetData = queryGetData + " JOIN categoriasrestaurantes catres on drc.idcategoriasrestaurantes = catres.idcategoriasrestaurantes ";
            queryGetData = queryGetData + " JOIN planificaciones pla ON res.idrestaurante = pla.idrestaurante ";
            queryGetData = queryGetData + " JOIN detalleplanificaciones dtp ON pla.idplanificacion = dtp.idplanificacion ";
            queryGetData = queryGetData + " WHERE dtp.stock > 0";
            queryGetData = queryGetData + " GROUP BY (res.idrestaurante, catres.idcategoriasrestaurantes) ";
            queryGetData = queryGetData + " LIMIT " + tamanioPagina + " OFFSET " + offset;            

            sequelize.query(queryGetData, {
                type: QueryTypes.SELECT
            }).then(restaurantes => {         
                let restaurantesCategorias = armarRestaurantesCategorias(restaurantes);   
                res.status(200).send(JSON.stringify({totalcount: totalcount, data: restaurantesCategorias}));
            }).catch(err => {
                console.log("Error al obtener la data de restaurantes y categorias: ", err);            
                res.status(500).send({ err });
            });
            /* Fin consulta de la data. */
        } else {
            res.status(200).send({message: "No se obtuvo restaurantes - categorias"});
        }
    }).catch(error => {
        console.log("Error al realizar el count de restaurantes categorias.", error);
        res.status(500).send({ error });
    });
}

function armarRestaurantesCategorias (restaurantes) {
    let arrayRestaurantes = null;
    if (validacionesGenerales.isNullOrUndefined(restaurantes)) {
        return arrayRestaurantes;
    }
    let arrayKeysIdRestaurante = obtenerListaValoresByKey(restaurantes, 'idrestaurante');
    
    arrayRestaurantes = new Array();
    for (let idRestaurante of arrayKeysIdRestaurante) {
        let filtroPorIdRestaurante = restaurantes.filter(function(item) {
            return item.idrestaurante == idRestaurante;
          });
        let restauranteBase = filtroPorIdRestaurante[0];
        let newRestaurante = {
            idrestaurante: restauranteBase['idrestaurante'],
            nombrerestaurante: restauranteBase['nombrerestaurante'],
            direccion: restauranteBase['calleprincipal'] + ' y ' + restauranteBase['callesecundaria'],
            url: restauranteBase['url'],
            listacategoriasrestaurantes: obtenerCategoriasRestaurantes(filtroPorIdRestaurante),
        }
        arrayRestaurantes.push(newRestaurante);        
    }
    return arrayRestaurantes;
}

function obtenerListaValoresByKey(listaEntrada, key) {
    let lista = null;
    if (arraysUtils.isEmpty(listaEntrada)) {
        return lista;
    }
    lista = new Array();
    for (var i = 0; i < listaEntrada.length; i++) {
        const value = (listaEntrada[i])[key];
        if (!lista.includes(value)) {
            lista.push(value);
        }        
    }
    return lista;
}

function obtenerCategoriasRestaurantes (restaurantes) {
    let arrayCategorias = null;
    if (arraysUtils.isEmpty(restaurantes)) {
        return arrayCategorias;
    }
    arrayCategorias = new Array();
    for (let categoriaRestaurante of restaurantes) {    
        let newCategoriaRestaurante = {
            idcategoriasrestaurantes: categoriaRestaurante['idcategoriasrestaurantes'],
            nombrecategoriarestaurante: categoriaRestaurante['nombrecategoriarestaurante']
        }    
        arrayCategorias.push(newCategoriaRestaurante);
    }
    return arrayCategorias;
}


/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
function getRestaurantesPlanificacionByPagina(req, res){
    if (validacionesGenerales.isNullOrUndefined(req.params)) {
        return;
    }
    let numeroPagina = req.params.numeropagina;
    let tamanioPagina = req.params.tamaniopagina;
    
    numeroPagina = numeroPagina - 1;
    let offset = numeroPagina * tamanioPagina;

    /* Primero se hace un count de los resultados. */
    let date = new Date();
    let fechaActual = date.toISOString();   
    fechaActual = "'"+fechaActual+"'";
    
    var query = "SELECT count(distinct(res.idrestaurante)) as totalcount ";
        query = query + " FROM restaurantes as res";
        query = query + " JOIN planificaciones as pla ON res.idrestaurante = pla.idrestaurante";
        query = query + " JOIN detalleplanificaciones as dtp ON pla.idplanificacion = dtp.idplanificacion";
        query = query + " WHERE dtp.stock > 0";
    
    sequelize.query(query, {
        type: QueryTypes.SELECT
    }).then(rows => {        
        if (!validacionesGenerales.isNullOrUndefined(rows) && !validacionesGenerales.isNullOrUndefined(rows[0].totalcount) && rows[0].totalcount > 0) {
            let totalcount = rows[0].totalcount;

            var queryGetData = "SELECT res.idrestaurante, res.nombre, res.url";
            queryGetData = queryGetData + " FROM restaurantes res";
            queryGetData = queryGetData + " JOIN planificaciones pla ON res.idrestaurante = pla.idrestaurante";
            queryGetData = queryGetData + " JOIN detalleplanificaciones dtp ON pla.idplanificacion = dtp.idplanificacion";
            queryGetData = queryGetData + " WHERE dtp.stock > 0";
            queryGetData = queryGetData + " GROUP BY res.idrestaurante, res.nombre, res.url";
            queryGetData = queryGetData + " LIMIT " + tamanioPagina + " OFFSET " + offset;            

            sequelize.query(queryGetData, {
                type: QueryTypes.SELECT
            }).then(restaurantes => {                
                res.status(200).send(JSON.stringify({totalcount: totalcount, data: restaurantes}));
            }).catch(err => {
                console.log("Error al obtener la data de restaurantes: ", err);            
                res.status(500).send({ err });
            });
            /* Fin consulta de la data. */
        } else {
            res.status(200).send({message: "No se obtuvo restaurantes"});
        }
    }).catch(error => {
        console.log("Error al realizar el count de ofertaspedidos.", error);
        res.status(500).send({ error });
    });
}



module.exports = {
    create,
    getRestaurantesPlanificacionByPagina,
    getRestaurantesCategoriasPlanificacionByPagina,
    armarRestaurantesCategorias,
    obtenerCategoriasRestaurantes

}