# Deployment Guide

This application is a "persistent" Node.js application using SQLite.

## Deploying to Cloud (e.g., Railway, Render)

Because we use SQLite (`database.sqlite`) and local file storage (`storage/`), you need a host that supports **Persistent Volumes**.

### Option 1: Railway (Recommended)
1.  Create a GitHub repo and push this code.
2.  Connect Railway to your GitHub repo.
3.  Add a **Volume** mounted to `/app/storage`.
4.  Set Environment Variable: `GOOGLE_API_KEY`.
5.  Railway will auto-detect `npm start` (make sure we add it to package.json).

### Option 2: Render
1.  Select "Web Service".
2.  Connect GitHub.
3.  Add a **Disk** mounted to `/opt/render/project/src/storage` (or wherever app runs).
4.  Set `GOOGLE_API_KEY`.

## GitHub Setup

1.  Create a new repository on GitHub.
2.  Run the following commands in your terminal:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## Local Development

1.  Instal dependencies: `npm install`
2.  Start server: `node server.js`
3.  Start Frontend (dev mode): `npm run dev`
