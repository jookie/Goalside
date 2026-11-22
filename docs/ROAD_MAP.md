# Pitchside CRUD Project — Road Map

## Phase 1: Foundation (Current)
- [x] Define database schema from `doc/` (5 tables: event_types, event_categories, event_sub_categories, event_scenarios, layout_diagrams)
- [x] Agree on consistent field names: `parent_id`, `logo_url`/`image_url` as TEXT strings
- [x] Decide against `sort_order` and `is_default` for minimal viable schema
- [x] Create README.md and ROAD_MAP.md

## Phase 2: Backend API
- [ ] Create `server/` directory with Express + Prisma
- [ ] Define `prisma/schema.prisma` matching the doc schema with `parent_id` FK
- [ ] Run `prisma migrate dev` to create PostgreSQL tables
- [ ] Implement CRUD routes per table: `GET /api/:table`, `POST /api/:table`, `PUT /api/:table/:id`, `DELETE /api/:table/:id`
- [ ] Add hierarchy-aware filtering: `GET /api/event_categories?parent_id=X`
- [ ] Handle image URLs as TEXT (base64 or path strings), no BYTEA

## Phase 3: Frontend Components
- [ ] Create `client/` directory with Vite + React 19 + TypeScript
- [ ] Add Tailwind CSS configuration
- [ ] Implement `GenericTaxonomyCrud.tsx` — reusable list/add/edit/delete for any level
- [ ] Implement `GenericTaxonomyModal.tsx` — modal with name, description, image upload (base64 preview)
- [ ] Implement `LayoutDiagramSection.tsx` — 5th level: diagrams under scenario
- [ ] Implement `EventsDataTabV2.tsx` — new main component replacing `EventsDataTab.tsx`

## Phase 4: UI Polish (User Requirements)
- [ ] **Logos**: Make logo images larger than standard, ensure clear visibility
- [ ] **Diagram layout**: Place diagram at top of page, occupying 1/3 width, with heading and sub-heading
- [ ] **Record count badges**: Show "BID" (record count) for each table, or "none" if empty
- [ ] **4-column dropdown layout**: Display dropdown lists for all 4 tables in 4 columns side-by-side
- [ ] **Logo-overlap fix**: Ensure logo images do not cover/action buttons next to each table

## Phase 5: Integration & Testing
- [ ] Connect frontend to backend API
- [ ] End-to-end CRUD testing: create, edit, delete at all 5 levels
- [ ] Verify hierarchy cascading: deleting parent removes all children
- [ ] Test image upload/preview (base64 data URLs)
- [ ] Fix z-index/overlay issues between logos and action buttons

## Phase 6: Deployment
- [ ] Set up Docker Compose for local PostgreSQL + backend + frontend
- [ ] Configure Vite proxy to forward `/api` calls to backend
- [ ] Build and deploy frontend to static hosting (VPS, Netlify, etc.)
- [ ] Document setup instructions in README.md

## Phase 7: Replacement of Old Code
- [ ] Delete `apps/web/src/components/EventsData/EventsDataTab.tsx`
- [ ] Replace with new `EventsDataTabV2.tsx` in the pitchside app
- [ ] Update `api.ts` with standardized row types and `layoutDiagramsApi`
- [ ] Update `CourtDiagramPanel.tsx` to use generic 5-level components
- [ ] Update `_taxonomy.css` with new layout and image styles