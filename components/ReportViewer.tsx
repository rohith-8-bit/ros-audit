import React from 'react';
import { ROSReport } from '../types';
import { CheckCircle2, XCircle, AlertTriangle, FileJson, Activity, Box, ShieldCheck, ShieldAlert } from 'lucide-react';

interface ReportViewerProps {
  report: ROSReport;
  onRunSimulation: () => void;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const color = 
    status === 'PASS' || status === 'SAFE' 
      ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800' 
      : status === 'WARNING' 
      ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800' 
      : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800';
  
  const Icon = 
    status === 'PASS' || status === 'SAFE' ? CheckCircle2 :
    status === 'WARNING' ? AlertTriangle : XCircle;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${color}`}>
      <Icon className="w-3.5 h-3.5" />
      {status}
    </span>
  );
};

export const ReportViewer: React.FC<ReportViewerProps> = ({ report, onRunSimulation }) => {
  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors">Analysis Report</h2>
        <span className="text-sm text-slate-500 dark:text-slate-400 font-mono">Generated: {new Date(report.timestamp).toLocaleTimeString()}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Syntax Check */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <FileJson className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Syntax & Style</h3>
            </div>
            <StatusBadge status={report.syntaxCheck.status} />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{report.syntaxCheck.details}</p>
        </div>

        {/* Structure Check */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <Box className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">ROS Structure</h3>
            </div>
            <StatusBadge status={report.structureCheck.status} />
          </div>
          {report.structureCheck.missingFiles.length > 0 ? (
            <ul className="text-sm text-red-600 dark:text-red-400 list-disc list-inside">
              {report.structureCheck.missingFiles.map((f, i) => <li key={i}>Missing: {f}</li>)}
            </ul>
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-400">Standard ROS package structure verified.</p>
          )}
        </div>

        {/* Detected Nodes & Topics */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <Activity className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Graph Analysis</h3>
             </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Nodes</p>
              <div className="flex flex-wrap gap-2">
                {report.nodesDetected.map(n => (
                  <span key={n} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded border border-slate-200 dark:border-slate-700 font-mono">{n}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Topics</p>
              <div className="flex flex-col gap-1">
                {report.topics.publishers.map(p => (
                   <span key={p} className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                     <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> Pub: {p}
                   </span>
                ))}
                 {report.topics.subscribers.map(s => (
                   <span key={s} className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                     <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span> Sub: {s}
                   </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Safety Heuristics */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                    {report.safetyHeuristics.status === 'SAFE' ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Safety Check</h3>
            </div>
            <StatusBadge status={report.safetyHeuristics.status} />
          </div>
           {report.safetyHeuristics.issues.length > 0 ? (
            <ul className="text-sm text-red-600 dark:text-red-400 list-disc list-inside space-y-1">
              {report.safetyHeuristics.issues.map((issue, i) => <li key={i}>{issue}</li>)}
            </ul>
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-400">Motion parameters within safe limits. Loop rates validated.</p>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800 transition-colors">
        <button
          onClick={onRunSimulation}
          disabled={!report.isValid}
          className={`
            px-8 py-3 rounded-lg font-semibold text-white shadow-md transition-all
            ${report.isValid 
                ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5' 
                : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'}
          `}
        >
          {report.isValid ? 'Launch Simulation Environment' : 'Fix Errors to Simulate'}
        </button>
      </div>
    </div>
  );
};