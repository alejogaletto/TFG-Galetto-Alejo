# Guía de Configuración y Despliegue

## Requisitos Previos

- **Node.js**: Versión 18 o superior
- **npm** o **pnpm**: Gestor de paquetes
- **Git**: Control de versiones
- **Cuenta de Supabase**: Para base de datos y autenticación

## Configuración Local

### 1. Clonar el Repositorio
```bash
git clone <url-del-repositorio>
cd TFG-Galetto-Alejo
```

### 2. Instalar Dependencias
```bash
# Usar npm (recomendado para evitar conflictos)
npm install --legacy-peer-deps

# O usar pnpm (puede causar problemas en Vercel)
pnpm install
```

### 3. Configurar Variables de Entorno
Crear archivo `.env.local` en la raíz del proyecto:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Email Service (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Next.js Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 4. Configurar Base de Datos
1. Ir a tu proyecto de Supabase
2. Ejecutar el script SQL de `supabase/schema.sql`
3. Verificar que todas las tablas se crearon correctamente

### 5. Ejecutar el Proyecto
```bash
npm run dev
```

El proyecto estará disponible en `http://localhost:3000`

## Configuración de Supabase

### 1. Crear Proyecto
1. Ir a [supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. Anotar URL y claves de API

### 2. Aplicar Esquema
1. Ir a SQL Editor en Supabase
2. Copiar y pegar contenido de `supabase/schema.sql`
3. Ejecutar el script

### 3. Configurar RLS (Row Level Security)
```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Form" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FormField" ENABLE ROW LEVEL SECURITY;
-- ... (aplicar a todas las tablas)

-- Crear políticas básicas (ejemplo para User)
CREATE POLICY "Users can view own data" ON "User"
  FOR SELECT USING (auth.uid()::text = id::text);
```

### 4. Configurar Storage (opcional)
```sql
-- Crear bucket para archivos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('forms', 'forms', true);

-- Política para acceso público a formularios
CREATE POLICY "Public access to forms" ON storage.objects
  FOR SELECT USING (bucket_id = 'forms');
```

## Despliegue en Vercel

### 1. Preparar el Proyecto
```bash
# Asegurar que no hay errores de build
npm run build

# Verificar que el proyecto funciona localmente
npm run dev
```

### 2. Configurar Vercel
1. Conectar repositorio de GitHub a Vercel
2. Configurar variables de entorno en Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 3. Resolver Problemas Comunes

#### Error de pnpm-lock.yaml
```bash
# Eliminar archivos de lock
rm pnpm-lock.yaml
rm package-lock.json

# Reinstalar con npm
npm install --legacy-peer-deps

# Commit y push
git add .
git commit -m "Fix: Remove pnpm lock and use npm"
git push
```

#### Variables de Entorno Faltantes
- Verificar que todas las variables estén configuradas en Vercel
- Usar `SUPABASE_SERVICE_ROLE_KEY` para operaciones del servidor

#### Conflictos de Dependencias
```bash
# Usar --legacy-peer-deps para resolver conflictos
npm install --legacy-peer-deps

# O actualizar a versiones compatibles
npm update
```

## Configuración de Email (Opcional)

### 1. Gmail SMTP
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_contraseña_de_aplicacion
```

### 2. Otras Proveedores
```env
# SendGrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=tu_api_key

# Mailgun
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=tu_usuario
SMTP_PASS=tu_contraseña
```

## Verificación del Despliegue

### 1. Health Check
```bash
# Verificar que la API responde
curl https://tu-dominio.vercel.app/api/debug/supabase

# Verificar autenticación
curl -X POST https://tu-dominio.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

### 2. Pruebas de CRUD
```bash
# Crear usuario de prueba
curl -X POST https://tu-dominio.vercel.app/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123"}'
```

### 3. Verificar Base de Datos
1. Ir a Supabase Dashboard
2. Verificar que las tablas existen
3. Verificar que los datos se están guardando

## Monitoreo y Mantenimiento

### 1. Logs de Vercel
- Revisar logs de build y runtime
- Monitorear errores 500 y timeouts

### 2. Logs de Supabase
- Revisar logs de SQL y autenticación
- Monitorear uso de recursos

### 3. Métricas de Rendimiento
- Tiempo de respuesta de API
- Uso de memoria y CPU
- Errores de base de datos

## Solución de Problemas

### Error: "fetch failed"
- Verificar que Supabase no esté pausado
- Verificar variables de entorno
- Verificar conectividad de red

### Error: "table does not exist"
- Verificar que el esquema se aplicó correctamente
- Verificar permisos de RLS
- Verificar que `SUPABASE_SERVICE_ROLE_KEY` esté configurado

### Error: "ERESOLVE peer dependency"
```bash
npm install --legacy-peer-deps
# O
npm install --force
```

### Error: "Cannot find module"
```bash
# Limpiar cache
rm -rf node_modules
rm package-lock.json
npm install --legacy-peer-deps
```

## Optimizaciones de Producción

### 1. Next.js
```javascript
// next.config.mjs
const nextConfig = {
  experimental: {
    optimizeCss: true,
  },
  images: {
    unoptimized: true,
  },
  // Habilitar compresión
  compress: true,
}
```

### 2. Supabase
- Configurar índices para consultas frecuentes
- Usar RLS para seguridad
- Configurar backups automáticos

### 3. Vercel
- Habilitar Edge Functions para mejor rendimiento
- Configurar CDN para assets estáticos
- Usar Analytics para monitoreo

## Seguridad

### 1. Variables de Entorno
- Nunca commitear `.env.local`
- Usar `SUPABASE_SERVICE_ROLE_KEY` solo en servidor
- Rotar claves regularmente

### 2. Base de Datos
- Habilitar RLS en todas las tablas
- Crear políticas de acceso específicas
- Validar datos en API y base de datos

### 3. API
- Validar todos los inputs
- Sanitizar datos antes de guardar
- Implementar rate limiting si es necesario
