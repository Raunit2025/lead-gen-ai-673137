import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Target, Mail, BarChart3, ArrowRight, Search, MessageSquare, ShieldCheck } from 'lucide-react';
import { authService } from '../services/authService';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleScrollToHowItWorks = () => {
    const section = document.getElementById('how-it-works');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGetStarted = () => {
    if (authService.isAuthenticated()) {
      navigate('/search');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="text-primary-foreground w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">LeadGen AI</span>
        </div>
        <div className="flex items-center gap-6">
          {!authService.isAuthenticated() ? (
            <>
              <Link to="/auth" className="font-medium text-muted-foreground hover:text-foreground">Log in</Link>
              <button 
                onClick={handleGetStarted}
                className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-all shadow-lg shadow-primary/20"
              >
                Get Started
              </button>
            </>
          ) : (
            <Link 
              to="/search" 
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-all shadow-lg shadow-primary/20"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          AI-Powered Prospecting is here
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
          Find high-intent B2B leads and generate <br />
          <span className="text-primary">personalized AI outreach</span> in seconds.
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
          LeadGen AI helps sales teams discover targeted companies, analyze their potential pain points, and generate personalized outreach messages using AI.
        </p>
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center justify-center gap-4">
            <button 
              onClick={handleGetStarted}
              className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-semibold text-lg hover:opacity-90 transition-all shadow-xl shadow-primary/20 flex items-center gap-2 group"
            >
              Start Finding Leads
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={handleScrollToHowItWorks}
              className="px-8 py-4 bg-secondary text-foreground rounded-2xl font-semibold text-lg hover:bg-muted transition-all"
            >
              Watch Demo
            </button>
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            Built for modern sales teams • AI-powered prospecting • Instant outreach generation
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4 p-6 rounded-3xl hover:bg-muted/50 transition-colors">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
              <Target className="text-blue-500 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">AI Lead Discovery</h3>
            <p className="text-muted-foreground leading-relaxed">Discover high-quality B2B companies based on industry, company size, and target decision-maker roles.</p>
          </div>
          <div className="space-y-4 p-6 rounded-3xl hover:bg-muted/50 transition-colors">
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center">
              <Mail className="text-purple-500 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">AI Outreach Generation</h3>
            <p className="text-muted-foreground leading-relaxed">Generate personalized cold emails and LinkedIn outreach messages instantly using AI.</p>
          </div>
          <div className="space-y-4 p-6 rounded-3xl hover:bg-muted/50 transition-colors">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
              <BarChart3 className="text-emerald-500 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Data Enrichment</h3>
            <p className="text-muted-foreground leading-relaxed">AI analyzes each company to identify potential pain points and suggest effective sales angles.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-24 bg-muted/30 rounded-[3rem] mb-24 scroll-mt-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight mb-4">How LeadGen AI Works</h2>
          <p className="text-muted-foreground text-lg">Three simple steps to automate your sales prospecting</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-background p-8 rounded-[2rem] shadow-sm border border-border/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 text-6xl font-black text-muted/20 select-none">1</div>
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <Search className="text-primary w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mb-3">Search Leads</h3>
            <p className="text-muted-foreground">Enter industry, role, and company size to discover potential B2B prospects.</p>
          </div>
          <div className="bg-background p-8 rounded-[2rem] shadow-sm border border-border/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 text-6xl font-black text-muted/20 select-none">2</div>
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck className="text-primary w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mb-3">Enrich Companies</h3>
            <p className="text-muted-foreground">AI analyzes company profiles and surfaces potential challenges and opportunities.</p>
          </div>
          <div className="bg-background p-8 rounded-[2rem] shadow-sm border border-border/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 text-6xl font-black text-muted/20 select-none">3</div>
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <MessageSquare className="text-primary w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mb-3">Generate Outreach</h3>
            <p className="text-muted-foreground">Create personalized cold emails and LinkedIn messages tailored to each lead.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-border">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <Zap className="text-primary-foreground w-4 h-4" />
              </div>
              <span className="font-bold text-lg tracking-tight">LeadGen AI</span>
            </div>
            <p className="text-muted-foreground max-w-xs text-sm">
              AI-powered lead discovery and outreach automation
            </p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-muted-foreground text-sm">
              Built by Raunit Raj using MATTR
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              &copy; {new Date().getFullYear()} LeadGen AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

