/**
 * Tests for medical reference data and autocomplete functions.
 */

import {
  COMMON_DRUG_ALLERGIES,
  COMMON_HEALTH_CONDITIONS,
  getAllergyAutocompleteSuggestions,
  getConditionAutocompleteSuggestions,
} from '@/lib/medical-reference';

describe('COMMON_DRUG_ALLERGIES', () => {
  it('should contain at least 15 common drug allergies', () => {
    expect(COMMON_DRUG_ALLERGIES.length).toBeGreaterThanOrEqual(15);
  });

  it('should include penicillin', () => {
    const penicillin = COMMON_DRUG_ALLERGIES.find(a => a.name.toLowerCase().includes('penicillin'));
    expect(penicillin).toBeDefined();
    expect(penicillin?.category).toBe('Beta-Lactam Antibiotics');
  });

  it('should include sulfa drugs', () => {
    const sulfa = COMMON_DRUG_ALLERGIES.find(a => a.name.toLowerCase().includes('sulfa'));
    expect(sulfa).toBeDefined();
  });

  it('should include NSAIDs', () => {
    const aspirin = COMMON_DRUG_ALLERGIES.find(a => a.name.toLowerCase().includes('aspirin'));
    const ibuprofen = COMMON_DRUG_ALLERGIES.find(a => a.name.toLowerCase().includes('ibuprofen'));
    
    expect(aspirin).toBeDefined();
    expect(ibuprofen).toBeDefined();
    expect(aspirin?.category).toBe('NSAIDs');
  });

  it('should have name, category, and description for all allergies', () => {
    COMMON_DRUG_ALLERGIES.forEach(allergy => {
      expect(allergy.name).toBeTruthy();
      expect(allergy.category).toBeTruthy();
      expect(allergy.description).toBeTruthy();
      expect(typeof allergy.name).toBe('string');
      expect(typeof allergy.category).toBe('string');
      expect(typeof allergy.description).toBe('string');
    });
  });

  it('should include opioid allergens', () => {
    const codeine = COMMON_DRUG_ALLERGIES.find(a => a.name.toLowerCase().includes('codeine'));
    const morphine = COMMON_DRUG_ALLERGIES.find(a => a.name.toLowerCase().includes('morphine'));
    
    expect(codeine).toBeDefined();
    expect(morphine).toBeDefined();
    expect(codeine?.category).toBe('Opioid Analgesics');
  });

  it('should include macrolides', () => {
    const macrolide = COMMON_DRUG_ALLERGIES.find(a => a.name.toLowerCase().includes('macrolide'));
    expect(macrolide).toBeDefined();
  });

  it('should include tetracycline', () => {
    const tetracycline = COMMON_DRUG_ALLERGIES.find(a => a.name.toLowerCase().includes('tetracycline'));
    expect(tetracycline).toBeDefined();
  });

  it('should include cephalosporins', () => {
    const ceph = COMMON_DRUG_ALLERGIES.find(a => a.name.toLowerCase().includes('cephalosporin'));
    expect(ceph).toBeDefined();
    expect(ceph?.description).toContain('penicillin');
  });
});

