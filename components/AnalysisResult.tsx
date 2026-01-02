
import React, { useState } from 'react';
import { AnalysisResponse, SwotItem } from '../types';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2, Info, ExternalLink, ChevronRight } from 'lucide-react';

interface Props {
  data: AnalysisResponse;
}

const InteractiveSwotItem: React.FC<{ item: SwotItem; color: string }> = ({ item, color }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`relative p-3 rounded-xl transition-all duration-300 cursor-help border border-transparent hover:border-${color}-200 hover:bg-${color}-50/50 group`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-1 transition-transform duration-300 ${isHovered ? 'rotate-90 scale-110' : ''}`}>
          {item.isHighRisk ? (
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          ) : (
            <ChevronRight className={`w-4 h-4 text-${color}-400 shrink-0`} />
          )}
        </div>
        <div className="flex-1">
          <p className={`text-sm font-bold transition-colors duration-300 ${
            item.isHighRisk 
              ? 'text-red-700' 
              : isHovered ? `text-${color}-700` : 'text-slate-800'
          }`}>
            {item.point}
          </p>
          <div 
            className={`grid transition-all duration-300 ease-in-out ${
              isHovered ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0 mt-0'
            }`}
          >
            <div className="overflow-hidden">
              <p className={`text-xs leading-relaxed ${item.isHighRisk ? 'text-red-600/80' : 'text-slate-500'}`}>
                {item.description}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Visual indicator for interactive element */}
      <div className={`absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity`}>
        <div className={`w-1.5 h-1.5 rounded-full bg-${color}-400 animate-pulse`} />
      </div>
    </div>
  );
};

const SwotCard: React.FC<{ title: string; items: SwotItem[]; color: string; icon: React.ReactNode }> = ({ title, items, color, icon }) => (
  <div className={`p-5 rounded-2xl border bg-white shadow-sm border-${color}-100 flex flex-col h-full`}>
    <div className="flex items-center gap-3 mb-4">
      <div className={`p-2 rounded-xl bg-${color}-50 text-${color}-600 shadow-sm`}>
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-slate-800">{title}</h3>
        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">交互式查看详情</p>
      </div>
    </div>
    <div className="space-y-1 flex-1">
      {items && items.length > 0 ? items.map((item, idx) => (
        <InteractiveSwotItem key={idx} item={item} color={color} />
      )) : (
        <div className="flex flex-col items-center justify-center py-8 text-slate-300 italic text-sm">
          暂无数据
        </div>
      )}
    </div>
  </div>
);

export const AnalysisResult: React.FC<Props> = ({ data }) => {
  const getDecisionInfo = (decision: string) => {
    switch (decision) {
      case 'Buy': return { label: '建议买入', color: 'bg-emerald-500', icon: <TrendingUp className="w-8 h-8" /> };
      case 'Sell': return { label: '建议卖出', color: 'bg-rose-500', icon: <TrendingDown className="w-8 h-8" /> };
      case 'Hold': return { label: '建议持有', color: 'bg-amber-500', icon: <Minus className="w-8 h-8" /> };
      case 'Wait': return { label: '建议观望', color: 'bg-slate-500', icon: <Info className="w-8 h-8" /> };
      default: return { label: decision, color: 'bg-slate-500', icon: <CheckCircle2 className="w-8 h-8" /> };
    }
  };

  const decisionInfo = getDecisionInfo(data.decision);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Executive Decision Banner */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 group">
        <div className="flex flex-col md:flex-row">
          <div className={`md:w-1/4 p-10 flex flex-col items-center justify-center text-center ${decisionInfo.color} text-white transition-all duration-500 group-hover:scale-[1.02] origin-left`}>
            <span className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">决策建议</span>
            <span className="text-4xl font-black mb-3 leading-tight">{decisionInfo.label}</span>
            <div className="opacity-50 group-hover:scale-110 transition-transform duration-500">
              {decisionInfo.icon}
            </div>
          </div>
          <div className="md:w-3/4 p-10 bg-slate-50/30">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-amber-500" />
              执行战略摘要
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed italic mb-6">"{data.executiveSummary}"</p>
            <div className="pt-6 border-t border-slate-200/60">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">决策核心逻辑</h4>
              <p className="text-sm text-slate-700 leading-relaxed bg-white/50 p-4 rounded-2xl border border-slate-100 shadow-sm">
                {data.decisionRationale}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.financialData.map((metric, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{metric.label}</span>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-black text-slate-900">{metric.value}</span>
              <div className={`p-1.5 rounded-lg ${
                metric.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 
                metric.trend === 'down' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'
              }`}>
                {metric.trend === 'up' && <TrendingUp className="w-5 h-5" />}
                {metric.trend === 'down' && <TrendingDown className="w-5 h-5" />}
                {metric.trend === 'stable' && <Minus className="w-5 h-5" />}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SWOT Analysis Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SwotCard 
          title="优势 (Strengths)" 
          items={data.swot.strengths} 
          color="emerald" 
          icon={<TrendingUp className="w-5 h-5" />} 
        />
        <SwotCard 
          title="劣势 (Weaknesses)" 
          items={data.swot.weaknesses} 
          color="rose" 
          icon={<AlertTriangle className="w-5 h-5" />} 
        />
        <SwotCard 
          title="机会 (Opportunities)" 
          items={data.swot.opportunities} 
          color="blue" 
          icon={<TrendingUp className="w-5 h-5 rotate-45" />} 
        />
        <SwotCard 
          title="威胁 (Threats)" 
          items={data.swot.threats} 
          color="amber" 
          icon={<AlertTriangle className="w-5 h-5" />} 
        />
      </div>

      {/* Hidden Risks & Market Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
            <AlertTriangle className="w-32 h-32" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-rose-500/20 rounded-xl">
                <AlertTriangle className="text-rose-400 w-6 h-6" />
              </div>
              <h3 className="font-black text-xl tracking-tight">隐形风险预测</h3>
            </div>
            <ul className="space-y-4">
              {data.hiddenRisks.map((risk, idx) => (
                <li key={idx} className="flex items-start gap-4 text-slate-300 group/item">
                  <div className="w-2 h-2 rounded-full bg-rose-500 mt-2.5 shrink-0 group-hover/item:scale-150 transition-transform" />
                  <span className="text-sm leading-relaxed">{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <Info className="text-indigo-600 w-6 h-6" />
            </div>
            <h3 className="font-black text-xl text-slate-900 tracking-tight">市场与管理洞察</h3>
          </div>
          <div className="space-y-6">
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">市场前景关键词</h4>
              <div className="flex flex-wrap gap-2">
                {data.marketInsights.map((insight, idx) => (
                  <span key={idx} className="px-4 py-1.5 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-colors cursor-default">
                    {insight}
                  </span>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">管理层表态 / 情绪</h4>
              <p className="text-sm text-slate-600 leading-relaxed bg-indigo-50/30 p-5 rounded-2xl border border-indigo-100/50">
                {data.managementSentiment}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sources Section */}
      {data.sources && data.sources.length > 0 && (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <h3 className="font-black text-lg text-slate-900 mb-6 flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-xl">
              <ExternalLink className="w-5 h-5 text-slate-600" />
            </div>
            网络验证参考源
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.sources.map((source, idx) => (
              <a 
                key={idx} 
                href={source.uri} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md hover:border-indigo-200 transition-all group"
              >
                <div className="flex flex-col truncate mr-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1">Source {idx + 1}</span>
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-700 truncate">
                    {source.title}
                  </span>
                </div>
                <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-indigo-50 transition-colors shrink-0">
                  <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-indigo-500" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Sparkle Icon Component
const SparklesIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
  </svg>
);
