# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Vite)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Dashboard   │  │   Staging    │  │    Editor    │          │
│  │ (index.html) │  │(staging.html)│  │(editor.html) │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTP API
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND (Express)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  server.js   │  │  config.js   │  │  helpers.js  │          │
│  │  (Routes)    │  │  (Prompts)   │  │  (Utilities) │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└──────────────────────────────┬──────────────────────────────────┘
                               │
           ┌───────────────────┼───────────────────┐
           ▼                   ▼                   ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  Supabase        │ │  Supabase        │ │  Google          │
│  PostgreSQL      │ │  Storage         │ │  Gemini AI       │
│  (Database)      │ │  (Images)        │ │  (Generation)    │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

## Backend Components

### `server.js` - Main API Server
Express application with all REST endpoints:
- Project CRUD operations
- Staging request handling
- File management

### `config.js` - Configuration
Centralized settings:
- `DEFAULT_SYSTEM_PROMPT` - AI behavior configuration
- `GEMINI_CONFIG` - Model URL and settings
- `SERVER_CONFIG` - Port and limits

### `database.js` - Supabase Client
Database and storage connection:
- PostgreSQL queries via Supabase client
- Storage bucket management

### `lib/helpers.js` - Utilities
Helper functions:
- `uploadToStorage()` - Upload to Supabase Storage
- `getImageDimensions()` - Parse image dimensions
- `getClosestAspectRatio()` - Match to allowed ratios

## Frontend Components

### `index.html` - Dashboard
Project list and management:
- Create new projects
- View existing projects
- Delete projects

### `staging.html` - Staging Workspace
Main staging interface:
- Image upload (drag & drop)
- Room type selection (multi-select + custom)
- Furniture set selection (multi-select)
- Custom prompt input
- Results gallery with before/after slider

### `js/staging.js` - Staging Logic
Frontend JavaScript:
- File handling
- API communication
- UI state management
- Comparison slider

## Database Schema

### `projects`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Project name |
| type | TEXT | 'staging' |
| created_at | TIMESTAMP | Creation time |

### `furniture_sets`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Display name |
| external_id | TEXT | Unique identifier (e.g., LR-MOD-001) |
| url | TEXT | Image URL |
| category | TEXT | Room category |

### `project_files`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| project_id | UUID | FK to projects |
| type | TEXT | 'original' or 'result' |
| file_path | TEXT | Public URL |
| storage_path | TEXT | Supabase storage path |
| prompt | TEXT | Custom prompt used |
| metadata | JSONB | Additional data |

## Data Flow

### Staging Request Flow

1. **Upload** - User uploads room image
2. **Configure** - Select room type, furniture, custom prompt
3. **Process** - Backend builds prompt + attaches images
4. **Generate** - Gemini API generates staged image
5. **Store** - Result saved to Supabase Storage
6. **Display** - Frontend shows before/after comparison

### Image Processing

```
Input Image → Dimension Detection → Aspect Ratio Matching
                                           ↓
                                   Gemini API Request
                                           ↓
                                 Base64 Response Image
                                           ↓
                            Supabase Storage Upload → Public URL
```

## External Services

### Supabase
- **PostgreSQL** - All application data
- **Storage** - Image files (original and staged)
- **Auth** (optional) - User authentication

### Google Gemini
- **Model**: gemini-3-pro-image-preview
- **Input**: Room image + furniture reference images + text prompt
- **Output**: Staged room image + analysis text
