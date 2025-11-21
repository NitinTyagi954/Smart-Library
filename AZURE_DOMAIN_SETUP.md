# Add Namecheap Domain to Azure Development

This guide explains how to connect your Namecheap domain to your Azure Static Web Apps and App Service.

## Current Azure Setup

- **Frontend (Static Web App):** `gentle-bay-0cb5bce00.3.azurestaticapps.net`
- **Backend (App Service):** `smartlibrary-backend-gtgnhmescehehuhj.eastasia-01.azurewebsites.net`

## Step 1: Get Azure DNS Nameservers

### 1.1 Create Azure DNS Zone (if not already created)

1. Go to [Azure Portal](https://portal.azure.com/)
2. Search for "DNS zones"
3. Click "Create"
4. Fill in:
   - **Resource Group:** Create new or use existing (e.g., `smartlibrary-rg`)
   - **Name:** Your domain name (e.g., `smartlibrary.com`)
   - Click **Create**

### 1.2 Get Your Nameservers

1. Open your DNS zone
2. At the top, you'll see 4 **Nameservers** (NS records):
   ```
   ns1-xx.azure-dns.com
   ns2-xx.azure-dns.info
   ns3-xx.azure-dns.org
   ns4-xx.azure-dns.net
   ```
3. **Copy these 4 nameservers** - you'll need them for Namecheap

## Step 2: Update Namecheap Nameservers

### 2.1 Log into Namecheap

1. Go to [Namecheap.com](https://www.namecheap.com/)
2. Login to your account
3. Go to **"Domain List"** (under Account menu)
4. Find your domain and click **"Manage"**

### 2.2 Change Nameservers

1. In the domain settings, find **"Nameservers"** section
2. Change from "Namecheap BasicDNS" to **"Custom DNS"**
3. In the nameserver fields, enter the 4 Azure nameservers:
   ```
   ns1-xx.azure-dns.com
   ns2-xx.azure-dns.info
   ns3-xx.azure-dns.org
   ns4-xx.azure-dns.net
   ```
4. Click **Save**

**⚠️ Note:** DNS propagation takes 15-30 minutes (sometimes up to 48 hours)

## Step 3: Create DNS Records in Azure

Once nameservers are updated, create DNS records in Azure DNS Zone:

### 3.1 Add A Record for Frontend

1. In Azure Portal, go to your DNS Zone
2. Click **+ Record set**
3. Create **A record**:
   - **Name:** `www` (or `@` for root domain)
   - **Type:** A
   - **Value:** IP address of your Static Web App
   - **TTL:** 3600
   - Click **OK**

**To find Static Web App IP:**
1. Go to your Static Web App resource
2. Go to **Settings** → **Custom domains**
3. Copy the IP address shown

### 3.2 Add CNAME Record (Alternative to A Record)

**Option A: Using CNAME (simpler for development)**

1. Click **+ Record set**
2. Create **CNAME record**:
   - **Name:** `www`
   - **Type:** CNAME
   - **Value:** `gentle-bay-0cb5bce00.3.azurestaticapps.net`
   - **TTL:** 3600
   - Click **OK**

**⚠️ Important:** CNAME can only be used for subdomains (e.g., `www`), not the root domain (@)

### 3.3 Add Records for Backend (Optional)

If you want to use a custom domain for backend:

1. Create **CNAME record**:
   - **Name:** `api`
   - **Type:** CNAME
   - **Value:** `smartlibrary-backend-gtgnhmescehehuhj.eastasia-01.azurewebsites.net`
   - **TTL:** 3600
   - Click **OK**

This makes your backend accessible at `api.yourdomain.com`

### 3.4 Add MX Record (For Email - Optional)

If you need email support:

1. Click **+ Record set**
2. Create **MX record**:
   - **Name:** `@` (root)
   - **Type:** MX
   - **Priority:** 10
   - **Value:** `mail.yourdomain.com` (or your email provider)
   - **TTL:** 3600

## Step 4: Configure Custom Domain in Azure

### 4.1 Static Web App (Frontend)

1. Go to **Azure Portal** → Your **Static Web App**
2. Go to **Settings** → **Custom domains**
3. Click **Add**
4. Enter your domain: `www.yourdomain.com`
5. Click **Next**
6. Verify the DNS record is configured
7. Click **Add**

### 4.2 App Service (Backend - Optional)

1. Go to **Azure Portal** → Your **App Service**
2. Go to **Settings** → **Custom domains**
3. Click **Add custom domain**
4. Enter: `api.yourdomain.com`
5. Follow validation steps
6. Click **Add**

## Step 5: Set Up SSL/TLS Certificate

Azure provides free SSL certificates for custom domains:

### 5.1 For Static Web App

1. Go to **Custom domains**
2. Your domain should show **HTTPS enabled** ✅
3. Azure automatically provisions SSL certificate (usually within a few minutes)

### 5.2 For App Service

1. Go to **TLS/SSL settings**
2. Under **Private Key Certificates (.pfx)**, click **Create App Service Managed Certificate**
3. Select your custom domain
4. Click **Create**
5. Once created, go to **Bindings**
6. Click **Add binding**
7. Select HTTPS and your certificate

## Step 6: Update Application Configuration

Update your application to use the custom domain:

### Frontend `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
```

### Backend `.env`:
```env
FRONTEND_URL=https://www.yourdomain.com
BACKEND_URL=https://api.yourdomain.com
ALLOWED_ORIGINS=https://www.yourdomain.com,https://yourdomain.com
```

### GitHub Actions Secrets:

Add to your repository secrets (Settings → Secrets → Actions):
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
BACKEND_FRONTEND_URL=https://www.yourdomain.com
BACKEND_ALLOWED_ORIGINS=https://www.yourdomain.com,https://yourdomain.com
```

## Step 7: Update Google OAuth (Important!)

Once you have a custom domain, update Google OAuth:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Go to **APIs & Services** → **Credentials**
3. Edit your OAuth Client
4. Add authorized origins:
   ```
   https://www.yourdomain.com
   https://yourdomain.com
   ```
5. Add authorized redirect URIs:
   ```
   https://www.yourdomain.com/login
   https://www.yourdomain.com/signup
   https://yourdomain.com/login
   https://yourdomain.com/signup
   ```
6. Click **Save**

## DNS Records Summary

Here's what your final DNS records should look like:

| Name | Type | Value | TTL |
|------|------|-------|-----|
| @ | A | [Static Web App IP] | 3600 |
| www | CNAME | gentle-bay-0cb5bce00.3.azurestaticapps.net | 3600 |
| api | CNAME | smartlibrary-backend-gtgnhmescehehuhj.eastasia-01.azurewebsites.net | 3600 |

## Testing Your Domain

### 1. Wait for DNS Propagation
```bash
# Check DNS propagation (in PowerShell)
nslookup yourdomain.com
```

### 2. Test Frontend
```
https://www.yourdomain.com
```

### 3. Test Backend
```
https://api.yourdomain.com/health
```

### 4. Test API Connection
Try logging in on your app - it should connect to `api.yourdomain.com/api`

## Troubleshooting

### Domain not resolving
- **Issue:** Getting `Cannot find server` error
- **Solution:** 
  1. Check Namecheap nameservers are set to Azure
  2. Wait 15-48 hours for propagation
  3. Clear browser DNS cache: `ipconfig /flushdns` (Windows)

### HTTPS not working
- **Issue:** Certificate error
- **Solution:**
  1. Verify domain ownership is confirmed in Azure
  2. Wait for certificate provisioning (5-10 minutes)
  3. Try accessing with `https://`

### API not connecting
- **Issue:** Getting 404 or connection error
- **Solution:**
  1. Update `NEXT_PUBLIC_API_URL` in frontend `.env`
  2. Redeploy frontend after changing env vars
  3. Check backend CORS settings include your domain

### Nameserver errors in Namecheap
- **Issue:** "Invalid nameserver" error
- **Solution:**
  1. Copy Azure nameservers exactly (including the trailing dot)
  2. You may need 2 nameservers minimum (not all 4 required)
  3. Contact Namecheap support if still failing

## Approximate Timeline

- **Immediate:** Create DNS zone in Azure, get nameservers
- **5 minutes:** Update Namecheap nameservers
- **15-30 minutes:** DNS propagation (domain starts resolving)
- **5-10 minutes after:** Azure provisions SSL certificate
- **Done:** Your domain is live! 🎉

## Environment Variables to Update

After domain is working, rebuild and redeploy:

```bash
# Trigger rebuild by pushing to GitHub
git add .
git commit -m "update: Use custom domain for production"
git push origin main

# GitHub Actions will automatically deploy
```

## Important Notes

1. **Static Web App:** The `@` record (root domain) needs to point to the actual IP or use a root-compatible method
2. **CNAME limitations:** CNAME cannot be used for root domain (`@`), only subdomains (`www`, `api`)
3. **Propagation:** DNS changes can take up to 48 hours to fully propagate globally
4. **SSL Certificate:** Azure automatically provisions free SSL certificates for custom domains
5. **Cost:** There's no additional cost for adding custom domains to Azure Static Web Apps

## Next Steps

1. Get your Namecheap domain name
2. Note down the domain
3. Follow steps 1-7 above
4. Test your domain in browser
5. Update environment variables
6. Commit and push changes (CI/CD will deploy)
7. Your app is now on a custom domain! 🚀