describe('COMMON_HEALTH_CONDITIONS', () => {
  it('should contain at least 35 common health conditions', () => {
    expect(COMMON_HEALTH_CONDITIONS.length).toBeGreaterThanOrEqual(35);
  });

  it('should include pregnancy conditions', () => {
    const pregnancy = COMMON_HEALTH_CONDITIONS.find(c => c.name.toLowerCase().includes('pregnancy'));
    const breastfeeding = COMMON_HEALTH_CONDITIONS.find(c => c.name.toLowerCase().includes('breastfeeding'));
    
    expect(pregnancy).toBeDefined();
    expect(breastfeeding).toBeDefined();
    expect(pregnancy?.category).toBe('pregnancy');
  });

  it('should include cardiovascular conditions', () => {
    const hypertension = COMMON_HEALTH_CONDITIONS.find(c => c.name.toLowerCase().includes('hypertension'));
    const heartDisease = COMMON_HEALTH_CONDITIONS.find(c => c.name.toLowerCase().includes('heart disease'));
    
    expect(hypertension).toBeDefined();
    expect(heartDisease).toBeDefined();
    expect(hypertension?.category).toBe('cardiovascular');
  });

  it('should include respiratory conditions', () => {
    const asthma = COMMON_HEALTH_CONDITIONS.find(c => c.name.toLowerCase().includes('asthma'));
    const copd = COMMON_HEALTH_CONDITIONS.find(c => c.name.toLowerCase().includes('copd'));
    
    expect(asthma).toBeDefined();
    expect(copd).toBeDefined();
    expect(asthma?.category).toBe('respiratory');
  });

  it('should include endocrine conditions', () => {
    const diabetesType1 = COMMON_HEALTH_CONDITIONS.find(c => c.name.includes('Type 1'));
    const diabetesType2 = COMMON_HEALTH_CONDITIONS.find(c => c.name.includes('Type 2'));
    const thyroid = COMMON_HEALTH_CONDITIONS.find(c => c.name.toLowerCase().includes('thyroid disease'));
    
    expect(diabetesType1).toBeDefined();
    expect(diabetesType2).toBeDefined();
    expect(thyroid).toBeDefined();
    expect(diabetesType1?.category).toBe('endocrine');
  });

  it('should include renal conditions', () => {
    const kidneyDisease = COMMON_HEALTH_CONDITIONS.find(c => c.name.toLowerCase().includes('kidney disease'));
    const ckd = COMMON_HEALTH_CONDITIONS.find(c => c.name.toLowerCase().includes('chronic kidney'));
    
    expect(kidneyDisease).toBeDefined();
    expect(ckd).toBeDefined();
    expect(kidneyDisease?.category).toBe('renal');
  });

  it('should include hepatic conditions', () => {
    const liverDisease = COMMON_HEALTH_CONDITIONS.find(c => c.name.toLowerCase().includes('liver disease'));
    const cirrhosis = COMMON_HEALTH_CONDITIONS.find(c => c.name.toLowerCase().includes('cirrhosis'));
    
    expect(liverDisease).toBeDefined();
    expect(cirrhosis).toBeDefined();
    expect(liverDisease?.category).toBe('hepatic');
  });

  it('should include neurological conditions', () => {
    const epilepsy = COMMON_HEALTH_CONDITIONS.find(c => c.name.toLowerCase().includes('epilepsy'));
    const depression = COMMON_HEALTH_CONDITIONS.find(c => c.name.toLowerCase().includes('depression'));
    
    expect(epilepsy).toBeDefined();
    expect(depression).toBeDefined();
    expect(epilepsy?.category).toBe('neurological');
  });

  it('should include gastrointestinal conditions', () => {
    const gerd = COMMON_HEALTH_CONDITIONS.find(c => c.name.toLowerCase().includes('gerd'));
    const ulcer = COMMON_HEALTH_CONDITIONS.find(c => c.name.toLowerCase().includes('peptic ulcer'));
    
    expect(gerd).toBeDefined();
    expect(ulcer).toBeDefined();
    expect(gerd?.category).toBe('gastrointestinal');
  });

  it('should have name, category, and description for all conditions', () => {
    COMMON_HEALTH_CONDITIONS.forEach(condition => {
      expect(condition.name).toBeTruthy();
      expect(condition.category).toBeTruthy();
      expect(condition.description).toBeTruthy();
      expect(typeof condition.name).toBe('string');
      expect(typeof condition.category).toBe('string');
      expect(typeof condition.description).toBe('string');
    });
  });

  it('should have valid category values', () => {
    const validCategories = [
      'cardiovascular',
      'respiratory',
      'endocrine',
      'gastrointestinal',
      'renal',
      'hepatic',
      'neurological',
      'pregnancy',
      'other',
    ];

    COMMON_HEALTH_CONDITIONS.forEach(condition => {
      expect(validCategories).toContain(condition.category);
    });
  });

  it('should include glaucoma', () => {
    const glaucoma = COMMON_HEALTH_CONDITIONS.find(c => c.name.toLowerCase().includes('glaucoma'));
    expect(glaucoma).toBeDefined();
    expect(glaucoma?.category).toBe('other');
  });

  it('should include gout', () => {
    const gout = COMMON_HEALTH_CONDITIONS.find(c => c.name.toLowerCase().includes('gout'));
    expect(gout).toBeDefined();
  });
});

