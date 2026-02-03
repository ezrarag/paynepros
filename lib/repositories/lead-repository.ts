import { Lead } from '@/packages/core'
import { adminDb, Timestamp } from '@/lib/firebase/admin'

const LEADS_COLLECTION = 'leads'

export class LeadRepository {
  async save(lead: Lead): Promise<Lead> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Cannot save lead.")
      return lead
    }
    try {
      const leadRef = adminDb.collection(LEADS_COLLECTION).doc(lead.id)
      await leadRef.set({
        ...lead,
        createdAt: Timestamp.fromDate(new Date(lead.createdAt)),
      })
      return lead
    } catch (error) {
      console.error("Failed to save lead:", error)
      throw new Error("Failed to save lead")
    }
  }

  async findById(id: string): Promise<Lead | null> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Returning null.")
      return null
    }
    try {
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
    } catch (error) {
      console.error("Failed to find lead:", error)
      throw new Error("Failed to fetch lead")
    }
  }

  async findAll(): Promise<Lead[]> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Returning empty leads.")
      return []
    }
    try {
      const leadsSnap = await adminDb.collection(LEADS_COLLECTION).get()
      
      return leadsSnap.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString(),
      })) as Lead[]
    } catch (error) {
      console.error("Failed to fetch leads:", error)
      throw new Error("Failed to fetch leads")
    }
  }

  async findByBusiness(business: Lead['business']): Promise<Lead[]> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Returning empty leads.")
      return []
    }
    try {
      const leadsSnap = await adminDb.collection(LEADS_COLLECTION)
        .where('business', '==', business)
        .get()
      
      return leadsSnap.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString(),
      })) as Lead[]
    } catch (error) {
      console.error("Failed to fetch leads by business:", error)
      throw new Error("Failed to fetch leads")
    }
  }
}

export const leadRepository = new LeadRepository()
