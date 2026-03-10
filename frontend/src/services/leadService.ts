import { Lead, SearchFilters } from '../types';
import { MOCK_LEADS } from '../data/mockLeads';
import { supabase } from '../lib/supabaseClient';

const LOCAL_STORAGE_KEY = 'leadgen_saved_leads';

const getLocalStorageLeads = (): Lead[] => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Failed to parse leads from local storage', e);
    return [];
  }
};

const saveToLocalStorage = (lead: Lead) => {
  const leads = getLocalStorageLeads();
  if (!leads.find(l => l.id === lead.id)) {
    leads.push({ ...lead, isSaved: true });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(leads));
  }
};

const removeFromLocalStorage = (leadId: string) => {
  const leads = getLocalStorageLeads();
  const filtered = leads.filter(l => l.id !== leadId);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
};

const updateInLocalStorage = (updatedLead: Lead) => {
  const leads = getLocalStorageLeads();
  const index = leads.findIndex(l => l.id === updatedLead.id);
  if (index !== -1) {
    leads[index] = { ...updatedLead, isSaved: true };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(leads));
  }
};

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const leadService = {
  searchLeads: async (filters: SearchFilters): Promise<Lead[]> => {
    // Simulate AI powered search with the filters
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Get leads from both Supabase and LocalStorage to mark as saved
    const savedLeads = await leadService.getSavedLeads();
    const savedIds = new Set(savedLeads.map(l => l.id));
    const savedCompanyNames = new Set(savedLeads.map(l => l.companyName));

    return MOCK_LEADS.filter(lead => {
      let matches = true;
      if (filters.industry) {
        matches = matches && lead.industry.toLowerCase().includes(filters.industry.toLowerCase());
      }
      if (filters.companySize) {
        matches = matches && lead.companySize === filters.companySize;
      }
      return matches;
    }).map((lead): Lead => ({
      ...lead,
      isSaved: savedIds.has(lead.id) || savedCompanyNames.has(lead.companyName),
    }));
  },

  getSavedLeads: async (): Promise<Lead[]> => {
    const localLeads = getLocalStorageLeads();
    
    if (USE_MOCK) return localLeads;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return localLeads;

      const { data, error } = await supabase
        .from('saved_leads')
        .select('id, user_id, company_name, industry, website, email, linkedin, generated_email, created_at')
        .eq('user_id', user.id);

      if (error) {
        console.warn('Supabase fetch failed, using local leads only', error);
        return localLeads;
      }

      const supabaseLeads: Lead[] = (data || []).map((item: any) => ({
        id: item.id,
        companyName: item.company_name || '',
        industry: item.industry || '',
        website: item.website || '',
        contactEmail: item.email || '',
        linkedInUrl: item.linkedin || '',
        role: 'Lead',
        location: 'Global',
        companySize: 'SMB' as const,
        isSaved: true,
        generatedEmails: item.generated_email ? [{
          id: crypto.randomUUID(),
          type: 'email',
          content: item.generated_email,
          createdAt: item.created_at
        }] : [],
        generatedLinkedIn: []
      }));

      // Merge avoiding duplicates by company name or ID
      const allLeads: Lead[] = [...supabaseLeads];
      const supabaseIds = new Set(supabaseLeads.map(l => l.id));
      const supabaseCompanies = new Set(supabaseLeads.map(l => l.companyName));

      localLeads.forEach(l => {
        if (!supabaseIds.has(l.id) && !supabaseCompanies.has(l.companyName)) {
          allLeads.push(l);
        }
      });

      return allLeads;
    } catch (e) {
      console.warn('Supabase not available', e);
      return localLeads;
    }
  },

  saveLead: async (lead: Lead) => {
    // Always save to local storage as fallback
    saveToLocalStorage(lead);

    if (USE_MOCK) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return; // Silent return as we already saved to local storage

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

      if (error) {
        console.warn('Supabase save failed, but saved to local storage', error);
      }
    } catch (e) {
      console.warn('Supabase error during save', e);
    }
  },

  removeLead: async (leadId: string) => {
    removeFromLocalStorage(leadId);

    if (USE_MOCK) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('saved_leads')
        .delete()
        .eq('id', leadId);

      if (error) console.warn('Supabase delete failed', error);
    } catch (e) {
      console.warn('Supabase error during delete', e);
    }
  },

  updateLead: async (updatedLead: Lead) => {
    updateInLocalStorage(updatedLead);

    if (USE_MOCK) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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

      if (error) console.warn('Supabase update failed', error);
    } catch (e) {
      console.warn('Supabase error during update', e);
    }
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