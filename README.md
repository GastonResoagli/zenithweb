# 🌞 Sistema de Gestión de Stock de Paneles Solares

## 📌 Descripción

Este proyecto consiste en el desarrollo de un sistema web orientado a la gestión eficiente del stock de paneles solares para pequeñas y medianas empresas.

El sistema permite controlar inventario, gestionar usuarios, registrar movimientos de stock y generar reportes en tiempo real, mejorando la toma de decisiones y reduciendo errores operativos.

---

## 🎯 Objetivo General

Desarrollar una aplicación web que permita:

* Gestionar el inventario de productos
* Controlar movimientos de stock
* Administrar usuarios y roles
* Generar reportes en tiempo real

---

## 🚀 Funcionalidades principales

### 📦 Gestión de Productos

* Alta, baja y modificación de productos
* Asociación con categorías y proveedores

### 📊 Gestión de Stock

* Registro de entradas de stock
* Registro de salidas de stock
* Control automático de inventario
* Alertas por stock mínimo

### 🧾 Movimientos e Historial

* Registro de ventas
* Historial completo de movimientos
* Trazabilidad por usuario y fecha

### 📈 Reportes

* Generación de reportes en:

  * PDF
  * Excel
  * 
* Filtros por:
  * Producto
  * Categoría
  * Rango de fechas

### 🔐 Seguridad

* Autenticación de usuarios
* Roles:

  * Administrador
  * Operador de stock
  * Vendedor
* Control de acceso por permisos

### 🏢 Gestión de Proveedores

* Alta, baja y modificación de proveedores
* Asociación con productos

---

## 🧱 Arquitectura

El sistema sigue una arquitectura:

* Cliente - Servidor
* N-Tier (por capas)

### 🔹 Capas del sistema

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

## 🛠️ Tecnologías utilizadas

### 💻 Frontend

* React
* Tailwind CSS
* Flowbite
* Vite

### ⚙️ Backend

* Node.js
* Express

### 🗄️ Base de Datos

* PostgreSQL


### ☁️ Infraestructura

* Railway / Supabase

### 🤝 Colaboración

* GitHub
* Trello
* Discord

---

## ⚙️ Instalación y ejecución

### 🔹 1. Clonar el repositorio

```
git clone https://github.com/tu-usuario/tu-repo.git
cd tu-repo
```

### 🔹 2. Configurar variables de entorno

Crear archivo `.env` en backend:

```
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=stock_db
JWT_SECRET=secret_key
```

### 🔹 3. Instalar dependencias

```
npm install
```

### 🔹 4. Levantar el backend

```
npm run dev
```

### 🔹 5. Levantar el frontend

```
npm run dev
```

---

## 🗄️ Base de datos

Para crear la base de datos:

```
psql -U postgres -d stock_db -f database/schema.sql
```

---

## 🔄 Metodología de desarrollo

Se utilizó un enfoque ágil basado en **Scrum** con modelo incremental.

### 📅 Sprints

* **Sprint 1:** Configuración inicial + Login + Roles
* **Sprint 2:** ABM de productos + stock básico
* **Sprint 3:** Movimientos de inventario + alertas
* **Sprint 4:** Reportes + frontend + testing + deploy

---


## 📊 Estado del proyecto

🚧 En desarrollo

---

## 👥 Integrantes

* Matías Lago
* Gastón Resoagli

---

## 📚 Licencia

Este proyecto es de uso académico.
