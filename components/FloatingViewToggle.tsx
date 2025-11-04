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
        {viewMode === 'clarity' ? (
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        )}
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
