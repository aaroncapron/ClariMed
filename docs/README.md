# ClariMed Documentation

**Last Updated:** November 11, 2025  
**Maintained By:** Aaron Capron

---

## Quick Links

### Legal & Compliance
- **[Terms of Service](./TERMS-OF-SERVICE.md)** - Usage terms and medical disclaimers [REQUIRED]
- **[Attributions](./ATTRIBUTIONS.md)** - Third-party services and data sources (RxNav, etc.)
- [Security Checklist](./SECURITY-CHECKLIST.md) - Security best practices and requirements

### Core Documentation
- [Project Vision](./PROJECT-VISION.md) - Mission, goals, and long-term vision
- [Development Progress](./DEVELOPMENT-PROGRESS.md) - Current roadmap and completion status
- [Changelog](./CHANGELOG.md) - Version history and release notes
- [Glossary](./GLOSSARY.md) - Terms and definitions
- [How It Works](./HOW-IT-WORKS.md) - Technical architecture overview

### For Developers
- [Guides](./guides/) - Setup guides, API documentation, quick starts

### For Testing
- [Testing Documentation](./testing/) - Test checklists and procedures

### Features
- [Features Overview](./FEATURES.md) - Complete feature list
- [Feature Specifications](./features/) - Detailed feature documentation

---

## Documentation Structure

```
docs/
├── README.md (this file)
├── ATTRIBUTIONS.md (Required - Third-party data sources)
├── TERMS-OF-SERVICE.md (Required - Legal terms)
├── CHANGELOG.md
├── DEVELOPMENT-PROGRESS.md
├── FEATURES.md
├── GLOSSARY.md
├── HOW-IT-WORKS.md
├── PROJECT-VISION.md
├── SECURITY-CHECKLIST.md
├── SESSION-AUTH-COMPLETE.md
│
├── features/
│   ├── FEATURE-AUTHENTICATION.md
│   ├── FEATURE-MAINTENANCE-MEDS.md
│   ├── FEATURE-PRESCRIPTION-COUPONS.md
│   └── FEATURE-SMART-AUTOCOMPLETE.md
│
├── guides/
│   ├── QUICK-START.md
│   ├── RXNAV-API-GUIDE.md
│   ├── SUPABASE-SETUP.md
│   └── USER-GUIDE.md
│
└── testing/
    ├── README.md
    ├── AUTH-TESTING-CHECKLIST.md
    └── MIGRATION-TESTING-GUIDE.md
```

---

## Document Categories

### Planning & Vision
Documents that define the project's direction and goals.
- **PROJECT-VISION.md** - What we're building and why
- **DEVELOPMENT-PROGRESS.md** - Roadmap with phases and milestones

### Technical Specifications
Detailed technical information for developers.
- **HOW-IT-WORKS.md** - System architecture
- **SECURITY-CHECKLIST.md** - Security requirements
- **features/** - Individual feature specifications

### User Documentation
Information for end users.
- **FEATURES.md** - What the app can do
- **USER-GUIDE.md** - How to use the app
- **GLOSSARY.md** - Terms and definitions

### Developer Guides
Setup instructions and API documentation.
- **guides/QUICK-START.md** - Get started quickly
- **guides/SUPABASE-SETUP.md** - Database setup
- **guides/RXNAV-API-GUIDE.md** - RxNav API integration

### Testing
Test procedures and checklists.
- **testing/AUTH-TESTING-CHECKLIST.md** - Authentication tests
- **testing/MIGRATION-TESTING-GUIDE.md** - Data migration tests

### Change Management
Tracking changes and completion.
- **CHANGELOG.md** - Version history
- **SESSION-AUTH-COMPLETE.md** - Completion summaries

---

## Getting Started

### For New Developers
1. Read [PROJECT-VISION.md](./PROJECT-VISION.md) to understand the mission
2. Follow [guides/QUICK-START.md](./guides/QUICK-START.md) to set up your dev environment
3. Complete [guides/SUPABASE-SETUP.md](./guides/SUPABASE-SETUP.md) for database setup
4. Review [SECURITY-CHECKLIST.md](./SECURITY-CHECKLIST.md) before committing code
5. Check [DEVELOPMENT-PROGRESS.md](./DEVELOPMENT-PROGRESS.md) to see what's next

### For Testers
1. Visit [testing/](./testing/) directory
2. Follow test checklists in order
3. Report results to development team

### For Users
1. Read [FEATURES.md](./FEATURES.md) to learn what the app can do
2. Follow [guides/USER-GUIDE.md](./guides/USER-GUIDE.md) for usage instructions

---

## Contributing to Documentation

### Style Guidelines
- **Professional tone** - Clear, concise, technical
- **Minimal emojis** - Use sparingly for major sections only
- **Code formatting** - Use proper markdown code blocks
- **Links** - Use relative links between docs
- **Dates** - Include "Last Updated" dates
- **Sign-offs** - Include author/maintainer name

### Document Templates

**Feature Specification:**
```markdown
# Feature: [Feature Name]

**Status:** [In Development | Complete | Planned]  
**Version:** v0.x.x  
**Last Updated:** [Date]

## Overview
[Brief description]

## Requirements
[List of requirements]

## Technical Implementation
[Implementation details]

## Testing
[Test procedures]
```

**Guide:**
```markdown
# [Guide Name]

**Last Updated:** [Date]

## Purpose
[What this guide covers]

## Prerequisites
[What you need before starting]

## Steps
[Step-by-step instructions]

## Troubleshooting
[Common issues and solutions]
```

---

## Maintenance

### Regular Updates
- Update CHANGELOG.md with each release
- Update DEVELOPMENT-PROGRESS.md when completing phases
- Review and update feature specifications when implementing changes
- Keep test checklists current with new features

### Version Control
- All documentation is version controlled in git
- Follow same commit practices as code
- Include doc updates in relevant feature branches

---

**Questions?** Contact Aaron Capron or open an issue in the repository.
