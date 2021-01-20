const ofertaPedidosModel = require('../models').ofertapedidos;
const validacionesGenerales = require('../utils/ValidacionesGeneralesUtils');
const arraysUtils = require('../utils/ArraysUtils');

const sequelize = require('../models/index').sequelize;
const { QueryTypes } = require('sequelize');
const lodash = require('lodash');

function create(req,res){
    ofertaPedidosModel.create(req.body)
    .then(ofertaPedido=>{
        res.status(200).send({ofertaPedido});
    })
    .catch(err=>{
        res.status(500).send({err});
    })
}


/**
 * Obtiene todas las ofertas de pedidos.
 * @param {*} req 
 * @param {*} res 
 */
function findAll(req,res){
    ofertaPedidosModel.findAll()
    .then(ofertaPedido=>{
        res.status(200).send({ofertaPedido});
    })
    .catch(err=>{
        console.log(err);
        
        res.status(500).send({err});
    })
}


/**
 * Obtiene todas las ofertas pedidos por pagina.
 * @param {*} req 
 * @param {*} res 
 */
function findOfertasPedidosByPagina(req, res){
    if (validacionesGenerales.isNullOrUndefined(req) || validacionesGenerales.isNullOrUndefined(req.body)) {
        res.status(500).send("Si se ha enviado la data");
        return;
    }
    let numeroPagina = req.body.numeroPagina;
    if (validacionesGenerales.isNullOrUndefined(numeroPagina) || numeroPagina < 1) {
        res.status(500).send("No se ha enviado el numero de pagina.");
        return;
    }
    let tamanioPagina = req.body.tamanioPagina;
    if (validacionesGenerales.isNullOrUndefined(tamanioPagina) || tamanioPagina < 1) {
        res.status(500).send("No se ha enviado el tamanio de pagina.");
        return;
    }

    numeroPagina = numeroPagina - 1;
    let offset = numeroPagina * tamanioPagina;

    /* Primero se hace un count de los resultados. */
    let date = new Date();
    let fechaActual = date.toISOString();   
    fechaActual = "'"+fechaActual+"'";
    
    var query = "SELECT count(distinct(res.idrestaurante)) as totalcount";
        query = query + " FROM restaurantes res";
        query = query + " JOIN planificaciones pla ON res.idrestaurante = pla.idrestaurante";
        query = query + " JOIN detalleplanificaciones dtp ON pla.idplanificacion = dtp.idplanificacion";
        query = query + " FROM restaurantes res";

    console.log("query: ", query);
    
    sequelize.query(query, {
        type: QueryTypes.SELECT
    }).then(rows => {
        console.log("rows: ",rows);
        
        if (!validacionesGenerales.isNullOrUndefined(rows) && !validacionesGenerales.isNullOrUndefined(rows[0].totalcount) && rows[0].totalcount > 0) {
            let totalcount = rows[0].totalcount;
            console.log('totalcount: ', totalcount);
            
            /* Inicia la consulta de la data. */
            //let queryGetData = `select * from ofertapedidos  where horafechainicioplan >= '2020-06-20' ORDER BY prioridad desc LIMIT ${tamanioPagina} OFFSET ${offset}`;

            var queryGetData = "SELECT res.idrestaurante, res.nombre, res.url";
            queryGetData = queryGetData + " FROM restaurantes res";
            queryGetData = queryGetData + " JOIN planificaciones pla ON res.idrestaurante = pla.idrestaurante";
            queryGetData = queryGetData + " JOIN detalleplanificaciones dtp ON pla.idplanificacion = dtp.idplanificacion";
            queryGetData = queryGetData + "  WHERE dtp.stock > 20";
            queryGetData = queryGetData + "  GROUP BY res.idrestaurante, res.nombre, res.url";

            console.log("queryGetData: ", queryGetData);
            
            sequelize.query(queryGetData, {
                type: QueryTypes.SELECT
            }).then(restaurantes => {                
                //let finalData = agruparDataByRestaurante(restaurantes);

                res.status(200).send(JSON.stringify(finalData, null, 2));
            }).catch(err => {
                console.log("Error al obtener la data de ofertas pedidos.");
                console.log("Error: ", err);

                res.status(500).send({ err });
            });
            /* Fin consulta de la data. */
        } else {
            res.status(200).send({message: "No se obtuvo ofertas pedidos"});
        }
    }).catch(error => {
        console.log("Error al realizar el count de ofertaspedidos.", );
        res.status(500).send({ error });
    });
}

function agruparDataByRestaurante(restaurantes) {
    if (validacionesGenerales.isNullOrUndefined(restaurantes)) {
        return restaurantes;
    }
    console.log("restaurantes: ", restaurantes);    
    let arrayKeysIdRestaurante = obtenerListaValoresByKey(restaurantes, 'idrestaurante');
    let arrayRestaurantes = new Array();
    for (let idRestaurante of arrayKeysIdRestaurante) {
        let filtroPorIdRestaurante = restaurantes.filter(function(item) {
            return item.idrestaurante == idRestaurante;
          });
        let restauranteBase = filtroPorIdRestaurante[0];
        let newRestaurante = {
            idrestaurante: restauranteBase['idrestaurante'],
            nombrerestaurante: restauranteBase['nombrerestaurante'],
            urlfotorestaurante: restauranteBase['url'],
            listacategoriasplatos: obtenerCategoriasyPlatos(filtroPorIdRestaurante),
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

function obtenerCategoriasyPlatos(restaurantes) {
    let arrayCategorias = null;
    if (arraysUtils.isEmpty(restaurantes)) {
        return arrayCategorias;
    }
    let arrayIdsCategoriasPlato = obtenerListaValoresByKey(restaurantes, 'idcategoriaplato');
    arrayCategorias = new Array();
    for (let idCategoriaPlato of arrayIdsCategoriasPlato) {
        let categoriasPlatoPorId = restaurantes.filter(function(item) {
            return item.idcategoriaplato == idCategoriaPlato;
          });
        let categoriaPlatoBase = categoriasPlatoPorId[0];
        let newCategoriaPlato = {
            idcategoriaplato: categoriaPlatoBase['idcategoriaplato'],
            nombre: categoriaPlatoBase['nombrecategoria'],
            prioridad: categoriaPlatoBase['prioridad'],
            listaplatos: obtenerPlatos(categoriasPlatoPorId),
        }
        arrayCategorias.push(newCategoriaPlato);
    }
    return arrayCategorias;
}

function obtenerPlatos(restaurantes) {
    let arrayPlatos = null;
    if (arraysUtils.isEmpty(restaurantes)) {
        return arrayPlatos;
    }
    arrayPlatos = new Array();
    for (let restaurante of restaurantes) {
        let newPlato = {
            idplato: restaurante.idplato,
            nombreplato: restaurante.nombreplato,
            stock: restaurante.stock,
            urlfotoplato: restaurante.urlimagen
        }
        arrayPlatos.push(newPlato);
    }
    return arrayPlatos;
}

/**
 * Se exporta las funciones de este archivo.
 */
module.exports={
    create,
    findAll,
    findOfertasPedidosByPagina,
    agruparDataByRestaurante,
    obtenerPlatos,
    obtenerListaValoresByKey,
    obtenerCategoriasyPlatos
}