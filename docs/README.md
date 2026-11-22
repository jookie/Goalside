

# Technologies for Live Streaming Events Application

## React Stack Taxonomy for Live Streaming Events

# Pitchside CRUD Project — Event Hierarchy Management

## Overview
This project provides a CRUD (Create, Read, Update, Delete) web application for maintaining the event taxonomy hierarchy defined in `doc/schema.sql`. The hierarchy consists of 5 levels:

1. **event_types** (top-level) — e.g., "Sports events", "Conferences", "Military operations"
2. **event_categories** → event_types — e.g., "Windsurfing", "Military patrol"
3. **event_sub_categories** → event_categories — e.g., "Windsurfing session", "Police & Military patrol"
4. **event_scenarios** → event_sub_categories — specific scenarios under sub-categories
5. **layout_diagrams** → event_scenarios — field/court layout diagrams attached to scenarios

- This project is a COMPONENT of the main Pitchside project at [](https://github.com/jookie/pitchside)<https://github.com/jookie/pitchside>."

- "This project does NOT have logins, events schedules, or producer studio features."


## Database Schema
The schema is defined in `doc/` and uses PostgreSQL with the following key features:

- **UUID primary keys** with `gen_random_uuid()` default
- **`pgcrypto` extension** for UUID generation
- **`set_updated_at()` trigger** on all tables to auto-update `updated_at`
- **`ON DELETE CASCADE`** foreign key constraints
- **5-level deep hierarchy** via foreign keys

All tables share a consistent field set:
- `id` (UUID PK)
- `parent_id` (UUID FK → same table, NULL for top-level)
- `name` (TEXT NOT NULL)
- `description` (TEXT)
- `logo_url` / `image_url` (TEXT — URL string, not BYTEA)
- `sort_order` (INTEGER DEFAULT 0)
- `created_at` / `updated_at` (TIMESTAMPTZ)

## Project Structure (planned)
```
pitchside2/
├── doc/                          # Existing SQL schema (keep)
├── server/                       # Backend (Express + Prisma — to be implemented)
│   ├── prisma/
│   │   ├── schema.prisma         # Prisma schema (mirrors doc SQL)
│   │   └── migrations/           # Auto-generated migrations
│   ├── src/
│   │   ├── controllers/          # CRUD controllers per table
│   │   ├── routes/               # Express route definitions
│   │   ├── services/             # Business logic / DB access
│   │   ├── middleware/           # Error handling, CORS, etc.
│   │   └── app.js                # Express app entry
│   ├── package.json
│   └── .env                      # DATABASE_URL, PORT
├── client/                       # Frontend (React + Vite — to be implemented)
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── pages/                # Page per table (List, Create, Edit)
│   │   ├── services/             # API client (axios instances)
│   │   ├── hooks/                # Custom React hooks
│   │   └── App.jsx               # Router setup
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml            # Optional: local Postgres + app
├── README.md                     # This file
└── ROAD_MAP.md                   # Below
```

## API Endpoints (per table)
For each of the 5 tables, the backend provides:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/:table` | List all records (with pagination, filtering by `parent_id`) |
| `GET` | `/api/:table/:id` | Get single record by ID |
| `POST` | `/api/:table` | Create new record |
| `PUT` | `/api/:table/:id` | Update existing record |
| `DELETE` | `/api/:table/:id` | Delete record (cascade per FK constraints) |

Special:
- **Hierarchy-aware**: `GET /api/event_categories?parent_id=X` to filter children by parent
- **Image fields**: `logo_url` / `image_url` stored as TEXT (base64 data URL or http(s) path)

## Frontend Components (planned)
- `GenericTaxonomyCrud.tsx` — reusable CRUD for any level
- `GenericTaxonomyModal.tsx` — reusable add/edit modal with image upload
- `LayoutDiagramSection.tsx` — 5th level: diagrams under a scenario
- `EventsDataTabV2.tsx` — new main component replacing old `EventsDataTab.tsx`

## Design Decisions
- **Image format**: `TEXT` URL string (not BYTEA + mime_type). Can be `data:image/…` base64 or `https://…` path.
- **FK naming**: Consistent `parent_id` across all tables (nullable for top-level).
- **No `sort_order` or `is_default`** for now — keep schema simple and stable.
- **Replace, not alongside**: New `EventsDataTabV2.tsx` fully replaces old `EventsDataTab.tsx`.

## Development
- Backend: Node.js + Express + Prisma ORM
- Frontend: React 19 + Vite + TypeScript + Tailwind CSS
- Database: PostgreSQL 13+ (Docker available via `docker-compose.yml` when backend is created)
