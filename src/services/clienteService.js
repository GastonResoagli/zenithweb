// Service de clientes.
const clienteRepository = require('../repositories/clienteRepository');

exports.obtenerClientes = () => clienteRepository.obtenerClientes();
