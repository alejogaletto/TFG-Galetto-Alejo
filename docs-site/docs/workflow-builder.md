# Constructor de Flujos de Trabajo (Workflow Builder)

## 📋 Descripción General

El Constructor de Flujos de Trabajo es una herramienta visual que permite a los usuarios crear, diseñar y automatizar procesos de negocio sin conocimientos técnicos. Utiliza un sistema de arrastrar y soltar con un lienzo interactivo que se adapta automáticamente al contenido.

## 🎯 Características Principales

### ✨ Funcionalidades Destacadas
- **Lienzo Resizable**: Se adapta automáticamente al número de pasos del flujo
- **Zoom Dinámico**: Control de zoom del 30% al 200% con controles visuales
- **Plantillas Predefinidas**: 6 plantillas listas para usar
- **Diseño Visual**: Interfaz drag-and-drop intuitiva
- **Configuración Avanzada**: Cada paso es completamente configurable
- **Conexiones Visuales**: Líneas de conexión automáticas entre pasos
- **Pruebas en Tiempo Real**: Funcionalidad de prueba integrada

## 🚀 Acceso y Navegación

### Ruta de Acceso
```
/dashboard/workflows → "Nuevo Flujo de Trabajo" → /dashboard/workflows/create
```

### Flujo de Creación (3 Pasos)
1. **Paso 1**: Selección de plantilla
2. **Paso 2**: Información básica del flujo
3. **Paso 3**: Diseño visual del flujo

## 🎨 Sistema de Lienzo (Canvas)

### Características del Lienzo
- **Tamaño Dinámico**: Se ajusta automáticamente según el contenido
- **Altura Mínima**: 600px
- **Ancho Mínimo**: 800px
- **Altura Máxima**: 80vh con scroll automático
- **Cálculo Inteligente**: Basado en posiciones de los pasos + padding

### Controles de Zoom
Ubicados en la barra superior del Paso 3:

| Control | Función | Rango |
|---------|---------|-------|
| 🔍- | Zoom Out | 30% - 100% |
| 🔄 | Reset Zoom | Siempre 100% |
| 🔍+ | Zoom In | 100% - 200% |
| 📊 | Indicador | Muestra porcentaje actual |

### Comportamiento del Zoom
- **Transform Origin**: `top left` para mantener posición relativa
- **Escalado Suave**: Incrementos de 10%
- **Límites**: 30% mínimo, 200% máximo
- **Persistencia**: Mantiene zoom durante la sesión

## 📋 Plantillas Disponibles

### 1. Formulario a Base de Datos (3 pasos)
**Complejidad**: Principiante  
**Descripción**: Guarda envíos de formularios en una base de datos

**Pasos**:
1. **Envío de Formulario** (Trigger) → `y: 50px`
2. **Actualizar Base de Datos** (Action) → `y: 180px`
3. **Enviar Correo** (Action) → `y: 310px`

### 2. Incorporación de Clientes (4 pasos)
**Complejidad**: Intermedio  
**Descripción**: Automatiza el proceso de bienvenida al cliente

**Pasos**:
1. **Registro de Cliente** (Trigger) → `y: 50px`
2. **Crear Perfil de Cliente** (Action) → `y: 180px`
3. **Email de Bienvenida** (Action) → `y: 310px`
4. **Esperar 24 horas** (Delay) → `y: 440px`

### 3. Proceso de Aprobación (5 pasos)
**Complejidad**: Avanzado  
**Descripción**: Crea un flujo de trabajo de aprobación de múltiples pasos

**Pasos**:
1. **Solicitud de Aprobación** (Manual Trigger) → `y: 50px`
2. **Notificar Supervisor** (Email) → `y: 180px`
3. **Verificar Aprobación** (Condition) → `y: 310px`
4. **Actualizar Estado** (Database) → `y: 440px`
5. **Confirmación Final** (Email) → `y: 570px`

### 4. Reporte Programado (3 pasos)
**Complejidad**: Intermedio  
**Descripción**: Genera y envía reportes según programación

