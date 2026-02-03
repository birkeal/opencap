
import React, { useState, useMemo } from 'react';
import { Layout } from './components/Layout';
import { Theme, CapTableData, Shareholder, Round, OwnershipStats, Investment } from './types';
import { THEME_COLORS, THEME_PALETTES } from './constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(Theme.DIM);
  const palette = THEME_PALETTES[theme];
  
  const [data, setData] = useState<CapTableData>({
    founders: [
      { id: '1', name: 'Founder A', type: 'founder', color: palette[0], initialPercentage: 50 },
      { id: '2', name: 'Founder B', type: 'founder', color: palette[1], initialPercentage: 50 },
    ],
    rounds: []
  });

  // Derived calculations
  const capTableHistory = useMemo(() => {
    const history: { roundName: string, stats: OwnershipStats[], valuation: number }[] = [];

    // Initial state
    const initialStats: OwnershipStats[] = data.founders.map((f, idx) => ({
      shareholderId: f.id,
      name: f.name,
      percentage: f.initialPercentage,
      value: 0,
      color: palette[idx % palette.length]
    }));
    history.push({ roundName: 'Founding', stats: initialStats, valuation: 0 });

    // Iterate through rounds
    data.rounds.forEach((round) => {
      const totalInvestment = round.investments.reduce((acc, inv) => acc + inv.amount, 0);
      const postMoneyValuation = round.preMoneyValuation + totalInvestment;
      const totalNewPercentage = round.investments.reduce((acc, inv) => acc + inv.percentage, 0);
      const dilutionFactor = (100 - totalNewPercentage) / 100;

      // Dilute existing holders
      const roundStats: OwnershipStats[] = history[history.length - 1].stats.map(s => ({
        ...s,
        percentage: s.percentage * dilutionFactor,
        value: (s.percentage * dilutionFactor / 100) * postMoneyValuation
      }));

      // Add new investors from this round
      round.investments.forEach((inv, idx) => {
        roundStats.push({
          shareholderId: `round-${round.id}-inv-${idx}`,
          name: inv.name,
          percentage: inv.percentage,
          value: (inv.percentage / 100) * postMoneyValuation,
          color: palette[(roundStats.length) % palette.length]
        });
      });

      history.push({ 
        roundName: round.name, 
        stats: roundStats, 
        valuation: postMoneyValuation 
      });
    });

    return history;
  }, [data, palette]);

  const currentStats = capTableHistory[capTableHistory.length - 1].stats;
  const currentValuation = capTableHistory[capTableHistory.length - 1].valuation;

  const toggleTheme = () => setTheme(prev => prev === Theme.LIGHT ? Theme.DIM : Theme.LIGHT);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `opencap-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        setData(json);
      } catch (err) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const addFounder = () => {
    const newFounder: Shareholder = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Founder ${String.fromCharCode(65 + data.founders.length)}`,
      type: 'founder',
      color: palette[data.founders.length % palette.length],
      initialPercentage: 0
    };
    setData(prev => ({ ...prev, founders: [...prev.founders, newFounder] }));
  };

  const updateFounder = (id: string, updates: Partial<Shareholder>) => {
    setData(prev => ({
      ...prev,
      founders: prev.founders.map(f => f.id === id ? { ...f, ...updates } : f)
    }));
  };

  const removeFounder = (id: string) => {
    setData(prev => ({ ...prev, founders: prev.founders.filter(f => f.id !== id) }));
  };

  const addRound = () => {
    const newRound: Round = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Series ${String.fromCharCode(65 + data.rounds.length)}`,
      preMoneyValuation: currentValuation || 10000000,
      investments: [{ investorId: '', name: 'Lead Investor', percentage: 20, amount: 2500000 }],
      date: new Date().toISOString().split('T')[0]
    };
    setData(prev => ({ ...prev, rounds: [...prev.rounds, newRound] }));
  };

  const updateRound = (roundId: string, updates: Partial<Round>) => {
    setData(prev => ({
      ...prev,
      rounds: prev.rounds.map(r => r.id === roundId ? { ...r, ...updates } : r)
    }));
  };

  const removeRound = (roundId: string) => {
    setData(prev => ({ ...prev, rounds: prev.rounds.filter(r => r.id !== roundId) }));
  };

  const addInvestment = (roundId: string) => {
    setData(prev => ({
      ...prev,
      rounds: prev.rounds.map(r => r.id === roundId ? {
        ...r,
        investments: [...r.investments, { investorId: '', name: `Investor ${r.investments.length + 1}`, percentage: 5, amount: 500000 }]
      } : r)
    }));
  };

  const updateInvestment = (roundId: string, invIdx: number, updates: Partial<Investment>) => {
    setData(prev => ({
      ...prev,
      rounds: prev.rounds.map(r => r.id === roundId ? {
        ...r,
        investments: r.investments.map((inv, idx) => idx === invIdx ? { ...inv, ...updates } : inv)
      } : r)
    }));
  };

  const colors = THEME_COLORS[theme];
  const totalFounderPercentage = data.founders.reduce((acc, f) => acc + f.initialPercentage, 0);

  return (
    <Layout theme={theme} toggleTheme={toggleTheme} onExport={handleExport} onImport={handleImport}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Editor & Main Data */}
        <div className="lg:col-span-7 space-y-12">
          
          {/* Founders Section */}
          <section className={`p-8 rounded-3xl border ${colors.border} ${colors.card}`}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Founding Team</h2>
                <p className={`text-sm mt-1 font-medium ${totalFounderPercentage !== 100 ? 'text-red-500' : colors.textSecondary}`}>
                  {totalFounderPercentage !== 100 ? `Needs correction: Total is ${totalFounderPercentage}%` : 'Fully allocated (100%)'}
                </p>
              </div>
              <button 
                onClick={addFounder}
                className={`px-5 py-2.5 rounded-full text-sm font-black transition-all shadow-md active:scale-95 ${colors.buttonPrimary}`}
              >
                + Add Founder
              </button>
            </div>
            <div className="space-y-5">
              {data.founders.map(founder => (
                <div key={founder.id} className="flex flex-wrap items-center gap-4 group">
                  <div className="flex-1 min-w-[200px]">
                    <label className={`block text-[11px] font-black uppercase tracking-widest mb-1.5 ${colors.textSecondary}`}>Name</label>
                    <input 
                      value={founder.name}
                      onChange={e => updateFounder(founder.id, { name: e.target.value })}
                      className={`w-full px-4 py-3 rounded-2xl border transition-all outline-none text-lg font-medium focus:ring-2 focus:ring-[#1D9BF0]/20 ${colors.input}`}
                    />
                  </div>
                  <div className="w-36">
                    <label className={`block text-[11px] font-black uppercase tracking-widest mb-1.5 ${colors.textSecondary}`}>Equity %</label>
                    <div className="relative">
                      <input 
                        type="number"
                        value={founder.initialPercentage}
                        onChange={e => updateFounder(founder.id, { initialPercentage: Number(e.target.value) })}
                        className={`w-full px-4 py-3 rounded-2xl border transition-all pr-10 outline-none text-lg font-bold focus:ring-2 focus:ring-[#1D9BF0]/20 ${colors.input}`}
                      />
                      <span className="absolute right-4 top-3.5 text-gray-400 font-black">%</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFounder(founder.id)}
                    className="mt-6 text-red-500/40 hover:text-red-500 p-2.5 transition-all opacity-0 group-hover:opacity-100"
                    title="Remove Founder"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Rounds Section */}
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight">Funding Rounds</h2>
              <button 
                onClick={addRound}
                className={`px-5 py-2.5 rounded-full text-sm font-black transition-all shadow-md active:scale-95 ${colors.buttonPrimary}`}
              >
                + New Funding Round
              </button>
            </div>
            
            {data.rounds.map((round) => (
              <div key={round.id} className={`p-8 rounded-3xl border ${colors.border} ${colors.card} shadow-lg shadow-black/5`}>
                <div className="flex flex-wrap gap-6 mb-8">
                  <div className="flex-1">
                    <label className={`block text-[11px] font-black uppercase tracking-widest mb-1.5 ${colors.textSecondary}`}>Round Name</label>
                    <input 
                      value={round.name}
                      onChange={e => updateRound(round.id, { name: e.target.value })}
                      className={`w-full px-4 py-3 rounded-2xl border transition-all outline-none font-bold text-lg focus:ring-2 focus:ring-[#1D9BF0]/20 ${colors.input}`}
                    />
                  </div>
                  <div className="w-52">
                    <label className={`block text-[11px] font-black uppercase tracking-widest mb-1.5 ${colors.textSecondary}`}>Pre-Money Val ($)</label>
                    <input 
                      type="number"
                      value={round.preMoneyValuation}
                      onChange={e => updateRound(round.id, { preMoneyValuation: Number(e.target.value) })}
                      className={`w-full px-4 py-3 rounded-2xl border transition-all outline-none font-bold text-lg focus:ring-2 focus:ring-[#1D9BF0]/20 ${colors.input}`}
                    />
                  </div>
                  <div className="w-44">
                    <label className={`block text-[11px] font-black uppercase tracking-widest mb-1.5 ${colors.textSecondary}`}>Date</label>
                    <input 
                      type="date"
                      value={round.date}
                      onChange={e => updateRound(round.id, { date: e.target.value })}
                      className={`w-full px-4 py-3 rounded-2xl border transition-all outline-none font-medium focus:ring-2 focus:ring-[#1D9BF0]/20 ${colors.input}`}
                    />
                  </div>
                </div>

                <div className="space-y-5 mb-8">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-[11px] font-black uppercase tracking-[0.25em] ${colors.textSecondary}`}>New Participation</h3>
                    <button 
                      onClick={() => addInvestment(round.id)}
                      className="text-[#1D9BF0] text-sm font-black hover:underline transition-all"
                    >
                      + Add Participant
                    </button>
                  </div>
                  {round.investments.map((inv, iIdx) => (
                    <div key={iIdx} className="flex gap-4 items-end">
                      <div className="flex-1">
                        <input 
                          placeholder="Investor Name"
                          value={inv.name}
                          onChange={e => updateInvestment(round.id, iIdx, { name: e.target.value })}
                          className={`w-full px-4 py-3 rounded-2xl border transition-all outline-none font-medium focus:ring-2 focus:ring-[#1D9BF0]/20 ${colors.input}`}
                        />
                      </div>
                      <div className="w-40">
                        <input 
                          type="number"
                          placeholder="Amount ($)"
                          value={inv.amount}
                          onChange={e => updateInvestment(round.id, iIdx, { amount: Number(e.target.value) })}
                          className={`w-full px-4 py-3 rounded-2xl border transition-all outline-none font-bold focus:ring-2 focus:ring-[#1D9BF0]/20 ${colors.input}`}
                        />
                      </div>
                      <div className="relative w-36">
                        <input 
                          type="number"
                          placeholder="Equity %"
                          value={inv.percentage}
                          onChange={e => updateInvestment(round.id, iIdx, { percentage: Number(e.target.value) })}
                          className={`w-full px-4 py-3 rounded-2xl border pr-10 transition-all outline-none font-black focus:ring-2 focus:ring-[#1D9BF0]/20 ${colors.input}`}
                        />
                        <span className="absolute right-4 top-3.5 text-gray-400 font-black">%</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-dashed border-[#536471]/30">
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold uppercase tracking-widest ${colors.textSecondary}`}>Post-Money Val</span>
                    <span className="text-xl font-black text-[#1D9BF0] tracking-tight">${(round.preMoneyValuation + round.investments.reduce((a, b) => a + b.amount, 0)).toLocaleString()}</span>
                  </div>
                  <button 
                    onClick={() => removeRound(round.id)}
                    className="text-red-500/60 hover:text-red-500 text-sm font-black transition-all"
                  >
                    Delete Round
                  </button>
                </div>
              </div>
            ))}
          </section>

          {/* Full Cap Table Section */}
          <section className={`p-8 rounded-3xl border ${colors.border} ${colors.card} shadow-xl shadow-black/5`}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black tracking-tight">Detailed Cap Table</h2>
              <div className="text-right">
                 <p className={`text-[11px] font-black uppercase tracking-widest mb-1 ${colors.textSecondary}`}>Fully Diluted Valuation</p>
                 <p className="text-2xl font-black text-[#1D9BF0] tracking-tight">${currentValuation.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b-2 ${colors.border}`}>
                    <th className={`pb-4 text-[11px] font-black uppercase tracking-[0.2em] ${colors.textSecondary}`}>Shareholder</th>
                    <th className={`pb-4 text-[11px] font-black uppercase tracking-[0.2em] text-right ${colors.textSecondary}`}>Ownership %</th>
                    <th className={`pb-4 text-[11px] font-black uppercase tracking-[0.2em] text-right ${colors.textSecondary}`}>Value (FDV)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#536471]/10">
                  {currentStats.map((stat) => (
                    <tr key={stat.shareholderId} className={`group hover:bg-[#1D9BF0]/5 transition-colors`}>
                      <td className="py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-3 h-3 rounded-full shadow-md" style={{ backgroundColor: stat.color }}></div>
                          <span className="font-bold text-base">{stat.name}</span>
                        </div>
                      </td>
                      <td className="py-5 text-right">
                        <span className="font-black text-base tabular-nums">{stat.percentage.toFixed(2)}%</span>
                      </td>
                      <td className="py-5 text-right">
                        <span className="font-bold text-base tabular-nums">${Math.round(stat.value).toLocaleString()}</span>
                      </td>
                    </tr>
                  ))}
                  {currentStats.length === 0 && (
                    <tr>
                      <td colSpan={3} className={`py-12 text-center text-sm font-medium ${colors.textSecondary}`}>No shareholders added yet.</td>
                    </tr>
                  )}
                </tbody>
                <tfoot className={`border-t-4 ${colors.border}`}>
                  <tr>
                    <td className="pt-6 font-black text-base uppercase tracking-widest">Total Equity</td>
                    <td className="pt-6 text-right font-black text-base tabular-nums">100.00%</td>
                    <td className="pt-6 text-right font-black text-xl text-[#1D9BF0] tabular-nums">${Math.round(currentValuation).toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        </div>

        {/* Right Column: Visualization Summary */}
        <div className="lg:col-span-5 space-y-12 lg:sticky lg:top-32 h-fit">
          
          {/* Current Stats Summary Card */}
          <div className={`p-10 rounded-[3rem] border ${colors.border} ${colors.card} shadow-2xl shadow-black/10`}>
            <h2 className="text-2xl font-black tracking-tight mb-10 text-center">Equity Split</h2>
            
            <div className="h-80 mb-10">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={currentStats}
                    dataKey="percentage"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={90}
                    outerRadius={120}
                    paddingAngle={5}
                    stroke="none"
                  >
                    {currentStats.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        className="transition-all duration-500 hover:opacity-80 cursor-pointer outline-none"
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme === Theme.DIM ? '#1E2732' : '#FFFFFF', 
                      border: 'none', 
                      borderRadius: '24px',
                      boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.4)',
                      color: theme === Theme.DIM ? '#F7F9F9' : '#0F1419'
                    }}
                    itemStyle={{ color: 'inherit', fontWeight: 900, fontSize: '14px' }}
                    formatter={(val: number) => [`${val.toFixed(2)}%`, 'Ownership']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-5">
              {currentStats.slice(0, 5).map(stat => (
                <div key={stat.shareholderId} className="flex items-center justify-between text-sm group">
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 rounded shadow-lg" style={{ backgroundColor: stat.color }}></div>
                    <span className="font-bold text-base">{stat.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-base tabular-nums">{stat.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
              {currentStats.length > 5 && (
                <div className={`text-center pt-3 text-[11px] font-black uppercase tracking-[0.3em] ${colors.textSecondary}`}>
                  + {currentStats.length - 5} others
                </div>
              )}
            </div>

            <div className={`mt-10 pt-10 border-t ${colors.border} space-y-6`}>
              <div className="flex justify-between items-end">
                <div className="flex-1">
                  <p className={`text-[11px] font-black uppercase tracking-widest mb-1.5 ${colors.textSecondary}`}>Latest Implied Valuation</p>
                  <p className="text-3xl font-black text-[#1D9BF0] tracking-tighter leading-none">${currentValuation.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className={`text-[11px] font-black uppercase tracking-widest mb-1.5 ${colors.textSecondary}`}>Active Stage</p>
                  <p className="font-black text-base text-white bg-[#1D9BF0] px-4 py-1 rounded-full shadow-lg shadow-[#1D9BF0]/20">
                    {data.rounds.length > 0 ? data.rounds[data.rounds.length - 1].name : 'Founding'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={`p-8 rounded-3xl border border-dashed ${colors.border} bg-transparent flex items-center gap-4`}>
             <div className="w-10 h-10 rounded-full bg-[#1D9BF0]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[#1D9BF0]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
             </div>
             <p className="text-xs font-semibold leading-relaxed">
                Equity is auto-diluted based on the <span className="text-[#1D9BF0]">target post-money percentage</span> of incoming capital.
             </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default App;
