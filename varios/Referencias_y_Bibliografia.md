# Referencias y Bibliografía — ZenithWeb

Sistema de Gestión de Stock de Paneles Solares

Documento de referencias técnicas y bibliográficas utilizadas durante el diseño,
desarrollo y despliegue del proyecto. Las citas siguen el estilo **APA 7.ª edición**.

---

## 1. Lenguajes, entornos de ejecución y herramientas base

- Node.js Foundation / OpenJS Foundation. (2025). *Node.js documentation*. https://nodejs.org/en/docs
- Mozilla Developer Network. (2025). *JavaScript reference*. MDN Web Docs. https://developer.mozilla.org/en-US/docs/Web/JavaScript
- npm, Inc. (2025). *npm Docs*. https://docs.npmjs.com
- Git. (2025). *Git documentation* (2.ª ed., en línea). https://git-scm.com/doc
- Chacon, S., & Straub, B. (2014). *Pro Git* (2.ª ed.). Apress. https://git-scm.com/book

---

## 2. Backend — Node.js / Express y librerías

- OpenJS Foundation. (2025). *Express 5.x — API reference*. https://expressjs.com/en/5x/api.html
- node-postgres. (2025). *pg — PostgreSQL client for Node.js*. https://node-postgres.com
- Auth0. (2025). *jsonwebtoken — JSON Web Token implementation for Node.js* [Repositorio de software]. GitHub. https://github.com/auth0/node-jsonwebtoken
- Jones, M., Bradley, J., & Sakimura, N. (2015). *JSON Web Token (JWT)* (RFC 7519). Internet Engineering Task Force (IETF). https://www.rfc-editor.org/rfc/rfc7519
- Provos, N., & Mazières, D. (1999). A future-adaptable password scheme. *Proceedings of the 1999 USENIX Annual Technical Conference*. (Algoritmo bcrypt, implementado en la librería `bcryptjs`).
- dcodeIO. (2025). *bcryptjs — Optimized bcrypt in JavaScript* [Repositorio de software]. GitHub. https://github.com/dcodeIO/bcrypt.js
- expressjs. (2025). *cors — Connect/Express middleware* [Repositorio de software]. GitHub. https://github.com/expressjs/cors
- motdotla. (2025). *dotenv — Loads environment variables from .env* [Repositorio de software]. GitHub. https://github.com/motdotla/dotenv
- Foliojs. (2025). *PDFKit — A JavaScript PDF generation library for Node and the browser*. https://pdfkit.org

---

## 3. Frontend — React, Vite y enrutamiento

- Meta Open Source. (2025). *React documentation*. https://react.dev
- Meta Open Source. (2025). *React DOM — Client APIs*. https://react.dev/reference/react-dom
- Vite. (2025). *Vite — Next generation frontend tooling*. https://vite.dev
- Remix Software. (2025). *React Router documentation* (v7). https://reactrouter.com
- Mozilla Developer Network. (2025). *HTML, CSS y Fetch API reference*. MDN Web Docs. https://developer.mozilla.org/en-US/docs/Web

---

## 4. Base de datos — PostgreSQL

- The PostgreSQL Global Development Group. (2025). *PostgreSQL 16 documentation*. https://www.postgresql.org/docs
- Date, C. J. (2003). *An introduction to database systems* (8.ª ed.). Addison-Wesley.
- Elmasri, R., & Navathe, S. B. (2016). *Fundamentals of database systems* (7.ª ed.). Pearson.

---

## 5. Calidad, pruebas y estilo de código

- Meta Open Source. (2025). *Jest — Delightful JavaScript testing*. https://jestjs.io
- OpenJS Foundation. (2025). *ESLint — Pluggable JavaScript linter*. https://eslint.org
- Beck, K. (2002). *Test-driven development: By example*. Addison-Wesley.

---

## 6. Arquitectura y patrones de diseño

- Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (1994). *Design patterns: Elements of reusable object-oriented software*. Addison-Wesley. (Patrones **Facade** y **Observer** aplicados en el diseño del sistema).
- Martin, R. C. (2017). *Clean architecture: A craftsman's guide to software structure and design*. Prentice Hall. (Separación en capas: rutas, controladores, servicios y repositorios).
- Fowler, M. (2002). *Patterns of enterprise application architecture*. Addison-Wesley. (Patrón **Repository** utilizado en la capa de acceso a datos).
- Object Management Group. (2017). *OMG Unified Modeling Language (UML), versión 2.5.1*. https://www.omg.org/spec/UML

---

## 7. Despliegue e infraestructura (hosting)

- Vercel Inc. (2025). *Vercel documentation*. https://vercel.com/docs (Hosting del frontend).
- Render. (2025). *Render documentation*. https://render.com/docs (Hosting del backend / API).
- Supabase Inc. (2025). *Supabase documentation*. https://supabase.com/docs (Base de datos PostgreSQL gestionada).

---

## 8. Seguridad

- OWASP Foundation. (2021). *OWASP Top 10 — 2021*. https://owasp.org/Top10
- OWASP Foundation. (2025). *OWASP cheat sheet series*. https://cheatsheetseries.owasp.org

---

## Nota sobre versiones

Las versiones concretas de cada dependencia utilizadas en el proyecto se encuentran
documentadas en los archivos `package.json` (backend) y `client/package.json` (frontend),
así como en los respectivos `package-lock.json`.
