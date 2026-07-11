'use client';
import { useEffect, useMemo, useState } from 'react';

const TROPHY_TYPES = ['Platinum', 'Gold', 'Silver', 'Bronze'];
const FILTER_TYPES = ['All', ...TROPHY_TYPES];

const GUIDE_METADATA = [
  { label: 'Platinum Difficulty', value: 'TBD' },
  { label: 'Estimated Time', value: 'TBD' },
  { label: 'Online Trophies', value: 'TBD' },
  { label: 'Missable Trophies', value: 'TBD' },
];

export default function Home() {
  const [trophies, setTrophies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState('All');

  useEffect(() => {
    // Still using your direct, live Google Sheet link
    const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSH5lbwrDIqmc4DImgbz-KX5NzLiaKUHTeOyceh1HfhweR3xnEzH-38VwegvLs5Wmc9rGLIcF9BjP35/pub?output=csv';

    fetch(url)
      .then(res => {
        if (!res.ok) {
          throw new Error('Unable to load the live trophy sheet.');
        }
        return res.text();
      })
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
        setError('');
      })
      .catch(() => {
        setError('The live Google Sheets trophy data could not be loaded. Please refresh or try again later.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const filteredTrophies = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return trophies.filter(trophy => {
      const matchesType = activeType === 'All' || trophy.type === activeType;
      const searchableText = `${trophy.name || ''} ${trophy.description || ''}`.toLowerCase();
      const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);

      return matchesType && matchesSearch;
    });
  }, [activeType, searchQuery, trophies]);

  const getCount = (type) => trophies.filter(t => t.type === type).length;

  // This sets the right color for the logo based on the trophy type
  const getIconColor = (type) => {
    if (type === 'Platinum') return 'text-cyan-300';
    if (type === 'Gold') return 'text-yellow-300';
    if (type === 'Silver') return 'text-slate-200';
    if (type === 'Bronze') return 'text-orange-500';
    return 'text-slate-500';
  };

  const getCardAccent = (type) => {
    if (type === 'Platinum') return 'from-cyan-400/20 via-slate-900 to-slate-950 border-cyan-300/40 shadow-cyan-950/40';
    if (type === 'Gold') return 'from-yellow-400/20 via-slate-900 to-slate-950 border-yellow-300/40 shadow-yellow-950/30';
    if (type === 'Silver') return 'from-slate-200/20 via-slate-900 to-slate-950 border-slate-200/30 shadow-slate-950/40';
    if (type === 'Bronze') return 'from-orange-600/20 via-slate-900 to-slate-950 border-orange-500/40 shadow-orange-950/30';
    return 'from-slate-800 via-slate-900 to-slate-950 border-slate-700 shadow-slate-950/40';
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.22),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(249,115,22,0.16),transparent_28%),linear-gradient(135deg,rgba(15,23,42,0.9),rgba(2,6,23,1))]" />
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-cyan-500/10 to-transparent" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-8 sm:px-8 lg:px-10">
        <section className="overflow-hidden rounded-[2rem] border border-cyan-200/10 bg-slate-950/80 shadow-2xl shadow-cyan-950/30 backdrop-blur">
          <div className="relative p-6 sm:p-10 lg:p-12">
            <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(8,47,73,0.88),rgba(15,23,42,0.72)_45%,rgba(124,45,18,0.45)),radial-gradient(circle_at_72%_28%,rgba(251,191,36,0.28),transparent_22%)]" />
            <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="absolute left-0 top-0 h-full w-full opacity-20 [background-image:linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:44px_44px]" />

            <div className="relative grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
              <div>
                <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-cyan-200">
                  <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-lg shadow-cyan-300/60" />
                  MajedGames Guide
                </div>
                <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-orange-200/80">Trophy Tracker MVP</p>
                <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
                  Assassin&apos;s Creed Black Flag Resynced
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                  A live trophy guide shell powered by the current MajedGames Google Sheet, polished for a game-specific walkthrough experience.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  {['PS5', 'Xbox', 'PC'].map(platform => (
                    <span key={platform} className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-slate-100 shadow-lg shadow-slate-950/30">
                      {platform}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {GUIDE_METADATA.map(item => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-950/55 p-4 shadow-xl shadow-slate-950/30 backdrop-blur">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">{item.label}</p>
                    <p className="mt-2 text-2xl font-black text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {TROPHY_TYPES.map((type) => (
            <div key={type} className={`group rounded-3xl border bg-gradient-to-br p-5 shadow-2xl transition duration-300 hover:-translate-y-1 ${getCardAccent(type)}`}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className={`text-xs font-black uppercase tracking-[0.24em] ${getIconColor(type)}`}>{type}</p>
                  <p className="mt-3 text-4xl font-black text-white sm:text-5xl">{getCount(type)}</p>
                </div>
                <TrophyIcon className={`h-12 w-12 opacity-90 transition group-hover:scale-110 ${getIconColor(type)}`} />
              </div>
              <div className="mt-5 h-1 rounded-full bg-white/10">
                <div className={`h-1 rounded-full ${type === 'Platinum' ? 'bg-cyan-300' : type === 'Gold' ? 'bg-yellow-300' : type === 'Silver' ? 'bg-slate-200' : 'bg-orange-500'}`} />
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-[2rem] border border-slate-800 bg-slate-950/80 p-5 shadow-2xl shadow-slate-950/50 sm:p-8">
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">Live Trophy List</p>
              <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">Trophy Explainer Guide</h2>
              <p className="mt-3 text-slate-400">Search and filter the current Google Sheets trophy data instantly.</p>
            </div>

            <div className="flex w-full flex-col gap-3 lg:w-[32rem]">
              <label className="sr-only" htmlFor="trophy-search">Search trophies</label>
              <input
                id="trophy-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search trophy name or description..."
                className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 px-5 py-4 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/10"
              />
              <div className="flex flex-wrap gap-2">
                {FILTER_TYPES.map(type => {
                  const isActive = activeType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setActiveType(type)}
                      className={`rounded-full border px-4 py-2 text-sm font-bold transition ${isActive ? 'border-cyan-300 bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-950/40' : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500 hover:text-white'}`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {isLoading && (
            <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-8 text-center text-cyan-100">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-cyan-300/20 border-t-cyan-300" />
              Loading live trophy data from Google Sheets...
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-3xl border border-red-400/30 bg-red-950/40 p-8 text-center text-red-100">
              <p className="text-xl font-black">Could not load trophies</p>
              <p className="mt-2 text-red-200/80">{error}</p>
            </div>
          )}

          {!isLoading && !error && filteredTrophies.length === 0 && (
            <div className="rounded-3xl border border-slate-700 bg-slate-900/70 p-8 text-center text-slate-300">
              <p className="text-xl font-black text-white">No trophies found</p>
              <p className="mt-2">Try clearing the search box or switching back to the All filter.</p>
            </div>
          )}

          {!isLoading && !error && filteredTrophies.length > 0 && (
            <div className="grid gap-4">
              {filteredTrophies.map((trophy, i) => (
                <article key={trophy.id || `${trophy.name}-${i}`} className="group overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl shadow-slate-950/30 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-slate-900">
                  <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:p-6">
                    <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-slate-950 shadow-inner ${getIconColor(trophy.type)}`}>
                      <TrophyIcon className="h-9 w-9" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">Trophy #{trophy.id || i + 1}</p>
                          <h3 className="mt-2 text-2xl font-black leading-tight text-white">{trophy.name}</h3>
                        </div>
                        <span className={`w-fit rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] ${getIconColor(trophy.type)}`}>
                          {trophy.type || 'Unknown'}
                        </span>
                      </div>
                      <p className="mt-4 text-base leading-8 text-slate-300">
                        {trophy.description || 'Description coming soon...'}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function TrophyIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582c.86.344 1.45.106 1.834-.278A2 2 0 0118 7.5V8a2 2 0 01-2 2h-.096c-.34.82-1.026 1.463-1.854 1.815L11 13.048V16h2a1 1 0 110 2H7a1 1 0 110-2h2v-2.952l-3.05-1.233A2.996 2.996 0 014.096 10H4a2 2 0 01-2-2v-.5c0-1.066.86-1.572 1.834-1.183l3.954-1.582V3a1 1 0 011-1zm-2.454 4.546L10 5.464l2.454 1.082-.544.218a4 4 0 01-3.82 0l-.544-.218z" clipRule="evenodd" />
    </svg>
  );
}
