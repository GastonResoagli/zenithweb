const Subject = require('../patterns/observer/Subject');
const Observer = require('../patterns/observer/Observer');
const LoggerObserver = require('../patterns/observer/LoggerObserver');
const NotificacionObserver = require('../patterns/observer/NotificacionObserver');
const ReporteSubject = require('../patterns/observer/ReporteSubject');
const { EstadoReporte } = require('../patterns/observer/ReporteSubject');
const reporteService = require('../services/reporteService');

jest.mock('../services/reporteService');

describe('Patrón Observer', () => {

    test('Debe notificar a todos los observadores registrados', () => {

        const subject = new Subject();

        const observador1 = {
            actualizar: jest.fn()
        };

        const observador2 = {
            actualizar: jest.fn()
        };

        const evento = {
            tipo: 'VENTA_REALIZADA',
            mensaje: 'Venta registrada correctamente'
        };

        subject.agregarObservador(observador1);
        subject.agregarObservador(observador2);

        subject.notificar(evento);

        expect(observador1.actualizar).toHaveBeenCalledWith(evento);
        expect(observador2.actualizar).toHaveBeenCalledWith(evento);

    });

    test('No debe agregar observadores duplicados', () => {

        const subject = new Subject();

        const observador = {
            actualizar: jest.fn()
        };

        subject.agregarObservador(observador);
        subject.agregarObservador(observador);

        subject.notificar('evento');

        expect(observador.actualizar).toHaveBeenCalledTimes(1);

    });

    test('No debe notificar observadores eliminados', () => {

        const subject = new Subject();

        const observador = {
            actualizar: jest.fn()
        };

        subject.agregarObservador(observador);
        subject.eliminarObservador(observador);

        subject.notificar('evento');

        expect(observador.actualizar).not.toHaveBeenCalled();

    });

    test('Observer debe obligar a implementar actualizar()', () => {

        const observer = new Observer();

        expect(() => {
            observer.actualizar({});
        }).toThrow(
            'Observer.actualizar(evento) debe ser implementado por la subclase'
        );

    });

});

describe('LoggerObserver (ConcreteObserver)', () => {

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('Debe registrar en console.log los eventos normales', () => {
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        const logger = new LoggerObserver();

        logger.actualizar({
            estado: EstadoReporte.GENERANDO,
            filtros: { tipo: 'entrada' },
            mensaje: 'Iniciando',
        });

        expect(logSpy).toHaveBeenCalledTimes(1);
        const salida = logSpy.mock.calls[0][0];
        expect(salida).toContain('estado=GENERANDO');
        expect(salida).toContain('"tipo":"entrada"');
    });

    test('Debe usar console.error cuando el estado es ERROR', () => {
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        const logger = new LoggerObserver();

        logger.actualizar({ estado: 'ERROR', error: 'Falló la conexión' });

        expect(errorSpy).toHaveBeenCalledTimes(1);
        expect(logSpy).not.toHaveBeenCalled();
        expect(errorSpy.mock.calls[0][0]).toContain('error=Falló la conexión');
    });

});

describe('NotificacionObserver (ConcreteObserver)', () => {

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('Debe notificar solo cuando el reporte está COMPLETADO', () => {
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        const notificador = new NotificacionObserver();

        notificador.actualizar({ estado: EstadoReporte.COMPLETADO, tamanoBytes: 2048 });

        expect(logSpy).toHaveBeenCalledTimes(1);
        expect(logSpy.mock.calls[0][0]).toContain('2048 bytes');
    });

    test('No debe notificar en estados distintos de COMPLETADO', () => {
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        const notificador = new NotificacionObserver();

        notificador.actualizar({ estado: EstadoReporte.GENERANDO });

        expect(logSpy).not.toHaveBeenCalled();
    });

});

describe('ReporteSubject (ConcreteSubject)', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('Debe iniciar en estado PENDIENTE', () => {
        const subject = new ReporteSubject();
        expect(subject.getEstado()).toBe(EstadoReporte.PENDIENTE);
    });

    test('generarPDF debe emitir GENERANDO y COMPLETADO, y devolver el buffer', async () => {
        const pdfMock = Buffer.from('PDF-de-prueba');
        reporteService.generarPDF.mockResolvedValue(pdfMock);

        const subject = new ReporteSubject();
        const observador = { actualizar: jest.fn() };
        subject.agregarObservador(observador);

        const resultado = await subject.generarPDF({ tipo: 'venta' });

        // Notificó el inicio y el fin
        expect(observador.actualizar).toHaveBeenCalledWith(
            expect.objectContaining({ estado: EstadoReporte.GENERANDO })
        );
        expect(observador.actualizar).toHaveBeenCalledWith(
            expect.objectContaining({
                estado: EstadoReporte.COMPLETADO,
                tamanoBytes: pdfMock.length,
            })
        );

        expect(subject.getEstado()).toBe(EstadoReporte.COMPLETADO);
        expect(resultado).toBe(pdfMock);
    });

    test('generarPDF debe emitir ERROR y propagar la excepción si falla', async () => {
        reporteService.generarPDF.mockRejectedValue(new Error('boom'));

        const subject = new ReporteSubject();
        const observador = { actualizar: jest.fn() };
        subject.agregarObservador(observador);

        await expect(subject.generarPDF({})).rejects.toThrow('boom');

        expect(observador.actualizar).toHaveBeenCalledWith(
            expect.objectContaining({ estado: EstadoReporte.ERROR, error: 'boom' })
        );
        expect(subject.getEstado()).toBe(EstadoReporte.ERROR);
    });

});