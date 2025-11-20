# Guía para Demo y Defensa: AutomatePyme

Esta guía está diseñada para ayudarte a presentar y defender la aplicación AutomatePyme. Cubre las decisiones arquitectónicas, las implementaciones técnicas de las funcionalidades clave y te prepara para posibles preguntas del comité evaluador.

## 1. Análisis de Arquitectura de Base de Datos

La base de datos está construida sobre **PostgreSQL** (vía Supabase). Utiliza un enfoque híbrido que combina **Tablas Relacionales** para metadatos estructurales y **JSONB** para datos flexibles definidos por el usuario.

### 1.1 Esquemas Principales (Nivel Sistema)

Estas tablas gestionan las entidades fundamentales de la aplicación.

*   **`User`**: Almacena información de autenticación y perfil.
    *   *Campos Clave*: `id`, `email`, `configs` (JSONB para preferencias).
*   **`Form` & `Workflow`**: Entidades estándar para los módulos principales de la app.
    *   *Relación Clave*: Ambos pertenecen a un `User` (Usuario).

### 1.2 El "Meta-Esquema" (Motor de Base de Datos Virtual)

Esta es la parte técnicamente más interesante de la app. En lugar de crear tablas SQL reales para cada base de datos de usuario (lo cual es riesgoso y difícil de escalar), implementamos un **patrón de Meta-Esquema**. Esto permite a los usuarios definir sus propias "tablas" y "campos", los cuales se almacenan en realidad como filas en nuestras tablas del sistema.

*   **`VirtualSchema` (La Base de Datos)**
    *   Representa una "Base de Datos" creada por el usuario.
    *   *Analogía*: Como un comando `CREATE DATABASE`, pero es solo una fila con un ID y nombre.
    *   *Relaciones*: Pertenece a `User`. Tiene muchos `VirtualTableSchema`.

*   **`VirtualTableSchema` (La Tabla)**
    *   Representa una "Tabla" dentro de la base de datos de un usuario.
    *   *Relaciones*: Pertenece a `VirtualSchema`. Tiene muchos `VirtualFieldSchema`.

*   **`VirtualFieldSchema` (La Columna)**
    *   Define la estructura de los datos: Nombre, Tipo (Texto, Número, Fecha) y validaciones (Requerido, Único).
    *   *Insight Clave*: Estas definiciones impulsan los inputs de la UI y la lógica de validación dinámicamente.

### 1.3 Estrategia de Almacenamiento de Datos: La Tabla `BusinessData`

En lugar de ejecutar dinámicamente `CREATE TABLE user_table_123 (...)`, almacenamos *todos* los registros de usuario en una única tabla altamente optimizada llamada **`BusinessData`**.

```sql
CREATE TABLE "BusinessData" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER REFERENCES "User"("id"),
  "virtual_table_schema_id" INTEGER REFERENCES "VirtualTableSchema"("id"),
  "data_json" JSONB, -- AQUÍ OCURRE LA MAGIA
  "creation_date" TIMESTAMP...
);
```

*   **¿Por qué JSONB?**: La columna `data_json` almacena el contenido real del registro (ej: `{"nombre": "Cliente A", "edad": 30}`).
    *   *Flexibilidad*: Los usuarios pueden agregar/quitar campos sin que necesitemos ejecutar migraciones de base de datos.
    *   *Rendimiento*: Postgres JSONB nos permite indexar claves específicas dentro del JSON si es necesario más adelante.
*   **¿Por qué no EAV (Entidad-Atributo-Valor)?**: EAV (almacenar cada campo como una fila tipo `row_id, field_id, value`) hace que las consultas sean increíblemente complejas y lentas (muchos JOINS). JSONB es el estándar moderno para este problema.

### 1.4 Flujo Entidad-Relación (ER)

1.  **Usuario** crea un **VirtualSchema** ("CRM").
2.  **Usuario** agrega un **VirtualTableSchema** ("Clientes").
3.  **Usuario** define filas de **VirtualFieldSchema** ("Nombre", "Email").
4.  **Usuario** ingresa datos. El sistema guarda una fila en **BusinessData**:
    *   `virtual_table_schema_id`: Apunta a "Clientes".
    *   `data_json`: `{"Nombre": "Alejo", "Email": "alejo@example.com"}`.

