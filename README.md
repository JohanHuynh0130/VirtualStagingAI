# Virtual Staging AI

AI-powered virtual staging for real estate photography. Transform empty rooms into beautifully furnished spaces using Google Gemini.

## Features

- **AI Virtual Staging** - Add realistic furniture to empty room photos
- **Multi-Room Support** - Living Room, Bedroom, Dining Room, Kitchen, and custom types
- **Furniture Library** - Select from curated furniture sets or import custom ones
- **Automatic Aspect Ratio** - Output matches input image dimensions
- **Project Management** - Organize staged images by project
- **Before/After Comparison** - Interactive slider to compare results

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Vanilla JS, HTML, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Database | Supabase PostgreSQL |
| Storage | Supabase Storage |
| AI | Google Gemini (gemini-3-pro-image-preview) |

## Project Structure

```
virtual-staging-app/
├── backend/
│   ├── server.js           # Express API server
│   ├── config.js           # AI prompts & settings
│   ├── database.js         # Supabase connection
│   ├── lib/helpers.js      # Utility functions
│   ├── supabase-schema.sql # Database schema
│   └── .env.example        # Environment template
│
├── frontend/
│   ├── index.html          # Dashboard
│   ├── staging.html        # Staging workspace
│   └── js/staging.js       # Staging logic
│
├── ARCHITECTURE.md         # System architecture
└── README.md               # This file
```

## Environment Variables

### Backend (`backend/.env`)

```env
# Required
GOOGLE_API_KEY=your_gemini_api_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key

# Optional
PORT=3001
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=https://your-backend-url.com
```

## Database Setup

1. Create a Supabase project
2. Run `backend/supabase-schema.sql` in SQL Editor
3. Create storage bucket `staging-images` (public)

## API Endpoints

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project with files |
| DELETE | `/api/projects/:id` | Delete project |
| PATCH | `/api/projects/:id` | Update project |

### Staging
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/stage` | Generate staged image (AI) |
| POST | `/api/upload-result` | Manual upload |

### Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/furniture` | List furniture sets |
| DELETE | `/api/project-files/:id` | Delete file |

## Configuration

### AI System Prompt

Edit `backend/config.js` to customize AI behavior:

```javascript
export const DEFAULT_SYSTEM_PROMPT = `
Your custom prompt here...
`;
```

### Supported Aspect Ratios

Output automatically matches input:
- 1:1, 16:9, 9:16, 4:3, 3:4
- 3:2, 2:3, 4:5, 5:4, 21:9

## Scripts

### Backend
```bash
npm start      # Start server
npm run dev    # Development with nodemon
```

### Frontend
```bash
npm run dev    # Development server
npm run build  # Production build
```

## Contributing

1. Create feature branch from `main`
2. Make changes
3. Test locally
4. Submit PR for review

## License

Proprietary - Internal use only
