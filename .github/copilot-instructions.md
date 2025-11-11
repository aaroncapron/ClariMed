# GitHub Copilot Instructions for ClariMed

**CRITICAL: This file should NEVER be committed to git**

## Project Overview
ClariMed is a professional medication management application using Next.js 14, TypeScript, Tailwind CSS, and Supabase. It integrates with the NIH RxNav API for drug information and focuses on user safety through Drug Utilization Review (DUR) checks.

**Current Version**: 0.8.0

---

## Code Standards

### Comments & Documentation
- Professional and concise comments only
- Use JSDoc format for public APIs (end with periods)
- NO emojis anywhere in code or comments
- Minimal inline comments (only for complex logic)
- No verbose explanations or tutorial-style comments

---

## Legal Compliance - FDA Medical Device Regulations

**ClariMed is NOT a medical device. It is an informational tool only.**

### What We MUST Avoid:
- NO medical advice or treatment recommendations
- NO diagnostic features
- NO prescription drug recommendations
- NO dosing calculations or suggestions
- NO claims of preventing/treating medical conditions
- NO therapeutic claims

### Safe Terminology:
- "Track medications"
- "Medication organizer"
- "Personal health record"
- "Information only - consult your healthcare provider"
- "May indicate potential concerns"
- "Educational purposes"

### Unsafe Terminology:
- "Diagnose"
- "Treat" or "Treatment"
- "Prescribe" or "Recommended dosage"
- "Medical decision support"
- "Clinical decision tool"

### Disclaimers Required:
- All interaction/allergy warnings must include: "This is informational only. Consult your healthcare provider."
- Never suggest changing medications without provider consultation
- Always emphasize user responsibility to verify with professionals

### DUR (Drug Utilization Review) Implementation
- Display potential drug interactions as INFORMATION only
- Color-code by severity but never block user actions
- Include disclaimers that this is not medical advice
- User can always override or dismiss warnings
- Source data from public APIs (RxNav, OpenFDA)

---

## Deployment Pipeline

**CRITICAL: Automatic Vercel Deployment on Every Push**

### Pre-Push Checklist (MANDATORY):

1. **Run production build**: `npm run build`
   - Must complete with zero errors
   - Check for TypeScript compilation errors
   - Verify all routes compile successfully
   - Review bundle size changes

2. **Run test suite**: `npm test`
   - All tests must pass (100% pass rate required)
   - No skipped tests allowed in production
   - Review test coverage for new features
   - Fix any warnings or deprecations

3. **Review changes**: `git status` and `git diff`
   - Verify no unintended files included
   - Check for sensitive data or credentials
   - Ensure .env files are not staged
   - Confirm .copilot-instructions.md is gitignored

4. **Update documentation**:
   - CHANGELOG.md with version and features
   - Update version in package.json if needed
   - Document breaking changes
   - Update feature documentation

### Deployment Workflow:
- Every `git push` triggers automatic Vercel deployment
- Vercel runs its own build process
- Production deployment happens automatically on success
- No manual deployment steps required
- Preview deployments for PRs/branches

### If Build Fails:
1. DO NOT push until build succeeds locally
2. Fix all compilation errors
3. Ensure all tests pass
4. Re-run build to confirm
5. Only then proceed with git push

### Build Command: `npm run build`
### Test Command: `npm test`

**Remember**: A failed push means a failed production deployment. Always verify locally first.

---

## Git Commands & Terminal (Windows cmd.exe)

### Multi-line Git Commit Messages

**CRITICAL: Windows cmd.exe does NOT support multi-line commits with multiple -m flags**

**WRONG** (causes "pathspec did not match" errors):
```bash
git commit -m "Title" -m "Line 1" -m "Line 2" -m "Changes:" -m "- Item 1"
```

**CORRECT** - Single message with all content:
```bash
git commit -m "Title. Description with all details in one message. Changes: Enhanced feature X, added tests, fixed bug Y. Test Coverage: X/X tests passing"
```

### Common Terminal Errors Fixed:
1. **Multiple -m flags**: Combine into single -m with one long message
2. **Special characters**: Parentheses, colons, slashes in separate -m flags cause pathspec errors
3. **Windows quoting**: Use double quotes for all git messages

### Git Workflow Pattern:
```bash
git add [files]
git commit -m "type(scope): brief title. Full description here. Changes: list changes. Tests: X passing"
git push origin master
```

### Commit Message Format:
- **Type**: fix, feat, docs, style, refactor, test, chore
- **Scope**: critical, security, ui, api, db, etc.
- **Title**: Brief imperative statement (50 chars max)
- **Body**: Combined into title message with periods as separators
- **Include**: What changed, why, and test results

