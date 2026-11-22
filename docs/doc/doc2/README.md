


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

# Technologies for Live Streaming Events Application

## React Stack Taxonomy for Live Streaming Events

This project uses a modern web application technology stack tailored for managing live streaming events with a taxonomy hierarchy:

- **Frontend Framework**: React 19 + Vite for fast development and hot module replacement
- **Language**: TypeScript for type-safe development
- **Styling**: Tailwind CSS for utility-first styling
- **State Management**: React Query or SWR for server state, useState/useEffect for local state
- **Routing**: React Router DOM for navigation
- **HTTP Client**: Axios for API communication
- **Form Handling**: React Hook Form with Yup validation
- **Image Upload**: Base64 data URL handling or Cloudinary/S3 integration
- **Testing**: Vitest/Jest for unit tests, Cypress for end-to-end/visual tests
- **Build**: Vite for development and production builds
- **Package Manager**: npm or yarn

The application manages a 5-level event taxonomy hierarchy (event_types → event_categories → event_sub_categories → event_scenarios → layout_diagrams) with CRUD operations, hierarchy-aware filtering, and image/logo upload capabilities.

---

# Scaffold Generation Prompt

## AI Agent: Generate Project Scaffold

**Task**: Initialize a new CRUD project for event taxonomy management

### Steps:
1. Create project directory: `mkdir pitchside2 && cd pitchside2`
2. Initialize frontend: `npm create vite@latest client -- --template react-ts`
3. Install frontend dependencies: `cd client && npm install`
### 3. Install GitHub CLI (only if you don't have it)
```bash
brew install gh
```

### 4: Log in to GitHub
```bash
gh auth login
```
Follow the prompts — choose HTTPS, paste the code in your browser.

### 5: Create the GitHub repository and push your files
Replace `Goalside` with whatever name you want:
```bash
gh repo create Goalside --public --source=. --remote=origin
git push -u origin main
```

### 6: Verify

## Verify Git Setup

Run the following to verify your git repository is properly configured:

```bash
# Check current branch
git branch

# Verify remote is set
git remote -v

# Check latest commit
git log --oneline -1

# Verify script exists
ls script/git-push.sh
```

## Run Verification

```bash
# Test push with message
bash scripts/git-push.sh "Initial commit"

# Test push without message
bash scripts/git-push.sh
```

## Expected Output

With message:
- Adds files
- Commits with provided message
- Pushes to origin/main

Without message:
- Skips commit
- Pushes existing changes to origin/main

Initialize backend: `cd .. && npm init -y`
5. Install backend dependencies: `npm install express prisma @prisma/client cors dotenv`
6. Install dev dependencies: `npm install -D prisma typescript @types/node @types/express ts-node-dev`
7. Initialize Prisma: `npx prisma init`
8. Create Docker Compose (optional): 
   ```yaml
   version: '3.9'
   services:
     db:
       image: postgres:13
       environment:
         POSTGRES_USER: postgres
         POSTGRES_PASSWORD: postgres
         POSTGRES_DB: pitchside
       ports: ["5432:5432"]
       volumes: [postgres_data:/var/lib/postgresql/data]
     api:
       build: ./server
       depends_on: [db]
       environment:
         DATABASE_URL: postgres://postgres:postgres@db/pitchside?schema=public
       ports: ["4000:4000"]
   volumes: { postgres_data: {} }
   ```
9. Directory structure:
   ```
   pitchside2/
   ├── client/           # React + Vite frontend
   │   ├── src/components/
   │   ├── src/pages/
   │   ├── src/services/     # API client (axios)
   │   ├── src/hooks/
   │   └── App.jsx
   │   ├── index.html
   │   ├── package.json
   │   └── vite.config.js
   ├── server/           # Express + Prisma backend
   │   ├── prisma/schema.prisma
   │   ├── src/controllers/
   │   ├── src/routes/
   │   ├── src/services/
   │   ├── src/middleware/
   │   └── app.js
   │   ├── package.json
   │   └── .env
   ├── doc/              # SQL schema (existing)
   ├── README.md
   └── ROAD_MAP.md
   ```

### Prisma Schema Generation:
Generate `server/prisma/schema.prisma` with 5 models:
- EventType (top-level with unique name)
- EventCategory (belongs to EventType, with parent_id FK)
- EventSubCategory (belongs to EventCategory, with parent_id FK)
- EventScenario (belongs to EventSubCategory, with parent_id FK)
- LayoutDiagram (belongs to EventScenario, with image_data, image_mime_type, is_default)

Run migrations: `npx prisma migrate dev init` and `npx prisma migrate dev`
# Scaffold Create Prompt

## AI Agent: Create Project Scaffold

### 1.1 Initialize Repository
```bash
mkdir pitchside2 && cd pitchside2

npm create vite@latest client -- --template react-ts
cd client
npm install

cd ..
npm init -y
npm install express prisma @prisma/client cors dotenv
npm install -D prisma typescript @types/node @types/express ts-node-dev

npx prisma init

cat > docker-compose.yml << 'DOCKER_COMPOSE'
version: '3.9'
services:
  db:
    image: postgres:13
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: pitchside
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
  api:
    build: ./server
    depends_on:
      - db
    environment:
      DATABASE_URL: postgres://postgres:postgres@db/pitchside?schema=public
    ports:
      - "4000:4000"
volumes:
  postgres_data:
DOCKER_COMPOSE
```

