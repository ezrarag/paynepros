import { Lead } from '@/packages/core';

// In-memory storage for leads (replace with Prisma/Supabase in production)
const leadsStorage: Lead[] = [];

export class LeadRepository {
  async save(lead: Lead): Promise<Lead> {
    leadsStorage.push(lead);
    return lead;
  }

  async findById(id: string): Promise<Lead | null> {
    return leadsStorage.find(lead => lead.id === id) || null;
  }

  async findAll(): Promise<Lead[]> {
    return [...leadsStorage];
  }

  async findByBusiness(business: Lead['business']): Promise<Lead[]> {
    return leadsStorage.filter(lead => lead.business === business);
  }
}

export const leadRepository = new LeadRepository();


