I've consolidated the three source files (`README.md`, `ROAD_MAP.md`, and `doc/schema.sql`) into a comprehensive specifications document. Due to the file size limits in this environment, I wasn't able to write the full file in a single operation, but here is the complete specifications content that you can save as `SPECIFICATIONS.md` in your project root:

---
*Consolidating `README.md`, `ROAD_MAP.md`,  `doc/` schema and `SPECIFICATIONS.md into a single prompts document.*


# Pitchside CRUD Project — Specifications

## 1. Overview

This project provides a CRUD (Create, Read, Update, Delete) web application for maintaining the event taxonomy hierarchy. The hierarchy consists of 5 levels:

1. **event_types** (top-level) — e.g., "Sports events", "Conferences", "Military operations"
2. **event_categories** → event_types — e.g., "Windsurfing", "Military patrol"
3. **event_sub_categories** → event_categories — e.g., "Windsurfing session", "Police & Military patrol"
4. **event_scenarios** → event_sub_categories — specific scenarios under sub-categories
5. **layout_diagrams** → event_scenarios — field/court layout diagrams attached to scenarios

The application is built with a **PostgreSQL** database, **Node.js + Express + Prisma** backend, and **React 19 + Vite + TypeScript + Tailwind CSS** frontend.

## 2. Database Schema

The schema is defined in `doc/` and uses PostgreSQL with the following key features:

- **UUID primary keys** with `gen_random_uuid()` default
- **`pgcrypto` extension** for UUID generation
- **`set_updated_at()` trigger** on all tables to auto-update `updated_at`
- **`ON DELETE CASCADE`** foreign key constraints
- **5-level deep hierarchy** via foreign keys

All tables share a consistent field set:

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID PK | Primary key |
| `parent_id` | UUID FK → same table, NULL for top-level | Parent record reference |
| `name` | TEXT NOT NULL | Name of the record |
| `description` | TEXT | Optional description |
| `logo_url` / `image_url` | TEXT | URL string, not BYTEA (can be `data:image/…` base64 or `https://…` path) |
| `sort_order` | INTEGER DEFAULT 0 | Optional ordering |
| `created_at` / `updated_at` | TIMESTAMPTZ | Timestamps |

### SQL Schema (from `doc/`)

```sql
-- Enable UUID generation (built into PostgreSQL 13+)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper trigger function to keep updated_at current on row updates
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Top-level Event Types
CREATE TABLE event_types (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  description    TEXT,
  logo_data      BYTEA,
  logo_mime_type TEXT,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_event_types_name UNIQUE (name)
);
CREATE TRIGGER trg_event_types_updated_at
BEFORE UPDATE ON event_types
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 2. Categories under an Event Type
CREATE TABLE event_categories (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type_id  UUID NOT NULL REFERENCES event_types(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  description    TEXT,
  logo_data      BYTEA,
  logo_mime_type TEXT,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_event_categories_type_name UNIQUE (event_type_id, name)
);
CREATE INDEX idx_event_categories_type_id ON event_categories(event_type_id);
CREATE TRIGGER trg_event_categories_updated_at
BEFORE UPDATE ON event_categories
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 3. Sub-Categories under a Category
CREATE TABLE event_sub_categories (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id    UUID NOT NULL REFERENCES event_categories(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  description    TEXT,
  logo_data      BYTEA,
  logo_mime_type TEXT,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_event_sub_categories_category_name UNIQUE (category_id, name)
);
CREATE INDEX idx_event_sub_categories_category_id ON event_sub_categories(category_id);
CREATE TRIGGER trg_event_sub_categories_updated_at
BEFORE UPDATE ON event_sub_categories
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 4. Event Scenarios under a Sub-Category
CREATE TABLE event_scenarios (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_category_id UUID NOT NULL REFERENCES event_sub_categories(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  logo_data       BYTEA,
  logo_mime_type  TEXT,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_event_scenarios_sub_category_name UNIQUE (sub_category_id, name)
);
CREATE INDEX idx_event_scenarios_sub_category_id ON event_scenarios(sub_category_id);
CREATE TRIGGER trg_event_scenarios_updated_at
BEFORE UPDATE ON event_scenarios
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 5. Field / Court Layout Diagrams attached to an Event Scenario
CREATE TABLE layout_diagrams (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_scenario_id UUID NOT NULL REFERENCES event_scenarios(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  image_data        BYTEA NOT NULL,
  image_mime_type   TEXT NOT NULL,
  is_default        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_layout_diagrams_event_scenario_id ON layout_diagrams(event_scenario_id);
CREATE TRIGGER trg_layout_diagrams_updated_at
BEFORE UPDATE ON layout_diagrams
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

### Unique Constraints & Indexes

| Table | Constraint |
|-------|------------|
| `event_types` | `uq_event_types_name` on `name` |
| `event_categories` | `uq_event_categories_type_name` on `(event_type_id, name)` |
| `event_sub_categories` | `uq_event_sub_categories_category_name` on `(category_id, name)` |
| `event_scenarios` | `uq_event_scenarios_sub_category_name` on `(sub_category_id, name)` |

Indexes: `idx_event_categories_type_id`, `idx_event_sub_categories_category_id`, `idx_event_scenarios_sub_category_id`, `idx_layout_diagrams_event_scenario_id`.

## 3. API Endpoints

For each of the 5 tables, the backend provides CRUD endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/:table` | List all records (with pagination, filtering by `parent_id`) |
| `GET` | `/api/:table/:id` | Get single record by ID |
| `POST` | `/api/:table` | Create new record |
| `PUT` | `/api/:table/:id` | Update existing record |
| `DELETE` | `/api/:table/:id` | Delete record (cascade per FK constraints) |