---

## 2. Análisis Profundo de la Funcionalidad: "Bases de Datos"

Esta funcionalidad permite a los usuarios construir sus propias estructuras de datos relacionales sin escribir código (Constructor de Bases de Datos No-Code).

### 2.1 Resumen Funcional
*   **Dashboard**: Lista todas las bases de datos virtuales.
*   **Editor de Esquema**: Interfaz visual para agregar tablas y campos.
*   **Grilla de Datos**: Vista tipo hoja de cálculo para Crear, Leer, Actualizar y Eliminar (CRUD) registros.

### 2.2 Implementación Técnica

#### Frontend (Next.js & React)
*   **Ruta**: `app/dashboard/databases/[id]/page.tsx`
*   **Manejo de Estado**: Usa `useState` para mantener la complejidad del esquema (objeto `database`) y los datos (array `businessData`).
*   **Renderizado Dinámico**:
    *   La pestaña "Datos" no tiene columnas hardcodeadas. Itera sobre `selectedTable.fields` para generar los encabezados `<TableHead>` y los inputs en el `<Dialog>`.
    *   *Concepto del Código*:
        ```javascript
        {selectedTable.fields.map(field => (
           <Input type={field.type} value={formData[field.name]} />
        ))}
        ```
*   **UI Optimista**: (Si aplica) La UI se actualiza inmediatamente mientras se guarda en el backend.

#### Backend (Rutas API)
*   **Endpoints**:
    *   `GET /api/virtual-schemas/[id]/tree`: Obtiene la BD + Tablas + Campos en una respuesta JSON anidada para reducir los viajes de red.
    *   `POST /api/business-data`: Recibe el `data_json` y el `virtual_table_schema_id`.
*   **Validación**: El backend debe (y lo hace) verificar que el JSON entrante coincida con los tipos definidos en `VirtualFieldSchema` antes de guardar (ej: verificar si un campo "número" realmente contiene un número).

### 2.3 Desafíos Clave Resueltos
1.  **Tipos Dinámicos**: Mapear tipos de input HTML (`text`, `number`, `date`) a valores JSON y viceversa.
2.  **Seguridad en Navegación**: El hook `useUnsavedChanges` (implementado vía `beforeunload` e intercepción del router) previene que los usuarios pierdan ediciones del esquema.

---

## 3. Análisis Profundo: "Formularios"

Los formularios son el punto de entrada de datos externo para las bases de datos del usuario. Permiten capturar información de clientes, empleados o encuestas y guardarla estructuradamente.

### 3.1 Resumen Funcional
*   **Constructor Visual**: Interfaz Drag & Drop para crear formularios.
*   **Mapeo de Datos**: Capacidad de conectar campos del formulario directamente a columnas en la Base de Datos virtual (Feature Clave).
*   **URL Pública**: Cada formulario tiene una URL única para compartir.

### 3.2 Implementación Técnica
*   **Esquema de Base de Datos**:
    *   `Form` (1) -> `FormField` (N): Define la estructura visual (etiqueta, tipo de input, orden).
    *   `DataConnection`: Tabla puente crítica. Vincula un `Form` con un `VirtualTableSchema`. Define "Cuando este formulario se envía, guarda en esta tabla".
*   **Flujo de Envío (`FormSubmission`)**:
    1.  El usuario envía el formulario.
    2.  El backend guarda el envío "crudo" en la tabla `FormSubmission` (como log de auditoría en JSONB).
    3.  **Disparador ETL (Extract, Transform, Load)**: Si existe una `DataConnection`, el sistema extrae los datos del envío, los transforma según el mapeo definido, y crea una fila en `BusinessData`.
    *   *Insight*: Esto desacopla la "recepción del formulario" del "almacenamiento en base de datos", permitiendo que un error en el guardado de la BD no pierda el envío original.

---

## 4. Análisis Profundo: "Flujos de Trabajo" (Workflows)

