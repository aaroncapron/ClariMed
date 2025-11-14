# Testing Documentation

This directory contains comprehensive test documentation and checklists for ClariMed.

## Automated Testing

### Jest Test Suite
**Framework:** Jest 29.7.0 with React Testing Library  
**Coverage Thresholds:** 70% (branches, functions, lines, statements)  
**Status:** ✅ 41/41 tests passing

**Test Coverage:**
- `__tests__/lib/maintenance.test.ts` - Maintenance medication detection
- `__tests__/lib/allergies.test.ts` - Allergy conflict checking
- `__tests__/lib/rxnav.test.ts` - RxNav API integration
- `__tests__/contexts/ViewModeContext.test.tsx` - View mode persistence

**Running Tests:**
```bash
npm test              # Run tests in watch mode
npm run test:ci       # Run tests once (for CI/CD)
npm run test:coverage # Run with coverage report
```

**Key Features:**
- Automated localStorage mocking for browser API testing
- React component testing with React Testing Library
- Coverage reporting for code quality metrics
- Excludes archived code from test runs

---

## Manual Testing

## Test Documents

### [AUTH-TESTING-CHECKLIST.md](./AUTH-TESTING-CHECKLIST.md)
**Version:** v0.6.0  
**Status:** ✅ All tests passed  
**Tested By:** Aaron Capron  
**Date:** October 23, 2025

Comprehensive authentication testing covering:
- Sign up and email verification flows
- Login and logout functionality
- Password reset and update flows
- Profile management
- Error handling and validation
- Security (RLS, session persistence)
- UI/UX (responsive design, form validation)
- Database integrity

**Total Tests:** 20 | **Passed:** 20

---

## Testing Guidelines

### Before Running Tests
1. Ensure all database migrations are applied
2. Have dev server running (`npm run dev`)
3. Clear browser data or use incognito mode for clean tests
4. Enable console pasting if needed (type `allow pasting`)

### Test Principles
- **Comprehensive:** Cover happy paths, edge cases, and error scenarios
- **Isolated:** Each test should be independent
- **Reproducible:** Tests should produce consistent results
- **Documented:** Clear steps, expected results, and actual outcomes

### Sign-Off Process
All tests must be:
1. Executed according to documented steps
2. Results verified against expected outcomes
3. Database state validated where applicable
4. Signed off by developer with date

---

## Test Status Summary

| Test Type | Feature | Version | Tests | Status | Date |
|-----------|---------|---------|-------|--------|------|
| Automated | Core Libraries | v0.7.0 | 41/41 | ✅ PASS | Oct 28, 2025 |
| Manual | Authentication | v0.6.0 | 20/20 | ✅ PASS | Oct 23, 2025 |

---

**Last Updated:** October 28, 2025  
**Maintained By:** Aaron Capron
