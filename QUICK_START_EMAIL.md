# ⚡ Quick Start - Configuración de Email

## 📋 Checklist Rápido

### 1. Obtener Gmail App Password (5 min)

```
1. Ir a: https://myaccount.google.com/security
2. Activar "Verificación en 2 pasos" (si no está activada)
3. Buscar "Contraseñas de aplicación"
4. Generar nueva contraseña para "Correo"
5. Copiar la contraseña de 16 caracteres
```

### 2. Configurar .env.local

Crear o editar `.env.local` en la raíz del proyecto:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
SMTP_FROM=tu-email@gmail.com
```

**Reemplazar:**
- `tu-email@gmail.com` con tu Gmail
- `xxxx xxxx xxxx xxxx` con el App Password

### 3. Reiniciar Servidor

```bash
# Detener (Ctrl+C) y reiniciar:
npm run dev
```

## ✅ Probar que Funciona

### Opción 1: Desde el Dashboard

```
1. Dashboard → Workflows → Crear Workflow
2. Añadir paso "Enviar Email"
3. Configurar:
   - Para: tu-email@gmail.com
   - Asunto: Test
   - Mensaje: ¡Funciona!
4. Guardar y probar
5. Revisar bandeja de entrada
```

### Opción 2: Desde la API

```bash
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "tu-email@gmail.com",
    "subject": "Test",
    "html": "<p>¡Funciona!</p>"
  }'
```

## 📚 Documentación Completa

- **`SMTP_SETUP_INSTRUCTIONS.md`** - Instrucciones detalladas paso a paso
- **`docs/workflows.md`** - Documentación completa del sistema de workflows
- **`docs/multi-tenant-email-setup.md`** - Guía para múltiples dominios (futuro)

## 🎯 Próximo Paso

Una vez configurado el email, puedes crear workflows completos:

```
Trigger: Formulario enviado
  ↓
Acción 1: Guardar en base de datos
  ↓
Acción 2: Enviar email al usuario (con variables dinámicas {{name}}, {{email}})
  ↓
Acción 3: Enviar email al admin
```

## 💡 Variables Dinámicas

Usa `{{variable}}` en tus emails:

```
Hola {{name}},

Recibimos tu mensaje: "{{mensaje}}"

Fecha: {{date}}
Hora: {{time}}

Saludos,
{{company}}
```

---

**¿Problemas?** → Ver `SMTP_SETUP_INSTRUCTIONS.md`

