# Azure Static Web Apps Deployment Guide

## Prerequisites Checklist
- [x] GitHub repository with SmartLibrary code
- [ ] Azure account (free with GitHub Student Developer Pack)
- [ ] Custom domain: librarysmart.me (Namecheap)
- [ ] Backend deployed to Railway/Render with URL: https://api.librarysmart.me

---

## Part 1: Azure Static Web Apps Setup

### Step 1: Create Static Web App in Azure Portal

1. **Login to Azure Portal**: https://portal.azure.com
2. **Create Resource**:
   - Click "+ Create a resource"
   - Search for "Static Web Apps"
   - Click "Create"

3. **Basic Configuration**:
   ```
   Subscription: Your subscription (free tier with Student Pack)
   Resource Group: Create new "SmartLibrary-RG"
   Name: smartlibrary-frontend
   Plan type: Free
   Region: Central US (or closest to your users)
   ```

4. **GitHub Integration**:
   ```
   Source: GitHub
   Organization: <your-github-username>
   Repository: SmartLibrary
   Branch: main
   ```

5. **Build Details**:
   ```
   Build Presets: Next.js
   App location: /Frontend
   Output location: .next
   ```

6. **Review + Create** → Wait for deployment (~2 minutes)

### Step 2: Configure Deployment Token

1. **Get Deployment Token**:
   - Go to your Static Web App resource
   - Click "Overview" → "Manage deployment token"
   - Copy the token

2. **Add to GitHub Secrets**:
   - Go to your GitHub repo: Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - Value: Paste the token you copied
   - Click "Add secret"

### Step 3: Add Environment Variables

1. **In Azure Portal**:
   - Go to your Static Web App
   - Click "Configuration" (left sidebar)
   - Click "+ Add" under Application settings

2. **Add These Variables**:
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://api.librarysmart.me

   Name: NEXT_PUBLIC_RAZORPAY_KEY_ID
   Value: rzp_test_Rhx1QRTWogcjld
   ```

3. **Save** the configuration

---

## Part 2: Custom Domain Configuration (librarysmart.me)

### Step 1: Azure Side Setup

1. **Add Custom Domain in Azure**:
   - Go to your Static Web App
   - Click "Custom domains" (left sidebar)
   - Click "+ Add"
   - Domain type: "Custom domain on other DNS"

2. **Add Root Domain**:
   - Domain name: `librarysmart.me`
   - Click "Next"
   - Azure will show you TXT and CNAME records to add

3. **Add WWW Subdomain**:
   - Click "+ Add" again
   - Domain name: `www.librarysmart.me`
   - Click "Next"
   - Note the validation records

### Step 2: Namecheap DNS Configuration

1. **Login to Namecheap**: https://www.namecheap.com
2. **Go to Domain List** → Click "Manage" next to librarysmart.me
3. **Click "Advanced DNS" tab**

4. **Add DNS Records**:

   **For Root Domain (librarysmart.me):**
   ```
   Type: TXT Record
   Host: @
   Value: <TXT-value-from-Azure>
   TTL: Automatic

   Type: ALIAS Record (or A Record if ALIAS not available)
   Host: @
   Value: <static-web-app-url-from-Azure>
   TTL: Automatic
   ```

   **For WWW Subdomain:**
   ```
   Type: CNAME Record
   Host: www
   Value: <your-static-web-app>.azurestaticapps.net
   TTL: Automatic
   ```

5. **Save All Changes**

### Step 3: Verify Domain in Azure

1. **Wait for DNS Propagation** (5-30 minutes)
2. **Check DNS with**: `nslookup librarysmart.me`
3. **In Azure Portal**:
   - Go back to "Custom domains"
   - Click "Validate" next to your domains
   - Once validated, click "Add"

4. **Enable HTTPS** (automatic with Azure, takes ~10 minutes)

---

## Part 3: Backend Configuration

### Update Backend CORS

In your backend `app.ts` or wherever CORS is configured:

```typescript
import cors from 'cors';

