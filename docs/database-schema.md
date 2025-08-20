# Esquema de Base de Datos

## Visión General

El sistema utiliza PostgreSQL con Supabase y está diseñado para manejar formularios dinámicos, esquemas virtuales de bases de datos, flujos de trabajo y almacenamiento inteligente de datos.

## Constructor de Base de Datos (Database Builder)

Para información completa sobre el Constructor de Base de Datos, consulta la documentación dedicada:

**[📚 Constructor de Base de Datos](./database-builder.md)**

### Resumen de Funcionalidad
- **Creación visual** de esquemas virtuales de base de datos
- **Plantillas predefinidas** (Clientes, Productos, Pedidos, Tareas)
- **Wizard de 4 pasos** para configuración intuitiva
- **Integración automática** con el sistema de formularios
- **Simulación de bases de datos reales** sin conocimientos técnicos

### APIs Relacionadas
- `POST /api/virtual-schemas` - Crear esquema virtual
- `POST /api/virtual-table-schemas` - Crear tabla virtual  
- `POST /api/virtual-field-schemas` - Crear campo virtual
- `GET /api/virtual-schemas?includeTree=true` - Obtener esquema completo

## Tablas Principales

### 1. Usuarios (User)
```sql
CREATE TABLE "User" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  configs JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Propósito**: Almacena información de usuarios autenticados
**Características**: 
- Contraseñas hasheadas con bcrypt
- Configuraciones flexibles en JSONB
- Email único para autenticación

### 2. Formularios (Form)
```sql
CREATE TABLE "Form" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  user_id INTEGER REFERENCES "User"(id) ON DELETE CASCADE,
  configs JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Propósito**: Define formularios creados por usuarios
**Relaciones**: Un usuario puede tener múltiples formularios

### 3. Campos de Formulario (FormField)
```sql
CREATE TABLE "FormField" (
  id SERIAL PRIMARY KEY,
  form_id INTEGER REFERENCES "Form"(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  configs JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Propósito**: Define campos individuales de cada formulario
**Tipos de Campo**: text, email, number, select, checkbox, etc.
**Configuraciones**: Validaciones, opciones, estilos en JSONB

### 4. Esquemas Virtuales (VirtualSchema)
```sql
CREATE TABLE "VirtualSchema" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  user_id INTEGER REFERENCES "User"(id) ON DELETE CASCADE,
  configs JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Propósito**: Simula bases de datos creadas por usuarios
**Relaciones**: Un usuario puede tener múltiples esquemas virtuales
**Configuraciones**: Tipo de base de datos, modo avanzado, método de creación

### 5. Tablas Virtuales (VirtualTableSchema)
```sql
CREATE TABLE "VirtualTableSchema" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  virtual_schema_id INTEGER REFERENCES "VirtualSchema"(id) ON DELETE CASCADE,
  configs JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Propósito**: Define tablas dentro de esquemas virtuales
**Configuraciones**: Propiedades de tabla, índices, restricciones, conteo de campos

### 6. Campos Virtuales (VirtualFieldSchema)
```sql
CREATE TABLE "VirtualFieldSchema" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  virtual_table_schema_id INTEGER REFERENCES "VirtualTableSchema"(id) ON DELETE CASCADE,
  configs JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Propósito**: Define campos de tablas virtuales
**Tipos**: text, integer, boolean, date, jsonb, etc.
**Configuraciones**: Restricciones, valores por defecto, validaciones, campo primario

