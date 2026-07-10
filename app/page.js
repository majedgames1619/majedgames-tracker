'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [trophies, setTrophies] = useState([]);

  // For now, this is your list of data from your AC TEST sheet
  useEffect(() => {
    setTrophies([
      { id: 1, type: 'Platinum', name: 'Master Assassin' },
      { id: 2, type: 'Gold', name: 'Committed to the Cause' },
      { id: 3, type: 'Silver', name: 'Barfly' },
      { id: 14, type: 'Bronze', name: 'Lively Havana' }
      // ... your other trophies will appear here
    ]);
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-cyan-400 mb-8">MAJEDGAMES Trophy Hub</h1>
        
        {/* Trophy Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {['Platinum', 'Gold', 'Silver', 'Bronze'].map((type) => (
            <div key={type} className="p-6 bg-slate-900 border border-slate-700 rounded-xl text-center">
              <div className="text-3xl font-bold">{trophies.filter(t => t.type === type).length}</div>
              <div className="text-xs uppercase tracking-widest text-slate-400">{type}</div>
            </div>
          ))}
        </div>

        {/* Full Trophy List */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-700 font-bold text-cyan-400">All Trophies</div>
          {trophies.map((trophy) => (
            <div key={trophy.id} className="flex justify-between p-4 border-b border-slate-800 hover:bg-slate-800">
              <span>{trophy.name}</span>
              <span className={`text-xs px-2 py-1 rounded ${trophy.type === 'Platinum' ? 'bg-cyan-900' : 'bg-slate-700'}`}>
                {trophy.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