### 1.2 Configure Prisma Schema
Create `server/prisma/schema.prisma`:
```prisma
generator client {
  provider = "postgresql"
}

datasource db {
  url = env("DATABASE_URL")
}

model EventType {
  id          String   @default(uuid()) @id @unique
  name        String   @unique
  description String?
  sortOrder   Int      @default(0)
  parent_uuid String?   // NULL is OK for top-level
  categories  EventCategory[]
  // NULL is OK for top-level EventType
}

model EventCategory {
  id          String   @default(uuid()) @id @unique
  name        String
  description String?
  sortOrder   Int      @default(0)
  parent_uuid String
  eventType   EventType @relation(fields: [parent_uuid], references: [id])
  subCategories SubCategory[]
  @@ unique([parent_uuid, name])
}

model EventSubCategory {
  id          String   @default(uuid()) @id @unique
  name        String
  description String?
  sortOrder   Int      @default(0)
  parent_uuid String
  category    EventCategory @relation(fields: [parent_uuid], references: [id])
  scenarios   EventScenario[]
}

model EventScenario {
  id          String   @default(uuid()) @id @unique
  name        String
  description String?
  sortOrder   Int      @default(0)
  parent_uuid String
  subCategory EventSubCategory @relation(fields: [parent_uuid], references: [id])
  layoutDiagrams LayoutDiagram[]
}

model LayoutDiagram {
  id             String   @default(uuid()) @id @unique
  name           String
  imageData      String?    // base64 data URL or path
  imageMimeType  String?
  isDefault      Boolean  @default(false)
  parent_uuid    String
  eventScenario  EventScenario @relation(fields: [parent_uuid], references: [id])
}
```

Run migrations:
```bash
npx prisma migrate dev init
npx prisma migrate dev
```

### 1.3 Create API Routes (Express)
Create CRUD routes in `server/src/routes/`:
- `GET /api/event_types` - List all event types
- `GET /api/event_types/:id` - Get single event type
- `POST /api/event_types` - Create event type
- `PUT /api/event_types/:id` - Update event type
- `DELETE /api/event_types/:id` - Delete event type

Similar routes for: event_categories, event_sub_categories, event_scenarios, layout_diagrams

### 1.4 Configure Vite Proxy
Add to `client/vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:4000'
    }
  }
})
# Prompt to Test the Test Suite for the Scaffold

## AI Agent: Test Scaffold Project

### 3.1 Unit Tests (Vitest - `client/`)
Create `client/jest.config.cjs` or `client/vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
export default defineConfig({
  testEnvironment: "jsdom"
})
```

Create `client/src/__tests__/Component.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import App from "./App"

describe("Small Step Tests", () => {
  test("renders logo image", () => {
    render(<App />)
    const img = screen.getByAltText("pitchside logo")
    expect(img).toBeInTheDocument()
  })

  test("navigates to events page", async () => {
    render(<App />)
    const link = screen.getByRole("link", { name: /events/i })
    await userEvent.click(link)
    await screen.findByText(/event taxonomy/i)
  })
})
```

Run unit tests: `cd client && npm test` or `cd client && npx vitest run`

### 3.2 API Tests (Supertest - `server/`)
Create `server/src/__tests__/api.test.js`:
```javascript
const request = require("supertest")
const app = require("../app").app

describe("API CRUD Endpoints", () => {
  test("GET /api/event_types returns 200", async () => {
    const res = await request(app).get("/api/event_types")
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  test("POST /api/event_types creates record", async () => {
    const res = await request(app)
      .post("/api/event_types")
      .send({ name: "Sports Events" })
    expect(res.status).toBe(201)
    expect(res.body.name).toBe("Sports Events")
  })
})
```

Run API tests: `cd server && npm test` or `cd server && npx jest`

### 3.3 Visual Tests (Cypress - Browser, Small Steps)
```bash
npx cypress open
```

Create `client/cypress/integration/taxonomy.cypress.spec.ts`:
```tsx
describe("Visual Tests - Small Steps", () => {
  beforeEach(() => {
    cy.visit("/")
  })

  test("step 1: page loads without errors", () => {
    cy.contains("h1").should("contain.text", "Pitchside")
    cy.get("img.logo").should("have.attr", "src").and("include", "data:image")
  })

  test("step 2: event_types dropdown displays", () => {
    cy.get("[data-testid='event-types-dropdown']").should("exist")
    cy.get("[data-testid='event-types-dropdown']").contains("Sports events")
  })

  test("step 3: create new category flow", () => {
    cy.get("[data-testid='add-category-btn']").click()
    cy.get('[data-testid="category-name"]').type("Windsurfing")
    cy.get('[data-testid="category-parent"]').select("Sports Events")
    cy.get("[data-testid='submit-category']").click()
    cy.contains("Windsurfing").should("exist")
  })

  test("step 4: layout diagram upload preview", () => {
    cy.get("[data-testid='upload-diagram']").selectFile("cypress/fixtures/test-diagram.png")
    cy.get("[data-testid='image-preview']").should("have.attr", "src").and("include", "test-diagram")
  })
})
```

Run visual tests: `cd client && npm run test:e2e`

### 3.4 CI/CD Configuration
Create `.github/workflows/tests.yml`:
```yaml
name: Run Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: "20"
          
      - name: Install Frontend deps
        run: cd client && npm install
          
      - name: Install Backend deps
        run: cd server && npm install
          
      - name: Run Unit Tests
        run: cd client && npm test
          
      - name: Run API Tests
        run: cd server && npm test
          
      - name: Run Visual Tests
        run: cd client && npm run test:e2e
```

### 3.5 Test Checklist
- [ ] Unit tests pass (Vitest/Jest)
- [ ] API tests pass (Supertest) - all 5 tables CRUD + hierarchy filtering
- [ ] Visual Cypress tests pass in small incremental steps
- [ ] Screenshot diffs approved with cypress-image-diff
- [ ] Docker Compose works for local development
- [ ] Vite proxy forwards `/api` to backend
- [ ] All test files created and executable
```


