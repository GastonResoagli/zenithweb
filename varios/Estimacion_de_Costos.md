# Estimación de Costos — ZenithWeb

Sistema de Gestión de Stock de Paneles Solares (Node/Express + React + PostgreSQL).

## 1. Datos base del proyecto (medidos del repositorio)

| Capa | Líneas |
|---|---|
| Backend (Node/Express, sin tests) | 973 |
| Frontend (React .jsx/.js + CSS) | 2.734 |
| SQL (procedures, esquema, seeds) | 961 |
| Tests | 356 |

**Tamaño funcional estimado** (sin tests ni CSS, que no constituyen lógica de negocio):
**≈ 3.700 líneas → 3,7 KLOC**.

## 2. Método seleccionado: COCOMO Básico (modo orgánico)

### Justificación

- Es un proyecto **pequeño y orgánico**: equipo reducido, requisitos estables y conocidos,
  tecnologías estándar (Node, React, PostgreSQL). Encaja en la definición del modo *orgánico*.
- Permite estimar **esfuerzo, tiempo y personal** a partir de una sola variable (KLOC), que
  pudo **medirse del código real**, sin requerir un desglose detallado de puntos de función.
- Es el modelo paramétrico más difundido y documentado (Boehm, 1981), lo que lo hace
  defendible en un informe académico.

### Fórmulas (modo orgánico)

```
Esfuerzo  E = 2,4 · (KLOC)^1,05      [persona-mes]
Duración  D = 2,5 · (E)^0,38         [meses]
Personal  P = E / D                  [personas]
```

### Desarrollo con KLOC = 3,7

| Variable | Cálculo | Resultado |
|---|---|---|
| Esfuerzo (E) | 2,4 · 3,7^1,05 = 2,4 · 3,95 | **≈ 9,5 persona-mes** |
| Duración (D) | 2,5 · 9,5^0,38 | **≈ 5,9 meses** |
| Personal (P) | 9,5 / 5,9 | **≈ 2 personas** |
| Horas totales | 9,5 PM · 152 h/mes | **≈ 1.444 horas** |

> **Nota metodológica:** COCOMO tiende a **sobreestimar proyectos chicos**. Como contraste por
> analogía / juicio experto, un CRUD web de este alcance se construye realmente en ~**400–600 h**.
> Conviene reportar ambos valores: COCOMO como cota superior teórica y la estimación por analogía
> como valor de trabajo.

## 3. Estimación de costos

### a) Recursos humanos (rubro dominante)

Costo = horas × valor hora (la tarifa se ajusta al contexto):

| Escenario | Horas | Tarifa (ej.) | Costo |
|---|---|---|---|
| COCOMO (cota superior) | 1.444 h | a definir | 1.444 × tarifa |
| Por analogía (realista) | ~500 h | a definir | 500 × tarifa |

*Ejemplo:* con una tarifa de USD 12/h → realista ≈ **USD 6.000**; COCOMO ≈ **USD 17.300**.

### b) Infraestructura / operación

Según el stack que ya utiliza el proyecto (Supabase + Render + Vercel):

| Ítem | Costo mensual aprox. |
|---|---|
| Base de datos (Supabase Free/Pro) | USD 0 – 25 |
| Backend (Render Free/Starter) | USD 0 – 7 |
| Frontend (Vercel Hobby) | USD 0 |
| Dominio | ~USD 15 / año |
| **Total operación** | **≈ USD 0 – 35 / mes** |

### c) Total estimado (escenario realista, 1.er año)

| Concepto | Monto (USD aprox.) |
|---|---|
| Desarrollo (≈500 h) | 6.000 |
| Infraestructura (12 meses) | 0 – 420 |
| Contingencia (10%) | ~640 |
| **Total** | **≈ 6.600 – 7.000** |

---

> Las tarifas y la conversión a pesos se dejan como variables porque dependen del contexto y de la
> fecha de cálculo. Con la tarifa horaria (o el sueldo mensual del rol) y la moneda, los totales
> pueden cerrarse con números definitivos.

### Referencia

- Boehm, B. W. (1981). *Software Engineering Economics*. Prentice-Hall.
