# 💰 Feature: Prescription Coupon Finder

**Status:** 📋 Planned (Future Phase)  
**Priority:** High - Patient Value Feature  
**Complexity:** Medium-High  
**Last Updated:** October 14, 2025

---

## 🎯 Vision

**"Help patients find the best prescription coupon at their preferred pharmacy - like Walgreens Savings Finder, but for any pharmacy near them."**

Enable patients to find and compare prescription discount coupons across multiple pharmacies based on their location or preferred pharmacy. This feature is especially valuable for:
- Patients whose insurance isn't providing adequate coverage
- Uninsured patients seeking affordable medication options
- Anyone looking to reduce out-of-pocket medication costs

---

## 💡 Core Concept

### The Problem
- Patients often don't know discount coupons exist for their medications
- Different pharmacies have different prices for the same medication
- Insurance co-pays are sometimes higher than discount coupon prices
- Finding coupons manually is time-consuming and confusing
- Patients may not know which pharmacy offers the best price

### The Solution
ClariMed integrates coupon finding directly into the medication management workflow:
1. User adds/views their medication
2. System searches for available coupons at nearby pharmacies
3. User can filter by their preferred pharmacy (Walgreens, CVS, Walmart, etc.)
4. Display savings comparison: insurance co-pay vs. coupon price
5. One-click access to coupon (digital card, printable, or SMS)

---

## 🎨 User Experience Flow

### Scenario 1: Adding a New Medication
```
1. User adds "Lisinopril 10mg"
2. System auto-detects available coupons
3. Badge appears: "💰 Coupons Available - Save up to $15"
4. User clicks badge → sees coupon options by pharmacy
5. User selects preferred pharmacy → gets coupon instantly
```

### Scenario 2: Viewing Existing Medications
```
1. User views medication list
2. Medications with available coupons show "💰" icon
3. User clicks "Find Coupons" button on medication card
4. Modal/page shows:
   - Nearby pharmacies with prices
   - Coupon savings amount
   - Insurance price comparison (if available)
   - Filter by pharmacy chain
   - Sort by: price, distance, savings
```

### Scenario 3: Preferred Pharmacy Selection
```
1. User sets preferred pharmacy in profile settings
   - Select by chain (Walgreens, CVS, Walmart, etc.)
   - OR select specific location by address/zip code
2. All coupon searches prioritize this pharmacy
3. "Best Price at Your Pharmacy" badge when available
```

---

## 🛠️ Technical Implementation

### Data Sources & APIs

#### Option 1: GoodRx API (Most Popular)
- **Pros:** 
  - Most comprehensive coupon database
  - Price comparison across pharmacies
  - Location-based search
  - Digital coupon delivery
- **Cons:** 
  - May require commercial partnership
  - Rate limits/costs TBD
- **API Docs:** https://www.goodrx.com/developer

#### Option 2: SingleCare API
- **Pros:**
  - Free for patients
  - Pharmacy network integration
  - Digital coupons
- **Cons:**
  - Smaller network than GoodRx
- **API Docs:** Requires partnership inquiry

#### Option 3: RxSaver by RetailMeNot
- **Pros:**
  - Consumer-friendly brand
  - Free coupons
  - Pharmacy chain partnerships
- **Cons:**
  - API access unclear
- **Website:** https://www.rxsaver.com/

#### Option 4: Prescription Hope / NeedyMeds
- **Pros:**
  - Focus on uninsured/underinsured
  - Patient assistance programs
  - Free resource databases
- **Cons:**
  - Not real-time pricing
  - More manual process
- **Website:** https://www.needymeds.org/

#### Hybrid Approach (Recommended)
- **Primary:** Partner with GoodRx or SingleCare for real-time pricing
- **Secondary:** Integrate NeedyMeds for patient assistance programs
- **Fallback:** Direct pharmacy price estimation using NDC codes

