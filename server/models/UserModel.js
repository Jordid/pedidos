module.exports = (sequelize, DataTypes) => {
    const usuarios = sequelize.define('usuarios', {
        idusuario: {
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        email: DataTypes.STRING,
        password: DataTypes.STRING,
        estado: DataTypes.STRING,
        catvaltipousuario: DataTypes.STRING,
        usuarioregistro: DataTypes.STRING,
        usuariomodificacion: DataTypes.STRING,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
    });
    return usuarios;
}