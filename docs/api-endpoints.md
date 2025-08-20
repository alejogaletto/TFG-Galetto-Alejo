# API Endpoints - Documentación Completa

## Autenticación

### Login
- **POST** `/api/auth/login`
- **Descripción**: Autentica un usuario con email y password
- **Body**: `{ "email": "string", "password": "string" }`
- **Respuesta**: Usuario autenticado o error de credenciales

## Usuarios (Users)

### Crear Usuario
- **POST** `/api/users`
- **Body**: `{ "name": "string", "email": "string", "password": "string", "configs": "object" }`
- **Nota**: La contraseña se hashea automáticamente con bcrypt

### Listar Usuarios
- **GET** `/api/users`
- **Respuesta**: Lista de usuarios (sin contraseñas)

### Obtener Usuario
- **GET** `/api/users/[id]`
- **Respuesta**: Usuario específico (sin contraseña)

### Actualizar Usuario
- **PUT** `/api/users/[id]`
- **Body**: Campos a actualizar (password se hashea si se incluye)

### Eliminar Usuario
- **DELETE** `/api/users/[id]`
- **Nota**: Elimina en cascada todos los datos relacionados

## Formularios (Forms)

### Crear Formulario
- **POST** `/api/forms`
- **Body**: `{ "name": "string", "description": "string", "user_id": "number", "configs": "object" }`

### Listar Formularios
- **GET** `/api/forms`
- **Query Params**: `user_id` (opcional)

### Obtener Formulario
- **GET** `/api/forms/[id]`
- **Respuesta**: Formulario con campos asociados

### Actualizar Formulario
- **PUT** `/api/forms/[id]`
- **Body**: Campos a actualizar

### Eliminar Formulario
- **DELETE** `/api/forms/[id]`
- **Nota**: Elimina en cascada FormFields y DataConnections

## Campos de Formulario (FormFields)

### Crear Campo
- **POST** `/api/form-fields`
- **Body**: `{ "form_id": "number", "name": "string", "type": "string", "configs": "object" }`

### Listar Campos
- **GET** `/api/form-fields`
- **Query Params**: `form_id` (opcional)

### Obtener Campo
- **GET** `/api/form-fields/[id]`

### Actualizar Campo
- **PUT** `/api/form-fields/[id]`

### Eliminar Campo
- **DELETE** `/api/form-fields/[id]`

## Esquemas Virtuales (VirtualSchemas)

### Crear Esquema
- **POST** `/api/virtual-schemas`
- **Body**: `{ "name": "string", "description": "string", "user_id": "number" }`

### Listar Esquemas
- **GET** `/api/virtual-schemas`
- **Query Params**: 
  - `user_id` (opcional)
  - `includeTree=true` (incluye tablas y campos anidados)

### Obtener Esquema
- **GET** `/api/virtual-schemas/[id]`
- **Query Params**: `includeTree=true` (opcional)

### Árbol Completo del Esquema
- **GET** `/api/virtual-schemas/[id]/tree`
- **Query Params**: `lightweight=true` (solo nombres, no configs completas)

### Actualizar Esquema
- **PUT** `/api/virtual-schemas/[id]`

### Eliminar Esquema
- **DELETE** `/api/virtual-schemas/[id]`
- **Nota**: Elimina en cascada tablas y campos

## Tablas Virtuales (VirtualTableSchemas)

### Crear Tabla
- **POST** `/api/virtual-table-schemas`
- **Body**: `{ "name": "string", "virtual_schema_id": "number", "configs": "object" }`

### Listar Tablas
- **GET** `/api/virtual-table-schemas`
- **Query Params**: `virtual_schema_id` (opcional)

### Obtener Tabla
- **GET** `/api/virtual-table-schemas/[id]`

### Actualizar Tabla
- **PUT** `/api/virtual-table-schemas/[id]`

### Eliminar Tabla
- **DELETE** `/api/virtual-table-schemas/[id]`
- **Nota**: Elimina en cascada campos de la tabla

## Campos Virtuales (VirtualFieldSchemas)

### Crear Campo
- **POST** `/api/virtual-field-schemas`
- **Body**: `{ "name": "string", "type": "string", "virtual_table_schema_id": "number", "configs": "object" }`

### Listar Campos
- **GET** `/api/virtual-field-schemas`
- **Query Params**: `virtual_table_schema_id` (opcional)

### Obtener Campo
- **GET** `/api/virtual-field-schemas/[id]`

### Actualizar Campo
- **PUT** `/api/virtual-field-schemas/[id]`

### Eliminar Campo
- **DELETE** `/api/virtual-field-schemas/[id]`

## Conexiones de Datos (DataConnections)

### Crear Conexión
- **POST** `/api/data-connections`
- **Body**: `{ "form_id": "number", "virtual_schema_id": "number", "configs": "object" }`

### Listar Conexiones
- **GET** `/api/data-connections`
- **Query Params**: `form_id` o `virtual_schema_id` (opcional)

