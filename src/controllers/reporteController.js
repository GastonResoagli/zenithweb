const reporteService = require('../services/reporteService');

exports.getMovimientos = async (req, res) => {
    try {
        const { fechaDesde, fechaHasta, tipo, id_producto } = req.query;
        const data = await reporteService.getMovimientos({ fechaDesde, fechaHasta, tipo, id_producto });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.generarReportes = async (req, res) => {
    try {
        const { fechaDesde, fechaHasta, tipo, id_producto } = req.body;
        const pdfBuffer = await reporteService.generarPDF({ fechaDesde, fechaHasta, tipo, id_producto });

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
