import Link from "next/link"
import { CheckCircle2, ArrowLeft, Database, GitBranch } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Mock form data - in a real app, this would come from an API or database
const formTemplates = {
  "customer-feedback": {
    id: "customer-feedback",
    title: "Customer Feedback",
    description: "We value your feedback. Please let us know how we're doing.",
    successMessage: "Thank you for your feedback!",
    connections: {
      database: {
        connected: true,
        name: "Customers",
      },
      workflow: {
        connected: true,
        name: "Customer Feedback Processing",
      },
    },
  },
  "contact-form": {
    id: "contact-form",
    title: "Contact Us",
    description: "Have questions? Get in touch with our team.",
    successMessage: "Thank you for contacting us!",
    connections: {
      database: {
        connected: true,
        name: "Contacts",
      },
      workflow: {
        connected: true,
        name: "Contact Form Processing",
      },
    },
  },
  "job-application": {
    id: "job-application",
    title: "Job Application",
    description: "Apply for open positions at our company.",
    successMessage: "Thank you for your application!",
    connections: {
      database: {
        connected: true,
        name: "Job Applications",
      },
      workflow: {
        connected: true,
        name: "Application Processing",
      },
    },
  },
}

export default function FormSuccessPage({ params }) {
  const { formId } = params
  const form = formTemplates[formId] || {
    title: "Form Submission",
    successMessage: "Thank you for your submission!",
    connections: {
      database: { connected: true, name: "Database" },
      workflow: { connected: true, name: "Workflow" },
    },
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link href="/forms" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span className="font-medium">Back to Forms</span>
        </Link>
      </header>

      <div className="container max-w-3xl mx-auto py-12 px-4 md:px-6">
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
            </div>
            <CardTitle className="text-2xl">{form.successMessage}</CardTitle>
            <CardDescription>Your submission has been received and will be processed shortly.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-2">What happens next?</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                    <span>Your information has been securely stored in our database</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                    <span>You'll receive a confirmation email shortly</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                    <span>Our team will review your submission and take appropriate action</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-2">System Processes</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Database className="h-5 w-5 mr-2 text-blue-500" />
                    <div>
                      <p className="font-medium text-sm">Database Storage</p>
                      <p className="text-xs text-muted-foreground">
                        Data saved to {form.connections.database.name} database
                      </p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 ml-auto text-green-500" />
                  </div>

                  <div className="flex items-center">
                    <GitBranch className="h-5 w-5 mr-2 text-amber-500" />
                    <div>
                      <p className="font-medium text-sm">Workflow Triggered</p>
                      <p className="text-xs text-muted-foreground">
                        {form.connections.workflow.name} workflow initiated
                      </p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 ml-auto text-green-500" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline" asChild>
              <Link href={`/forms/${formId}`}>Submit Another Response</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
