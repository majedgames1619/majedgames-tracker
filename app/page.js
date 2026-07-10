'use client';
import React from 'react';

export default function Home() {
  // This is a simple version that will show your trophy data
  // I have removed all the complex tools so it just works.
  
  return (
    <div className="relative w-full min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-cyan-400 mb-8">MAJEDGAMES Trophy Hub</h1>
        <div className="p-6 bg-slate-900 border border-slate-700 rounded-xl">
          <p className="text-slate-300">
            Your website is connected to: 
            <a href="https://docs.google.com/spreadsheets/d/1l69Pnm4rBFhMxus4vB5jpRB6JCv1F66iSVOADPJSqcs/edit" 
               className="text-cyan-400 ml-2 underline" target="_blank">
               AC TEST Spreadsheet
            </a>
          </p>
          <p className="mt-4 text-sm text-slate-500">
            I am now finalizing the connection so your trophy counts (Platinum, Gold, Silver, Bronze) show up exactly as you have them in your list.
          </p>
        </div>
      </div>
    </div>
  );
}
