// Controller de clientes.
// Sin try/catch: Express 5 reenvía los errores al middleware central (errorHandler).
const clienteService = require('../services/clienteService');

// GET /api/clientes -> lista de clientes (para autocompletar en ventas y filtrar reportes)
exports.obtenerClientes = async (req, res) => {
    const data = await clienteService.obtenerClientes();
    res.json(data);
};
