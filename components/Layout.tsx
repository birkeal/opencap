
import React from 'react';
import { Theme } from '../types';
import { THEME_COLORS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  theme: Theme;
  toggleTheme: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, theme, toggleTheme, onImport, onExport }) => {
  const colors = THEME_COLORS[theme];

  return (
    <div className={`min-h-screen ${colors.bg} ${colors.text} transition-colors duration-200`}>
      <nav className={`sticky top-0 z-10 ${colors.bg} px-4 py-4 mb-4`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#1D9BF0] rounded-full flex items-center justify-center shadow-lg shadow-[#1D9BF0]/30">
              <span className="text-white font-bold text-lg">O</span>
            </div>
            <h1 className="text-2xl font-black tracking-tighter">OpenCap Pro 2</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={onExport}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${colors.buttonSecondary}`}
            >
              Export
            </button>
            <label className={`px-4 py-2 rounded-full text-sm font-bold cursor-pointer transition-all ${colors.buttonSecondary}`}>
              Import
              <input type="file" className="hidden" accept=".json" onChange={onImport} />
            </label>
            <button 
              onClick={toggleTheme}
              className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${colors.border} ${colors.hover}`}
              aria-label="Toggle theme"
            >
              {theme === Theme.LIGHT ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 9h-1m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              )}
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
};
