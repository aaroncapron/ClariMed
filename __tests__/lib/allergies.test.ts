import { checkAllergyConflicts } from '@/lib/allergies';
import type { Allergy } from '@/types';

describe('Allergy Conflict Detection', () => {
  const mockAllergies: Allergy[] = [
    {
      id: '1',
      user_id: 'user1',
      allergen: 'penicillin',
      severity: 'severe',
      created_at: '2025-01-01',
      updated_at: '2025-01-01',
    },
    {
      id: '2',
      user_id: 'user1',
      allergen: 'ibuprofen',
      severity: 'moderate',
      created_at: '2025-01-01',
      updated_at: '2025-01-01',
    },
  ];

  describe('Direct ingredient matching', () => {
    it('should detect exact allergen match in medication name', () => {
      const conflicts = checkAllergyConflicts('penicillin 500 MG Oral Tablet', mockAllergies);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].allergen).toBe('penicillin');
    });

    it('should detect allergen in brand name medications', () => {
      const conflicts = checkAllergyConflicts('Advil (ibuprofen) 200 MG Oral Tablet', mockAllergies);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].allergen).toBe('ibuprofen');
    });

    it('should not detect false positives', () => {
      const conflicts = checkAllergyConflicts('acetaminophen 500 MG Oral Tablet', mockAllergies);
      expect(conflicts).toHaveLength(0);
    });
  });

  describe('Drug class cross-reactivity', () => {
    it('should detect penicillin cross-reactivity with amoxicillin', () => {
      const conflicts = checkAllergyConflicts('amoxicillin 500 MG Oral Capsule', mockAllergies);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].allergen).toBe('penicillin');
    });

    it('should detect penicillin cross-reactivity with ampicillin', () => {
      const conflicts = checkAllergyConflicts('ampicillin 250 MG Oral Capsule', mockAllergies);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].allergen).toBe('penicillin');
    });

    it('should detect penicillin cross-reactivity with Augmentin', () => {
      const conflicts = checkAllergyConflicts('Augmentin 875 MG Oral Tablet', mockAllergies);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].allergen).toBe('penicillin');
    });

    it('should detect NSAID cross-reactivity', () => {
      const conflicts = checkAllergyConflicts('naproxen 500 MG Oral Tablet', mockAllergies);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].allergen).toBe('ibuprofen');
    });

    it('should detect aspirin cross-reactivity with NSAIDs', () => {
      const conflicts = checkAllergyConflicts('aspirin 81 MG Oral Tablet', mockAllergies);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].allergen).toBe('ibuprofen');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty medication name', () => {
      const conflicts = checkAllergyConflicts('', mockAllergies);
      expect(conflicts).toHaveLength(0);
    });

    it('should handle empty allergies list', () => {
      const conflicts = checkAllergyConflicts('amoxicillin 500 MG', []);
      expect(conflicts).toHaveLength(0);
    });

    it('should handle case-insensitive matching', () => {
      const conflicts = checkAllergyConflicts('PENICILLIN 500 MG', mockAllergies);
      expect(conflicts).toHaveLength(1);
    });
  });

  describe('Sulfa drug allergies', () => {
    const sulfaAllergy: Allergy[] = [
      {
        id: '3',
        user_id: 'user1',
        allergen: 'sulfa',
        severity: 'severe',
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
      },
    ];

    it('should detect sulfa cross-reactivity with sulfamethoxazole', () => {
      const conflicts = checkAllergyConflicts('sulfamethoxazole 800 MG', sulfaAllergy);
      expect(conflicts).toHaveLength(1);
    });

    it('should detect sulfa cross-reactivity with Bactrim', () => {
      const conflicts = checkAllergyConflicts('Bactrim DS Oral Tablet', sulfaAllergy);
      expect(conflicts).toHaveLength(1);
    });
  });

  describe('Brand name with generic in parentheses', () => {
    it('should detect generic name inside parentheses - flurbiprofen', () => {
      const flurbiprofenAllergy: Allergy[] = [
        {
          id: '4',
          user_id: 'user1',
          allergen: 'Ansaid (flurbiprofen) 100 MG Oral Tablet',
          severity: 'moderate',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
        },
      ];

      const conflicts = checkAllergyConflicts('Flurbiprofen 100 MG Oral Tablet', flurbiprofenAllergy);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].allergen).toBe('Ansaid (flurbiprofen) 100 MG Oral Tablet');
    });

    it('should detect brand name when generic is in allergy list', () => {
      const flurbiprofenAllergy: Allergy[] = [
        {
          id: '4',
          user_id: 'user1',
          allergen: 'flurbiprofen',
          severity: 'moderate',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
        },
      ];

      const conflicts = checkAllergyConflicts('Ansaid (flurbiprofen) 100 MG Oral Tablet', flurbiprofenAllergy);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].allergen).toBe('flurbiprofen');
    });

    it('should detect brand to brand matching - Ansaid', () => {
      const ansaidAllergy: Allergy[] = [
        {
          id: '5',
          user_id: 'user1',
          allergen: 'Ansaid',
          severity: 'moderate',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
        },
      ];

      const conflicts = checkAllergyConflicts('Ansaid (flurbiprofen) 100 MG Oral Tablet', ansaidAllergy);
      expect(conflicts).toHaveLength(1);
    });

    it('should detect Advil when ibuprofen allergy exists', () => {
      const ibuprofenAllergy: Allergy[] = [
        {
          id: '6',
          user_id: 'user1',
          allergen: 'ibuprofen',
          severity: 'mild',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
        },
      ];

      const conflicts = checkAllergyConflicts('Advil (ibuprofen) 200 MG Oral Tablet', ibuprofenAllergy);
      expect(conflicts).toHaveLength(1);
    });

    it('should detect Tylenol when acetaminophen allergy exists', () => {
      const acetaminophenAllergy: Allergy[] = [
        {
          id: '7',
          user_id: 'user1',
          allergen: 'acetaminophen',
          severity: 'severe',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
        },
      ];

      const conflicts = checkAllergyConflicts('Tylenol (acetaminophen) 500 MG Oral Tablet', acetaminophenAllergy);
      expect(conflicts).toHaveLength(1);
    });
  });

  describe('NSAID cross-reactivity with flurbiprofen', () => {
    it('should detect flurbiprofen allergy when trying to add ibuprofen', () => {
      const flurbiprofenAllergy: Allergy[] = [
        {
          id: '8',
          user_id: 'user1',
          allergen: 'flurbiprofen',
          severity: 'moderate',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
        },
      ];

      const conflicts = checkAllergyConflicts('Ibuprofen 400 MG Oral Tablet', flurbiprofenAllergy);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].allergen).toBe('flurbiprofen');
    });

    it('should detect ibuprofen allergy when trying to add flurbiprofen', () => {
      const conflicts = checkAllergyConflicts('Flurbiprofen 100 MG Oral Tablet', mockAllergies);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].allergen).toBe('ibuprofen');
    });

    it('should detect Ansaid when NSAID allergy exists', () => {
      const nsaidAllergy: Allergy[] = [
        {
          id: '9',
          user_id: 'user1',
          allergen: 'NSAID',
          severity: 'severe',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
        },
      ];

      const conflicts = checkAllergyConflicts('Ansaid (flurbiprofen) 100 MG Oral Tablet', nsaidAllergy);
      expect(conflicts).toHaveLength(1);
    });

    it('should detect flurbiprofen allergy when brand name Ansaid is listed as allergy', () => {
      const ansaidAllergy: Allergy[] = [
        {
          id: '10',
          user_id: 'user1',
          allergen: 'Ansaid (flurbiprofen) 100 MG Oral Tablet',
          severity: 'moderate',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
        },
      ];

      const conflicts = checkAllergyConflicts('Flurbiprofen 100 MG Oral Tablet', ansaidAllergy);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].allergen).toBe('Ansaid (flurbiprofen) 100 MG Oral Tablet');
    });

    it('should detect generic when brand name with parentheses is listed as allergy', () => {
      const brandAllergy: Allergy[] = [
        {
          id: '11',
          user_id: 'user1',
          allergen: 'Advil (ibuprofen) 200mg',
          severity: 'moderate',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
        },
      ];

      const conflicts = checkAllergyConflicts('Ibuprofen 400 MG Oral Tablet', brandAllergy);
      expect(conflicts).toHaveLength(1);
    });
  });

  describe('Bracket notation handling', () => {
    it('should extract generic name from brackets', () => {
      const bracketAllergy: Allergy[] = [
        {
          id: '12',
          user_id: 'user1',
          allergen: '72 HR sulfamethazine 32100 MG Extended Release Oral Tablet [Supra Sulfa]',
          severity: 'moderate',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
        },
      ];

      const conflicts = checkAllergyConflicts('sulfamethazine 500 MG Oral Tablet', bracketAllergy);
      expect(conflicts).toHaveLength(1);
    });

    it('should detect sulfa drug when Supra Sulfa with brackets is listed as allergy', () => {
      const supraAllergy: Allergy[] = [
        {
          id: '13',
          user_id: 'user1',
          allergen: 'Supra Sulfa [sulfamethazine]',
          severity: 'moderate',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
        },
      ];

      const conflicts = checkAllergyConflicts('Bactrim (sulfamethoxazole)', supraAllergy);
      expect(conflicts).toHaveLength(1);
    });

    it('should match brand name when generic in brackets is listed as allergy', () => {
      const genericInBracketsAllergy: Allergy[] = [
        {
          id: '14',
          user_id: 'user1',
          allergen: 'Brand Name [acetaminophen]',
          severity: 'mild',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
        },
      ];

      const conflicts = checkAllergyConflicts('Tylenol (acetaminophen) 500mg', genericInBracketsAllergy);
      expect(conflicts).toHaveLength(1);
    });

    it('should handle both parentheses and brackets in same medication name', () => {
      const complexAllergy: Allergy[] = [
        {
          id: '15',
          user_id: 'user1',
          allergen: 'Brand (generic1) Extended [generic2]',
          severity: 'moderate',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
        },
      ];

      const conflicts1 = checkAllergyConflicts('generic1 100mg', complexAllergy);
      expect(conflicts1).toHaveLength(1);

      const conflicts2 = checkAllergyConflicts('generic2 200mg', complexAllergy);
      expect(conflicts2).toHaveLength(1);
    });
  });
});
