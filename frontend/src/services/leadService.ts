import { Lead, SearchFilters } from '../types';
import { MOCK_LEADS } from '../data/mockLeads';
import api from '../lib/api';

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
    
    // Get leads from both Backend and LocalStorage to mark as saved
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
      const response = await api.get('/leads');
      const data = response.data;

      const backendLeads: Lead[] = (data || []).map((item: any) => ({
        id: item.id,
        companyName: item.companyName || '',
        industry: item.industry || '',
        website: item.website || '',
        contactEmail: item.email || '',
        linkedInUrl: item.linkedin || '',
        role: 'Lead',
        location: 'Global',
        companySize: 'SMB' as const,
        isSaved: true,
        generatedEmails: item.generatedEmail ? [{
          id: crypto.randomUUID(),
          type: 'email',
          content: item.generatedEmail,
          createdAt: item.createdAt
        }] : [],
        generatedLinkedIn: []
      }));

      // Merge avoiding duplicates by ID or company name
      const allLeads: Lead[] = [...backendLeads];
      const backendIds = new Set(backendLeads.map(l => l.id));
      const backendCompanies = new Set(backendLeads.map(l => l.companyName));

      localLeads.forEach(l => {
        if (!backendIds.has(l.id) && !backendCompanies.has(l.companyName)) {
          allLeads.push(l);
        }
      });

      return allLeads;
    } catch (e: any) {
      console.error('Backend fetch failed:', e.response?.data?.message || e.message || e);
      console.warn('Falling back to local leads only');
      return localLeads;
    }
  },

  saveLead: async (lead: Lead) => {
    // Always save to local storage as fallback
    saveToLocalStorage(lead);

    if (USE_MOCK) return lead;

    try {
      const response = await api.post('/leads', {
        id: lead.id,
        companyName: lead.companyName,
        industry: lead.industry,
        website: lead.website,
        email: lead.contactEmail,
        linkedin: lead.linkedInUrl,
        generatedEmail: lead.generatedEmails?.[0]?.content || ''
      });
      
      const savedLead = {
        ...lead,
        id: response.data.id || lead.id,
        isSaved: true
      };
      
      updateInLocalStorage(savedLead);
      return savedLead;
    } catch (e: any) {
      console.error('Backend save failed:', e.response?.data?.message || e.message || e);
      throw e;
    }
  },

  removeLead: async (leadId: string) => {
    removeFromLocalStorage(leadId);

    if (USE_MOCK) return;

    try {
      await api.delete(`/leads/${leadId}`);
    } catch (e: any) {
      console.error('Backend delete failed:', e.response?.data?.message || e.message || e);
      throw e;
    }
  },

  updateLead: async (updatedLead: Lead) => {
    updateInLocalStorage(updatedLead);

    if (USE_MOCK) return updatedLead;

    try {
      const response = await api.patch(`/leads/${updatedLead.id}`, {
        companyName: updatedLead.companyName,
        industry: updatedLead.industry,
        website: updatedLead.website,
        email: updatedLead.contactEmail,
        linkedin: updatedLead.linkedInUrl,
        generatedEmail: updatedLead.generatedEmails?.[0]?.content || ''
      });
      
      const lead = {
        ...updatedLead,
        id: response.data.id || updatedLead.id
      };
      
      updateInLocalStorage(lead);
      return lead;
    } catch (e: any) {
      console.error('Backend update failed:', e.response?.data?.message || e.message || e);
      throw e;
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