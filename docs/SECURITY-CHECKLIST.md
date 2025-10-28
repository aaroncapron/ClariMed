# Security & Privacy Checklist

**Project:** ClariMed  
**Last Updated:** October 28, 2025  
**Maintained By:** Aaron Capron

---

## Purpose

Ensure all sensitive data is protected and security best practices are followed throughout development and production deployment.

---

## Files & Configuration Security

### Environment Variables
- [x] `.env.local.example` created (safe to commit - no real credentials)
- [x] `.gitignore` includes `.env*.local` pattern
- [ ] Verify no `.env.local` file exists in repository
- [ ] Verify no real Supabase credentials in committed files

### Gitignore Protection
Current `.gitignore` protects:
- `.env*.local` - All local environment files
- `node_modules/` - Dependencies
- `.next/` - Build outputs
- `DEPLOYMENT-NOTES.md` - Private deployment info
- `_archive/` - Old codebase

**Recommended additions:**
```gitignore
# Supabase local development
.supabase/

# Editor configs
.vscode/settings.json
.idea/

# OS files
Thumbs.db
.DS_Store

# Backup files
*.backup
*.bak
*.tmp
```

---

## Supabase Security

### API Keys
- [x] `NEXT_PUBLIC_SUPABASE_URL` - Safe for client-side (public)
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Safe for client-side (RLS protects data)
- [ ] **NEVER COMMIT:** `SUPABASE_SERVICE_ROLE_KEY` - Admin access, server-only

### Row Level Security (RLS)
- [x] Enabled on all tables
- [x] Users can only access their own data
- [x] Policies prevent unauthorized reads/writes
- [x] Cascade deletes remove user data when account deleted

### Authentication
- [x] Passwords hashed with bcrypt
- [x] HTTP-only cookies for sessions
- [x] HTTPS enforced (via Vercel)
- [x] Email verification required
- [x] Password reset flow

---

## Email Configuration

### Development (Current)
- [x] Using Supabase native email sender
- [x] Sends from `noreply@mail.app.supabase.io`
- [x] Good for testing

### Production (REQUIRED BEFORE LAUNCH)
- [ ] **CRITICAL:** Must configure custom SMTP
- [ ] Options: SendGrid, Amazon SES, Resend, Mailgun
- [ ] Configure in: Supabase → Authentication → SMTP Settings
- [ ] Test all email flows before launch

**Why?**
- Native sender has rate limits
- May be flagged as spam
- Can't customize sender domain
- Not reliable for production traffic

---

## Code Security Best Practices

### Client vs Server Code
- [x] Auth logic uses proper client/server separation
- [x] `lib/supabase/client.ts` - Browser only
- [x] `lib/supabase/server.ts` - Server only
- [x] No server secrets in client code

### Data Validation
- [x] Password strength validation (8+ chars, uppercase, lowercase, number, special)
- [x] Email format validation
- [ ] Input sanitization in forms
- [x] SQL injection protection (Supabase handles this)

### Error Handling
- [ ] Never expose internal errors to users
- [ ] Log errors securely (server-side only)
- [ ] Generic error messages for auth failures

---

## Database Security

### Encryption
- [x] Data encrypted at rest (Supabase default)
- [x] Data encrypted in transit (HTTPS/TLS)
- [ ] Consider field-level encryption for extra sensitive data (future)

### Backups
- [ ] Automatic backups (Supabase Pro plan)
- [ ] Regular backup testing
- [ ] Point-in-time recovery capability

### Access Control
- [x] Row Level Security enforced
- [x] Database roles properly configured
- [x] No public schemas exposed
- [x] Audit logs available in Supabase dashboard

---

## Application Security

### HTTPS/TLS
- [x] Enforced by Vercel in production
- [x] No mixed content allowed
- [x] Secure cookie flags set

### CORS & CSP
- [ ] Configure Content Security Policy headers
- [ ] Set proper CORS policies
- [ ] Restrict iframe embedding

### Rate Limiting
- [x] Supabase auth endpoints rate-limited
- [ ] Add rate limiting for sensitive operations
- [ ] Monitor for abuse patterns

---

## Pre-Commit Checklist

Before every commit, verify:
- [ ] No `.env.local` file in staging area
- [ ] No API keys or credentials in code
- [ ] No console.log with sensitive data
- [ ] No hardcoded passwords or secrets
- [ ] No real user data in test files
- [ ] No database connection strings

### Git Commands to Check
```bash
# See what will be committed
git status

# See actual file contents to be committed
git diff --staged

# Check for accidentally added env files
git ls-files | grep -i "\.env"
```

---

## If Credentials Are Exposed

### Immediate Actions

**1. Rotate compromised credentials immediately**
- Go to Supabase → Settings → API
- Generate new keys
- Update `.env.local` locally
- Update production environment variables

**2. Remove from git history** (if committed)
```bash
# Remove file from history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (use with caution!)
git push origin --force --all
```

**3. Check for unauthorized access**
- Review Supabase logs
- Check for unexpected API calls
- Monitor database for suspicious activity

**4. Notify users if data breach occurred**
- Follow breach notification requirements
- Document the incident
- Implement fixes to prevent recurrence

---

## Privacy Compliance

### User Data Rights
- [ ] **Data Export** - Users can export their data
- [ ] **Data Deletion** - Users can delete their account
- [ ] **Data Portability** - Export in standard format (JSON)
- [ ] **Access Controls** - Users control who sees their data

### Privacy Policy Requirements
- [ ] What data is collected
- [ ] How data is used
- [ ] Who data is shared with (3rd party APIs)
- [ ] User rights (access, deletion, correction)
- [ ] Contact information for privacy concerns

### Medical Data Considerations
- [x] Not claiming to be a medical device
- [x] Not providing medical advice
- [x] Clear disclaimers throughout app
- [ ] HIPAA awareness (not compliant yet)
- [ ] Consider Business Associate Agreement for HIPAA

---

## Regular Security Audits

### Monthly Checks
- [ ] Review Supabase audit logs
- [ ] Check for unusual access patterns
- [ ] Verify RLS policies are working
- [ ] Update dependencies for security patches
- [ ] Review error logs for potential issues

### Quarterly Checks
- [ ] Full security audit of codebase
- [ ] Penetration testing (if budget allows)
- [ ] Review and update privacy policy
- [ ] Check third-party service security
- [ ] Update security documentation

---

## Security Resources

### Supabase Documentation
- [Security Best Practices](https://supabase.com/docs/guides/platform/security)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Managing Secrets](https://supabase.com/docs/guides/platform/secret-management)

### General Security
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)

### Healthcare Compliance
- [HIPAA Requirements](https://www.hhs.gov/hipaa/index.html)
- [FDA Medical Device Classification](https://www.fda.gov/medical-devices)
- [General Wellness Policy](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/general-wellness-policy-low-risk-devices)

---

## Current Security Status

### Completed
- [x] Environment variables properly configured
- [x] Gitignore protecting sensitive files
- [x] Row Level Security enabled
- [x] Password validation implemented
- [x] Encrypted data at rest and in transit
- [x] Proper client/server code separation
- [x] Authentication UI complete
- [x] Email verification flow
- [x] Password reset flow

### TODO Before Production
- [ ] Configure custom SMTP
- [ ] Add Content Security Policy headers
- [ ] Implement rate limiting
- [ ] Create Privacy Policy page
- [ ] Create Terms of Service page
- [ ] Add medical disclaimers
- [ ] Set up monitoring and alerts
- [ ] Conduct security audit

---

**Note:** Security is an ongoing process. Review this checklist regularly and update as the application evolves.