### Obtener Conexión
- **GET** `/api/data-connections/[id]`

### Actualizar Conexión
- **PUT** `/api/data-connections/[id]`

### Eliminar Conexión
- **DELETE** `/api/data-connections/[id]`
- **Nota**: Elimina en cascada mapeos de campos

## Mapeo de Campos (FieldMappings)

### Crear Mapeo
- **POST** `/api/field-mappings`
- **Body**: `{ "form_field_id": "number", "virtual_field_schema_id": "number", "data_connection_id": "number" }`

### Listar Mapeos
- **GET** `/api/field-mappings`
- **Query Params**: `data_connection_id` (opcional)

### Obtener Mapeo
- **GET** `/api/field-mappings/[id]`

### Actualizar Mapeo
- **PUT** `/api/field-mappings/[id]`

### Eliminar Mapeo
- **DELETE** `/api/field-mappings/[id]`

## Datos Empresariales (BusinessData)

### Crear Registro
- **POST** `/api/business-data`
- **Body**: `{ "user_id": "number", "virtual_schema_id": "number", "data": "object" }`

### Listar Registros
- **GET** `/api/business-data`
- **Query Params**: `user_id` o `virtual_schema_id` (opcional)

### Obtener Registro
- **GET** `/api/business-data/[id]`

### Actualizar Registro
- **PUT** `/api/business-data/[id]`

### Eliminar Registro
- **DELETE** `/api/business-data/[id]`

## Flujos de Trabajo (Workflows)

### Crear Flujo
- **POST** `/api/workflows`
- **Body**: `{ "name": "string", "description": "string", "user_id": "number", "configs": "object" }`

### Listar Flujos
- **GET** `/api/workflows`
- **Query Params**: 
  - `user_id` (opcional)
  - `includeSteps=true` (incluye pasos anidados)

### Obtener Flujo
- **GET** `/api/workflows/[id]`
- **Query Params**: `includeSteps=true` (opcional)

### Árbol Completo del Flujo
- **GET** `/api/workflows/[id]/tree`
- **Query Params**: `lightweight=true` (solo IDs y tipos, no configs completas)

### Actualizar Flujo
- **PUT** `/api/workflows/[id]`

### Eliminar Flujo
- **DELETE** `/api/workflows/[id]`
- **Nota**: Elimina en cascada todos los pasos

## Pasos del Flujo (WorkflowSteps)

### Crear Paso
- **POST** `/api/workflow-steps`
- **Body**: `{ "workflow_id": "number", "type": "string", "position": "number", "configs": "object" }`

### Listar Pasos
- **GET** `/api/workflow-steps`
- **Query Params**: `workflow_id` (opcional)

### Obtener Paso
- **GET** `/api/workflow-steps/[id]`

### Actualizar Paso
- **PUT** `/api/workflow-steps/[id]`

### Eliminar Paso
- **DELETE** `/api/workflow-steps/[id]`

## Envíos de Formularios (FormSubmissions)

### Enviar Formulario
- **POST** `/api/form-submissions`
- **Body**: `{ "form_id": "number", "data": "object" }`
- **Nota**: Sistema inteligente decide almacenamiento (BusinessData o FormSubmission)

### Listar Envíos
- **GET** `/api/form-submissions`
- **Query Params**: `form_id` (opcional)

### Obtener Envío
- **GET** `/api/form-submissions/[id]`

### Actualizar Envío
- **PUT** `/api/form-submissions/[id]`

### Eliminar Envío
- **DELETE** `/api/form-submissions/[id]`

## Ejemplos de Uso

### Crear Usuario Completo
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@empresa.com",
    "password": "contraseña123",
    "configs": {"empresa": "TechCorp"}
  }'
```

### Crear Formulario con Campos
```bash
# 1. Crear formulario
curl -X POST http://localhost:3000/api/forms \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Encuesta de Satisfacción",
    "description": "Formulario para medir satisfacción del cliente",
    "user_id": 1
  }'

# 2. Crear campos del formulario
curl -X POST http://localhost:3000/api/form-fields \
  -H "Content-Type: application/json" \
  -d '{
    "form_id": 1,
    "name": "nombre",
    "type": "text",
    "configs": {"required": true, "maxLength": 100}
  }'
```

### Obtener Esquema con Árbol Completo
```bash
curl "http://localhost:3000/api/virtual-schemas/1?includeTree=true"
```

### Obtener Flujo con Pasos
```bash
curl "http://localhost:3000/api/workflows/1?includeSteps=true"
```

## Notas Importantes

- **Autenticación**: Todas las operaciones requieren autenticación válida
- **Cascada**: Las eliminaciones respetan las restricciones de clave foránea
- **Validación**: Los datos se validan antes de ser procesados
- **Hashing**: Las contraseñas se hashean automáticamente con bcrypt
- **JSONB**: Los campos `configs` permiten configuración flexible por tipo
- **Relaciones**: Las consultas pueden incluir datos relacionados con parámetros específicos
