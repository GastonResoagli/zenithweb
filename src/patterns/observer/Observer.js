/*
 Observer  (interfaz «Observer» del patrón Observador)

 Define el contrato que deben cumplir todos los observadores concretos.
 En JavaScript no existen interfaces reales, así que se modela como una clase
 base cuyo método actualizar() lanza error si una subclase no lo implementa.
*/

 class Observer {
    // Se invoca cuando el Subject notifica un evento.
    // eslint-disable-next-line no-unused-vars
    actualizar(evento) {
        throw new Error('Observer.actualizar(evento) debe ser implementado por la subclase');
    }
}

module.exports = Observer;
