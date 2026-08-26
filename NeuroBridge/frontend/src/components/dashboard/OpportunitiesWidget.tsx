import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, ArrowRight, MapPin, Building, Sparkles } from 'lucide-react';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { getTranslation } from '../../utils/translations';
import { useNavigate } from 'react-router-dom';

interface OpportunitiesWidgetProps {
  onNavigate: (tab: string) => void;
}

interface OpportunityItem {
  id: string | number;
  title: string;
  company: string;
  location?: string;
  type?: string;
}

export function OpportunitiesWidget({ onNavigate }: OpportunitiesWidgetProps) {
  const { language } = useDyslexia();
  const t = getTranslation(language);
  const navigate = useNavigate();

  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetch('http://localhost:4000/api/opportunities/linkedin/jobs')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!isMounted) return;
        if (Array.isArray(data) && data.length > 0) {
          setOpportunities(data.slice(0, 2));
        } else {
          // Try unstop endpoint
          return fetch('http://localhost:4000/api/opportunities/unstop/jobs')
            .then((res) => (res.ok ? res.json() : []))
            .then((unstopData) => {
              if (!isMounted) return;
              if (Array.isArray(unstopData) && unstopData.length > 0) {
                setOpportunities(unstopData.slice(0, 2));
              }
            });
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenOpportunities = () => {
    navigate('/dashboard/opportunities');
    onNavigate('opportunities');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="bg-white rounded-3xl p-6 border border-blue-100/80 shadow-xs flex flex-col justify-between h-full relative overflow-hidden group hover:shadow-sm hover:border-blue-200 transition-all"
    >
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-50/60 rounded-full blur-xl pointer-events-none" />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB]">
            <Briefcase size={20} />
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Sparkles size={11} /> {opportunities.length > 0 ? `${opportunities.length} Available` : 'Curated'}
          </span>
        </div>

        <h3 className="text-lg font-extrabold text-[#1A202C] mb-1">
          {t.opportunities || 'Opportunities'}
        </h3>
        <p className="text-xs text-[#64748B] mb-4">
          Matched to your strengths and learning profile.
        </p>

        {/* Opportunity List / Loading / Empty */}
        {isLoading ? (
          <div className="space-y-2 mb-6">
            <div className="h-16 bg-slate-100 animate-pulse rounded-2xl" />
            <div className="h-16 bg-slate-100 animate-pulse rounded-2xl" />
          </div>
        ) : opportunities.length > 0 ? (
          <div className="space-y-2.5 mb-6">
            {opportunities.map((job) => (
              <div
                key={job.id}
                onClick={handleOpenOpportunities}
                className="p-3 rounded-2xl bg-[#F8FAFC] border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-[#2563EB] text-white font-black text-[11px] flex items-center justify-center shrink-0 shadow-xs">
                  {job.company ? job.company.charAt(0).toUpperCase() : 'J'}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-extrabold text-[#1A202C] truncate">
                    {job.title}
                  </h4>
                  <div className="text-[11px] font-medium text-[#64748B] truncate flex items-center gap-1 mt-0.5">
                    <Building size={11} className="shrink-0" />
                    <span>{job.company}</span>
                  </div>
                  {job.location && (
                    <div className="text-[10px] text-[#94A3B8] flex items-center gap-1 mt-1">
                      <MapPin size={10} /> {job.location}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 text-center mb-6">
            <p className="text-xs font-medium text-[#64748B]">
              Discover accessible tech & remote career opportunities.
            </p>
            <span className="text-[10px] font-bold text-[#2563EB] mt-1 inline-block">
              Connect LinkedIn or Unstop in hub
            </span>
          </div>
        )}
      </div>

      {/* CTA Button */}
      <button
        onClick={handleOpenOpportunities}
        className="w-full h-11 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 group shrink-0"
      >
        <span>Explore Opportunities</span>
        <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    </motion.div>
  );
}
