# ClariMed Features

**Detailed documentation of all features and capabilities.**

---

## Current Features (v0.8.0)

### Medication Management

#### Add & Edit Medications
- **Form fields**: Name, dosage, frequency, notes
- **Smart validation**: Required fields, dosage format checking
- **Edit mode**: Click edit button, form auto-fills, seamless updates
- **Auto-scroll**: Automatically scrolls to edit form when editing

#### RxNav Smart Autocomplete
ClariMed integrates with NIH's RxNav API for intelligent medication lookup:

**Drug Types**:
- Generic drugs (SCD - Semantic Clinical Drug)
- Brand names (SBD - Semantic Branded Drug)

**Search Features**:
- **Hybrid search**: Primary exact match, falls back to `approximateTerm` for partial matches
  - Example: "lisin" finds "lisinopril"
- **Smart sorting**:
  1. Tablets → Capsules → Liquids (by form)
  2. Generic before Brand
  3. Lowest to highest dosage
- **Clean formatting**: Brand names show as "Prinivil (lisinopril) 10 MG" instead of "lisinopril 10 MG [Prinivil]"
- **Deduplication**: Removes duplicate packages/manufacturers, shows one per formulation
- **Fast response**: 150ms debounce for responsive autocomplete
- **Auto-fill dosage**: Extracts dosage from drug name automatically
- **RxCUI storage**: Stores RxCUI codes for medication identification
- **✓ Verified badge**: Shows on API-validated medications

#### Maintenance Medication Detection
Automatic detection of long-term maintenance medications:

**Detection Categories**:
- ACE Inhibitors (lisinopril, enalapril, etc.)
- ARBs (losartan, valsartan, etc.)
- Beta Blockers (metoprolol, atenolol, etc.)
- Calcium Channel Blockers (amlodipine, diltiazem, etc.)
- Statins (atorvastatin, simvastatin, etc.)
- Diabetes medications (metformin, glipizide, insulin)
- Thyroid medications (levothyroxine)
- Anticoagulants (warfarin, apixaban, etc.)
- Antidepressants (sertraline, escitalopram, etc.)
- And more...

**Features**:
- **Smart auto-detection**: Based on drug class and common names
- **User override**: Can manually mark/unmark any medication
- **Navy blue badge**: "Maintenance" indicator in Clinical mode
- **Helpful explanations**: Shows why it's maintenance (e.g., "Blood pressure medication - ACE inhibitor")

#### Display Modes: Clarity vs Clinical

**Clarity Mode** (Teal):
- Simple, minimal interface
- Essential information only
- Perfect for everyday users
- Clean, uncluttered design

**Clinical Mode** (Navy):
- Detailed medical information
- All fields visible
- Maintenance badges shown
- Notes and frequency displayed
- Ideal for healthcare professionals or power users

**Toggle Features**:
- Floating button (bottom-right corner)
- One-click switching
- User preference stored in database
- Smooth transitions

#### Search & Filter
- **Real-time search**: Instant results as you type
- **Multi-field search**: Searches name, dosage, frequency, and notes
- **Case-insensitive**: Finds matches regardless of capitalization
- **Highlight matches**: (planned)

#### Medication List Display
- **Beautiful cards**: Professional card design with proper spacing
- **Clear hierarchy**: Important info prominent, secondary info subtle
- **Status badges**: Verified, Maintenance indicators
- **Empty states**: Helpful messages for empty list or no search results
- **Responsive layout**: Adapts to screen size

#### Data Persistence
- **Supabase**: PostgreSQL database with Row Level Security
- **Supabase**: Cloud storage (in progress)
- **Automatic sync**: Multi-device support (coming soon)

---

## Safety Features (v0.8.0)

### Allergy Management
- **Complete allergy tracking**: Add, edit, delete allergies
- **Severity levels**: Mild, moderate, severe, anaphylaxis
- **Reaction documentation**: Describe symptoms for each allergy
- **RxNav allergen search**: Autocomplete for accurate allergen names
- **Profile integration**: Manage allergies from profile page

### Allergy Conflict Detection
- **Automatic checking**: Scans new medications against recorded allergies
- **RxNav API integration**: Uses NIH's RxNav API for intelligent cross-reactivity detection
- **Dynamic drug class matching**: Identifies related drug classes and ingredients automatically
- **Supported drug classes**:
  - Penicillins and cephalosporins
  - Sulfa drugs
  - NSAIDs (including aspirin)
  - Statins
  - Macrolides
  - And many more via API
- **Real-time warnings**: Alert before adding conflicting medication
- **Intelligent matching**: Uses RxCUI codes and ingredient analysis for accurate detection

### Drug Utilization Review (DUR)
**Important Disclaimer**: This system provides educational information only. Always consult your healthcare provider about potential medication issues.

**Allergy Detection**:
- Cross-reactivity checking (e.g., penicillin allergies)
- Ingredient-level matching
- Real-time warnings before adding medications
- Severity classification: Critical, Major, Moderate, Minor

