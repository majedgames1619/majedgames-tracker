'use client';
import { useState, useEffect } from 'react';
import Papa from 'papaparse';

export default function Home() {
  const [stats, setStats] = useState({ Platinum: 0, Gold: 0, Silver: 0, Bronze: 0 });

  useEffect(() => {
    // This is the direct link to your spreadsheet data in CSV format
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSH5lbwrDIqmc4DImgbz-KX5NzLiaKUHTeOyceh1HfhweR3xnEzH-38VwegvLs5Wmc9rGLIcF9BjP35/pub?output=csv';

    fetch(csvUrl)
      .then(res => res.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            const counts = { Platinum: 0, Gold: 0, Silver: 0, Bronze: 0 };
            results.data.forEach(row => {
              if (counts.hasOwnProperty(row.Type)) {
                counts[row.Type]++;
              }
            });
            setStats(counts);
          }
        });
      });
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-cyan-400 mb-8">MAJEDGAMES Trophy Hub</h1>
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(stats).map(([label, count]) => (
            <div key={label} className="p-4 bg-slate-900 border border-slate-700 rounded-xl text-center">
              <div className="text-3xl font-bold">{count}</div>
              <div className="text-xs uppercase tracking-widest text-slate-400">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
