# Guía de Implementación: Sistema de Email Multi-Tenant

## 📋 Problema Actual

### Limitaciones de SMTP con un Solo Email

La implementación actual de envío de emails utiliza SMTP con una sola cuenta de Gmail configurada en las variables de entorno. Esto presenta varias limitaciones:

**1. Un Solo Remitente**
- Todos los emails se envían desde el mismo email (`SMTP_USER`)
- No es posible personalizar el remitente por empresa/usuario
- Los clientes ven siempre el mismo email de respuesta

**2. Restricciones del Campo "From"**
```typescript
// Configuración actual en .env.local
SMTP_USER=empresa@gmail.com

// En el workflow, si configuras:
from: 'ventas@miempresa.com'  // ⚠️ No funcionará correctamente

// Gmail enviará desde:
// empresa@gmail.com en nombre de ventas@miempresa.com
// o simplemente ignorará el campo "from" personalizado
```

**3. Problemas de Autenticación**
- Gmail requiere autenticación con la cuenta que envía
- No se puede enviar "desde" otras direcciones sin verificación
- Los emails pueden marcarse como spam si el remitente no coincide

**4. No Escalable para Multi-Tenant**
- Cada empresa quiere enviar desde su propio dominio
- Ejemplo: `contacto@empresaA.com`, `ventas@empresaB.com`
- Con SMTP simple, esto no es posible

### Por Qué No Funciona para Múltiples Empresas

**Escenario Multi-Tenant:**
```
Plataforma AutomateSMB
├── Empresa A (empresaA.com)
│   ├── Quiere enviar desde: contacto@empresaA.com
│   └── Workflows configurados con su email
├── Empresa B (empresaB.com)
│   ├── Quiere enviar desde: ventas@empresaB.com
│   └── Workflows configurados con su email
└── Empresa C (empresaC.com)
    ├── Quiere enviar desde: info@empresaC.com
    └── Workflows configurados con su email
```

**Con SMTP actual:**
- ❌ Todos los emails se envían desde `SMTP_USER` (ej: `platform@automatesmb.com`)
- ❌ No hay manera de verificar múltiples dominios
- ❌ Los clientes ven que los emails vienen de AutomateSMB, no de su empresa
- ❌ Baja confianza y profesionalismo

**Lo que necesitamos:**
- ✅ Cada empresa envía desde su propio dominio verificado
- ✅ Sistema para gestionar múltiples configuraciones de email
- ✅ Verificación automática de dominios
- ✅ API que soporte múltiples remitentes

## 🎯 Solución: Resend + Multi-Tenancy

### ¿Qué es Resend?

