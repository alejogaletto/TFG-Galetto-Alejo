# Constructor de Base de Datos (Database Builder)

## Visión General

El **Constructor de Base de Datos** es una funcionalidad central del sistema que permite a los usuarios crear esquemas virtuales de forma visual e intuitiva, simulando la creación de bases de datos reales sin necesidad de conocimientos técnicos.

## 🎯 Funcionalidad

### ¿Qué es?
Un sistema visual que permite a los usuarios crear "bases de datos" sin conocimientos técnicos, simulando la estructura de bases de datos reales a través de los modelos `VirtualSchema`, `VirtualTableSchema` y `VirtualFieldSchema`.

### ¿Por qué es importante?
- **Democratiza** la creación de bases de datos
- **Simplifica** el proceso para usuarios no técnicos
- **Integra** perfectamente con el sistema de formularios
- **Escalable** para diferentes tipos de casos de uso

## 🚀 Flujo de Creación

### Proceso Completo
```
1. Usuario accede a /dashboard/databases/new
2. Selecciona tipo: Manual, Plantilla o IA (próximamente)
3. Define información básica (nombre, descripción)
4. Configura estructura (tablas y campos)
5. Sistema crea automáticamente:
   - VirtualSchema (base de datos virtual)
   - VirtualTableSchema(s) (tablas)
   - VirtualFieldSchema(s) (campos)
6. Redirección a /dashboard/databases/[id]
```

### Wizard de 4 Pasos
1. **Elegir Plantilla**: Selección de tipo de base de datos
2. **Información Básica**: Nombre y descripción
3. **Estructura**: Definición de tablas y campos
4. **Revisar y Crear**: Confirmación final

## 🎨 Tipos de Creación

### **Base de Datos Manual**
- Usuario define cada tabla y campo desde cero
- Control total sobre la estructura
- Ideal para esquemas personalizados y únicos
- Flexibilidad completa en nombres y tipos

### **Plantillas Predefinidas**

#### **👥 Clientes (Customers)**
```
Tabla: Customers
Campos:
- ID (Primary Key, Auto-increment)
- Name (Text, Required)
- Email (Email, Required, Unique)
- Phone (Text, Optional)
- Address (Text, Optional)
- Created At (Date, Auto-generated)
```

#### **📦 Productos (Products)**
```
Tabla: Products
Campos:
- ID (Primary Key, Auto-increment)
- Name (Text, Required)
- SKU (Text, Required, Unique)
- Price (Number, Required)
- Stock (Number, Required)
- Category (Text, Required)
- Description (Text, Optional)
```

#### **🛒 Pedidos (Orders)**
```
Tabla: Orders
Campos:
- ID (Primary Key, Auto-increment)
- Customer ID (Number, Required)
- Products (JSON, Required)
- Total (Number, Required)
- Status (Text, Required)
- Date (Date, Required)
```

#### **✅ Tareas (Tasks)**
```
Tabla: Tasks
Campos:
- ID (Primary Key, Auto-increment)
- Title (Text, Required)
- Description (Text, Optional)
- Status (Text, Required)
- Assigned To (Text, Optional)
- Due Date (Date, Optional)
```

### **Base de Datos con IA** (Próximamente)
- Descripción en lenguaje natural
- Generación automática de estructura
- Optimización inteligente de campos
- Sugerencias basadas en casos de uso

## ⚙️ Implementación Técnica

### **APIs Utilizadas**

#### **1. Crear Esquema Virtual**
```typescript
POST /api/virtual-schemas
{
  "name": "Base de Datos de Clientes",
  "description": "Almacena información de clientes",
  "user_id": 1,
  "configs": {
    "type": "customers",
    "created_via": "database_builder",
    "advanced_mode": false
  }
}
```

#### **2. Crear Tabla Virtual**
```typescript
POST /api/virtual-table-schemas
{
  "name": "Customers",
  "virtual_schema_id": 1,
  "configs": {
    "description": "Información de clientes",
    "fields_count": 6,
    "created_via": "database_builder"
  }
}
```

#### **3. Crear Campo Virtual**
```typescript
POST /api/virtual-field-schemas
{
  "name": "email",
  "type": "email",
  "virtual_table_schema_id": 1,
  "configs": {
    "required": true,
    "unique": true,
    "description": "Email del cliente",
    "is_primary": false,
    "created_via": "database_builder"
  }
}
```

### **Estructura de Configuraciones**

#### **VirtualSchema.configs**
```json
{
  "type": "customers|products|orders|tasks|blank",
  "advanced_mode": false,
  "created_via": "database_builder",
  "template_version": "1.0",
  "estimated_records": 1000
}
```

#### **VirtualTableSchema.configs**
```json
{
  "description": "Descripción de la tabla",
  "fields_count": 6,
  "created_via": "database_builder",
  "table_type": "main|junction|audit",
  "estimated_size": "small|medium|large"
}
```

#### **VirtualFieldSchema.configs**
```json
{
  "required": true,
  "unique": false,
  "description": "Descripción del campo",
  "is_primary": false,
  "created_via": "database_builder",
  "validation_rules": {
    "min_length": 3,
    "max_length": 100,
    "pattern": "^[a-zA-Z]+$"
  }
}
```

## 🎨 Interfaz de Usuario

