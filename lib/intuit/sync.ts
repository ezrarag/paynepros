import { prisma } from "@/lib/db/prisma"
import {
  QuickBooksClient,
  type QuickBooksCompanyInfo,
  type QuickBooksCustomer,
  type QuickBooksInvoice,
} from "@/lib/intuit/client"
import type { IntuitEnvironment } from "@/lib/intuit/oauth"

export interface QuickBooksSyncResult {
  organizationId: string
  companyName: string | null
  customerCount: number
  invoiceCount: number
  syncedAt: Date
}

function toIntuitEnvironment(value: "SANDBOX" | "PRODUCTION"): IntuitEnvironment {
  return value === "PRODUCTION" ? "production" : "sandbox"
}

function parseMoney(value: number | string | null | undefined): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null

  const normalized = value.includes("T") ? value : `${value}T00:00:00.000Z`
  const parsed = new Date(normalized)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}

function normalizeCompanyName(companyInfo: QuickBooksCompanyInfo): string | null {
  return companyInfo.CompanyName ?? companyInfo.LegalName ?? null
}

function normalizeCustomer(customer: QuickBooksCustomer) {
  return {
    qbId: customer.Id,
    displayName:
      customer.DisplayName ?? customer.FullyQualifiedName ?? customer.CompanyName ?? `Customer ${customer.Id}`,
    companyName: customer.CompanyName ?? null,
    email: customer.PrimaryEmailAddr?.Address ?? null,
    phone: customer.PrimaryPhone?.FreeFormNumber ?? null,
    active: customer.Active ?? true,
    raw: customer as unknown as Record<string, unknown>,
  }
}

function normalizeInvoice(invoice: QuickBooksInvoice) {
  return {
    qbId: invoice.Id,
    docNumber: invoice.DocNumber ?? null,
    customerQbId: invoice.CustomerRef?.value ?? null,
    customerName: invoice.CustomerRef?.name ?? null,
    txnDate: parseDate(invoice.TxnDate),
    dueDate: parseDate(invoice.DueDate),
    totalAmt: parseMoney(invoice.TotalAmt),
    balance: parseMoney(invoice.Balance),
    currency: invoice.CurrencyRef?.value ?? null,
    status: parseMoney(invoice.Balance) === 0 ? "paid" : "open",
    raw: invoice as unknown as Record<string, unknown>,
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return "Unknown QuickBooks sync error"
}

export async function syncQuickBooksForOrganization(
  organizationId: string
): Promise<QuickBooksSyncResult> {
  const connection = await prisma.intuitConnection.findUnique({
    where: { organizationId },
    include: { organization: true },
  })

  if (!connection) {
    throw new Error("No QuickBooks connection found for this organization")
  }

  await prisma.intuitConnection.update({
    where: { id: connection.id },
    data: { syncStatus: "SYNCING", syncError: null },
  })

  try {
    const client = new QuickBooksClient({
      realmId: connection.realmId,
      accessToken: connection.accessToken,
      accessTokenExpiresAt: connection.accessTokenExpiresAt,
      environment: toIntuitEnvironment(connection.environment),
    })

    const [companyInfo, customers, invoices] = await Promise.all([
      client.getCompanyInfo(),
      client.getCustomers(),
      client.getInvoices(),
    ])

    const syncedAt = new Date()

    await prisma.$transaction(async (tx: any) => {
      await tx.intuitConnection.update({
        where: { id: connection.id },
        data: {
          qboCompanyName: normalizeCompanyName(companyInfo),
          rawCompanyInfo: companyInfo as unknown as Record<string, unknown>,
          lastSyncedAt: syncedAt,
          syncStatus: "SUCCESS",
          syncError: null,
        },
      })

      for (const customer of customers) {
        const normalized = normalizeCustomer(customer)

        await tx.qBCustomer.upsert({
          where: {
            organizationId_qbId: {
              organizationId: connection.organizationId,
              qbId: normalized.qbId,
            },
          },
          update: {
            displayName: normalized.displayName,
            companyName: normalized.companyName,
            email: normalized.email,
            phone: normalized.phone,
            active: normalized.active,
            raw: normalized.raw,
            syncedAt,
          },
          create: {
            organizationId: connection.organizationId,
            intuitConnectionId: connection.id,
            qbId: normalized.qbId,
            displayName: normalized.displayName,
            companyName: normalized.companyName,
            email: normalized.email,
            phone: normalized.phone,
            active: normalized.active,
            raw: normalized.raw,
            syncedAt,
          },
        })
      }

      for (const invoice of invoices) {
        const normalized = normalizeInvoice(invoice)

        await tx.qBInvoice.upsert({
          where: {
            organizationId_qbId: {
              organizationId: connection.organizationId,
              qbId: normalized.qbId,
            },
          },
          update: {
            docNumber: normalized.docNumber,
            customerQbId: normalized.customerQbId,
            customerName: normalized.customerName,
            txnDate: normalized.txnDate,
            dueDate: normalized.dueDate,
            totalAmt: normalized.totalAmt,
            balance: normalized.balance,
            currency: normalized.currency,
            status: normalized.status,
            raw: normalized.raw,
            syncedAt,
          },
          create: {
            organizationId: connection.organizationId,
            intuitConnectionId: connection.id,
            qbId: normalized.qbId,
            docNumber: normalized.docNumber,
            customerQbId: normalized.customerQbId,
            customerName: normalized.customerName,
            txnDate: normalized.txnDate,
            dueDate: normalized.dueDate,
            totalAmt: normalized.totalAmt,
            balance: normalized.balance,
            currency: normalized.currency,
            status: normalized.status,
            raw: normalized.raw,
            syncedAt,
          },
        })
      }
    })

    return {
      organizationId: connection.organizationId,
      companyName: normalizeCompanyName(companyInfo),
      customerCount: customers.length,
      invoiceCount: invoices.length,
      syncedAt,
    }
  } catch (error) {
    await prisma.intuitConnection.update({
      where: { id: connection.id },
      data: {
        syncStatus: "ERROR",
        syncError: getErrorMessage(error),
      },
    })

    throw error
  }
}

export async function syncQuickBooksForTenant(tenantId: string): Promise<QuickBooksSyncResult> {
  const organization = await prisma.organization.findUnique({
    where: { tenantId },
    select: { id: true },
  })

  if (!organization) {
    throw new Error("Organization not found for current tenant")
  }

  return syncQuickBooksForOrganization(organization.id)
}
