import { Lead, LeadEnrichment, OutreachMessage } from '../types';

export const aiService = {
  enrichLead: async (lead: Lead): Promise<LeadEnrichment> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate AI enrichment
    return {
      description: `${lead.companyName} is a leading player in the ${lead.industry} space, focusing on innovative solutions for modern businesses.`,
      painPoints: [
        'Scaling customer acquisition costs',
        'Manual outreach processes slowing down growth',
        'Lack of personalized data for sales campaigns'
      ],
      salesAngle: `Position LeadGen AI as the bridge between their current manual processes and a fully automated, data-driven outreach machine that targets high-intent ${lead.industry} decision makers.`
    };
  },

  generateEmail: async (lead: Lead): Promise<OutreachMessage> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const content = `Subject: Quick question regarding ${lead.companyName}'s growth strategy

Hi ${lead.role || 'there'},

I've been following ${lead.companyName}'s progress in the ${lead.industry} industry and was impressed by your recent momentum.

I'm reaching out because many companies in your space are struggling with scaling their B2B outreach while maintaining high personalization. At LeadGen AI, we help businesses like yours find targeted leads and automate the first touchpoint with AI that sounds human.

Would you be open to a 10-minute chat next Tuesday to see if we can help you accelerate your pipeline?

Best regards,
[Your Name]`;

    return {
      id: Math.random().toString(36).substr(2, 9),
      type: 'email',
      content,
      createdAt: new Date().toISOString()
    };
  },

  generateLinkedInMessage: async (lead: Lead): Promise<OutreachMessage> => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const content = `Hi ${lead.role || 'there'}! I've been keeping an eye on ${lead.companyName}. Really impressive work in ${lead.industry}. I'd love to connect and share some insights on how we're helping teams in your sector streamline their outreach. Best, [Your Name]`;

    return {
      id: Math.random().toString(36).substr(2, 9),
      type: 'linkedin',
      content,
      createdAt: new Date().toISOString()
    };
  }
};
