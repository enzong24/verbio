# 🔐 Secrets Setup Guide for Verbio

## Quick Start

1. **Copy the template**: `.env.example` → `.env` (already done ✅)
2. **Fill in your secrets** in `.env`
3. **Never commit** `.env` (already ignored ✅)

---

## Required Secrets

### 1️⃣ **DATABASE_URL** (Required)
PostgreSQL connection string for Drizzle ORM. Prefer Supabase for an easy hosted Postgres with auth, backups, and dashboard.

**Get it from:**
- [Supabase](https://supabase.com) (recommended, free tier)
- [Neon](https://neon.tech) (compatible)
- [Railway](https://railway.app)

**Supabase recommended vars (preferred):**
```
SUPABASE_URL=https://xyzcompany.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Or fallback to a raw Postgres URL:**
```
DATABASE_URL=postgresql://username:password@host:5432/database_name
```

---

### 2️⃣ **OPENAI_API_KEY** (Required)
For AI-powered conversation grading, bot responses, and vocabulary generation.

**Get it from:**
1. Go to https://platform.openai.com/api-keys
2. Create account / sign in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

**Format:**
```
OPENAI_API_KEY=sk-proj-...
```

---

### 3️⃣ **STRIPE_SECRET_KEY** (Required for payments)
For subscription payments.

**Get it from:**
1. Go to https://dashboard.stripe.com/register
2. Get your test key from https://dashboard.stripe.com/test/apikeys
3. For production, use https://dashboard.stripe.com/apikeys

**Format:**
```
STRIPE_SECRET_KEY=sk_test_... (for testing)
STRIPE_SECRET_KEY=sk_live_... (for production)
```

---

### 4️⃣ **STRIPE_WEBHOOK_SECRET** (Required for Stripe webhooks)
For secure webhook signature verification.

**Get it from:**
1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. URL: `https://yourdomain.com/api/stripe-webhook`
4. Events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
5. Copy the signing secret (starts with `whsec_`)

**Format:**
```
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

### 5️⃣ **GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET** (Required for Google login)
For Google OAuth authentication.

**Get it from:**
1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Application type: "Web application"
6. Authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (local dev)
   - `https://yourdomain.com/api/auth/google/callback` (production)

**Format:**
```
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
```

---

### 6️⃣ **SESSION_SECRET** (Required)
Random string for session encryption.

**Generate it:**
```bash
# In terminal, run:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Format:**
```
SESSION_SECRET=your_random_32_character_string_here
```

---

### 7️⃣ **REPL_ID, ISSUER_URL, REPLIT_DOMAINS** (Optional - Replit only)
Only needed if deploying on Replit.

**Skip if using Codespaces/other hosting.**

---

## 📝 How to Fill In Your `.env`

**Open the file:**
```bash
code .env
```

**Fill in each value** (remove the `=` and add your actual keys):

```env
DATABASE_URL=postgresql://user:pass@host:5432/db
OPENAI_API_KEY=sk-proj-abc123...
STRIPE_SECRET_KEY=sk_test_xyz789...
STRIPE_WEBHOOK_SECRET=whsec_def456...
GOOGLE_CLIENT_ID=123-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xyz...
SESSION_SECRET=a1b2c3d4e5f6...
NODE_ENV=development
PORT=5000
```

---

## 🚀 After Adding Secrets

**Restart your dev server:**
```bash
npm run dev
```

**Verify secrets are loaded:**
- Check server logs for "Missing required secret" errors
- Test Google login
- Test Stripe checkout

---

## 🔒 Security Checklist

- ✅ `.env` is in `.gitignore` (done)
- ✅ Never commit actual secrets
- ✅ Use test keys for development
- ✅ Rotate secrets if exposed
- ✅ Use GitHub Secrets for Codespaces (see below)

---

## 🌐 GitHub Codespaces Secrets

For Codespaces, add secrets to your repository:

1. Go to https://github.com/enzong24/verbio/settings/secrets/codespaces
2. Click "New repository secret"
3. Add each secret (same names as `.env`)
4. Secrets auto-load in Codespaces

**Or use the GitHub CLI:**
```bash
gh secret set DATABASE_URL -b "postgresql://..."
gh secret set OPENAI_API_KEY -b "sk-..."
gh secret set STRIPE_SECRET_KEY -b "sk_test_..."
# ... etc
```

### Helper script (one-shot)

You can use the helper script `scripts/set_repo_secrets.sh` to set multiple repo secrets at once using the `gh` CLI. It will prompt for any values not provided as environment variables.

Usage:

```bash
# Make script executable (first time only)
chmod +x scripts/set_repo_secrets.sh

# Run and interactively enter values
./scripts/set_repo_secrets.sh

# Or provide some values via environment
DATABASE_URL="postgresql://..." OPENAI_API_KEY="sk-..." ./scripts/set_repo_secrets.sh
```

After running the script, you can verify Codespaces secrets in the repository settings UI under "Secrets and variables → Codespaces".


---

## ❓ Need Help?

**Common issues:**
- "Missing required secret" → Check `.env` file exists and has correct names
- "Database connection failed" → Verify `DATABASE_URL` format
- "OpenAI API error" → Check API key is valid and has credits
- "Stripe error" → Verify using correct test/live keys

**Test each service:**
```bash
# Test database
npm run db:studio

# Test OpenAI (requires running server)
curl http://localhost:5000/api/health

# Test Stripe
npm run stripe:listen
```