[Resend](https://resend.com) es un servicio moderno de email transaccional diseñado para desarrolladores. Similar a SendGrid, Postmark o Mailgun, pero con una API más simple y mejor soporte para múltiples dominios.

**Características principales:**
- API simple y moderna
- Soporte nativo para múltiples dominios verificados
- Verificación programática de dominios
- No requiere SMTP (usa HTTP API)
- React Email integration para templates
- Webhooks para tracking
- Excelente experiencia de desarrollador

### Ventajas sobre SMTP Tradicional

| Característica | SMTP (Gmail) | Resend |
|----------------|--------------|--------|
| Múltiples dominios | ❌ No | ✅ Sí |
| Verificación de dominio | Manual | Programática via API |
| Campo "from" personalizable | ❌ Limitado | ✅ Cualquier dominio verificado |
| Autenticación | User/Password por email | API Key única |
| Rate limits | Restrictivos | Generosos (100k/mes gratis) |
| Tracking de emails | No nativo | Sí (opens, clicks, bounces) |
| Webhooks | No | Sí |
| Templates HTML | Manual | React Email support |
| IP dedicada | No (Gmail compartido) | Opcional en planes pagos |

### Capacidades de Multi-Dominio

Resend permite:

1. **Agregar Múltiples Dominios**
   ```typescript
   // Empresa A agrega su dominio
   POST https://api.resend.com/domains
   { name: "empresaA.com" }
   
   // Empresa B agrega su dominio
   POST https://api.resend.com/domains
   { name: "empresaB.com" }
   ```

2. **Verificar Cada Dominio**
   - Resend proporciona registros DNS
   - Empresa configura SPF, DKIM, DMARC
   - Verificación automática via API

3. **Enviar desde Cualquier Dominio Verificado**
   ```typescript
   // Email desde Empresa A
   await resend.emails.send({
     from: 'contacto@empresaA.com',
     to: 'cliente@example.com',
     subject: 'Hola desde Empresa A'
   });
   
   // Email desde Empresa B
   await resend.emails.send({
     from: 'ventas@empresaB.com',
     to: 'cliente@example.com',
     subject: 'Hola desde Empresa B'
   });
   ```

## 🏗️ Arquitectura Propuesta

### Nueva Tabla: EmailConfiguration

Almacenar configuración de email por usuario/empresa:

```sql
CREATE TABLE "EmailConfiguration" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "provider" VARCHAR(50) NOT NULL DEFAULT 'smtp',  -- 'smtp', 'resend', 'sendgrid'
  "domain" VARCHAR(255),                           -- 'empresaA.com'
  "from_email" VARCHAR(255) NOT NULL,              -- 'contacto@empresaA.com'
  "from_name" VARCHAR(255),                        -- 'Empresa A'
  
  -- Configuración específica del provider (encriptado)
  "smtp_host" VARCHAR(255),
  "smtp_port" INTEGER,
  "smtp_user" VARCHAR(255),
  "smtp_pass_encrypted" TEXT,
  
  -- Para Resend/otros
  "api_key_encrypted" TEXT,
  
  -- Estado de verificación
  "verified" BOOLEAN DEFAULT false,
  "verification_status" VARCHAR(50),               -- 'pending', 'verified', 'failed'
  "dns_records" JSONB,                             -- Registros DNS requeridos
  
  -- Metadatos
  "is_default" BOOLEAN DEFAULT false,              -- Email por defecto para este usuario
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP,
  "last_verified_at" TIMESTAMP
);

-- Índices
CREATE INDEX idx_email_config_user ON "EmailConfiguration"("user_id");
CREATE INDEX idx_email_config_verified ON "EmailConfiguration"("verified");
CREATE UNIQUE INDEX idx_email_config_domain_user ON "EmailConfiguration"("domain", "user_id");
```

### Campos Importantes

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `user_id` | Usuario/empresa propietaria | `123` |
| `provider` | Servicio de email a usar | `'resend'`, `'smtp'`, `'sendgrid'` |
| `domain` | Dominio del email | `'empresaA.com'` |
| `from_email` | Email completo del remitente | `'contacto@empresaA.com'` |
| `from_name` | Nombre del remitente | `'Empresa A Soporte'` |
| `api_key_encrypted` | API key encriptada | `encrypted_string` |
| `verified` | Si el dominio está verificado | `true`/`false` |
| `dns_records` | Registros DNS para verificar | `{ spf: '...', dkim: '...' }` |
| `is_default` | Configuración por defecto del usuario | `true`/`false` |

### Flujo de Verificación de Dominio

```
1. USUARIO INICIA CONFIGURACIÓN
   | Usuario va a Configuración → Emails
   ↓
2. AGREGAR DOMINIO
   | Usuario ingresa:
   |   - Dominio: empresaA.com
   |   - Email: contacto@empresaA.com
   |   - Nombre: Empresa A
   ↓
3. REGISTRAR EN RESEND
   | POST https://api.resend.com/domains
   | { name: "empresaA.com" }
   ↓
4. OBTENER REGISTROS DNS
   | GET https://api.resend.com/domains/empresaA.com
   | Response:
   | {
   |   status: "pending",
   |   records: [
   |     { type: "TXT", name: "@", value: "v=spf1 include:resend.io ~all" },
   |     { type: "TXT", name: "resend._domainkey", value: "..." },
   |     { type: "TXT", name: "_dmarc", value: "v=DMARC1; p=none" }
   |   ]
   | }
   ↓
5. MOSTRAR INSTRUCCIONES AL USUARIO
   | "Agrega estos registros DNS en tu proveedor:"
   | 
   | Tipo    Nombre                  Valor
   | ------------------------------------------------
   | TXT     @                       v=spf1 include:resend.io ~all
   | TXT     resend._domainkey       p=MIGfMA0GCS...
   | TXT     _dmarc                  v=DMARC1; p=none
   |
   | "Una vez agregados, haz clic en 'Verificar'"
   ↓
6. VERIFICACIÓN
   | Usuario hace clic en "Verificar"
   | 
   | POST https://api.resend.com/domains/empresaA.com/verify
   | 
   | If verificado:
   |   - verified = true
   |   - verification_status = 'verified'
   | Else:
   |   - verified = false
   |   - verification_status = 'pending'
   |   - Mostrar mensaje: "Todavía no detectamos los registros DNS..."
   ↓
7. DOMINIO VERIFICADO ✅
   | Usuario ya puede enviar emails desde contacto@empresaA.com
```

## 🔧 Implementación Técnica

### 1. Registro en Resend

**Crear cuenta:**
1. Ir a [resend.com](https://resend.com)
2. Crear cuenta (gratis hasta 100k emails/mes)
3. Obtener API Key desde el dashboard

**API Key de la plataforma:**
```env
# En .env.local del servidor (NO exponer al cliente)
RESEND_API_KEY=re_123456789_abcdefghijklmnopqrstuvwxyz
```

**Importante:** Esta es la API key MAESTRA de la plataforma. Con ella, puedes gestionar dominios de todos los usuarios.

### 2. Instalar SDK de Resend

```bash
npm install resend
```

### 3. API de Resend para Dominios

**Agregar un dominio:**
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function addDomain(domain: string) {
  const response = await resend.domains.create({
    name: domain,
    region: 'us-east-1'  // o 'eu-west-1'
  });
  
  return response;
  // {
  //   id: 'd91cd9bd-1176-453e-8fc1-35364d380206',
  //   name: 'empresaA.com',
  //   status: 'pending',
  //   created_at: '2025-10-26T10:00:00.000Z',
  //   region: 'us-east-1',
  //   records: [...]
  // }
}
```

**Obtener registros DNS:**
```typescript
async function getDomainDNS(domainId: string) {
  const domain = await resend.domains.get(domainId);
  
  return domain.records;
  // [
  //   {
  //     record: "TXT",
  //     name: "resend._domainkey",
  //     value: "p=MIGfMA0GCSqGSIb3DQEBAQUAA4...",
  //     status: "pending"
  //   },
  //   {
  //     record: "TXT",
  //     name: "@",
  //     value: "v=spf1 include:resend.io ~all",
  //     status: "pending"
  //   }
  // ]
}
```

**Verificar dominio:**
```typescript
async function verifyDomain(domainId: string) {
  const result = await resend.domains.verify(domainId);
  
  return result;
  // {
  //   object: 'domain',
  //   id: 'd91cd9bd-1176-453e-8fc1-35364d380206',
  //   verified: true
  // }
}
```

**Listar dominios:**
```typescript
async function listDomains() {
  const domains = await resend.domains.list();
  return domains;
}
```

### 4. Envío de Emails por Dominio Verificado

**Actualizar EmailService:**
```typescript
// lib/email-service-multi-tenant.ts
import { Resend } from 'resend';
import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string | string[];
  from?: string;
  fromName?: string;
  subject: string;
  text?: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
  priority?: 'high' | 'normal' | 'low';
}

export class MultiTenantEmailService {
  private resend: Resend;
  
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }
  
  async sendEmail(userId: number, options: EmailOptions): Promise<boolean> {
    try {
      // Obtener configuración de email del usuario
      const config = await this.getUserEmailConfig(userId);
      
      if (!config) {
        throw new Error('User has no email configuration');
      }
      
      if (!config.verified) {
        throw new Error('Email domain not verified');
      }
      
      // Enviar según el provider configurado
      if (config.provider === 'resend') {
        return await this.sendViaResend(config, options);
      } else if (config.provider === 'smtp') {
        return await this.sendViaSMTP(config, options);
      }
      
      throw new Error('Unsupported email provider');
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }
  
  private async sendViaResend(
    config: EmailConfiguration,
    options: EmailOptions
  ): Promise<boolean> {
    const from = options.fromName 
      ? `${options.fromName} <${config.from_email}>`
      : config.from_email;
    
    const response = await this.resend.emails.send({
      from: from,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      text: options.text,
      html: options.html,
      cc: options.cc ? (Array.isArray(options.cc) ? options.cc : [options.cc]) : undefined,
      bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc : [options.bcc]) : undefined,
      headers: options.priority ? { 'X-Priority': options.priority } : undefined
    });
    
    return !!response.id;
  }
  
  private async sendViaSMTP(
    config: EmailConfiguration,
    options: EmailOptions
  ): Promise<boolean> {
    // Desencriptar credenciales SMTP
    const smtpPass = this.decrypt(config.smtp_pass_encrypted);
    
    const transporter = nodemailer.createTransport({
      host: config.smtp_host,
      port: config.smtp_port,
      secure: config.smtp_port === 465,
      auth: {
        user: config.smtp_user,
        pass: smtpPass
      }
    });
    
    const from = options.fromName
      ? `${options.fromName} <${config.from_email}>`
      : config.from_email;
    
    const info = await transporter.sendMail({
      from: from,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(', ') : options.cc) : undefined,
      bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc) : undefined,
      priority: options.priority
    });
    
    return !!info.messageId;
  }
  
  private async getUserEmailConfig(userId: number): Promise<EmailConfiguration | null> {
    // Buscar configuración por defecto del usuario
    const { data } = await supabase
      .from('EmailConfiguration')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single();
    
    return data;
  }
  
  private decrypt(encrypted: string): string {
    // Implementar desencriptación (usar crypto de Node.js)
    // Por ejemplo, con AES-256
    return encrypted; // Placeholder
  }
}