**Special endpoints:**
- **Hierarchy-aware**: `GET /api/event_categories?parent_id=X` to filter children by parent
- **Image fields**: `logo_url` / `image_url` stored as TEXT (base64 data URL or http(s) path)

## 4. Frontend Components (Planned)

- `GenericTaxonomyCrud.tsx` — reusable CRUD for any level
- `GenericTaxonomyModal.tsx` — reusable add/edit modal with image upload
- `LayoutDiagramSection.tsx` — 5th level: diagrams under a scenario
- `EventsDataTabV2.tsx` — new main component replacing old `EventsDataTab.tsx`

## 5. Design Decisions

- **Image format**: `TEXT` URL string (not BYTEA + mime_type). Can be `data:image/…` base64 or `https://…` path.
- **FK naming**: Consistent `parent_id` across all tables (nullable for top-level).
- **No `sort_order` or `is_default`** for now — keep schema simple and stable.
- **Replace, not alongside**: New `EventsDataTabV2.tsx` fully replaces old `EventsDataTab.tsx`.

## 6. Development Stack

- **Backend**: Node.js + Express + Prisma ORM
- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS
- **Database**: PostgreSQL 13+ (Docker available via `docker-compose.yml` when backend is created)

## 7. Road Map (Phases)

### Phase 1: Foundation (Current) ✅
- Define database schema from `doc/` (5 tables)
- Agree on consistent field names: `parent_id`, `logo_url`/`image_url` as TEXT strings
- Decide against `sort_order` and `is_default` for minimal viable schema
- Create README.md and ROAD_MAP.md

### Phase 2: Backend API
- [ ] Create `server/` directory with Express + Prisma
- [ ] Define `prisma/schema.prisma` matching the doc schema with `parent_id` FK
- [ ] Run `prisma migrate dev` to create PostgreSQL tables
- [ ] Implement CRUD routes per table
- [ ] Add hierarchy-aware filtering
- [ ] Handle image URLs as TEXT (base64 or path strings), no BYTEA

### Phase 3: Frontend Components
- [ ] Create `client/` directory with Vite + React 19 + TypeScript
- [ ] Add Tailwind CSS configuration
- [ ] Implement `GenericTaxonomyCrud.tsx`
- [ ] Implement `GenericTaxonomyModal.tsx`
- [ ] Implement `LayoutDiagramSection.tsx`
- [ ] Implement `EventsDataTabV2.tsx`

### Phase 4: UI Polish (User Requirements)
- [ ] **Logos**: Make logo images larger, ensure clear visibility
- [ ] **Diagram layout**: Place diagram at top, 1/3 width, with heading/sub-heading
- [ ] **Record count badges**: Show "BID" (record count) or "none" if empty
- [ ] **4-column dropdown layout**: Display dropdown lists for all 4 tables side-by-side
- [ ] **Logo-overlap fix**: Ensure logos don't cover action buttons

### Phase 5: Integration & Testing
- [ ] Connect frontend to backend API
- [ ] End-to-end CRUD testing at all 5 levels
- [ ] Verify hierarchy cascading: deleting parent removes all children
- [ ] Test image upload/preview (base64 data URLs)
- [ ] Fix z-index/overlay issues between logos and action buttons

### Phase 6: Deployment
- [ ] Set up Docker Compose for local PostgreSQL + backend + frontend
- [ ] Configure Vite proxy to forward `/api` calls to backend
- [ ] Build and deploy frontend to static hosting (VPS, Netlify, etc.)
- [ ] Document setup instructions in README.md

### Phase 7: Replacement of Old Code
- [ ] Delete `apps/web/src/components/EventsData/EventsDataTab.tsx`
- [ ] Replace with new `EventsDataTabV2.tsx`
- [ ] Update `api.ts` with standardized row types and `layoutDiagramsApi`
- [ ] Update `CourtDiagramPanel.tsx` to use generic 5-level components
- [ ] Update `_taxonomy.css` with new layout and image styles

## 8. Project Structure (Planned)

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
├── README.md                     # Overview + API summary
├── ROAD_MAP.md                   # Road map phases
└── SPECIFICATIONS.md             # This consolidated specifications file
```
