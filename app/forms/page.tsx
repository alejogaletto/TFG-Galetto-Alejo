import Link from "next/link"
import { FileText, ArrowRight, Search, Filter, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock form data - in a real app, this would come from an API or database
const forms = [
  {
    id: "customer-feedback",
    title: "Customer Feedback",
    description: "Collect feedback from customers about their experience",
    submissions: 145,
    lastSubmission: "2 hours ago",
    status: "active",
    color: "#4f46e5",
  },
  {
    id: "contact-form",
    title: "Contact Us",
    description: "Allow users to get in touch with your team",
    submissions: 78,
    lastSubmission: "1 day ago",
    status: "active",
    color: "#0ea5e9",
  },
  {
    id: "job-application",
    title: "Job Application",
    description: "Collect applications for open positions",
    submissions: 32,
    lastSubmission: "3 days ago",
    status: "active",
    color: "#10b981",
  },
  {
    id: "event-registration",
    title: "Event Registration",
    description: "Register attendees for upcoming events",
    submissions: 0,
    lastSubmission: null,
    status: "draft",
    color: "#f59e0b",
  },
]

export default function FormsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link className="flex items-center gap-2 font-semibold" href="/">
          <span className="font-bold">AutomateSMB</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm">
            Login
          </Button>
          <Button size="sm">Sign Up</Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Public Forms</h1>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Browse and submit forms created with our platform
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-16 lg:py-20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex items-center gap-2">
                  <Input placeholder="Search forms..." className="max-w-sm" icon={<Search className="h-4 w-4" />} />
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                    <span className="sr-only">Filter</span>
                  </Button>
                </div>
                <Tabs defaultValue="all">
                  <TabsList>
                    <TabsTrigger value="all">All Forms</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="recent">Recently Updated</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {forms.map((form) => (
                  <Card key={form.id} className="overflow-hidden">
                    <CardHeader className="pb-3" style={{ borderBottom: `4px solid ${form.color}` }}>
                      <div className="flex justify-between items-start">
                        <CardTitle>{form.title}</CardTitle>
                        <Badge variant={form.status === "active" ? "default" : "outline"}>
                          {form.status === "active" ? "Active" : "Draft"}
                        </Badge>
                      </div>
                      <CardDescription>{form.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">Submissions</p>
                          <p className="text-2xl font-bold">{form.submissions}</p>
                        </div>
                        {form.lastSubmission && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>Last: {form.lastSubmission}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/forms/${form.id}`}>
                          <FileText className="h-4 w-4 mr-2" />
                          View Form
                        </Link>
                      </Button>
                      <Button size="sm" asChild>
                        <Link href={`/forms/${form.id}`}>
                          Fill Out
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full border-t px-4 md:px-6">
        <p className="text-xs text-muted-foreground">© 2023 AutomateSMB. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Contact
          </Link>
        </nav>
      </footer>
    </div>
  )
}
