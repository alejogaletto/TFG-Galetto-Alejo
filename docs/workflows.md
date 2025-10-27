# Sistema de Workflows (Flujos de Trabajo Automatizados)

## 📋 Descripción General

El Sistema de Workflows es un motor de automatización que permite a los usuarios crear, configurar y ejecutar flujos de trabajo automatizados sin necesidad de programación. Los workflows responden a eventos específicos (triggers) y ejecutan acciones automatizadas como envío de emails, actualización de bases de datos, y más.

### ¿Qué son los Workflows?

Los workflows son secuencias de pasos automatizados que se ejecutan cuando ocurre un evento específico. Por ejemplo:
- Cuando un usuario envía un formulario → Guardar en base de datos → Enviar email de confirmación
- Cuando se crea un registro en una tabla → Enviar notificación por email al administrador
- Cuando se actualiza un pedido → Actualizar inventario → Notificar al cliente

### Arquitectura del Sistema

```
┌─────────────────┐
│     Trigger     │  (Evento que inicia el workflow)
│  - Formulario   │
│  - Base de Datos│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Workflow Step  │  (Pasos a ejecutar)
│  - Enviar Email │
│  - Actualizar BD│
│  - Condiciones  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Execution     │  (Registro de ejecución)
│  - Logs         │
│  - Estado       │
│  - Resultados   │
└─────────────────┘
```

## 🏗️ Componentes del Sistema

### 1. Workflow

Representa un flujo de trabajo completo con su configuración y pasos.

**Campos principales:**
```typescript
interface Workflow {
  id: number;
  user_id: number;
  name: string;                    // Nombre del workflow
  description?: string;            // Descripción opcional
  is_active: boolean;              // Si está activo o pausado
  configs?: any;                   // Configuración adicional
  creation_date: string;
  modification_date?: string;
}
```

**Estados:**
- `is_active: true` - El workflow se ejecutará cuando se active su trigger
- `is_active: false` - El workflow está pausado y no se ejecutará

### 2. WorkflowStep

Representa un paso individual dentro de un workflow (acción a ejecutar).

**Campos principales:**
```typescript
interface WorkflowStep {
  id: number;
  workflow_id: number;
  type: string;                    // 'send-email', 'update-database', 'condition', 'delay'
  name?: string;                   // Nombre del paso
  description?: string;            // Descripción del paso
  configs: any;                    // Configuración específica del paso
  position: number;                // Orden de ejecución
  creation_date: string;
}
```

**Tipos de pasos disponibles:**
- `send-email` - Enviar correo electrónico
- `update-database` - Crear/actualizar/eliminar registros en base de datos
- `condition` - Ejecutar lógica condicional
- `delay` - Esperar un tiempo específico

### 3. WorkflowTrigger

Define qué evento activará la ejecución de un workflow.

**Campos principales:**
```typescript
interface WorkflowTrigger {
  id: number;
  workflow_id: number;
  trigger_type: 'form_submission' | 'database_change';
  trigger_source_id: number;       // ID del formulario o tabla
  trigger_config?: {
    operations?: ['create', 'update', 'delete'];  // Para database_change
  };
  creation_date: string;
}
```

**Relaciones:**
- Un workflow puede tener **múltiples triggers**
- Un formulario/tabla puede estar asociado a **múltiples workflows**

### 4. WorkflowExecution

Registra cada ejecución de un workflow con sus logs y resultado.

**Campos principales:**
```typescript
interface WorkflowExecution {
  id: number;
  workflow_id: number;
  status: 'running' | 'completed' | 'failed';
  trigger_type?: string;
  trigger_data?: any;              // Datos del contexto que activó el workflow
  execution_logs?: string[];       // Logs de cada paso ejecutado
  error_message?: string;          // Mensaje de error si falló
  started_at: string;
  completed_at?: string;
}
```

## 🎯 Triggers (Desencadenadores)

### Form Submission (Envío de Formulario)

Se activa cuando un usuario envía un formulario específico.

**Configuración:**
```typescript
{
  trigger_type: 'form_submission',
  trigger_source_id: 123,  // ID del formulario
  trigger_config: {}       // Sin configuración adicional
}
```

**Contexto disponible para variables:**
```typescript
{
  trigger_type: 'form_submission',
  form_id: 123,
  submission_id: 456,
  form_data: {
    name: "Juan Pérez",
    email: "juan@example.com",
    phone: "555-1234",
    // ... todos los campos del formulario
  },
  // Campos del formulario también disponibles directamente:
  name: "Juan Pérez",
  email: "juan@example.com",
  phone: "555-1234"
}
```