### **Características de la UI**
- **Progreso visual** con barra de progreso
- **Modo avanzado** para configuraciones adicionales
- **Validación en tiempo real** de campos requeridos
- **Previsualización** de la estructura antes de crear
- **Notificaciones toast** para cada paso del proceso
- **Responsive design** para dispositivos móviles

### **Componentes Principales**
- **TemplateSelector**: Selección de plantillas predefinidas
- **DatabaseForm**: Formulario de información básica
- **TableBuilder**: Constructor de tablas y campos
- **PreviewPanel**: Vista previa de la estructura
- **ProgressBar**: Indicador de progreso del wizard

### **Estados de la UI**
- **Loading**: Durante la creación de entidades
- **Success**: Confirmación de creación exitosa
- **Error**: Manejo de errores con mensajes claros
- **Validation**: Validación en tiempo real de formularios

## 🔗 Integración con el Sistema

### **Conexión con Formularios**
- Las bases de datos creadas aparecen en la lista de esquemas disponibles
- Los formularios pueden conectarse a estas bases de datos virtuales
- El sistema de almacenamiento inteligente utiliza estos esquemas
- Mapeo automático de campos entre formularios y bases de datos

### **Flujo de Datos**
```
Formulario → DataConnection → VirtualSchema → BusinessData
```

### **Sistema de Almacenamiento**
- **Con conexión de BD**: Datos se almacenan en `BusinessData` con mapeo de campos
- **Sin conexión de BD**: Datos se almacenan en `FormSubmission` como JSON genérico

## 📊 Casos de Uso

### **Pequeñas Empresas**
- **Gestión de clientes**: Base de datos de contactos y leads
- **Inventario simple**: Control de productos y stock
- **Pedidos básicos**: Seguimiento de ventas

### **Empresas Medianas**
- **CRM personalizado**: Gestión de relaciones con clientes
- **Sistema de proyectos**: Seguimiento de tareas y asignaciones
- **Análisis de ventas**: Métricas y reportes personalizados

### **Desarrolladores**
- **Prototipado rápido**: Crear esquemas para testing
- **Migración de datos**: Estructurar datos existentes
- **Integración de sistemas**: Conectar diferentes fuentes de datos

## 🚀 Ventajas del Sistema

### **Para Usuarios Finales**
- **Simplicidad**: Sin conocimientos técnicos requeridos
- **Rapidez**: Creación en minutos, no en horas
- **Flexibilidad**: Estructura completamente personalizable
- **Consistencia**: Todas las bases de datos siguen el mismo patrón

### **Para Desarrolladores**
- **Escalabilidad**: Fácil agregar nuevas plantillas y tipos
- **Mantenibilidad**: Código centralizado y bien estructurado
- **Extensibilidad**: API preparada para futuras funcionalidades
- **Testing**: Fácil de probar y validar

### **Para el Negocio**
- **Reducción de costos**: Menos dependencia de desarrolladores
- **Aumento de productividad**: Usuarios crean sus propias soluciones
- **Satisfacción del cliente**: Herramientas que realmente necesitan
- **Competitividad**: Diferenciación en el mercado

## 🔮 Roadmap y Futuras Funcionalidades

### **Corto Plazo (1-3 meses)**
- **Más plantillas**: Inventario, Facturación, Recursos Humanos
- **Validaciones avanzadas**: Reglas de negocio personalizables
- **Importación de datos**: CSV, Excel, APIs externas

### **Mediano Plazo (3-6 meses)**
- **Generación con IA**: Descripción en lenguaje natural
- **Optimización automática**: Sugerencias de estructura
- **Templates comunitarios**: Compartir y reutilizar esquemas

### **Largo Plazo (6+ meses)**
- **Migración a BD reales**: PostgreSQL, MySQL, SQL Server
- **Sincronización bidireccional**: Entre esquemas virtuales y reales
- **Análisis avanzado**: Reportes y dashboards automáticos

## 🧪 Testing y Validación

### **Casos de Prueba**
- **Creación exitosa**: Todas las plantillas funcionan correctamente
- **Validación de campos**: Campos requeridos y únicos
- **Manejo de errores**: Errores de red, validación, duplicados
- **Rendimiento**: Creación rápida incluso con muchas tablas/campos

### **Métricas de Calidad**
- **Tiempo de creación**: < 30 segundos para esquemas básicos
- **Tasa de éxito**: > 95% de creaciones exitosas
- **Satisfacción del usuario**: Feedback positivo en encuestas
- **Adopción**: Uso regular por usuarios activos

## 📚 Recursos Adicionales

### **Documentación Relacionada**
- [Esquema de Base de Datos](./database-schema.md) - Estructura técnica de las tablas
- [API Endpoints](./api-endpoints.md) - Documentación de las APIs utilizadas
- [Sistema de Formularios](./form-submissions.md) - Cómo se integra con formularios

### **Ejemplos de Código**
- [Frontend Database Builder](../app/dashboard/databases/new/page.tsx)
- [Database List](../app/dashboard/databases/page.tsx)
- [Database Detail](../app/dashboard/databases/[id]/page.tsx)

### **APIs del Constructor**
- `POST /api/virtual-schemas` - Crear esquema virtual
- `POST /api/virtual-table-schemas` - Crear tabla virtual
- `POST /api/virtual-field-schemas` - Crear campo virtual
- `GET /api/virtual-schemas?includeTree=true` - Obtener esquema completo

---

**Última actualización**: Diciembre 2024  
**Versión**: 1.0.0  
**Estado**: ✅ Implementado y Documentado