app.use(cors({
  origin: [
    'https://librarysmart.me',
    'https://www.librarysmart.me',
    'http://localhost:3000' // Keep for local development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Environment Variables for Backend

Make sure your backend (Railway/Render) has:
```
FRONTEND_URL=https://librarysmart.me
DATABASE_URL=<your-mongodb-atlas-connection-string>
JWT_SECRET=<your-jwt-secret>
RAZORPAY_KEY_ID=rzp_test_Rhx1QRTWogcjld
RAZORPAY_KEY_SECRET=<your-razorpay-secret>
```

---

## Part 4: Deploy Backend to Railway

### Step 1: Railway Setup

1. **Login to Railway**: https://railway.app
2. **New Project** → "Deploy from GitHub repo"
3. **Select** SmartLibrary repo
4. **Configure**:
   ```
   Root Directory: /Backend
   Build Command: npm run build
   Start Command: npm start
   ```

### Step 2: Environment Variables

Add all backend environment variables in Railway dashboard:
- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_URL`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `PORT` (Railway auto-assigns, but set to 5000 for consistency)

### Step 3: Custom Domain for Backend

1. **In Railway** → Settings → Domains
2. **Add Custom Domain**: `api.librarysmart.me`
3. **Railway will provide a CNAME record**

4. **In Namecheap DNS**:
   ```
   Type: CNAME Record
   Host: api
   Value: <railway-provided-value>
   TTL: Automatic
   ```

---

## Part 5: MongoDB Atlas Configuration

1. **Login to MongoDB Atlas**: https://cloud.mongodb.com
2. **Network Access**:
   - Add Railway IP addresses (or allow all: 0.0.0.0/0)
3. **Database Access**:
   - Create user with read/write permissions
4. **Get Connection String**:
   - Cluster → Connect → Connect your application
   - Copy connection string
   - Replace `<password>` with actual password
   - Use this as `DATABASE_URL` in Railway

---

## Part 6: Testing Deployment

### Test Frontend

1. **Visit**: https://librarysmart.me
2. **Test**:
   - Homepage loads
   - Navigation works
   - Login/Signup forms work
   - API calls to backend succeed

### Test Backend

1. **Visit**: https://api.librarysmart.me
2. **Test Endpoints**:
   ```bash
   # Health check
   curl https://api.librarysmart.me/

   # Auth endpoint
   curl https://api.librarysmart.me/api/auth/
   ```

### Test Payment Integration

1. **Create test account** on frontend
2. **Try payment flow** with Razorpay test mode
3. **Verify** payment appears in admin dashboard

---

## Part 7: Going to Production

### Razorpay Production Mode

1. **Login to Razorpay**: https://dashboard.razorpay.com
2. **Switch to Live Mode** (top right toggle)
3. **Get Production Keys**:
   - Settings → API Keys → Generate Key Pair
   - Copy `Key ID` and `Key Secret`

4. **Update Environment Variables**:
   
   **Azure Static Web App**:
   ```
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXX
   ```

   **Railway Backend**:
   ```
   RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXX
   RAZORPAY_KEY_SECRET=<live-secret>
   ```

5. **Redeploy** both frontend and backend

---

## Part 8: Monitoring & Maintenance

### Azure Monitoring

1. **Static Web App** → "Metrics"
   - Monitor: Requests, Bandwidth, Errors
2. **Set up Alerts** for high error rates

### Railway Monitoring

1. **Project Dashboard** → "Metrics"
   - Monitor: CPU, Memory, Network
2. **Logs** tab for debugging

### MongoDB Atlas Monitoring

1. **Cluster** → "Metrics"
   - Monitor: Connections, Operations, Storage
2. **Set up Alerts** for high connection count

---

## Troubleshooting

### Frontend not loading
- Check Azure deployment logs: Static Web App → "Actions" (GitHub)
- Verify environment variables are set in Azure
- Check browser console for errors

### API calls failing
- Verify CORS settings in backend
- Check Railway deployment logs
- Ensure `NEXT_PUBLIC_API_URL` matches Railway domain
- Test backend directly: `curl https://api.librarysmart.me`

### Custom domain not working
- Wait 30 minutes for DNS propagation
- Check DNS with: `nslookup librarysmart.me`
- Verify TXT records in Namecheap match Azure requirements
- Check SSL certificate status in Azure

### Payment not working
- Verify Razorpay keys are correct
- Check browser console for Razorpay errors
- Test with Razorpay test cards: 4111 1111 1111 1111
- Check backend payment logs

---

## Deployment Commands

### Local Development
```bash
# Frontend
cd Frontend
npm install
npm run dev

# Backend
cd Backend
npm install
npm run dev
```

### Manual Deployment Trigger
```bash
# Commit and push to trigger auto-deployment
git add .
git commit -m "Deploy to production"
git push origin main
```

---

## Resources

- **Azure Static Web Apps Docs**: https://docs.microsoft.com/azure/static-web-apps/
- **Railway Docs**: https://docs.railway.app/
- **MongoDB Atlas**: https://www.mongodb.com/docs/atlas/
- **Razorpay Integration**: https://razorpay.com/docs/payments/
- **Next.js Deployment**: https://nextjs.org/docs/deployment

---

## Support

For issues:
1. Check Azure deployment logs
2. Check Railway logs
3. Review MongoDB Atlas metrics
4. Test API endpoints with curl/Postman
5. Check browser console for frontend errors

---

## Security Checklist

- [ ] HTTPS enabled on all domains
- [ ] Environment variables secured (not in code)
- [ ] MongoDB Atlas IP whitelist configured
- [ ] CORS properly configured for production domains
- [ ] JWT secret is strong and unique
- [ ] Razorpay webhooks enabled for production
- [ ] Admin credentials changed from default
- [ ] Rate limiting enabled on backend
- [ ] Security headers configured in staticwebapp.config.json

---

**Your Production URLs:**
- Frontend: https://librarysmart.me
- Backend API: https://api.librarysmart.me
- Database: MongoDB Atlas (managed)

**Estimated Setup Time:** 45-60 minutes

Good luck with your deployment! 🚀
