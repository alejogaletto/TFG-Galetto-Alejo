# 📧 Instrucciones de Configuración SMTP con Gmail

## ✅ Estado Actual del Sistema

El sistema de envío de emails ya está **completamente implementado** y listo para usar. Solo necesitas configurar las credenciales SMTP de Gmail.

### Archivos del Sistema

- ✅ `lib/email-service.ts` - Servicio de email con nodemailer
- ✅ `lib/workflow-execution-service.ts` - Ejecución de workflows con envío de emails
- ✅ `lib/workflow-trigger-service.ts` - Detección y activación de triggers
- ✅ `app/api/workflows/execute/route.ts` - Endpoint para ejecutar workflows
- ✅ `docs/workflows.md` - Documentación completa del sistema
- ✅ `docs/multi-tenant-email-setup.md` - Guía para implementación multi-tenant futura

## 🚀 Configuración Rápida (5 minutos)

### Paso 1: Habilitar Verificación en 2 Pasos en Gmail

1. Ve a tu **Cuenta de Google**: https://myaccount.google.com
2. Navega a **Seguridad** (menú izquierdo)
3. Busca **Verificación en 2 pasos**
4. Si no está activada, haz clic en **Activar** y sigue los pasos

> ⚠️ **Importante**: La verificación en 2 pasos es OBLIGATORIA para crear App Passwords.

### Paso 2: Generar App Password

1. En la misma página de **Seguridad**, busca **Contraseñas de aplicación**
   - Puede estar al final de la sección "Acceso a Google"
   - URL directa: https://myaccount.google.com/apppasswords

2. Haz clic en **Contraseñas de aplicación**

3. En el selector "Seleccionar app", elige:
   - **Correo** (o "Mail")

4. En el selector "Seleccionar dispositivo", elige:
   - **Otro (nombre personalizado)**
   - Escribe: "AutomateSMB Platform"

5. Haz clic en **GENERAR**

6. Gmail te mostrará una contraseña de 16 caracteres como:
   ```
   abcd efgh ijkl mnop
   ```
   
7. **¡COPIA ESTA CONTRASEÑA!** No podrás verla de nuevo.

### Paso 3: Configurar Variables de Entorno

1. **Abre o crea** el archivo `.env.local` en la raíz del proyecto:
   ```bash
   cd /Users/alejogaletto/Desktop/projects/TFG-Galetto-Alejo
   touch .env.local  # Si no existe
   ```

2. **Agrega o actualiza** las siguientes líneas:
   ```env
   # Email Configuration (SMTP - Gmail)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=tu-email@gmail.com
   SMTP_PASS=abcd efgh ijkl mnop
   SMTP_FROM=tu-email@gmail.com
   ```

3. **Reemplaza**:
   - `tu-email@gmail.com` → Tu dirección de Gmail completa
   - `abcd efgh ijkl mnop` → La App Password que acabas de generar

   **Ejemplo completo:**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=alejo@gmail.com
   SMTP_PASS=xyzw abcd efgh ijkl
   SMTP_FROM=alejo@gmail.com
   ```

4. **Guarda** el archivo

### Paso 4: Reiniciar el Servidor

```bash
# Si el servidor está corriendo, detenerlo (Ctrl+C) y reiniciar:
npm run dev
```

## ✅ Verificar que Funciona

### Opción 1: Desde la UI del Workflow Builder

1. Ve a **Dashboard → Workflows**
2. Crea un nuevo workflow
3. En el **Paso 2**, agrega un trigger de prueba (o sáltalo)
4. En el **Paso 3**, agrega un paso de tipo **"Enviar Email"**
5. Configura:
   - **Destinatario**: Tu email personal para recibir la prueba
   - **Asunto**: `Test desde AutomateSMB`
   - **Mensaje**: `Este es un email de prueba. ¡El sistema funciona!`
6. Guarda el workflow
7. Ejecútalo manualmente desde el botón "Probar"
8. **Revisa tu bandeja de entrada** (y carpeta de spam por si acaso)

### Opción 2: Desde la API (Postman/cURL)

```bash
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "tu-email@example.com",
    "subject": "Test desde AutomateSMB",
    "html": "<h1>¡Funciona!</h1><p>El email llegó correctamente.</p>"
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "timestamp": "2025-10-26T..."
}
```

## 🎯 Casos de Uso del Sistema

Ahora que el email está configurado, puedes usar workflows para:

### 1. Confirmación de Formularios
```
Formulario de Contacto (trigger)
  ↓
