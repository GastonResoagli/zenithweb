// ============================================================================
// LoggerObserver  («ConcreteObserver» del patrón Observador)
// ----------------------------------------------------------------------------
// Observador concreto que registra en el log cada cambio de estado de la
// generación del reporte (trazabilidad / auditoría). Reacciona a todos los
// eventos, no solo al de "completado".
// ============================================================================
const Observer = require('./Observer');

class LoggerObserver extends Observer {
    // +actualizar(evento)  -> deja constancia del evento en el log
    actualizar(evento) {
        const fecha = new Date().toISOString();
        const filtros = JSON.stringify(evento.filtros ?? {});

        if (evento.estado === 'ERROR') {
            console.error(`[Reporte][${fecha}] estado=${evento.estado} filtros=${filtros} error=${evento.error}`);
        } else {
            console.log(`[Reporte][${fecha}] estado=${evento.estado} filtros=${filtros} ${evento.mensaje ?? ''}`);
        }
    }
}

module.exports = LoggerObserver;