El motor de automatización que da vida a los datos estáticos.

### 4.1 Resumen Funcional
*   **Editor de Nodos**: Interfaz visual para conectar disparadores (Triggers) y acciones.
*   **Automatización**: "Cuando X pasa, haz Y". (Ej: Cuando llega un formulario, envía un email).

### 4.2 Implementación Técnica
*   **Estructura de Datos**:
    *   `Workflow` (Encabezado) -> `WorkflowStep` (Pasos).
    *   Los pasos pueden formar una lista enlazada o un Grafo Acíclico Dirigido (DAG), dependiendo de la complejidad (en nuestra versión actual, es secuencial con ramificaciones condicionales).
*   **Motor de Ejecución (`WorkflowEngine`)**:
    *   Implementado como una clase **Singleton** en `lib/workflow-engine.ts`.
    *   Maneja la cola de ejecución de forma asíncrona.
    *   **Persistencia de Estado**: Cada ejecución se registra en `WorkflowExecution` (o en `localStorage` para demos rápidas) con logs detallados paso a paso.
*   **Tipos de Pasos**:
    *   *Triggers*: Inician el flujo (ej: `form-submit`, `schedule`).
    *   *Acciones*: Efectos secundarios (ej: `send-email`, `update-database`).
    *   *Lógica*: Nodos de control (`condition` if/else, `delay`).

---

## 5. Análisis Profundo: "Soluciones"

Las Soluciones son "paquetes" o "plantillas" que agrupan bases de datos, formularios y flujos de trabajo para resolver un problema de negocio específico (ej: "CRM Completo", "Gestión de Inventario").

### 5.1 Resumen Funcional
*   **Instalación en un Clic**: El usuario selecciona una plantilla y el sistema crea todas las copias necesarias de las tablas, formularios y automatizaciones.
*   **Empaquetado**: Permite distribuir lógica de negocio compleja fácilmente.

### 5.2 Implementación Técnica
*   **Esquema de Empaquetado**:
    *   `Solution`: La entidad contenedora.
    *   `SolutionComponent`: Una tabla de asociación polimórfica.
        *   Campos: `solution_id`, `component_type` (ej: "workflow", "form"), `component_id`.
        *   *Por qué es útil*: Nos permite agrupar entidades heterogéneas bajo un mismo paraguas.
*   **Lógica de Clonado (Templating)**:
    *   Al "instalar" una solución, el backend ejecuta un script de clonado profundo:
        1.  Crea una nueva `Solution` para el usuario.
        2.  Itera sobre los componentes de la plantilla.
        3.  Clona cada `VirtualSchema`, `Form` y `Workflow`, reescribiendo las referencias internas (IDs) para que apunten a las nuevas copias del usuario, no a la plantilla original.

---

## 6. Expansión de Preguntas y Respuestas (Q&A)

**P6: ¿Qué sucede si borro un Formulario que es parte de una Solución instalada?**
*   **Respuesta**: El sistema está diseñado con integridad referencial laxa en la capa de aplicación para Soluciones. La solución simplemente mostrará que falta ese componente, pero no romperá la aplicación entera. Si usáramos `ON DELETE CASCADE` estricto en todo, borrar un ítem podría borrar toda la solución accidentalmente.

**P7: ¿Cómo evitas bucles infinitos en los flujos de trabajo (ej: El Workflow A dispara el B, y el B dispara el A)?**
*   **Respuesta**: El `WorkflowEngine` tiene límites de profundidad de ejecución y detección de ciclos. Además, los triggers suelen ser eventos externos (envío de formulario) más que eventos internos de "base de datos actualizada", lo que reduce el riesgo de recursión accidental.

**P8: ¿Cómo manejas la concurrencia si dos workflows intentan editar el mismo registro a la vez?**
*   **Respuesta**: Postgres maneja el bloqueo de filas (Row Locking) a nivel de base de datos. Si dos transacciones intentan escribir en la misma fila de `BusinessData`, una esperará a la otra. Dado que usamos una sola tabla grande, las transacciones son rápidas y atómicas.

