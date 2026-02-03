import { Suspense } from "react"
import AdminLoginClient from "./AdminLoginClient"
import { adminUserRepository } from "@/lib/repositories/admin-user-repository"

export default async function AdminLoginPage() {
  const tenantId = "paynepros"
  const adminUsers = await adminUserRepository.listByTenant(tenantId)

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
          <div className="w-full max-w-md h-96 rounded-lg border bg-card animate-pulse" />
        </div>
      }
    >
      <AdminLoginClient adminUsers={adminUsers} />
    </Suspense>
  )
}
