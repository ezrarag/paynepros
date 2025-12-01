import "server-only"
import { Lead } from '@/packages/core'
import { adminDb, Timestamp } from '@/lib/firebase/admin'

const LEADS_COLLECTION = 'leads'

export class LeadRepository {
  async save(lead: Lead): Promise<Lead> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Cannot save lead.")
      return lead
    }
    const leadRef = adminDb.collection(LEADS_COLLECTION).doc(lead.id)
    await leadRef.set({
      ...lead,
      createdAt: Timestamp.fromDate(new Date(lead.createdAt)),
    })
    return lead
  }

  async findById(id: string): Promise<Lead | null> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Returning null.")
      return null
    }
    const leadRef = adminDb.collection(LEADS_COLLECTION).doc(id)
    const leadSnap = await leadRef.get()
    
    if (!leadSnap.exists) {
      return null
    }
    
    const data = leadSnap.data()
    return {
      ...data,
      id: leadSnap.id,
      createdAt: data?.createdAt?.toDate().toISOString() || new Date().toISOString(),
    } as Lead
  }

  async findAll(): Promise<Lead[]> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Returning empty leads.")
      return []
    }
    const leadsSnap = await adminDb.collection(LEADS_COLLECTION).get()
    
    return leadsSnap.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString(),
    })) as Lead[]
  }

  async findByBusiness(business: Lead['business']): Promise<Lead[]> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Returning empty leads.")
      return []
    }
    const leadsSnap = await adminDb.collection(LEADS_COLLECTION)
      .where('business', '==', business)
      .get()
    
    return leadsSnap.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString(),
    })) as Lead[]
  }
}

export const leadRepository = new LeadRepository()
