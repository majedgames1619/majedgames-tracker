import React from 'react';

export default function Home() {
  const platinumCount = 1;
  const goldCount = 3;
  const silverCount = 12;
  const bronzeCount = 45;
  const completionPercentage = 45;

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-slate-950 text-white font-sans">
      {/* Dark Background Layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950" />

      {/* Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto h-full flex flex-col md:flex-row items-center justify-between px-6 py-24 gap-8">
        
        {/* Left Side: Game Title */}
        <div className="flex flex-col items-center md:items-start w-full md:w-1/2">
          <h2 className="text-5xl md:text-7xl font-black italic tracking-widest text-slate-200 drop-shadow-lg">
            BLACK FLAG
          </h2>
          <div className="flex gap-2 mt-6 text-xs font-bold tracking-widest uppercase">
            <span className="bg-white/10 px-3 py-1 rounded border border-white/20">PS5</span>
            <span className="bg-white/10 px-3 py-1 rounded border border-white/20">Xbox</span>
            <span className="bg-white/10 px-3 py-1 rounded border border-white/20">PC</span>
            <span className="text-slate-400 px-2 py-1">⏳ 50-60 Hrs</span>
          </div>
        </div>

        {/* Right Side: MAJEDGAMES Branding & Trophy Stats */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-end text-center md:text-right">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-gaming tracking-tight text-cyan-400">
              MAJED<span className="text-white">GAMES</span>
            </h1>
            <p className="text-sm tracking-widest text-slate-400 uppercase mt-2">- Your Trophy Hub -</p>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 p-4 rounded-xl mb-6 backdrop-blur-sm">
            <div className="flex justify-between text-xs mb-2 font-semibold">
              <span className="text-slate-400">Overall Progress</span>
              <span className="text-cyan-400">{completionPercentage}% Complete</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* NEW: Frosted Glass Trophy Cards */}
          <div className="grid grid-cols-4 gap-3 w-full max-w-md">
            {[
              { label: 'Platinum', count: platinumCount, color: 'border-cyan-500/50 text-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]' },
              { label: 'Gold', count: goldCount, color: 'border-amber-500/50 text-amber-400 bg-amber-950/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]' },
              { label: 'Silver', count: silverCount, color: 'border-slate-400/50 text-slate-300 bg-slate-900/40 shadow-[0_0_15px_rgba(148,163,184,0.3)]' },
              { label: 'Bronze', count: bronzeCount, color: 'border-orange-700/50 text-orange-400 bg-orange-950/40 shadow-[0_0_15px_rgba(194,65,12,0.3)]' }
            ].map((trophy, idx) => (
              <div key={idx} className={`flex flex-col items-center justify-center p-3 rounded-xl border backdrop-blur-md hover:scale-105 transition-transform duration-300 ${trophy.color}`}>
                <span className="text-2xl font-bold">{trophy.count}</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-300 mt-1">{trophy.label}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
