# Third-Party Attributions

This document contains required attributions and acknowledgments for third-party services used in ClariMed.

---

## RxNav API (National Library of Medicine)

**Service:** RxNav Web Services  
**Provider:** U.S. National Library of Medicine (NLM), National Institutes of Health (NIH)  
**Website:** https://lhncbc.nlm.nih.gov/RxNav/

### About RxNav

RxNav is a browser for several drug information sources provided by the National Library of Medicine. The RxNav API provides access to:

- **RxNorm** - Normalized names for clinical drugs and drug delivery devices
- **RxTerms** - Drug interface terminology
- **Drug Interaction Information** - From multiple sources
- **National Drug File - Reference Terminology (NDF-RT)** - Drug classifications and relationships

### Required Disclosure

Per the [RxNav Terms of Service](https://lhncbc.nlm.nih.gov/RxNav/TermOfService.html):

> **The National Library of Medicine (NLM) licenses use of RxNav drug information solely for non-commercial purposes. RxNav drug information is derived from NLM's RxNorm, MED-RT, and RxTerms, and may also include information from First Databank, Inc. For use of First Databank content, contact them directly at https://www.fdbhealth.com/.**

### Usage in ClariMed

ClariMed uses the RxNav API for:

1. **Drug Search & Autocomplete** - Finding medications by name with RxNorm Concept Unique Identifiers (RXCUIs)
2. **Drug Properties** - Extracting dosage information, drug forms, and active ingredients
3. **Drug-Drug Interactions** - Checking for potential interactions between medications
4. **Allergy Cross-Reactivity** - Identifying related drug classes and ingredients
5. **Contraindication Checking** - Verencing drug-condition relationships

### Data Sources

The following RxNav data sources are used in this application:

- **RxNorm**: Normalized drug nomenclature
- **NDF-RT**: Drug classifications and therapeutic relationships
- **First Databank**: Interaction data (via RxNav)

### Important Notes

- **This application is for educational and informational purposes only**
- **Not intended for clinical decision-making without professional consultation**
- **Drug information should be verified with healthcare providers**
- **RxNav data may not be complete or current**

### API Endpoints Used

ClariMed accesses the following RxNav API endpoints:

```
https://rxnav.nlm.nih.gov/REST/
  - approximateTerm              (Drug search)
  - rxcui/{rxcui}/allrelated     (Related concepts)
  - rxcui/{rxcui}/property       (Drug properties)
  - interaction/interaction      (Drug interactions)
  - interaction/list             (Interaction lists)
```

### Rate Limiting & Fair Use

ClariMed implements client-side caching and rate limiting to minimize API calls and ensure fair use of the public RxNav API service.

---

## Supabase

**Service:** Supabase (Backend as a Service)  
**Provider:** Supabase, Inc.  
**Website:** https://supabase.com/

Supabase is used for:
- User authentication and session management
- PostgreSQL database hosting
- Real-time data synchronization
- Row Level Security (RLS) policies

**License:** Used under Supabase Terms of Service

---

## Next.js

**Framework:** Next.js  
**Provider:** Vercel, Inc.  
**Website:** https://nextjs.org/

**License:** MIT License

---

## Tailwind CSS

**Framework:** Tailwind CSS  
**Provider:** Tailwind Labs, Inc.  
**Website:** https://tailwindcss.com/

**License:** MIT License

---

## TypeScript

**Language:** TypeScript  
**Provider:** Microsoft Corporation  
**Website:** https://www.typescriptlang.org/

**License:** Apache License 2.0

---

## Disclaimer

**IMPORTANT MEDICAL DISCLAIMER:**

This application uses drug information from the National Library of Medicine's RxNav service. While we strive to provide accurate and up-to-date information:

1. **Not Medical Advice**: Information provided is for educational purposes only and should not be considered medical advice.

2. **Consult Healthcare Providers**: Always consult with qualified healthcare professionals before making any decisions about medications or treatments.

3. **No Warranty**: Drug information is provided "as is" without warranty of any kind. The developers and contributors make no representations about the accuracy, completeness, or reliability of the information.

4. **Emergency Situations**: In case of a medical emergency, contact emergency services immediately (911 in the US).

5. **Data Currency**: Drug information may not reflect the most current research or FDA approvals. Always verify with current medical references.

---

## Updates

This attribution document was last updated: **November 11, 2025**

For questions about data sources or attributions, please refer to the respective provider's terms of service and documentation.