describe('getAllergyAutocompleteSuggestions', () => {
  it('should return empty array for queries less than 2 characters', () => {
    expect(getAllergyAutocompleteSuggestions('')).toEqual([]);
    expect(getAllergyAutocompleteSuggestions('a')).toEqual([]);
  });

  it('should return matching allergies for valid query', () => {
    const results = getAllergyAutocompleteSuggestions('pen');
    
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(a => a.name.toLowerCase().includes('pen'))).toBe(true);
  });

  it('should be case-insensitive', () => {
    const lowerResults = getAllergyAutocompleteSuggestions('penicillin');
    const upperResults = getAllergyAutocompleteSuggestions('PENICILLIN');
    const mixedResults = getAllergyAutocompleteSuggestions('PeNiCiLLin');
    
    expect(lowerResults.length).toBeGreaterThan(0);
    expect(upperResults.length).toBe(lowerResults.length);
    expect(mixedResults.length).toBe(lowerResults.length);
  });

  it('should find allergies by category', () => {
    const results = getAllergyAutocompleteSuggestions('nsaid');
    
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(a => a.category.toLowerCase().includes('nsaid'))).toBe(true);
  });

  it('should limit results to 10 items', () => {
    const results = getAllergyAutocompleteSuggestions('a');
    
    expect(results.length).toBeLessThanOrEqual(10);
  });

  it('should find sulfa drugs', () => {
    const results = getAllergyAutocompleteSuggestions('sulfa');
    
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(a => a.name.toLowerCase().includes('sulfa'))).toBe(true);
  });

  it('should find aspirin', () => {
    const results = getAllergyAutocompleteSuggestions('asp');
    
    expect(results.some(a => a.name.toLowerCase().includes('aspirin'))).toBe(true);
  });

  it('should find ibuprofen', () => {
    const results = getAllergyAutocompleteSuggestions('ibu');
    
    expect(results.some(a => a.name.toLowerCase().includes('ibuprofen'))).toBe(true);
  });

  it('should find codeine', () => {
    const results = getAllergyAutocompleteSuggestions('cod');
    
    expect(results.some(a => a.name.toLowerCase().includes('codeine'))).toBe(true);
  });

  it('should return empty array for non-matching query', () => {
    const results = getAllergyAutocompleteSuggestions('zzzzzzz');
    
    expect(results).toEqual([]);
  });
});

describe('getConditionAutocompleteSuggestions', () => {
  it('should return empty array for queries less than 2 characters', () => {
    expect(getConditionAutocompleteSuggestions('')).toEqual([]);
    expect(getConditionAutocompleteSuggestions('d')).toEqual([]);
  });

  it('should return matching conditions for valid query', () => {
    const results = getConditionAutocompleteSuggestions('dia');
    
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(c => c.name.toLowerCase().includes('dia'))).toBe(true);
  });

  it('should be case-insensitive', () => {
    const lowerResults = getConditionAutocompleteSuggestions('diabetes');
    const upperResults = getConditionAutocompleteSuggestions('DIABETES');
    const mixedResults = getConditionAutocompleteSuggestions('DiAbEtEs');
    
    expect(lowerResults.length).toBeGreaterThan(0);
    expect(upperResults.length).toBe(lowerResults.length);
    expect(mixedResults.length).toBe(lowerResults.length);
  });

  it('should find conditions by description', () => {
    const results = getConditionAutocompleteSuggestions('blood pressure');
    
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(c => c.description.toLowerCase().includes('blood pressure'))).toBe(true);
  });

  it('should limit results to 10 items', () => {
    const results = getConditionAutocompleteSuggestions('di');
    
    expect(results.length).toBeLessThanOrEqual(10);
  });

  it('should find pregnancy', () => {
    const results = getConditionAutocompleteSuggestions('preg');
    
    expect(results.some(c => c.name.toLowerCase().includes('pregnancy'))).toBe(true);
  });

  it('should find asthma', () => {
    const results = getConditionAutocompleteSuggestions('asth');
    
    expect(results.some(c => c.name.toLowerCase().includes('asthma'))).toBe(true);
  });

  it('should find kidney disease', () => {
    const results = getConditionAutocompleteSuggestions('kidney');
    
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(c => c.name.toLowerCase().includes('kidney'))).toBe(true);
  });

  it('should find liver disease', () => {
    const results = getConditionAutocompleteSuggestions('liver');
    
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(c => c.name.toLowerCase().includes('liver'))).toBe(true);
  });

  it('should find hypertension', () => {
    const results = getConditionAutocompleteSuggestions('hyper');
    
    expect(results.some(c => c.name.toLowerCase().includes('hypertension'))).toBe(true);
  });

  it('should find epilepsy', () => {
    const results = getConditionAutocompleteSuggestions('epil');
    
    expect(results.some(c => c.name.toLowerCase().includes('epilepsy'))).toBe(true);
  });

  it('should find glaucoma', () => {
    const results = getConditionAutocompleteSuggestions('glauc');
    
    expect(results.some(c => c.name.toLowerCase().includes('glaucoma'))).toBe(true);
  });

  it('should return empty array for non-matching query', () => {
    const results = getConditionAutocompleteSuggestions('zzzzzzz');
    
    expect(results).toEqual([]);
  });

  it('should find COPD', () => {
    const results = getConditionAutocompleteSuggestions('copd');
    
    expect(results.some(c => c.name.toLowerCase().includes('copd'))).toBe(true);
  });

  it('should find GERD', () => {
    const results = getConditionAutocompleteSuggestions('gerd');
    
    expect(results.some(c => c.name.toLowerCase().includes('gerd'))).toBe(true);
  });
});
