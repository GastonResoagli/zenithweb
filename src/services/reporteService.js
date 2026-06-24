// Service de reportes: consulta de movimientos y generación del PDF de ventas con pdfkit.
const PDFDocument = require('pdfkit');
const ventaService = require('../services/ventaService');
const reporteRepository = require('../repositories/reporteRepository');

// Movimientos filtrados (lo consume la tabla del frontend)
exports.obtenerMovimientos = (filtros) => reporteRepository.obtenerMovimientos(filtros);

// --- Constantes de maquetación del PDF ---
// Definición de las columnas de la tabla: etiqueta, posición X y ancho de cada una
const COLS = [
    { label: 'Fecha',    x: 50,  width: 120 },
    { label: 'Comprobante', x: 170, width: 100 },
    { label: 'Cliente',  x: 270, width: 140  },
    { label: 'Ítems',    x: 410, width: 50  },
    { label: 'Total Venta', x: 460, width: 85  },
];
const ROW_H    = 22;   // alto de cada fila
const MARGIN_L = 50;   // margen izquierdo
const TABLE_W  = 495;  // ancho total de la tabla
const PAGE_H   = 841;  // alto de la página A4 (en puntos)
const MARGIN_B = 50;   // margen inferior

// Dibuja una fila de la tabla: pinta el fondo (si corresponde) y escribe cada celda recortando el texto
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

// Filtra las ventas por rango de fechas (ambos límites son opcionales e inclusivos)
function filtrarVentasPorFecha(ventas, fechaDesde, fechaHasta) {
    const desde = fechaDesde ? new Date(`${fechaDesde}T00:00:00`) : null;
    const hasta = fechaHasta ? new Date(`${fechaHasta}T23:59:59`) : null;
    return ventas.filter(v => {
        const fecha = new Date(v.fecha);
        if (desde && fecha < desde) return false;
        if (hasta && fecha > hasta) return false;
        return true;
    });
}

// Genera el PDF del reporte de ventas en memoria y lo devuelve como Buffer (no se guarda en disco)
exports.generarPDF = async (filtros) => {
    // Trae las ventas y aplica los filtros recibidos (período y, opcionalmente, cliente)
    const todas = await ventaService.consultarVentas();
    let datos = filtrarVentasPorFecha(todas, filtros.fechaDesde, filtros.fechaHasta);
    if (filtros.id_cliente) {
        datos = datos.filter(v => String(v.id_cliente) === String(filtros.id_cliente));
    }

    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: MARGIN_L, size: 'A4', bufferPages: true });
        const chunks = [];

        // pdfkit emite el PDF en trozos (streaming); los juntamos y al terminar resolvemos el Buffer
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Título del reporte
        doc.fontSize(16).font('Helvetica-Bold').fillColor('#1e3a5f')
            .text('Reporte de Ventas', MARGIN_L, 50, { width: TABLE_W, align: 'center' });

        // Si se filtró por período, lo indicamos en el encabezado del reporte
        const rango = (filtros.fechaDesde || filtros.fechaHasta)
            ? `   ·   Período: ${filtros.fechaDesde || 'inicio'} a ${filtros.fechaHasta || 'hoy'}`
            : '';
        doc.fontSize(9).font('Helvetica').fillColor('#666666')
            .text(`Generado: ${new Date().toLocaleString('es-AR')}${rango}`, MARGIN_L, 75, { width: TABLE_W, align: 'right', lineBreak: false });

        // currentY es el "cursor" vertical: lo vamos bajando a medida que dibujamos
        let currentY = 100;
        doc.moveTo(MARGIN_L, currentY).lineTo(MARGIN_L + TABLE_W, currentY)
            .strokeColor('#cccccc').lineWidth(1).stroke();
        currentY += 12;

        // Encabezado de la tabla (fondo azul, texto blanco)
        doc.fillColor('#1e3a5f').rect(MARGIN_L, currentY, TABLE_W, ROW_H).fill();
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#ffffff');
        COLS.forEach(col => {
            doc.text(col.label, col.x + 4, currentY + 6, { width: col.width - 8, lineBreak: false });
        });
        currentY += ROW_H;

        doc.fontSize(8).font('Helvetica');

        if (datos.length === 0) {
            // Caso sin datos: mensaje centrado en lugar de una tabla vacía
            doc.fillColor('#888888').fontSize(10)
                .text('Sin ventas registradas.', MARGIN_L, currentY + 20, { width: TABLE_W, align: 'center', lineBreak: false });
        } else {
            datos.forEach((row, idx) => {
                // Si no entra otra fila en la página, agregamos página nueva y repetimos el encabezado
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

                // Filas alternadas (cebra) y formateo de fecha, comprobante y total
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
