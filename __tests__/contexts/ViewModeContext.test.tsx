import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { ViewModeProvider, useViewMode } from '@/contexts/ViewModeContext';

describe('ViewModeContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('ViewModeProvider', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should default to clarity mode', async () => {
      const { result } = renderHook(() => useViewMode(), {
        wrapper: ViewModeProvider,
      });

      await waitFor(() => {
        expect(result.current.viewMode).toBe('clarity');
      });
    });

    it('should load saved mode from localStorage', async () => {
      localStorage.setItem('viewMode', 'clinical');

      let hookResult: ReturnType<typeof useViewMode> | null = null;
      
      const TestComponent = () => {
        hookResult = useViewMode();
        return <div>Test</div>;
      };

      render(
        <ViewModeProvider>
          <TestComponent />
        </ViewModeProvider>
      );

      await waitFor(() => {
        expect(hookResult).not.toBeNull();
        expect(hookResult?.viewMode).toBe('clinical');
      }, { timeout: 3000 });
    });

    it('should save mode to localStorage when changed', async () => {
      const { result } = renderHook(() => useViewMode(), {
        wrapper: ViewModeProvider,
      });

      await waitFor(() => {
        expect(result.current.viewMode).toBe('clarity');
      });

      act(() => {
        result.current.setViewMode('clinical');
      });

      expect(localStorage.getItem('viewMode')).toBe('clinical');
      expect(result.current.viewMode).toBe('clinical');
    });

    it('should toggle between modes', async () => {
      const { result } = renderHook(() => useViewMode(), {
        wrapper: ViewModeProvider,
      });

      await waitFor(() => {
        expect(result.current.viewMode).toBe('clarity');
      });

      act(() => {
        result.current.toggleViewMode();
      });

      expect(result.current.viewMode).toBe('clinical');

      act(() => {
        result.current.toggleViewMode();
      });

      expect(result.current.viewMode).toBe('clarity');
    });
  });

  describe('useViewMode hook', () => {
    it('should throw error when used outside provider', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useViewMode());
      }).toThrow('useViewMode must be used within a ViewModeProvider');

      consoleError.mockRestore();
    });
  });
});
