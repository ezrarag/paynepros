// TEMPORARILY DISABLED AUTH CHECK
// import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Inbox, FileText } from "lucide-react"

export default async function MessagingPage() {
  // TEMPORARILY DISABLED - Allow access without auth
  // const session = await auth()
  // if (!session?.user?.id) {
  //   redirect("/admin/login")
  // }

  // Dynamic import to prevent webpack from bundling Firebase Admin
  const { leadRepository } = await import("@/lib/repositories/lead-repository")
  const leads = await leadRepository.findByBusiness("paynepros")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Messaging</h1>
        <p className="text-muted-foreground mt-2">
          Unified inbox and Pulse summaries
        </p>
      </div>

      <Tabs defaultValue="inbox" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inbox">
            <Inbox className="h-4 w-4 mr-2" />
            Inbox
          </TabsTrigger>
          <TabsTrigger value="pulse">
            <FileText className="h-4 w-4 mr-2" />
            Pulse Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Unified Inbox</CardTitle>
              <CardDescription>
                Messages from Gmail, Outlook, WhatsApp, Instagram, Facebook
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {lead.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                            {lead.source}
                          </span>
                          {lead.serviceInterest && (
                            <span className="text-xs px-2 py-1 bg-muted rounded">
                              {lead.serviceInterest}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
                {leads.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No messages yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pulse" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Pulse Summary</CardTitle>
              <CardDescription>
                AI-generated daily summary of urgent items and follow-ups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h3 className="font-semibold mb-2">Urgent Items</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>3 clients need immediate follow-up</li>
                    <li>2 invoices overdue</li>
                  </ul>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold mb-2">Follow-ups Needed</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>5 new leads require response</li>
                    <li>2 bookkeeping documents pending</li>
                  </ul>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-semibold mb-2">Completed Today</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>3 tax returns filed</li>
                    <li>1 consultation scheduled</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date().toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

