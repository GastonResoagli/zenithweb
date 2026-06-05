# ZenithWeb — Diagrama de Clases UML y Patrones de Diseño

Sistema de Gestión de Stock de Paneles Solares.
Stack: **Node.js/Express** (backend), **React** (frontend), **PostgreSQL** (driver `pg`).

> Nota: el backend está escrito con **módulos de funciones** (no clases JS literales).
> Para el modelado UML cada módulo se representa como una *clase de estereotipo*
> (`<<Controller>>`, `<<Service>>`, `<<Repository>>`, etc.), lo cual es la práctica
> habitual para documentar arquitecturas en capas tipo Node/Express.

---

## 1. Arquitectura en capas (visión general)

```
  Cliente (React)
        │  HTTP / JSON + JWT
        ▼
 ┌─────────────────────────────────────────────┐
 │  Express App (index.js)                       │
 │   ├─ Middleware: authenticateToken            │
 │   └─ Middleware: authorizeRoles(...)          │
 └─────────────────────────────────────────────┘
        │
        ▼
   [ Routes ] ──► [ Controllers ] ──► [ Services ] ──► [ Repositories ] ──► [ DB Pool ] ──► PostgreSQL
                       │
                       └──► [ Validators ] (utils)
```

Cada recurso del dominio (Producto, Venta, Movimiento, Reporte, Categoría, Auth)
repite la misma cadena Route → Controller → Service → Repository.

---

## 2. Diagrama de Clases — Capas de la Aplicación (Mermaid)

```mermaid
classDiagram
    direction LR

    class ExpressApp {
        <<Application>>
        +use(cors)
        +use(json)
        +listen(PORT)
    }

    class AuthMiddleware {
        <<Middleware>>
        +authenticateToken(req, res, next)
    }
    class RoleMiddleware {
        <<Middleware>>
        +authorizeRoles(...roles) function
    }
    class Validators {
        <<Util>>
        +validarDatosLogin(datos)
        +validarProducto(datos)
        +validarVenta(datos)
    }

    %% ---- Capa de Rutas ----
    class ProductoRoutes {
        <<Router>>
    }
    class VentaRoutes {
        <<Router>>
    }
    class AuthRoutes {
        <<Router>>
    }

    %% ---- Capa de Controladores ----
    class ProductoController {
        <<Controller>>
        +obtenerProductos(req, res)
        +getById(req, res)
        +agregarProductos(req, res)
        +update(req, res)
        +remove(req, res)
        +setEstado(req, res)
    }
    class VentaController {
        <<Controller>>
        +consultarVentas(req, res)
        +getById(req, res)
        +agregarVenta(req, res)
    }
    class AuthController {
        <<Controller>>
        +login(req, res)
    }
    class ReporteController {
        <<Controller>>
        +getMovimientos(req, res)
        +generarPDF(req, res)
    }

    %% ---- Capa de Servicios ----
    class ProductoService {
        <<Service>>
        +obtenerProductos(soloActivos)
        +getById(id)
        +crearProducto(producto)
        +update(id, producto)
        +remove(id)
        +setEstado(id, estado)
        +descuentaStock(client, id, cantidad)
    }
    class VentaService {
        <<Service>>
        +consultarVentas()
        +getById(id)
        +creaVenta(venta, detalles)
    }
    class AuthService {
        <<Service>>
        +login(usuario, password)
    }
    class ReporteService {
        <<Service>>
        +getMovimientos(filtros)
        +generarPDF(filtros)
    }

    %% ---- Capa de Repositorios ----
    class ProductoRepository {
        <<Repository>>
        +obtenerProductos(soloActivos)
        +getById(id)
        +crearProducto(producto)
        +update(id, producto)
        +remove(id)
        +setEstado(id, estado)
        +descuentaStock(client, id, cantidad)
    }
    class VentaRepository {
        <<Repository>>
        +consultarVentas()
        +getById(id)
        +crearVenta(client, venta, detalles)
    }
    class AuthRepository {
        <<Repository>>
        +getUsuarioPorCorreo(correo)
    }
    class ReporteRepository {
        <<Repository>>
        +getMovimientos(filtros)
    }

    %% ---- Acceso a datos ----
    class DBConnection {
        <<Singleton>>
        -Pool pool
        +query(sql, params)
        +connect() Client
    }

    %% ---- Relaciones ----
    ExpressApp --> AuthMiddleware : usa
    ExpressApp --> ProductoRoutes
    ExpressApp --> VentaRoutes
    ExpressApp --> AuthRoutes

    ProductoRoutes --> RoleMiddleware : protege
    ProductoRoutes --> ProductoController
    VentaRoutes --> VentaController
    AuthRoutes --> AuthController

    ProductoController --> Validators : valida
    VentaController --> Validators : valida
    AuthController --> Validators : valida

    ProductoController --> ProductoService
    VentaController --> VentaService
    AuthController --> AuthService
    ReporteController --> ReporteService

    ProductoService --> ProductoRepository
    VentaService --> VentaRepository
    VentaService --> ProductoService : valida/descuenta stock
    AuthService --> AuthRepository
    ReporteService --> ReporteRepository
    ReporteService --> VentaService : datos del PDF

    ProductoRepository --> DBConnection
    VentaRepository --> DBConnection
    AuthRepository --> DBConnection
    ReporteRepository --> DBConnection
```

---

## 3. Diagrama de Clases — Modelo de Dominio / Entidades (Mermaid)

Derivado del esquema PostgreSQL (`backup.sql`, `crear_registro_inventario.sql`).

