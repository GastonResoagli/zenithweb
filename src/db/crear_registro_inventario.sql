CREATE TABLE IF NOT EXISTS registro_inventario (
    id_registro   SERIAL PRIMARY KEY,
    id_producto   INTEGER NOT NULL REFERENCES producto(id_producto),
    tipo          VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada', 'salida')),
    cantidad      INTEGER NOT NULL CHECK (cantidad > 0),
    precio_compra NUMERIC(10,2),
    total         NUMERIC(10,2),
    id_venta      INTEGER REFERENCES venta(id_venta),
    id_usuario    INTEGER NOT NULL REFERENCES usuario(id_usuario),
    fecha         TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Si la tabla ya existe, agregar columnas faltantes:
-- ALTER TABLE registro_inventario ADD COLUMN IF NOT EXISTS precio_compra NUMERIC(10,2);
-- ALTER TABLE registro_inventario ADD COLUMN IF NOT EXISTS total NUMERIC(10,2);
-- ALTER TABLE registro_inventario ADD COLUMN IF NOT EXISTS id_venta INTEGER REFERENCES venta(id_venta);
