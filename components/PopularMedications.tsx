/**
 * Popular Medications Display Component
 * Shows commonly searched medications as quick-select buttons
 * Displayed when search input is empty or focused
 */

interface PopularMedication {
  name: string;
  rxcui: string;
  category: string;
}

interface PopularMedicationsProps {
  onSelect: (medication: PopularMedication) => void;
}

const POPULAR_MEDICATIONS: PopularMedication[] = [
  { name: 'Lisinopril', rxcui: '314076', category: 'Blood Pressure' },
  { name: 'Atorvastatin', rxcui: '83367', category: 'Cholesterol' },
  { name: 'Metformin', rxcui: '6809', category: 'Diabetes' },
  { name: 'Levothyroxine', rxcui: '10582', category: 'Thyroid' },
  { name: 'Omeprazole', rxcui: '7646', category: 'Acid Reflux' },
  { name: 'Albuterol', rxcui: '435', category: 'Asthma' },
  { name: 'Sertraline', rxcui: '36437', category: 'Depression' },
  { name: 'Gabapentin', rxcui: '25480', category: 'Nerve Pain' },
];

export default function PopularMedications({ onSelect }: PopularMedicationsProps) {
  return (
    <div className="py-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 px-1">
        Popular Medications
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {POPULAR_MEDICATIONS.map((med) => (
          <button
            key={med.rxcui}
            type="button"
            onClick={() => onSelect(med)}
            className="px-4 py-3 text-left bg-white border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all active:scale-95 group"
          >
            <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
              {med.name}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{med.category}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
