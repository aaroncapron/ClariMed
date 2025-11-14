# How ClariMed Works (Behind the Scenes)

**A simple explanation of what happens when you use ClariMed - no technical jargon!**

---

## The Big Picture

Think of ClariMed as three parts working together:

1. **Your Device** (your computer or phone) - stores your medication list
2. **The Internet** - helps find correct medication names
3. **ClariMed App** - puts it all together nicely

---

## What Happens When You Search for a Medication

### **Step 1: You Start Typing**
You type a few letters like "lisi..."

### **Step 2: ClariMed Asks the NIH Database**
The app sends your letters to a free government database called RxNav
- Think of it like asking Google, but specifically for medications
- Run by the National Library of Medicine (part of NIH)
- 100% free and always available

### **Step 3: You Get Smart Suggestions**
The database sends back a list of matching medications
- **Example**: Type "lisi" → Get back "lisinopril 2.5 mg", "lisinopril 5 mg", "lisinopril 10 mg", etc.

### **Step 4: ClariMed Makes It Pretty**
The app organizes the results so they're easy to read:
1. Tablets first (most common)
2. Then capsules
3. Then liquids
4. Generic versions before brand names
5. Lowest dose to highest dose

### **Step 5: You Pick Yours**
Click the one that matches your prescription bottle!

---

## What Happens When You Add a Medication

### **Step 1: You Fill Out the Form**
- Medication name (from the search)
- Dosage (often auto-filled)
- How often you take it
- Optional notes

### **Step 2: ClariMed Checks If It's Maintenance**
The app looks at the medication name and asks:
- "Is this a blood pressure medication?" (ends in -pril, -sartan, -olol, or -dipine?)
- "Is this a cholesterol medication?" (ends in -statin?)
- "Is this a diabetes medication?" (like metformin, insulin?)
- "Is this a thyroid medication?" (like levothyroxine?)

If yes to any, it suggests marking it as "Maintenance" (but you can always change this!)

