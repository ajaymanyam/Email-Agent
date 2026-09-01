# 🚀 Complete Deployment Guide: Render (Backend) + Vercel (Frontend)

This guide provides step-by-step instructions to deploy your **Intelligent Email Assistant** to production with **Render** for the backend API and **Vercel** for the frontend application.

---

## 🏗️ Production Architecture

```text
┌───────────────────────────────────────┐
│          Frontend (Vercel)            │
│       https://your-app.vercel.app     │
└──────────────────┬────────────────────┘
                   │ HTTPS API Requests
┌──────────────────▼────────────────────┐
│          Backend (Render)             │
│    https://your-api.onrender.com      │
└──────────┬─────────────────┬──────────┘
           │                 │
┌──────────▼────────┐   ┌────▼─────────────┐
│   MongoDB Atlas   │   │ Google OAuth 2.0 │
│  (Cloud Database) │   │ & Gmail API      │
└───────────────────┘   └──────────────────┘
```

---

## 📋 Step 1: Push Code to GitHub

Before deploying, commit and push your project to a GitHub repository:

1. **Open Terminal** in your project root (`c:\Users\HP\OneDrive\Desktop\email agent`):
   ```bash
   git init
   git add .
   git commit -m "feat: complete Intelligent Email Assistant production ready"
   ```

2. **Create a new GitHub Repository**:
   - Go to [github.com/new](https://github.com/new).
   - Name it `email-agent` (Public or Private).
   - Do **NOT** initialize with README or .gitignore (we already have them).

3. **Link and Push**:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   git push -u origin main
   ```

> 🔒 **Security Notice**: `.gitignore` ensures that your private `.env` secrets are never pushed to GitHub.

---

## 🍃 Step 2: Set Up MongoDB Atlas (Free Cloud Database)

1. Sign up / Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Click **Create a Deployment** ➔ Select the **M0 (Free)** cluster.
3. Under **Security Quickstart**:
   - **Username**: `email_user`
   - **Password**: *(Create a secure password, e.g. `MySecurePassword123`)*
4. Under **Network Access** (left sidebar):
   - Click **Add IP Address**.
   - Select **Allow Access From Anywhere (`0.0.0.0/0`)** so Render can connect.
   - Click **Confirm**.
5. Under **Database** (left sidebar):
   - Click **Connect** ➔ **Drivers** (Node.js).
   - Copy your connection string:
     ```text
     mongodb+srv://email_user:<password>@cluster0.xxxxx.mongodb.net/email-assistant?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual database password.

---

## 🔑 Step 3: Configure Google Cloud OAuth Credentials

1. Open [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
2. Select your Project and click on your **OAuth 2.0 Client ID**.
3. Under **Authorized JavaScript Origins**, add:
   - `https://your-app.vercel.app` *(You will get this from Vercel in Step 5)*
   - `http://localhost:3000` *(For local testing)*
4. Under **Authorized Redirect URIs**, add:
   - `https://your-api.onrender.com/api/gmail/oauth/callback` *(Replace with your Render URL from Step 4)*
   - `https://your-api.onrender.com/api/calendar/oauth/callback`
   - `http://localhost:5000/api/gmail/oauth/callback` *(For local testing)*
5. Click **Save**.

---

## ⚙️ Step 4: Deploy Backend API on Render

1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** ➔ **Web Service**.
2. Connect your GitHub repository (`email-agent`).
3. Fill in the service configuration:
   - **Name**: `email-agent-backend` (or any name you prefer)
   - **Region**: Closest to you (e.g. `Frankfurt` or `Oregon`)
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

4. Scroll down to **Environment Variables** and add:

| Variable Key | Value / Instructions |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `CLIENT_URL` | `https://your-app.vercel.app` *(Temporary placeholder or your Vercel URL)* |
| `MONGODB_URI` | `mongodb+srv://email_user:...@cluster0.xxxxx.mongodb.net/email-assistant?retryWrites=true&w=majority` |
| `JWT_SECRET` | *(64-character random hex string, e.g. run `openssl rand -hex 32`)* |
| `CREDENTIAL_ENCRYPTION_KEY` | *(64-character random hex string for AES-256-GCM)* |
| `GOOGLE_CLIENT_ID` | Your Google Cloud OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google Cloud OAuth Client Secret |
| `GOOGLE_REDIRECT_URI` | `https://email-agent-backend.onrender.com/api/gmail/oauth/callback` *(Use your Render URL)* |
| `GOOGLE_CALENDAR_REDIRECT_URI` | `https://email-agent-backend.onrender.com/api/calendar/oauth/callback` |
| `GEMINI_API_KEY` | Your Google Gemini API Key from Google AI Studio |
| `OPENROUTER_API_KEY` | *(Optional)* Your OpenRouter API Key |

5. Click **Create Web Service**.
6. Render will build and deploy the backend.
7. Once finished, copy your public backend URL at the top:  
   👉 `https://email-agent-backend.onrender.com`

---

## 💻 Step 5: Deploy Frontend on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/) and click **Add New...** ➔ **Project**.
2. Import your GitHub repository (`email-agent`).
3. In the project setup screen:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click `Edit` and select `client`
4. Expand **Environment Variables** and add:

| Name | Value |
| :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://email-agent-backend.onrender.com/api` *(Your Render backend URL + `/api`)* |

5. Click **Deploy**.
6. Vercel will build the frontend and provide your live production domain:  
   👉 `https://your-app.vercel.app`

---

## 🔄 Step 6: Link Frontend & Backend URLs

Now that you have both live domains:

1. **Update Render Environment Variables**:
   - Go to your Render Web Service ➔ **Environment**.
   - Set `CLIENT_URL` to your exact Vercel URL (e.g. `https://your-app.vercel.app`).
   - Click **Save Changes** (Render will automatically redeploy with the updated CORS configuration).

2. **Update Google Cloud Console**:
   - Make sure your Vercel URL is added under **Authorized JavaScript Origins**.
   - Make sure your Render callback URL is added under **Authorized Redirect URIs**.

---

## ✅ Step 7: Final Production Verification Checklist

1. **Backend Health Check**:
   - Open in browser: `https://email-agent-backend.onrender.com/api/health`
   - Expected output:
     ```json
     { "success": true, "status": "ok", "environment": "production" }
     ```

2. **User Authentication**:
   - Open `https://your-app.vercel.app`
   - Create a new user account ➔ Verify sign-in succeeds and redirects to `/dashboard`.

3. **Gmail Connection**:
   - Go to `/accounts` ➔ Click **"Connect Gmail Account"**.
   - Authorize your Google account ➔ Verify you are redirected back and the account shows **Connected** badge.

4. **Mailbox & AI Features**:
   - Open `/dashboard` ➔ Click Sync/Refresh to load your emails.
   - Click any email to view thread history, executive summary, and plain-English explanation.
   - Open `/copilot` to test natural language conversational search and AI auto-drafts.