**Pasos**:
1. **Programación Diaria** (Schedule) → `y: 50px`
2. **Generar Reporte** (Database) → `y: 180px`
3. **Enviar Reporte** (Email) → `y: 310px`

### 5. Sincronización de Base de Datos (4 pasos)
**Complejidad**: Avanzado  
**Descripción**: Mantén dos bases de datos sincronizadas

**Pasos**:
1. **Cambio en Base de Datos** (Trigger) → `y: 50px`
2. **Verificar Tipo de Cambio** (Condition) → `y: 180px`
3. **Sincronizar Datos** (Database) → `y: 310px`
4. **Notificar Sincronización** (Notification) → `y: 440px`

### 6. Flujo de Trabajo en Blanco (0 pasos)
**Complejidad**: Cualquiera  
**Descripción**: Comenzar desde cero

## 🎛️ Tipos de Elementos Disponibles

### Activadores (Triggers)
| Tipo | Icono | Descripción | Categoría |
|------|-------|-------------|-----------|
| Envío de Formulario | 📄 | Se activa cuando se envía un formulario | Formularios |
| Programación | 📅 | Se activa en horarios específicos | Tiempo |
| Cambio en Base de Datos | 🗄️ | Se activa cuando cambian los datos | Datos |
| Activador Manual | ➡️ | Se activa manualmente con un botón | Manual |

### Acciones Básicas
| Tipo | Icono | Descripción | Categoría |
|------|-------|-------------|-----------|
| Enviar Correo | ✉️ | Envía una notificación por correo | Notificaciones |
| Actualizar Base de Datos | 🗄️ | Crea o actualiza registros | Datos |
| Retraso | ⏰ | Espera por un tiempo específico | Flujo |
| Condición | ✅ | Ramifica basado en condiciones | Flujo |
| Enviar Notificación | ⚠️ | Notificación en la aplicación | Notificaciones |

### Acciones de Integración
- **Gmail**: Envío de emails automáticos
- **Google Drive**: Almacenamiento en la nube
- **Slack**: Notificaciones de equipo
- **Stripe**: Procesamiento de pagos
- **Y más**: Mailchimp, HubSpot, Zapier, etc.

## 🎨 Interfaz de Usuario

### Barra Lateral (Paso 3)
- **Activadores**: Lista de triggers disponibles
- **Acciones por Categoría**: Agrupadas por tipo
- **Consejos**: Guía de uso integrada

### Lienzo Principal
- **Fondo Blanco**: Para mejor contraste
- **Grid Invisible**: Ayuda en el posicionamiento
- **Área de Scroll**: Para flujos grandes
- **Estado Vacío**: Mensaje de bienvenida cuando no hay pasos

### Controles de Paso
Cada paso incluye:
- **Icono**: Representación visual del tipo
- **Título**: Nombre del paso
- **Descripción**: Explicación breve
- **Botón Editar**: ✏️ Para configuración
- **Botón Eliminar**: 🗑️ Para remover paso
- **Botón Conectar**: ⬇️ Para crear conexiones

## ⚙️ Configuración de Pasos

### Configuración de Email
```typescript
{
  recipient: "email@example.com",
  subject: "Asunto del correo",
  body: "Contenido con {{variables}}"
}
```

### Configuración de Programación
```typescript
{
  frequency: "daily" | "hourly" | "weekly" | "monthly",
  time: "09:00"
}
```

### Configuración de Integraciones
- **Campos Dinámicos**: Basados en la integración
- **Validación**: Campos requeridos marcados
- **Tipos**: Text, Select, Textarea
- **Opciones**: Para campos de selección

## 🔗 Sistema de Conexiones

### Creación de Conexiones
1. **Hacer clic** en "Conectar" de un paso origen
2. **Arrastrar** hasta el paso destino
3. **Soltar** para crear la conexión

### Visualización de Conexiones
- **Líneas Punteadas**: Estilo visual distintivo
- **Curvas Suaves**: Para mejor legibilidad
- **Flechas**: Indican dirección del flujo
- **Colores**: Tema primario consistente