**Cómo funciona:**
1. Usuario envía un formulario
2. Sistema guarda la respuesta en `FormSubmission` o `BusinessData`
3. Sistema busca workflows con `trigger_type: 'form_submission'` y `trigger_source_id` = ID del formulario
4. Ejecuta cada workflow encontrado con el contexto de la respuesta

**Ejemplo de uso:**
```
Formulario de Contacto (ID: 5)
  ↓
Usuario envía: { name: "María", email: "maria@example.com", mensaje: "Hola" }
  ↓
Se ejecutan workflows configurados para formulario ID: 5
  ↓
Paso 1: Guardar en base de datos de "Contactos"
Paso 2: Enviar email a admin@empresa.com
Paso 3: Enviar email de confirmación a {{email}}
```

### Database Change (Cambio en Base de Datos)

Se activa cuando se crea, actualiza o elimina un registro en una tabla específica.

**Configuración:**
```typescript
{
  trigger_type: 'database_change',
  trigger_source_id: 789,  // ID de la tabla (virtual_table_schema_id)
  trigger_config: {
    operations: ['create', 'update', 'delete']  // Qué operaciones activan el trigger
  }
}
```

**Contexto disponible para variables:**
```typescript
{
  trigger_type: 'database_change',
  table_id: 789,
  operation: 'create',  // o 'update' o 'delete'
  record_id: 456,
  record_data: {
    id: 456,
    name: "Producto X",
    price: 99.99,
    // ... todos los campos del registro
  },
  // Campos del registro también disponibles directamente:
  name: "Producto X",
  price: 99.99
}
```

**Operaciones disponibles:**
- `create` - Se crea un nuevo registro
- `update` - Se actualiza un registro existente
- `delete` - Se elimina un registro

**Ejemplo de uso:**
```
Tabla "Pedidos" (ID: 10)
  ↓
Se crea pedido: { id: 100, cliente: "Ana", total: 500, estado: "nuevo" }
  ↓
Se ejecutan workflows configurados para tabla ID: 10 con operation: 'create'
  ↓
Paso 1: Enviar email de confirmación a cliente
Paso 2: Notificar al equipo de ventas
Paso 3: Actualizar tabla de inventario
```

### Configuración de Triggers en el Builder

En el paso 2 del workflow builder, puedes:

1. **Añadir Trigger de Formulario:**
   - Seleccionar tipo: "Envío de Formulario"
   - Elegir el formulario específico
   - El workflow se ejecutará cada vez que se envíe ese formulario

2. **Añadir Trigger de Base de Datos:**
   - Seleccionar tipo: "Cambio en Base de Datos"
   - Elegir la tabla específica
   - Seleccionar operaciones: Crear, Actualizar, Eliminar (una o varias)
   - El workflow se ejecutará cuando ocurra una de esas operaciones

3. **Múltiples Triggers:**
   - Un workflow puede tener varios triggers
   - Por ejemplo: Activarse desde 2 formularios diferentes
   - O activarse cuando se crea O actualiza un registro

## ⚙️ Actions (Acciones)

### Enviar Email

Envía un correo electrónico utilizando SMTP configurado.

**Configuración:**
```typescript
{
  type: 'send-email',
  configs: {
    recipient: 'usuario@example.com',  // o '{{email}}' para variable dinámica
    subject: 'Asunto del correo',
    body: 'Hola {{name}}, gracias por tu mensaje.',
    from: 'empresa@example.com',       // Opcional (usa SMTP_FROM por defecto)
    cc: 'copia@example.com',           // Opcional
    bcc: 'copia-oculta@example.com',   // Opcional
    priority: 'normal'                 // 'high', 'normal', 'low'
  }
}
```

**Campos obligatorios:**
- `recipient` - Dirección de email del destinatario
- `subject` - Asunto del correo
- `body` - Contenido del correo (puede incluir HTML)

**Campos opcionales:**
- `from` - Dirección de email del remitente (ver limitaciones SMTP)
- `cc` - Con copia
- `bcc` - Con copia oculta
- `priority` - Prioridad del email

**Variables dinámicas:**
Puedes usar variables del contexto del trigger:
```
Hola {{name}},

Hemos recibido tu mensaje: "{{mensaje}}"

Te contactaremos a {{email}} pronto.

Fecha: {{date}}
Hora: {{time}}

Saludos,
Equipo de {{company}}
```

### Actualizar Base de Datos

Crea, actualiza o elimina registros en una base de datos.

