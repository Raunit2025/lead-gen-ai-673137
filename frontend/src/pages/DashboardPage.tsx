import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Trash2, 
  ExternalLink, 
  Mail, 
  Linkedin, 
  Search,
  ChevronRight,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { leadService } from '../services/leadService';
import { Lead } from '../types';
import { clsx } from 'clsx';

const DashboardPage = () => {
  const [savedLeads, setSavedLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = () => {
    const leads = leadService.getSavedLeads();
    setSavedLeads(leads);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to remove this lead?')) {
      leadService.removeLead(id);
      loadLeads();
    }
  };

  const handleExport = () => {
    leadService.exportToCSV(savedLeads);
  };

  const filteredLeads = savedLeads.filter(lead => 
    lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Saved Leads</h1>
          <p className="text-muted-foreground mt-1">Manage your prospects and generated outreach.</p>
        </div>
        <button 
          onClick={handleExport}
          disabled={savedLeads.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </header>

      {/* Stats/Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
          <p className="text-3xl font-bold mt-2">{savedLeads.length}</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Emails Generated</p>
          <p className="text-3xl font-bold mt-2">
            {savedLeads.reduce((acc, lead) => acc + (lead.generatedEmails?.length || 0), 0)}
          </p>
        </div>
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">LinkedIn Messages</p>
          <p className="text-3xl font-bold mt-2">
            {savedLeads.reduce((acc, lead) => acc + (lead.generatedLinkedIn?.length || 0), 0)}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search saved leads..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="p-2.5 border border-border rounded-xl hover:bg-secondary transition-all">
          <Filter className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Saved Leads Table/List */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/30 border-bottom border-border">
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Company</th>
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Industry</th>
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Contact</th>
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Outreach</th>
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground">
                    No saved leads found.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    className="hover:bg-secondary/30 transition-colors cursor-pointer group"
                    // In a real app, clicking here could also open the detail panel
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold">{lead.companyName}</span>
                        <span className="text-xs text-muted-foreground">{lead.website}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm">{lead.industry}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-xs text-muted-foreground gap-1">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {lead.contactEmail}</span>
                        <span className="flex items-center gap-1 font-medium text-foreground">{lead.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-lg">
                          <Mail className="w-3 h-3" />
                          {lead.generatedEmails?.length || 0}
                        </div>
                        <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 bg-purple-50 text-purple-700 rounded-lg">
                          <Linkedin className="w-3 h-3" />
                          {lead.generatedLinkedIn?.length || 0}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={(e) => handleDelete(lead.id, e)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg transition-all"
                        title="Delete Lead"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
