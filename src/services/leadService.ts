import { Lead, SearchFilters } from '../types';
import { MOCK_LEADS } from '../data/mockLeads';
import { supabase } from '../lib/supabaseClient';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true' || !supabase;

export const leadService = {
  searchLeads: async (filters: SearchFilters): Promise<Lead[]> => {
    // Simulate AI powered search with the filters
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real AI implementation, this would call an LLM to generate these leads
    // For now, we filter and randomize our base mock data to simulate "finding" leads
    const savedIds = USE_MOCK ? JSON.parse(localStorage.getItem('saved_leads_mock') || '[]').map((l: any) => l.id) : [];

    return MOCK_LEADS.filter(lead => {
      let matches = true;
      if (filters.industry) {
        matches = matches && lead.industry.toLowerCase().includes(filters.industry.toLowerCase());
      }
      if (filters.companySize) {
        matches = matches && lead.companySize === filters.companySize;
      }
      return matches;
    }).map(lead => ({
      ...lead,
      id: crypto.randomUUID(), // Generate fresh IDs to simulate new discovery
      isSaved: USE_MOCK ? savedIds.includes(lead.id) : false,
    }));
  },

  getSavedLeads: async (): Promise<Lead[]> => {
    if (USE_MOCK) {
      return JSON.parse(localStorage.getItem('saved_leads_mock') || '[]');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('saved_leads')
      .select('id, user_id, company_name, industry, website, email, linkedin, generated_email, created_at')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching leads:', error);
      return [];
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      companyName: item.company_name || '',
      industry: item.industry || '',
      website: item.website || '',
      contactEmail: item.email || '',
      linkedInUrl: item.linkedin || '',
      role: 'Lead', // Default as it's not in the schema
      location: 'Global', // Default as it's not in the schema
      companySize: 'SMB', // Default as it's not in the schema
      isSaved: true,
      generatedEmails: item.generated_email ? [{
        id: crypto.randomUUID(),
        type: 'email',
        content: item.generated_email,
        createdAt: item.created_at
      }] : [],
      generatedLinkedIn: [] // Not in the schema
    }));
  },

  saveLead: async (lead: Lead) => {
    if (USE_MOCK) {
      const saved = JSON.parse(localStorage.getItem('saved_leads_mock') || '[]');
      if (!saved.find((l: any) => l.id === lead.id)) {
        saved.push({ ...lead, isSaved: true });
        localStorage.setItem('saved_leads_mock', JSON.stringify(saved));
      }
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User must be logged in to save leads');

    const { error } = await supabase.from('saved_leads').upsert({
      id: lead.id,
      user_id: user.id,
      company_name: lead.companyName,
      industry: lead.industry,
      website: lead.website,
      email: lead.contactEmail,
      linkedin: lead.linkedInUrl,
      generated_email: lead.generatedEmails?.[0]?.content || ''
    });

    if (error) throw error;
  },

  removeLead: async (leadId: string) => {
    if (USE_MOCK) {
      const saved = JSON.parse(localStorage.getItem('saved_leads_mock') || '[]');
      const filtered = saved.filter((l: any) => l.id !== leadId);
      localStorage.setItem('saved_leads_mock', JSON.stringify(filtered));
      return;
    }

    const { error } = await supabase
      .from('saved_leads')
      .delete()
      .eq('id', leadId);

    if (error) throw error;
  },

  updateLead: async (updatedLead: Lead) => {
    if (USE_MOCK) {
      const saved = JSON.parse(localStorage.getItem('saved_leads_mock') || '[]');
      const idx = saved.findIndex((l: any) => l.id === updatedLead.id);
      if (idx !== -1) {
        saved[idx] = updatedLead;
        localStorage.setItem('saved_leads_mock', JSON.stringify(saved));
      }
      return;
    }

    const { error } = await supabase
      .from('saved_leads')
      .update({
        company_name: updatedLead.companyName,
        industry: updatedLead.industry,
        website: updatedLead.website,
        email: updatedLead.contactEmail,
        linkedin: updatedLead.linkedInUrl,
        generated_email: updatedLead.generatedEmails?.[0]?.content || ''
      })
      .eq('id', updatedLead.id);

    if (error) throw error;
  },

  exportToCSV: (leads: Lead[]) => {
    const headers = ['Company Name', 'Industry', 'Website', 'Email', 'LinkedIn', 'Generated Email'];
    const rows = leads.map(l => [
      l.companyName,
      l.industry,
      l.website,
      l.contactEmail,
      l.linkedInUrl,
      l.generatedEmails?.[0]?.content || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => {
        const value = (cell || '').toString();
        const escaped = value.split('"').join('""');
        return `"${escaped}"`;
      }).join(','))
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
