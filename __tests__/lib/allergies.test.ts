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
});