### Required Data
```typescript
interface PrescriptionCoupon {
  id: string;
  medicationRxCui: string;        // Link to medication
  medicationName: string;         // "Lisinopril 10mg"
  ndcCode?: string;               // National Drug Code (for precise matching)
  
  // Pharmacy Information
  pharmacyChain: string;          // "Walgreens", "CVS", "Walmart"
  pharmacyLocation?: {
    name: string;                 // "Walgreens #12345"
    address: string;
    city: string;
    state: string;
    zipCode: string;
    distance?: number;            // Miles from user
    latitude: number;
    longitude: number;
  };
  
  // Pricing
  retailPrice: number;            // Full price without insurance/coupon
  couponPrice: number;            // Price with coupon
  savings: number;                // Calculated savings
  insuranceEstimate?: number;     // If user provides insurance info
  
  // Coupon Details
  couponProvider: string;         // "GoodRx", "SingleCare"
  couponCode?: string;            // Alphanumeric code
  couponUrl: string;              // Direct link to coupon
  barcodeUrl?: string;            // Digital barcode image
  expirationDate?: string;        // Coupon expiration (if applicable)
  
  // Metadata
  lastUpdated: string;            // Price freshness
  quantity: number;               // Pills per prescription (30, 90, etc.)
  source: string;                 // API source attribution
}

interface PharmacyPreference {
  userId: string;
  preferredChain?: string;        // "Walgreens", "CVS", etc.
  preferredLocation?: {
    name: string;
    address: string;
    zipCode: string;
  };
  searchRadius: number;           // Miles (default: 10)
  sortBy: 'price' | 'distance' | 'savings';
}
```

### API Integration Strategy
```typescript
// lib/coupons.ts

export async function searchCoupons(
  medication: Medication,
  userLocation: { zipCode: string },
  preferences?: PharmacyPreference
): Promise<PrescriptionCoupon[]> {
  // 1. Validate medication has RxCUI or NDC
  if (!medication.rxcui && !medication.ndcCode) {
    throw new Error('Medication must have RxCUI or NDC for coupon search');
  }
  
  // 2. Call coupon API (e.g., GoodRx)
  const response = await fetch(
    `https://api.goodrx.com/v1/prices?rxcui=${medication.rxcui}&location=${userLocation.zipCode}`
  );
  
  // 3. Parse and transform results
  const coupons = await response.json();
  
  // 4. Filter by preferred pharmacy if set
  if (preferences?.preferredChain) {
    return coupons.filter(c => c.pharmacyChain === preferences.preferredChain);
  }
  
  // 5. Sort by user preference
  return sortCoupons(coupons, preferences?.sortBy || 'savings');
}

export function calculateSavings(
  retailPrice: number,
  couponPrice: number
): { amount: number; percentage: number } {
  const amount = retailPrice - couponPrice;
  const percentage = (amount / retailPrice) * 100;
  return { amount, percentage };
}

export async function getCouponBarcode(couponId: string): Promise<string> {
  // Generate or fetch barcode image URL for digital coupon
  // Return base64 or URL
}
```

### UI Components

#### CouponBadge Component
```tsx
// components/CouponBadge.tsx
interface CouponBadgeProps {
  medicationId: string;
  maxSavings?: number;
  onClick: () => void;
}

