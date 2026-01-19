# Internal Tools - Virtual Staging & Photo Editor

An internal tool for employees to process room photos with AI-powered virtual staging and conversational photo editing.

## Prerequisites
- Node.js installed
- Google Gemini API Key (with access to `gemini-2.5-flash-preview-05-20`)

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API Key
Edit the `.env` file and add your Gemini API key:
```env
GOOGLE_API_KEY=your_actual_api_key_here
```

### 3. Start the Backend Server
```bash
node server.js
```
This starts the API at `http://localhost:3001`.

### 4. Start the Frontend
In a **new terminal**:
```bash
npm run dev
```
Open the link shown (usually `http://localhost:5173`).

## Features

### Dashboard
- Central hub with navigation to both tools
- Global **Settings** for the system prompt (click the gear icon)

### Virtual Staging
- **Bulk Upload**: Drag and drop up to 20 images at once
- **Global System Prompt**: Set once in settings, applies to all images
- **Custom Prompt**: Per-batch styling instructions
- **Gallery View**: See original vs. staged comparisons

### Photo Editor
- **Conversational Interface**: Chat-style editing
- **Iterative Editing**: Each AI response becomes the new image to edit
- **Session Management**: Start new sessions anytime
- **Download**: Save any generated image

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stage` | POST | Bulk virtual staging |
| `/api/edit` | POST | Conversational editing |
| `/api/edit/:sessionId` | DELETE | Clear session |

## Tech Stack
- **Frontend**: Vite, Tailwind CSS 4, Vanilla JS
- **Backend**: Node.js, Express, Multer
- **AI**: Google Generative AI (Gemini 2.5 Flash Image)
