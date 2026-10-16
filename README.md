# MediSlot / CareVista Hospital — Chapters 3 to 5

Complete combined application through Chapter 5 Experiment 2:
- Chapter 3 Experiments 1–4: React hooks, reusable components, custom hooks/Context, routing, protected routes, validation and ErrorBoundary.
- Chapter 4 Experiments 1–4: REST APIs, Redux Toolkit/middleware/caching, appointment CRUD and authentication/token management.
- Chapter 5 Experiments 1–2: Jest/React Testing Library tests, lazy routes, code splitting, image/API optimizations, PWA and accessibility.

Chapter 5 deployment experiment is outside this package's scope. The original theme, fonts, assets and eight doctor profiles are retained. All three original CSS files are byte-for-byte unchanged. New accessibility CSS adds keyboard focus outlines only.

## Run on Windows / VS Code

Use Node.js 24 (or supported Node.js 22.12+).

1. Extract this ZIP to a NEW folder. Do not merge it with the old project/node_modules.
2. Open the extracted MediSlot folder (the folder containing package.json) in VS Code.
3. Run:

```sh
npm install
npm run dev:all
```

4. Open the Local URL printed by Vite, normally http://localhost:5173.
5. Choose Sign Up and create a test account. After signup/login the Home page opens.

Two-terminal alternative: `npm run server` in terminal 1 and `npm run dev` in terminal 2.

Keep both frontend and backend running. Old browser-only accounts need to be registered once. Accounts/appointments persist in server/data.json, created automatically. Passwords are hashed in that file. Tokens expire after one hour and server sessions are memory-based; restarting the server requires logging in again. Use test patient details.

You can also log in with your Patient ID instead of email: copy PAT-<account UUID> from Patient Dashboard → Profile. Leave email blank when using Patient ID.

If npm reports ENOTFOUND registry.npmjs.org, installation stopped because of network/DNS. Restore connectivity, run `npm ping`, then retry `npm install`.

## Tests

```sh
npm test
npm run test:coverage
npm run test:api
```

- Jest: 17 passing component/authentication tests across 2 suites.
- Coverage report: coverage/lcov-report/index.html.
- API checks start an isolated temporary backend/database and clean it up. They do not overwrite your appointments.

Test coverage includes doctor cards, details, search/specialty/fee/rating/availability filters, autofocus, loading/errors/empty states, date/time selection, patient validation, booking/cancellation, protected-route redirect, requested-page return after login, Patient ID validation and ErrorBoundary fallback. API checks cover CRUD, conflicts, ownership, dates, token expiry/revocation and persistence. Mocked component tests do not replace real API verification.

## Production / PWA preview

```sh
npm run build
```

Then run `npm run server` and, in another terminal, `npm run preview`. Open the preview URL, normally http://localhost:4173.

- Application → Manifest: CareVista Hospital manifest/icons.
- Application → Service Workers: registered generated worker.
- Network → JS: separate DoctorDetailsPage, BookAppointmentPage, AppointmentsPage and AppointmentDetailsPage chunks.
- The app shell/static assets are precached. API/authentication/appointment responses are NOT stored by the service worker. Booking/login/history still require a reachable API.
- API response logging is enabled in development and omitted from the production build. Redux action names/cache events remain useful lab diagnostics.
- Existing emoji avatars avoid image downloads. Optional doctor photoUrl images use lazy loading, asynchronous decoding and fixed dimensions.
- Tab/Shift+Tab navigate controls, Enter/Space activate controls, selected slots expose aria-pressed, forms have accessible labels, and focus is visible.
- This remains a local teaching app with browser token storage, not a production medical system.

## Chapter 3 outputs

### Experiment 1 — React Hooks
Capture Doctors page, filtered results, doctor profile, appointment summary/confirmation and mobile layout. Search autofocus uses useRef. useMemo derives filters, slots, duration/summary and appointment counts. useCallback handles selections and appointment operations. Code evidence is required for hook usage; screenshots alone cannot prove implementation.

### Experiment 2 — Custom Hooks / Context
Capture fee/rating/availability filters, booked appointment, rescheduled appointment, cancellation/history, empty search result and upcoming/reminder dashboard. useDoctors and useAppointments are active hooks, not unused samples. Context shares their appointment data and Redux-backed operations. Session storage holds a per-user browser snapshot for the lab; backend remains authoritative. Logout removes the snapshot. The dashboard reminder updates from the nearest upcoming appointment.