export function CouponBadge({ medicationId, maxSavings, onClick }: CouponBadgeProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full hover:bg-green-100 transition"
    >
      <span className="text-xl">💰</span>
      <span className="text-sm font-medium text-green-700">
        {maxSavings ? `Save up to $${maxSavings}` : 'Coupons Available'}
      </span>
    </button>
  );
}
```

#### CouponFinder Component
```tsx
// components/CouponFinder.tsx
export function CouponFinder({ medication, userLocation }: Props) {
  const [coupons, setCoupons] = useState<PrescriptionCoupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<string | null>(null);
  
  // Search logic, filters, sorting
  
  return (
    <div className="space-y-4">
      {/* Filter by Pharmacy Chain */}
      <PharmacyFilter 
        selected={selectedPharmacy}
        onSelect={setSelectedPharmacy}
      />
      
      {/* Coupon Results */}
      <div className="grid gap-4">
        {coupons.map(coupon => (
          <CouponCard 
            key={coupon.id}
            coupon={coupon}
            medication={medication}
          />
        ))}
      </div>
    </div>
  );
}
```

#### CouponCard Component
```tsx
// components/CouponCard.tsx
export function CouponCard({ coupon, medication }: Props) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition">
      {/* Pharmacy Info */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg">{coupon.pharmacyChain}</h3>
          {coupon.pharmacyLocation && (
            <p className="text-sm text-gray-600">
              {coupon.pharmacyLocation.distance} miles away
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-600">
            ${coupon.couponPrice.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 line-through">
            ${coupon.retailPrice.toFixed(2)}
          </p>
        </div>
      </div>
      
      {/* Savings Badge */}
      <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-3">
        <p className="text-sm font-medium text-green-700">
          💰 Save ${coupon.savings.toFixed(2)} 
          ({((coupon.savings / coupon.retailPrice) * 100).toFixed(0)}% off)
        </p>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-2">
        <button className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Get Coupon
        </button>
        <button className="px-4 border border-gray-300 rounded hover:bg-gray-50">
          📍 Directions
        </button>
      </div>
      
      {/* Coupon Provider */}
      <p className="text-xs text-gray-500 mt-2">
        Powered by {coupon.couponProvider}
      </p>
    </div>
  );
}
```

---

## 📊 User Settings & Preferences

### Pharmacy Preferences Screen
```tsx
// Settings page addition
interface PharmacySettings {
  preferredChain?: string;          // "Walgreens", "CVS", "Walmart", etc.
  preferredLocation?: string;       // Specific store
  autoSearchCoupons: boolean;       // Auto-search when adding meds
  showCouponBadges: boolean;        // Show badges on med cards
  searchRadius: number;             // Miles (default: 10)
  sortBy: 'price' | 'distance' | 'savings';
  includeMailOrder: boolean;        // Include mail-order pharmacies
}
```

### Location Input Options
1. **ZIP Code** (simplest, most privacy-friendly)
2. **City/State** (broader search)
3. **GPS Coordinates** (most accurate, requires permission)
4. **Saved Addresses** (home, work, etc.)

---

## 🎯 Feature Phases

### Phase 1: Basic Coupon Search (MVP)
- ✅ Integrate one coupon API (GoodRx or SingleCare)
- ✅ Search by ZIP code + medication RxCUI
- ✅ Display list of coupons with prices
- ✅ Basic filtering by pharmacy chain
- ✅ "Get Coupon" button opens provider website

### Phase 2: Enhanced User Experience
- ✅ Add coupon badges to medication cards
- ✅ Save preferred pharmacy in user settings
- ✅ Price comparison view (retail vs coupon)
- ✅ Sort by price, distance, or savings
- ✅ Show savings percentage and amount
- ✅ Location-based pharmacy distances

### Phase 3: Advanced Features
- ✅ Insurance price comparison (user inputs co-pay)
- ✅ Digital coupon delivery (barcode, SMS, email)
- ✅ Price alerts (notify when price drops)
- ✅ Multi-medication search (total savings across all meds)
- ✅ Mail-order pharmacy options
- ✅ Patient assistance program integration (NeedyMeds)

### Phase 4: Optimization & Personalization
- ✅ Smart recommendations ("Switch to Walmart and save $45/month")
- ✅ Historical price tracking
- ✅ Auto-apply best coupon at pharmacy (API integration)
- ✅ Refill reminders with price updates
- ✅ Shareable coupons (family members)

---

## 🔒 Privacy & Compliance Considerations

### User Data
- **Location Data:** Use ZIP code by default (less invasive than GPS)
- **Medication Data:** Never share with third parties without consent
- **Search History:** Store locally, offer opt-in for cloud sync
- **Anonymous Searches:** Allow coupon searches without account

### Legal Requirements
- **Disclaimer:** "Prices shown are estimates. Verify with pharmacy before purchase."
- **Attribution:** Clearly credit coupon providers (GoodRx, SingleCare, etc.)
- **HIPAA Compliance:** Ensure no PHI is shared with coupon APIs
- **Terms of Service:** Review partner API terms for commercial use

### API Data Usage
- **Rate Limiting:** Cache coupon results (refresh every 24 hours)
- **Local Storage:** Store recent searches to reduce API calls
- **Fallback:** If API is down, provide general info + links to coupon websites

---

## 💰 Business Model Considerations

### Revenue Streams (Future)
1. **Affiliate Commissions:** Earn referral fees from coupon providers
2. **Premium Features:** Advanced price alerts, multi-medication optimization
3. **Pharmacy Partnerships:** Featured placement for pharmacies
4. **White-Label Licensing:** Offer ClariMed to healthcare providers

### Free for Patients (Always)
- Basic coupon search remains 100% free
- No ads on patient-facing features
- Transparent pricing if premium tier is added

---

## 📈 Success Metrics

### Key Performance Indicators (KPIs)
- **Coupon Search Rate:** % of medications with coupon searches
- **Coupon Usage:** % of users who click "Get Coupon"
- **Average Savings:** $ saved per medication per user
- **User Satisfaction:** Survey responses about cost savings
- **Pharmacy Preference:** % of users who set a preferred pharmacy

### User Feedback Goals
- "I had no idea I could get my medication this cheap!"
- "This saved me $200 this month - thank you!"
- "Much easier than manually searching coupon sites"

---

## 🛠️ Development Checklist

### Pre-Development
- [ ] Research coupon API providers (GoodRx, SingleCare, etc.)
- [ ] Review API terms of service and pricing
- [ ] Evaluate commercial partnership requirements
- [ ] Design database schema for coupons
- [ ] Create mockups/wireframes

### Phase 1 (MVP)
- [ ] Set up coupon API integration (authentication, rate limits)
- [ ] Create `lib/coupons.ts` service layer
- [ ] Build `CouponFinder` component
- [ ] Add ZIP code input to user settings
- [ ] Implement basic search by RxCUI + location
- [ ] Design coupon result cards
- [ ] Add "Get Coupon" action (open provider URL)
- [ ] Write tests for coupon search logic
- [ ] Add loading states and error handling

### Phase 2 (Enhancements)
- [ ] Add `CouponBadge` to medication cards
- [ ] Create pharmacy preference settings page
- [ ] Implement price comparison UI
- [ ] Add sorting/filtering options
- [ ] Calculate and display savings
- [ ] Integrate pharmacy location data (addresses, distances)
- [ ] Cache coupon results locally (24-hour refresh)

### Phase 3 (Advanced)
- [ ] Insurance co-pay comparison feature
- [ ] Digital coupon delivery (barcode generation)
- [ ] Price drop alerts (notification system)
- [ ] Multi-medication total savings calculator
- [ ] Patient assistance program integration
- [ ] Mail-order pharmacy options

---

## 📚 Resources & References

### Coupon Providers
- **GoodRx:** https://www.goodrx.com/
- **SingleCare:** https://www.singlecare.com/
- **RxSaver:** https://www.rxsaver.com/
- **Blink Health:** https://www.blinkhealth.com/

### Patient Assistance
- **NeedyMeds:** https://www.needymeds.org/
- **Prescription Hope:** https://prescriptionhope.com/
- **RxAssist:** https://www.rxassist.org/

### Pharmacy APIs
- **Walgreens Pharmacy API:** (Developer portal)
- **CVS Pharmacy API:** (Enterprise partnerships)
- **Walmart Pharmacy:** (Check for API availability)

### Industry Research
- "Why Prescription Drug Prices Vary by Pharmacy" - Consumer Reports
- "The Reality of Prescription Drug Coupons" - NCBI
- "Pharmacy Benefit Managers and Drug Pricing" - KFF

---

## 🎉 Why This Feature Matters

### Patient Impact
- **Financial Relief:** Help patients afford their medications
- **Health Outcomes:** Improved adherence when meds are affordable
- **Transparency:** Empower patients with pricing information
- **Accessibility:** Especially valuable for uninsured/underinsured

### ClariMed Differentiation
- **Holistic Care:** Not just tracking, but cost management too
- **Patient-First:** Focus on real-world problems patients face
- **Trust Building:** Showing we care about affordability
- **Sticky Feature:** Users return when they need refills

---

**This feature aligns perfectly with ClariMed's mission: clarity and simplicity in medication management, while genuinely helping patients save money.** 💙

---

**Document Status:** Initial planning - ready for technical review and API evaluation  
**Next Steps:** Research GoodRx/SingleCare partnership opportunities, estimate development timeline
