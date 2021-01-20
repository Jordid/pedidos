/**
 * Return la fecha actual del sisitema en el formato: 2020-07-15 00:00.00.
 */
function getCurrentDateAnioMesDiaHoraMinSeconds() {
    let date = new Date();
    let fechaActual = date.toISOString();
    fechaActual = fechaActual.replace(/T/, ' ');     // replace T with a space
    fechaActual = fechaActual.replace(/\..+/, '');    // delete the dot and everything after
    return fechaActual;
}

/**
 * Return la fecha actual del sisitema en el formato: '2020-07-15 00:00.00'. concatenada con comillasimple al inicio y fin.
 */
function getStrCurrentDateAnioMesDiaHoraMinSeconds() {
    return "'"+getCurrentDateAnioMesDiaHoraMinSeconds()+"'";

}

module.exports={
    getCurrentDateAnioMesDiaHoraMinSeconds,
    getStrCurrentDateAnioMesDiaHoraMinSeconds
}