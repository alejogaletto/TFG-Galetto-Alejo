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

### 🔌 [API Endpoints](api-endpoints.md)
- Documentación completa de todas las APIs
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

### Esquemas Virtuales de Base de Datos
- Simulación de creación de bases de datos
- Estructura jerárquica: Esquema → Tablas → Campos
- Configuraciones flexibles en JSONB

### Flujos de Trabajo Automatizados
- Definición de flujos con pasos configurables
- Tipos de pasos: email, webhook, condición, delay
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
2. Revisar [Esquema de Base de Datos](database-schema.md)
3. Consultar [API Endpoints](api-endpoints.md) para desarrollo

### Para Usuarios Finales
1. Revisar [Configuración y Despliegue](setup-deployment.md)
2. Entender [Sistema de Envío de Formularios](form-submissions.md)

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

### Tablas Principales
- `User` - Usuarios del sistema
- `Form` - Formularios creados
- `VirtualSchema` - Esquemas de base de datos
- `Workflow` - Flujos de trabajo
- `BusinessData` - Datos empresariales

### Funcionalidades Clave
- Autenticación segura con bcrypt
- CRUD completo para todos los modelos
- Consultas anidadas optimizadas
- Almacenamiento inteligente de datos

## 📞 Soporte

Si encuentras problemas o tienes preguntas:

1. **Revisar logs**: Verificar consola del navegador y logs del servidor
2. **Verificar configuración**: Revisar variables de entorno y Supabase
3. **Probar endpoints**: Usar curl para verificar APIs
4. **Consultar documentación**: Revisar secciones relevantes en esta carpeta

## 🔄 Actualizaciones

Esta documentación se actualiza regularmente para reflejar:
- Nuevas funcionalidades implementadas
- Cambios en la API
- Mejoras en el esquema de base de datos
- Soluciones a problemas comunes

---

**Última actualización**: Diciembre 2024  
**Versión del proyecto**: 1.0.0  
**Autor**: Alejo Galetto
