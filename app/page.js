'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [trophies, setTrophies] = useState([]);

  useEffect(() => {
    // This fetches your actual published spreadsheet data
    const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSH5lbwrDIqmc4DImgbz-KX5NzLiaKUHTeOyceh1HfhweR3xnEzH-38VwegvLs5Wmc9rGLIcF9BjP35/pub?output=csv';
    
    fetch(url)
      .then(res => res.text())
      .then(csv => {
        const rows = csv.split('\n').slice(1); // Skip header row
        const data = rows.map(row => {
          const cols = row.split(',');
          return { id: cols[0], type: cols[1], name: cols[2] };
        }).filter(t => t.name);
        setTrophies(data);
      });
  }, []);

  const getCount = (type) => trophies.filter(t => t.type?.trim() === type).length;

  return (
    <div className="relative w-full min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-cyan-400 mb-8">MAJEDGAMES Trophy Hub</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {['Platinum', 'Gold', 'Silver', 'Bronze'].map((type) => (
            <div key={type} className="p-6 bg-slate-900 border border-slate-700 rounded-xl text-center">
              <div className="text-3xl font-bold">{getCount(type)}</div>
              <div className="text-xs uppercase tracking-widest text-slate-400">{type}</div>
            </div>
          ))}
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
          {trophies.map((trophy, i) => (
            <div key={i} className="flex justify-between p-4 border-b border-slate-800">
              <span>{trophy.name}</span>
              <span className="text-xs text-slate-400">{trophy.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
