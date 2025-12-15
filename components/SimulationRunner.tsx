import React, { useEffect, useState, useRef } from 'react';
import { SimulationResult, SimulationStep } from '../types';
import { Play, Pause, RotateCcw, Terminal, LineChart } from 'lucide-react';
import { LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface SimulationRunnerProps {
  result: SimulationResult;
  isDarkMode?: boolean;
}

export const SimulationRunner: React.FC<SimulationRunnerProps> = ({ result, isDarkMode = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'preview' | 'data'>('preview');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [result.logs]);

  // Frame playback loop
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentFrameIndex((prev) => {
          if (prev >= result.frames.length - 1) {
            setIsPlaying(false);
            return 0; // Loop or stop
          }
          return prev + 1;
        });
      }, 800); // 800ms per frame for a slower "slideshow" feel
    }
    return () => clearInterval(interval);
  }, [isPlaying, result.frames.length]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPlaying(false);
    setCurrentFrameIndex(Number(e.target.value));
  };

  const totalDuration = (result.frames.length - 1) * 0.5;
  const currentTime = currentFrameIndex * 0.5;

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        
        {/* Left Col: Simulation View (2/3 width) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          
          {/* Header / Tabs */}
          <div className="bg-white dark:bg-slate-900 rounded-t-xl p-1 flex gap-2 border-b border-slate-200 dark:border-slate-700 transition-colors">
             <button 
               onClick={() => setActiveTab('preview')}
               className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'preview' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
             >
               3D Preview
             </button>
             <button 
               onClick={() => setActiveTab('data')}
               className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'data' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
             >
               Joint Data
             </button>
          </div>

          {/* Main Visualizer Area */}
          <div className="flex-1 bg-black rounded-xl overflow-hidden relative shadow-lg group border border-slate-200 dark:border-slate-800 flex flex-col">
             {activeTab === 'preview' ? (
                <>
                   {/* Frame Display */}
                   <div className="flex-1 relative w-full overflow-hidden bg-zinc-950">
                       <img 
                          src={result.frames[currentFrameIndex]} 
                          alt={`Simulation Frame ${currentFrameIndex}`}
                          className="w-full h-full object-cover opacity-90"
                       />
                       
                       {/* Overlay HUD */}
                       <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded font-mono text-xs border border-white/10 shadow-sm pointer-events-none">
                          <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                              <span>{isPlaying ? 'RUNNING' : 'PAUSED'}</span>
                          </div>
                       </div>
                   </div>

                   {/* Controls Bar */}
                   <div className="bg-slate-900 border-t border-slate-800 p-3 flex items-center gap-4 select-none">
                      <div className="flex items-center gap-1">
                          <button 
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="p-2 rounded-full hover:bg-slate-800 text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            title={isPlaying ? "Pause" : "Play"}
                          >
                             {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                          </button>
                          <button 
                            onClick={() => { setCurrentFrameIndex(0); setIsPlaying(true); }}
                            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            title="Reset Simulation"
                          >
                             <RotateCcw className="w-4 h-4" />
                          </button>
                      </div>

                      <div className="flex-1 flex items-center gap-3">
                        <span className="text-xs font-mono text-slate-400 w-[40px] text-right">
                            {currentTime.toFixed(1)}s
                        </span>
                        
                        <div className="flex-1 relative h-6 flex items-center group/slider">
                            {/* Track background */}
                            <div className="absolute w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                {/* Progress fill */}
                                <div 
                                    className="h-full bg-blue-600 transition-all duration-75 ease-out"
                                    style={{ width: `${(currentFrameIndex / (result.frames.length - 1)) * 100}%` }}
                                ></div>
                            </div>
                            {/* Input Range (invisible but clickable) */}
                            <input 
                                type="range" 
                                min="0" 
                                max={result.frames.length - 1} 
                                value={currentFrameIndex}
                                onChange={handleSliderChange}
                                className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            {/* Thumb (Visual only, follows calculation) */}
                            <div 
                                className="absolute h-3.5 w-3.5 bg-white rounded-full shadow border border-slate-300 pointer-events-none transition-all duration-75 ease-out group-hover/slider:scale-125"
                                style={{ 
                                    left: `${(currentFrameIndex / (result.frames.length - 1)) * 100}%`,
                                    transform: `translateX(-50%)`
                                }}
                            ></div>
                        </div>

                        <span className="text-xs font-mono text-slate-500 w-[40px]">
                            {totalDuration.toFixed(1)}s
                        </span>
                      </div>
                   </div>
                </>
             ) : (
                <div className="w-full h-full bg-white dark:bg-slate-900 p-4 transition-colors">
                    <ResponsiveContainer width="100%" height="100%">
                        <RechartsLine data={result.data}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#334155" : "#e2e8f0"} />
                            <XAxis 
                              dataKey="time" 
                              stroke={isDarkMode ? "#94a3b8" : "#64748b"}
                              label={{ value: 'Time (s)', position: 'insideBottomRight', offset: -5, fill: isDarkMode ? "#94a3b8" : "#64748b" }} 
                            />
                            <YAxis 
                              stroke={isDarkMode ? "#94a3b8" : "#64748b"}
                              label={{ value: 'Angle (rad)', angle: -90, position: 'insideLeft', fill: isDarkMode ? "#94a3b8" : "#64748b" }} 
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: isDarkMode ? '#1e293b' : '#fff', 
                                borderColor: isDarkMode ? '#334155' : '#ccc',
                                color: isDarkMode ? '#f1f5f9' : '#000'
                              }}
                            />
                            <Legend />
                            {/* Visualizing first 3 joints */}
                            <Line type="monotone" dataKey="jointPositions[0]" name="Shoulder Pan" stroke="#3b82f6" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="jointPositions[1]" name="Shoulder Lift" stroke="#ef4444" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="jointPositions[2]" name="Elbow" stroke="#22c55e" strokeWidth={2} dot={false} />
                        </RechartsLine>
                    </ResponsiveContainer>
                </div>
             )}
          </div>
        </div>

        {/* Right Col: Logs (1/3 width) */}
        <div className="lg:col-span-1 bg-slate-900 rounded-xl overflow-hidden shadow-lg flex flex-col border border-slate-800">
            <div className="px-4 py-3 border-b border-slate-700 bg-slate-800 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-semibold text-slate-300">System Logs</span>
            </div>
            <div 
                ref={scrollRef}
                className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-1.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
            >
                {result.logs.map((log, i) => {
                    const isError = log.includes("Error") || log.includes("FAIL");
                    const isSuccess = log.includes("SUCCESS");
                    const color = isError ? 'text-red-400' : isSuccess ? 'text-green-400' : 'text-slate-300';
                    return (
                        <div key={i} className={`${color} break-words leading-relaxed`}>
                            <span className="opacity-50 mr-2">
                                {new Date().toLocaleTimeString('en-US', {hour12: false})}:
                            </span>
                            {log}
                        </div>
                    );
                })}
                {!isPlaying && result.frames.length > 0 && (
                    <div className="text-blue-400 mt-2">-- End of Simulation --</div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};