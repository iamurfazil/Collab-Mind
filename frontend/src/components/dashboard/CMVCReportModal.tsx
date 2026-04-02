import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, TrendingUp, AlertTriangle, Zap, CheckCircle, 
  Target, ShieldAlert, Cpu, Database, Network, ArrowRight, ArrowLeft, X
} from 'lucide-react';

// FIX IS HERE: Added the word 'type'
import type { CMVCReport } from '../../store';

interface CMVCReportModalProps {
  ideaTitle: string;
  ideaDescription: string;
  onProceed?: (report: CMVCReport) => void;
  onEdit?: () => void;
  onClose?: () => void; 
  viewOnly?: boolean;
  reportData?: CMVCReport; 
}

// Simulated JSON Output based on your GCP Architecture Spec
const generateMockReport = (title: string): CMVCReport => ({
  idea_summary: `AI-driven analysis of "${title}"`,
  problem_validation: "Strong market indicator found in recent search trends. The problem space shows a 24% YoY growth in developer queries.",
  market_analysis: {
    demand_score: 8.5
  },
  competition: {
    similarity_score: 0.62,
    similar_examples: ["Startup Alpha", "Beta Solutions"]
  },
  feasibility: {
    technical: 7.5,
    operational: 6.0,
    economic: 8.0
  },
  value_density: 8.2, // (Severity × Frequency × WTP) / Complexity
  risk: {
    level: "low",
    risk_score: 3.5
  },
  final_score: 8.1,
  label: "High Potential"
});

export default function CMVCReportModal({ ideaTitle, ideaDescription, onProceed, onEdit, onClose, viewOnly, reportData }: CMVCReportModalProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(!viewOnly);
  const [loadingStep, setLoadingStep] = useState(0);
  const [report, setReport] = useState<CMVCReport | null>(reportData || null);

  // The 8-Step GCP Pipeline Steps to display during loading
  const pipelineSteps = [
    { text: "Initializing Collab Mind Validation Core...", icon: Cpu },
    { text: "Running Semantic Decomposition via Vertex AI...", icon: Brain },
    { text: "Querying Deep Research Engine (BigQuery)...", icon: Database },
    { text: "Vector Similarity Search (Competitor Analysis)...", icon: Network },
    { text: "Calculating Feasibility & Value Density...", icon: Zap },
    { text: "Generating Final AI Score...", icon: Target }
  ];

  useEffect(() => {
    if (viewOnly) return; 

    // Simulate the Async Processing (Cloud Functions)
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < pipelineSteps.length) {
        setLoadingStep(currentStep);
      } else {
        clearInterval(interval);
        setReport(generateMockReport(ideaTitle));
        setIsAnalyzing(false);
      }
    }, 800); 

    return () => clearInterval(interval);
  }, [ideaTitle, viewOnly]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        
        {/* --- STATE 1: AI ANALYZING --- */}
        {isAnalyzing && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl p-10 max-w-md w-full flex flex-col items-center text-center shadow-2xl border border-orange-100"
          >
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-20 rounded-full animate-pulse" />
              <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center relative shadow-lg">
                <Brain className="w-10 h-10 text-white animate-pulse" />
              </div>
            </div>
            
            <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">CMVC Engine Active</h2>
            <p className="text-orange-500 font-bold mb-8 text-sm uppercase tracking-widest">Processing Idea</p>

            <div className="w-full space-y-3">
              {pipelineSteps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = index === loadingStep;
                const isPast = index < loadingStep;
                
                return (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: isPast || isActive ? 1 : 0.3, x: 0 }}
                    className={`flex items-center gap-3 text-left ${isActive ? 'text-orange-500 font-bold' : isPast ? 'text-gray-800' : 'text-gray-400'}`}
                  >
                    {isPast ? <CheckCircle className="w-4 h-4 text-green-500" /> : <StepIcon className={`w-4 h-4 ${isActive ? 'animate-spin-slow' : ''}`} />}
                    <span className="text-sm">{step.text}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* --- STATE 2: REPORT GENERATED --- */}
        {!isAnalyzing && report && (
          <motion.div
            key="report"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-200 relative"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Cpu className="w-5 h-5 text-orange-500" />
                  <span className="text-xs font-black uppercase tracking-wider text-orange-500">CMVC Validation Report</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 line-clamp-1">{ideaTitle}</h2>
              </div>
              <div className="text-right flex items-center gap-4">
                 <div className="text-right">
                  <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-400">
                    {report.final_score.toFixed(1)}
                  </div>
                  <div className="text-xs font-bold text-gray-500 uppercase">Final Score</div>
                 </div>
                 {viewOnly && (
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100 ml-4 self-start">
                      <X className="w-5 h-5" />
                    </button>
                 )}
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
              
              {/* Top Banner */}
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white shrink-0">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-green-800">Label: {report.label}</h3>
                  <p className="text-sm text-green-700">{report.problem_validation}</p>
                </div>
              </div>

              {/* 4-Grid Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Value Density */}
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-start justify-between">
                  <div>
                    <div className="text-gray-500 text-xs font-bold uppercase mb-1 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Value Density
                    </div>
                    <div className="text-2xl font-black text-gray-900">{report.value_density.toFixed(1)}</div>
                  </div>
                  <div className="text-[10px] text-right text-gray-400 max-w-[80px]">Severity × Freq × WTP / Comp</div>
                </div>

                {/* Market Demand */}
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-start justify-between">
                  <div>
                    <div className="text-gray-500 text-xs font-bold uppercase mb-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Market Demand
                    </div>
                    <div className="text-2xl font-black text-gray-900">{report.market_analysis.demand_score.toFixed(1)}</div>
                  </div>
                </div>

                {/* Competition */}
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="text-gray-500 text-xs font-bold uppercase mb-1 flex items-center gap-1">
                    <Network className="w-3 h-3" /> Competitor Similarity
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="text-2xl font-black text-orange-500">{(report.competition.similarity_score * 100).toFixed(0)}%</div>
                    <div className="text-xs text-gray-500 mb-1 line-clamp-1 text-right ml-2">
                      e.g., {report.competition.similar_examples.join(', ')}
                    </div>
                  </div>
                </div>

                {/* Risk */}
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-start justify-between">
                  <div>
                    <div className="text-gray-500 text-xs font-bold uppercase mb-1 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Risk Level
                    </div>
                    <div className="text-xl font-black text-gray-900 capitalize">{report.risk.level}</div>
                  </div>
                  <div className="text-xl font-bold text-gray-400">{report.risk.risk_score}/10</div>
                </div>
              </div>

              {/* Feasibility Breakdown */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Feasibility Breakdown</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-600">Technical Engine</span>
                      <span className="font-bold text-gray-900">{report.feasibility.technical}/10</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(report.feasibility.technical / 10) * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-600">Operational</span>
                      <span className="font-bold text-gray-900">{report.feasibility.operational}/10</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(report.feasibility.operational / 10) * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-600">Economic (WTP)</span>
                      <span className="font-bold text-gray-900">{report.feasibility.economic}/10</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${(report.feasibility.economic / 10) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Buttons (Hidden in viewOnly mode) */}
            {!viewOnly && onEdit && onProceed && (
              <div className="p-6 border-t border-gray-100 bg-white flex gap-4">
                <button 
                  onClick={onEdit}
                  className="flex-1 py-3 px-4 bg-gray-50 text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Edit Idea
                </button>
                <button 
                  onClick={() => onProceed(report)}
                  className="flex-[2] py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  Proceed to Publish <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}