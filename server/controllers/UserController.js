const usuarioModel = require('../models').usuarios;
const { QueryTypes } = require('sequelize');
const userdb = require('../models/index').sequelize;
const jwt = require('../services/jwt');

function findAll(req, res) {
    usuarioModel.findAll()
        .then(usuarios => {
            res.status(200).send({ usuarios });
        })
        .catch(err => {
            res.status(500).send({ err });
        })
}

function login(req, res) {
    usuarioModel.findOne({
        where: {
            username: req.body.usuario,
            password: req.body.password
        }
    }).then(usuario => {
        if (usuario) {
            if (req.body.token) {
                res.status(200).send({
                    "token": jwt.createToken(usuario)
                });
            } else {
                res.status(200).send({
                    "usuario": usuario,
                });
            }
        } else {
            res.status(401).send({ menssage: "Acceso no autorizado." });
        }
    }).catch(err => {
        console.info(err);
        res.status(500).send({ err });
    });
}

module.exports = {
    findAll,
    login
}