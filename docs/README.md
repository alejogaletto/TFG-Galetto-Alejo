# Documentación del Proyecto

Bienvenido a la documentación completa del proyecto TFG-Galetto-Alejo. Esta carpeta contiene toda la información técnica, guías de configuración y detalles de implementación.

## 📚 Índice de Documentación

### 🚀 [Configuración y Despliegue](setup-deployment.md)
- Requisitos previos y configuración local
- Configuración de Supabase
- Despliegue en Vercel
- Solución de problemas comunes
- Optimizaciones de producción

### 🗄️ [Esquema de Base de Datos](database-schema.md)
- Estructura completa de tablas
- Relaciones y restricciones
- Tipos de datos JSONB
- Índices recomendados
- Consideraciones de rendimiento

### 🏗️ [Constructor de Base de Datos](database-builder.md)
- **Funcionalidad completa** del Database Builder
- **Plantillas predefinidas** y tipos de creación
- **Implementación técnica** y APIs utilizadas
- **Interfaz de usuario** y características
- **Casos de uso** y roadmap futuro

### 🔌 [API Endpoints](api-endpoints.md)
- Documentación completa de todas las APIs
- **Constructor de Base de Datos APIs**
- Ejemplos de uso con curl
- Parámetros y respuestas
- Notas importantes y mejores prácticas

### 📝 [Sistema de Envío de Formularios](form-submissions.md)
- Explicación detallada del sistema inteligente
- Lógica de almacenamiento automático
- Escenarios de uso y configuración
- Implementación técnica

## 🎯 Características Principales

### Sistema de Formularios Dinámicos
- Creación de formularios con campos personalizables
- Validaciones configurables por campo
- Renderizado dinámico basado en esquemas

### **Constructor de Base de Datos (Database Builder)**
- **Creación visual** de esquemas virtuales de base de datos
- **Plantillas predefinidas** (Clientes, Productos, Pedidos, Tareas)
- **Wizard de 4 pasos** para configuración intuitiva
- **Integración automática** con el sistema de formularios
- **Simulación de bases de datos reales** sin conocimientos técnicos

### Esquemas Virtuales
- Creación de "bases de datos" simuladas
- Estructura jerárquica: Esquema → Tablas → Campos
- Configuraciones flexibles en JSONB

### Flujos de Trabajo
- Definición de flujos con pasos configurables
- Tipos: email, webhook, condición, delay
- Ejecución secuencial con posicionamiento

### Almacenamiento Inteligente de Datos
- Decisión automática de almacenamiento
- Mapeo de campos entre formularios y bases de datos
- Fallback a almacenamiento genérico

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Next.js API Routes
- **Base de Datos**: PostgreSQL (Supabase)
- **Autenticación**: Supabase Auth
- **Estilos**: Tailwind CSS
- **Despliegue**: Vercel

## 📖 Cómo Usar Esta Documentación

### Para Desarrolladores
1. Comenzar con [Configuración y Despliegue](setup-deployment.md)
2. Revisar [Esquema de Base de Datos](database-schema.md) para estructura técnica
3. **Nuevo**: Estudiar [Constructor de Base de Datos](database-builder.md) para implementación
4. Consultar [API Endpoints](api-endpoints.md) para desarrollo

### Para Usuarios Finales
1. Revisar [Configuración y Despliegue](setup-deployment.md)
2. Entender [Sistema de Envío de Formularios](form-submissions.md)
3. **Nuevo**: Aprender sobre [Constructor de Base de Datos](database-schema.md#constructor-de-base-de-datos-database-builder)

### Para DevOps
1. [Configuración y Despliegue](setup-deployment.md)
2. [Esquema de Base de Datos](database-schema.md) para optimizaciones

## 🔍 Búsqueda Rápida

### Endpoints Principales
- **Usuarios**: `/api/users`
- **Formularios**: `/api/forms`
- **Esquemas**: `/api/virtual-schemas`
- **Flujos**: `/api/workflows`
- **Envíos**: `/api/form-submissions`
- **🆕 Constructor**: `/dashboard/databases/new`

### Tablas Principales
- `User` - Usuarios del sistema
- `Form` - Formularios creados
- `VirtualSchema` - Esquemas de base de datos
- `VirtualTableSchema` - Tablas virtuales
- `VirtualFieldSchema` - Campos virtuales
- `Workflow` - Flujos de trabajo
- `BusinessData` - Datos empresariales

### Funcionalidades Clave
- Autenticación segura con bcrypt
- CRUD completo para todos los modelos
- Consultas anidadas optimizadas
- Almacenamiento inteligente de datos
- **🆕 Constructor de Base de Datos visual**

## 🆕 Constructor de Base de Datos - Funcionalidad Destacada

### ¿Qué es?
Un sistema visual que permite a los usuarios crear "bases de datos" sin conocimientos técnicos, simulando la estructura de bases de datos reales.

### ¿Cómo funciona?
1. **Acceso**: `/dashboard/databases/new`
2. **Selección**: Manual, Plantilla o IA (próximamente)
3. **Configuración**: Nombre, descripción y estructura
4. **Creación automática**: VirtualSchema + VirtualTableSchema + VirtualFieldSchema
5. **Integración**: Los formularios pueden conectarse a estas bases de datos

### Plantillas Disponibles
- **👥 Clientes**: Gestión de información de clientes
- **📦 Productos**: Inventario y catálogo
- **🛒 Pedidos**: Sistema de pedidos y transacciones
- **✅ Tareas**: Gestión de proyectos y tareas

### Beneficios
- **Simplicidad**: Sin conocimientos técnicos requeridos
- **Flexibilidad**: Estructura completamente personalizable
- **Consistencia**: Todas las bases de datos siguen el mismo patrón
- **Integración**: Funciona perfectamente con el sistema de formularios

## 📞 Soporte

Si encuentras problemas o tienes preguntas:

1. **Documentación**: Revisar carpeta [`docs/`](./docs/)
2. **Constructor de BD**: Ver [Constructor de Base de Datos](database-builder.md)
3. **APIs**: Consultar [API Endpoints](api-endpoints.md)
4. **Issues**: Crear issue en GitHub para problemas
5. **Logs**: Verificar consola del navegador y logs del servidor

## 🔄 Actualizaciones

Esta documentación se actualiza regularmente para reflejar:
- Nuevas funcionalidades implementadas
- **Constructor de Base de Datos** (Agregado en Diciembre 2024)
- Cambios en la API
- Mejoras en el esquema de base de datos
- Soluciones a problemas comunes

---

**Última actualización**: Diciembre 2024  
**Versión del proyecto**: 1.0.0  
**Autor**: Alejo Galetto
