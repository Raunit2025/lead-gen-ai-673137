export interface Lead {
  id: string;
  companyName: string;
  industry: string;
  website: string;
  companySize: 'Startup' | 'SMB' | 'Enterprise';
  location: string;
  role: string;
  contactEmail: string;
  linkedInUrl: string;
  isSaved?: boolean;
  enrichment?: LeadEnrichment;
  generatedEmails?: OutreachMessage[];
  generatedLinkedIn?: OutreachMessage[];
}

export interface LeadEnrichment {
  description: string;
  painPoints: string[];
  salesAngle: string;
}

export interface OutreachMessage {
  id: string;
  type: 'email' | 'linkedin';
  content: string;
  createdAt: string;
}

export interface SearchFilters {
  industry: string;
  role: string;
  companySize: string;
  location: string;
}
