export type LeadBusiness = 'paynepros' | 'ibms';

export type LeadSource = 'website' | 'whatsapp' | 'instagram' | 'facebook' | 'sms' | 'email';

export interface Lead {
  id: string;
  business: LeadBusiness;
  source: LeadSource;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  message: string;
  serviceInterest?: string;
  meta?: Record<string, any>;
  createdAt: string;
}