**Example**:
```bash
git commit -m "fix(critical): Extract generic names from parentheses and brackets in allergy detection. SAFETY FIX for Ansaid (flurbiprofen) not catching Flurbiprofen. Enhanced extractIngredients to handle both () and [] notation. Added 6 tests. 27/27 allergy tests passing, 159/159 total"
```

---

## Professional Standards

### General Guidelines
- **Professional tone**: This is healthcare software - maintain clarity and professionalism
- **No emojis in code**: Use descriptive text, badges, or icons instead
- **No emojis in documentation**: Use professional alternatives like `[REQUIRED]`, `[COMPLETE]`, `[IN PROGRESS]`
- **Minimal comments**: Code should be self-documenting with clear variable/function names
- **TypeScript strict mode**: Always use proper types, avoid `any` when possible

### UI/UX Standards
- **Replace emojis with professional alternatives**:
  - Warning icon → Use amber/red border + "Important:" text
  - Checkmark → Use badge with "Verified" or status indicators
  - Status indicators → Use colored badges or text labels
- **Industry-standard icons**: Use Heroicons, Lucide, or similar professional icon libraries
- **Accessible design**: Proper contrast, ARIA labels, semantic HTML
- **Medical context**: Remember users may not be tech-savvy or in stressful situations

### Component Structure
```typescript
// Preferred component structure
'use client'; // Only if needed

import { useState } from 'react'; // Group React imports first
import type { TypeName } from '@/types'; // Types on separate line
import { helperFunction } from '@/lib/helper'; // Project imports last

interface ComponentProps {
  // Define props with clear documentation
}

export default function Component({ prop }: ComponentProps) {
  // Component logic
}
```

---

## Architecture

### File Structure
- `/app` - Next.js 14 App Router pages
- `/components` - Reusable React components
- `/lib` - Business logic, API integrations, utilities
- `/types` - TypeScript type definitions
- `/contexts` - React context providers
- `/docs` - Comprehensive documentation

### Key Libraries
- **RxNav API** (`lib/rxnav.ts`) - Drug lookup, interactions, properties
- **Storage Layer** (`lib/storage/`) - Modular: supabase.ts, local.ts, migration.ts, index.ts
- **DUR Checks** (`lib/allergies.ts`, `lib/contraindications.ts`, `lib/interactions.ts`)
- **Supabase** - Authentication, database, Row Level Security

---

## Data Model

### Medication Interface
```typescript
interface Medication {
  id: string;
  name: string;
  quantity: string; // e.g., "30 tablets" - NOT dosage/strength
  frequency: string;
  notes?: string;
  rxcui?: string; // RxNorm Concept Unique Identifier
  verified?: boolean;
  isMaintenance?: boolean;
  therapeuticClass?: string;
  ingredients?: string;
  
  // Refill tracking
  refills_remaining?: number;
  total_refills?: number;
  last_fill_date?: string;
  next_refill_date?: string;
  last_pickup_date?: string;
  estimated_next_pickup?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}
```

**Important**: We removed the `dosage`/`strength` field because drug strength is included in the medication name from RxNav (e.g., "Lisinopril 10 MG Oral Tablet").

---

## Drug Safety Checks (DUR)

### Allergy Checking
- **File**: `lib/allergies.ts`
- **Two versions**:
  - `checkAllergyConflicts(medicationName: string, allergies: Allergy[])` - Synchronous, for tests
  - `checkAllergyConflictsAsync(medication: Medication, allergies: Allergy[])` - Async with RxNav API, for production
- **Features**: Direct matching, cross-reactivity (penicillins, NSAIDs, sulfa drugs)

### Contraindications
- **File**: `lib/contraindications.ts`
- **Two versions**: Sync for tests, async for production
- **Knowledge base**: `KNOWN_CONTRAINDICATIONS` object covers pregnancy, breastfeeding, kidney/liver disease, etc.
- **Severity levels**: `critical`, `major`, `moderate`, `minor`

### Drug Interactions
- **File**: `lib/interactions.ts`
- **Uses RxNav API**: Checks drug-drug interactions
- **Returns**: Interaction severity and descriptions

---

## Testing

### Test Structure
- Unit tests in `__tests__/lib/` for business logic
- Jest + React Testing Library
- Mock RxNav API calls in tests
- Tests use synchronous versions of check functions

### Running Tests
```bash
npm test                 # Run all tests
npm test -- allergies    # Run specific test file
npm test -- --coverage   # With coverage report
```

---

## RxNav API Integration

### Attribution Requirements
**CRITICAL**: The National Library of Medicine requires attribution for RxNav API usage.

- Include RxNav attribution in Footer component (already implemented)
- Link to Terms of Service and Attributions documents
- Display medical disclaimer prominently
- Non-commercial use only

