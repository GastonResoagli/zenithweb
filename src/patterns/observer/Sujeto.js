/*
 Sujeto  (clase abstracta «Sujeto» del patrón Observador)

 Mantiene la lista de observadores y les avisa cuando ocurre un evento.
 Las subclases concretas (p. ej. SujetoReporte) heredan esta mecánica de
 suscripción/notificación y agregan su propia lógica de negocio.
*/
class Sujeto {
    constructor() {
        // -observadores : Observador[*]  -> lista de suscriptores
        this.observadores = [];
    }

    // +agregarObservador(o : Observador)  -> suscribe un observador (evita duplicados)
    agregarObservador(observador) {
        if (!this.observadores.includes(observador)) {
            this.observadores.push(observador);
        }
    }

    // +eliminarObservador(o : Observador)  -> da de baja un observador
    eliminarObservador(observador) {
        this.observadores = this.observadores.filter(o => o !== observador);
    }

    // +notificar(evento)  -> recorre la lista y llama actualizar() en cada observador
    notificar(evento) {
        this.observadores.forEach(o => o.actualizar(evento));
    }
}

module.exports = Sujeto;
