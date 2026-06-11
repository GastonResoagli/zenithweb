/*
 Observador  (interfaz «Observador» del patrón Observador)

 Define el contrato que deben cumplir todos los observadores concretos.
 En JavaScript no existen interfaces reales, así que se modela como una clase
 base cuyo método actualizar() lanza error si una subclase no lo implementa.
*/

 class Observador {
    // Se invoca cuando el Sujeto notifica un evento.

    actualizar(evento) {
        throw new Error('Observador.actualizar(evento) debe ser implementado por la subclase');
    }
}

module.exports = Observador;
