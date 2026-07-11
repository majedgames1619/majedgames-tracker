'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [trophies, setTrophies] = useState([]);

  useEffect(() => {
    // Still using your direct, live Google Sheet link
    const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSH5lbwrDIqmc4DImgbz-KX5NzLiaKUHTeOyceh1HfhweR3xnEzH-38VwegvLs5Wmc9rGLIcF9BjP35/pub?output=csv';
    
    fetch(url)
      .then(res => res.text())
      .then(csv => {
        const rows = csv.split('\n').slice(1);
        const data = rows.map(row => {
          // This smart split handles commas inside your descriptions safely
          const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(col => col.replace(/"/g, ''));
          return { 
            id: cols[0], 
            type: cols[1]?.trim(), 
            name: cols[2],
            description: cols[4] // Column E in your sheet
          };
        }).filter(t => t.name);
        setTrophies(data);
      });
  }, []);

  const getCount = (type) => trophies.filter(t => t.type === type).length;

  // This sets the right color for the logo based on the trophy type
  const getIconColor = (type) => {
    if (type === 'Platinum') return 'text-cyan-400';
    if (type === 'Gold') return 'text-yellow-400';
    if (type === 'Silver') return 'text-slate-300';
    if (type === 'Bronze') return 'text-orange-700';
    return 'text-slate-500';
  };

  return (
    <div className="relative w-full min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-cyan-400 mb-10 tracking-tight">
           MAJEDGAMES Trophy Hub
        </h1>
        
        {/* Top Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {['Platinum', 'Gold', 'Silver', 'Bronze'].map((type) => (
            <div key={type} className="p-6 bg-slate-900 border border-slate-700 rounded-xl text-center flex flex-col items-center shadow-lg">
              <div className="text-4xl font-bold">{getCount(type)}</div>
              <div className={`text-sm uppercase tracking-widest mt-2 ${getIconColor(type)} font-bold`}>{type}</div>
            </div>
          ))}
        </div>

        {/* Tracker + Explainer Section */}
        <div className="space-y-4">
          <h2 className="font-bold text-white text-2xl mb-6 border-b border-slate-800 pb-4">Trophy Explainer Guide</h2>
          
          {trophies.map((trophy, i) => (
            <div key={i} className="flex items-start gap-5 p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-600 transition-colors shadow-sm">
              
              {/* Built-in Trophy Logo */}
              <div className={`mt-1 ${getIconColor(trophy.type)}`}>
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582c.86.344 1.45.106 1.834-.278A2 2 0 0118 7.5V8a2 2 0 01-2 2h-.096c-.34.82-1.026 1.463-1.854 1.815L11 13.048V16h2a1 1 0 110 2H7a1 1 0 110-2h2v-2.952l-3.05-1.233A2.996 2.996 0 014.096 10H4a2 2 0 01-2-2v-.5c0-1.066.86-1.572 1.834-1.183l3.954-1.582V3a1 1 0 011-1zm-2.454 4.546L10 5.464l2.454 1.082-.544.218a4 4 0 01-3.82 0l-.544-.218z" clipRule="evenodd" />
                </svg>
              </div>
              
              {/* Explainer Details */}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-white">{trophy.name}</h3>
                  <span className={`text-xs font-bold px-3 py-1 rounded bg-slate-950 border border-slate-700 ${getIconColor(trophy.type)}`}>
                    {trophy.type}
                  </span>
                </div>
                <p className="text-slate-400 text-base mt-3 leading-relaxed">
                  {trophy.description || 'Description coming soon...'}
                </p>
              </div>
              
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
