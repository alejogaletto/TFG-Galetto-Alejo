import nodemailer from "nodemailer"

// Configuración del transportador de email
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number.parseInt(process.env.SMTP_PORT || "587"),
    secure: false, // true para 465, false para otros puertos
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export interface EmailOptions {
  to: string | string[]
  subject: string
  text?: string
  html?: string
  from?: string
  cc?: string | string[]
  bcc?: string | string[]
  priority?: "high" | "normal" | "low"
  attachments?: any[]
}

export class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = createTransporter()
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: options.from || process.env.SMTP_FROM || process.env.SMTP_USER,
        to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(", ") : options.cc) : undefined,
        bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(", ") : options.bcc) : undefined,
        priority: options.priority,
        attachments: options.attachments,
      }

      const info = await this.transporter.sendMail(mailOptions)
      console.log("Email enviado:", info.messageId || "No message ID")
      return true
    } catch (error) {
      console.error("Error enviando email:", error)
      return false
    }
  }

  async sendWelcomeEmail(to: string, userName: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">¡Bienvenido a AutomatePyme!</h1>
        <p>Hola ${userName},</p>
        <p>Gracias por registrarte en nuestra plataforma de automatización low-code.</p>
        <p>Ya puedes comenzar a crear tus soluciones personalizadas:</p>
        <ul>
          <li>Construye formularios dinámicos</li>
          <li>Crea flujos de trabajo automatizados</li>
          <li>Gestiona bases de datos</li>
          <li>Desarrolla soluciones completas</li>
        </ul>
        <p>¡Esperamos que disfrutes de la experiencia!</p>
        <p>Saludos,<br>El equipo de AutomatePyme</p>
      </div>
    `

    return this.sendEmail({
      to,
      subject: "¡Bienvenido a AutomatePyme!",
      html,
      text: `¡Bienvenido a AutomatePyme, ${userName}! Gracias por registrarte en nuestra plataforma.`,
    })
  }

  async sendPasswordResetEmail(to: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/update?token=${resetToken}`

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Restablecer Contraseña</h1>
        <p>Has solicitado restablecer tu contraseña en AutomatePyme.</p>
        <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
        <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Restablecer Contraseña
        </a>
        <p>Este enlace expirará en 1 hora.</p>
        <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
        <p>Saludos,<br>El equipo de AutomatePyme</p>
      </div>
    `

    return this.sendEmail({
      to,
      subject: "Restablecer Contraseña - AutomatePyme",
      html,
      text: `Restablecer contraseña: ${resetUrl}`,
    })
  }

  async sendFormSubmissionNotification(
    to: string,
    formName: string,
    submissionData: Record<string, any>,
  ): Promise<boolean> {
    const dataRows = Object.entries(submissionData)
      .map(
        ([key, value]) =>
          `<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>${key}:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${value}</td></tr>`,
      )
      .join("")

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Nueva Respuesta de Formulario</h1>
        <p>Se ha recibido una nueva respuesta para el formulario: <strong>${formName}</strong></p>
        <h3>Datos enviados:</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          ${dataRows}
        </table>
        <p>Fecha: ${new Date().toLocaleString("es-ES")}</p>
        <p>Saludos,<br>AutomatePyme</p>
      </div>
    `

    return this.sendEmail({
      to,
      subject: `Nueva respuesta: ${formName}`,
      html,
      text: `Nueva respuesta para ${formName}. Datos: ${JSON.stringify(submissionData, null, 2)}`,
    })
  }

  async sendWorkflowNotification(
    to: string,
    workflowName: string,
    status: "completed" | "failed",
    details?: string,
  ): Promise<boolean> {
    const statusText = status === "completed" ? "completado exitosamente" : "falló"
    const statusColor = status === "completed" ? "#28a745" : "#dc3545"

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Notificación de Workflow</h1>
        <p>El workflow <strong>${workflowName}</strong> se ha <span style="color: ${statusColor};">${statusText}</span>.</p>
        ${details ? `<p><strong>Detalles:</strong> ${details}</p>` : ""}
        <p>Fecha: ${new Date().toLocaleString("es-ES")}</p>
        <p>Saludos,<br>AutomatePyme</p>
      </div>
    `

    return this.sendEmail({
      to,
      subject: `Workflow ${statusText}: ${workflowName}`,
      html,
      text: `El workflow ${workflowName} se ha ${statusText}. ${details || ""}`,
    })
  }
}

// Instancia singleton del servicio de email
export const emailService = new EmailService()
