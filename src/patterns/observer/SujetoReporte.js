/*
 SujetoReporte  («SujetoConcreto» del patrón Observador)

Sujeto concreto que orquesta la generación del PDF de reportes. Hereda de
 Sujeto la mecánica de suscripción/notificación y, cada vez que cambia su
 estado, avisa a todos los observadores (ObservadorNotificacion, ObservadorLogger).

 La construcción real del PDF se delega en reporteService.generarPDF, para no
 duplicar la lógica de maquetación con pdfkit que ya existe.
*/

const Sujeto = require('./Sujeto');
const reporteService = require('../../services/reporteService');

// Estados posibles del reporte (-estado : EstadoReporte)
const EstadoReporte = Object.freeze({
    PENDIENTE: 'PENDIENTE',
    GENERANDO: 'GENERANDO',
    COMPLETADO: 'COMPLETADO',
    ERROR: 'ERROR',
});

class SujetoReporte extends Sujeto {
    constructor() {
        super();
        // -estado : EstadoReporte
        this.estado = EstadoReporte.PENDIENTE;
    }

    // +getEstado() : EstadoReporte
    getEstado() {
        return this.estado;
    }

    // +setEstado(evento)  -> cambia el estado y notifica a los observadores
    setEstado(evento) {
        this.estado = evento.estado;
        this.notificar(evento);
    }

    // +generarPDF(filtros)  -> genera el PDF y va emitiendo eventos según avanza
    async generarPDF(filtros) {
        // Inicio de la generación
        this.setEstado({ estado: EstadoReporte.GENERANDO, filtros, mensaje: 'Iniciando generación del reporte' });

        try {
            const pdfBuffer = await reporteService.generarPDF(filtros);

            // Reporte listo: avisa a los observadores (ObservadorNotificacion, ObservadorLogger)
            this.setEstado({
                estado: EstadoReporte.COMPLETADO,
                filtros,
                tamanoBytes: pdfBuffer.length,
                mensaje: 'El PDF del reporte está listo',
            });

            return pdfBuffer;
        } catch (error) {
            // Falla: también es un evento que los observadores deben conocer
            this.setEstado({ estado: EstadoReporte.ERROR, filtros, error: error.message });
            throw error;
        }
    }
}

module.exports = SujetoReporte;
module.exports.EstadoReporte = EstadoReporte;
