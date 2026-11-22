import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function InfoTile({ icon: Icon, title, description, to }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="group text-left w-full rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 transition-all duration-200 hover:border-emerald-600 hover:bg-slate-900"
    >
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 transition-colors group-hover:bg-emerald-500 group-hover:text-white">
          {Icon && <Icon className="w-6 h-6" />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-white mb-1.5">{title}</h3>
          <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
        </div>
        <ArrowRight className="shrink-0 w-5 h-5 text-slate-600 group-hover:text-emerald-400 transition-colors mt-0.5" />
      </div>
    </button>
  );
}