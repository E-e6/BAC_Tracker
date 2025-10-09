# Render Deployment Guide for BAC Tracker

## Quick Deployment Instructions

### Step 1: Repository Setup
Make sure your code is pushed to GitHub in the `BAC_Tracker` repository with branch `main`.

### Step 2: Create Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository: `BAC_Tracker`

### Step 3: Configure Service Settings

Use these exact settings in the Render form:

**Basic Settings:**
- **Name:** `BAC_Tracker`
- **Region:** Singapore (Southeast Asia)
- **Branch:** `main`
- **Root Directory:** (leave empty)
- **Runtime:** Node

**Build & Start Commands:**
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

**Instance Type:**
- Select **Free** ($0/month) for testing
- Or **Starter** ($7/month) for production with zero downtime

### Step 4: Environment Variables

Click "Add Environment Variable" and add these two variables:

1. **VITE_SUPABASE_URL**
   - Value: `https://smvwzfwnhbbzofjejgbm.supabase.co`

2. **VITE_SUPABASE_ANON_KEY**
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdnd6ZnduaGJiem9mamVqZ2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MjA1NTAsImV4cCI6MjA3NTQ5NjU1MH0.4c88O6iCO26O9jdviQJ_E0xk9l3QPiRYf4cM6ujSEuU`

### Step 5: Deploy

Click "Deploy web service" button at the bottom.

## What Happens Next

1. Render will clone your repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the Vite app
4. Run `npm start` to serve the built app
5. Your app will be live at: `https://bac-tracker.onrender.com` (or similar)

## Deployment Times

- **First Deploy:** 3-5 minutes
- **Subsequent Deploys:** 2-3 minutes
- **Free Tier:** Service spins down after 15 minutes of inactivity (first request takes ~30 seconds)

## Alternative: Deploy Using render.yaml

If you prefer Infrastructure as Code, the included `render.yaml` file allows you to:

1. Go to Render Dashboard
2. Click "New +" → "Blueprint"
3. Connect your repository
4. Render will automatically detect `render.yaml` and configure everything

You'll still need to manually add the environment variables in the Render dashboard after blueprint deployment.

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Verify build command runs locally: `npm run build`

### App Won't Start
- Verify start command: `npm start`
- Check that PORT environment variable is supported (Render provides this automatically)

### Blank Page
- Verify environment variables are set correctly in Render dashboard
- Check browser console for errors
- Ensure Supabase URLs are accessible

## Post-Deployment

Once deployed:
- Test the app by entering your weight and gender
- Add drinks and verify BAC calculations work
- Test that data persists in Supabase
- Share your Render URL with users

## Cost Breakdown

**Free Tier:**
- Good for testing and personal use
- 750 hours/month of runtime
- Spins down after inactivity
- 512 MB RAM, 0.1 CPU

**Starter ($7/month):**
- Always-on (no spin down)
- Zero downtime deploys
- 512 MB RAM, 0.5 CPU
- Best for small production apps

## Support

If you encounter issues:
1. Check Render logs in dashboard
2. Verify environment variables are set
3. Test build locally first
4. Check Supabase connection
