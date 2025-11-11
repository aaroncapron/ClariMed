/**
 * Tests for contraindication checking system.
 */

import { checkContraindications, getContraindicationBadge } from '@/lib/contraindications';
import type { Medication, HealthCondition } from '@/types';

describe('checkContraindications', () => {
  const createMedication = (name: string): Medication => ({
    id: '1',
    name,
    dosage: '10mg',
    frequency: 'once daily',
    isMaintenance: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const createCondition = (condition: string, category: any): HealthCondition => ({
    id: '1',
    user_id: 'user-123',
    condition,
    category,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  describe('Pregnancy contraindications', () => {
    const pregnancyCondition = createCondition('Pregnancy', 'pregnancy');

    it('should detect critical contraindication for isotretinoin', () => {
      const med = createMedication('Isotretinoin 20mg');
      const warnings = checkContraindications(med, [pregnancyCondition]);

      expect(warnings).toHaveLength(1);
      expect(warnings[0].severity).toBe('critical');
      expect(warnings[0].condition).toBe('Pregnancy');
      expect(warnings[0].description).toContain('birth defects');
    });

    it('should detect critical contraindication for ACE inhibitors', () => {
      const med = createMedication('Lisinopril 10mg');
      const warnings = checkContraindications(med, [pregnancyCondition]);

      expect(warnings).toHaveLength(1);
      expect(warnings[0].severity).toBe('critical');
      expect(warnings[0].description).toContain('fetal harm');
    });

    it('should detect critical contraindication for statins', () => {
      const med = createMedication('Atorvastatin 20mg');
      const warnings = checkContraindications(med, [pregnancyCondition]);

      expect(warnings).toHaveLength(1);
      expect(warnings[0].severity).toBe('critical');
      expect(warnings[0].description).toContain('Contraindicated during pregnancy');
    });

    it('should detect major contraindication for NSAIDs', () => {
      const med = createMedication('Ibuprofen 400mg');
      const warnings = checkContraindications(med, [pregnancyCondition]);

      expect(warnings).toHaveLength(1);
      expect(warnings[0].severity).toBe('major');
      expect(warnings[0].description).toContain('third trimester');
    });

    it('should detect major contraindication for tetracyclines', () => {
      const med = createMedication('Doxycycline 100mg');
      const warnings = checkContraindications(med, [pregnancyCondition]);

      expect(warnings).toHaveLength(1);
      expect(warnings[0].severity).toBe('major');
      expect(warnings[0].description).toContain('bone and tooth development');
    });

    it('should detect warfarin contraindication', () => {
      const med = createMedication('Warfarin 5mg');
      const warnings = checkContraindications(med, [pregnancyCondition]);

      expect(warnings).toHaveLength(1);
      expect(warnings[0].severity).toBe('critical');
    });
  });

  describe('Kidney disease contraindications', () => {
    const kidneyCondition = createCondition('Chronic kidney disease', 'renal');

    it('should detect NSAID contraindication in kidney disease', () => {
      const med = createMedication('Ibuprofen 600mg');
      const warnings = checkContraindications(med, [kidneyCondition]);

      expect(warnings.length).toBeGreaterThanOrEqual(1);
      expect(warnings.every(w => w.severity === 'major')).toBe(true);
      expect(warnings.some(w => w.description.toLocaleLowerCase().includes('kidney'))).toBe(true);
    });

    it('should detect metformin contraindication', () => {
      const med = createMedication('Metformin 500mg');
      const warnings = checkContraindications(med, [kidneyCondition]);

      expect(warnings.length).toBeGreaterThanOrEqual(1);
      expect(warnings.every(w => w.severity === 'major')).toBe(true);
      expect(warnings.some(w => w.description.toLowerCase().includes('kidney'))).toBe(true);
    });

    it('should detect lithium contraindication', () => {
      const med = createMedication('Lithium Carbonate 300mg');
      const warnings = checkContraindications(med, [kidneyCondition]);

      expect(warnings).toHaveLength(1);
      expect(warnings[0].severity).toBe('major');
    });

    it('should detect naproxen contraindication', () => {
      const med = createMedication('Naproxen 500mg');
      const warnings = checkContraindications(med, [kidneyCondition]);

      expect(warnings.length).toBeGreaterThanOrEqual(1);
      expect(warnings.every(w => w.severity === 'major')).toBe(true);
    });
  });

  describe('Liver disease contraindications', () => {
    const liverCondition = createCondition('Liver disease', 'hepatic');

    it('should detect acetaminophen contraindication', () => {
      const med = createMedication('Acetaminophen 500mg');
      const warnings = checkContraindications(med, [liverCondition]);

      expect(warnings).toHaveLength(1);
      expect(warnings[0].severity).toBe('major');
      expect(warnings[0].description).toContain('liver damage');
    });

    it('should detect statin contraindication', () => {
      const med = createMedication('Simvastatin 20mg');
      const warnings = checkContraindications(med, [liverCondition]);

      expect(warnings).toHaveLength(1);
      expect(warnings[0].severity).toBe('major');
    });

    it('should detect critical methotrexate contraindication', () => {
      const med = createMedication('Methotrexate 10mg');
      const warnings = checkContraindications(med, [liverCondition]);

      expect(warnings).toHaveLength(1);
      expect(warnings[0].severity).toBe('critical');
      expect(warnings[0].description).toContain('hepatotoxic');
    });
  });

  describe('Asthma contraindications', () => {
    const asthmaCondition = createCondition('Asthma', 'respiratory');

    it('should detect NSAID contraindication in asthma', () => {
      const med = createMedication('Aspirin 325mg');
      const warnings = checkContraindications(med, [asthmaCondition]);

      expect(warnings).toHaveLength(1);
      expect(warnings[0].severity).toBe('major');
      expect(warnings[0].description).toContain('asthma attacks');
    });

    it('should detect beta blocker contraindication', () => {
      const med = createMedication('Propranolol 40mg');
      const warnings = checkContraindications(med, [asthmaCondition]);

      expect(warnings).toHaveLength(1);
      expect(warnings[0].severity).toBe('major');
      expect(warnings[0].description).toContain('bronchospasm');
    });

    it('should detect metoprolol contraindication', () => {
      const med = createMedication('Metoprolol 50mg');
      const warnings = checkContraindications(med, [asthmaCondition]);

      expect(warnings).toHaveLength(1);
      expect(warnings[0].severity).toBe('major');
    });
  });

  describe('Glaucoma contraindications', () => {
    const glaucomaCondition = createCondition('Glaucoma', 'other');

    it('should detect anticholinergic contraindication', () => {
      const med = createMedication('Diphenhydramine 25mg');
      const warnings = checkContraindications(med, [glaucomaCondition]);

      expect(warnings).toHaveLength(1);
      expect(warnings[0].severity).toBe('major');
      expect(warnings[0].description).toContain('intraocular pressure');
    });

    it('should detect Benadryl contraindication', () => {
      const med = createMedication('Benadryl 50mg');
      const warnings = checkContraindications(med, [glaucomaCondition]);

      expect(warnings).toHaveLength(1);
      expect(warnings[0].severity).toBe('major');
    });
  });

  describe('Diabetes contraindications', () => {
    const diabetesCondition = createCondition('Diabetes Type 2', 'endocrine');

    it('should detect corticosteroid contraindication', () => {
      const med = createMedication('Prednisone 10mg');
      const warnings = checkContraindications(med, [diabetesCondition]);

      expect(warnings).toHaveLength(1);
      expect(warnings[0].severity).toBe('moderate');
      expect(warnings[0].description).toContain('blood sugar');
    });

    it('should detect thiazide diuretic contraindication', () => {
      const med = createMedication('Hydrochlorothiazide 25mg');
      const warnings = checkContraindications(med, [diabetesCondition]);

      expect(warnings).toHaveLength(1);
      expect(warnings[0].severity).toBe('moderate');
    });
  });

  describe('Seizure disorder contraindications', () => {
    const seizureCondition = createCondition('Epilepsy', 'neurological');

    it('should detect bupropion contraindication', () => {
      const med = createMedication('Bupropion 150mg');
      const warnings = checkContraindications(med, [seizureCondition]);

      expect(warnings).toHaveLength(1);
      expect(warnings[0].severity).toBe('major');
      expect(warnings[0].description).toContain('seizure');
    });

    it('should detect Wellbutrin contraindication', () => {
      const med = createMedication('Wellbutrin XL 300mg');
      const warnings = checkContraindications(med, [seizureCondition]);

      expect(warnings).toHaveLength(1);
      expect(warnings[0].severity).toBe('major');
    });
  });

  describe('Multiple conditions', () => {
    it('should detect contraindications across multiple conditions', () => {
      const med = createMedication('Ibuprofen 600mg');
      const conditions = [
        createCondition('Pregnancy', 'pregnancy'),
        createCondition('Chronic kidney disease', 'renal'),
        createCondition('Hypertension', 'cardiovascular'),
      ];

      const warnings = checkContraindications(med, conditions);

      expect(warnings.length).toBeGreaterThanOrEqual(3);
      expect(warnings.some(w => w.condition === 'Pregnancy')).toBe(true);
      expect(warnings.some(w => w.condition === 'Chronic kidney disease')).toBe(true);
      expect(warnings.some(w => w.condition === 'Hypertension')).toBe(true);
    });

    it('should return unique warnings for each condition', () => {
      const med = createMedication('Aspirin 81mg');
      const conditions = [
        createCondition('Asthma', 'respiratory'),
        createCondition('Peptic ulcer disease', 'gastrointestinal'),
      ];

      const warnings = checkContraindications(med, conditions);

      expect(warnings.length).toBe(2);
      const conditionNames = warnings.map(w => w.condition);
      expect(conditionNames).toContain('Asthma');
      expect(conditionNames).toContain('Peptic ulcer disease');
    });
  });

  describe('Edge cases', () => {
    it('should return empty array for empty medication name', () => {
      const med = createMedication('');
      const conditions = [createCondition('Pregnancy', 'pregnancy')];

      const warnings = checkContraindications(med, conditions);

      expect(warnings).toEqual([]);
    });

    it('should return empty array for empty conditions list', () => {
      const med = createMedication('Lisinopril 10mg');
      const warnings = checkContraindications(med, []);

      expect(warnings).toEqual([]);
    });

    it('should return empty array when no contraindications match', () => {
      const med = createMedication('Vitamin D 1000IU');
      const conditions = [createCondition('Pregnancy', 'pregnancy')];

      const warnings = checkContraindications(med, conditions);

      expect(warnings).toEqual([]);
    });

    it('should handle case-insensitive matching', () => {
      const med = createMedication('LISINOPRIL 10MG');
      const conditions = [createCondition('PREGNANCY', 'pregnancy')];

      const warnings = checkContraindications(med, conditions);

      expect(warnings).toHaveLength(1);
    });

    it('should match partial medication names', () => {
      const med = createMedication('Ibuprofen 400mg tablet');
      const conditions = [createCondition('Asthma', 'respiratory')];

      const warnings = checkContraindications(med, conditions);

      expect(warnings).toHaveLength(1);
    });
  });

  describe('Breastfeeding contraindications', () => {
    const breastfeedingCondition = createCondition('Breastfeeding', 'pregnancy');

    it('should detect codeine contraindication', () => {
      const med = createMedication('Codeine 30mg');
      const warnings = checkContraindications(med, [breastfeedingCondition]);

      expect(warnings).toHaveLength(1);
      expect(warnings[0].severity).toBe('major');
      expect(warnings[0].description).toContain('breast milk');
    });

    it('should detect tramadol contraindication', () => {
      const med = createMedication('Tramadol 50mg');
      const warnings = checkContraindications(med, [breastfeedingCondition]);

      expect(warnings).toHaveLength(1);
      expect(warnings[0].severity).toBe('major');
    });
  });

  describe('Heart failure contraindications', () => {
    const heartFailureCondition = createCondition('Heart failure', 'cardiovascular');

    it('should detect NSAID contraindication', () => {
      const med = createMedication('Naproxen 500mg');
      const warnings = checkContraindications(med, [heartFailureCondition]);

      expect(warnings).toHaveLength(1);
      expect(warnings[0].severity).toBe('major');
      expect(warnings[0].description).toContain('fluid retention');
    });

    it('should detect calcium channel blocker contraindication', () => {
      const med = createMedication('Diltiazem 120mg');
      const warnings = checkContraindications(med, [heartFailureCondition]);

      expect(warnings).toHaveLength(1);
      expect(warnings[0].severity).toBe('moderate');
    });
  });
});

describe('getContraindicationBadge', () => {
  it('should return correct configuration for critical severity', () => {
    const badge = getContraindicationBadge('critical');
    
    expect(badge.label).toBe('Critical');
    expect(badge.color).toContain('red');
  });

  it('should return correct configuration for major severity', () => {
    const badge = getContraindicationBadge('major');
    
    expect(badge.label).toBe('Major');
    expect(badge.color).toContain('orange');
  });

  it('should return correct configuration for moderate severity', () => {
    const badge = getContraindicationBadge('moderate');
    
    expect(badge.label).toBe('Moderate');
    expect(badge.color).toContain('yellow');
  });

  it('should return correct configuration for minor severity', () => {
    const badge = getContraindicationBadge('minor');
    
    expect(badge.label).toBe('Minor');
    expect(badge.color).toContain('blue');
  });

  it('should include border color in all badges', () => {
    const severities: Array<'critical' | 'major' | 'moderate' | 'minor'> = ['critical', 'major', 'moderate', 'minor'];
    
    severities.forEach(severity => {
      const badge = getContraindicationBadge(severity);
      expect(badge.color).toContain('border');
    });
  });
});
