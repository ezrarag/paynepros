import { Lead } from '@/packages/core';

export interface LeadClassification {
  probableService: string;
  urgency: 'low' | 'medium' | 'high';
  suggestedNextAction: string;
}

/**
 * Classifies a lead using a placeholder OpenAI endpoint.
 * This will be wired to Pulse later.
 */
export async function classifyLead(lead: Lead): Promise<LeadClassification> {
  try {
    // Placeholder: In production, this would call OpenAI Pulse API
    // For now, we'll use a simple rule-based classification
    
    const message = lead.message.toLowerCase();
    const serviceInterest = lead.serviceInterest?.toLowerCase() || '';
    
    // Determine probable service based on keywords
    let probableService = 'General Inquiry';
    if (serviceInterest) {
      probableService = serviceInterest;
    } else if (message.includes('tax') || message.includes('return')) {
      probableService = 'Tax Preparation';
    } else if (message.includes('bookkeeping') || message.includes('accounting')) {
      probableService = 'Bookkeeping';
    } else if (message.includes('extension')) {
      probableService = 'Extensions';
    } else if (message.includes('amendment') || message.includes('amend')) {
      probableService = 'Amendments';
    } else if (message.includes('past due') || message.includes('cleanup')) {
      probableService = 'Past-Due / Cleanup';
    }
    
    // Determine urgency based on keywords and source
    let urgency: 'low' | 'medium' | 'high' = 'medium';
    const urgentKeywords = ['urgent', 'asap', 'immediately', 'emergency', 'deadline', 'due soon'];
    const hasUrgentKeywords = urgentKeywords.some(keyword => 
      message.includes(keyword) || serviceInterest.includes(keyword)
    );
    
    if (hasUrgentKeywords || lead.source === 'sms' || lead.source === 'whatsapp') {
      urgency = 'high';
    } else if (lead.source === 'email' || lead.source === 'website') {
      urgency = 'low';
    }
    
    // Suggest next action based on urgency and service
    let suggestedNextAction = 'Send acknowledgment email within 24 hours';
    if (urgency === 'high') {
      suggestedNextAction = 'Call within 2 hours and send follow-up email';
    } else if (urgency === 'medium') {
      suggestedNextAction = 'Send acknowledgment email within 12 hours';
    }
    
    // In production, replace this with actual OpenAI Pulse API call:
    // const response = await fetch('https://api.openai.com/v1/...', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     business: lead.business,
    //     source: lead.source,
    //     message: lead.message,
    //     serviceInterest: lead.serviceInterest,
    //   }),
    // });
    // const data = await response.json();
    // return data;
    
    return {
      probableService,
      urgency,
      suggestedNextAction,
    };
  } catch (error) {
    console.error('Error classifying lead:', error);
    // Return default classification on error
    return {
      probableService: 'General Inquiry',
      urgency: 'medium',
      suggestedNextAction: 'Send acknowledgment email within 24 hours',
    };
  }
}




