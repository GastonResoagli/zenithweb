<div class="portada">

# Anexo A — Manual de Usuario del sistema

### ZenithWeb — Sistema de Gestión de Stock de Paneles Solares

</div>

---

## Introducción

El propósito de este documento es describir la utilización por parte de los usuarios del
**sistema ZenithWeb**, una aplicación web para la gestión de stock, ventas e inventario de
paneles solares.

## Objetivo de este manual

El objetivo es indicar los pasos y procedimientos a realizar para llevar a cabo las distintas
tareas y funcionalidades que provee el sistema, según el perfil de cada usuario.

## Dirigido a

Para la utilización del presente sistema se reconocen **tres tipos de perfiles**, definidos por
su rol dentro de la organización:

**Gerente**: es el usuario administrador del sistema. Tiene acceso total a todas las
funcionalidades: gestión de productos, registro y consulta de ventas, control de inventario
y generación de reportes.

**Operador de stock**: es el usuario interno encargado del depósito. Utiliza el sistema para
administrar el catálogo de productos y consultar los movimientos de inventario (no
registra ventas ni accede a reportes).

**Vendedor**: es el usuario de ventas. Utiliza el sistema para registrar y consultar ventas, y
para consultar el catálogo de productos disponibles.

## Lo que deben conocer

Los conocimientos mínimos que deben tener las personas que operarán el sistema y
deberán utilizar este manual son:

**Todos los usuarios**: deben contar con un **usuario (correo) y una contraseña** válidos,
provistos por el administrador del sistema, y conocer el manejo básico de un navegador
web (Chrome, Edge o Firefox).

**Gerente**: además, debe conocer el funcionamiento general del negocio (catálogo,
precios, ventas y movimientos de stock) para interpretar correctamente los reportes y
administrar el sistema.

## Especificaciones técnicas

ZenithWeb es una **aplicación web**, por lo que el usuario final solo necesita un navegador.
Los requerimientos son:

**Hardware (equipo del usuario):**

- Computadora con al menos **4 GB de RAM**, CPU de al menos 1 GHz, teclado, mouse y monitor.
- Conexión a la red local o a Internet, según dónde esté publicado el sistema.

**Software (equipo del usuario):**

- Sistema operativo Windows 10/11, macOS o Linux.
- Un **navegador web moderno** actualizado: Google Chrome, Microsoft Edge o Mozilla Firefox.
- No requiere instalación de programas adicionales en el equipo del usuario.

## Características del producto

ZenithWeb fue desarrollado con **Node.js/Express** (backend) y **React** (frontend), con una
base de datos **PostgreSQL**. Es una aplicación **web cliente-servidor en capas**, accesible
desde cualquier navegador sin necesidad de instalación en el equipo del usuario.

Posee una **interfaz gráfica amigable** que adapta el menú según el rol del usuario que
inició sesión. Cuenta con un esquema de **seguridad basado en roles (RBAC)** mediante
autenticación por **token JWT**: cada usuario solo puede acceder a las funcionalidades
correspondientes a su perfil. Además, todas las operaciones de inventario quedan
registradas para su trazabilidad (movimientos de entrada y salida).

---

## Uso del sistema

### Ingreso al sistema

Para acceder, el usuario debe abrir el navegador e ingresar a la dirección del sistema
(por ejemplo, `http://localhost:5173` en entorno local, o la URL provista por el
administrador). El sistema mostrará la pantalla de **inicio de sesión**.

El usuario debe ingresar su **correo** y **contraseña**, y hacer clic en el botón **“Ingresar”**.

> *[Insertar captura: pantalla de Inicio de Sesión con los campos Correo, Contraseña y el botón Ingresar]*

Si las credenciales son correctas, el sistema valida los datos, genera un token de sesión
(válido por 8 horas) y presenta la pantalla principal con las funcionalidades habilitadas
según el **rol** del usuario. Si las credenciales son incorrectas, se muestra el mensaje
**“Credenciales incorrectas”**.

