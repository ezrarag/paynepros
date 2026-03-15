import { redirect } from "next/navigation"

export default function DashboardActivityRedirectPage() {
  redirect("/admin/clients/activity")
}
