# TFG-Galetto-Alejo

## Descripción

Este proyecto es una aplicación web desarrollada como trabajo final de grado (TFG) que permite a los usuarios crear formularios dinámicos, gestionar bases de datos virtuales y automatizar flujos de trabajo.

## 🚀 Características Principales

- **Sistema de Formularios Dinámicos**: Creación y gestión de formularios con campos personalizables
- **Constructor de Base de Datos**: Creación visual de esquemas virtuales con plantillas predefinidas
- **Esquemas Virtuales de Base de Datos**: Simulación de creación de bases de datos por usuarios
- **Flujos de Trabajo Automatizados**: Definición y ejecución de flujos de trabajo
- **Almacenamiento Inteligente**: Sistema que decide automáticamente dónde almacenar los datos
- **Autenticación Segura**: Sistema de usuarios con contraseñas hasheadas

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Next.js API Routes
- **Base de Datos**: PostgreSQL (Supabase)
- **Autenticación**: Supabase Auth
- **Estilos**: Tailwind CSS
- **Despliegue**: Vercel

## 📖 Instalación Rápida

### Requisitos Previos
- Node.js 18 o superior
- npm o pnpm
- Cuenta de Supabase

### Pasos Básicos
```bash
# 1. Clonar repositorio
git clone <url-del-repositorio>
cd TFG-Galetto-Alejo

# 2. Instalar dependencias
npm install --legacy-peer-deps

# 3. Configurar .env.local
# 4. Aplicar esquema de BD en Supabase
# 5. Ejecutar proyecto
npm run dev
```

## 🔌 API - Endpoints Principales

| Modelo | Endpoint | Operaciones |
|--------|----------|-------------|
| **Usuarios** | `/api/users` | CRUD completo |
| **Formularios** | `/api/forms` | CRUD completo |
| **Esquemas** | `/api/virtual-schemas` | CRUD + árbol anidado |
| **Flujos** | `/api/workflows` | CRUD + pasos anidados |
| **Envíos** | `/api/form-submissions` | Sistema inteligente |

## 🆕 Constructor de Base de Datos

### Funcionalidad
- **Creación visual** de bases de datos virtuales
- **Plantillas predefinidas**: Clientes, Productos, Pedidos, Tareas
- **Wizard de 4 pasos** para configuración intuitiva
- **Integración automática** con el sistema de formularios

### Acceso
- **Ruta**: `/dashboard/databases/new`
- **Botones**: "Nueva Base de Datos" y "Crear Base de Datos"
- **Resultado**: Crea automáticamente VirtualSchema + VirtualTableSchema + VirtualFieldSchema

## 📚 Documentación Completa

Para información detallada, consulta la carpeta [`docs/`](./docs/):

- **[🚀 Configuración y Despliegue](./docs/setup-deployment.md)** - Setup completo y despliegue
- **[🗄️ Esquema de Base de Datos](./docs/database-schema.md)** - Estructura de tablas y relaciones
- **[🏗️ Constructor de Base de Datos](./docs/database-builder.md)** - **Database Builder** completo
- **[🔌 API Endpoints](./docs/api-endpoints.md)** - Documentación completa de APIs
- **[📝 Sistema de Formularios](./docs/form-submissions.md)** - Explicación del sistema inteligente

## 🎯 Funcionalidades Clave

### Sistema de Formularios
- Campos dinámicos con validaciones configurables
- Renderizado automático basado en esquemas
- Almacenamiento inteligente (BD empresarial o genérico)

### Constructor de Base de Datos
- **Plantillas predefinidas** para casos de uso comunes
- **Estructura personalizable** para esquemas únicos
- **Creación automática** de esquemas virtuales
- **Integración perfecta** con el sistema de formularios

### Esquemas Virtuales
- Creación de "bases de datos" simuladas
- Estructura jerárquica: Esquema → Tablas → Campos
- Configuraciones flexibles en JSONB

### Flujos de Trabajo
- Definición de flujos con pasos configurables
- Tipos: email, webhook, condición, delay
- Ejecución secuencial con posicionamiento

## 🏗️ Estructura del Proyecto

```
TFG-Galetto-Alejo/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── dashboard/         # Panel de administración
│   │   └── databases/     # Constructor de bases de datos
│   ├── forms/            # Formularios públicos
│   └── auth/             # Autenticación
├── components/            # Componentes reutilizables
├── lib/                  # Utilidades y configuraciones
├── supabase/             # Esquema de base de datos
└── docs/                 # 📚 Documentación completa
```

## 🚀 Uso Rápido

### 1. Crear Base de Datos
- Dashboard → Bases de Datos → Nueva Base de Datos
- Elegir plantilla o crear desde cero
- Configurar estructura de tablas y campos
- Sistema crea automáticamente el esquema virtual

### 2. Crear Formulario
- Dashboard → Formularios → Nuevo Formulario
- Configurar campos y validaciones
- Guardar formulario

### 3. Conectar Formulario a Base de Datos
- Dashboard → Formularios → Conectar Base de Datos
- Seleccionar esquema virtual creado
- Mapear campos del formulario a campos de la base de datos

### 4. Crear Flujo de Trabajo
- Workflows → Nuevo Workflow
- Definir pasos y configuraciones
- Configurar posiciones de ejecución

## 🔍 Ejemplos de Uso

### Crear Usuario
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Juan","email":"juan@test.com","password":"123456"}'
```

### Obtener Esquema con Árbol
```bash
curl "http://localhost:3000/api/virtual-schemas/1?includeTree=true"
```

### Crear Base de Datos con Constructor (via UI)
1. Ve a `/dashboard/databases/new`
2. Selecciona plantilla "Clientes"
3. Confirma la creación
4. Sistema crea automáticamente:
   - VirtualSchema: "Base de Datos de Clientes"
   - VirtualTableSchema: "Customers"
   - VirtualFieldSchema: ID, Name, Email, Phone, Address, Created At

## 📞 Soporte

- **Documentación**: Revisar carpeta [`docs/`](./docs/)
- **Constructor de BD**: Ver [Constructor de Base de Datos](./docs/database-builder.md)
- **Issues**: Crear issue en GitHub para problemas
- **Logs**: Verificar consola y logs del servidor

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/NuevaFuncionalidad`)
3. Commit cambios (`git commit -m 'Add NuevaFuncionalidad'`)
4. Push a la rama (`git push origin feature/NuevaFuncionalidad`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Contacto

**Alejo Galetto** - [@alejogaletto](https://github.com/alejogaletto)

**Link del proyecto**: [https://github.com/alejogaletto/TFG-Galetto-Alejo](https://github.com/alejogaletto/TFG-Galetto-Alejo)

---

**💡 Tip**: Para información técnica detallada, consulta la carpeta [`docs/`](./docs/)

**🆕 Nuevo**: Constructor de Base de Datos visual para crear esquemas virtuales sin conocimientos técnicos

