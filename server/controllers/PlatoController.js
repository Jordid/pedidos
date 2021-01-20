const platoModel = require('../models').platos;
const { QueryTypes } = require('sequelize');
const sequelize = require('../models/index').sequelize;
const validacionesGenerales = require('../utils/ValidacionesGeneralesUtils');
const arraysUtils = require('../utils/ArraysUtils');
const DateUtils = require('../utils/DateUtils');

function create(req, res) {
    let plato = req.body;
    platoModel.create(plato)
    .then(plato => {
        res.status(200).send({ data: plato });
    })
    .catch(err => {
        console.log("Error al crear el plato: ", err);
        res.status(500).send("Se ha producido un error al crear el plato.");
    });   
}

function findAll(req, res) {
    platoModel.findAll()
        .then(platos => {
            res.status(200).send({ platos });
        })
        .catch(err => {
            res.status(500).send({ err });
        })
}

function getPlatosPlanificacionByPagina(req, res) {
    console.log(req.params);
    if (validacionesGenerales.isNullOrUndefined(req.params)) {
        return;
    }
    let idcategoria = req.params.idcategoria;

    var query = " SELECT res.idrestaurante, res.nombre AS nombrerestaurante, res.calleprincipal, ";
    query = query + " res.callesecundaria, res.url as urlrestaurante, plt.idplato, plt.nombre AS nombreplato, plt.url as urlplato, plt.precio, plt.descripcion as descripcionplato ";
    query = query + " FROM restaurantes res ";
    query = query + " JOIN planificaciones pla ON res.idrestaurante = pla.idrestaurante ";
    query = query + " JOIN detalleplanificaciones dtp ON pla.idplanificacion = dtp.idplanificacion ";
    query = query + " JOIN platos plt ON dtp.idplato = plt.idplato ";
    query = query + " JOIN detallesplatoscategorias dpcat ON dtp.idplato = dpcat.idplato ";
    query = query + " JOIN categoriasplatos catpla ON dpcat.idcategoriaplato = catpla.idcategoriaplato ";
    query = query + " WHERE dtp.stock > 0 AND catpla.idcategoriaplato = " + idcategoria;
    query = query + " GROUP BY (res.idrestaurante, plt.idplato);";

    sequelize.query(query, {
        type: QueryTypes.SELECT
    }).then(platosPlanificacion => {
        let platosplanificacion = armarPlatosPlanificacion(platosPlanificacion);
        res.status(200).send(JSON.stringify({ data: platosplanificacion }));
    }).catch(err => {
        console.log("Error al obtener la data de platosplanificacion: ", err);
        res.status(500).send({ err });
    });
}

function armarPlatosPlanificacion(platosPlanificacionIn) {
    let platosplanificacion = null;
    if (validacionesGenerales.isNullOrUndefined(platosPlanificacionIn)) {
        return platosplanificacion;
    }
    platosplanificacion = new Array();
    for (let platosPlanificacion of platosPlanificacionIn) {
        let newPlatoPlanificacion = {
            idplato: platosPlanificacion['idplato'],
            nombre: platosPlanificacion['nombreplato'],
            url: platosPlanificacion['urlplato'],
            precio: platosPlanificacion['precio'],
            descripcion: platosPlanificacion['descripcionplato'],
            restaurante: {
                idrestaurante: platosPlanificacion['idrestaurante'],
                nombre: platosPlanificacion['nombrerestaurante'],
                direccion: platosPlanificacion['calleprincipal'] + " y " + platosPlanificacion['callesecundaria'],
                url: platosPlanificacion['urlrestaurante'],
            }
        }
        platosplanificacion.push(newPlatoPlanificacion);
    }
    return platosplanificacion;
}

function findPlatoById(req, res) {
    console.log(req.params);
    if (validacionesGenerales.isNullOrUndefined(req.params)) {
        return;
    }
    let idplato = req.params.idplato;
    var query = "select idplato, nombre as nombreplato, descripcion as descripcionplato, precio, url from platos where idplato = " + idplato;
    sequelize.query(query, {
        type: QueryTypes.SELECT
    }).then(platos => {
        let platoFin = null;
        if (!arraysUtils.isEmpty(platos)) {
            platoFin = platos[0];
        }
        res.status(200).send(JSON.stringify({ data: platoFin }));
    }).catch(err => {
        console.log("Error al obtener la data del plato, idplato: " + idplato, err);
        res.status(500).send({ err });
    });
}