```mermaid
classDiagram
    direction TB

    class Usuario {
        +int id_usuario
        +string documento
        +string nombre_completo
        +string correo
        +string clave
        +int id_rol
        +bool estado
        +string rol  // gerente | operador_stock | vendedor
    }

    class Rol {
        +int id_rol
        +string descripcion
        +datetime fecha_creacion
    }

    class Permiso {
        +int id_permiso
        +int id_rol
        +string nombre_menu
    }

    class Categoria {
        +int id_categoria
        +string descripcion
        +bool estado
    }

    class Producto {
        +int id_producto
        +string codigo
        +string nombre
        +string descripcion
        +int id_categoria
        +int stock
        +decimal precio_compra
        +decimal precio_venta
        +bool estado
    }

    class Venta {
        +int id_venta
        +int id_usuario
        +string tipo_documento
        +string documento_cliente
        +string nombre_cliente
        +decimal monto_pago
        +decimal monto_cambio
        +decimal monto_total
        +datetime fecha
    }

    class DetalleVenta {
        +int id_detalle_venta
        +int id_venta
        +int id_producto
        +decimal precio_venta
        +int cantidad
        +decimal subtotal
        +datetime fecha_registro
    }

    class RegistroInventario {
        +int id_registro
        +int id_producto
        +string tipo  // entrada | salida
        +int cantidad
        +decimal total
        +int id_venta
        +int id_usuario
        +datetime fecha
    }

    class Cliente {
        +int id_cliente
        +string dni
        +string nombre
        +string correo
        +string telefono
        +bool estado
    }

    %% ---- Relaciones de dominio ----
    Rol "1" --> "0..*" Usuario : tiene
    Rol "1" --> "0..*" Permiso : define
    Usuario "1" --> "0..*" Venta : registra
    Categoria "1" --> "0..*" Producto : clasifica
    Venta "1" *-- "1..*" DetalleVenta : composicion
    Producto "1" --> "0..*" DetalleVenta : aparece en
    Producto "1" --> "0..*" RegistroInventario : movimientos
    Usuario "1" --> "0..*" RegistroInventario : genera
    Venta "1" --> "0..*" RegistroInventario : origina (salida)
```

**Notas del modelo:**
- `Venta` ◆— `DetalleVenta`: **composición** (los detalles no existen sin su venta).
- El rol se duplica: existe la tabla `rol`/`id_rol` (modelo original) y la columna
  `usuario.rol` (string) que es la que realmente viaja en el JWT y controla los permisos.
- `Producto.remove()` es **baja lógica** (`estado=false`) para preservar el historial de ventas.

---

## 4. Patrones de Diseño identificados

| # | Patrón | Tipo | Dónde se aplica | Evidencia |
|---|--------|------|-----------------|-----------|
| 1 | **Arquitectura en Capas (N-Tier / Layered)** | Arquitectónico | Todo el backend | `routes/ → controllers/ → services/ → repositories/ → db/` |
| 2 | **Repository** | Estructural | `src/repositories/*` | Aíslan el SQL; el resto del sistema no conoce PostgreSQL |
| 3 | **Service Layer / Facade** | Estructural | `src/services/*` | Orquestan la lógica de negocio y exponen una API simple a los controllers |
| 4 | **Singleton** | Creacional | `src/db/connection.js` | Un único `Pool` compartido vía `module.exports` (cache de módulos de Node) |
| 5 | **Chain of Responsibility (Middleware)** | Comportamiento | `index.js`, `*Routes.js` | `authenticateToken → authorizeRoles → controller` (cada uno decide pasar o cortar con `next()`) |
| 6 | **MVC** (variante) | Arquitectónico | Controllers + Models(DB) + Vistas(React) | Separación responsabilidad request/negocio/datos |
| 7 | **Transaction Script** | Comportamiento | `ventaService.creaVenta()` | `BEGIN/COMMIT/ROLLBACK` con `client` para venta atómica |
| 8 | **Dependency Injection** (manual) | Creacional | `descuentaStock(client, ...)`, `crearVenta(client, ...)` | Se inyecta el `client` de la transacción a los repositorios |
| 9 | **DTO / Strategy de validación** | Comportamiento | `utils/validators.js` | Funciones de validación desacopladas e intercambiables por recurso |
| 10 | **Module Pattern** | Creacional | Todo el código JS | Encapsulamiento vía `exports.*` (estado/funciones privadas por módulo) |

### Patrón estrella: **Repository + Service Layer**

El núcleo del diseño es la separación en tres responsabilidades por recurso:

```
Controller  →  traduce HTTP (req/res, status codes, validación de entrada)
Service     →  reglas de negocio + transacciones (qué hacer)
Repository  →  acceso a datos / SQL puro (cómo persistir)
```

Esto permite, por ejemplo, que `VentaService.creaVenta()` coordine *varios*
repositorios (`ventaRepository` + `productoService.descuentaStock`) dentro de una
sola transacción, sin que el controller ni la base de datos se acoplen entre sí.

### Patrón de seguridad: **Middleware Chain**

```
Request ──► authenticateToken ──► authorizeRoles('gerente','operador_stock') ──► Controller
              (¿token válido?)        (¿rol permitido?)                          (lógica)
```

`authenticateToken` extrae y verifica el JWT (poblando `req.user`); `authorizeRoles`
es una **factory** que retorna un middleware parametrizado con los roles permitidos
(closure sobre `...roles`) — combinando *Chain of Responsibility* con *Factory Method*.

---

## 5. Resumen para defensa / informe

- **Estilo arquitectónico principal:** Arquitectura en Capas (Layered) sobre Express.
- **Patrón GoF más representativo:** Singleton (pool de conexión) + uso intensivo de
  Repository y Facade (no-GoF pero patrones de Fowler/PoEAA).
- **Atomicidad:** las ventas usan Transaction Script con rollback ante stock insuficiente.
- **Seguridad:** Middleware Chain (JWT + RBAC con 3 roles: gerente, operador_stock, vendedor).
```