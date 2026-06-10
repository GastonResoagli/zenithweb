// Controller de productos: traduce peticiones HTTP en llamadas al service y arma las respuestas.
const productoService = require('../services/productoService');
const { validarProducto } = require('../utils/validators');

// GET /api/productos -> lista de productos
exports.obtenerProductos = async (req, res) => {
    try {
        // soloActivos=true lo usan vendedores para ver solo productos disponibles para vender
        const soloActivos = req.query.soloActivos === 'true';
        const data = await productoService.obtenerProductos(soloActivos);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/productos/:id -> un producto puntual (404 si no existe)
exports.getById = async (req, res) => {
    try {
        const data = await productoService.getById(req.params.id);
        if (!data) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /api/productos -> crea un producto (valida primero los datos del body)
exports.agregarProductos = async (req, res) => {
    try {
        validarProducto(req.body);
        const data = await productoService.crearProducto(req.body);
        res.status(201).json(data); // 201 = creado
    } catch (error) {
        // Errores de validación -> 400 (petición incorrecta del cliente)
        if (error.message.includes('requerido') || error.message.includes('válido')) {
            return res.status(400).json({ error: error.message });
        }
        // Nombre duplicado -> 409 (conflicto)
        if (error.message.includes('Ya existe')) {
            return res.status(409).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
};

// PUT /api/productos/:id -> actualiza un producto existente
exports.update = async (req, res) => {
    try {
        const data = await productoService.update(req.params.id, req.body);
        if (!data) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json(data);
    } catch (error) {
        // Nombre duplicado -> 409 (conflicto)
        if (error.message.includes('Ya existe')) {
            return res.status(409).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
};

// DELETE /api/productos/:id -> baja lógica (no borra el registro, lo marca inactivo)
exports.remove = async (req, res) => {
    try {
        const data = await productoService.remove(req.params.id);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PATCH /api/productos/:id/estado -> alta/baja del producto (activar/desactivar)
exports.setEstado = async (req, res) => {
    try {
        const { estado } = req.body;
        // Validamos explícitamente el tipo boolean para evitar conversiones implícitas de strings
        if (typeof estado !== 'boolean') {
            return res.status(400).json({ error: 'El campo estado debe ser true o false' });
        }
        const data = await productoService.setEstado(req.params.id, estado);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