### API Endpoints Used
```typescript
// Drug search
https://rxnav.nlm.nih.gov/REST/approximateTerm?term={query}

// Related concepts (ingredients, interactions)
https://rxnav.nlm.nih.gov/REST/rxcui/{rxcui}/allrelated

// Drug properties
https://rxnav.nlm.nih.gov/REST/rxcui/{rxcui}/property?propName={name}

// Interactions
https://rxnav.nlm.nih.gov/REST/interaction/list?rxcuis={rxcuis}
```

### Best Practices
- Implement client-side caching to reduce API calls
- Handle API errors gracefully (return empty arrays, not crashes)
- Rate limiting: Be respectful of public API
- No API key required (public access)

---

## Database (Supabase)

### Tables
- `medications` - User medications with refill tracking
- `allergies` - User allergies
- `health_conditions` - User medical conditions
- `user_profiles` - User preferences and settings

### Security
- **Row Level Security (RLS)** enabled on all tables
- Users can only access their own data
- `user_id` foreign key on all user-specific tables
- Authentication via Supabase Auth

### Migrations
- Located in `supabase/migrations/`
- Run via Supabase Dashboard SQL Editor
- Format: `YYYYMMDD_description.sql`
- Always include rollback instructions

---

## Common Tasks

### Adding a New Field to Medications
1. Update `types/index.ts` - Medication interface
2. Update `lib/storage/supabase.ts` - Add field to insert/update/select
3. Update `lib/storage/local.ts` - Add to localStorage operations
4. Create migration in `supabase/migrations/`
5. Update components that display medications
6. Update AddMedicationForm if user needs to input it

### Creating a New DUR Check
1. Create file in `lib/` (e.g., `lib/my-check.ts`)
2. Export sync version for tests
3. Export async version for production (if using API)
4. Add tests in `__tests__/lib/my-check.test.ts`
5. Import in AddMedicationForm and run check
6. Display warnings in UI with appropriate severity

### Adding New Documentation
1. Create markdown file in appropriate `docs/` subdirectory
2. Use professional tone, no emojis
3. Include "Last Updated" date at top
4. Update `docs/README.md` to link to new document
5. Follow existing document structure/templates

---

## Security Checklist

Before committing code:
- [ ] No API keys or secrets in code
- [ ] `.env.local` is in `.gitignore`
- [ ] RLS policies tested and working
- [ ] Input validation on all user inputs
- [ ] SQL injection prevention (use parameterized queries)
- [ ] XSS prevention (React handles most, but be careful with `dangerouslySetInnerHTML`)
- [ ] Medical disclaimer displayed where needed

---

## Documentation Standards

### Markdown Style
- Use `#`, `##`, `###` for headings (not underlines)
- Use `**bold**` for emphasis, not emojis
- Use code blocks with language tags: ` ```typescript `
- Use tables for structured data
- Include "Last Updated" date
- Sign with author/maintainer name

### Code Comments
- Function/component purpose at the top (JSDoc style)
- Complex business logic gets inline comments
- No obvious comments ("increment i" → no comment needed)
- Medical/regulatory context should be commented

### Status Indicators
Use text-based status indicators:
- `[COMPLETE]`, `[IN PROGRESS]`, `[PLANNED]`
- `[REQUIRED]` for mandatory items
- `CRITICAL`, `MAJOR`, `MODERATE`, `MINOR` for severity

---

## Common Patterns

### Error Handling
```typescript
try {
  const result = await apiCall();
  return result;
} catch (error) {
  console.error('Descriptive error message:', error);
  return []; // Return safe default, don't throw
}
```

### Async Components
```typescript
export default function Component() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleAction = async () => {
    try {
      setLoading(true);
      setError(null);
      await performAction();
    } catch (err) {
      setError('User-friendly error message');
    } finally {
      setLoading(false);
    }
  };
}
```

### Type Safety
```typescript
// Prefer this
interface Props {
  medication: Medication;
  onSubmit: (data: Medication) => void;
}

// Not this
interface Props {
  medication: any; // Avoid any
  onSubmit: (data: any) => void;
}
```

---

## Deployment

### Environment Variables
Required in production:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- (Never commit these to git)

### Build Process
```bash
npm run build   # Production build
npm run start   # Start production server
npm run dev     # Development server
```

### Pre-deployment Checklist
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Database migrations applied
- [ ] Environment variables set
- [ ] Legal documents up to date (Terms, Attributions)
- [ ] Footer with RxNav attribution present

---

## Contact & Resources

- **Repository**: https://github.com/aaroncapron/ClariMed
- **RxNav API**: https://lhncbc.nlm.nih.gov/RxNav/APIs/
- **Supabase Docs**: https://supabase.com/docs
- **Documentation**: See `docs/` directory

**Maintainer**: Aaron Capron

---

**Last Updated**: November 11, 2025
