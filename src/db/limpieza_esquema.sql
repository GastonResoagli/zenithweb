-- ============================================================================
-- MIGRACIÓN — Limpieza de esquema vestigial — ZenithWeb
-- ----------------------------------------------------------------------------
-- Quita objetos que la aplicación NO usa (ver revisión de código L1 / M4):
--   - trigger/función copiar_descripcion_rol (del dump viejo, rompía updates de usuario)
--   - tablas rol y permiso + columna usuario.id_rol (el RBAC usa solo usuario.rol)
--   - columna producto.codigo (sin uso)
--   - función dar_baja_producto (la baja lógica la hace UPDATE producto SET estado=false)
-- Es idempotente (IF EXISTS). Aplicar sobre una base YA EXISTENTE.
--
-- Ejecutar:  psql "<DATABASE_URL>" -f src/db/limpieza_esquema.sql
-- ============================================================================
SET client_encoding TO 'UTF8';

-- Trigger huérfano del dump viejo que ponía usuario.rol = NULL en cada UPDATE
DROP TRIGGER IF EXISTS trg_copiar_descripcion_rol ON usuario;
DROP FUNCTION IF EXISTS copiar_descripcion_rol();

-- Modelo de roles vestigial (la app usa solo usuario.rol)
DROP TABLE IF EXISTS permiso;
ALTER TABLE usuario DROP COLUMN IF EXISTS id_rol;
DROP TABLE IF EXISTS rol;

-- Columna sin uso en producto
ALTER TABLE producto DROP COLUMN IF EXISTS codigo;

-- Función sin uso (reemplazada por productoRepository.cambiarEstado)
DROP FUNCTION IF EXISTS dar_baja_producto(INT);
