/*
ObservadorNotificacion  («ObservadorConcreto» del patrón Observador)

 Observador concreto cuya responsabilidad es avisar al usuario que el PDF del
 reporte está listo. Aquí se resuelve con un mensaje por consola; en un
 entorno real podría enviar un email, un websocket o una notificación push.
*/

const Observador = require('./Observador');
const { EstadoReporte } = require('./SujetoReporte');

class ObservadorNotificacion extends Observador {
    // +actualizar(evento)  -> reacciona solo cuando el reporte queda COMPLETADO
    actualizar(evento) {
        if (evento.estado === EstadoReporte.COMPLETADO) {
            console.log(`[Notificación] ✅ Tu reporte está listo (${evento.tamanoBytes} bytes). Ya podés descargarlo.`);
        }
    }
}

module.exports = ObservadorNotificacion;