**Configuración:**
```typescript
{
  type: 'update-database',
  configs: {
    databaseId: 123,           // ID de la tabla (virtual_table_schema_id)
    action: 'create',          // 'create', 'update', 'delete'
    mappings: [
      {
        source: 'name',        // Campo del contexto del trigger
        target: 'nombre'       // Campo en la base de datos
      },
      {
        source: 'email',
        target: 'correo'
      }
    ]
  }
}
```

**Acciones disponibles:**

1. **create** - Crear nuevo registro
   ```typescript
   {
     action: 'create',
     databaseId: 123,
     mappings: [
       { source: 'name', target: 'cliente_nombre' },
       { source: 'email', target: 'cliente_email' }
     ]
   }
   ```
   Resultado: Crea un nuevo registro con los datos mapeados

2. **update** - Actualizar registro existente
   ```typescript
   {
     action: 'update',
     databaseId: 123,
     mappings: [
       { source: 'status', target: 'estado' }
     ]
   }
   ```
   Nota: Requiere `record_id` en el contexto para identificar qué registro actualizar

3. **delete** - Eliminar registro
   ```typescript
   {
     action: 'delete',
     databaseId: 123
   }
   ```
   Nota: Requiere `record_id` en el contexto para identificar qué registro eliminar

### Condición

Ejecuta lógica condicional (funcionalidad planificada).

**Configuración futura:**
```typescript
{
  type: 'condition',
  configs: {
    field: 'total',
    operator: 'greater_than',
    value: 1000,
    then_steps: [/* pasos si es verdadero */],
    else_steps: [/* pasos si es falso */]
  }
}
```

### Delay (Retraso)

Espera un tiempo específico antes de continuar (funcionalidad planificada).

**Configuración futura:**
```typescript
{
  type: 'delay',
  configs: {
    duration: 3600,  // segundos
    unit: 'seconds'  // 'seconds', 'minutes', 'hours', 'days'
  }
}
```

## 🔤 Variables Dinámicas

### Sintaxis

Las variables dinámicas se escriben entre dobles llaves:
```
{{nombre_variable}}
```

### Variables Disponibles por Tipo de Trigger

#### Form Submission Trigger

Todas las variables del contexto están disponibles:
```typescript
// Variables del sistema
{{trigger_type}}      // 'form_submission'
{{form_id}}           // ID del formulario
{{submission_id}}     // ID de la respuesta

// Variables de los campos del formulario
{{name}}              // Valor del campo 'name'
{{email}}             // Valor del campo 'email'
{{phone}}             // Valor del campo 'phone'
{{mensaje}}           // Valor del campo 'mensaje'
// ... cualquier campo del formulario
```

#### Database Change Trigger

```typescript
// Variables del sistema
{{trigger_type}}      // 'database_change'
{{table_id}}          // ID de la tabla
{{operation}}         // 'create', 'update', 'delete'
{{record_id}}         // ID del registro

// Variables de los campos del registro
{{name}}              // Valor del campo 'name' del registro
{{price}}             // Valor del campo 'price' del registro
{{status}}            // Valor del campo 'status' del registro
// ... cualquier campo del registro
```

### Variables Especiales

El sistema también proporciona variables especiales:

```typescript
{{date}}              // Fecha actual: "26/10/2025"
{{time}}              // Hora actual: "14:30:45"
{{datetime}}          // Fecha y hora: "26/10/2025, 14:30:45"
{{company}}           // Nombre de la empresa: "AutomateSMB"
```

### Variables Anidadas

Puedes acceder a propiedades anidadas usando punto:

```typescript
{{form_data.name}}           // Acceder a form_data.name
{{record_data.user.email}}   // Acceder a propiedades anidadas
```

### Ejemplos de Uso

**Email de confirmación de formulario:**
```
Asunto: Hemos recibido tu mensaje, {{name}}

Cuerpo:
Hola {{name}},

Gracias por contactarnos. Hemos recibido tu mensaje:

"{{mensaje}}"

Nos pondremos en contacto contigo en {{email}} a la brevedad.

Fecha de recepción: {{date}} a las {{time}}

Saludos,
{{company}}
```

**Notificación de nuevo pedido:**
```
Asunto: Nuevo pedido #{{record_id}} - {{cliente_nombre}}

Cuerpo:
Se ha creado un nuevo pedido:

Pedido #{{record_id}}
Cliente: {{cliente_nombre}}
Email: {{cliente_email}}
Total: ${{total}}
Estado: {{estado}}

Fecha: {{datetime}}
```

**Email con variables de actualización:**
```
Asunto: Tu pedido ha sido actualizado

Cuerpo:
Hola {{cliente_nombre}},

Tu pedido #{{record_id}} ha sido actualizado:

Estado anterior: {{old_status}}
Estado nuevo: {{status}}

Actualizado el: {{datetime}}
```

