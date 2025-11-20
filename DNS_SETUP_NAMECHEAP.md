# DNS Configuration for librarysmart.me on Namecheap

## Quick Reference

**Domain:** librarysmart.me  
**DNS Provider:** Namecheap  
**Frontend:** Azure Static Web Apps  
**Backend:** Railway  

---

## DNS Records to Add

### 1. Root Domain (librarysmart.me) - Frontend

#### Option A: ALIAS Record (Recommended if available)
```
Type: ALIAS
Host: @
Target: <your-app-name>.azurestaticapps.net
TTL: Automatic
```

#### Option B: A Record (If ALIAS not available)
```
Type: A
Host: @
IP Address: <Get from Azure after domain verification>
TTL: Automatic
```

### 2. TXT Record for Domain Verification
```
Type: TXT
Host: @
Value: <Provided by Azure during custom domain setup>
TTL: Automatic
```

**Example TXT value:**
```
azure-dns-verification=a1b2c3d4e5f6g7h8i9j0
```

### 3. WWW Subdomain - Frontend
```
Type: CNAME
Host: www
Target: <your-app-name>.azurestaticapps.net
TTL: Automatic
```

### 4. API Subdomain - Backend
```
Type: CNAME
Host: api
Target: <your-railway-app>.railway.app
TTL: Automatic
```

---

## Step-by-Step Setup in Namecheap

### Step 1: Access DNS Management

1. Login to Namecheap: https://www.namecheap.com
2. Click **"Domain List"** in the left sidebar
3. Find **librarysmart.me** and click **"Manage"**
4. Click the **"Advanced DNS"** tab

### Step 2: Remove Default Records (Optional)

If you see default parking page records, remove:
- Any existing A records pointing to Namecheap parking
- Any existing CNAME for www pointing to parkingpage.namecheap.com

### Step 3: Add New DNS Records

Click **"Add New Record"** for each record below:

#### Record 1: Root Domain → Azure (Frontend)
```
Type: ALIAS Record (or A Record)
Host: @
Value: <from Azure Portal - your Static Web App URL>
TTL: Automatic
```

**How to get Azure Static Web App URL:**
1. Azure Portal → Your Static Web App
2. Overview → Default hostname (e.g., `happy-tree-123abc.azurestaticapps.net`)
3. Use this as your CNAME target (or get IP for A record)

#### Record 2: Domain Verification
```
Type: TXT Record
Host: @
Value: <from Azure Portal during custom domain setup>
TTL: Automatic
```

**How to get TXT verification value:**
1. Azure Portal → Static Web Apps → Custom domains
2. Click "+ Add" → Enter librarysmart.me
3. Azure will show you the TXT record value to add

#### Record 3: WWW Subdomain
```
Type: CNAME Record
Host: www
Value: <your-app-name>.azurestaticapps.net
TTL: Automatic
```

#### Record 4: API Subdomain → Railway (Backend)
```
Type: CNAME Record
Host: api
Value: <your-railway-app>.railway.app
TTL: Automatic
```

**How to get Railway domain:**
1. Railway Dashboard → Your Project
2. Settings → Domains
3. Click "Generate Domain" (e.g., `smartlibrary-production-abc.up.railway.app`)
4. Use this as CNAME target

### Step 4: Save All Changes

Click **"Save All Changes"** button at the bottom of the page.

---

## DNS Propagation

### Timeline
- **Minimum:** 5-15 minutes
- **Average:** 30 minutes
- **Maximum:** 24-48 hours (rare)

### Check Propagation Status

#### Online Tools
- https://dnschecker.org
- https://www.whatsmydns.net

Enter `librarysmart.me` and check:
- A/ALIAS record should point to Azure
- CNAME for www should point to Azure
- CNAME for api should point to Railway

#### Command Line
```powershell
# Check root domain
nslookup librarysmart.me

# Check www subdomain
nslookup www.librarysmart.me

# Check api subdomain
nslookup api.librarysmart.me

# Check TXT records
nslookup -type=TXT librarysmart.me
```

