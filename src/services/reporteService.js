const PDFDocument = require('pdfkit');
const reporteRepository = require('../repositories/reporteRepository');

const COLS = [
    { label: 'Fecha',    x: 50,  width: 100 },
    { label: 'Producto', x: 150, width: 145 },
    { label: 'Tipo',     x: 295, width: 55  },
    { label: 'Cant.',    x: 350, width: 45  },
    { label: 'Total',    x: 395, width: 65  },
    { label: 'Cliente/Usuario', x: 460, width: 85  },
];
const ROW_H    = 22;
const MARGIN_L = 50;
const TABLE_W  = 495;
const PAGE_H   = 841;
const MARGIN_B = 50;

function drawRow(doc, values, y, bgColor) {
    if (bgColor) {
        doc.fillColor(bgColor).rect(MARGIN_L, y, TABLE_W, ROW_H).fill();
    }
    doc.fillColor('#000000');
    values.forEach((val, i) => {
        const col = COLS[i];
        doc.text(String(val ?? ''), col.x + 4, y + 6, {
            width: col.width - 8,
            lineBreak: false,
            ellipsis: true,
        });
    });
}

exports.generarPDF = async (filtros) => {
    const datos = await reporteRepository.getMovimientos(filtros);

    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: MARGIN_L, size: 'A4', bufferPages: true });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // ── Encabezado ──────────────────────────────────────────────
        doc.fontSize(16).font('Helvetica-Bold').fillColor('#1e3a5f')
            .text('Reporte de Movimientos de Inventario', MARGIN_L, 50, { width: TABLE_W, align: 'center' });

        doc.fontSize(9).font('Helvetica').fillColor('#666666')
            .text(`Generado: ${new Date().toLocaleString('es-AR')}`, MARGIN_L, 75, { width: TABLE_W, align: 'right', lineBreak: false });

        // ── Filtros ──────────────────────────────────────────────────
        const filtrosTexto = [];
        if (filtros.fechaDesde) filtrosTexto.push(`Desde: ${filtros.fechaDesde}`);
        if (filtros.fechaHasta) filtrosTexto.push(`Hasta: ${filtros.fechaHasta}`);
        if (filtros.tipo)       filtrosTexto.push(`Tipo: ${filtros.tipo}`);

        let headerBottom = 90;
        if (filtrosTexto.length > 0) {
            doc.fontSize(9).font('Helvetica').fillColor('#444444')
                .text(`Filtros aplicados: ${filtrosTexto.join('   |   ')}`, MARGIN_L, 90, { width: TABLE_W, lineBreak: false });
            headerBottom = 105;
        }

        // ── Línea separadora ─────────────────────────────────────────
        doc.moveTo(MARGIN_L, headerBottom + 5).lineTo(MARGIN_L + TABLE_W, headerBottom + 5)
            .strokeColor('#cccccc').lineWidth(1).stroke();

        // ── Cabecera de tabla ─────────────────────────────────────────
        let currentY = headerBottom + 12;

        doc.fillColor('#1e3a5f').rect(MARGIN_L, currentY, TABLE_W, ROW_H).fill();
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#ffffff');
        COLS.forEach(col => {
            doc.text(col.label, col.x + 4, currentY + 6, { width: col.width - 8, lineBreak: false });
        });
        currentY += ROW_H;

        // ── Filas ────────────────────────────────────────────────────
        doc.fontSize(8).font('Helvetica');

        if (datos.length === 0) {
            doc.fillColor('#888888').fontSize(10)
                .text('Sin movimientos para los filtros seleccionados.', MARGIN_L, currentY + 20, { width: TABLE_W, align: 'center', lineBreak: false });
        } else {
            datos.forEach((row, idx) => {
                // Salto de página si no entra la siguiente fila
                if (currentY + ROW_H > PAGE_H - MARGIN_B) {
                    doc.addPage();
                    currentY = 50;

                    // Repetir cabecera en nueva página
                    doc.fillColor('#1e3a5f').rect(MARGIN_L, currentY, TABLE_W, ROW_H).fill();
                    doc.fontSize(9).font('Helvetica-Bold').fillColor('#ffffff');
                    COLS.forEach(col => {
                        doc.text(col.label, col.x + 4, currentY + 6, { width: col.width - 8, lineBreak: false });
                    });
                    currentY += ROW_H;
                    doc.fontSize(8).font('Helvetica');
                }

                const bg = idx % 2 === 0 ? '#ffffff' : '#f3f6f9';
                const fecha = new Date(row.fecha).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                const tipo = row.tipo.charAt(0).toUpperCase() + row.tipo.slice(1);
                const total = row.total != null ? `$${parseFloat(row.total).toFixed(2)}` : '-';

                drawRow(doc, [fecha, row.nombre_producto, tipo, row.cantidad, total, row.nombre_actor], currentY, bg);

                // Borde inferior de fila
                doc.moveTo(MARGIN_L, currentY + ROW_H)
                    .lineTo(MARGIN_L + TABLE_W, currentY + ROW_H)
                    .strokeColor('#e2e8f0').lineWidth(0.5).stroke();

                currentY += ROW_H;
            });

            // ── Totales ───────────────────────────────────────────────
            const totalEntradas     = datos.filter(r => r.tipo === 'entrada').reduce((s, r) => s + Number(r.cantidad), 0);
            const totalSalidas      = datos.filter(r => r.tipo === 'salida').reduce((s, r) => s + Number(r.cantidad), 0);
            const montoEntradas     = datos.filter(r => r.tipo === 'entrada' && r.total).reduce((s, r) => s + Number(r.total), 0);
            const montoSalidas      = datos.filter(r => r.tipo === 'salida'  && r.total).reduce((s, r) => s + Number(r.total), 0);

            currentY += 12;
            doc.moveTo(MARGIN_L, currentY).lineTo(MARGIN_L + TABLE_W, currentY)
                .strokeColor('#1e3a5f').lineWidth(1).stroke();
            currentY += 8;

            doc.fontSize(9).font('Helvetica-Bold').fillColor('#1e3a5f')
                .text(`Total registros: ${datos.length}`, MARGIN_L, currentY, { lineBreak: false });
            currentY += 14;
            doc.fontSize(8).font('Helvetica').fillColor('#333333')
                .text(`Entradas: ${totalEntradas} unid.   $${montoEntradas.toFixed(2)}`, MARGIN_L, currentY, { lineBreak: false });
            doc.text(`Salidas: ${totalSalidas} unid.   $${montoSalidas.toFixed(2)}`, MARGIN_L, currentY, { width: TABLE_W, align: 'right', lineBreak: false });
        }

        doc.end();
    });
};
