import { NextRequest, NextResponse } from "next/server"
import { emailService } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, text, html, from, cc, bcc, priority, attachments } = body

    // Validate required fields
    if (!to) {
      return NextResponse.json(
        { error: "Recipient is required" },
        { status: 400 }
      )
    }
    if (!subject) {
      return NextResponse.json(
        { error: "Subject is required" },
        { status: 400 }
      )
    }
    if (!text && !html) {
      return NextResponse.json(
        { error: "Text or HTML content is required" },
        { status: 400 }
      )
    }

    // Send email
    const success = await emailService.sendEmail({
      to,
      subject,
      text,
      html,
      from,
      cc,
      bcc,
      priority,
      attachments
    })

    if (success) {
      return NextResponse.json(
        { 
          success: true, 
          message: "Email sent successfully",
          timestamp: new Date().toISOString()
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Email API error:", error)
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