---

## Verification Checklist

After DNS propagation:

- [ ] `https://librarysmart.me` loads your frontend
- [ ] `https://www.librarysmart.me` redirects to or loads frontend
- [ ] `https://api.librarysmart.me` shows backend API
- [ ] SSL certificates are valid (green padlock)
- [ ] No mixed content warnings
- [ ] API calls from frontend to backend work

---

## Final DNS Configuration Preview

```
# Root Domain (Frontend)
librarysmart.me                → <your-app>.azurestaticapps.net (ALIAS/A)

# WWW Subdomain (Frontend)
www.librarysmart.me            → <your-app>.azurestaticapps.net (CNAME)

# API Subdomain (Backend)
api.librarysmart.me            → <your-app>.up.railway.app (CNAME)

# Verification
@.librarysmart.me              → azure-dns-verification=xxxxx (TXT)
```

---

## Troubleshooting

### Domain not resolving after 1 hour

**Check Namecheap DNS servers:**
```powershell
nslookup -type=NS librarysmart.me
```

Should show Namecheap nameservers:
```
dns1.registrar-servers.com
dns2.registrar-servers.com
```

If different, update nameservers in Namecheap:
1. Domain List → Manage
2. "Nameservers" section
3. Select "Namecheap BasicDNS"

### SSL Certificate not working

**Azure Static Web Apps:**
- SSL is automatic, but takes 5-10 minutes after domain verification
- Go to Azure Portal → Custom domains → Check status
- If stuck, remove domain and re-add it

**Railway:**
- SSL is automatic
- Check Railway Settings → Domains → SSL status
- Should show "Active" with green checkmark

### ALIAS Record not available in Namecheap

Use **CNAME Flattening** or **A Record**:

1. Get IP address from Azure:
   ```powershell
   nslookup <your-app>.azurestaticapps.net
   ```

2. Add A Record:
   ```
   Type: A Record
   Host: @
   IP: <IP from nslookup>
   TTL: Automatic
   ```

**Note:** A records are static. If Azure changes IP, you'll need to update.

### WWW not redirecting to root domain

Add redirect in `staticwebapp.config.json`:
```json
{
  "routes": [
    {
      "route": "/*",
      "serve": "/index.html",
      "statusCode": 200
    }
  ]
}
```

Both domains will work independently. Azure handles this automatically.

---

## Email Configuration (Optional)

If you want to use email with this domain:

### Google Workspace / Gmail
```
Type: MX Record
Host: @
Priority: 1
Value: smtp.google.com
TTL: Automatic
```

### Namecheap Private Email
```
Type: MX Record
Host: @
Priority: 10
Value: mx1.privateemail.com
TTL: Automatic
```

**Note:** Add these AFTER setting up web hosting to avoid conflicts.

---

## Security: DNSSEC (Optional but Recommended)

Enable DNSSEC in Namecheap:
1. Domain List → Manage → Advanced DNS
2. Scroll to "DNSSEC" section
3. Click "Enable DNSSEC"
4. Add the DS records provided to Azure if prompted

---

## Contact Information

**Namecheap Support:** https://www.namecheap.com/support/  
**Azure Support:** https://portal.azure.com/#blade/Microsoft_Azure_Support/HelpAndSupportBlade  
**Railway Support:** https://railway.app/help  

---

## DNS Record Summary Table

| Record Type | Host | Target                              | Purpose           |
|-------------|------|-------------------------------------|-------------------|
| ALIAS/A     | @    | Azure Static Web App                | Root domain       |
| CNAME       | www  | Azure Static Web App                | WWW subdomain     |
| CNAME       | api  | Railway App                         | Backend API       |
| TXT         | @    | azure-dns-verification=xxxxx        | Domain ownership  |

---

**Expected Setup Time:** 15-20 minutes  
**Total Propagation Time:** 5-60 minutes  

Your domains will be live at:
- https://librarysmart.me ✅
- https://www.librarysmart.me ✅
- https://api.librarysmart.me ✅
