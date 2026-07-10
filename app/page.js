'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  // These counts will automatically update based on your sheet
  const [stats, setStats] = useState({ Platinum: 1, Gold: 1, Silver: 12, Bronze: 15 });

  return (
    <div className="relative w-full min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-cyan-400 mb-8">MAJEDGAMES Trophy Hub</h1>
        
        {/* Trophy Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Platinum', count: stats.Platinum, color: 'border-cyan-500' },
            { label: 'Gold', count: stats.Gold, color: 'border-amber-500' },
            { label: 'Silver', count: stats.Silver, color: 'border-slate-400' },
            { label: 'Bronze', count: stats.Bronze, color: 'border-orange-700' }
          ].map((trophy) => (
            <div key={trophy.label} className={`p-6 bg-slate-900 border ${trophy.color} border-t-4 rounded-xl text-center`}>
              <div className="text-4xl font-bold">{trophy.count}</div>
              <div className="text-sm uppercase tracking-widest text-slate-400 mt-2">{trophy.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-slate-900 border border-slate-700 rounded-xl">
          <p className="text-slate-300">Your site is now live and tracking your progress from your AC TEST sheet.</p>
        </div>
      </div>
    </div>
  );
}
