import "server-only"
import { adminDb, Timestamp } from '@/lib/firebase/admin'

export interface Wallet {
  id: string
  userId: string
  balance: number
  allocations: {
    bookkeeping: number
    marketing: number
    logistics: number
    transportation: number
    housing: number
    savings: number
    taxes: number
  }
  createdAt: string
  updatedAt: string
}

export interface WalletTransaction {
  id: string
  walletId: string
  type: 'fund' | 'spend' | 'withdraw'
  amount: number
  category: string
  description?: string
  stripePaymentIntentId?: string
  createdAt: string
}

const WALLETS_COLLECTION = 'wallets'
const TRANSACTIONS_COLLECTION = 'walletTransactions'

export class WalletRepository {
  async findByUserId(userId: string): Promise<Wallet | null> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Returning null.")
      return null
    }
    const walletsSnap = await adminDb.collection(WALLETS_COLLECTION)
      .where('userId', '==', userId)
      .limit(1)
      .get()
    
    if (walletsSnap.empty) {
      return null
    }
    
    const doc = walletsSnap.docs[0]
    const data = doc.data()
    return {
      ...data,
      id: doc.id,
      createdAt: data?.createdAt?.toDate().toISOString() || new Date().toISOString(),
      updatedAt: data?.updatedAt?.toDate().toISOString() || new Date().toISOString(),
    } as Wallet
  }

  async create(wallet: Omit<Wallet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Wallet> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Cannot create wallet.")
      const now = new Date().toISOString()
      return {
        ...wallet,
        id: 'mock-wallet-id',
        createdAt: now,
        updatedAt: now,
      }
    }
    const walletRef = adminDb.collection(WALLETS_COLLECTION).doc()
    const now = Timestamp.now()
    
    await walletRef.set({
      ...wallet,
      createdAt: now,
      updatedAt: now,
    })
    
    return {
      ...wallet,
      id: walletRef.id,
      createdAt: now.toDate().toISOString(),
      updatedAt: now.toDate().toISOString(),
    }
  }

  async updateBalance(walletId: string, newBalance: number): Promise<void> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Cannot update balance.")
      return
    }
    const walletRef = adminDb.collection(WALLETS_COLLECTION).doc(walletId)
    await walletRef.update({
      balance: newBalance,
      updatedAt: Timestamp.now(),
    })
  }

  async updateAllocations(walletId: string, allocations: Wallet['allocations']): Promise<void> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Cannot update allocations.")
      return
    }
    const walletRef = adminDb.collection(WALLETS_COLLECTION).doc(walletId)
    await walletRef.update({
      allocations,
      updatedAt: Timestamp.now(),
    })
  }

  async createTransaction(transaction: Omit<WalletTransaction, 'id' | 'createdAt'>): Promise<WalletTransaction> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Cannot create transaction.")
      return {
        ...transaction,
        id: 'mock-transaction-id',
        createdAt: new Date().toISOString(),
      }
    }
    const transactionRef = adminDb.collection(TRANSACTIONS_COLLECTION).doc()
    
    await transactionRef.set({
      ...transaction,
      createdAt: Timestamp.now(),
    })
    
    return {
      ...transaction,
      id: transactionRef.id,
      createdAt: new Date().toISOString(),
    }
  }

  async getTransactions(walletId: string, limitCount: number = 50): Promise<WalletTransaction[]> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Returning empty transactions.")
      return []
    }
    const transactionsSnap = await adminDb.collection(TRANSACTIONS_COLLECTION)
      .where('walletId', '==', walletId)
      .orderBy('createdAt', 'desc')
      .limit(limitCount)
      .get()
    
    return transactionsSnap.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString(),
    })) as WalletTransaction[]
  }
}

export const walletRepository = new WalletRepository()

