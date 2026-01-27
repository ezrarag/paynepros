import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Users, FileText, Clock, AlertTriangle, Mail } from "lucide-react"

export default function SecurityPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          Security Center
        </h1>
        <p className="text-muted-foreground mt-2">
          Guidelines for handling sensitive client information at PaynePros
        </p>
      </div>

      {/* What We Protect */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            What We Protect
          </CardTitle>
          <CardDescription>
            Types of sensitive data we handle for clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">•</span>
              <div>
                <span className="font-medium">Social Security Numbers (SSN) & Employer IDs (EIN)</span>
                <p className="text-sm text-muted-foreground">Primary identifiers for tax filings</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">•</span>
              <div>
                <span className="font-medium">Banking & Financial Account Information</span>
                <p className="text-sm text-muted-foreground">Routing numbers, account numbers for refunds/payments</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">•</span>
              <div>
                <span className="font-medium">Income Documents (W-2, 1099, etc.)</span>
                <p className="text-sm text-muted-foreground">Wage statements and contractor income records</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">•</span>
              <div>
                <span className="font-medium">Tax Returns & Supporting Schedules</span>
                <p className="text-sm text-muted-foreground">Filed and draft returns with all attachments</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">•</span>
              <div>
                <span className="font-medium">Government-Issued IDs</span>
                <p className="text-sm text-muted-foreground">Driver's licenses, passports used for identity verification</p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Access Rules by Role */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Access Rules by Role
          </CardTitle>
          <CardDescription>
            Who can access what within the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-muted/30">
              <h4 className="font-semibold text-green-700 dark:text-green-400">Owner</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Full access to all client data, system settings, audit logs, and user management. 
                Can view, edit, and delete any record.
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-muted/30">
              <h4 className="font-semibold text-blue-700 dark:text-blue-400">Staff</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Access to assigned client workspaces only. Can view and edit client documents, 
                add notes, and communicate with clients. Cannot access other staff's clients 
                or system-wide settings.
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-muted/30">
              <h4 className="font-semibold text-amber-700 dark:text-amber-400">Student / Trainee</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Read-only access to specifically assigned training cases. Cannot edit client 
                data or access live client information without supervision. All actions are 
                logged for review.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Handling Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Data Handling Rules
          </CardTitle>
          <CardDescription>
            Best practices for working with sensitive information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-950/20">
              <h4 className="font-semibold text-red-700 dark:text-red-400">
                Never Store Full SSNs in Free-Text Notes
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Do not type out complete Social Security Numbers in notes, messages, or 
                comments. If you need to reference an SSN, use the last 4 digits only 
                (e.g., "SSN ending in 1234").
              </p>
            </div>
            <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20">
              <h4 className="font-semibold text-blue-700 dark:text-blue-400">
                Use Last-4 + "Present" Flags
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                When confirming you have received sensitive documents, use indicators like 
                "SSN present ✓" or "Bank info on file" rather than writing out the actual 
                numbers. The system stores these securely in designated fields.
              </p>
            </div>
            <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-950/20">
              <h4 className="font-semibold text-green-700 dark:text-green-400">
                Use Secure Upload Areas Only
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Always direct clients to use the secure document upload feature in their 
                portal. Do not accept sensitive documents via email, text message, or 
                other unsecured channels.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logging */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Audit Logging
          </CardTitle>
          <CardDescription>
            What activities are tracked in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            The system automatically logs the following events for security and accountability:
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              User login and logout events
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Client record views and edits
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Document uploads and downloads
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Changes to sensitive fields
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Permission and role changes
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Failed access attempts
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Data exports and reports
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Client communication logs
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Retention & Deletion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Retention & Deletion Policy
          </CardTitle>
          <CardDescription>
            How long we keep client data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded-lg bg-muted/30">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Policy Under Development:</span>{" "}
              Our data retention and deletion policies are being finalized. Generally, tax 
              records should be retained for the IRS-recommended period (typically 3-7 years 
              depending on the type of return). Specific retention schedules and secure 
              deletion procedures will be documented here once established.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Report an Issue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Report a Security Issue
          </CardTitle>
          <CardDescription>
            What to do if you notice something wrong
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              If you notice any of the following, report it immediately:
            </p>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>• Unauthorized access to client data</li>
              <li>• Suspicious login activity or unfamiliar sessions</li>
              <li>• Accidental exposure of sensitive information</li>
              <li>• Phishing attempts or suspicious emails</li>
              <li>• Any system behavior that seems unusual</li>
            </ul>
            <div className="p-4 border rounded-lg bg-primary/5 flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Contact for Security Issues</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Email: <span className="font-mono">security@paynepros.com</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Or speak directly with the practice owner
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center pt-4">
        This page provides internal guidelines for PaynePros staff. It is not legal advice 
        and does not constitute a formal compliance certification.
      </p>
    </div>
  )
}
