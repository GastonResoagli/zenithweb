# ZenithWeb — Sistema de Gestión de Stock de Paneles Solares

Aplicación web para la gestión de inventario, ventas y reportes de una empresa
de paneles solares. Permite administrar productos y categorías, registrar
ventas con descuento automático de stock, llevar la trazabilidad de los
movimientos de inventario y generar reportes en PDF.

## Tecnologías

- **Backend:** Node.js + Express
- **Frontend:** React + Vite
- **Base de datos:** PostgreSQL
- **Autenticación:** JWT (JSON Web Tokens)
- **Generación de PDF:** PDFKit

## Funcionalidades principales

- Login con autenticación por token (JWT) y control de acceso por roles.
- ABM de productos y categorías (con baja lógica para preservar el historial).
- Registro de ventas en una transacción atómica: crea la venta, descuenta el
  stock y registra el movimiento de inventario.
- Historial de movimientos de inventario (entradas y salidas).
- Generación de reportes de ventas en PDF.

## Requisitos previos

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

El sistema implementa tres patrones de diseño GoF:

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
