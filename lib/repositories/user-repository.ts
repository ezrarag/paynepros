import { adminDb, Timestamp } from '@/lib/firebase/admin'

export interface User {
  id: string
  email?: string
  name?: string
  phone?: string
  image?: string
  role?: 'admin' | 'user'
  subscriptionStatus?: 'active' | 'inactive' | 'cancelled'
  subscriptionId?: string
  stripeCustomerId?: string
  cSuiteEnabled?: boolean
  subscription?: {
    status: string
    plan: string
    startedAt: Date | string
  }
  connectedAccounts?: {
    google?: boolean
    facebook?: boolean
    instagram?: boolean
    apple?: boolean
    whatsapp?: boolean
  }
  createdAt: string
  updatedAt: string
}

const USERS_COLLECTION = 'users'

export class UserRepository {
  async findById(userId: string): Promise<User | null> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Returning null.")
      return null
    }
    const userRef = adminDb.collection(USERS_COLLECTION).doc(userId)
    const userSnap = await userRef.get()
    
    if (!userSnap.exists) {
      return null
    }
    
    const data = userSnap.data()
    return {
      ...data,
      id: userSnap.id,
      createdAt: data?.createdAt?.toDate().toISOString() || new Date().toISOString(),
      updatedAt: data?.updatedAt?.toDate().toISOString() || new Date().toISOString(),
    } as User
  }

  async create(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Cannot create user.")
      // Return mock user for development
      const now = new Date().toISOString()
      return {
        ...user,
        createdAt: now,
        updatedAt: now,
      }
    }
    const userRef = adminDb.collection(USERS_COLLECTION).doc(user.id)
    const now = Timestamp.now()
    
    await userRef.set({
      ...user,
      createdAt: now,
      updatedAt: now,
    })
    
    return {
      ...user,
      createdAt: now.toDate().toISOString(),
      updatedAt: now.toDate().toISOString(),
    }
  }

  async update(userId: string, updates: Partial<User>): Promise<void> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Cannot update user.")
      return
    }
    const userRef = adminDb.collection(USERS_COLLECTION).doc(userId)
    await userRef.update({
      ...updates,
      updatedAt: Timestamp.now(),
    })
  }

  async updateSubscription(
    userId: string,
    subscriptionId: string,
    status: 'active' | 'inactive' | 'cancelled'
  ): Promise<void> {
    await this.update(userId, {
      subscriptionId,
      subscriptionStatus: status,
    })
  }
}

export const userRepository = new UserRepository()

