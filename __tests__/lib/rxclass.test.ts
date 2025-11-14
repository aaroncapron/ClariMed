/**
 * Tests for RxClass API integration
 * Tests drug classification retrieval from NIH RxClass API
 */

import { getClassByRxcui, getTherapeuticUses, formatDrugClass, DrugClassInfo } from '@/lib/rxclass';

// Mock fetch globally
global.fetch = jest.fn();

describe('RxClass API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getClassByRxcui', () => {
    it('should return EPC, MoA, and PE for valid rxcui', async () => {
      const mockResponse = {
        rxclassMinConceptList: {
          rxclassMinConcept: [
            {
              classId: 'N0000175554',
              className: 'Beta-adrenergic Blocker',
              classType: 'EPC'
            },
            {
              classId: 'N0000000171',
              className: 'Adrenergic beta-Antagonists',
              classType: 'MOA'
            },
            {
              classId: 'N0000009902',
              className: 'Decreased Blood Pressure',
              classType: 'PE'
            }
          ]
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await getClassByRxcui('6918'); // Metoprolol
      
      expect(result).not.toBeNull();
      expect(result?.epc).toBe('Beta-adrenergic Blocker');
      expect(result?.moa).toBe('Adrenergic beta-Antagonists');
      expect(result?.pe).toBe('Decreased Blood Pressure');
    });

    it('should return null for empty rxcui', async () => {
      const result = await getClassByRxcui('');
      expect(result).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should return null when API returns no classes', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ rxclassMinConceptList: { rxclassMinConcept: [] } })
      });

      const result = await getClassByRxcui('99999');
      expect(result).toBeNull();
    });

    it('should try FDASPL source if DailyMed has no EPC', async () => {
      // First call (DailyMed) - no EPC
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          rxclassMinConceptList: {
            rxclassMinConcept: [
              {
                classId: 'N0000000171',
                className: 'Some Mechanism',
                classType: 'MOA'
              }
            ]
          }
        })
      });

      // Second call (FDASPL) - has EPC
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          rxclassMinConceptList: {
            rxclassMinConcept: [
              {
                classId: 'N0000175554',
                className: 'Beta-adrenergic Blocker',
                classType: 'EPC'
              }
            ]
          }
        })
      });

      const result = await getClassByRxcui('6918');
      
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(result?.epc).toBe('Beta-adrenergic Blocker');
      expect(result?.moa).toBe('Some Mechanism');
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const result = await getClassByRxcui('6918');
      
      expect(result).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('RxClass API error for rxcui 6918')
      );
      
      consoleWarnSpy.mockRestore();
    });

    it('should handle network errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const result = await getClassByRxcui('6918');
      
      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'RxClass API error:',
        expect.any(Error)
      );
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getTherapeuticUses', () => {
    it('should return therapeutic uses for valid rxcui', async () => {
      const mockResponse = {
        rxclassMinConceptList: {
          rxclassMinConcept: [
            {
              classId: 'D006973',
              className: 'Hypertension',
              classType: 'DISEASE'
            },
            {
              classId: 'D000787',
              className: 'Angina Pectoris',
              classType: 'DISEASE'
            },
            {
              classId: 'D006333',
              className: 'Heart Failure',
              classType: 'DISEASE'
            },
            {
              classId: 'D009203',
              className: 'Myocardial Infarction',
              classType: 'DISEASE'
            }
          ]
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await getTherapeuticUses('6918'); // Metoprolol
      
      expect(result).toHaveLength(3); // Limited to top 3
      expect(result).toContain('Hypertension');
      expect(result).toContain('Angina Pectoris');
      expect(result).toContain('Heart Failure');
      expect(result).not.toContain('Myocardial Infarction'); // 4th should be excluded
    });

    it('should return empty array for empty rxcui', async () => {
      const result = await getTherapeuticUses('');
      expect(result).toEqual([]);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should return empty array when API returns no uses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ rxclassMinConceptList: { rxclassMinConcept: [] } })
      });

      const result = await getTherapeuticUses('99999');
      expect(result).toEqual([]);
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      const result = await getTherapeuticUses('6918');
      expect(result).toEqual([]);
    });
  });

  describe('formatDrugClass', () => {
    it('should prioritize EPC when available', () => {
      const classInfo: DrugClassInfo = {
        epc: 'Beta-adrenergic Blocker',
        moa: 'Adrenergic beta-Antagonists',
        pe: 'Decreased Blood Pressure'
      };

      const result = formatDrugClass(classInfo);
      expect(result).toBe('Beta-adrenergic Blocker');
    });

    it('should combine MoA and PE when no EPC', () => {
      const classInfo: DrugClassInfo = {
        moa: 'Adrenergic beta-Antagonists',
        pe: 'Decreased Blood Pressure'
      };

      const result = formatDrugClass(classInfo);
      expect(result).toBe('Adrenergic beta-Antagonists - Decreased Blood Pressure');
    });

    it('should return MoA alone if no PE or EPC', () => {
      const classInfo: DrugClassInfo = {
        moa: 'Adrenergic beta-Antagonists'
      };

      const result = formatDrugClass(classInfo);
      expect(result).toBe('Adrenergic beta-Antagonists');
    });

    it('should return PE alone if no MoA or EPC', () => {
      const classInfo: DrugClassInfo = {
        pe: 'Decreased Blood Pressure'
      };

      const result = formatDrugClass(classInfo);
      expect(result).toBe('Decreased Blood Pressure');
    });

    it('should return empty string if no class data', () => {
      const classInfo: DrugClassInfo = {};

      const result = formatDrugClass(classInfo);
      expect(result).toBe('');
    });
  });

  describe('Real-world drug examples', () => {
    it('should handle Lisinopril (ACE Inhibitor)', async () => {
      const mockResponse = {
        rxclassMinConceptList: {
          rxclassMinConcept: [
            {
              classId: 'N0000175558',
              className: 'Angiotensin Converting Enzyme Inhibitor',
              classType: 'EPC'
            }
          ]
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await getClassByRxcui('29046'); // Lisinopril
      expect(result?.epc).toBe('Angiotensin Converting Enzyme Inhibitor');
    });

    it('should handle Latanoprost (Prostaglandin Analog)', async () => {
      const mockResponse = {
        rxclassMinConceptList: {
          rxclassMinConcept: [
            {
              classId: 'N0000175722',
              className: 'Prostaglandin Analog',
              classType: 'EPC'
            }
          ]
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await getClassByRxcui('114831'); // Latanoprost
      
      expect(result?.epc).toBe('Prostaglandin Analog');
      // Should NOT be classified as Beta Blocker (the bug we're fixing)
      expect(result?.epc).not.toContain('Beta');
    });
  });
});