export const multiTenantEmailService = new MultiTenantEmailService();
```

### 5. Actualizar Workflow Execution Service

```typescript
// lib/workflow-execution-service.ts

// ANTES:
import { emailService } from '@/lib/email-service';

// DESPUÉS:
import { multiTenantEmailService } from '@/lib/email-service-multi-tenant';

// En el método executeSendEmailStep:
private async executeSendEmailStep(
  configs: any,
  context: WorkflowContext,
  logs: string[]
): Promise<void> {
  // ... procesamiento de variables ...
  
  // Obtener user_id del contexto del workflow
  const userId = context.user_id || 1; // Debe venir del workflow
  
  // Enviar usando el servicio multi-tenant
  const success = await multiTenantEmailService.sendEmail(userId, {
    to: processedRecipient,
    subject: processedSubject,
    html: processedBody,
    fromName: configs.fromName,
    cc: configs.cc ? this.processVariables(configs.cc, context) : undefined,
    bcc: configs.bcc ? this.processVariables(configs.bcc, context) : undefined,
    priority: configs.priority || 'normal'
  });
  
  if (!success) {
    throw new Error('Failed to send email');
  }
  
  logs.push('Email sent successfully');
}
```

## 📝 Pasos de Implementación

### Fase 1: Setup Inicial

1. **Crear cuenta en Resend**
   - Registrarse en [resend.com](https://resend.com)
   - Obtener API Key
   - Agregar a `.env.local`: `RESEND_API_KEY=re_...`

2. **Instalar dependencias**
   ```bash
   npm install resend
   npm install @types/crypto-js crypto-js  # Para encriptación
   ```

3. **Crear migración de base de datos**
   ```bash
   # Crear archivo: supabase/migrations/add-email-configuration.sql
   ```
   ```sql
   CREATE TABLE "EmailConfiguration" (
     "id" SERIAL PRIMARY KEY,
     "user_id" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
     "provider" VARCHAR(50) NOT NULL DEFAULT 'smtp',
     "domain" VARCHAR(255),
     "from_email" VARCHAR(255) NOT NULL,
     "from_name" VARCHAR(255),
     "smtp_host" VARCHAR(255),
     "smtp_port" INTEGER,
     "smtp_user" VARCHAR(255),
     "smtp_pass_encrypted" TEXT,
     "api_key_encrypted" TEXT,
     "resend_domain_id" VARCHAR(255),
     "verified" BOOLEAN DEFAULT false,
     "verification_status" VARCHAR(50) DEFAULT 'pending',
     "dns_records" JSONB,
     "is_default" BOOLEAN DEFAULT false,
     "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     "updated_at" TIMESTAMP,
     "last_verified_at" TIMESTAMP
   );
   
   CREATE INDEX idx_email_config_user ON "EmailConfiguration"("user_id");
   CREATE INDEX idx_email_config_verified ON "EmailConfiguration"("verified");
   CREATE UNIQUE INDEX idx_email_config_domain_user ON "EmailConfiguration"("domain", "user_id");
   ```

### Fase 2: Backend - API Endpoints

1. **API para gestionar configuraciones de email**
   
   ```typescript
   // app/api/email-config/route.ts
   
   // POST - Crear nueva configuración
   export async function POST(req: NextRequest) {
     const { user_id, provider, domain, from_email, from_name } = await req.json();
     
     // Si provider === 'resend', registrar dominio en Resend
     if (provider === 'resend') {
       const resend = new Resend(process.env.RESEND_API_KEY);
       const domainResponse = await resend.domains.create({ name: domain });
       
       // Guardar en BD
       const { data, error } = await supabase
         .from('EmailConfiguration')
         .insert([{
           user_id,
           provider,
           domain,
           from_email,
           from_name,
           resend_domain_id: domainResponse.id,
           dns_records: domainResponse.records,
           verified: false,
           verification_status: 'pending'
         }])
         .select()
         .single();
       
       return NextResponse.json(data);
     }
     
     // ... manejar otros providers ...
   }
   
   // GET - Listar configuraciones del usuario
   export async function GET(req: NextRequest) {
     const { searchParams } = new URL(req.url);
     const user_id = searchParams.get('user_id');
     
     const { data, error } = await supabase
       .from('EmailConfiguration')
       .select('*')
       .eq('user_id', user_id);
     
     return NextResponse.json(data);
   }
   ```

2. **API para verificar dominio**
   
   ```typescript
   // app/api/email-config/[id]/verify/route.ts
   
   export async function POST(
     req: NextRequest,
     { params }: { params: { id: string } }
   ) {
     const { id } = params;
     
     // Obtener configuración
     const { data: config } = await supabase
       .from('EmailConfiguration')
       .select('*')
       .eq('id', id)
       .single();
     
     if (!config || config.provider !== 'resend') {
       return NextResponse.json({ error: 'Invalid configuration' }, { status: 400 });
     }
     
     // Verificar en Resend
     const resend = new Resend(process.env.RESEND_API_KEY);
     const result = await resend.domains.verify(config.resend_domain_id);
     
     // Actualizar en BD
     await supabase
       .from('EmailConfiguration')
       .update({
         verified: result.verified,
         verification_status: result.verified ? 'verified' : 'pending',
         last_verified_at: new Date().toISOString()
       })
       .eq('id', id);
     
     return NextResponse.json(result);
   }
   ```

### Fase 3: Frontend - UI para Configuración

1. **Página de configuración de email**
   
   ```typescript
   // app/dashboard/settings/email/page.tsx
   
   export default function EmailConfigPage() {
     const [configs, setConfigs] = useState([]);
     const [showAddDialog, setShowAddDialog] = useState(false);
     
     return (
       <div>
         <h1>Configuración de Email</h1>
         
         {/* Lista de configuraciones existentes */}
         {configs.map(config => (
           <div key={config.id} className="border p-4 rounded">
             <div className="flex justify-between">
               <div>
                 <h3>{config.from_name}</h3>
                 <p>{config.from_email}</p>
                 {config.verified ? (
                   <Badge variant="success">✓ Verificado</Badge>
                 ) : (
                   <Badge variant="warning">Pendiente verificación</Badge>
                 )}
               </div>
               {!config.verified && (
                 <Button onClick={() => verifyDomain(config.id)}>
                   Verificar Dominio
                 </Button>
               )}
             </div>
             
             {!config.verified && config.dns_records && (
               <div className="mt-4">
                 <h4>Registros DNS requeridos:</h4>
                 <table>
                   <thead>
                     <tr>
                       <th>Tipo</th>
                       <th>Nombre</th>
                       <th>Valor</th>
                     </tr>
                   </thead>
                   <tbody>
                     {config.dns_records.map((record, i) => (
                       <tr key={i}>
                         <td>{record.record}</td>
                         <td>{record.name}</td>
                         <td className="font-mono text-sm">{record.value}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             )}
           </div>
         ))}
         
         {/* Botón para agregar nueva configuración */}
         <Button onClick={() => setShowAddDialog(true)}>
           + Agregar Configuración de Email
         </Button>
         
         {/* Dialog para agregar */}
         <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
           {/* Formulario para agregar dominio */}
         </Dialog>
       </div>
     );
   }
   ```

### Fase 4: Integración con Workflows

1. **Actualizar workflow execution para usar user_id**
   
   ```typescript
   // Asegurar que el contexto del workflow incluya user_id
   // Para que multiTenantEmailService pueda buscar la configuración correcta
   
   const context = {
     trigger_type: 'form_submission',
     user_id: workflow.user_id,  // ← Importante
     form_id: formId,
     form_data: formData,
     ...formData
   };
   ```

2. **Actualizar UI del workflow builder**
   - Remover el campo "from" del formulario de email
   - El "from" se determinará automáticamente según la configuración del usuario
   - O permitir seleccionar entre las configuraciones verificadas del usuario

### Fase 5: Testing

1. **Test de registro de dominio**
   ```bash
   # Usar Postman o similar
   POST /api/email-config
   {
     "user_id": 1,
     "provider": "resend",
     "domain": "test-domain.com",
     "from_email": "hello@test-domain.com",
     "from_name": "Test Company"
   }
   ```

2. **Configurar DNS en proveedor**
   - Ir al proveedor de dominio (GoDaddy, Namecheap, Cloudflare, etc.)
   - Agregar los registros TXT proporcionados

3. **Test de verificación**
   ```bash
   POST /api/email-config/{id}/verify
   ```

4. **Test de envío**
   - Crear un workflow
   - Configurar acción de email
   - Ejecutar y verificar que el email llegue desde el dominio verificado

## 💰 Costos y Consideraciones

### Pricing de Resend

**Plan Gratuito:**
- ✅ 3,000 emails / mes
- ✅ 1 dominio verificado
- ✅ API access completo
- ✅ Email analytics básico

**Plan Pro ($20/mes):**
- 50,000 emails / mes
- Dominios ilimitados
- Webhooks
- Email analytics avanzado
- Support prioritario

**Plan Business (Personalizado):**
- 100,000+ emails / mes
- IP dedicada
- SLA guarantees
- Support dedicado

### Estimación de Costos

**Escenario: 10 empresas en la plataforma**
- Emails por empresa: ~500/mes
- Total: 5,000 emails/mes
- **Costo: $0** (dentro del plan gratuito)

**Escenario: 50 empresas**
- Emails por empresa: ~1,000/mes
- Total: 50,000 emails/mes
- **Costo: $20/mes** (Plan Pro)

**Escenario: 200 empresas**
- Emails por empresa: ~1,000/mes
- Total: 200,000 emails/mes
- **Costo: ~$100/mes** (Plan Business)

### Comparación con Alternativas

| Proveedor | Gratis | Paid (50k emails/mes) | Multi-Domain | API Quality |
|-----------|--------|----------------------|--------------|-------------|
| **Resend** | 3k emails | $20 | ✅ Excelente | ⭐⭐⭐⭐⭐ |
| **SendGrid** | 100 emails/día | $20 | ✅ Bueno | ⭐⭐⭐⭐ |
| **Postmark** | Sin plan gratuito | $15 | ✅ Excelente | ⭐⭐⭐⭐⭐ |
| **AWS SES** | 62k emails/mes | $5 + costos | ✅ Complejo | ⭐⭐⭐ |
| **Mailgun** | 5k emails/mes | $35 | ✅ Bueno | ⭐⭐⭐⭐ |

**Recomendación:** Resend es la mejor opción para empezar por su:
- API moderna y simple
- Plan gratuito generoso
- Excelente soporte para multi-tenant
- Developer experience superior

### Límites de Envío

**Consideraciones importantes:**
- **Rate limits**: Resend permite ~200 emails/segundo (más que suficiente)
- **Bounce rate**: Mantener < 5% para evitar penalizaciones
- **Spam complaints**: Mantener < 0.1%
- **Email verification**: Considerar usar un servicio para validar emails antes de enviar

## 📚 Recursos y Referencias

### Documentación de Resend

- **Sitio oficial**: https://resend.com
- **Documentación**: https://resend.com/docs
- **API Reference**: https://resend.com/docs/api-reference
- **SDK Node.js**: https://github.com/resendlabs/resend-node
- **React Email**: https://react.email

### Guías de Verificación de Dominios

**SPF (Sender Policy Framework):**
- Define qué servidores pueden enviar email desde tu dominio
- Formato: `v=spf1 include:resend.io ~all`
- [Guía SPF](https://www.dmarcanalyzer.com/spf/)

**DKIM (DomainKeys Identified Mail):**
- Firma criptográfica para autenticar emails
- Resend proporciona el registro automáticamente
- [Guía DKIM](https://www.dmarcanalyzer.com/dkim/)

**DMARC (Domain-based Message Authentication):**
- Política de autenticación para el dominio
- Formato: `v=DMARC1; p=none; rua=mailto:dmarc@ejemplo.com`
- [Guía DMARC](https://dmarc.org/)

### Mejores Prácticas

1. **Autenticación de Dominio:**
   - Siempre configurar SPF, DKIM y DMARC
   - Verificar dominio antes de enviar en producción
   - Monitorear el estado de verificación regularmente

2. **Contenido de Emails:**
   - Incluir siempre un link de "unsubscribe"
   - Usar templates HTML responsivos
   - Probar en múltiples clientes de email
   - Evitar palabras de spam

3. **Gestión de Listas:**
   - Implementar doble opt-in
   - Permitir fácil unsubscribe
   - Limpiar listas regularmente (remover bounces)
   - Segmentar audiencias

4. **Monitoreo:**
   - Trackear open rates y click rates
   - Monitorear bounce rates
   - Configurar webhooks para eventos importantes
   - Alertar sobre problemas de deliverability

5. **Seguridad:**
   - Encriptar API keys en base de datos
   - Nunca exponer API keys al cliente
   - Usar HTTPS para todas las comunicaciones
   - Implementar rate limiting en endpoints de envío

### Herramientas Útiles

- **Mail Tester**: https://www.mail-tester.com - Test de spam score
- **MX Toolbox**: https://mxtoolbox.com - Verificación de DNS
- **Email on Acid**: https://www.emailonacid.com - Test de rendering
- **Litmus**: https://www.litmus.com - Test en múltiples clientes
- **DMARC Analyzer**: https://www.dmarcanalyzer.com - Análisis de autenticación

## 🎯 Próximos Pasos

### Roadmap de Implementación

**MVP (Mínimo Producto Viable):**
1. ✅ Configuración SMTP actual (Ya implementado)
2. ⏳ Crear tabla EmailConfiguration
3. ⏳ Implementar API de gestión de dominios
4. ⏳ Crear UI de configuración de email
5. ⏳ Integrar Resend SDK
6. ⏳ Actualizar EmailService para multi-tenant
7. ⏳ Testing con un dominio de prueba

**Mejoras Futuras:**
- Templates de email con React Email
- Webhooks para tracking de eventos (opens, clicks, bounces)
- Analytics de email por usuario
- A/B testing de emails
- Programación de envíos
- Soporte para adjuntos desde storage
- Email builder visual en el workflow
- Integración con otros providers (SendGrid, Postmark)

---

**Última actualización:** Octubre 2025  
**Versión:** 1.0.0  
**Autor:** Alejo Galetto

