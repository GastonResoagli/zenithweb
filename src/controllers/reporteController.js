const reporteService = require('../services/reporteService');

exports.generar = async (req, res) => {
    try {
        const { fechaDesde, fechaHasta, tipo, id_producto } = req.body;
        const pdfBuffer = await reporteService.generarPDF({ fechaDesde, fechaHasta, tipo, id_producto });

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
