'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [stats, setStats] = useState({ platinum: 0, gold: 0, silver: 0, bronze: 0, completion: 0 });

  useEffect(() => {
    // This connects to the "JSON" version of your published sheet
    const sheetId = '2PACX-1vSH5lbwrDIqmc4DImgbz-KX5NzLiaKUHTeOyceh1HfhweR3xnEzH-38VwegvLs5Wmc9rGLIcF9BjP35';
    fetch(`https://spreadsheets.google.com/feeds/cells/${sheetId}/od6/public/values?alt=json`)
      .then(res => res.json())
      .then(data => {
        // Here we would extract your numbers from the spreadsheet cells
        // For now, this establishes the live connection
        console.log("Data tunnel active:", data);
      });
  }, []);

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-slate-950 text-white font-sans">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950" />
      <div className="relative z-10 max-w-7xl mx-auto h-full flex flex-col md:flex-row items-center justify-between px-6 py-24 gap-8">
        <div className="flex flex-col items-center md:items-start w-full md:w-1/2">
          <h2 className="text-5xl md:text-7xl font-black italic tracking-widest text-slate-200 drop-shadow-lg">BLACK FLAG</h2>
          <div className="flex gap-2 mt-6 text-xs font-bold tracking-widest uppercase">
            <span className="bg-white/10 px-3 py-1 rounded border border-white/20">PS5</span>
            <span className="text-slate-400 px-2 py-1">⏳ 50-60 Hrs</span>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex flex-col items-center md:items-end text-center md:text-right">
          <h1 className="text-4xl md:text-5xl font-gaming tracking-tight text-cyan-400">MAJED<span className="text-white">GAMES</span></h1>
          
          <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 p-4 rounded-xl mb-6 backdrop-blur-sm">
            <div className="flex justify-between text-xs mb-2 font-semibold">
              <span className="text-slate-400">Overall Progress</span>
              <span className="text-cyan-400">{stats.completion}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full" style={{ width: `${stats.completion}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 w-full max-w-md">
            {[
              { label: 'Platinum', count: stats.platinum, color: 'border-cyan-500/50 text-cyan-400 bg-cyan-950/40' },
              { label: 'Gold', count: stats.gold, color: 'border-amber-500/50 text-amber-400 bg-amber-950/40' },
              { label: 'Silver', count: stats.silver, color: 'border-slate-400/50 text-slate-300 bg-slate-900/40' },
              { label: 'Bronze', count: stats.bronze, color: 'border-orange-700/50 text-orange-400 bg-orange-950/40' }
            ].map((trophy, idx) => (
              <div key={idx} className={`flex flex-col items-center justify-center p-3 rounded-xl border backdrop-blur-md ${trophy.color}`}>
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