## 📧 Configuración de Email

### Requisitos SMTP (Gmail)

Para enviar emails desde workflows, necesitas configurar SMTP con Gmail.

#### Paso 1: Habilitar Verificación en 2 Pasos

1. Ve a tu [Cuenta de Google](https://myaccount.google.com/)
2. Navega a **Seguridad**
3. Habilita **Verificación en 2 pasos** (requerido para App Passwords)

#### Paso 2: Generar App Password

1. En Seguridad, busca **Contraseñas de aplicación**
2. Selecciona **Correo** como la aplicación
3. Selecciona el dispositivo o escribe un nombre personalizado
4. Haz clic en **Generar**
5. Copia la contraseña de 16 caracteres que aparece

#### Paso 3: Configurar Variables de Entorno

Crea o actualiza el archivo `.env.local` en la raíz del proyecto:

```env
# Email Configuration (SMTP - Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # App Password de 16 caracteres
SMTP_FROM=tu-email@gmail.com
```

**Notas importantes:**
- Usa tu email de Gmail completo en `SMTP_USER` y `SMTP_FROM`
- La `SMTP_PASS` debe ser la **App Password**, NO tu contraseña de Gmail normal
- El puerto `587` usa STARTTLS (seguro)
- Reinicia el servidor después de actualizar `.env.local`

### Variables de Entorno Necesarias

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `SMTP_HOST` | Servidor SMTP | `smtp.gmail.com` |
| `SMTP_PORT` | Puerto SMTP | `587` |
| `SMTP_USER` | Usuario (email completo) | `empresa@gmail.com` |
| `SMTP_PASS` | App Password de Gmail | `abcd efgh ijkl mnop` |
| `SMTP_FROM` | Email remitente por defecto | `empresa@gmail.com` |

### Campos Disponibles en Email Step

Cuando configuras un paso de "Enviar Email" en el workflow builder:

| Campo | Obligatorio | Descripción | Ejemplo |
|-------|-------------|-------------|---------|
| `recipient` | ✅ Sí | Email del destinatario | `usuario@example.com` o `{{email}}` |
| `subject` | ✅ Sí | Asunto del correo | `Gracias por tu mensaje` |
| `body` | ✅ Sí | Contenido del correo | `Hola {{name}}, ...` |
| `from` | ❌ No | Email del remitente | `empresa@gmail.com` |
| `cc` | ❌ No | Con copia | `gerente@empresa.com` |
| `bcc` | ❌ No | Con copia oculta | `archivo@empresa.com` |
| `priority` | ❌ No | Prioridad del email | `high`, `normal`, `low` |

### Limitaciones del Campo "from" en SMTP

**⚠️ Importante:** Cuando usas SMTP, el campo "from" tiene limitaciones de seguridad:

1. **Restricción de Gmail:**
   - Gmail solo permite enviar emails desde la dirección que está autenticada
   - Si intentas usar un "from" diferente a `SMTP_USER`, puede ser rechazado o reemplazado
   - Gmail puede agregar "en nombre de" al remitente

2. **Comportamiento:**
   ```typescript
   // Configurado en .env.local
   SMTP_USER=empresa@gmail.com
   
   // En el workflow
   from: 'ventas@empresa.com'  // ⚠️ Puede no funcionar como esperas
   
   // El email se enviará desde:
   // empresa@gmail.com en nombre de ventas@empresa.com
   ```

3. **Recomendación:**
   - Para entorno de desarrollo o uso personal: Usa el mismo email en `from` que en `SMTP_USER`
   - Para entorno de producción multi-tenant: Ver [Multi-Tenant Email Setup](./multi-tenant-email-setup.md)

4. **Alternativas:**
   - Omitir el campo `from` - usará `SMTP_FROM` automáticamente
   - Usar servicios como Resend, SendGrid o AWS SES que soportan múltiples dominios verificados

## 🚀 Ejecución de Workflows

### Flujo de Ejecución Completo

```
1. TRIGGER DETECTADO
   ↓
2. BUSCAR WORKFLOWS ASOCIADOS
   | - Buscar por trigger_type y trigger_source_id
   | - Verificar que is_active = true
   | - Obtener todos los WorkflowSteps ordenados por position
   ↓
3. CREAR REGISTRO DE EJECUCIÓN
   | - Crear WorkflowExecution con status='running'
   | - Inicializar execution_logs[]
   | - Registrar started_at
   ↓
4. PREPARAR CONTEXTO
   | - Recopilar datos del trigger (form_data o record_data)
   | - Aplanar datos para fácil acceso a variables
   | - Agregar metadatos (trigger_type, ids, operation, etc.)
   ↓
5. EJECUTAR PASOS SECUENCIALMENTE
   | Para cada WorkflowStep:
   |   ↓
   |   5.1. LOG: "Executing step N: [type]"
   |   ↓
   |   5.2. PROCESAR VARIABLES
   |        - Reemplazar {{variable}} con valores del contexto
   |        - Aplicar variables especiales ({{date}}, {{time}}, etc.)
   |   ↓
   |   5.3. EJECUTAR ACCIÓN
   |        - send-email: Enviar email vía SMTP
   |        - update-database: Crear/actualizar/eliminar registro
   |        - condition: Evaluar condición (futuro)
   |        - delay: Esperar tiempo especificado (futuro)
   |   ↓
   |   5.4. LOG RESULTADO
   |        - Si éxito: "Email sent successfully"
   |        - Si error: Lanzar excepción
   ↓
6. FINALIZAR EJECUCIÓN
   | - Si todos los pasos exitosos:
   |     status = 'completed'
   | - Si algún paso falló:
   |     status = 'failed'
   |     error_message = detalles del error
   | - Registrar completed_at
   | - Actualizar WorkflowExecution en base de datos
   ↓
7. RESULTADO FINAL
   - Retornar WorkflowExecutionResult
   - Continuar con el flujo principal (no bloquear form submission)
```

### Manejo de Errores

El sistema maneja errores de forma robusta:

1. **Error en un paso:**
   - Se detiene la ejecución del workflow
   - Se marca como `status: 'failed'`
   - Se guarda el mensaje de error en `error_message`
   - Los logs muestran hasta qué paso se ejecutó

2. **Error en envío de email:**
   ```
   Logs:
   [1] Starting workflow: Confirmación de Contacto
   [2] Executing step 1: send-email
   [3] Sending email to: usuario@example.com
   [4] Subject: Gracias por tu mensaje
   [ERROR] Failed to send email: Connection timeout
   
   Status: failed
   Error: Failed to send email
   ```

3. **Error en actualización de BD:**
   ```
   Logs:
   [1] Starting workflow: Guardar Contacto
   [2] Executing step 1: update-database
   [3] Updating database: 123 with action: create
   [ERROR] Failed to perform database action: Field 'email' is required
   
   Status: failed
   Error: Failed to perform database action: Field 'email' is required
   ```

4. **Comportamiento no-bloqueante:**
   - Si un workflow falla, **NO afecta** la operación principal
   - Ejemplo: Si falla el email, el formulario se guarda igual
   - Los workflows se ejecutan en modo "best-effort"

### Estados de Ejecución

| Estado | Descripción | Cuándo ocurre |
|--------|-------------|---------------|
| `running` | En ejecución | Workflow está ejecutando pasos activamente |
| `completed` | Completado | Todos los pasos se ejecutaron exitosamente |
| `failed` | Fallido | Algún paso falló durante la ejecución |

### Logs de Ejecución

Los logs registran cada paso del workflow:

```typescript
execution_logs: [
  "Starting workflow: Confirmación de Contacto",
  "Executing step 1: send-email",
  "Sending email to: juan@example.com",
  "Subject: Gracias por contactarnos",
  "Email sent successfully",
  "Executing step 2: update-database",
  "Updating database: 456 with action: create",
  "Database action 'create' completed successfully",
  "Workflow completed successfully"
]
```

**Usos de los logs:**
- Depuración de workflows
- Auditoría de operaciones
- Análisis de rendimiento
- Identificación de errores

## 🔌 API Endpoints

### Workflows

#### POST /api/workflows
Crear un nuevo workflow.

**Request:**
```typescript
{
  user_id: 1,
  name: "Confirmación de Contacto",
  description: "Envía email cuando alguien envía el formulario de contacto",
  is_active: true,
  configs: {}
}
```

**Response:**
```typescript
{
  id: 123,
  user_id: 1,
  name: "Confirmación de Contacto",
  description: "Envía email cuando alguien envía el formulario de contacto",
  is_active: true,
  configs: {},
  creation_date: "2025-10-26T10:00:00Z"
}
```

#### GET /api/workflows
Listar todos los workflows del usuario.

**Query params:**
- `user_id` (opcional) - Filtrar por usuario

**Response:**
```typescript
[
  {
    id: 123,
    user_id: 1,
    name: "Confirmación de Contacto",
    is_active: true,
    creation_date: "2025-10-26T10:00:00Z"
  },
  // ... más workflows
]
```

#### GET /api/workflows/[id]
Obtener un workflow específico.

**Query params:**
- `includeSteps` (opcional) - Incluir los pasos del workflow

**Response:**
```typescript
{
  id: 123,
  name: "Confirmación de Contacto",
  is_active: true,
  steps: [  // Si includeSteps=true
    {
      id: 1,
      type: "send-email",
      configs: { /* ... */ },
      position: 1
    }
  ]
}
```

#### PUT /api/workflows/[id]
Actualizar un workflow existente.

**Request:**
```typescript
{
  name: "Confirmación de Contacto Actualizado",
  is_active: false
}
```

#### DELETE /api/workflows/[id]
Eliminar un workflow (y sus pasos y triggers asociados).

### Workflow Steps

#### POST /api/workflow-steps
Crear un paso de workflow.

**Request:**
```typescript
{
  workflow_id: 123,
  type: "send-email",
  name: "Enviar Confirmación",
  description: "Email de agradecimiento al usuario",
  configs: {
    recipient: "{{email}}",
    subject: "Gracias por contactarnos",
    body: "Hola {{name}}, hemos recibido tu mensaje."
  },
  position: 1
}
```

#### GET /api/workflow-steps?workflow_id=123
Obtener pasos de un workflow.

### Workflow Triggers

#### POST /api/workflow-triggers
Crear un trigger para un workflow.

**Request (Form Submission):**
```typescript
{
  workflow_id: 123,
  trigger_type: "form_submission",
  trigger_source_id: 456,  // form_id
  trigger_config: {}
}
```

**Request (Database Change):**
```typescript
{
  workflow_id: 123,
  trigger_type: "database_change",
  trigger_source_id: 789,  // virtual_table_schema_id
  trigger_config: {
    operations: ["create", "update"]
  }
}
```

**Response:**
```typescript
{
  id: 1,
  workflow_id: 123,
  trigger_type: "form_submission",
  trigger_source_id: 456,
  trigger_config: {},
  creation_date: "2025-10-26T10:00:00Z"
}
```

#### GET /api/workflow-triggers?workflow_id=123
Obtener triggers de un workflow.

**Response:**
```typescript
[
  {
    id: 1,
    workflow_id: 123,
    trigger_type: "form_submission",
    trigger_source_id: 456,
    trigger_config: {}
  }
]
```

#### DELETE /api/workflow-triggers/[id]
Eliminar un trigger.

### Workflow Execution

#### POST /api/workflows/execute
Ejecutar un workflow manualmente (para pruebas).

**Request:**
```typescript
{
  workflow_id: 123,
  trigger_data: {
    // Datos de prueba
    name: "Usuario de Prueba",
    email: "prueba@example.com",
    mensaje: "Este es un test"
  }
}
```

**Response:**
```typescript
{
  success: true,
  executionId: 789,
  logs: [
    "Starting workflow: Confirmación de Contacto",
    "Executing step 1: send-email",
    "Sending email to: prueba@example.com",
    "Email sent successfully",
    "Workflow completed successfully"
  ]
}
```

## 💡 Ejemplos de Uso

### Ejemplo 1: Formulario → Email → Base de Datos

**Escenario:** Formulario de contacto que guarda en BD y envía email de confirmación.

**Configuración:**

1. **Crear Workflow:**
```typescript
POST /api/workflows
{
  name: "Proceso de Contacto",
  is_active: true
}
```

2. **Configurar Trigger:**
```typescript
POST /api/workflow-triggers
{
  workflow_id: 1,
  trigger_type: "form_submission",
  trigger_source_id: 5  // ID del formulario de contacto
}
```

3. **Paso 1: Guardar en BD:**
```typescript
POST /api/workflow-steps
{
  workflow_id: 1,
  type: "update-database",
  position: 1,
  configs: {
    databaseId: 10,  // Tabla "Contactos"
    action: "create",
    mappings: [
      { source: "name", target: "nombre" },
      { source: "email", target: "correo" },
      { source: "mensaje", target: "mensaje" }
    ]
  }
}
```

4. **Paso 2: Email al Usuario:**
```typescript
POST /api/workflow-steps
{
  workflow_id: 1,
  type: "send-email",
  position: 2,
  configs: {
    recipient: "{{email}}",
    subject: "Gracias por contactarnos",
    body: "Hola {{name}},\n\nHemos recibido tu mensaje y te responderemos pronto.\n\nSaludos,\nEquipo AutomateSMB"
  }
}
```

5. **Paso 3: Email al Admin:**
```typescript
POST /api/workflow-steps
{
  workflow_id: 1,
  type: "send-email",
  position: 3,
  configs: {
    recipient: "admin@empresa.com",
    subject: "Nuevo mensaje de contacto - {{name}}",
    body: "Nuevo mensaje de:\n\nNombre: {{name}}\nEmail: {{email}}\nMensaje: {{mensaje}}\n\nFecha: {{datetime}}"
  }
}
```

**Resultado:**
- Usuario envía formulario
- Se guarda en tabla "Contactos"
- Usuario recibe email de confirmación
- Admin recibe notificación con los datos

### Ejemplo 2: Cambio en BD → Notificación por Email

**Escenario:** Cuando se crea un pedido, notificar al equipo de ventas.

**Configuración:**

1. **Crear Workflow:**
```typescript
POST /api/workflows
{
  name: "Notificación de Nuevo Pedido",
  is_active: true
}
```

2. **Configurar Trigger:**
```typescript
POST /api/workflow-triggers
{
  workflow_id: 2,
  trigger_type: "database_change",
  trigger_source_id: 15,  // ID tabla "Pedidos"
  trigger_config: {
    operations: ["create"]  // Solo cuando se crea
  }
}
```

3. **Paso 1: Enviar Email:**
```typescript
POST /api/workflow-steps
{
  workflow_id: 2,
  type: "send-email",
  position: 1,
  configs: {
    recipient: "ventas@empresa.com",
    subject: "Nuevo Pedido #{{record_id}} - {{cliente_nombre}}",
    body: "Se ha creado un nuevo pedido:\n\nPedido: #{{record_id}}\nCliente: {{cliente_nombre}}\nEmail: {{cliente_email}}\nTotal: ${{total}}\nEstado: {{estado}}\n\nFecha: {{datetime}}"
  }
}
```

**Resultado:**
- Se crea un registro en tabla "Pedidos"
- El equipo de ventas recibe email inmediatamente con los detalles

### Ejemplo 3: Uso Avanzado de Variables Dinámicas

**Email personalizado con múltiples variables:**

```typescript
{
  type: "send-email",
  configs: {
    recipient: "{{email}}",
    subject: "Estado de tu Pedido #{{order_id}}",
    body: `
      Hola {{customer_name}},

      Tu pedido #{{order_id}} ha sido actualizado:

      Detalles del Pedido:
      ----------------------
      Producto: {{product_name}}
      Cantidad: {{quantity}}
      Precio unitario: ${{unit_price}}
      Total: ${{total}}
      
      Estado actual: {{status}}
      Fecha de pedido: {{order_date}}
      Fecha estimada de entrega: {{estimated_delivery}}

      Información de envío:
      ----------------------
      Dirección: {{shipping_address}}
      Ciudad: {{shipping_city}}
      Código postal: {{shipping_zip}}

      Puedes rastrear tu pedido en: https://empresa.com/pedidos/{{order_id}}

      Si tienes preguntas, responde a este email o llámanos.

      Actualizado el {{datetime}}

      Saludos,
      {{company}}
    `
  }
}
```

## 🗄️ Schema de Base de Datos

### Tabla: Workflow

```sql
CREATE TABLE "Workflow" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "is_active" BOOLEAN DEFAULT true,
  "configs" JSONB,
  "creation_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "modification_date" TIMESTAMP
);
```

**Relaciones:**
- `user_id` → Usuario propietario del workflow
- Uno-a-muchos con `WorkflowStep`
- Uno-a-muchos con `WorkflowTrigger`
- Uno-a-muchos con `WorkflowExecution`

### Tabla: WorkflowStep

```sql
CREATE TABLE "WorkflowStep" (
  "id" SERIAL PRIMARY KEY,
  "workflow_id" INTEGER REFERENCES "Workflow"("id") ON DELETE CASCADE,
  "type" VARCHAR(50) NOT NULL,
  "name" VARCHAR(255),
  "description" TEXT,
  "configs" JSONB NOT NULL,
  "position" INTEGER NOT NULL,
  "creation_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Relaciones:**
- `workflow_id` → Workflow al que pertenece el paso
- Se eliminan automáticamente si se elimina el workflow (CASCADE)

**Índices importantes:**
```sql
CREATE INDEX idx_workflow_step_workflow ON "WorkflowStep"("workflow_id");
CREATE INDEX idx_workflow_step_position ON "WorkflowStep"("position");
```

### Tabla: WorkflowTrigger

```sql
CREATE TABLE "WorkflowTrigger" (
  "id" SERIAL PRIMARY KEY,
  "workflow_id" INTEGER REFERENCES "Workflow"("id") ON DELETE CASCADE,
  "trigger_type" VARCHAR(50) NOT NULL,
  "trigger_source_id" INTEGER NOT NULL,
  "trigger_config" JSONB,
  "creation_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Relaciones:**
- `workflow_id` → Workflow que se activará
- `trigger_source_id` → ID del formulario (Form) o tabla (VirtualTableSchema)
- Se eliminan automáticamente si se elimina el workflow (CASCADE)

**Índices importantes:**
```sql
CREATE INDEX idx_workflow_trigger_type_source ON "WorkflowTrigger"("trigger_type", "trigger_source_id");
CREATE INDEX idx_workflow_trigger_workflow ON "WorkflowTrigger"("workflow_id");
```

### Tabla: WorkflowExecution

```sql
CREATE TABLE "WorkflowExecution" (
  "id" SERIAL PRIMARY KEY,
  "workflow_id" INTEGER REFERENCES "Workflow"("id") ON DELETE CASCADE,
  "status" VARCHAR(50) NOT NULL,
  "trigger_type" VARCHAR(50),
  "trigger_data" JSONB,
  "execution_logs" TEXT[],
  "error_message" TEXT,
  "started_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "completed_at" TIMESTAMP
);
```

**Relaciones:**
- `workflow_id` → Workflow que fue ejecutado
- Se eliminan automáticamente si se elimina el workflow (CASCADE)

**Índices importantes:**
```sql
CREATE INDEX idx_workflow_execution_workflow ON "WorkflowExecution"("workflow_id");
CREATE INDEX idx_workflow_execution_status ON "WorkflowExecution"("status");
CREATE INDEX idx_workflow_execution_started ON "WorkflowExecution"("started_at");
```

### Diagrama de Relaciones

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │
       │ 1:N
       │
┌──────▼──────┐         ┌──────────────────┐
│  Workflow   │◄────────┤ WorkflowTrigger  │
└──────┬──────┘   1:N   │                  │
       │                │ trigger_source_id├──┐
       │ 1:N            └──────────────────┘  │
       │                                      │ Referencias a:
┌──────▼──────┐         ┌──────────────────┐  │ - Form
│WorkflowStep │         │WorkflowExecution │  │ - VirtualTableSchema
└─────────────┘         └──────────────────┘  │
                                              └──┐
┌─────────────┐         ┌───────────────────────▼┐
│    Form     │         │  VirtualTableSchema    │
└─────────────┘         └────────────────────────┘
```

## 🔧 Integración en Otras Partes del Sistema

### Form Submissions

Cuando se envía un formulario, el sistema automáticamente:

1. Guarda la respuesta en `FormSubmission` o `BusinessData`
2. Busca workflows con triggers de tipo `form_submission` para ese formulario
3. Ejecuta cada workflow encontrado con el contexto de la respuesta

**Código relevante:** `app/api/form-submissions/route.ts`

### Business Data Operations

Cuando se crea, actualiza o elimina un registro en BusinessData:

1. Se realiza la operación en la base de datos
2. Se buscan workflows con triggers de tipo `database_change` para esa tabla
3. Se ejecutan workflows que coincidan con la operación (create/update/delete)

**Código relevante:** 
- `app/api/business-data/route.ts` (CREATE)
- `app/api/business-data/[id]/route.ts` (UPDATE, DELETE)

## 📚 Recursos Adicionales

### Documentación Relacionada

- [Form-Database Connection](./form-database-connection.md) - Sistema de conexión de formularios a bases de datos
- [Multi-Tenant Email Setup](./multi-tenant-email-setup.md) - Guía para implementar emails multi-tenant
- [Database Builder](./database-builder.md) - Constructor de bases de datos virtuales
- [API Endpoints](./api-endpoints.md) - Documentación completa de la API

### Archivos de Código Relevantes

- `lib/workflow-execution-service.ts` - Servicio de ejecución de workflows
- `lib/workflow-trigger-service.ts` - Servicio de detección de triggers
- `lib/email-service.ts` - Servicio de envío de emails SMTP
- `app/dashboard/workflows/create/page.tsx` - Builder visual de workflows
- `app/api/workflows/` - Endpoints de la API de workflows

### Próximas Mejoras

- ✅ Triggers de formulario y base de datos
- ✅ Acciones de email y actualización de BD
- ✅ Variables dinámicas
- ⏳ Lógica condicional (if/else)
- ⏳ Delays programados
- ⏳ Triggers de calendario (schedule)
- ⏳ Integraciones con servicios externos (Slack, Google Drive, etc.)
- ⏳ Workflow branches (bifurcaciones)
- ⏳ Multi-tenant email con Resend

---

**Última actualización:** Octubre 2025  
**Versión:** 2.0.0  
**Autor:** Alejo Galetto

