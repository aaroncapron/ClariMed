/**
 * Tests for DailyMed API integration
 * Tests drug indication and class retrieval from FDA DailyMed service
 */

import { getCommonUseFromDailyMed, getDrugClassFromDailyMed } from '@/lib/dailymed';

// Mock fetch globally
global.fetch = jest.fn();

describe('DailyMed API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCommonUseFromDailyMed', () => {
    it('should return indications using RxCUI', async () => {
      // Mock SPL search by RxCUI
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{ setid: 'test-setid-123' }]
        })
      });

      // Mock SPL document fetch
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{
            indications_and_usage: [
              'Metformin is indicated as an adjunct to diet and exercise to improve glycemic control in adults with type 2 diabetes mellitus.'
            ]
          }]
        })
      });

      const result = await getCommonUseFromDailyMed('6809', 'Metformin');
      
      expect(result).toContain('type 2 diabetes');
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should fall back to name search if RxCUI fails', async () => {
      // Mock RxCUI search - returns empty
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] })
      });

      // Mock name search
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{ setid: 'name-setid-456' }]
        })
      });

      // Mock SPL document fetch
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{
            indications_and_usage: ['Lisinopril is indicated for the treatment of hypertension.']
          }]
        })
      });

      const result = await getCommonUseFromDailyMed('29046', 'Lisinopril 10 MG');
      
      expect(result).toContain('hypertension');
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should return null if no indications found', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] })
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] })
      });

      const result = await getCommonUseFromDailyMed('99999', 'UnknownDrug');
      expect(result).toBeNull();
    });

    it('should handle API errors gracefully', async () => {
      // Only need 1 mock - no drugName means no fallback attempt
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const result = await getCommonUseFromDailyMed('6809');
      
      expect(result).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalled();
      
      consoleWarnSpy.mockRestore();
    });

    it('should clean HTML tags from indications', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{ setid: 'test-setid' }]
        })
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{
            indications_and_usage: [
              '<p>Aspirin is indicated for <strong>pain relief</strong> and fever reduction.</p>'
            ]
          }]
        })
      });

      const result = await getCommonUseFromDailyMed('1191');
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result).not.toContain('<p>');
        expect(result).not.toContain('<strong>');
        expect(result).toContain('pain relief');
      }
    });

    it('should truncate long indications', async () => {
      const longText = 'A'.repeat(200) + ' More text here that should be truncated because it is way too long for display purposes and needs to be shortened.';
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{ setid: 'test-setid' }]
        })
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{
            indications_and_usage: [longText]
          }]
        })
      });

      const result = await getCommonUseFromDailyMed('1234');
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.length).toBeLessThanOrEqual(153); // 150 + "..."
        expect(result).toContain('...');
      }
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const result = await getCommonUseFromDailyMed('6809', 'Test Drug');
      
      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getDrugClassFromDailyMed', () => {
    it('should return EPC drug class using RxCUI', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{ setid: 'test-setid-123' }]
        })
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{
            pharm_class_epc: ['Beta-adrenergic Blocker']
          }]
        })
      });

      const result = await getDrugClassFromDailyMed('6918', 'Metoprolol');
      
      expect(result).toBe('Beta-adrenergic Blocker');
    });

    it('should fall back to MOA if no EPC', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{ setid: 'test-setid' }]
        })
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{
            pharm_class_moa: ['Adrenergic beta-Antagonists']
          }]
        })
      });

      const result = await getDrugClassFromDailyMed('6918');
      
      expect(result).toBe('Adrenergic beta-Antagonists');
    });

    it('should return null if no drug class found', async () => {
      // Only need 1 mock - no drugName means no fallback attempt
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] })
      });

      const result = await getDrugClassFromDailyMed('99999');
      expect(result).toBeNull();
    });

    it('should handle arrays in pharm_class fields', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{ setid: 'test-setid' }]
        })
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{
            pharm_class_epc: ['First Class', 'Second Class']
          }]
        })
      });

      const result = await getDrugClassFromDailyMed('1234', 'Test Drug');
      
      expect(result).toBe('First Class'); // Returns first one
    });
  });

  describe('Real-world drug examples', () => {
    it('should handle Lisinopril (ACE Inhibitor)', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{ setid: 'lisinopril-setid' }]
        })
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{
            indications_and_usage: [
              'Lisinopril is indicated for treatment of hypertension and heart failure.'
            ]
          }]
        })
      });

      const result = await getCommonUseFromDailyMed('29046', 'Lisinopril');
      
      expect(result).toContain('hypertension');
    });

    it('should handle combination drugs', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{ setid: 'combo-setid' }]
        })
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{
            indications_and_usage: [
              'This combination is indicated for pain relief.'
            ]
          }]
        })
      });

      const result = await getCommonUseFromDailyMed(
        '857005',
        'Acetaminophen 300 MG / Hydrocodone 10 MG'
      );
      
      expect(result).toContain('pain');
    });
  });
});
