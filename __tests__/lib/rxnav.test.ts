import { parseDosage, parseForm } from '@/lib/rxnav';

describe('RxNav Utility Functions', () => {
  describe('parseDosage', () => {
    it('should extract dosage from medication name with MG', () => {
      expect(parseDosage('lisinopril 10 MG Oral Tablet')).toBe('10 MG');
      expect(parseDosage('atorvastatin 20 MG Oral Tablet')).toBe('20 MG');
    });

    it('should extract dosage with decimal values', () => {
      expect(parseDosage('warfarin 2.5 MG Oral Tablet')).toBe('2.5 MG');
      expect(parseDosage('alprazolam 0.25 MG Oral Tablet')).toBe('0.25 MG');
    });

    it('should extract dosage with MCG', () => {
      expect(parseDosage('levothyroxine 50 MCG Oral Tablet')).toBe('50 MCG');
    });

    it('should extract dosage with ML', () => {
      expect(parseDosage('amoxicillin 250 ML Oral Suspension')).toBe('250 ML');
    });

    it('should return empty string for no dosage', () => {
      expect(parseDosage('ibuprofen Oral Tablet')).toBe('');
      expect(parseDosage('aspirin')).toBe('');
    });
  });

  describe('parseForm', () => {
    it('should extract oral tablet form', () => {
      const result = parseForm('lisinopril 10 MG Oral Tablet');
      expect(result).toBe('Oral Tablet');
    });

    it('should extract oral capsule form', () => {
      const result = parseForm('amoxicillin 500 MG Oral Capsule');
      expect(result).toBe('Oral Capsule');
    });

    it('should extract oral suspension form', () => {
      const result = parseForm('amoxicillin 250 ML Oral Suspension');
      expect(result).toContain('Suspension');
    });

    it('should return empty string for no form', () => {
      expect(parseForm('aspirin')).toBe('');
      expect(parseForm('ibuprofen 200')).toBe('');
    });
  });
});

describe('RxNav API Integration', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Drug search functionality', () => {
    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      
      const { searchDrugs } = await import('@/lib/rxnav');
      const results = await searchDrugs('lisinopril');
      
      expect(results).toEqual([]);
    });

    it('should return empty array for queries less than 2 characters', async () => {
      const { searchDrugs } = await import('@/lib/rxnav');
      expect(await searchDrugs('')).toEqual([]);
      expect(await searchDrugs('a')).toEqual([]);
    });
  });
});