### Gestión de Conexiones
- **Eliminación Automática**: Al eliminar pasos
- **Actualización**: Al mover pasos
- **Validación**: Evita conexiones inválidas

## 🧪 Funcionalidad de Pruebas

### Botón "Probar"
- **Ubicación**: Barra superior del Paso 3
- **Función**: Ejecuta el flujo con datos de prueba
- **Resultado**: Muestra estado de ejecución
- **Validación**: Requiere al menos un paso

### Datos de Prueba
```typescript
{
  test: true,
  // Datos simulados para testing
}
```

## 💾 Guardado y Persistencia

### Información Guardada
```typescript
interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  connections: Connection[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Estructura de Pasos
```typescript
interface WorkflowStep {
  id: string;
  type: "trigger" | "action";
  actionType: string;
  name: string;
  description: string;
  config: Record<string, any>;
  position: { x: number; y: number };
}
```

## 🎯 Casos de Uso Comunes

### 1. Automatización de Formularios
- **Trigger**: Envío de formulario
- **Acciones**: Guardar en BD + Enviar email
- **Resultado**: Proceso completamente automatizado

### 2. Flujos de Aprobación
- **Trigger**: Manual o automático
- **Acciones**: Notificaciones + Condiciones + Actualizaciones
- **Resultado**: Proceso de aprobación estructurado

### 3. Reportes Programados
- **Trigger**: Programación temporal
- **Acciones**: Generación + Envío
- **Resultado**: Reportes automáticos regulares

### 4. Sincronización de Datos
- **Trigger**: Cambios en BD
- **Acciones**: Verificación + Sincronización + Notificación
- **Resultado**: Datos siempre actualizados

## 🔧 Implementación Técnica

### Componentes Principales
- **CreateWorkflowPage**: Componente principal
- **Canvas**: Lienzo interactivo con zoom
- **StepConfig**: Configuración de pasos
- **ConnectionSystem**: Gestión de conexiones

### Estados de la Aplicación
```typescript
const [step, setStep] = useState(1);
const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
const [workflowSteps, setWorkflowSteps] = useState<any[]>([]);
const [connections, setConnections] = useState<{ from: number; to: number }[]>([]);
const [zoomLevel, setZoomLevel] = useState(1);
const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
```

### Cálculo de Tamaño del Lienzo
```typescript
const calculateCanvasSize = () => {
  if (workflowSteps.length === 0) {
    return { width: 800, height: 600 };
  }
  
  const maxY = Math.max(...workflowSteps.map(step => step.position.y));
  const requiredHeight = Math.max(600, maxY + 200);
  const requiredWidth = Math.max(800, 400);
  
  return { width: requiredWidth, height: requiredHeight };
};
```

## 🚀 Mejoras Futuras

### Funcionalidades Planificadas
- **Zoom con Rueda del Ratón**: Control más intuitivo
- **Plantillas Personalizadas**: Crear y guardar plantillas propias
- **Colaboración**: Edición simultánea múltiples usuarios
- **Historial de Versiones**: Control de cambios
- **Exportación**: PDF, PNG del diseño
- **Importación**: Desde archivos JSON

### Optimizaciones Técnicas
- **Virtualización**: Para flujos muy grandes
- **Undo/Redo**: Sistema de deshacer/rehacer
- **Auto-guardado**: Guardado automático periódico
- **Validación Avanzada**: Verificación de flujos
- **Performance**: Optimización de renderizado

## 📚 Recursos Adicionales

### Documentación Relacionada
- [API Endpoints](api-endpoints.md) - APIs de workflows
- [Database Schema](database-schema.md) - Estructura de datos
- [Form Submissions](form-submissions.md) - Integración con formularios

### Enlaces Útiles
- **Dashboard**: `/dashboard/workflows`
- **Creación**: `/dashboard/workflows/create`
- **API**: `/api/workflows`

---

**Última actualización**: Diciembre 2024  
**Versión**: 1.0.0  
**Autor**: Alejo Galetto