function searchPlatosPlanificacionByPagina(req, res) {
    let numeroPagina = req.body.numeropagina;
    let tamanioPagina = req.body.tamaniopagina;

    let idscategorias = req.body.idscategorias;
    let idsrestaurantes = req.body.idsrestaurantes;
    let textosearch = req.body.textosearch;

    idscategorias = arraysUtils.isEmpty(idscategorias)? null: idscategorias;
    idsrestaurantes = arraysUtils.isEmpty(idsrestaurantes)? null: idsrestaurantes;

    console.log();

    numeroPagina = numeroPagina - 1;
    let offset = numeroPagina * tamanioPagina;

    let date = DateUtils.getStrCurrentDateAnioMesDiaHoraMinSeconds();
    console.log("Date: ", date);

    var query = "select count(*) as totalcount from ( ";
    query = query + " SELECT plt.idplato ";
    query = query + " FROM restaurantes res ";
    query = query + " JOIN planificaciones pla ON res.idrestaurante = pla.idrestaurante ";
    query = query + " JOIN detalleplanificaciones dtp ON pla.idplanificacion = dtp.idplanificacion ";
    query = query + " JOIN platos plt ON dtp.idplato = plt.idplato ";
    query = query + " JOIN detallesplatoscategorias dpcat ON dtp.idplato = dpcat.idplato ";
    query = query + " JOIN categoriasplatos catpla ON dpcat.idcategoriaplato = catpla.idcategoriaplato ";
    query = query + " WHERE dtp.stock > 0 AND pla.horafechainicio >= "+date;
    if (textosearch) {
        textosearch = textosearch.toLowerCase(textosearch);
        query = query + " AND ( lower(plt.nombre) like '%' || '" + textosearch + "' || '%' )";
    }

    if (!arraysUtils.isEmpty(idscategorias)) {
        let operador1 = textosearch? " OR ( ": " AND ( ";
        query = query + operador1;
        idscategorias = idscategorias.replace("[", "(");
        idscategorias = idscategorias.replace("]", ")");
        query = query + "catpla.idcategoriaplato in "+idscategorias + " ) ";
    }

    if (!arraysUtils.isEmpty(idsrestaurantes)) {
        idsrestaurantes = idsrestaurantes.replace("[", "(");
        idsrestaurantes = idsrestaurantes.replace("]", ")");
        let operador2 = textosearch || idscategorias? " OR ( ": " AND ( ";
        query = query + operador2;
        query = query + "res.idrestaurante in "+idsrestaurantes + " ) ";
    }

    query = query + " GROUP BY (plt.idplato) ";
    query = query + " ) as resultado ;";

    sequelize.query(query, {
        type: QueryTypes.SELECT
    }).then(rows => {
        let totalcount = 0;
        if (!validacionesGenerales.isNullOrUndefined(rows) && !validacionesGenerales.isNullOrUndefined(rows[0].totalcount) && rows[0].totalcount > 0) {
            totalcount = rows[0].totalcount;

            var queryGetData = "SELECT res.idrestaurante, res.nombre AS nombrerestaurante, res.url as urlrestaurante, ";
            queryGetData = queryGetData + " plt.idplato, plt.nombre AS nombreplato, plt.url as urlplato, plt.precio, ";
            queryGetData = queryGetData + " catpla.idcategoriaplato, catpla.nombre ";
            queryGetData = queryGetData + " FROM restaurantes res ";
            queryGetData = queryGetData + " JOIN planificaciones pla ON res.idrestaurante = pla.idrestaurante ";
            queryGetData = queryGetData + " JOIN detalleplanificaciones dtp ON pla.idplanificacion = dtp.idplanificacion ";
            queryGetData = queryGetData + " JOIN platos plt ON dtp.idplato = plt.idplato ";
            queryGetData = queryGetData + " JOIN detallesplatoscategorias dpcat ON dtp.idplato = dpcat.idplato ";
            queryGetData = queryGetData + " JOIN categoriasplatos catpla ON dpcat.idcategoriaplato = catpla.idcategoriaplato ";
            queryGetData = queryGetData + " WHERE dtp.stock > 0 AND pla.horafechainicio >= "+date;
            if (textosearch) {
                textosearch = textosearch.toLowerCase(textosearch);
                queryGetData = queryGetData + " AND ( lower(plt.nombre) like '%' || '" + textosearch + "' || '%' ) ";
            }
            if (idscategorias) {
                let operador3 = textosearch? " OR ( ": " AND ( ";
                queryGetData = queryGetData + operador3;
                queryGetData = queryGetData + "catpla.idcategoriaplato in "+idscategorias + " ) ";
            }
            if (idsrestaurantes) {
                let operador4 = textosearch || idscategorias? " OR ( ": " AND ( ";
                queryGetData = queryGetData + operador4;
                queryGetData = queryGetData + " res.idrestaurante in "+idsrestaurantes + " ) ";
            }
            queryGetData = queryGetData + " GROUP BY (res.idrestaurante, plt.idplato, catpla.idcategoriaplato) ";
            queryGetData = queryGetData + " LIMIT " + tamanioPagina + " OFFSET " + offset;

            sequelize.query(queryGetData, {
                type: QueryTypes.SELECT
            }).then(platos => {
                res.status(200).send(JSON.stringify({ totalcount: totalcount, data: armarInformacionPlatos(platos) }));
            }).catch(err => {
                console.log("Error al obtener la data de platos: ", err);
                res.status(500).send({ err });
            });
            /* Fin consulta de la data. */
        } else {
            res.status(200).send(JSON.stringify({ totalcount: totalcount, data: null }));
        }
    }).catch(error => {
        console.log("Error al realizar el count de platos.", error);
        res.status(500).send({ error });
    });
}

