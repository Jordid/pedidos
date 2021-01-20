module.exports = (sequelize, DataTypes) => {
    const platos = sequelize.define('platos', {
        idplato:{            
            autoIncrement:true,
            primaryKey:true,
            type:DataTypes.INTEGER
        },
        nombre:DataTypes.STRING,
        descripcion:DataTypes.STRING,
        estado:DataTypes.STRING,        
        url:DataTypes.STRING,        
        usuarioregistro:DataTypes.STRING,        
        usuariomodificacion:DataTypes.STRING,        
        createdAt:DataTypes.DATE,
        updatedAt:DataTypes.DATE,
        precio: DataTypes.DOUBLE
    });
    return platos;
}

