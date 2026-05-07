const PDFDocument = require('pdfkit');
const ventaService = require('../services/ventaService');
const reporteRepository = require('../repositories/reporteRepository');

exports.getMovimientos = (filtros) => reporteRepository.getMovimientos(filtros);

const COLS = [
    { label: 'Fecha',    x: 50,  width: 120 },
    { label: 'Comprobante', x: 170, width: 100 },
    { label: 'Cliente',  x: 270, width: 140  },
    { label: 'Ítems',    x: 410, width: 50  },
    { label: 'Total Venta', x: 460, width: 85  },
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
    const datos = await ventaService.consultarVentas(); // Reemplaza getMovimientos según diagrama

    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: MARGIN_L, size: 'A4', bufferPages: true });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        doc.fontSize(16).font('Helvetica-Bold').fillColor('#1e3a5f')
            .text('Reporte de Ventas', MARGIN_L, 50, { width: TABLE_W, align: 'center' });

        doc.fontSize(9).font('Helvetica').fillColor('#666666')
            .text(`Generado: ${new Date().toLocaleString('es-AR')}`, MARGIN_L, 75, { width: TABLE_W, align: 'right', lineBreak: false });

        let currentY = 100;
        doc.moveTo(MARGIN_L, currentY).lineTo(MARGIN_L + TABLE_W, currentY)
            .strokeColor('#cccccc').lineWidth(1).stroke();
        currentY += 12;

        doc.fillColor('#1e3a5f').rect(MARGIN_L, currentY, TABLE_W, ROW_H).fill();
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#ffffff');
        COLS.forEach(col => {
            doc.text(col.label, col.x + 4, currentY + 6, { width: col.width - 8, lineBreak: false });
        });
        currentY += ROW_H;

        doc.fontSize(8).font('Helvetica');

        if (datos.length === 0) {
            doc.fillColor('#888888').fontSize(10)
                .text('Sin ventas registradas.', MARGIN_L, currentY + 20, { width: TABLE_W, align: 'center', lineBreak: false });
        } else {
            datos.forEach((row, idx) => {
                if (currentY + ROW_H > PAGE_H - MARGIN_B) {
                    doc.addPage();
                    currentY = 50;

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
                const comprobante = row.tipo_documento + ' ' + row.documento_cliente;
                const total = row.monto_total != null ? `$${parseFloat(row.monto_total).toFixed(2)}` : '-';

                drawRow(doc, [fecha, comprobante, row.nombre_cliente, row.cantidad_items, total], currentY, bg);

                doc.moveTo(MARGIN_L, currentY + ROW_H)
                    .lineTo(MARGIN_L + TABLE_W, currentY + ROW_H)
                    .strokeColor('#e2e8f0').lineWidth(0.5).stroke();

                currentY += ROW_H;
            });

            // "procesa y calcula totales" según el diagrama
            const totalVentas = datos.length;
            const montoTotal = datos.reduce((s, r) => s + Number(r.monto_total), 0);

            currentY += 12;
            doc.moveTo(MARGIN_L, currentY).lineTo(MARGIN_L + TABLE_W, currentY)
                .strokeColor('#1e3a5f').lineWidth(1).stroke();
            currentY += 8;

            doc.fontSize(9).font('Helvetica-Bold').fillColor('#1e3a5f')
                .text(`Total registros: ${totalVentas}`, MARGIN_L, currentY, { lineBreak: false });
            currentY += 14;
            doc.fontSize(8).font('Helvetica').fillColor('#333333')
                .text(`Monto Total Recaudado: $${montoTotal.toFixed(2)}`, MARGIN_L, currentY, { lineBreak: false });
        }

        doc.end();
    });
};
