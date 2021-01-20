function isEmpty(array) {
    return array == null || array === undefined || array.length < 1 || array === '[]' || array === 'null';
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

module.exports={
    isEmpty,
    obtenerListaValoresByKey
}