Guardar en Base de Datos
  ↓
Enviar email al usuario: "Gracias por contactarnos, {{name}}"
  ↓
Enviar email al admin: "Nuevo mensaje de {{name}} ({{email}})"
```

### 2. Notificaciones de Cambios en BD
```
Se crea un pedido en tabla "Pedidos" (trigger)
  ↓
Enviar email al cliente: "Tu pedido #{{record_id}} ha sido confirmado"
  ↓
Enviar email al equipo de ventas: "Nuevo pedido de {{cliente_nombre}}"
```

### 3. Workflows con Variables Dinámicas
```
Email personalizado:
  Asunto: Gracias por tu mensaje, {{name}}
  
  Cuerpo:
  Hola {{name}},
  
  Hemos recibido tu mensaje: "{{mensaje}}"
  Te responderemos a {{email}} pronto.
  
  Fecha: {{date}}
  Hora: {{time}}
  
  Saludos,
  Equipo AutomateSMB
```

## 🔍 Solución de Problemas

### Error: "Invalid login credentials"

**Causa**: Contraseña incorrecta o no es un App Password

**Solución**:
1. Verifica que estés usando el **App Password** (16 caracteres)
2. NO uses tu contraseña normal de Gmail
3. Regenera el App Password si es necesario

### Error: "Connection timeout"

**Causa**: Puerto bloqueado o configuración incorrecta

**Solución**:
1. Verifica que `SMTP_PORT=587`
2. Verifica tu firewall/antivirus
3. Intenta con puerto `465` y cambia `secure: true` en el código

### Los emails llegan a spam

**Solución temporal**:
1. Marca el email como "No es spam" en Gmail
2. Agrega el remitente a tus contactos

**Solución a largo plazo**:
- Implementar el sistema multi-tenant con Resend
- Ver: `docs/multi-tenant-email-setup.md`

### No recibo emails

**Checklist**:
- [ ] ¿Reiniciaste el servidor después de configurar .env.local?
- [ ] ¿Revisaste la carpeta de spam?
- [ ] ¿El email destinatario está correcto?
- [ ] ¿Hay errores en la consola del servidor?
- [ ] ¿El App Password está bien copiado (sin espacios extra)?

## 📚 Documentación

### Para Entender el Sistema
Consulta la documentación completa en:
- **`docs/workflows.md`** - Sistema completo de workflows
  - Arquitectura
  - Componentes
  - Triggers (formularios y base de datos)
  - Variables dinámicas
  - Ejemplos de uso
  - API endpoints

### Para Implementar Multi-Tenant (Futuro)
- **`docs/multi-tenant-email-setup.md`** - Guía completa de implementación
  - Problema actual y solución propuesta
  - Integración con Resend
  - Arquitectura multi-tenant
  - Código de ejemplo
  - Costos y comparativas

## 🎉 ¡Listo!

Tu sistema de emails está configurado y listo para usar. Ahora puedes:

1. ✅ Crear workflows con triggers de formularios
2. ✅ Crear workflows con triggers de cambios en base de datos
3. ✅ Enviar emails automáticos con variables dinámicas
4. ✅ Guardar datos en bases de datos desde workflows
5. ✅ Ver logs de ejecución de workflows

**Próximos pasos sugeridos:**
1. Crear un workflow de prueba completo
2. Probar con un formulario real
3. Revisar los logs de ejecución en WorkflowExecution
4. Cuando necesites múltiples dominios, implementar el sistema multi-tenant

---

**¿Necesitas ayuda?**
- Revisa `docs/workflows.md` para documentación completa
- Revisa los logs del servidor para errores específicos
- Prueba el endpoint `/api/email/send` directamente para aislar problemas

