import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  ExternalLink, 
  Mail, 
  Linkedin, 
  Sparkles,
  Loader2,
  Filter,
  MoreHorizontal,
  Bookmark,
  ChevronRight,
  X
} from 'lucide-react';
import { leadService } from '../services/leadService';
import { aiService } from '../services/aiService';
import { Lead, SearchFilters, LeadEnrichment, OutreachMessage } from '../types';
import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';

const SearchPage = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    industry: '',
    role: '',
    companySize: '',
    location: ''
  });
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [isGenerating, setIsGenerating] = useState<string | null>(null); // 'email' or 'linkedin'

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const results = await leadService.searchLeads(filters);
      setLeads(results);
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openLeadDetail = (lead: Lead) => {
    setSelectedLead(lead);
    setIsPanelOpen(true);
  };

  const handleEnrich = async () => {
    if (!selectedLead) return;
    setIsEnriching(true);
    try {
      const enrichment = await aiService.enrichLead(selectedLead);
      let updatedLead: Lead = { ...selectedLead, enrichment };
      
      // If it's already saved, update it in backend
      if (updatedLead.isSaved) {
        updatedLead = await leadService.updateLead(updatedLead);
      }
      
      setSelectedLead(updatedLead);
      setLeads(leads.map(l => l.id === selectedLead.id ? updatedLead : l));
    } catch (error) {
      console.error('Enrichment failed', error);
    } finally {
      setIsEnriching(false);
    }
  };

  const handleGenerateOutreach = async (type: 'email' | 'linkedin') => {
    if (!selectedLead) return;
    setIsGenerating(type);
    try {
      let message: OutreachMessage;
      let updatedLead: Lead;

      if (type === 'email') {
        message = await aiService.generateEmail(selectedLead);
        updatedLead = { 
          ...selectedLead, 
          generatedEmails: [...(selectedLead.generatedEmails || []), message] 
        };
      } else {
        message = await aiService.generateLinkedInMessage(selectedLead);
        updatedLead = { 
          ...selectedLead, 
          generatedLinkedIn: [...(selectedLead.generatedLinkedIn || []), message] 
        };
      }

      if (updatedLead.isSaved) {
        updatedLead = await leadService.updateLead(updatedLead);
      }
      
      setSelectedLead(updatedLead);
      setLeads(leads.map(l => l.id === selectedLead.id ? updatedLead : l));
    } catch (error) {
      console.error('Generation failed', error);
    } finally {
      setIsGenerating(null);
    }
  };

  const handleSaveLead = async (lead: Lead) => {
    try {
      const savedLead = await leadService.saveLead(lead);
      // Update leads list with the saved lead (it might have a new ID from backend)
      setLeads(leads.map(l => l.id === lead.id ? savedLead : l));
      if (selectedLead?.id === lead.id) {
        setSelectedLead(savedLead);
      }
    } catch (error) {
      console.error('Save failed', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast here
    alert('Copied to clipboard!');
  };

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lead Discovery</h1>
          <p className="text-muted-foreground mt-1">Search for companies and prospects using AI.</p>
        </div>
      </header>

      {/* Search Form */}
      <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Industry</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="e.g. SaaS, Fintech"
                className="w-full pl-10 pr-4 py-2 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                value={filters.industry}
                onChange={(e) => setFilters({...filters, industry: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Target Role</label>
            <input 
              type="text" 
              placeholder="e.g. Founder, CTO"
              className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              value={filters.role}
              onChange={(e) => setFilters({...filters, role: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Company Size</label>
            <select 
              className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
              value={filters.companySize}
              onChange={(e) => setFilters({...filters, companySize: e.target.value})}
            >
              <option value="">Any Size</option>
              <option value="Startup">Startup</option>
              <option value="SMB">SMB</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
          <div className="flex items-end">
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground py-2 rounded-xl font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Find Leads
            </button>
          </div>
        </form>
      </section>

      {/* Results Table */}
      <section className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/30 border-bottom border-border">
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Company</th>
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Industry</th>
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Size</th>
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Location</th>
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                        <Search className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">No leads found. Try adjusting your filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    className="hover:bg-secondary/30 transition-colors group cursor-pointer"
                    onClick={() => openLeadDetail(lead)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{lead.companyName}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          {lead.website}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {lead.industry}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {lead.companySize}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {lead.location}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => handleSaveLead(lead)}
                          disabled={lead.isSaved}
                          className={clsx(
                            "p-2 rounded-lg transition-all",
                            lead.isSaved 
                              ? "text-primary bg-primary/10" 
                              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                          )}
                          title={lead.isSaved ? "Saved" : "Save Lead"}
                        >
                          <Bookmark className={clsx("w-4 h-4", lead.isSaved && "fill-current")} />
                        </button>
                        <button 
                          onClick={() => openLeadDetail(lead)}
                          className="p-2 text-muted-foreground hover:bg-secondary hover:text-foreground rounded-lg transition-all"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Side Detail Panel (Drawer) */}
      <AnimatePresence>
        {isPanelOpen && selectedLead && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPanelOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-card border-l border-border z-50 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold">
                    {selectedLead.companyName[0]}
                  </div>
                  <div>
                    <h2 className="font-bold text-xl">{selectedLead.companyName}</h2>
                    <p className="text-sm text-muted-foreground">{selectedLead.industry} • {selectedLead.location}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsPanelOpen(false)}
                  className="p-2 hover:bg-secondary rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleSaveLead(selectedLead)}
                    disabled={selectedLead.isSaved}
                    className={clsx(
                      "flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all",
                      selectedLead.isSaved 
                        ? "bg-primary/10 text-primary cursor-default" 
                        : "bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/10"
                    )}
                  >
                    <Bookmark className={clsx("w-4 h-4", selectedLead.isSaved && "fill-current")} />
                    {selectedLead.isSaved ? 'Saved' : 'Save Lead'}
                  </button>
                  <button 
                    onClick={handleEnrich}
                    disabled={isEnriching}
                    className="flex items-center justify-center gap-2 py-2.5 bg-secondary text-foreground hover:bg-muted rounded-xl font-medium transition-all"
                  >
                    {isEnriching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-purple-500" />}
                    Enrich Lead
                  </button>
                </div>

                {/* Enrichment Data */}
                {selectedLead.enrichment ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">About Company</h3>
                      <p className="text-foreground leading-relaxed">
                        {selectedLead.enrichment.description}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Possible Business Problems</h3>
                      <ul className="space-y-2">
                        {selectedLead.enrichment.painPoints.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 flex-shrink-0" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl space-y-2">
                      <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Suggested Sales Angle
                      </h3>
                      <p className="text-sm text-foreground italic leading-relaxed">
                        "{selectedLead.enrichment.salesAngle}"
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center border-2 border-dashed border-border rounded-2xl">
                    <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-20" />
                    <p className="text-muted-foreground text-sm">Click "Enrich Lead" to see AI insights.</p>
                  </div>
                )}

                {/* Outreach Generators */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">AI Outreach</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleGenerateOutreach('email')}
                      disabled={isGenerating === 'email'}
                      className="flex-1 flex items-center justify-center gap-2 py-3 border border-border rounded-xl hover:bg-secondary transition-all font-medium text-sm"
                    >
                      {isGenerating === 'email' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4 text-blue-500" />}
                      Email
                    </button>
                    <button 
                      onClick={() => handleGenerateOutreach('linkedin')}
                      disabled={isGenerating === 'linkedin'}
                      className="flex-1 flex items-center justify-center gap-2 py-3 border border-border rounded-xl hover:bg-secondary transition-all font-medium text-sm"
                    >
                      {isGenerating === 'linkedin' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Linkedin className="w-4 h-4 text-blue-600" />}
                      LinkedIn
                    </button>
                  </div>
                </div>

                {/* Generated Content History */}
                {(selectedLead.generatedEmails?.length || 0) > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Recent Emails</h3>
                    {selectedLead.generatedEmails?.map((email) => (
                      <div key={email.id} className="p-4 bg-secondary/50 border border-border rounded-xl space-y-3 relative group">
                        <pre className="text-xs text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                          {email.content}
                        </pre>
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => copyToClipboard(email.content)}
                            className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {(selectedLead.generatedLinkedIn?.length || 0) > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">LinkedIn Messages</h3>
                    {selectedLead.generatedLinkedIn?.map((msg) => (
                      <div key={msg.id} className="p-4 bg-secondary/50 border border-border rounded-xl space-y-3 relative group">
                        <p className="text-xs text-foreground leading-relaxed">
                          {msg.content}
                        </p>
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => copyToClipboard(msg.content)}
                            className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchPage;