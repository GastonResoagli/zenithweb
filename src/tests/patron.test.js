const Sujeto = require('../patterns/observer/Sujeto');
const Observador = require('../patterns/observer/Observador');
const ObservadorLogger = require('../patterns/observer/ObservadorLogger');
const ObservadorNotificacion = require('../patterns/observer/ObservadorNotificacion');
const SujetoReporte = require('../patterns/observer/SujetoReporte');
const { EstadoReporte } = require('../patterns/observer/SujetoReporte');
const reporteService = require('../services/reporteService');

jest.mock('../services/reporteService');

describe('Patrón Observador', () => {

    test('Debe notificar a todos los observadores registrados', () => {

        const sujeto = new Sujeto();

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

        sujeto.agregarObservador(observador1);
        sujeto.agregarObservador(observador2);

        sujeto.notificar(evento);

        expect(observador1.actualizar).toHaveBeenCalledWith(evento);
        expect(observador2.actualizar).toHaveBeenCalledWith(evento);

    });

    test('No debe agregar observadores duplicados', () => {

        const sujeto = new Sujeto();

        const observador = {
            actualizar: jest.fn()
        };

        sujeto.agregarObservador(observador);
        sujeto.agregarObservador(observador);

        sujeto.notificar('evento');

        expect(observador.actualizar).toHaveBeenCalledTimes(1);

    });

    test('No debe notificar observadores eliminados', () => {

        const sujeto = new Sujeto();

        const observador = {
            actualizar: jest.fn()
        };

        sujeto.agregarObservador(observador);
        sujeto.eliminarObservador(observador);

        sujeto.notificar('evento');

        expect(observador.actualizar).not.toHaveBeenCalled();

    });

    test('Observador debe obligar a implementar actualizar()', () => {

        const observador = new Observador();

        expect(() => {
            observador.actualizar({});
        }).toThrow(
            'Observador.actualizar(evento) debe ser implementado por la subclase'
        );

    });

});

describe('ObservadorLogger (ObservadorConcreto)', () => {

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('Debe registrar en console.log los eventos normales', () => {
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        const logger = new ObservadorLogger();

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
        const logger = new ObservadorLogger();

        logger.actualizar({ estado: 'ERROR', error: 'Falló la conexión' });

        expect(errorSpy).toHaveBeenCalledTimes(1);
        expect(logSpy).not.toHaveBeenCalled();
        expect(errorSpy.mock.calls[0][0]).toContain('error=Falló la conexión');
    });

});

describe('ObservadorNotificacion (ObservadorConcreto)', () => {

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('Debe notificar solo cuando el reporte está COMPLETADO', () => {
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        const notificador = new ObservadorNotificacion();

        notificador.actualizar({ estado: EstadoReporte.COMPLETADO, tamanoBytes: 2048 });

        expect(logSpy).toHaveBeenCalledTimes(1);
        expect(logSpy.mock.calls[0][0]).toContain('2048 bytes');
    });

    test('No debe notificar en estados distintos de COMPLETADO', () => {
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        const notificador = new ObservadorNotificacion();

        notificador.actualizar({ estado: EstadoReporte.GENERANDO });

        expect(logSpy).not.toHaveBeenCalled();
    });

});

describe('SujetoReporte (SujetoConcreto)', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('Debe iniciar en estado PENDIENTE', () => {
        const sujeto = new SujetoReporte();
        expect(sujeto.getEstado()).toBe(EstadoReporte.PENDIENTE);
    });

    test('generarPDF debe emitir GENERANDO y COMPLETADO, y devolver el buffer', async () => {
        const pdfMock = Buffer.from('PDF-de-prueba');
        reporteService.generarPDF.mockResolvedValue(pdfMock);

        const sujeto = new SujetoReporte();
        const observador = { actualizar: jest.fn() };
        sujeto.agregarObservador(observador);

        const resultado = await sujeto.generarPDF({ tipo: 'venta' });

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

        expect(sujeto.getEstado()).toBe(EstadoReporte.COMPLETADO);
        expect(resultado).toBe(pdfMock);
    });

    test('generarPDF debe emitir ERROR y propagar la excepción si falla', async () => {
        reporteService.generarPDF.mockRejectedValue(new Error('boom'));

        const sujeto = new SujetoReporte();
        const observador = { actualizar: jest.fn() };
        sujeto.agregarObservador(observador);

        await expect(sujeto.generarPDF({})).rejects.toThrow('boom');

        expect(observador.actualizar).toHaveBeenCalledWith(
            expect.objectContaining({ estado: EstadoReporte.ERROR, error: 'boom' })
        );
        expect(sujeto.getEstado()).toBe(EstadoReporte.ERROR);
    });

});
