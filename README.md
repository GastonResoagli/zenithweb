# Sistema de Gestión de Stock de Paneles Solares

## Descripción

Este proyecto consiste en el desarrollo de un sistema web orientado a la gestión eficiente del stock de paneles solares para pequeñas y medianas empresas.

El sistema permite controlar inventario, gestionar usuarios, registrar movimientos de stock y generar reportes en tiempo real, mejorando la toma de decisiones y reduciendo errores operativos.

---

## Objetivo General

Desarrollar una aplicación web que permita:

* Gestionar el inventario de productos
* Controlar movimientos de stock
* Administrar usuarios y roles
* Generar reportes en tiempo real

---

## Funcionalidades principales

### Gestión de Productos

* Alta, baja y modificación de productos
* Asociación con categorías y proveedores

### Gestión de Stock

* Registro de entradas de stock
* Registro de salidas de stock
* Control automático de inventario
* Alertas por stock mínimo

### Movimientos e Historial

* Registro de ventas
* Historial completo de movimientos
* Trazabilidad por usuario y fecha

### Reportes

* Generación de reportes en:

  * PDF
  * Excel
    
* Filtros por:
  * Producto
  * Categoría
  * Rango de fechas

### Seguridad

* Autenticación de usuarios
* Roles:

  * Administrador
  * Operador de stock
  * Vendedor
* Control de acceso por permisos

### Gestión de Proveedores

* Alta, baja y modificación de proveedores
* Asociación con productos

---

## Arquitectura

El sistema sigue una arquitectura:

* Cliente - Servidor
* N-Tier (por capas)

### Capas del sistema

* **Frontend (Presentación):**

  * Interfaz de usuario
  * Comunicación con el backend mediante API REST

* **Backend (Lógica de negocio):**

  * Validaciones
  * Procesamiento de datos
  * Control de acceso

* **Base de Datos:**

  * Persistencia de datos
  * Integridad y relaciones

---

## Tecnologías utilizadas

### Frontend

* React
* Tailwind CSS
* Flowbite
* Vite

### Backend

* Node.js
* Express

### Base de Datos

* PostgreSQL


### Infraestructura

* Railway / Supabase

### Colaboración

* GitHub
* Trello
* Discord

---

## Requisitos previos Para instalacion

- Node.js 18 o superior (verificar con: `node -v`)
- PostgreSQL instalado y corriendo
- El código del proyecto descargado

## Configuración de variables de entorno

El proyecto tiene dos partes y cada una usa su propio archivo `.env`
(no se suben al repositorio, hay que crearlos a mano).

### 1) Backend — archivo `.env` en la raíz del proyecto

```
DB_USER=postgres
DB_HOST=localhost
DB_NAME=control_stock
DB_PASSWORD=TU_CONTRASEÑA_DE_POSTGRES
DB_PORT=5432
JWT_SECRET=zenithweb-secreto-local
```

- `DB_NAME` debe coincidir con la base que crees en el paso siguiente.
- `JWT_SECRET` puede ser cualquier texto; firma el token de login.

### 2) Frontend — archivo `client/.env`

```
VITE_API_URL=http://localhost:3000
```

Le indica al frontend dónde está el backend (puerto por defecto: 3000).

## Crear y cargar la base de datos

1. Crear la base vacía (desde psql o pgAdmin):

   ```sql
   CREATE DATABASE control_stock;
   ```

2. Cargar el esquema completo y los datos de ejemplo de una sola vez:

   ```bash
   psql -U postgres -d control_stock -f src/db/setup_completo.sql
   ```

   Crea todas las tablas, funciones e índices, y carga datos de ejemplo
   (7 categorías, 16 productos, 5 ventas).

## Levantar el proyecto

**Backend** (desde la raíz):

```bash
npm install
npm start
```
Debe mostrar: `servidor corriendo en puerto 3000`

**Frontend** (en otra terminal):

```bash
cd client
npm install
npm run dev
```
Abrir la URL que muestra (normalmente http://localhost:5173).

## Usuarios de prueba

| Correo               | Contraseña   | Rol            |
|----------------------|--------------|----------------|
| admin@zenith.com     | admin123     | vendedor       |
| gerente@zenith.com   | gerente123   | gerente        |
| operador@zenith.com  | operador123  | operador_stock |
| vendedor@zenith.com  | vendedor123  | vendedor       |

## Patrones de diseño aplicados

El sistema implementa tres patrones de diseño:

- **Singleton** — `src/db/connection.js` exporta un único pool de conexiones a
  PostgreSQL. El sistema de módulos de Node cachea ese export, garantizando una
  sola instancia compartida en toda la aplicación.

- **Fachada (Facade)** — `VentaService` y `ReporteService` ofrecen una
  interfaz simple que oculta la complejidad del subsistema. Por ejemplo,
  `ventaService.creaVenta()` coordina, en una única transacción, el alta de la
  venta, el descuento de stock y el registro del movimiento de inventario; el
  controller solo invoca esa operación sin conocer los repositorios internos.

- **Observador (Observer)** — En `src/services/reporteService.js`, la
  generación del PDF usa el modelo de eventos de PDFKit. El documento
  (`PDFDocument`) actúa como *Subject* y emite los eventos `data`, `end` y
  `error`; el servicio se suscribe como *Observer* con `.on(...)` y reacciona
  automáticamente a cada notificación, sin acoplarse al funcionamiento interno
  del generador.

## Estructura del proyecto

```
zenithweb/
├── index.js                 # Punto de entrada del backend (Express)
├── src/
│   ├── controllers/         # Reciben las peticiones HTTP
│   ├── services/            # Lógica de negocio (fachadas)
│   ├── repositories/        # Acceso a datos (consultas SQL)
│   ├── routes/              # Definición de rutas de la API
│   ├── middleware/          # Autenticación JWT y control de roles
│   ├── utils/               # Validadores reutilizables
│   └── db/                  # Conexión, esquema y scripts SQL
└── client/                  # Frontend React + Vite
    └── src/
        ├── api/             # Clientes HTTP hacia el backend
        └── pages/           # Vistas de la aplicación
```

## Metodología de desarrollo

Se utilizó un enfoque ágil basado en **Scrum** con modelo incremental.

### Sprints

* **Sprint 1:** Configuración inicial + Login + Roles
* **Sprint 2:** ABM de productos + stock básico
* **Sprint 3:** Movimientos de inventario + alertas
* **Sprint 4:** Reportes + frontend + testing + deploy

---

## Integrantes

* Matías Lago
* Gastón Resoagli

---
