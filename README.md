# ClariMed 

Simple, secure medication tracking with smart autocomplete and verification.

[![Version](https://img.shields.io/badge/version-0.6.0-blue.svg)](https://github.com/aaroncapron/ClariMed)
[![License](https://img.shields.io/badge/license-TBD-lightgrey.svg)](LICENSE)

---

## Features

-  **Secure authentication** with Supabase
-  **Smart medication tracking** with RxNav API integration
-  **Intelligent autocomplete** with brand/generic drug search
-  **Maintenance medication detection**
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

- [Features Overview](docs/FEATURES.md)
- [Supabase Setup Guide](docs/SUPABASE-SETUP.md)
- [Security Checklist](docs/SECURITY-CHECKLIST.md)
- [Development Progress](docs/DEVELOPMENT-PROGRESS.md)

---

## Roadmap

**v0.6.x** ✅ - Authentication and data migration (COMPLETE)  
**v0.7.x** 🔄 - User profiles and allergy tracking (IN PROGRESS)  
**v0.8.x** - Prescription savings coupons (GoodRx, SingleCare, MySimpleRX)  
**v0.9.x** - Multi-device sync and pet profiles  
**v1.0.x** - Medication reminders and notifications  
**v1.1.x** - Production release with PWA support

See [DEVELOPMENT-PROGRESS.md](docs/DEVELOPMENT-PROGRESS.md) for details.

---

## License

TBD - Currently private/personal use

---

**Built for medication clarity**