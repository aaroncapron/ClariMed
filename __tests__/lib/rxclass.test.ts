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
      // Mock getIngredientRxcui call (first fetch)
      const mockIngredientResponse = {
        relatedGroup: {
          conceptGroup: [
            {
              tty: 'IN',
              conceptProperties: [
                {
                  rxcui: '6918',
                  name: 'metoprolol',
                  tty: 'IN'
                }
              ]
            }
          ]
        }
      };

      // Mock RxClass DAILYMED call (second fetch) - CORRECT FORMAT
      const mockRxClassResponse = {
        rxclassDrugInfoList: {
          rxclassDrugInfo: [
            {
              minConcept: {
                rxcui: '6918',
                name: 'metoprolol',
                tty: 'IN'
              },
              rxclassMinConceptItem: {
                classId: 'N0000175554',
                className: 'Beta-adrenergic Blocker',
                classType: 'EPC'
              }
            },
            {
              minConcept: {
                rxcui: '6918',
                name: 'metoprolol',
                tty: 'IN'
              },
              rxclassMinConceptItem: {
                classId: 'N0000000171',
                className: 'Adrenergic beta-Antagonists',
                classType: 'MOA'
              }
            },
            {
              minConcept: {
                rxcui: '6918',
                name: 'metoprolol',
                tty: 'IN'
              },
              rxclassMinConceptItem: {
                classId: 'N0000009902',
                className: 'Decreased Blood Pressure',
                classType: 'PE'
              }
            }
          ]
        }
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockIngredientResponse
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockRxClassResponse
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
      // Mock getIngredientRxcui returning null (no ingredient found)
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ relatedGroup: { conceptGroup: [] } })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ rxclassDrugInfoList: { rxclassDrugInfo: [] } })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ rxclassDrugInfoList: { rxclassDrugInfo: [] } })
        });

      const result = await getClassByRxcui('99999');
      expect(result).toBeNull();
    });

    it('should try FDASPL source if DailyMed has no EPC', async () => {
      // Mock getIngredientRxcui
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          relatedGroup: {
            conceptGroup: [{
              tty: 'IN',
              conceptProperties: [{ rxcui: '6918', name: 'metoprolol', tty: 'IN' }]
            }]
          }
        })
      });

      // DAILYMED call - no EPC, only MOA
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          rxclassDrugInfoList: {
            rxclassDrugInfo: [
              {
                minConcept: { rxcui: '6918', name: 'metoprolol', tty: 'IN' },
                rxclassMinConceptItem: {
                  classId: 'N0000000171',
                  className: 'Some Mechanism',
                  classType: 'MOA'
                }
              }
            ]
          }
        })
      });

      // FDASPL call - has EPC
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          rxclassDrugInfoList: {
            rxclassDrugInfo: [
              {
                minConcept: { rxcui: '6918', name: 'metoprolol', tty: 'IN' },
                rxclassMinConceptItem: {
                  classId: 'N0000175554',
                  className: 'Beta-adrenergic Blocker',
                  classType: 'EPC'
                }
              }
            ]
          }
        })
      });

      const result = await getClassByRxcui('6918');
      
      expect(global.fetch).toHaveBeenCalledTimes(3); // ingredient + dailymed + fdaspl
      expect(result?.epc).toBe('Beta-adrenergic Blocker');
      expect(result?.moa).toBe('Some Mechanism');
    });

    it('should handle API errors gracefully', async () => {
      // Mock successful getIngredientRxcui
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          relatedGroup: {
            conceptGroup: [{
              tty: 'IN',
              conceptProperties: [{ rxcui: '6918', name: 'metoprolol', tty: 'IN' }]
            }]
          }
        })
      });

      // Mock failed RxClass API call
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const result = await getClassByRxcui('6918');
      
      expect(result).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('RxClass API error for rxcui')
      );
      
      consoleWarnSpy.mockRestore();
    });

    it('should handle network errors gracefully', async () => {
      // Mock getIngredientRxcui network error
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const result = await getClassByRxcui('6918');
      
      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Error getting ingredient RXCUI|RxClass API error/),
        expect.any(Error)
      );
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getTherapeuticUses', () => {
    it('should return therapeutic uses for valid rxcui', async () => {
      // Mock getIngredientRxcui
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          relatedGroup: {
            conceptGroup: [{
              tty: 'IN',
              conceptProperties: [{ rxcui: '6918', name: 'metoprolol', tty: 'IN' }]
            }]
          }
        })
      });

      // Mock MEDRT may_treat response - CORRECT FORMAT
      const mockResponse = {
        rxclassDrugInfoList: {
          rxclassDrugInfo: [
            {
              minConcept: { rxcui: '6918', name: 'metoprolol', tty: 'IN' },
              rxclassMinConceptItem: {
                classId: 'D006973',
                className: 'Hypertension',
                classType: 'DISEASE'
              }
            },
            {
              minConcept: { rxcui: '6918', name: 'metoprolol', tty: 'IN' },
              rxclassMinConceptItem: {
                classId: 'D000787',
                className: 'Angina Pectoris',
                classType: 'DISEASE'
              }
            },
            {
              minConcept: { rxcui: '6918', name: 'metoprolol', tty: 'IN' },
              rxclassMinConceptItem: {
                classId: 'D006333',
                className: 'Heart Failure',
                classType: 'DISEASE'
              }
            },
            {
              minConcept: { rxcui: '6918', name: 'metoprolol', tty: 'IN' },
              rxclassMinConceptItem: {
                classId: 'D009203',
                className: 'Myocardial Infarction',
                classType: 'DISEASE'
              }
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
      // Mock getIngredientRxcui
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ relatedGroup: { conceptGroup: [] } })
      });

      // Mock MEDRT response with no uses
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ rxclassDrugInfoList: { rxclassDrugInfo: [] } })
      });

      const result = await getTherapeuticUses('99999');
      expect(result).toEqual([]);
    });

    it('should handle API errors gracefully', async () => {
      // Mock getIngredientRxcui success
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          relatedGroup: {
            conceptGroup: [{
              tty: 'IN',
              conceptProperties: [{ rxcui: '6918', name: 'metoprolol', tty: 'IN' }]
            }]
          }
        })
      });

      // Mock MEDRT API error
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      const result = await getTherapeuticUses('6918');
      expect(result).toEqual([]);
    });

    it('should filter out angioedema (side effect, not indication)', async () => {
      // Mock getIngredientRxcui call (first fetch)
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ relatedGroup: { conceptGroup: [] } })
      });

      // Mock response with angioedema (which is a SIDE EFFECT, not therapeutic use)
      const mockResponse = {
        rxclassDrugInfoList: {
          rxclassDrugInfo: [
            {
              minConcept: { rxcui: '203644', name: 'lisinopril', tty: 'IN' },
              rxclassMinConceptItem: {
                classId: 'D006973',
                className: 'Hypertension',
                classType: 'DISEASE'
              }
            },
            {
              minConcept: { rxcui: '203644', name: 'lisinopril', tty: 'IN' },
              rxclassMinConceptItem: {
                classId: 'D000799',
                className: 'Angioedema',
                classType: 'DISEASE'
              }
            },
            {
              minConcept: { rxcui: '203644', name: 'lisinopril', tty: 'IN' },
              rxclassMinConceptItem: {
                classId: 'D006333',
                className: 'Heart Failure',
                classType: 'DISEASE'
              }
            }
          ]
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await getTherapeuticUses('203644'); // Lisinopril
      
      expect(result).toHaveLength(2);
      expect(result).toContain('Hypertension');
      expect(result).toContain('Heart Failure');
      expect(result).not.toContain('Angioedema'); // CRITICAL: Filtered out
    });

    it('should filter out cholestasis and hypersensitivity', async () => {
      // Mock getIngredientRxcui call
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ relatedGroup: { conceptGroup: [] } })
      });

      const mockResponse = {
        rxclassDrugInfoList: {
          rxclassDrugInfo: [
            {
              minConcept: { rxcui: '197806', name: 'amoxicillin/clavulanate', tty: 'IN' },
              rxclassMinConceptItem: {
                classId: 'D001424',
                className: 'Bacterial Infections',
                classType: 'DISEASE'
              }
            },
            {
              minConcept: { rxcui: '197806', name: 'amoxicillin/clavulanate', tty: 'IN' },
              rxclassMinConceptItem: {
                classId: 'D002779',
                className: 'Cholestasis',
                classType: 'DISEASE'
              }
            },
            {
              minConcept: { rxcui: '197806', name: 'amoxicillin/clavulanate', tty: 'IN' },
              rxclassMinConceptItem: {
                classId: 'D004342',
                className: 'Drug Hypersensitivity',
                classType: 'DISEASE'
              }
            }
          ]
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await getTherapeuticUses('197806');
      
      expect(result).toHaveLength(1);
      expect(result).toContain('Bacterial Infections');
      expect(result).not.toContain('Cholestasis');
      expect(result).not.toContain('Drug Hypersensitivity');
    });

    it('should deduplicate case-insensitive therapeutic uses', async () => {
      // Mock getIngredientRxcui call
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ relatedGroup: { conceptGroup: [] } })
      });

      const mockResponse = {
        rxclassDrugInfoList: {
          rxclassDrugInfo: [
            {
              minConcept: { rxcui: '6918', name: 'metoprolol', tty: 'IN' },
              rxclassMinConceptItem: {
                classId: 'D006973',
                className: 'Hypertension',
                classType: 'DISEASE'
              }
            },
            {
              minConcept: { rxcui: '6918', name: 'metoprolol', tty: 'IN' },
              rxclassMinConceptItem: {
                classId: 'D006973B',
                className: 'hypertension',
                classType: 'DISEASE'
              }
            },
            {
              minConcept: { rxcui: '6918', name: 'metoprolol', tty: 'IN' },
              rxclassMinConceptItem: {
                classId: 'D000787',
                className: 'Angina Pectoris',
                classType: 'DISEASE'
              }
            }
          ]
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await getTherapeuticUses('6918');
      
      expect(result).toHaveLength(2);
      expect(result.filter(use => use.toLowerCase() === 'hypertension')).toHaveLength(1);
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
      // Mock getIngredientRxcui (already an ingredient, returns itself)
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          relatedGroup: {
            conceptGroup: [{
              tty: 'IN',
              conceptProperties: [{ rxcui: '29046', name: 'lisinopril', tty: 'IN' }]
            }]
          }
        })
      });

      // Mock DAILYMED response
      const mockResponse = {
        rxclassDrugInfoList: {
          rxclassDrugInfo: [
            {
              minConcept: { rxcui: '1546022', name: 'lisinopril anhydrous', tty: 'PIN' },
              rxclassMinConceptItem: {
                classId: 'N0000175562',
                className: 'Angiotensin Converting Enzyme Inhibitor',
                classType: 'EPC'
              }
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
      // Mock getIngredientRxcui
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          relatedGroup: {
            conceptGroup: [{
              tty: 'IN',
              conceptProperties: [{ rxcui: '114831', name: 'latanoprost', tty: 'IN' }]
            }]
          }
        })
      });

      // Mock DAILYMED response
      const mockResponse = {
        rxclassDrugInfoList: {
          rxclassDrugInfo: [
            {
              minConcept: { rxcui: '114831', name: 'latanoprost', tty: 'IN' },
              rxclassMinConceptItem: {
                classId: 'N0000175722',
                className: 'Prostaglandin Analog',
                classType: 'EPC'
              }
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
