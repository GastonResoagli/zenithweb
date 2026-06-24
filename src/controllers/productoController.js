// Controller de productos: traduce peticiones HTTP en llamadas al service y arma las respuestas.
// Sin try/catch: Express 5 reenvía los errores al middleware central (errorHandler).
const productoService = require('../services/productoService');
const { validarProducto } = require('../utils/validators');
const { ErrorValidacion, ErrorNoEncontrado } = require('../utils/errors');

// GET /api/productos -> lista de productos
exports.obtenerProductos = async (req, res) => {
    // soloActivos=true lo usan vendedores para ver solo productos disponibles para vender
    const soloActivos = req.query.soloActivos === 'true';
    const data = await productoService.obtenerProductos(soloActivos);
    res.json(data);
};

// GET /api/productos/:id -> un producto puntual (404 si no existe)
exports.obtenerPorId = async (req, res) => {
    const data = await productoService.obtenerPorId(req.params.id);
    if (!data) throw new ErrorNoEncontrado('Producto no encontrado');
    res.json(data);
};

// POST /api/productos -> crea un producto (valida primero los datos del body)
exports.agregarProductos = async (req, res) => {
    validarProducto(req.body);
    const data = await productoService.crearProducto(req.body);
    res.status(201).json(data); // 201 = creado
};

// PUT /api/productos/:id -> actualiza un producto existente
exports.actualizar = async (req, res) => {
    const data = await productoService.actualizar(req.params.id, req.body);
    if (!data) throw new ErrorNoEncontrado('Producto no encontrado');
    res.json(data);
};

// PATCH /api/productos/:id/estado -> alta/baja del producto (activar/desactivar)
exports.cambiarEstado = async (req, res) => {
    const { estado } = req.body;
    // Validamos explícitamente el tipo boolean para evitar conversiones implícitas de strings
    if (typeof estado !== 'boolean') {
        throw new ErrorValidacion('El campo estado debe ser true o false');
    }
    const data = await productoService.cambiarEstado(req.params.id, estado);
    res.json(data);
};