**Contraindication Checking**:
- Health condition-based warnings
- Pregnancy contraindications (23+ medication classes)
- Kidney/liver disease alerts
- Respiratory condition warnings (asthma, COPD)
- Cardiovascular warnings (arrhythmia, Long QT)
- And more via medical knowledge base

**User Experience**:
- Color-coded warnings with severity indicators
- Detailed descriptions of potential issues
- Non-blocking: users maintain full control
- Educational disclaimers throughout

**FDA Compliance**:
- Informational tool only, not medical advice
- Does not diagnose, treat, or prevent conditions
- Does not recommend or prescribe medications
- User responsibility to verify with healthcare professionals
- Not classified as a medical device

---

## Authentication & Security (v0.6.0)

### User Authentication
- **Email/password signup**: Secure account creation
- **Email verification**: Confirms user email addresses
- **Login**: Session-based authentication
- **Password reset**: Secure password recovery flow
- **Logout**: Clean session termination

### Database Security
- **Row Level Security (RLS)**: Users can only access their own data
- **Encrypted storage**: All data encrypted at rest
- **Secure connections**: HTTPS-only, encrypted in transit
- **Session management**: Secure cookie-based sessions

### Pages & Routing
- **Landing page**: Welcome page for unauthenticated users
- **Auth pages**: Signup, login, verify email, password reset
- **Dashboard**: Protected medication management interface
- **Auth callback**: Handles email verification and OAuth flows
- **Protected routes**: Automatic redirects based on auth state

---

## Planned Features

### v0.7.x - Multi-User & Sync
- **Pet profiles**: Track medications for pets
- **Family members**: Manage medications for multiple people
- **Multi-device sync**: Real-time sync across devices

### v0.8.x - Cost Savings
- **MySimpleRX integration**: Find discount coupons
- **GoodRx comparison**: Compare pharmacy prices
- **Prescription savings**: Automatic coupon discovery
- **Generic alternatives**: Suggest cost-effective options

### v0.9.x - Reminders & Notifications
- **Message center**: In-app notification system
- **Refill tracking**: Track when to refill prescriptions
- **Medication reminders**: Daily/scheduled reminders
- **Push notifications**: Mobile notifications (PWA)

### v1.0.x - Production Release
- **PDF export**: Print medication list for doctors
- **OTC tracking**: Over-the-counter medications
- **Supplement tracking**: Vitamins and supplements
- **Sorting**: Sort by name, date, dosage, status
- **Advanced filtering**: Filter by maintenance, verified, etc.
- **PWA capabilities**: Offline support, installable app
- **Mobile optimization**: Touch-friendly interface

---

## Design System

### Color Palette
- **Primary (Teal)**: `#14b8a6` - Clarity mode, main actions
- **Secondary (Navy)**: `#1e3a8a` - Clinical mode, maintenance badges
- **Success (Green)**: `#10b981` - Verified badges, success states
- **Danger (Red)**: `#ef4444` - Delete actions, errors
- **Neutral (Gray)**: Various shades for text and backgrounds

### Typography
- **Headings**: Bold, clear hierarchy
- **Body text**: Readable, 16px base
- **Labels**: Medium weight, descriptive
- **Badges**: Small, uppercase, prominent

### Components
- **Buttons**: Large, obvious, with hover effects
- **Cards**: White background, subtle shadow, rounded corners
- **Forms**: Clear labels, helpful placeholders, inline validation
- **Badges**: Colored pills with icons
- **Toggle**: Floating action button with mode indicator

---

## Technical Details

### Data Models

#### Medication
```typescript
interface Medication {
  id: string;                    // UUID
  name: string;                  // Drug name
  dosage?: string;               // e.g., "10 MG"
  frequency?: string;            // e.g., "Once daily"
  notes?: string;                // Additional information
  isMaintenance?: boolean;       // Maintenance medication flag
  maintenanceReason?: string;    // Why it's maintenance
  rxcui?: string;                // RxNav identifier
  isVerified?: boolean;          // API-validated
  createdAt?: Date;              // Creation timestamp
  updatedAt?: Date;              // Last update timestamp
}
```

#### User Profile
```typescript
interface UserProfile {
  id: string;                    // UUID (matches auth.users.id)
  email: string;                 // User email
  full_name?: string;            // Display name
  allergies?: string[];          // Known allergies
  created_at: Date;              // Account creation
  updated_at: Date;              // Last profile update
}
```

### API Integrations

#### RxNav API (NIH)
- **Base URL**: `https://rxnav.nlm.nih.gov/REST/`
- **Endpoints used**:
  - `/drugs.json` - Exact name search
  - `/approximateTerm.json` - Fuzzy search
- **Rate limits**: None specified
- **Response format**: JSON
- **Documentation**: [RxNav API Guide](RXNAV-API-GUIDE.md)

#### Supabase
- **Authentication**: Email/password, OAuth (planned)
- **Database**: PostgreSQL with RLS
- **Storage**: Future file uploads (images, PDFs)
- **Realtime**: Future multi-device sync

---

**Last Updated:** November 11, 2025 • **Version:** 0.8.0
