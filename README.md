# ClariMed 

Simple, secure medication tracking with smart autocomplete and verification.

[![Version](https://img.shields.io/badge/version-0.9.0-blue.svg)](https://github.com/aaroncapron/ClariMed)
[![License](https://img.shields.io/badge/license-TBD-lightgrey.svg)](LICENSE)

---

## Important Disclaimers

### Medical Disclaimer
**This application is for educational and informational purposes only. It is NOT intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding medications or medical conditions.**

### RxNav Data Attribution
This application uses drug information from **RxNav**, provided by the U.S. National Library of Medicine (NLM), National Institutes of Health (NIH). Per NLM's terms:

> The National Library of Medicine (NLM) licenses use of RxNav drug information **solely for non-commercial purposes**. RxNav drug information is derived from NLM's RxNorm, MED-RT, and RxTerms, and may also include information from First Databank, Inc.

**[View Full Terms of Service](docs/TERMS-OF-SERVICE.md)**  
**[View Attributions](docs/ATTRIBUTIONS.md)**

---

## Features

-  **Secure authentication** with Supabase
-  **Smart medication tracking** with RxNav API integration
-  **Allergy tracking** with medication conflict warnings
-  **Drug class cross-reactivity** checking for safety
-  **Intelligent autocomplete** with brand/generic drug search
-  **Maintenance medication detection**
-  **Refill tracking** with low refill warnings
-  **Dual-mode interface** (Clarity vs Clinical views)
-  **Verified badges** for API-validated medications

---

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase URL and API key

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Authentication
- **API:** NIH RxNav for medication data

---

## Documentation

**[Complete Documentation](docs/)** - Full documentation index

### Legal & Compliance
- **[Terms of Service](docs/TERMS-OF-SERVICE.md)** - Usage terms and medical disclaimers
- **[Attributions](docs/ATTRIBUTIONS.md)** - Third-party services and data sources
- [Security Checklist](docs/SECURITY-CHECKLIST.md) - Security best practices

### Quick Links
- [Features Overview](docs/FEATURES.md) - What ClariMed can do
- [Quick Start Guide](docs/guides/QUICK-START.md) - Get up and running
- [Supabase Setup](docs/guides/SUPABASE-SETUP.md) - Database configuration
- [Changelog](docs/CHANGELOG.md) - Version history and updates

### Documentation Categories
- **[Guides](docs/guides/)** - Setup instructions and API documentation
- **[Features](docs/features/)** - Detailed feature specifications
- **[Testing](docs/testing/)** - Test checklists and procedures

---

## Roadmap

**v0.6.x** [COMPLETE] - Authentication and user profiles  
**v0.7.x** [COMPLETE] - Allergy tracking and health conditions  
**v0.8.x** [COMPLETE] - Refill tracking and contraindication checking  
**v0.9.x** [IN PROGRESS] - Surgical refactor (authentication-only, removed interactions/migration)  
**v1.0.x** - Prescription savings coupons  
**v1.1.x** - Medication reminders and notifications  
**v1.2.x** - Production release with PWA support

See [CHANGELOG.md](docs/CHANGELOG.md) for detailed version history.

---

## License

TBD - Currently private/personal use

---

**Built for medication clarity**