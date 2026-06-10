# Especificación de Requisitos de Software (ERS)
## ZenithWeb — Sistema de Gestión de Stock de Paneles Solares

> Documento basado en el estándar **IEEE 830**.
> Versión 1.0 — Junio 2026

---

## Control de versiones

| Versión | Fecha | Autor(es) | Descripción de los cambios | Estado |
|:-------:|:----------:|-----------|----------------------------|:------:|
| 0.1 | 05/06/2026 | Equipo ZenithWeb | Versión inicial: estructura del documento y secciones 1-2 (introducción y descripción general). | Borrador |
| 0.2 | 07/06/2026 | Equipo ZenithWeb | Carga de requisitos funcionales (RF-01 a RF-20) y no funcionales (RNF-01 a RNF-10). | Borrador |
| 1.0 | 09/06/2026 | Equipo ZenithWeb | Versión completa: matriz de trazabilidad rol↔funcionalidad, modelo de datos y control de versiones. | Aprobado |

**Aprobaciones**

| Rol | Nombre | Firma | Fecha |
|-----|--------|:-----:|:-----:|
| Responsable del proyecto | | | |
| Docente / Evaluador | | | |

---

## 1. Introducción

### 1.1 Propósito
El propósito de este documento es definir de forma completa y precisa los requisitos
del sistema **ZenithWeb**, una aplicación web para la **gestión de stock, ventas e
inventario de paneles solares**. Está dirigido al equipo de desarrollo, a los docentes
evaluadores y a los usuarios finales del sistema (gerencia, personal de stock y ventas).

### 1.2 Alcance
ZenithWeb es un sistema web que permite:
- Administrar el catálogo de **productos** (paneles solares y artículos relacionados).
- Registrar **ventas** descontando stock de forma automática y atómica.
- Llevar la **trazabilidad de inventario** (entradas y salidas).
- Generar **reportes** de ventas en formato PDF.
- Controlar el acceso por **roles** (gerente, operador de stock, vendedor).

Queda **fuera del alcance**: facturación electrónica con organismos fiscales, pasarela
de pagos online, gestión de proveedores y logística de envíos.

### 1.3 Definiciones, acrónimos y abreviaturas
| Término | Definición |
|---------|------------|
| **ERS** | Especificación de Requisitos de Software |
| **RF** | Requisito Funcional |
| **RNF** | Requisito No Funcional |
| **JWT** | JSON Web Token, mecanismo de autenticación por token |
| **RBAC** | Role-Based Access Control (control de acceso por roles) |
| **Baja lógica** | Marcar un registro como inactivo (`estado = false`) sin borrarlo físicamente |
| **API REST** | Interfaz HTTP de comunicación entre frontend y backend |
| **Stock** | Cantidad disponible de un producto |

### 1.4 Referencias
- IEEE Std 830-1998, *Recommended Practice for Software Requirements Specifications*.
- Código fuente del proyecto ZenithWeb (`src/`).
- Diagramas de clases y de secuencia del proyecto (`varios/`).

### 1.5 Visión general del documento
La sección 2 describe el producto de forma general (perspectiva, funciones, usuarios y
restricciones). La sección 3 detalla los requisitos funcionales y no funcionales
específicos.

---

## 2. Descripción general

### 2.1 Perspectiva del producto
ZenithWeb es un sistema **nuevo e independiente**, con arquitectura **cliente-servidor en
capas**:

```
  Cliente (React)  ──HTTP/JSON + JWT──►  API REST (Node.js/Express)  ──►  PostgreSQL
```

El backend está organizado en capas: **Rutas → Controladores → Servicios → Repositorios →
Base de datos**, con middlewares de autenticación y autorización.

### 2.2 Funciones del producto (resumen)
- **Autenticación** de usuarios mediante usuario/contraseña y emisión de token JWT.
- **Gestión de productos**: alta, consulta, modificación, baja lógica y activación/desactivación.
- **Gestión de ventas**: registro de ventas con múltiples productos y descuento automático de stock.
- **Gestión de inventario**: registro y consulta de movimientos (entradas/salidas).
- **Categorías**: consulta del listado para clasificar productos.
- **Reportes**: consulta de movimientos filtrados y generación de PDF de ventas.

### 2.3 Características de los usuarios
| Rol | Perfil | Permisos principales |
|-----|--------|----------------------|
| **Gerente** | Administrador del sistema | Acceso total: productos, ventas, inventario y reportes |
| **Operador de stock** | Encargado de depósito | Gestión de productos e inventario (no vende ni ve reportes) |
| **Vendedor** | Personal de ventas | Registrar y consultar ventas; ver catálogo de productos activos |

