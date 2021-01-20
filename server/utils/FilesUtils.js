const fs = require('fs');
const validacionesGenerales = require('../utils/ValidacionesGeneralesUtils');

function saveFileInServerPath(file, filePath) {
    try {
        if (validacionesGenerales.isNullOrUndefined(file)) {
            console.log("El archivo es null o undefined.");
            return;
        }    
        if (validacionesGenerales.isNullOrUndefined(filePath)) {
            console.log("El filePath es null o undefined.");
            return;
        }
        file.mv(filePath);
    } catch (error) {
        console.log("Error al guardar el archivo el en el server: ", error);        
    }    
}

function deleteFileIfExists(filePath) {
    try {
        if (validacionesGenerales.isNullOrUndefined(filePath)) {
            return;
        }
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error("Error al eliminar el archivo: "+filePath, err);
                    return
                } else {
                    console.log(`El archivo: ${filePath} fue eliminado.`);                
                }     
            });
        } else {
            console.log(`No se puede eliminar El archivo: ${filePath} porque no existe.`);                
        } 
    } catch (error) {
        console.log("Error al eliminar el archivo: "+filePath, error);        
    }    
}

module.exports = {
    saveFileInServerPath,
    deleteFileIfExists
}