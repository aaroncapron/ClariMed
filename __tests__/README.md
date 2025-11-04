# Testing Guide

## Setup

Install testing dependencies:

```bash
npm install
```

## Running Tests

```bash
# Run tests in watch mode (development)
npm test

# Run all tests once
npm run test:ci

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

```
__tests__/
├── lib/                    # Business logic tests
│   ├── maintenance.test.ts # Maintenance medication detection
│   ├── allergies.test.ts   # Allergy conflict checking
│   └── rxnav.test.ts       # RxNav API integration
├── contexts/               # React context tests
│   └── ViewModeContext.test.tsx
└── components/             # Component tests
    └── (future component tests)
```

## Coverage Requirements

Minimum coverage thresholds:
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

## Writing Tests

### Unit Tests (lib/)
Test business logic functions in isolation:
```typescript
import { functionName } from '@/lib/module';

describe('Module Name', () => {
  it('should handle expected input', () => {
    const result = functionName('input');
    expect(result).toBe('expected');
  });
});
```

### Context Tests
Test React context providers:
```typescript
import { renderHook } from '@testing-library/react';
import { Provider, useHook } from '@/contexts/Context';

it('should provide expected value', () => {
  const { result } = renderHook(() => useHook(), {
    wrapper: Provider,
  });
  expect(result.current.value).toBe('expected');
});
```

### Component Tests
Test React components:
```typescript
import { render, screen } from '@testing-library/react';
import Component from '@/components/Component';

it('should render correctly', () => {
  render(<Component />);
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});
```

## Continuous Integration

Tests run automatically in CI/CD pipeline before deployment.
All tests must pass before merging to main branch.
