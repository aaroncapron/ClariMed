import { mapSeverity, getSeverityBadge } from '@/lib/interactions';
import type { InteractionSeverity } from '@/lib/interactions';

describe('Drug Interaction Detection', () => {
  describe('Severity Mapping', () => {
    it('should map contraindicated to critical', () => {
      expect(mapSeverity('contraindicated')).toBe('critical');
      expect(mapSeverity('Contraindicated - Do not use')).toBe('critical');
    });

    it('should map major severity', () => {
      expect(mapSeverity('major')).toBe('major');
      expect(mapSeverity('Major - Monitor closely')).toBe('major');
      expect(mapSeverity('high')).toBe('major');
    });

    it('should map moderate severity', () => {
      expect(mapSeverity('moderate')).toBe('moderate');
      expect(mapSeverity('Moderate - Use with caution')).toBe('moderate');
    });

    it('should map minor severity', () => {
      expect(mapSeverity('minor')).toBe('minor');
      expect(mapSeverity('low')).toBe('minor');
    });

    it('should handle unknown severity', () => {
      expect(mapSeverity('unknown')).toBe('unknown');
      expect(mapSeverity('')).toBe('unknown');
      expect(mapSeverity('something else')).toBe('unknown');
    });

    it('should be case-insensitive', () => {
      expect(mapSeverity('MAJOR')).toBe('major');
      expect(mapSeverity('Minor')).toBe('minor');
    });
  });

  describe('Severity Badge Configuration', () => {
    it('should return correct badge for critical severity', () => {
      const badge = getSeverityBadge('critical');
      expect(badge.label).toBe('Critical');
      expect(badge.color).toContain('red');
    });

    it('should return correct badge for major severity', () => {
      const badge = getSeverityBadge('major');
      expect(badge.label).toBe('Major');
      expect(badge.color).toContain('orange');
    });

    it('should return correct badge for moderate severity', () => {
      const badge = getSeverityBadge('moderate');
      expect(badge.label).toBe('Moderate');
      expect(badge.color).toContain('yellow');
    });

    it('should return correct badge for minor severity', () => {
      const badge = getSeverityBadge('minor');
      expect(badge.label).toBe('Minor');
      expect(badge.color).toContain('blue');
    });

    it('should return correct badge for unknown severity', () => {
      const badge = getSeverityBadge('unknown');
      expect(badge.label).toBe('Unknown');
      expect(badge.color).toContain('gray');
    });
  });

  describe('API Integration', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockClear();
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      
      const { checkDrugInteraction } = await import('@/lib/interactions');
      const results = await checkDrugInteraction('123', '456');
      
      expect(results).toEqual([]);
    });

    it('should return empty array for empty RxCUI', async () => {
      const { checkDrugInteraction } = await import('@/lib/interactions');
      
      expect(await checkDrugInteraction('', '456')).toEqual([]);
      expect(await checkDrugInteraction('123', '')).toEqual([]);
      expect(await checkDrugInteraction('', '')).toEqual([]);
    });

    it('should return empty array when no interactions found', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          nlmDisclaimer: 'test',
          userInput: { sources: [], rxcuis: [] },
        }),
      });

      const { checkDrugInteraction } = await import('@/lib/interactions');
      const results = await checkDrugInteraction('123', '456');
      
      expect(results).toEqual([]);
    });
  });

  describe('Medication Interaction Checking', () => {
    it('should return empty array when new medication has no RxCUI', async () => {
      const { checkMedicationInteractions } = await import('@/lib/interactions');
      
      const result = await checkMedicationInteractions(
        { name: 'Aspirin' },
        [{ id: '1', name: 'Warfarin', dosage: '5mg', frequency: 'daily', rxcui: '11289', isMaintenance: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]
      );
      
      expect(result).toEqual([]);
    });

    it('should return empty array when no existing medications', async () => {
      const { checkMedicationInteractions } = await import('@/lib/interactions');
      
      const result = await checkMedicationInteractions(
        { name: 'Aspirin', rxcui: '1191' },
        []
      );
      
      expect(result).toEqual([]);
    });

    it('should skip existing medications without RxCUI', async () => {
      const { checkMedicationInteractions } = await import('@/lib/interactions');
      
      const result = await checkMedicationInteractions(
        { name: 'Aspirin', rxcui: '1191' },
        [{ id: '1', name: 'Generic Med', dosage: '5mg', frequency: 'daily', isMaintenance: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]
      );
      
      expect(result).toEqual([]);
    });
  });

  describe('Check All Interactions', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockClear();
    });
    
    it('should return empty array for less than 2 medications', async () => {
      const { checkAllInteractions } = await import('@/lib/interactions');
      
      expect(await checkAllInteractions([])).toEqual([]);
      expect(await checkAllInteractions([
        { id: '1', name: 'Med1', dosage: '5mg', frequency: 'daily', rxcui: '123', isMaintenance: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ])).toEqual([]);
    });

    it('should check all unique pairs without duplicates', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          nlmDisclaimer: 'test',
          userInput: { sources: [], rxcuis: [] },
        }),
      });

      const { checkAllInteractions } = await import('@/lib/interactions');
      
      await checkAllInteractions([
        { id: '1', name: 'Med1', dosage: '5mg', frequency: 'daily', rxcui: '123', isMaintenance: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: '2', name: 'Med2', dosage: '10mg', frequency: 'twice daily', rxcui: '456', isMaintenance: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: '3', name: 'Med3', dosage: '20mg', frequency: 'daily', rxcui: '789', isMaintenance: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ]);

      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });
});
