import React, { useState, useEffect } from 'react';
import { ROSReport, SimulationResult, AppState } from './types';
import { analyzeROSCode, runSimulation } from './services/geminiService';
import { FileUpload } from './components/FileUpload';
import { ReportViewer } from './components/ReportViewer';
import { SimulationRunner } from './components/SimulationRunner';
import { Cpu, ChevronRight, Loader2, RefreshCw, Moon, Sun } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [report, setReport] = useState<ROSReport | null>(null);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  
  // Theme Management
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('theme') === 'dark' ||
            (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleFileSelect = async (file: File) => {
    setAppState(AppState.ANALYZING);
    setReport(null);
    setSimResult(null);

    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const analysis = await analyzeROSCode(file.name);
    setReport(analysis);
    setAppState(AppState.REPORT_READY);
  };

  const handleRunSimulation = async () => {
    if (!report) return;
    
    setAppState(AppState.SIMULATING);
    
    // Simulate boot up time
    await new Promise(resolve => setTimeout(resolve, 2000));

    const result = await runSimulation(report);
    setSimResult(result);
    setAppState(AppState.SIMULATION_COMPLETE);
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setReport(null);
    setSimResult(null);
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md">
              <Cpu className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight transition-colors">
              ROS<span className="text-blue-600 dark:text-blue-500">Audit</span> & Sim
            </h1>
          </div>
          
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
             <div className="hidden md:flex gap-6">
                 <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Documentation</a>
                 <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Example Packages</a>
             </div>
             <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>
             
             {/* Theme Toggle */}
             <button 
                onClick={toggleTheme}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle Dark Mode"
             >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>

             <div className="hidden md:flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <span className={`w-2 h-2 rounded-full ${appState === AppState.SIMULATING || appState === AppState.ANALYZING ? 'bg-amber-400 animate-pulse' : 'bg-green-400'}`}></span>
                System Ready
             </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50 dark:bg-slate-950 py-12 px-6 transition-colors duration-300">
        
        {/* Progress Stepper */}
        <div className="max-w-3xl mx-auto mb-12 flex items-center justify-center gap-4 text-sm font-medium text-slate-400 dark:text-slate-500">
             <span className={`${appState !== AppState.IDLE ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'} transition-colors`}>1. Upload</span>
             <ChevronRight className="w-4 h-4" />
             <span className={`${appState === AppState.ANALYZING || appState === AppState.REPORT_READY ? 'text-slate-800 dark:text-slate-200' : appState === AppState.SIMULATION_COMPLETE ? 'text-blue-600 dark:text-blue-400' : ''} transition-colors`}>2. Analyze</span>
             <ChevronRight className="w-4 h-4" />
             <span className={`${appState === AppState.SIMULATING || appState === AppState.SIMULATION_COMPLETE ? 'text-slate-800 dark:text-slate-200' : ''} transition-colors`}>3. Simulate</span>
        </div>

        {/* View Switcher based on State */}
        <div className="w-full">
            {appState === AppState.IDLE && (
                <div className="animate-fade-in-up">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 transition-colors">Validate your Robotics Code</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto transition-colors">
                            Upload your ROS/ROS2 packages for instant static analysis, structure validation, and a simulated preview environment.
                        </p>
                    </div>
                    <FileUpload onFileSelect={handleFileSelect} />
                </div>
            )}

            {appState === AppState.ANALYZING && (
                <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
                    <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-500 animate-spin mb-6" />
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Analyzing Package Structure...</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Checking syntax, dependencies, and safety heuristics.</p>
                </div>
            )}

            {(appState === AppState.REPORT_READY || appState === AppState.SIMULATING) && report && (
                <div className="space-y-8">
                    <ReportViewer report={report} onRunSimulation={handleRunSimulation} />
                    {appState === AppState.SIMULATING && (
                        <div className="fixed inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center transition-colors">
                             <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-2xl flex flex-col items-center border border-slate-200 dark:border-slate-800">
                                 <Loader2 className="w-10 h-10 text-blue-600 dark:text-blue-500 animate-spin mb-4" />
                                 <h3 className="text-lg font-bold text-slate-800 dark:text-white">Initializing Simulator</h3>
                                 <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Launching Gazebo environment...</p>
                                 <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Spawning UR5 robot</p>
                             </div>
                        </div>
                    )}
                </div>
            )}

            {appState === AppState.SIMULATION_COMPLETE && report && simResult && (
                <div className="space-y-8 animate-fade-in">
                    <div className="flex items-center justify-between max-w-6xl mx-auto">
                         <h2 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors">Simulation Results</h2>
                         <button 
                            onClick={handleReset}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                         >
                            <RefreshCw className="w-4 h-4" />
                            Start Over
                         </button>
                    </div>
                    <SimulationRunner result={simResult} isDarkMode={isDarkMode} />
                    
                    {/* Compact Report Review */}
                    <div className="max-w-6xl mx-auto pt-8 border-t border-slate-200 dark:border-slate-800 transition-colors">
                        <details className="group">
                            <summary className="flex items-center justify-between cursor-pointer list-none">
                                <span className="font-semibold text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition">View Original Analysis Report</span>
                                <span className="transition group-open:rotate-180">
                                    <ChevronRight className="w-5 h-5 text-slate-400" />
                                </span>
                            </summary>
                            <div className="mt-6">
                                <ReportViewer report={report} onRunSimulation={() => {}} />
                            </div>
                        </details>
                    </div>
                </div>
            )}
        </div>

      </main>
    </div>
  );
};

export default App;