Todos los usuarios deben estar autenticados; no existe acceso anónimo salvo el login.

### 2.4 Restricciones
- **RC-01**: El sistema debe desarrollarse con **Node.js/Express** (backend), **React**
  (frontend) y **PostgreSQL** (base de datos).
- **RC-02**: La comunicación frontend-backend será exclusivamente vía **API REST** con
  intercambio de **JSON**.
- **RC-03**: La autorización se basa en **JWT** transportado en el header
  `Authorization: Bearer <token>`.
- **RC-04**: El token JWT tiene una **vigencia de 8 horas**.
- **RC-05**: Los productos no se eliminan físicamente: se aplica **baja lógica** para
  preservar la integridad referencial con el historial de ventas.

### 2.5 Suposiciones y dependencias
- Los usuarios acceden desde un navegador web moderno con conexión a la red del sistema.
- Existe una instancia de **PostgreSQL** accesible y con el esquema ya creado.
- Las variables de entorno (`JWT_SECRET`, credenciales de base de datos) están configuradas.

---

## 3. Requisitos específicos

### 3.1 Requisitos funcionales

#### Módulo: Autenticación (`/api/auth`)

| ID | Requisito | Detalle |
|----|-----------|---------|
| **RF-01** | Inicio de sesión | El sistema debe permitir autenticarse con **usuario (correo) y contraseña**. Si las credenciales son válidas, devuelve un **token JWT** y el **rol** del usuario. |
| **RF-02** | Validación de credenciales | Si el usuario no existe o la contraseña no coincide, debe responder **401 — Credenciales incorrectas**. |
| **RF-03** | Campos obligatorios | Si falta el usuario o la contraseña, debe responder **401 — Usuario y contraseña son requeridos**. |

#### Módulo: Productos (`/api/productos`)

| ID | Requisito | Roles | Detalle |
|----|-----------|-------|---------|
| **RF-04** | Listar productos | Autenticado | Devuelve el catálogo. Con `?soloActivos=true` excluye los dados de baja (lo usan los vendedores). |
| **RF-05** | Consultar producto por ID | Autenticado | Devuelve un producto puntual; **404** si no existe. |
| **RF-06** | Crear producto | Gerente, Operador stock | Da de alta un producto. Todo producto nuevo se crea **activo**. |
| **RF-07** | Validar datos de producto | — | Nombre y categoría **obligatorios**; stock y precios **no negativos**. Caso inválido → **400**. |
| **RF-08** | Modificar producto | Gerente, Operador stock | Actualiza nombre, descripción, stock, precios y categoría. |
| **RF-09** | Baja lógica de producto | Gerente, Operador stock | Marca `estado = false` (no borra el registro). |
| **RF-10** | Activar/Desactivar producto | Gerente, Operador stock | Cambia el estado (alta/baja) mediante un valor booleano explícito. |

#### Módulo: Ventas (`/api/ventas`)

| ID | Requisito | Roles | Detalle |
|----|-----------|-------|---------|
| **RF-11** | Listar ventas | Gerente, Vendedor | Devuelve las ventas con la **cantidad de ítems** de cada una. |
| **RF-12** | Consultar venta por ID | Gerente, Vendedor | Devuelve la venta con el **detalle de sus productos**; **404** si no existe. |
| **RF-13** | Registrar venta | Gerente, Vendedor | Crea una venta con una o más líneas de detalle. El `id_usuario` se toma **del token** (evita suplantación). |
| **RF-14** | Validar venta | — | La venta debe tener **al menos un producto**; caso contrario → **400**. |
| **RF-15** | Descuento de stock atómico | — | Al registrar la venta, el sistema **valida stock suficiente** y **descuenta** el stock de cada producto dentro de una **transacción**: si algo falla, no se guarda nada (ROLLBACK). |
| **RF-16** | Registro de movimiento por venta | — | Cada venta genera automáticamente un movimiento de inventario de tipo **'salida'**. |

#### Módulo: Inventario / Movimientos (`/api/movimientos`)

| ID | Requisito | Roles | Detalle |
|----|-----------|-------|---------|
| **RF-17** | Consultar movimientos | Gerente, Operador stock | Devuelve el **historial** de movimientos de inventario (entradas y salidas). |

#### Módulo: Categorías (`/api/categorias`)

| ID | Requisito | Roles | Detalle |
|----|-----------|-------|---------|
| **RF-18** | Listar categorías | Autenticado | Devuelve el listado de categorías para clasificar productos (poblar selects en el frontend). |

