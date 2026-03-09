import { getIntuitApiBaseUrl, type IntuitEnvironment } from "@/lib/intuit/oauth"

interface QuickBooksQueryResponse<T> {
  QueryResponse?: {
    [key: string]: T[] | undefined
  }
}

export interface IntuitClientConnection {
  realmId: string
  accessToken: string
  accessTokenExpiresAt: Date
  environment: IntuitEnvironment
}

export interface QuickBooksCompanyInfo {
  Id: string
  CompanyName?: string
  LegalName?: string
  Country?: string
  Email?: {
    Address?: string
  }
  WebAddr?: {
    URI?: string
  }
  MetaData?: {
    LastUpdatedTime?: string
  }
}

export interface QuickBooksCustomer {
  Id: string
  DisplayName?: string
  FullyQualifiedName?: string
  CompanyName?: string
  Active?: boolean
  PrimaryEmailAddr?: {
    Address?: string
  }
  PrimaryPhone?: {
    FreeFormNumber?: string
  }
  MetaData?: {
    LastUpdatedTime?: string
  }
}

export interface QuickBooksInvoice {
  Id: string
  DocNumber?: string
  TxnDate?: string
  DueDate?: string
  TotalAmt?: number
  Balance?: number
  CurrencyRef?: {
    value?: string
    name?: string
  }
  CustomerRef?: {
    value?: string
    name?: string
  }
  MetaData?: {
    LastUpdatedTime?: string
  }
}

export class QuickBooksClient {
  private readonly baseUrl: string

  constructor(private readonly connection: IntuitClientConnection) {
    this.baseUrl = getIntuitApiBaseUrl(connection.environment)
  }

  private assertTokenIsUsable(): void {
    const expiresAtMs = this.connection.accessTokenExpiresAt.getTime()

    if (Date.now() >= expiresAtMs - 30_000) {
      // TODO: Implement automatic refresh + token persistence using refreshAccessToken().
      throw new Error("QuickBooks access token is expired or about to expire. Refresh flow is not implemented yet.")
    }
  }

  private async request<T>(path: string): Promise<T> {
    this.assertTokenIsUsable()

    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.connection.accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const rawBody = await response.text()
      throw new Error(`QuickBooks API request failed (${response.status}): ${rawBody}`)
    }

    return (await response.json()) as T
  }

  private async queryEntity<T>(sql: string, entityKey: string): Promise<T[]> {
    const query = encodeURIComponent(sql)
    const path = `/v3/company/${this.connection.realmId}/query?query=${query}&minorversion=75`
    const payload = await this.request<QuickBooksQueryResponse<T>>(path)
    const rows = payload.QueryResponse?.[entityKey]

    if (!rows) return []
    return rows
  }

  async getCompanyInfo(): Promise<QuickBooksCompanyInfo> {
    const path = `/v3/company/${this.connection.realmId}/companyinfo/${this.connection.realmId}?minorversion=75`
    const payload = await this.request<{ CompanyInfo: QuickBooksCompanyInfo }>(path)
    return payload.CompanyInfo
  }

  async getCustomers(): Promise<QuickBooksCustomer[]> {
    return this.queryEntity<QuickBooksCustomer>("SELECT * FROM Customer MAXRESULTS 1000", "Customer")
  }

  async getInvoices(): Promise<QuickBooksInvoice[]> {
    return this.queryEntity<QuickBooksInvoice>("SELECT * FROM Invoice MAXRESULTS 1000", "Invoice")
  }
}