### 7. Conexiones de Datos (DataConnection)
```sql
CREATE TABLE "DataConnection" (
  id SERIAL PRIMARY KEY,
  form_id INTEGER REFERENCES "Form"(id) ON DELETE CASCADE,
  virtual_schema_id INTEGER REFERENCES "VirtualSchema"(id) ON DELETE CASCADE,
  configs JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Propósito**: Vincula formularios con esquemas virtuales
**Relaciones**: Conecta formularios con bases de datos de destino

### 8. Mapeo de Campos (FieldMapping)
```sql
CREATE TABLE "FieldMapping" (
  id SERIAL PRIMARY KEY,
  form_field_id INTEGER REFERENCES "FormField"(id) ON DELETE CASCADE,
  virtual_field_schema_id INTEGER REFERENCES "VirtualFieldSchema"(id) ON DELETE CASCADE,
  data_connection_id INTEGER REFERENCES "DataConnection"(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Propósito**: Mapea campos de formulario a campos de base de datos
**Relaciones**: Define la transformación de datos entre formulario y BD

### 9. Datos Empresariales (BusinessData)
```sql
CREATE TABLE "BusinessData" (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES "User"(id) ON DELETE CASCADE,
  virtual_schema_id INTEGER REFERENCES "VirtualSchema"(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Propósito**: Almacena datos de formularios conectados a bases de datos
**Estructura**: JSONB con datos mapeados según FieldMapping

### 10. Envíos de Formulario (FormSubmission)
```sql
CREATE TABLE "FormSubmission" (
  id SERIAL PRIMARY KEY,
  form_id INTEGER REFERENCES "Form"(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  submitted_at TIMESTAMP DEFAULT NOW()
);
```

**Propósito**: Almacena datos de formularios sin conexión de BD
**Estructura**: JSONB genérico con todos los datos del formulario

### 11. Flujos de Trabajo (Workflow)
```sql
CREATE TABLE "Workflow" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  user_id INTEGER REFERENCES "User"(id) ON DELETE CASCADE,
  configs JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Propósito**: Define flujos de trabajo automatizados
**Configuraciones**: Triggers, condiciones, notificaciones

### 12. Pasos del Flujo (WorkflowStep)
```sql
CREATE TABLE "WorkflowStep" (
  id SERIAL PRIMARY KEY,
  workflow_id INTEGER REFERENCES "Workflow"(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  position INTEGER NOT NULL,
  configs JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Propósito**: Define pasos individuales dentro de flujos de trabajo
**Tipos**: email, webhook, database, condition, delay
**Posición**: Orden de ejecución de los pasos

## Relaciones y Restricciones

### Jerarquía de Eliminación en Cascada
```sql
-- Usuario eliminado → Elimina formularios, esquemas, flujos
User → Form (CASCADE)
User → VirtualSchema (CASCADE)
User → Workflow (CASCADE)

-- Formulario eliminado → Elimina campos y conexiones
Form → FormField (CASCADE)
Form → DataConnection (CASCADE)

-- Esquema eliminado → Elimina tablas
VirtualSchema → VirtualTableSchema (CASCADE)

-- Tabla eliminada → Elimina campos
VirtualTableSchema → VirtualFieldSchema (CASCADE)

-- Conexión eliminada → Elimina mapeos
DataConnection → FieldMapping (CASCADE)

-- Flujo eliminado → Elimina pasos
Workflow → WorkflowStep (CASCADE)
```

### Relaciones Múltiples
- **Usuario → Múltiples Esquemas**: Un usuario puede crear varias "bases de datos"
- **Formulario → Múltiples Campos**: Cada formulario tiene múltiples campos
- **Esquema → Múltiples Tablas**: Cada esquema puede tener varias tablas
- **Tabla → Múltiples Campos**: Cada tabla puede tener varios campos
- **Flujo → Múltiples Pasos**: Cada flujo de trabajo tiene varios pasos

## Tipos de Datos JSONB

### FormField.configs
```json
{
  "required": true,
  "maxLength": 100,
  "minLength": 3,
  "pattern": "^[a-zA-Z]+$",
  "placeholder": "Ingrese su nombre",
  "options": ["opción1", "opción2"],
  "validation": {
    "type": "email",
    "message": "Email inválido"
  }
}
```

### VirtualFieldSchema.configs
```json
{
  "nullable": false,
  "default": "valor_por_defecto",
  "unique": true,
  "index": true,
  "constraints": {
    "min": 0,
    "max": 100
  }
}
```

### WorkflowStep.configs
```json
{
  "email": {
    "to": "usuario@empresa.com",
    "subject": "Notificación",
    "template": "email_template_id"
  },
  "webhook": {
    "url": "https://api.externa.com/webhook",
    "method": "POST",
    "headers": {"Authorization": "Bearer token"}
  },
  "condition": {
    "field": "status",
    "operator": "equals",
    "value": "approved"
  }
}
```

## Índices Recomendados

```sql
-- Búsquedas por usuario
CREATE INDEX idx_form_user_id ON "Form"(user_id);
CREATE INDEX idx_virtual_schema_user_id ON "VirtualSchema"(user_id);
CREATE INDEX idx_workflow_user_id ON "Workflow"(user_id);

-- Búsquedas por formulario
CREATE INDEX idx_form_field_form_id ON "FormField"(form_id);
CREATE INDEX idx_data_connection_form_id ON "DataConnection"(form_id);

-- Búsquedas por esquema
CREATE INDEX idx_virtual_table_schema_virtual_schema_id ON "VirtualTableSchema"(virtual_schema_id);
CREATE INDEX idx_virtual_field_schema_virtual_table_schema_id ON "VirtualFieldSchema"(virtual_table_schema_id);

-- Búsquedas por flujo
CREATE INDEX idx_workflow_step_workflow_id ON "WorkflowStep"(workflow_id);

-- Búsquedas por email (usuarios)
CREATE INDEX idx_user_email ON "User"(email);
```

## Consideraciones de Rendimiento

### Consultas Optimizadas
- **Árbol de Esquemas**: Uso de `includeTree=true` para obtener datos anidados
- **Árbol de Flujos**: Uso de `includeSteps=true` para pasos anidados
- **Mapeo de Campos**: Consultas eficientes con `.single()` y `.order().limit(1)`

### Almacenamiento
- **JSONB**: Para configuraciones flexibles y datos dinámicos
- **Timestamps**: Automáticos para auditoría y seguimiento
- **IDs Serial**: Para relaciones eficientes y auto-incremento

### Seguridad
- **RLS**: Row Level Security habilitado en Supabase
- **Hashing**: Contraseñas hasheadas con bcrypt
- **Validación**: Validación de datos en API y base de datos
