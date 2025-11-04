import { isLikelyMaintenanceMed, getMaintenanceReason } from '@/lib/maintenance';

describe('Maintenance Medication Detection', () => {
  describe('isLikelyMaintenanceMed', () => {
    it('should identify statins as maintenance medications', () => {
      expect(isLikelyMaintenanceMed('atorvastatin 10 MG Oral Tablet')).toBe(true);
      expect(isLikelyMaintenanceMed('Lipitor (atorvastatin) 20 MG Oral Tablet')).toBe(true);
      expect(isLikelyMaintenanceMed('simvastatin 40 MG Oral Tablet')).toBe(true);
    });

    it('should identify ACE inhibitors as maintenance medications', () => {
      expect(isLikelyMaintenanceMed('lisinopril 10 MG Oral Tablet')).toBe(true);
      expect(isLikelyMaintenanceMed('enalapril 5 MG Oral Tablet')).toBe(true);
      expect(isLikelyMaintenanceMed('ramipril 2.5 MG Oral Capsule')).toBe(true);
    });

    it('should identify ARBs as maintenance medications', () => {
      expect(isLikelyMaintenanceMed('losartan 50 MG Oral Tablet')).toBe(true);
      expect(isLikelyMaintenanceMed('valsartan 160 MG Oral Tablet')).toBe(true);
    });

    it('should identify diabetes medications as maintenance medications', () => {
      expect(isLikelyMaintenanceMed('metformin 500 MG Oral Tablet')).toBe(true);
      expect(isLikelyMaintenanceMed('insulin glargine 100 UNT/ML')).toBe(true);
    });

    it('should identify thyroid medications as maintenance medications', () => {
      expect(isLikelyMaintenanceMed('levothyroxine 50 MCG Oral Tablet')).toBe(true);
      expect(isLikelyMaintenanceMed('Synthroid 75 MCG Oral Tablet')).toBe(true);
    });

    it('should not identify antibiotics as maintenance medications', () => {
      expect(isLikelyMaintenanceMed('amoxicillin 500 MG Oral Capsule')).toBe(false);
      expect(isLikelyMaintenanceMed('azithromycin 250 MG Oral Tablet')).toBe(false);
    });

    it('should not identify pain relievers as maintenance medications', () => {
      expect(isLikelyMaintenanceMed('acetaminophen 500 MG Oral Tablet')).toBe(false);
      expect(isLikelyMaintenanceMed('hydrocodone 5 MG Oral Tablet')).toBe(false);
    });

    it('should work with ATC codes when provided', () => {
      expect(isLikelyMaintenanceMed('Unknown Drug', 'C10AA05')).toBe(true);
      expect(isLikelyMaintenanceMed('Unknown Drug', 'C09AA05')).toBe(true);
      expect(isLikelyMaintenanceMed('Unknown Drug', 'J01CA04')).toBe(false);
    });
  });

  describe('getMaintenanceReason', () => {
    it('should return correct reason for statins', () => {
      const reason = getMaintenanceReason('atorvastatin 10 MG');
      expect(reason).toContain('Cholesterol');
    });

    it('should return correct reason for ACE inhibitors', () => {
      const reason = getMaintenanceReason('lisinopril 10 MG');
      expect(reason).toContain('Blood pressure');
      expect(reason).toContain('ACE inhibitor');
    });

    it('should return correct reason for diabetes medications', () => {
      const reason = getMaintenanceReason('metformin 500 MG');
      expect(reason).toContain('Diabetes');
    });

    it('should return null for non-maintenance medications', () => {
      const reason = getMaintenanceReason('amoxicillin 500 MG');
      expect(reason).toBeNull();
    });
  });
});