#### Módulo: Reportes (`/api/reportes`)

| ID | Requisito | Roles | Detalle |
|----|-----------|-------|---------|
| **RF-19** | Consultar movimientos filtrados | Gerente | Devuelve movimientos filtrados por **fechaDesde, fechaHasta, tipo e id_producto**. |
| **RF-20** | Generar reporte PDF | Gerente | Genera un **PDF de ventas descargable** (no se guarda en disco; se envía como archivo). |

### 3.2 Requisitos no funcionales

#### Seguridad
| ID | Requisito |
|----|-----------|
| **RNF-01** | Toda petición (salvo el login) debe presentar un **JWT válido**; sin token → **401**, token inválido/expirado → **403**. |
| **RNF-02** | El acceso a cada funcionalidad se restringe por **rol** (RBAC); rol insuficiente → **403 — Acceso denegado**. |
| **RNF-03** | El `id_usuario` de las operaciones sensibles (ventas) se toma del token, no del cuerpo de la petición. |
| **RNF-04** | *(Mejora pendiente)* Las contraseñas deberían almacenarse **hasheadas** (p. ej. bcrypt); actualmente se comparan en texto plano. |

#### Rendimiento y fiabilidad
| ID | Requisito |
|----|-----------|
| **RNF-05** | Las operaciones que afectan varias tablas (registrar venta) deben ser **transaccionales** (atomicidad: todo o nada). |
| **RNF-06** | La conexión a la base de datos se gestiona mediante un **pool de conexiones** reutilizable (patrón Singleton). |

#### Usabilidad y mantenibilidad
| ID | Requisito |
|----|-----------|
| **RNF-07** | La interfaz debe adaptar el menú según el **rol** devuelto en el login. |
| **RNF-08** | El backend debe seguir una **arquitectura en capas** (rutas, controladores, servicios, repositorios) para favorecer el mantenimiento. |
| **RNF-09** | Los mensajes de error deben ser claros y devolver el **código HTTP** adecuado (400, 401, 403, 404, 500). |

#### Portabilidad
| ID | Requisito |
|----|-----------|
| **RNF-10** | El sistema debe poder ejecutarse en cualquier entorno con Node.js y PostgreSQL, configurable mediante **variables de entorno**. |

### 3.3 Requisitos de interfaces externas

- **Interfaz de usuario**: aplicación web desarrollada en **React**, responsiva, accesible
  desde navegador.
- **Interfaz de software**: **API REST** sobre HTTP con cuerpos en **JSON**; autenticación
  por header `Authorization: Bearer <token>`.
- **Interfaz de base de datos**: **PostgreSQL**, accedida mediante el driver `pg`.

### 3.4 Modelo de datos (entidades principales)

| Entidad | Descripción |
|---------|-------------|
| **Usuario** | Persona que accede al sistema; tiene un rol asociado. |
| **Rol** | Define el perfil de acceso (gerente, operador_stock, vendedor). |
| **Permiso** | Menús/funciones habilitadas por rol. |
| **Categoría** | Clasificación de los productos. |
| **Producto** | Artículo del catálogo con stock, precios y estado (activo/baja). |
| **Venta** | Operación de venta con cliente, montos y fecha. |
| **DetalleVenta** | Renglón de una venta: producto, cantidad, precio y subtotal. Resuelve la relación N:M entre Venta y Producto. |
| **RegistroInventario** | Movimiento de stock (entrada/salida) con trazabilidad de usuario y venta. |

**Relaciones clave:**
- `Venta 1 —— 1..* DetalleVenta *—— 1 Producto` (una venta tiene al menos un renglón).
- `Producto 1 —— 0..* RegistroInventario` (un producto acumula movimientos).
- `Usuario 1 —— 0..* Venta` (un usuario registra muchas ventas).

---

## 4. Matriz de trazabilidad rol ↔ funcionalidad

| Funcionalidad | Gerente | Operador stock | Vendedor |
|---------------|:-------:|:--------------:|:--------:|
| Login | ✅ | ✅ | ✅ |
| Ver productos | ✅ | ✅ | ✅ (solo activos) |
| Crear/Modificar/Baja producto | ✅ | ✅ | ❌ |
| Registrar/Consultar ventas | ✅ | ❌ | ✅ |
| Ver movimientos de inventario | ✅ | ✅ | ❌ |
| Consultar/Generar reportes | ✅ | ❌ | ❌ |
| Ver categorías | ✅ | ✅ | ✅ |
