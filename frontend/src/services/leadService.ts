import { Lead, SearchFilters } from '../types';
import { MOCK_LEADS } from '../data/mockLeads';
import { supabase } from '../lib/supabaseClient';

export const leadService = {
  searchLeads: async (filters: SearchFilters): Promise<Lead[]> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return MOCK_LEADS.filter(lead => {
      if (!filters.industry) return true;
      return lead.industry.toLowerCase().includes(filters.industry.toLowerCase());
    }).map(lead => ({
      ...lead,
      id: `${lead.id}-${Math.random().toString(36).substr(2, 5)}`
    }));
  },

  getSavedLeads: async (): Promise<Lead[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('saved_leads')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching leads:', error);
      return [];
    }

    return (data || []).map(item => ({
      id: item.id,
      companyName: item.company_name,
      industry: item.industry,
      website: item.website,
      contactEmail: item.email,
      linkedInUrl: item.linkedin,
      role: item.role,
      location: item.location,
      companySize: item.company_size,
      isSaved: true,
      enrichment: item.enrichment,
      generatedEmails: item.generated_email ? [{
        id: 'imported',
        type: 'email',
        content: item.generated_email,
        createdAt: item.created_at
      }] : [],
      generatedLinkedIn: item.generated_linkedin || []
    }));
  },

  saveLead: async (lead: Lead) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('saved_leads').upsert({
      id: lead.id,
      user_id: user.id,
      company_name: lead.companyName,
      industry: lead.industry,
      website: lead.website,
      email: lead.contactEmail,
      linkedin: lead.linkedInUrl,
      role: lead.role,
      location: lead.location,
      company_size: lead.companySize,
      enrichment: lead.enrichment,
      generated_email: lead.generatedEmails?.[0]?.content || '',
      generated_linkedin: lead.generatedLinkedIn
    });

    if (error) throw error;
  },

  removeLead: async (leadId: string) => {
    const { error } = await supabase
      .from('saved_leads')
      .delete()
      .eq('id', leadId);

    if (error) throw error;
  },

  updateLead: async (updatedLead: Lead) => {
    const { error } = await supabase
      .from('saved_leads')
      .update({
        company_name: updatedLead.companyName,
        industry: updatedLead.industry,
        website: updatedLead.website,
        email: updatedLead.contactEmail,
        linkedin: updatedLead.linkedInUrl,
        role: updatedLead.role,
        location: updatedLead.location,
        company_size: updatedLead.companySize,
        enrichment: updatedLead.enrichment,
        generated_email: updatedLead.generatedEmails?.[0]?.content || '',
        generated_linkedin: updatedLead.generatedLinkedIn
      })
      .eq('id', updatedLead.id);

    if (error) throw error;
  },

  exportToCSV: (leads: Lead[]) => {
    const headers = ['Company Name', 'Industry', 'Website', 'Email', 'LinkedIn', 'Role', 'Location'];
    const rows = leads.map(l => [
      l.companyName,
      l.industry,
      l.website,
      l.contactEmail,
      l.linkedInUrl,
      l.role,
      l.location
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
