// Controller de reportes. Actúa como «Cliente» del patrón Observador:
// arma el SujetoReporte, le suscribe los observadores y dispara la generación.
// Sin try/catch: Express 5 reenvía los errores al middleware central (errorHandler).
const reporteService = require('../services/reporteService');
const SujetoReporte = require('../patterns/observer/SujetoReporte');
const ObservadorNotificacion = require('../patterns/observer/ObservadorNotificacion');
const ObservadorLogger = require('../patterns/observer/ObservadorLogger');

// GET /api/reportes -> movimientos filtrados (los filtros llegan por query string)
exports.obtenerMovimientos = async (req, res) => {
    const { fechaDesde, fechaHasta, tipo, id_producto, id_cliente } = req.query;
    const data = await reporteService.obtenerMovimientos({ fechaDesde, fechaHasta, tipo, id_producto, id_cliente });
    res.json(data);
};

// POST /api/reportes -> genera el PDF del reporte y lo devuelve como archivo descargable
exports.generarReporte = async (req, res) => {
    const { fechaDesde, fechaHasta, tipo, id_producto, id_cliente } = req.body;

    // Patrón Observador: el Sujeto genera el PDF y notifica a los observadores
    // suscriptos (uno avisa al usuario, otro deja registro en el log).
    const sujetoReporte = new SujetoReporte();
    sujetoReporte.agregarObservador(new ObservadorNotificacion());
    sujetoReporte.agregarObservador(new ObservadorLogger());

    const pdfBuffer = await sujetoReporte.generarPDF({ fechaDesde, fechaHasta, tipo, id_producto, id_cliente });

    // Enviamos el PDF directamente como archivo descargable sin guardar en disco
    res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="reporte_${Date.now()}.pdf"`,
        'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
};