### **Step 3: ClariMed Saves It**
Your medication is saved on YOUR device (in your web browser's storage)
- **Not on the internet** (yet - this is coming later)
- **Only you can see it**
- **It stays there even if you close the browser**

### **Step 4: You See Your Pretty Card**
Your new medication appears as a card with:
- The name in big letters
- Dosage and frequency clearly shown
- A green "✓ Verified" badge (if found in the NIH database)
- A purple "Maintenance" badge (if it's a daily medication)
- Edit and Delete buttons

---

## Why Results Are Organized That Way

### **Tablets First, Then Capsules, Then Liquids**
Most people take tablets, so those appear first. It's like organizing a grocery store - put the popular stuff up front!

### **Generic Before Brand**
- Generics are usually what you actually get from the pharmacy
- They're cheaper and more common
- Brand names come after in case you specifically need those

### **Lowest Dose to Highest**
Makes it easy to find your exact strength without scrolling forever!

**Example for Lisinopril:**
```
🔵 lisinopril 2.5 MG Tablet
🔵 lisinopril 5 MG Tablet
🔵 lisinopril 10 MG Tablet    ← Easy to find!
🔵 lisinopril 20 MG Tablet
🔵 lisinopril 40 MG Tablet
🟢 Prinivil (lisinopril) 10 MG Tablet
🟢 Zestril (lisinopril) 10 MG Tablet
```

---

## 🔐 Where Is My Data Stored?

### **Right Now (v0.5.0)**

**Your Browser's Local Storage**
- Like a filing cabinet inside your web browser
- Only exists on YOUR device
- Can't be accessed by anyone else
- Not encrypted (yet)

**Pros:**
- ✅ Works offline (after first load)
- ✅ Completely private
- ✅ Free
- ✅ Fast

**Cons:**
- ❌ Only on one device (can't access from your phone and computer)
- ❌ Lost if you clear your browser data
- ❌ Not encrypted

### **Coming Soon (Future Versions)**

**Optional Cloud Storage with Encryption**
- Create an account (optional)
- Your medications stored securely on the internet
- Access from any device
- Encrypted so only you can read it
- Free with optional premium features

---

## 🤖 The "Smart" Parts

### **1. Autocomplete**
When you type, the app waits 150 milliseconds (about 1/6 of a second) before searching. Why?
- Lets you finish typing without interrupting
- Reduces unnecessary searches
- Feels instant but doesn't waste resources

### **2. Maintenance Detection**
The app recognizes patterns in medication names:
- Ends in "-pril"? → Probably blood pressure (ACE inhibitor)
- Ends in "-statin"? → Probably cholesterol medication
- Ends in "-sartan"? → Probably blood pressure (ARB)

It's like recognizing that names ending in "-son" are usually boy names!

### **3. Deduplication**
The government database sometimes has the same medication listed multiple times (different manufacturers or package sizes). ClariMed removes duplicates so you only see one entry per medication.

**Before deduplication:**
- lisinopril 10 MG Tablet (Manufacturer A)
- lisinopril 10 MG Tablet (Manufacturer B)
- lisinopril 10 MG Tablet (Manufacturer C)

**After deduplication:**
- lisinopril 10 MG Tablet ✅

### **4. Brand Name Formatting**
The database gives us brand names like this:
- "lisinopril 10 MG Oral Tablet [Prinivil]"

ClariMed reformats it to:
- "Prinivil (lisinopril) 10 MG Oral Tablet"

Much easier to read!

---

## 🔮 What's NOT Sent to the Internet

**Your privacy matters! These things NEVER leave your device:**
- ❌ Your full medication list (except during interaction checks - only RxCUI codes sent)
- ❌ How many medications you have
- ❌ Your notes
- ❌ Any personal information
- ❌ Your health conditions or allergies

**Only this gets sent to the NIH database:**
- ✅ The letters you type when searching (like "lisi")
- ✅ RxCUI codes when checking for interactions (no names, just numeric IDs)
- That's it!

---

## Safety & Accuracy

### **Why We Use the NIH RxNav Database**
1. **Government-run** - Trustworthy and official
2. **Free** - No costs, no ads, no selling your data
3. **Updated regularly** - Always has the latest medications and interactions
4. **Used by pharmacies** - Same database professionals use
5. **Public domain** - Free for anyone to use
6. **Comprehensive** - Includes DrugBank interaction data and ingredient relationships

### **What ClariMed Does to Keep You Safe**
1. **Verifies medication names** against the official database
2. **Detects allergy conflicts** by analyzing drug classes and ingredients via API
3. **Warns about contraindications** for health conditions (pregnancy, kidney disease, etc.)
4. **Shows clear badges** so you know what's verified
5. **Lets you override suggestions** - you're always in control
6. **Stores data securely** - encrypted in Supabase database with Row Level Security
7. **Never gives medical advice** - just helps you track and provides educational information

---

## Technical Summary (For the Curious)

**Stack:**
- Built with Next.js 14 (React framework)
- TypeScript for type safety
- Tailwind CSS for pretty design
- RxNav REST API for medication data
- Supabase for secure database storage and authentication

**Architecture:**
```
You type
    ↓
ClariMed App (on your device)
    ↓
Sends search to RxNav API
    ↓
Gets results
    ↓
Formats and organizes
    ↓
Shows you pretty list
    ↓
You pick one
    ↓
Saved to Supabase (encrypted database)
```

---

## Performance

**How fast is it?**
- Autocomplete appears in ~150-500 milliseconds (less than half a second)
- Saving a medication is instant
- Loading your list is instant
- No waiting around!

**How much data does it use?**
- Very little! Searching for a medication uses about 10-50 KB
- That's like 1/100th of a photo
- Total app size: Under 1 MB

---

## 🎓 Why These Design Choices?

### **Why Not Store Everything Offline?**
The full medication database is HUGE (over 2 GB!). Instead, we search online as needed.
- **Pro**: App stays small and fast
- **Con**: Need internet to search (but not to view your saved list)

### **Why Local Storage First?**
We wanted to launch fast with maximum privacy.
- **Pro**: Works immediately, completely private
- **Con**: Only on one device

We're adding cloud storage next so you can access from multiple devices!

### **Why These Specific Colors?**
- **Blue**: Calm and medical (think hospital scrubs)
- **Green**: Success and verification (like a checkmark)
- **Purple**: Special category (maintenance meds)
- **Red**: Caution (delete button)

---

## ❓ Common Questions

**Q: Why do I need internet to search?**
A: The medication database is too big to download. We search online and save only what you need!

**Q: Can ClariMed see my medication list?**
A: No! It's stored only on your device. We can't see it.

**Q: What if the NIH database goes down?**
A: You can still view your saved medications! You just can't search for new ones until it's back up.

**Q: Why suggest maintenance meds?**
A: It'll help with "Clarity Mode" (coming soon) - a simple view showing only daily medications.

---

**Want more technical details?** Check out:
- `FEATURE-MAINTENANCE-MEDS.md` for how maintenance detection works
- `FEATURE-SMART-AUTOCOMPLETE.md` for autocomplete technical details
- `RXNAV-API-GUIDE.md` for API documentation

---

**Last Updated:** November 11, 2025  
**Version:** 0.8.0