function armarInformacionPlatos(platosIn) {
    let platosplanificacion = null;
    if (validacionesGenerales.isNullOrUndefined(platosIn) || platosIn.length < 1) {
        return platosplanificacion;
    }
    platosplanificacion = new Array();
    let arrayKeysIdPlatos = obtenerListaValoresByKey(platosIn, 'idplato');

    for (let idplato of arrayKeysIdPlatos) {
        let filtroPorIdPlato = platosIn.filter(function (item) {
            return item.idplato == idplato;
        });
        let platoBase = filtroPorIdPlato[0];
        let newPlato = {
            idplato: platoBase['idplato'],
            nombre: platoBase['nombreplato'],
            url: platoBase['urlplato'],
            precio: platoBase['precio'],
            restaurante: {
                idrestaurante: platoBase['idrestaurante'],
                nombre: platoBase['nombrerestaurante']
            },
            listacategoriasplatos: armarInformacionCategoriasPlatos(filtroPorIdPlato),
        }
        platosplanificacion.push(newPlato);
    }
    return platosplanificacion;
}

function armarInformacionCategoriasPlatos(datosIn) {
    let categoriasPlatos = null;
    if (validacionesGenerales.isNullOrUndefined(datosIn) || datosIn.length < 1) {
        return platosplanificacion;
    }
    categoriasPlatos = new Array();
    let arrayKeysIdsCategoriasPlatos = obtenerListaValoresByKey(datosIn, 'idcategoriaplato');
    for (let idcategoriaplato of arrayKeysIdsCategoriasPlatos) {
        let filtroPorIdCategoriaPlato = datosIn.filter(function (item) {
            return item.idcategoriaplato == idcategoriaplato;
        });
        let categoriaPlatoBase = filtroPorIdCategoriaPlato[0];
        let newCategoriaPlato = {
            idcategoriaplato: categoriaPlatoBase['idcategoriaplato'],
            nombre: categoriaPlatoBase['nombre']
        }
        categoriasPlatos.push(newCategoriaPlato);
    }
    return categoriasPlatos;
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

module.exports = {
    create,
    findAll,
    getPlatosPlanificacionByPagina,
    findPlatoById,
    armarPlatosPlanificacion,
    searchPlatosPlanificacionByPagina,
    armarInformacionPlatos,
    armarInformacionCategoriasPlatos,
    obtenerListaValoresByKey
}