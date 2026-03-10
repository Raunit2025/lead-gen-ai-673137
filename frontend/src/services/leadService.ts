import { Lead, SearchFilters } from '../types';
import { MOCK_LEADS } from '../data/mockLeads';

const SAVED_LEADS_KEY = 'leadgen_ai_saved_leads';

export const leadService = {
  searchLeads: async (filters: SearchFilters): Promise<Lead[]> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real app, this would be an AI-powered search or database query
    // Here we filter MOCK_LEADS based on industry or just return them with some variations
    return MOCK_LEADS.filter(lead => {
      if (!filters.industry) return true;
      return lead.industry.toLowerCase().includes(filters.industry.toLowerCase());
    }).map(lead => ({
      ...lead,
      // Randomize IDs if we want many results, but for now let's keep it simple
      id: `${lead.id}-${Math.random().toString(36).substr(2, 5)}`
    }));
  },

  getSavedLeads: (): Lead[] => {
    const saved = localStorage.getItem(SAVED_LEADS_KEY);
    return saved ? JSON.parse(saved) : [];
  },

  saveLead: (lead: Lead) => {
    const saved = leadService.getSavedLeads();
    if (!saved.find(l => l.id === lead.id)) {
      localStorage.setItem(SAVED_LEADS_KEY, JSON.stringify([...saved, { ...lead, isSaved: true }]));
    }
  },

  removeLead: (leadId: string) => {
    const saved = leadService.getSavedLeads();
    localStorage.setItem(SAVED_LEADS_KEY, JSON.stringify(saved.filter(l => l.id !== leadId)));
  },

  updateLead: (updatedLead: Lead) => {
    const saved = leadService.getSavedLeads();
    const index = saved.findIndex(l => l.id === updatedLead.id);
    if (index !== -1) {
      saved[index] = updatedLead;
      localStorage.setItem(SAVED_LEADS_KEY, JSON.stringify(saved));
    }
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