### Menú principal del sistema

Una vez dentro, se muestra el menú principal. Las opciones disponibles **dependen del rol**
del usuario:

| Opción del menú | Gerente | Operador de stock | Vendedor |
|-----------------|:-------:|:-----------------:|:--------:|
| Productos | ✅ | ✅ | ✅ (solo consulta) |
| Ventas | ✅ | ❌ | ✅ |
| Movimientos de inventario | ✅ | ✅ | ❌ |
| Reportes | ✅ | ❌ | ❌ |

> *[Insertar captura: pantalla del menú principal mostrando las opciones según el rol]*

### Consultar productos

Al ingresar al módulo **Productos**, el sistema muestra el listado del catálogo con su
información (nombre, categoría, stock, precios y estado). Los **vendedores** solo ven los
productos **activos** (disponibles para vender).

> *[Insertar captura: listado de productos]*

### Agregar un producto *(Gerente / Operador de stock)*

Desde el listado, el usuario hace clic en **“Agregar producto”** y completa el formulario con
los datos del nuevo producto: nombre, descripción, categoría, stock, precio de compra y
precio de venta.

> *[Insertar captura: formulario de alta de producto]*

Al guardar, el sistema **valida** que el nombre y la categoría estén completos y que el stock
y los precios no sean negativos. Si todo es correcto, el producto se registra como **activo**.
Si algún dato es inválido, se muestra el mensaje de error correspondiente.

### Modificar un producto *(Gerente / Operador de stock)*

El usuario selecciona un producto del listado y elige la opción **“Editar”**. El formulario se
abre con los datos actuales cargados; el usuario modifica los campos necesarios y guarda
los cambios.

> *[Insertar captura: formulario de edición de producto]*

### Eliminar un producto *(Gerente / Operador de stock)*

El usuario selecciona un producto y elige **“Eliminar”**. El sistema realiza una **baja lógica**:
el producto **no se borra** de la base de datos, sino que se marca como **inactivo**. Esto
preserva el historial de ventas en las que ese producto haya participado.

> *[Insertar captura: confirmación de baja de producto]*

### Registrar una venta *(Gerente / Vendedor)*

En el módulo **Ventas**, el usuario hace clic en **“Nueva venta”**, completa los datos del
cliente y **agrega uno o más productos** indicando la cantidad de cada uno. El sistema
calcula automáticamente los subtotales y el total.

> *[Insertar captura: formulario de registro de venta con el detalle de productos]*

Al confirmar la venta, el sistema:

1. Verifica que haya **stock suficiente** de cada producto.
2. Registra la venta con su detalle.
3. **Descuenta automáticamente el stock** vendido.
4. Genera un movimiento de inventario de tipo **“salida”**.

Todo esto ocurre de forma **atómica**: si algún paso falla (por ejemplo, stock insuficiente),
no se registra nada y se informa el error. La venta debe tener **al menos un producto**.

### Consultar movimientos de inventario *(Gerente / Operador de stock)*

En el módulo **Movimientos**, el usuario puede ver el **historial completo** de entradas y
salidas de stock, con la trazabilidad de qué producto, qué cantidad, qué usuario y en qué
fecha se realizó cada movimiento.

> *[Insertar captura: listado de movimientos de inventario]*

### Consultar y generar reportes *(Gerente)*

En el módulo **Reportes**, el gerente puede filtrar los movimientos por **rango de fechas,
tipo (entrada/salida) y producto**, y visualizar el resultado.

Además, mediante el botón **“Generar PDF”**, el sistema produce un **reporte de ventas en
formato PDF descargable**, listo para imprimir o archivar.

> *[Insertar captura: pantalla de reportes con los filtros y el botón Generar PDF]*

### Cierre de sesión

Para salir del sistema de forma segura, el usuario debe utilizar la opción **“Cerrar sesión”**
del menú. Esto invalida la sesión actual en el navegador.