**P9: ¿La conexión entre Formularios y Base de Datos es en tiempo real?**
*   **Respuesta**: Sí. Cuando se recibe el `POST` del formulario, el procesamiento es síncrono en la ruta de la API para asegurar que el usuario reciba confirmación de que sus datos se guardaron. Los efectos secundarios (emails, notificaciones) se pueden delegar al motor de workflows de forma asíncrona para no bloquear la respuesta UI.

---

## 7. Seguridad y Escalabilidad

Esta sección aborda cómo la aplicación protege los datos y planea crecer.

### 7.1 Estrategia de Seguridad
*   **Autenticación**: Gestionada por **Supabase Auth**, utilizando JWTs (JSON Web Tokens) seguros y de corta duración. No almacenamos contraseñas en texto plano.
*   **Autorización (La Defensa Principal)**: Utilizamos **Row Level Security (RLS)** de PostgreSQL.
    *   *Cómo funciona*: Cada tabla tiene políticas como `CREATE POLICY "Users can only see their own data" ON "BusinessData" FOR SELECT USING (auth.uid() = user_id);`.
    *   *Beneficio*: Es imposible que un bug en el frontend o en la API filtre datos de otros usuarios, porque la base de datos misma bloquea el acceso.
*   **Validación de Entrada**: Todas las rutas de API utilizan esquemas de validación (Zod) para sanitizar los datos antes de procesarlos, previniendo inyecciones y datos corruptos.
*   **Aislamiento de Datos**: Aunque usamos una arquitectura *multi-tenant* (todos los usuarios en las mismas tablas), el aislamiento lógico es estricto mediante la columna `user_id` obligatoria en todas las consultas.

### 7.2 Estrategia de Escalabilidad
*   **Escalado de Base de Datos**:
    1.  **Vertical**: Aumentar recursos del servidor de BD (CPU/RAM) es el primer paso.
    2.  **Horizontal (Lectura)**: Implementar Réplicas de Lectura para distribuir la carga de consultas `SELECT` pesadas (dashboards).
    3.  **Particionamiento (Sharding)**: La tabla `BusinessData` es la candidata principal para crecer masivamente. Podemos particionarla físicamente por rangos de `virtual_table_schema_id` o `user_id`, manteniendo el rendimiento de índices alto.
*   **Escalado de Backend**: Al usar **Next.js** en una arquitectura Serverless (o contenerizada), las funciones de API escalan automáticamente con el tráfico entrante, girando nuevas instancias según la demanda.
*   **Optimización**:
    *   **Caching**: Uso de React Query/SWR en el frontend para evitar peticiones repetitivas.
    *   **Indexación**: Índices estratégicos en columnas JSONB de uso frecuente.

---

## 8. Hoja de Ruta Futura (Roadmap)

Plan de evolución del producto para demostrar visión a largo plazo.

### Corto Plazo (v1.1 - Próximo mes)
*   **Corrección de Bugs y Pulido UI**: Mejorar la experiencia móvil y feedback visual.
*   **Más Integraciones**: Plantillas pre-construidas para Slack y Stripe en los workflows.

### Mediano Plazo (v2.0 - 6 meses)
*   **Claves Foráneas Virtuales**: Permitir que un campo en una tabla virtual "apunte" a otra tabla virtual, con validación de integridad referencial real.
*   **Colaboración en Tiempo Real**: Uso de WebSockets para que múltiples usuarios editen la misma base de datos simultáneamente (estilo Google Sheets).
*   **Integración de IA**: "Texto a Workflow" (Generar automatizaciones describiéndolas en lenguaje natural) o "Texto a SQL" para reportes avanzados.

### Largo Plazo (Enterprise - 1 año+)
*   **Self-Hosting**: Empaquetar la solución en Docker para clientes que requieren instalación en servidores propios (On-Premise).
*   **SSO (Single Sign-On)**: Integración con proveedores de identidad corporativos (Okta, Azure AD).
*   **Logs de Auditoría Avanzados**: Historial inmutable de quién cambió qué y cuándo para cumplimiento normativo (compliance).
