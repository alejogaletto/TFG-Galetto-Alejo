# AutomateSMB - Sistema No-Code para la Creación de Aplicaciones Empresariales

Una plataforma no-code moderna para crear soluciones empresariales sin necesidad de programación avanzada. Construida con Next.js, Supabase y Tailwind CSS.

## 🚀 Características

- **Constructor de Formularios**: Crea formularios dinámicos con drag & drop
- **Constructor de Flujos de Trabajo**: Automatiza procesos empresariales
- **Gestión de Bases de Datos**: Administra datos de forma visual
- **Plantillas de Soluciones**: CRM, Inventario, Analytics y más
- **Integraciones**: Conecta con servicios externos
- **Dashboard Analytics**: Visualiza métricas y estadísticas

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior)
- **npm** o **yarn**
- **Git**
- Una cuenta en **Supabase** (para la base de datos)

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/alejogaletto/TFG-Galetto-Alejo.git
```

### 2. Instalar dependencias

```bash
npm install
# o
yarn install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key

# Base de datos (si usas PostgreSQL directo)
POSTGRES_URL=tu_postgres_url
POSTGRES_PRISMA_URL=tu_postgres_prisma_url
POSTGRES_URL_NON_POOLING=tu_postgres_url_non_pooling
POSTGRES_USER=tu_postgres_user
POSTGRES_PASSWORD=tu_postgres_password
POSTGRES_DATABASE=tu_postgres_database
POSTGRES_HOST=tu_postgres_host

# JWT
SUPABASE_JWT_SECRET=tu_jwt_secret
SUPABASE_ANON_KEY=tu_anon_key
```

### 4. Configurar Supabase

#### Opción A: Usar Supabase Cloud

1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Copia las credenciales al archivo `.env.local`

#### Opción B: Supabase Local

```bash
# Instalar Supabase CLI
npm install -g @supabase/cli

# Inicializar Supabase
supabase init

# Iniciar servicios locales
supabase start
```

### 5. Configurar la base de datos

Ejecuta las migraciones de la base de datos:

```bash
# Si usas Supabase
supabase db reset

# O ejecuta los scripts SQL manualmente en tu base de datos
```

### 6. Ejecutar el proyecto

```bash
npm run dev
# o
yarn dev
```

El proyecto estará disponible en [http://localhost:3000](http://localhost:3000)

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**Desarrollado con ❤️ para automatizar procesos empresariales**
```

