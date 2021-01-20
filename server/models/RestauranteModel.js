module.exports = (sequelize, DataTypes) => {
    const restaurante = sequelize.define('restaurante', {
        idrestaurante:{            
            autoIncrement:true,
            primaryKey:true,
            type:DataTypes.INTEGER
        },
        nombre:DataTypes.STRING,
        observacion:DataTypes.STRING,
        numeroprincipal:DataTypes.STRING,    
        numerocelular:DataTypes.STRING,    
        operadoracelular:DataTypes.STRING,    
        estado:DataTypes.STRING,            
        usuarioregistro:DataTypes.STRING,        
        usuariomodificacion:DataTypes.STRING,
        url:DataTypes.STRING,        
        createdAt:DataTypes.DATE,
        updatedAt:DataTypes.DATE  
    });
    return restaurante;
}
