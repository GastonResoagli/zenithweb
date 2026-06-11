// Controller de reportes. Actúa como «Client» del patrón Observador:
// arma el ReporteSubject, le suscribe los observadores y dispara la generación.
const reporteService = require('../services/reporteService');
const ReporteSubject = require('../patterns/observer/ReporteSubject');
const NotificacionObserver = require('../patterns/observer/NotificacionObserver');
const LoggerObserver = require('../patterns/observer/LoggerObserver');

// GET /api/reportes -> movimientos filtrados (los filtros llegan por query string)
exports.getMovimientos = async (req, res) => {
    try {
        const { fechaDesde, fechaHasta, tipo, id_producto } = req.query;
        const data = await reporteService.getMovimientos({ fechaDesde, fechaHasta, tipo, id_producto });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /api/reportes -> genera el PDF del reporte y lo devuelve como archivo descargable
exports.generarReportes = async (req, res) => {
    try {
        const { fechaDesde, fechaHasta, tipo, id_producto } = req.body;

        // Patrón Observador: el Subject genera el PDF y notifica a los observadores
        // suscriptos (uno avisa al usuario, otro deja registro en el log).
        const reporteSubject = new ReporteSubject();
        reporteSubject.agregarObservador(new NotificacionObserver());
        reporteSubject.agregarObservador(new LoggerObserver());

        const pdfBuffer = await reporteSubject.generarPDF({ fechaDesde, fechaHasta, tipo, id_producto }); //

        // Enviamos el PDF directamente como archivo descargable sin guardar en disco
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="reporte_${Date.now()}.pdf"`,
            'Content-Length': pdfBuffer.length,
        });
        res.end(pdfBuffer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
