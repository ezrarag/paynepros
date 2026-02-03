import { adminDb, Timestamp } from '@/lib/firebase/admin'

export interface ContentRequest {
  id: string
  userId: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  category: 'social' | 'bookkeeping' | 'marketing' | 'strategic' | 'system' | 'other'
  status: 'pending' | 'in_progress' | 'completed' | 'needs_revision'
  sendToBeamParticipants: boolean
  attachments?: string[]
  createdAt: string
  updatedAt: string
}

const REQUESTS_COLLECTION = 'contentRequests'

export class RequestRepository {
  async create(request: Omit<ContentRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContentRequest> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Cannot create request.")
      const now = new Date().toISOString()
      return {
        ...request,
        id: 'mock-request-id',
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      }
    }
    const requestRef = adminDb.collection(REQUESTS_COLLECTION).doc()
    const now = Timestamp.now()
    
    await requestRef.set({
      ...request,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    })
    
    return {
      ...request,
      id: requestRef.id,
      status: 'pending',
      createdAt: now.toDate().toISOString(),
      updatedAt: now.toDate().toISOString(),
    }
  }

  async findById(requestId: string): Promise<ContentRequest | null> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Returning null.")
      return null
    }
    const requestRef = adminDb.collection(REQUESTS_COLLECTION).doc(requestId)
    const requestSnap = await requestRef.get()
    
    if (!requestSnap.exists) {
      return null
    }
    
    const data = requestSnap.data()
    return {
      ...data,
      id: requestSnap.id,
      createdAt: data?.createdAt?.toDate().toISOString() || new Date().toISOString(),
      updatedAt: data?.updatedAt?.toDate().toISOString() || new Date().toISOString(),
    } as ContentRequest
  }

  async findByUserId(userId: string, limitCount: number = 50): Promise<ContentRequest[]> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Returning empty requests.")
      return []
    }
    const requestsSnap = await adminDb.collection(REQUESTS_COLLECTION)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limitCount)
      .get()
    
    return requestsSnap.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString() || new Date().toISOString(),
    })) as ContentRequest[]
  }

  async updateStatus(requestId: string, status: ContentRequest['status']): Promise<void> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Cannot update status.")
      return
    }
    const requestRef = adminDb.collection(REQUESTS_COLLECTION).doc(requestId)
    await requestRef.update({
      status,
      updatedAt: Timestamp.now(),
    })
  }
}

export const requestRepository = new RequestRepository()

