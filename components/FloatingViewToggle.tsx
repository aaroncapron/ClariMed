'use client';

import { useViewMode } from '@/contexts/ViewModeContext';

export default function FloatingViewToggle() {
  const { viewMode, toggleViewMode } = useViewMode();

  return (
    <button
      onClick={toggleViewMode}
      className="fixed bottom-8 right-8 z-50 group"
      aria-label={`Switch to ${viewMode === 'clarity' ? 'clinical' : 'clarity'} mode`}
      title={`Switch to ${viewMode === 'clarity' ? 'Clinical' : 'Clarity'} mode`}
    >
      <div
        className="flex items-center gap-3 px-6 py-4 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 hover:shadow-xl"
        style={{
          backgroundColor: viewMode === 'clarity' ? '#14B8A6' : '#1E40AF'
        }}
      >
        <span className="text-2xl" role="img" aria-label={viewMode === 'clarity' ? 'Clarity mode' : 'Clinical mode'}>
          {viewMode === 'clarity' ? '📄' : '📚'}
        </span>
        <span className="text-white font-semibold text-sm">
          {viewMode === 'clarity' ? 'Clarity' : 'Clinical'}
        </span>
      </div>
      
      {/* Tooltip on hover */}
      <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap">
          Switch to {viewMode === 'clarity' ? 'Clinical' : 'Clarity'} mode
        </div>
      </div>
    </button>
  );
}
