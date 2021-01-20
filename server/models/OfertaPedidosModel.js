module.exports = (sequelize, DataTypes) => {
    const ofertapedidos = sequelize.define('ofertapedidos', {

       idrestaurante:{            
            autoIncrement:true,
            primaryKey:true,
            type:DataTypes.INTEGER
        },
        nombrerestaurante: DataTypes.STRING,
        url: DataTypes.STRING,
        idplanificacion: DataTypes.INTEGER,
        nombreplan:DataTypes.STRING,
        horafechainicioplan:DataTypes.DATE,  
        horafechafinplan:DataTypes.DATE,  
        iddetalleplanificacion: DataTypes.INTEGER,
        stock:DataTypes.INTEGER,
        observacion:DataTypes.STRING,   
        idplato:DataTypes.INTEGER,
        nombreplato:DataTypes.STRING,
        urlimagen:DataTypes.STRING,
        createdAt:DataTypes.DATE,
        updatedAt:DataTypes.DATE,
        estadodetplacat:DataTypes.STRING,
        prioridad:DataTypes.INTEGER

    });
    return ofertapedidos;
}