### Experiment 3 — Routing
Include the address bar in screenshots. Demonstrate /doctors, /doctor/1, /book-appointment, /appointment/<id>, /patient/upcoming, /patient/history and /patient/profile. The original example aliases /doctor/101 through /doctor/108 also resolve through the API. Nested pages use Outlet. Booking uses controlled five-step navigation.

### Experiment 4 — Protected Routes
Log out and visit /patient/profile directly: it redirects to Login. Sign in: it returns to that requested page. Capture invalid login, missing date/slot, invalid phone and successful confirmation. Patient ID validation is available on Login. ErrorBoundary catches rendering failures and is verified in the tests; ordinary form/API errors are handled separately.

## Chapter 4 outputs / Console and Network

Open F12 before demonstration. In Network select Fetch/XHR, enable Preserve log and Disable cache. Keep DevTools open while demonstrating.

| Experiment | Actions | Evidence |
| --- | --- | --- |
| 1 — REST / async | Search, specialty filter, View Profile, select date/time | GET doctors with query parameters, GET individual doctor, GET availability; Response JSON; loading/error UI |
| 2 — Redux / middleware / caching | Fill booking, confirm, reschedule, cancel, revisit a profile | Console Store action: appointments/setDraft; book/update/cancel pending/fulfilled; Cache hit/miss; Redux DevTools State |
| 3 — CRUD | Create, list, reschedule, cancel, history | POST /appointments 201; GET /appointments 200; PATCH /appointments/:id 200; DELETE /appointments/:id 200; GET /appointments/history |
| 4 — Auth | Login, inspect protected request, logout, unauthorized test | POST auth/login response token; Authorization: Bearer header; logout; 401 rejection and login redirect |

Browser HTTP 304 is not an error. Disable cache and reload for a fresh 200 screenshot. Application cache hits intentionally produce no new Network request. Reload clears the in-memory application cache. Doctor data caches 60 seconds, availability 15 seconds; concurrent identical requests are shared. Appointment changes invalidate availability cache.

Headers → General shows URL, method and status. Query String Parameters shows search/specialty/date. Payload shows submitted booking data. Response shows returned JSON. Console shows API request/result or error, Redux action names and cache events. Backend terminal also prints HTTP method/path/status. Capture with Win+Shift+S. Do not publicly share usable tokens or real patient details.

Invalid-token demo while signed in:

```js
localStorage.setItem('medislotToken', 'invalid-demo-token');
location.reload();
```

The protected API returns 401, authentication clears and Login appears. This is invalid-token handling, not an actual expiry demo. For fast expiry, start the backend in Windows CMD with `set TOKEN_TTL_SECONDS=15&& npm run server`, start frontend separately and log in again. The frontend expires the session proactively after 15 seconds; `npm run test:api` also verifies server-side expiry.

## Active source map

| Requirement | Source |
| --- | --- |
| Routes, lazy loading and Suspense | src/App.jsx |
| Route implementations | src/pages/ |
| Header/Home/DoctorProfile/AppointmentBooking/AppointmentHistory/PatientProfile | src/Components/ wrapper files → corresponding src/pages/ implementation |
| Reusable list/cards/search/filters/footer | src/Components/DoctorList.jsx, DoctorCard.jsx, SearchBar.jsx, FilterPanel.jsx, Footer.jsx |
| Button/Input/TimeSlot/AppointmentCard/Loading | src/Components/UI.jsx |
| Custom hooks | src/Components/hooks/useDoctors.js, useAppointments.js |
| Context → Redux bridge | src/Components/context/AppointmentProvider.jsx |
| Auth / protection / render errors | AuthContext.jsx, AuthLogin.jsx, ProtectedRoute.jsx, ErrorBoundary.jsx |
| Redux, global draft, middleware | src/store/ |
| API requests / token interceptor / cache | src/api/ |
| REST backend and original eight-doctor seed | server/server.cjs, server/doctors.cjs |
| Jest tests and setup | src/__tests__/, src/test/, jest.config.cjs |
| PWA and build configuration | vite.config.js, src/main.jsx |

The combined final app uses both custom hooks/Context (Chapter 3) and Redux/API state (Chapter 4). Separate historical chapter snapshots are not required to run it. Original legacy reference files such as db.json and appoinmentOld.js are not the active backend/store.

## Validation

17 Jest tests passed; isolated API checks passed; production Vite build and PWA service-worker generation passed. Original CSS files compared identical to the uploaded ZIP. No live external deployment was performed. Real-browser visual automation was unavailable; component integration and build checks were used.
"# CareVista" 
